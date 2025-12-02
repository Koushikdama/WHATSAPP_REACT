#!/bin/bash

echo "🔧 Fixing all import paths..."

# Navigate to project directory
cd "/Users/dama.koushik/Desktop/whatsappui 3"

# Function to update imports in all TypeScript files
update_imports() {
    # Update icon imports
    find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec sed -i '' \
        -e "s|from './icons'|from '../icons'|g" \
        -e "s|from './components/icons'|from './components/icons'|g" \
        {} +

    # Update component imports in pages/
    find ./pages -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
        -e "s|from '../components/|from '../../components/|g" \
        -e "s|from './components/|from '../../components/|g" \
        {} +

    # Update component imports in components/
    find ./components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
        -e "s|from './ConfirmationDialog'|from '../ui/ConfirmationDialog'|g" \
        -e "s|from './PasswordPrompt'|from '../ui/PasswordPrompt'|g" \
        -e "s|from './ThemeToggle'|from '../ui/ThemeToggle'|g" \
        -e "s|from './DateSeparator'|from '../ui/DateSeparator'|g" \
        -e "s|from './InAppNotification'|from '../ui/InAppNotification'|g" \
        -e "s|from './NotificationPopup'|from '../ui/NotificationPopup'|g" \
        -e "s|from './MessageBubble'|from '../chat/MessageBubble'|g" \
        -e "s|from './MessageComposer'|from '../chat/MessageComposer'|g" \
        -e "s|from './ImageCarouselBubble'|from '../chat/ImageCarouselBubble'|g" \
        -e "s|from './ChatList'|from '../chat/ChatList'|g" \
        -e "s|from './ChatListItem'|from '../chat/ChatListItem'|g" \
        -e "s|from './CreatePoll'|from '../chat/CreatePoll'|g" \
        -e "s|from './GifPicker'|from '../chat/GifPicker'|g" \
        -e "s|from './InfoPanel'|from '../panels/InfoPanel'|g" \
        -e "s|from './Layout'|from '../layout/Layout'|g" \
        -e "s|from './Sidebar'|from '../layout/Sidebar'|g" \
        -e "s|from './SidebarHeader'|from '../layout/SidebarHeader'|g" \
        -e "s|from './BottomNav'|from '../layout/BottomNav'|g" \
        -e "s|from './SettingsLayout'|from '../layout/SettingsLayout'|g" \
        -e "s|from './FloatingCallView'|from '../calls/FloatingCallView'|g" \
        {} +

    # Fix specific cross-references
    find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec sed -i '' \
        -e "s|from '../icons'|from '../icons'|g" \
        -e "s|from './icons'|from '../icons'|g" \
        {} +

    echo "✅ Import path updates complete!"
}

# Run the updates
update_imports

echo "🎉 All done!"