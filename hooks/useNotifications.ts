import { useState, useEffect, useCallback } from 'react';
import {
    initializeNotifications,
    areNotificationsSupported,
    getNotificationPermission,
} from '../services/notification.service';

interface NotificationPayload {
    notification?: {
        title: string;
        body: string;
    };
    data?: any;
}

export const useNotifications = (userId: string | null) => {
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);
    const [foregroundNotification, setForegroundNotification] = useState<NotificationPayload | null>(null);

    useEffect(() => {
        // Check if notifications are supported
        const supported = areNotificationsSupported();
        setIsSupported(supported);
        console.log('🔔 Notifications supported:', supported);

        // Get initial permission status
        if (supported) {
            const permission = getNotificationPermission();
            setPermissionStatus(permission);
            console.log('🔔 Notification permission status:', permission);
        }
    }, []);

    // Handle foreground messages
    const handleForegroundMessage = useCallback((payload: NotificationPayload) => {
        console.log('🔔 Foreground notification received:', payload);
        setForegroundNotification(payload);
    }, []);

    // Initialize notifications when user is available
    useEffect(() => {
        if (!userId || !isSupported || permissionStatus !== 'granted') {
            console.log('🔔 Not initializing notifications:', { userId: !!userId, isSupported, permissionStatus });
            return;
        }

        console.log('🔔 Initializing notifications for user:', userId);
        initializeNotifications(userId, handleForegroundMessage);
    }, [userId, isSupported, permissionStatus, handleForegroundMessage]);

    // Request permission
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            console.log('Notifications not supported');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting permission:', error);
            return false;
        }
    }, [isSupported]);

    // Clear foreground notification
    const clearForegroundNotification = useCallback(() => {
        setForegroundNotification(null);
    }, []);

    return {
        isSupported,
        permissionStatus,
        foregroundNotification,
        requestPermission,
        clearForegroundNotification,
    };
};