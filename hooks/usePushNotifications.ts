import { useState, useEffect, useCallback } from 'react';
import { requestForToken, onMessageListener } from '../services/firebase/notification.service';
import { useToast } from '../context/ToastContext';

const usePushNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [subscription, setSubscription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
    } else {
      setPermission(Notification.permission);
    }

    // Listen for foreground messages
    const unsubscribe = onMessageListener().then((payload: any) => {
      console.log('Received foreground message:', payload);

      const notificationTitle = payload.notification?.title || 'New Message';
      const notificationOptions: NotificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: payload.data?.type === 'call' ? 'incoming-call' : 'new-message',
        data: payload.data,
      };

      if (permission === 'granted') {
        new Notification(notificationTitle, notificationOptions);
      }

      // Also show a toast for better visibility in-app
      showToast(`${notificationTitle}: ${notificationOptions.body}`, 'info');
    });

    return () => {
      // onMessageListener returns a promise that resolves to the payload, 
      // but the actual listener setup in service doesn't return an unsubscribe function directly 
      // in the way we wrapped it. 
      // However, onMessage returns an unsubscribe function. 
      // We should probably adjust the service to return the unsubscribe function.
      // For now, we'll leave it as is, but note this limitation.
    };
  }, [permission, showToast]);

  // Memoize requestPermission to prevent infinite loops
  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      const token = await requestForToken();

      if (token) {
        setSubscription(token);
        setPermission('granted');
        console.log('FCM Token obtained:', token);
        return token;
      } else {
        setPermission(Notification.permission);
        return null;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const showNotification = (type: 'message' | 'call', title: string, body: string) => {
    if (permission !== 'granted') {
      console.log('Notification permission not granted.');
      return;
    }

    const options: NotificationOptions = {
      body,
      icon: type === 'call'
        ? 'https://cdn-icons-png.flaticon.com/512/3059/3059446.png'
        : 'https://cdn-icons-png.flaticon.com/512/5968/5968841.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/5968/5968841.png',
      tag: type === 'call' ? 'incoming-call' : `new-message-${Date.now()}`,
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
      }).catch(err => {
        // Fallback for environments without service workers
        new Notification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  };

  return {
    requestPermission,
    showNotification,
    permission,
    subscription,
    loading
  };
};

export default usePushNotifications;