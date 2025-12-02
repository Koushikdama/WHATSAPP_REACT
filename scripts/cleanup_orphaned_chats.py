#!/usr/bin/env python3
"""
Firebase Orphaned Chat Cleanup Script
This script identifies and removes chat documents that reference non-existent users.
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
from datetime import datetime
import argparse

def init_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        cred = credentials.Certificate('../firebase-service-account.json')
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully")
        return firestore.client()
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        return None

def get_all_user_ids(db):
    """Get all valid user IDs from Firestore"""
    users_ref = db.collection('users')
    users = users_ref.stream()
    user_ids = set([user.id for user in users])
    print(f"📊 Found {len(user_ids)} valid users in database")
    return user_ids

def find_orphaned_chats(db, user_ids):
    """Find chats that reference non-existent users"""
    print("\n🔍 Scanning for orphaned chats...")
    
    chats_ref = db.collection('chats')
    chats = chats_ref.stream()
    
    orphaned_chats = []
    total_chats = 0
    
    for chat_doc in chats:
        total_chats += 1
        chat_data = chat_doc.to_dict()
        chat_id = chat_doc.id
        participants = chat_data.get('participants', [])
        
        # Check if all participants exist
        invalid_participants = [p for p in participants if p not in user_ids]
        
        if invalid_participants:
            orphaned_chats.append({
                'id': chat_id,
                'type': chat_data.get('type', 'unknown'),
                'participants': participants,
                'invalid_participants': invalid_participants,
                'created_at': chat_data.get('createdAt'),
                'last_message': chat_data.get('lastMessage')
            })
    
    print(f"📊 Scanned {total_chats} chats")
    print(f"⚠️  Found {len(orphaned_chats)} orphaned chats")
    
    return orphaned_chats

def backup_orphaned_chats(orphaned_chats):
    """Backup orphaned chat data before deletion"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'orphaned_chats_backup_{timestamp}.json'
    
    with open(filename, 'w') as f:
        json.dump(orphaned_chats, f, indent=2, default=str)
    
    print(f"💾 Backup saved to: {filename}")
    return filename

def delete_orphaned_chats(db, orphaned_chats, dry_run=True):
    """Delete orphaned chats from Firestore"""
    if dry_run:
        print("\n🔍 DRY RUN - No changes will be made")
        print("\nThe following chats would be deleted:\n")
        for chat in orphaned_chats:
            print(f"  Chat ID: {chat['id']}")
            print(f"  Type: {chat['type']}")
            print(f"  Participants: {chat['participants']}")
            print(f"  Invalid: {chat['invalid_participants']}")
            print()
        return
    
    print("\n🗑️  Deleting orphaned chats...")
    
    deleted_count = 0
    for chat in orphaned_chats:
        try:
            chat_id = chat['id']
            
            # Delete all messages in the chat first
            messages_ref = db.collection('chats').document(chat_id).collection('messages')
            messages = messages_ref.stream()
            
            message_count = 0
            for msg in messages:
                msg.reference.delete()
                message_count += 1
            
            # Delete the chat document
            db.collection('chats').document(chat_id).delete()
            
            deleted_count += 1
            print(f"  ✅ Deleted chat {chat_id} ({message_count} messages)")
            
        except Exception as e:
            print(f"  ❌ Error deleting chat {chat_id}: {e}")
    
    print(f"\n✅ Successfully deleted {deleted_count} orphaned chats")

def main():
    parser = argparse.ArgumentParser(description='Clean up orphaned chats from Firebase')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Preview changes without making them')
    parser.add_argument('--force', action='store_true',
                       help='Skip confirmation prompt')
    args = parser.parse_args()
    
    print("🧹 Firebase Orphaned Chat Cleanup")
    print("="*80)
    
    db = init_firebase()
    if not db:
        return
    
    # Get all valid user IDs
    user_ids = get_all_user_ids(db)
    
    # Find orphaned chats
    orphaned_chats = find_orphaned_chats(db, user_ids)
    
    if not orphaned_chats:
        print("\n✅ No orphaned chats found! Your database is clean.")
        return
    
    # Backup data
    backup_file = backup_orphaned_chats(orphaned_chats)
    
    # Delete chats
    if args.dry_run:
        delete_orphaned_chats(db, orphaned_chats, dry_run=True)
        print("\nTo perform actual deletion, run without --dry-run flag")
    else:
        if not args.force:
            print(f"\n⚠️  WARNING: You are about to delete {len(orphaned_chats)} chats!")
            print(f"   This action cannot be undone.")
            print(f"   A backup has been saved to: {backup_file}")
            response = input("\nAre you sure you want to continue? (yes/no): ")
            
            if response.lower() != 'yes':
                print("❌ Operation cancelled")
                return
        
        delete_orphaned_chats(db, orphaned_chats, dry_run=False)
    
    print("\n" + "="*80)
    print("✅ Cleanup complete!")

if __name__ == '__main__':
    main()