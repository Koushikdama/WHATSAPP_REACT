// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyD9ocLNrnpib27e56QTqFf3pr2HW9I4bnk",
    authDomain: "whatsapp-d94fc.firebaseapp.com",
    projectId: "whatsapp-d94fc",
    storageBucket: "whatsapp-d94fc.firebasestorage.app",
    messagingSenderId: "621741910548",
    appId: "1:621741910548:web:52789e56178dad6c545501",
    measurementId: "G-QR8EZ2P3NE"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'New Message';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message',
        icon: payload.notification?.icon || '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: payload.data,
        tag: payload.data?.type === 'call' ? 'incoming-call' : 'new-message',
        requireInteraction: payload.data?.type === 'call',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked', event);

    event.notification.close();

    // Handle different types of notifications
    const data = event.notification.data;
    let urlToOpen = '/';

    if (data) {
        if (data.type === 'message' && data.chatId) {
            urlToOpen = `/chat/${data.chatId}`;
        } else if (data.type === 'call') {
            urlToOpen = '/';
        }
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
