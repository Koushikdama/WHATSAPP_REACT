# Firebase Configuration Setup

This document outlines the Firebase integration for push notifications and cloud messaging.

## Overview

The application has been configured with Firebase Cloud Messaging (FCM) for push notifications. The setup includes:

- **Firebase Configuration**: `utils/firebase/firebase.config.ts`
- **Environment Variables**: `.env` file with all credentials
- **Service Worker**: `public/firebase-messaging-sw.js` for background notifications
- **FCM VAPID Key**: For web push certificate authentication

## Firebase Credentials

The following Firebase credentials have been configured:

- **Project ID**: whatsapp-d94fc
- **API Key**: AIzaSyD9ocLNrnpib27e56QTqFf3pr2HW9I4bnk
- **Auth Domain**: whatsapp-d94fc.firebaseapp.com
- **Storage Bucket**: whatsapp-d94fc.firebasestorage.app
- **Messaging Sender ID**: 621741910548
- **App ID**: 1:621741910548:web:52789e56178dad6c545501
- **Measurement ID**: G-QR8EZ2P3NE

## FCM Web Push (VAPID Key)

The FCM VAPID key for web push notifications:
```
BElmQ12ntB5hskv1uY8lpgO4Niz6kicJ96UrJ-6KnmGR0xl8hEkc67FASTwKyUtVHw2pD0jsuQMPcX3wP_pyQXE
```

## Usage

### Requesting Notification Permission

```typescript
import usePushNotifications from './hooks/usePushNotifications';

const { requestPermission, subscription, permission, loading } = usePushNotifications();

// Request permission and get FCM token
await requestPermission();

// The token will be available in the subscription state
console.log('FCM Token:', subscription);
```

### Displaying Notifications

```typescript
const { showNotification } = usePushNotifications();

// Show a message notification
showNotification('message', 'New Message', 'You have a new message from John');

// Show a call notification
showNotification('call', 'Incoming Call', 'John is calling you');
```

### Firebase Services

Import Firebase services from the config file:

```typescript
import { db, auth, messaging, analytics } from './utils/firebase/firebase.config';

// Use Firestore
import { collection, getDocs } from 'firebase/firestore';
const usersRef = collection(db, 'users');

// Use Auth
import { signInWithEmailAndPassword } from 'firebase/auth';
await signInWithEmailAndPassword(auth, email, password);
```

## Service Worker

The Firebase messaging service worker (`public/firebase-messaging-sw.js`) handles:
- Background push notifications
- Notification click handling
- Routing to appropriate chat/call screens

## Environment Variables

All Firebase credentials are stored in the `.env` file. Make sure to:
1. Never commit the `.env` file to version control
2. Keep the `.env.example` file updated with placeholder values
3. Share credentials securely with team members

## Security Notes

> **⚠️ IMPORTANT**: The credentials and VAPID key have been shared in this implementation. For production use:
> - Rotate all Firebase credentials
> - Generate a new VAPID key
> - Implement proper Firebase Security Rules
> - Use environment-specific configurations

## Testing

To test push notifications:
1. Run the application
2. Allow notification permissions when prompted
3. Check the console for the FCM token
4. Use Firebase Console to send test notifications

## Next Steps

1. Register service worker in the main application
2. Save FCM tokens to your backend for each user
3. Send push notifications from your backend using the FCM tokens
4. Implement notification handlers for different message types
