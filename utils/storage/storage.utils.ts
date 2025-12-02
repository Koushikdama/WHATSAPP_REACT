/**
 * Storage Utilities
 * Secure storage helpers for tokens and user data
 */

const STORAGE_PREFIX = 'whatsapp_';

export const StorageKeys = {
    ACCESS_TOKEN: `${STORAGE_PREFIX}access_token`,
    REFRESH_TOKEN: `${STORAGE_PREFIX}refresh_token`,
    USER: `${STORAGE_PREFIX}user`,
    THEME: `${STORAGE_PREFIX}theme`,
} as const;

/**
 * Get item from localStorage
 */
export const getStorageItem = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        return JSON.parse(item) as T;
    } catch (error) {
        console.error('Error reading from storage:', error);
        return null;
    }
};

/**
 * Set item in localStorage
 */
export const setStorageItem = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error writing to storage:', error);
    }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from storage:', error);
    }
};

/**
 * Clear all app-related items from localStorage
 */
export const clearStorage = (): void => {
    try {
        Object.values(StorageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Error clearing storage:', error);
    }
};

/**
 * Check if storage is available
 */
export const isStorageAvailable = (): boolean => {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        return false;
    }
};