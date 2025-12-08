/**
 * Smart notifications and priority inbox
 */

import { Message, User } from '../types';

export interface SmartNotification {
    id: string;
    type: 'message' | 'mention' | 'reply' | 'reaction' | 'call' | 'group';
    priority: 'high' | 'medium' | 'low';
    chatId: string;
    chatName: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    isMuted: boolean;
    bundleId?: string; // For bundling multiple notifications
}

export interface NotificationBundle {
    id: string;
    chatId: string;
    chatName: string;
    count: number;
    lastNotification: SmartNotification;
    priority: 'high' | 'medium' | 'low';
    timestamp: string;
}

/**
 * Calculate notification priority
 */
export const calculatePriority = (
    message: Message,
    currentUser: User,
    chatType: 'individual' | 'group'
): 'high' | 'medium' | 'low' => {
    // High priority
    if (message.content.includes(`@${currentUser.name}`)) return 'high'; // Mention
    if (message.replyMessageId) return 'high'; // Reply
    if (chatType === 'individual') return 'high'; // DMs are high priority
    if (message.messageType === 'call') return 'high'; // Calls

    // Medium priority
    if (message.reactions && Object.keys(message.reactions).length > 0) return 'medium';
    if (chatType === 'group') return 'medium';

    // Low priority
    return 'low';
};

/**
 * Bundle notifications from the same chat
 */
export const bundleNotifications = (
    notifications: SmartNotification[]
): NotificationBundle[] => {
    const bundles = new Map<string, SmartNotification[]>();

    // Group by chatId
    notifications.forEach(notif => {
        if (!bundles.has(notif.chatId)) {
            bundles.set(notif.chatId, []);
        }
        bundles.get(notif.chatId)!.push(notif);
    });

    // Create bundles
    const result: NotificationBundle[] = [];
    bundles.forEach((notifs, chatId) => {
        if (notifs.length === 0) return;

        // Sort by timestamp
        notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const latest = notifs[0];

        // Determine bundle priority (highest among notifications)
        const priority = notifs.reduce((highest, n) => {
            if (n.priority === 'high') return 'high';
            if (n.priority === 'medium' && highest !== 'high') return 'medium';
            return highest;
        }, 'low' as 'high' | 'medium' | 'low');

        result.push({
            id: `bundle-${chatId}`,
            chatId,
            chatName: latest.chatName,
            count: notifs.length,
            lastNotification: latest,
            priority,
            timestamp: latest.timestamp,
        });
    });

    // Sort bundles by priority then timestamp
    return result.sort((a, b) => {
        if (a.priority !== b.priority) {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
};

/**
 * Filter notifications by importance
 */
export const filterByImportance = (
    notifications: SmartNotification[],
    showOnlyHigh: boolean = false
): SmartNotification[] => {
    if (showOnlyHigh) {
        return notifications.filter(n => n.priority === 'high');
    }
    return notifications;
};

/**
 * Get notification summary text
 */
export const getNotificationSummary = (bundle: NotificationBundle): string => {
    if (bundle.count === 1) {
        return bundle.lastNotification.content;
    }
    return `${bundle.count} new messages`;
};

/**
 * Check if should show notification (respecting mute, silent mode)
 */
export const shouldShowNotification = (
    message: Message,
    chatMuted: boolean,
    doNotDisturb: boolean
): boolean => {
    // Silent messages never show notifications
    if (message.isSilent) return false;

    // DND mode blocks all except high priority
    if (doNotDisturb) {
        return message.content.includes('@') || message.messageType === 'call';
    }

    // Muted chats don't show notifications
    if (chatMuted) return false;

    return true;
};

/**
 * Generate notification sound key based on priority
 */
export const getNotificationSound = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
        case 'high':
            return 'notification-high.mp3';
        case 'medium':
            return 'notification-medium.mp3';
        case 'low':
            return 'notification-low.mp3';
    }
};

/**
 * Create desktop notification
 */
export const createDesktopNotification = (
    title: string,
    body: string,
    icon?: string,
    onClick?: () => void
): void => {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body,
            icon: icon || '/logo.png',
            badge: '/logo.png',
            tag: title, // Prevents duplicate notifications
        });

        if (onClick) {
            notification.onclick = onClick;
        }
    }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};
