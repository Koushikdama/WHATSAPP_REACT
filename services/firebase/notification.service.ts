import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import { db, messaging } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/schema';
import type { Notification } from '../../types';

export const subscribeToNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS, userId, 'userNotifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));

    return onSnapshot(q, (snapshot) => {
        const notifications: Notification[] = [];
        snapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() } as Notification);
        });
        callback(notifications);
    }, (error) => {
        console.error('❌ PERMISSION ERROR in subscribeToNotifications (notifications collection):', error);
        console.error('Query details:', { collection: 'notifications', userId, path: `notifications/${userId}/userNotifications` });
    });
};

export const requestForToken = async (): Promise<string | null> => {
    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return null;
        }

        // Check current permission
        if (window.Notification.permission === 'denied') {
            console.warn('Notification permission has been blocked by the user');
            return null;
        }

        const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FCM_VAPID_KEY });

        if (token) {
            console.log('FCM Token obtained:', token);
            return token;
        } else {
            console.warn('No registration token available. Request permission to generate one.');
            return null;
        }
    } catch (error: any) {
        if (error.code === 'messaging/permission-blocked') {
            console.warn('Notification permission was blocked. Please enable notifications in browser settings.');
        } else {
            console.error('An error occurred while retrieving token. ', error);
        }
        return null;
    }
};

export const onMessageListener = () => {
    return new Promise<any>((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });
};
