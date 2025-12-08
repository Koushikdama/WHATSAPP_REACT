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

/**
 * Update theme settings in Firebase and localStorage cache
 */
export const updateThemeSettings = async (
    userId: string,
    themeSettings: any
): Promise<void> => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);

        // Update in Firebase using dot notation
        const updates: any = {};
        Object.keys(themeSettings).forEach(key => {
            updates[`settings.themeSettings.${key}`] = themeSettings[key];
        });

        await updateDoc(userRef, updates);

        // Update localStorage cache for fast access
        const cached = localStorage.getItem('whatsapp-theme-settings');
        const current = cached ? JSON.parse(cached) : {};
        localStorage.setItem('whatsapp-theme-settings', JSON.stringify({
            ...current,
            ...themeSettings
        }));
    } catch (error) {
        console.error('Error updating theme settings:', error);
        throw error;
    }
};

/**
 * Update passcode settings in Firebase and localStorage cache
 */
export const updatePasscodeSettings = async (
    userId: string,
    passcodeSettings: any
): Promise<void> => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);

        // Update in Firebase using dot notation
        const updates: any = {};
        Object.keys(passcodeSettings).forEach(key => {
            updates[`settings.passcodeSettings.${key}`] = passcodeSettings[key];
        });

        await updateDoc(userRef, updates);

        // Update localStorage cache
        const cached = localStorage.getItem('whatsapp-passcode-settings');
        const current = cached ? JSON.parse(cached) : {};
        localStorage.setItem('whatsapp-passcode-settings', JSON.stringify({
            ...current,
            ...passcodeSettings
        }));
    } catch (error) {
        console.error('Error updating passcode settings:', error);
        throw error;
    }
};

/**
 * Update locked dates in Firebase and localStorage cache
 */
export const updateLockedDates = async (
    userId: string,
    lockedDates: Record<string, string[]>
): Promise<void> => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);

        await updateDoc(userRef, {
            'settings.lockedDates': lockedDates
        });

        // Update localStorage cache
        localStorage.setItem('whatsapp-locked-dates', JSON.stringify(lockedDates));
    } catch (error) {
        console.error('Error updating locked dates:', error);
        throw error;
    }
};

/**
 * Get all user settings (including theme and passcode) from Firebase
 * Also caches in localStorage for fast access
 */
export const getAllUserSettings = async (userId: string): Promise<any | null> => {
    try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const settings = userData.settings || {};

            // Cache in localStorage for fast access
            if (settings.themeSettings) {
                localStorage.setItem('whatsapp-theme-settings', JSON.stringify(settings.themeSettings));
            }
            if (settings.passcodeSettings) {
                localStorage.setItem('whatsapp-passcode-settings', JSON.stringify(settings.passcodeSettings));
            }
            if (settings.lockedDates) {
                localStorage.setItem('whatsapp-locked-dates', JSON.stringify(settings.lockedDates));
            }

            return settings;
        }

        return null;
    } catch (error) {
        console.error('Error fetching all user settings:', error);
        return null;
    }
};
