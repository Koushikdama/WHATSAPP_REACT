import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * Automatically syncs state changes to localStorage
 * 
 * @param key - localStorage key
 * @param defaultValue - default value if key doesn't exist
 * @returns [value, setValue] tuple
 */
function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
    // Initialize state with value from localStorage or default
    const [value, setValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : defaultValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    // Update localStorage when value changes
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, value]);

    return [value, setValue];
}

export default useLocalStorage;
