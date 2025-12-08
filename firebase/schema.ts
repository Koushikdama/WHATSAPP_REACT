export const COLLECTIONS = {
    USERS: 'users',
    CHATS: 'chats',
    MESSAGES: 'messages',
    NOTIFICATIONS: 'notifications',
    THREADS: 'threads', // Phase 2: Threaded replies
    STATUS: 'status',
    WORKFLOWS: 'workflows',
    SCHEDULED_MESSAGES: 'scheduledMessages',
    WORKFLOW_EXECUTIONS: 'workflowExecutions',
} as const;

// Helper to create subcollection paths
export const getMessagesPath = (chatId: string) => `${COLLECTIONS.CHATS}/${chatId}/${COLLECTIONS.MESSAGES}`;
export const getUserNotificationsPath = (userId: string) => `${COLLECTIONS.NOTIFICATIONS}/${userId}/userNotifications`;
export const getUserWorkflowsPath = (userId: string) => `${COLLECTIONS.WORKFLOWS}`;
export const getScheduledMessagesPath = (userId: string) => `${COLLECTIONS.SCHEDULED_MESSAGES}`;
export const getWorkflowExecutionsPath = (workflowId: string) => `${COLLECTIONS.WORKFLOW_EXECUTIONS}`;
