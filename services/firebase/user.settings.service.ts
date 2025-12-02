import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/schema';
import type { UserSettings } from '../../types';

/**
 * Get user settings from Firestore
 */
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
    try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            return userData.settings || null;
        }

        return null;
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return null;
    }
};

/**
 * Update user settings in Firestore
 */
export const updateUserSettings = async (
    userId: string,
    settings: Partial<UserSettings>
): Promise<void> => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);

        // Update settings using dot notation to merge with existing settings
        const updates: any = {};
        Object.keys(settings).forEach(key => {
            updates[`settings.${key}`] = settings[key as keyof UserSettings];
        });

        await updateDoc(userRef, updates);
    } catch (error) {
        console.error('Error updating user settings:', error);
        throw error;
    }
};

/**
 * Check if user has chat lock PIN set
 */
export const hasChatLockPin = async (userId: string): Promise<boolean> => {
    try {
        const settings = await getUserSettings(userId);
        return !!settings?.chatLockPin && settings.chatLockPin.length > 0;
    } catch (error) {
        console.error('Error checking chat lock PIN:', error);
        return false;
    }
};

/**
 * Verify chat lock PIN
 */
export const verifyChatLockPin = async (userId: string, pin: string): Promise<boolean> => {
    try {
        const settings = await getUserSettings(userId);
        return settings?.chatLockPin === pin;
    } catch (error) {
        console.error('Error verifying chat lock PIN:', error);
        return false;
    }
};

/**
 * Update chat-specific settings with PIN validation
 */
export const updateChatSettings = async (
    chatId: string,
    userId: string,
    settings: {
        isLocked?: boolean;
        theme?: string | null;
        receivedTheme?: string | null;
        isVanishMode?: boolean;
        isMuted?: boolean;
        customWallpaper?: string | null;
    },
    pin?: string
): Promise<{ success: boolean; message?: string }> => {
    try {
        // If trying to lock chat, validate PIN exists
        if (settings.isLocked === true) {
            const hasPinSet = await hasChatLockPin(userId);

            if (!hasPinSet) {
                return {
                    success: false,
                    message: 'Please set a Chat Lock PIN first in Settings > Passcode Manager'
                };
            }

            // Verify PIN if provided
            if (pin) {
                const isValidPin = await verifyChatLockPin(userId, pin);
                if (!isValidPin) {
                    return {
                        success: false,
                        message: 'Incorrect PIN'
                    };
                }
            }
        }

        const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
        await updateDoc(chatRef, settings);

        return { success: true };
    } catch (error) {
        console.error('Error updating chat settings:', error);
        return {
            success: false,
            message: 'Failed to update chat settings'
        };
    }
};

/**
 * Get chat-specific settings
 */
export const getChatSettings = async (chatId: string) => {
    try {
        const chatDoc = await getDoc(doc(db, COLLECTIONS.CHATS, chatId));

        if (chatDoc.exists()) {
            const chatData = chatDoc.data();
            return {
                isLocked: chatData.isLocked || false,
                theme: chatData.theme || null,
                receivedTheme: chatData.receivedTheme || null,
                isVanishMode: chatData.isVanishMode || false,
                isMuted: chatData.isMuted || false,
                customWallpaper: chatData.customWallpaper || null
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching chat settings:', error);
        return null;
    }
};
