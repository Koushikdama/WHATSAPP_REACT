#!/usr/bin/env python3
"""
Script to update import paths after project restructuring
"""

import os
import re
from pathlib import Path

# Base directory
BASE_DIR = Path("/Users/dama.koushik/Desktop/whatsappui 3")

# Import path mappings for components that moved
COMPONENT_MAPPINGS = {
    # UI Components
    "ConfirmationDialog": "components/ui/ConfirmationDialog",
    "PasswordPrompt": "components/ui/PasswordPrompt",
    "ThemeToggle": "components/ui/ThemeToggle",
    "DateSeparator": "components/ui/DateSeparator",
    "InAppNotification": "components/ui/InAppNotification",
    "NotificationPopup": "components/ui/NotificationPopup",
    
    # Layout
    "Layout": "components/layout/Layout",
    "Sidebar": "components/layout/Sidebar",
    "SidebarHeader": "components/layout/SidebarHeader",
    "BottomNav": "components/layout/BottomNav",
    "SettingsLayout": "components/layout/SettingsLayout",
    
    # Chat
    "ChatList": "components/chat/ChatList",
    "ChatListItem": "components/chat/ChatListItem",
    "MessageBubble": "components/chat/MessageBubble",
    "MessageComposer": "components/chat/MessageComposer",
    "ImageCarouselBubble": "components/chat/ImageCarouselBubble",
    "CreatePoll": "components/chat/CreatePoll",
    "GifPicker": "components/chat/GifPicker",
    
    # Panels
    "InfoPanel": "components/panels/InfoPanel",
    
    # Calls
    "FloatingCallView": "components/calls/FloatingCallView",
    
    # Pages
    "AuthScreen": "pages/auth/AuthScreen",
    "ChatListScreen": "pages/chats/ChatListScreen",
    "ChatWindow": "pages/chats/ChatWindow",
    "WelcomeScreen": "pages/chats/WelcomeScreen",
    "CallsScreen": "pages/calls/CallsScreen",
    "CallScreen": "pages/calls/CallScreen",
    "ActiveCallScreen": "pages/calls/ActiveCallScreen",
    "IncomingCallScreen": "pages/calls/IncomingCallScreen",
    "StatusScreen": "pages/status/StatusScreen",
    "SettingsScreen": "pages/settings/SettingsScreen",
    "AccountScreen": "pages/settings/AccountScreen",
    "ProfileScreen": "pages/settings/ProfileScreen",
    "ChatsSettingsScreen": "pages/settings/ChatsSettingsScreen",
   " NotificationsScreen": "pages/settings/NotificationsScreen",
    "PrivacyScreen": "pages/settings/PrivacyScreen",
    "PasscodeManagerScreen": "pages/settings/PasscodeManagerScreen",
    "StorageScreen": "pages/settings/StorageScreen",
    "HelpScreen": "pages/settings/HelpScreen",
    "ContactInfo": "pages/contacts/ContactInfo",
    "NewChatScreen": "pages/contacts/NewChatScreen",
}

def calculate_relative_path(from_file: Path, to_module: str) -> str:
    """Calculate the correct relative import path"""
    from_dir = from_file.parent
    to_path = BASE_DIR / to_module
    
    # Calculate relative path
    try:
        rel_path = os.path.relpath(to_path, from_dir)
        # Normalize path separators and ensure it starts with ./
        rel_path = rel_path.replace(os.sep, '/')
        if not rel_path.startswith('.'):
            rel_path = './' + rel_path
        # Remove .tsx/.ts extension
        rel_path = re.sub(r'\.(tsx?|jsx?)$', '', rel_path)
        return rel_path
    except ValueError:
        # Paths are on different drives (Windows)
        return to_module

def update_imports(file_path: Path):
    """Update imports in a single file"""
    if not file_path.exists():
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Update component imports
    for component_name, new_path in COMPONENT_MAPPINGS.items():
        # Pattern to match various import styles
        patterns = [
            # from './ComponentName'
            (rf"from\s+['\"]\.\/components\/{component_name}['\"]", 
             lambda m: f"from '{calculate_relative_path(file_path, new_path)}'"),
            # from '../components/ComponentName'
            (rf"from\s+['\"]\.\.\/components\/{component_name}['\"]",
             lambda m: f"from '{calculate_relative_path(file_path, new_path)}'"),
            # from '../../components/ComponentName'
            (rf"from\s+['\"]\.\.\/\.\.\/components\/{component_name}['\"]",
             lambda m: f"from '{calculate_relative_path(file_path, new_path)}'"),
        ]
        
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
    
    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {file_path.relative_to(BASE_DIR)}")

def main():
    """Main function to update all TypeScript/TSX files"""
    print("Starting import path updates...")
    
    # Find all .ts and .tsx files
    for ext in ['*.ts', '*.tsx']:
        for file_path in BASE_DIR.rglob(ext):
            # Skip node_modules and other irrelevant directories
            if 'node_modules' in file_path.parts or '.git' in file_path.parts:
                continue
            
            update_imports(file_path)
    
    print("\n�� Import path updates complete!")

if __name__ == "__main__":
    main()