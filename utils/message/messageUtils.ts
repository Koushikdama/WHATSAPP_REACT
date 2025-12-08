import { Message } from '../../types';

/**
 * Message edit time limit in milliseconds (15 minutes)
 */
export const MESSAGE_EDIT_TIME_LIMIT = 15 * 60 * 1000; // 15 minutes

/**
 * Check if a message can still be edited based on time limit
 */
export const canEditMessage = (message: Message, currentUserId: string): boolean => {
    if (!message || message.senderId !== currentUserId) return false;
    if (message.messageType !== 'text') return false;
    if (message.deleteForEveryone || message.isDeleted) return false;

    const messageTime = new Date(message.timestamp).getTime();
    const now = Date.now();
    const elapsed = now - messageTime;

    return elapsed < MESSAGE_EDIT_TIME_LIMIT;
};

/**
 * Get remaining edit time in human-readable format
 */
export const getEditTimeRemaining = (message: Message): string | null => {
    if (!message) return null;

    const messageTime = new Date(message.timestamp).getTime();
    const now = Date.now();
    const elapsed = now - messageTime;
    const remaining = MESSAGE_EDIT_TIME_LIMIT - elapsed;

    if (remaining <= 0) return null;

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
};

/**
 * Check if message can be pinned
 */
export const canPinMessage = (message: Message): boolean => {
    if (!message) return false;
    if (message.deleteForEveryone || message.isDeleted) return false;
    return true;
};

/**
 * Check if message can be bookmarked
 */
export const canBookmarkMessage = (message: Message): boolean => {
    if (!message) return false;
    if (message.deleteForEveryone || message.isDeleted) return false;
    return true;
};

/**
 * Format pinned status
 */
export const getPinnedStatusText = (message: Message, users: any[]): string => {
    if (!message.isPinned || !message.pinnedBy) return '';

    const pinner = users.find(u => u.id === message.pinnedBy);
    const pinnerName = pinner?.name || 'Someone';

    return `Pinned by ${pinnerName}`;
};
