#!/usr/bin/env python3
"""
Firebase Data Inspector
This script connects to Firebase and inspects the data structure to help debug issues.
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
from datetime import datetime
from collections import defaultdict

def init_firebase():
    """Initialize Firebase Admin SDK"""
    # You'll need to provide your service account key
    # Download it from Firebase Console > Project Settings > Service Accounts
    try:
        cred = credentials.Certificate('../firebase-service-account.json')
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully")
        return firestore.client()
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        print("\nPlease ensure you have:")
        print("1. Downloaded the service account JSON key from Firebase Console")
        print("2. Saved it as 'firebase-service-account.json' in the project root")
        return None

def inspect_users(db):
    """Inspect users collection"""
    print("\n" + "="*80)
    print("INSPECTING USERS COLLECTION")
    print("="*80)
    
    users_ref = db.collection('users')
    users = users_ref.stream()
    
    user_list = []
    for user_doc in users:
        user_data = user_doc.to_dict()
        user_id = user_doc.id
        user_list.append({
            'id': user_id,
            'name': user_data.get('name', 'NO NAME'),
            'email': user_data.get('email', 'NO EMAIL'),
            'avatar': user_data.get('avatar', 'NO AVATAR')[:50] if user_data.get('avatar') else 'NO AVATAR',
            'isOnline': user_data.get('isOnline', False),
            'followers': len(user_data.get('followers', [])),
            'following': len(user_data.get('following', []))
        })
        
    print(f"\nTotal Users: {len(user_list)}")
    print("\nUser List:")
    for user in user_list:
        print(f"  - ID: {user['id'][:20]}... | Name: {user['name']:<20} | Email: {user['email']:<30} | Followers: {user['followers']} | Following: {user['following']}")
    
    return user_list

def inspect_chats(db, user_ids):
    """Inspect chats collection"""
    print("\n" + "="*80)
    print("INSPECTING CHATS COLLECTION")
    print("="*80)
    
    chats_ref = db.collection('chats')
    chats = chats_ref.stream()
    
    chat_list = []
    orphaned_chats = []
    
    for chat_doc in chats:
        chat_data = chat_doc.to_dict()
        chat_id = chat_doc.id
        
        participants = chat_data.get('participants', [])
        chat_type = chat_data.get('type', 'unknown')
        
        # Check if participants exist in users
        valid_participants = []
        invalid_participants = []
        
        for p_id in participants:
            if any(user['id'] == p_id for user in user_ids):
                valid_participants.append(p_id)
            else:
                invalid_participants.append(p_id)
        
        chat_info = {
            'id': chat_id,
            'type': chat_type,
            'participants': participants,
            'valid_participants': valid_participants,
            'invalid_participants': invalid_participants,
            'is_orphaned': len(invalid_participants) > 0
        }
        
        chat_list.append(chat_info)
        
        if chat_info['is_orphaned']:
            orphaned_chats.append(chat_info)
    
    print(f"\nTotal Chats: {len(chat_list)}")
    print(f"Orphaned Chats (with invalid participants): {len(orphaned_chats)}")
    
    if orphaned_chats:
        print("\n⚠️  ORPHANED CHATS FOUND:")
        for chat in orphaned_chats:
            print(f"\n  Chat ID: {chat['id']}")
            print(f"  Type: {chat['type']}")
            print(f"  All Participants: {chat['participants']}")
            print(f"  ❌ Invalid Participants: {chat['invalid_participants']}")
            print(f"  ✅ Valid Participants: {chat['valid_participants']}")
    
    print("\n\nAll Chats:")
    for chat in chat_list:
        status = "⚠️ ORPHANED" if chat['is_orphaned'] else "✅ OK"
        print(f"  {status} | ID: {chat['id'][:20]}... | Type: {chat['type']:<10} | Participants: {len(chat['participants'])}")
    
    return chat_list, orphaned_chats

def inspect_specific_user(db, user_id):
    """Inspect a specific user ID"""
    print("\n" + "="*80)
    print(f"INSPECTING SPECIFIC USER: {user_id}")
    print("="*80)
    
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    
    if user_doc.exists:
        print("✅ User EXISTS in Firestore")
        user_data = user_doc.to_dict()
        print("\nUser Data:")
        print(json.dumps(user_data, indent=2, default=str))
    else:
        print(f"❌ User NOT FOUND in Firestore")
        print("\nSearching for similar IDs...")
        
        users_ref = db.collection('users')
        users = users_ref.stream()
        
        similar_ids = []
        for user in users:
            if user_id[:10] in user.id or user.id[:10] in user_id:
                similar_ids.append(user.id)
        
        if similar_ids:
            print(f"Found similar IDs: {similar_ids}")
        else:
            print("No similar IDs found")

def get_messages_count(db, chat_id):
    """Get message count for a chat"""
    try:
        messages_ref = db.collection('chats').document(chat_id).collection('messages')
        messages = list(messages_ref.stream())
        return len(messages)
    except Exception as e:
        return 0

def main():
    print("🔍 Firebase Data Inspector")
    print("="*80)
    
    db = init_firebase()
    if not db:
        return
    
    # 1. Inspect users
    user_list = inspect_users(db)
    
    # 2. Inspect chats
    chat_list, orphaned_chats = inspect_chats(db, user_list)
    
    # 3. Inspect the specific problematic user ID
    problematic_user_id = "jlh7LyrsGt3ld6vjalnu"
    inspect_specific_user(db, problematic_user_id)
    
    # 4. Summary and recommendations
    print("\n" + "="*80)
    print("SUMMARY & RECOMMENDATIONS")
    print("="*80)
    
    print(f"\n📊 Statistics:")
    print(f"  - Total Users: {len(user_list)}")
    print(f"  - Total Chats: {len(chat_list)}")
    print(f"  - Orphaned Chats: {len(orphaned_chats)}")
    
    if orphaned_chats:
        print(f"\n⚠️  ACTION REQUIRED:")
        print(f"  You have {len(orphaned_chats)} orphaned chat(s) that reference non-existent users.")
        print(f"  These are likely causing the 'Unknown' user issue.")
        print(f"\n  Recommendations:")
        print(f"  1. Clean up orphaned chats using the cleanup script")
        print(f"  2. Ensure chat creation logic validates user IDs")
        print(f"  3. Add error handling in getConversations to skip invalid chats")
    
    # Export data for further analysis
    export_data = {
        'timestamp': datetime.now().isoformat(),
        'users': user_list,
        'chats': [
            {
                'id': c['id'],
                'type': c['type'],
                'participants': c['participants'],
                'is_orphaned': c['is_orphaned']
            }
            for c in chat_list
        ],
        'orphaned_chats': orphaned_chats
    }
    
    with open('firebase-inspection-report.json', 'w') as f:
        json.dump(export_data, f, indent=2, default=str)
    
    print(f"\n💾 Detailed report saved to: firebase-inspection-report.json")

if __name__ == '__main__':
    main()