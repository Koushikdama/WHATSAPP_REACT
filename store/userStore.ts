/**
 * User Store
 * Zustand store for user data and profile management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from '../types/auth.types';

interface UserState {
    // State
    users: Map<string, User>;
    currentUserId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUsers: (users: User[]) => void;
    addUser: (user: User) => void;
    updateUser: (userId: string, updates: Partial<User>) => void;
    removeUser: (userId: string) => void;
    getUser: (userId: string) => User | undefined;
    setCurrentUserId: (userId: string | null) => void;
    clearUsers: () => void;
}

export const useUserStore = create<UserState>()(
    devtools(
        (set, get) => ({
            // Initial state
            users: new Map(),
            currentUserId: null,
            isLoading: false,
            error: null,

            // Set multiple users
            setUsers: (users: User[]) => {
                const userMap = new Map<string, User>();
                users.forEach(user => {
                    userMap.set(user.id, user);
                });
                set({ users: userMap });
            },

            // Add single user
            addUser: (user: User) => {
                const users = new Map(get().users);
                users.set(user.id, user);
                set({ users });
            },

            // Update user
            updateUser: (userId: string, updates: Partial<User>) => {
                const users = new Map(get().users);
                const existingUser = users.get(userId);
                if (existingUser) {
                    users.set(userId, { ...existingUser, ...updates });
                    set({ users });
                }
            },

            // Remove user
            removeUser: (userId: string) => {
                const users = new Map(get().users);
                users.delete(userId);
                set({ users });
            },

            // Get user by ID
            getUser: (userId: string) => {
                return get().users.get(userId);
            },

            // Set current user ID
            setCurrentUserId: (userId: string | null) => {
                set({ currentUserId: userId });
            },

            // Clear all users
            clearUsers: () => {
                set({ users: new Map(), currentUserId: null });
            },
        }),
        { name: 'UserStore' }
    )
);