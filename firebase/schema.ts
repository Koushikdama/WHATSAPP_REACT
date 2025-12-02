export const COLLECTIONS = {
    USERS: 'users',
    CHATS: 'chats',
    MESSAGES: 'messages',
    NOTIFICATIONS: 'notifications',
    STATUS: 'status',
} as const;

// Helper to create subcollection paths
export const getMessagesPath = (chatId: string) => `${COLLECTIONS.CHATS}/${chatId}/${COLLECTIONS.MESSAGES}`;
export const getUserNotificationsPath = (userId: string) => `${COLLECTIONS.NOTIFICATIONS}/${userId}/userNotifications`;
