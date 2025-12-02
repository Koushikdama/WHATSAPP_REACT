import { Chat, Conversation, User, Message } from '../../types';

/**
 * Convert Firestore Chat to Conversation format used by the app
 */
export const chatToConversation = (chat: Chat, users: User[], currentUserId: string): Conversation => {
    const isGroup = chat.type === 'group';

    // For individual chats, find the other participant
    let otherUser: User | undefined;
    if (!isGroup) {
        const otherUserId = chat.participants.find(id => id !== currentUserId);
        otherUser = users.find(u => u.id === otherUserId);
    }

    // Get last message info
    const lastMessage = chat.messages && chat.messages.length > 0
        ? chat.messages[chat.messages.length - 1]
        : null;

    const lastMessageSender = lastMessage
        ? users.find(u => u.id === lastMessage.senderId)
        : null;

    return {
        id: chat.id,
        conversationType: isGroup ? 'GROUP' : 'INDIVIDUAL',
        name: chat.name || otherUser?.name || 'Unknown',
        profileImage: chat.avatar || otherUser?.avatar || 'https://via.placeholder.com/150',
        lastMessage: lastMessage?.content || '',
        lastMessageAt: lastMessage?.timestamp || new Date().toISOString(),
        lastMessageType: lastMessage?.messageType || 'text',
        lastMessageSentById: lastMessage?.senderId || '',
        lastMessageSentByName: lastMessageSender?.name || '',
        unreadCount: chat.unreadCount || 0,
        isOnline: !isGroup && (otherUser?.isOnline || otherUser?.online),
        isPinned: chat.isPinned,
        isLocked: chat.isLocked,
        isVanishMode: chat.isVanishMode,
        theme: chat.theme,
    };
};

/**
 * Convert multiple chats to conversations
 */
export const chatsToConversations = (chats: Chat[], users: User[], currentUserId: string): Conversation[] => {
    return chats.map(chat => chatToConversation(chat, users, currentUserId));
};

/**
 * Format timestamp for display
 */
export const formatMessageTime = (timestamp: string | Date): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than 1 minute
    if (diff < 60000) {
        return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} min ago`;
    }

    // Today
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }

    // This week
    if (diff < 604800000) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // Older
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Get user display name
 */
export const getUserDisplayName = (userId: string, users: User[]): string => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
};

/**
 * Check if message is from current user
 */
export const isMyMessage = (message: Message, currentUserId: string): boolean => {
    return message.senderId === currentUserId;
};

/**
 * Get conversation by ID
 */
export const getConversationById = (conversations: Conversation[], chatId: string): Conversation | null => {
    return conversations.find(c => c.id === chatId) || null;
};

/**
 * Sort conversations by last message time
 */
export const sortConversations = (conversations: Conversation[]): Conversation[] => {
    return [...conversations].sort((a, b) => {
        // Pinned chats first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Then by last message time
        const aTime = new Date(a.lastMessageAt).getTime();
        const bTime = new Date(b.lastMessageAt).getTime();
        return bTime - aTime;
    });
};