import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD9ocLNrnpib27e56QTqFf3pr2HW9I4bnk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "whatsapp-d94fc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "whatsapp-d94fc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "whatsapp-d94fc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "621741910548",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:621741910548:web:52789e56178dad6c545501",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QR8EZ2P3NE"
};

// FCM VAPID key for push notifications
export const FCM_VAPID_KEY = "BElmQ12ntB5hskv1uY8lpgO4Niz6kicJ96UrJ-6KnmGR0xl8hEkc67FASTwKyUtVHw2pD0jsuQMPcX3wP_pyQXE";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Firebase Messaging
let messaging: any = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}

/**
 * Request permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.warn('Firebase Messaging not available');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: FCM_VAPID_KEY });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.warn('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export { app, analytics, db, auth, messaging };
export default app;
