import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/schema';

/**
 * Pin a message
 */
export const pinMessage = async (chatId: string, messageId: string, userId: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, messageId);

        await updateDoc(messageRef, {
            isPinned: true,
            pinnedBy: userId,
            pinnedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error pinning message:', error);
        throw error;
    }
};

/**
 * Unpin a message
 */
export const unpinMessage = async (chatId: string, messageId: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, messageId);

        await updateDoc(messageRef, {
            isPinned: false,
            pinnedBy: null,
            pinnedAt: null,
        });
    } catch (error) {
        console.error('Error unpinning message:', error);
        throw error;
    }
};

/**
 * Bookmark a message
 */
export const bookmarkMessage = async (chatId: string, messageId: string, userId: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, messageId);

        await updateDoc(messageRef, {
            bookmarkedBy: arrayUnion(userId),
        });
    } catch (error) {
        console.error('Error bookmarking message:', error);
        throw error;
    }
};

/**
 * Remove bookmark from message
 */
export const unbookmarkMessage = async (chatId: string, messageId: string, userId: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, messageId);

        await updateDoc(messageRef, {
            bookmarkedBy: arrayRemove(userId),
        });
    } catch (error) {
        console.error('Error removing bookmark:', error);
        throw error;
    }
};

/**
 * Mark message as unread
 */
export const markMessageAsUnread = async (chatId: string, messageId: string, userId: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, messageId);

        await updateDoc(messageRef, {
            markedUnreadBy: arrayUnion(userId),
        });

        // Also update the chat to show unread indicator
        const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
        await updateDoc(chatRef, {
            [`unreadMarkers.${userId}`]: messageId,
        });
    } catch (error) {
        console.error('Error marking message as unread:', error);
        throw error;
    }
};

/**
 * Clear unread mark from message
 */
export const clearUnreadMark = async (chatId: string, messageId: string, userId: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, messageId);

        await updateDoc(messageRef, {
            markedUnreadBy: arrayRemove(userId),
        });

        // Clear from chat as well
        const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
        await updateDoc(chatRef, {
            [`unreadMarkers.${userId}`]: null,
        });
    } catch (error) {
        console.error('Error clearing unread mark:', error);
        throw error;
    }
};

/**
 * Toggle silent mode for a message
 */
export const setSilentMessage = async (chatId: string, messageId: string, isSilent: boolean): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, messageId);

        await updateDoc(messageRef, {
            isSilent,
        });
    } catch (error) {
        console.error('Error setting silent mode:', error);
        throw error;
    }
};
