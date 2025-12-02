/**
 * App Store
 * Zustand store for global application state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Notification {
    id: string;
    type: 'message' | 'call' | 'system';
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
}

interface AppState {
    // State
    theme: 'light' | 'dark';
    isOnline: boolean;
    notifications: Notification[];
    unreadCount: number;
    activeCallId: string | null;
    isSidebarOpen: boolean;

    // Actions
    setTheme: (theme: 'light' | 'dark') => void;
    toggleTheme: () => void;
    setOnlineStatus: (isOnline: boolean) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markNotificationAsRead: (notificationId: string) => void;
    clearNotifications: () => void;
    setActiveCallId: (callId: string | null) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                theme: 'dark',
                isOnline: true,
                notifications: [],
                unreadCount: 0,
                activeCallId: null,
                isSidebarOpen: true,

                // Set theme
                setTheme: (theme: 'light' | 'dark') => {
                    set({ theme });
                },

                // Toggle theme
                toggleTheme: () => {
                    const currentTheme = get().theme;
                    set({ theme: currentTheme === 'light' ? 'dark' : 'light' });
                },

                // Set online status
                setOnlineStatus: (isOnline: boolean) => {
                    set({ isOnline });
                },

                // Add notification
                addNotification: (notification) => {
                    const newNotification: Notification = {
                        ...notification,
                        id: `notif-${Date.now()}-${Math.random()}`,
                        timestamp: Date.now(),
                        read: false,
                    };

                    const notifications = [...get().notifications, newNotification];
                    const unreadCount = notifications.filter(n => !n.read).length;

                    set({ notifications, unreadCount });
                },

                // Mark notification as read
                markNotificationAsRead: (notificationId: string) => {
                    const notifications = get().notifications.map(n =>
                        n.id === notificationId ? { ...n, read: true } : n
                    );
                    const unreadCount = notifications.filter(n => !n.read).length;

                    set({ notifications, unreadCount });
                },

                // Clear all notifications
                clearNotifications: () => {
                    set({ notifications: [], unreadCount: 0 });
                },

                // Set active call ID
                setActiveCallId: (callId: string | null) => {
                    set({ activeCallId: callId });
                },

                // Toggle sidebar
                toggleSidebar: () => {
                    set({ isSidebarOpen: !get().isSidebarOpen });
                },

                // Set sidebar open state
                setSidebarOpen: (isOpen: boolean) => {
                    set({ isSidebarOpen: isOpen });
                },
            }),
            {
                name: 'whatsapp_app_store',
                partialize: (state) => ({
                    theme: state.theme,
                    isSidebarOpen: state.isSidebarOpen,
                }),
            }
        ),
        { name: 'AppStore' }
    )
);