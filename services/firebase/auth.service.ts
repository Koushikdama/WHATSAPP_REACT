import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/schema';
import { User } from '../../types.ts';

export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName: name });

    // Default settings for new users
    const defaultSettings = {
        // Privacy
        hideFollowers: false,
        hideFollowing: false,
        readReceipts: true,
        lastSeenVisibility: 'everyone' as 'everyone' | 'contacts' | 'nobody',
        profilePhotoVisibility: 'everyone' as 'everyone' | 'contacts' | 'nobody',

        // Chat
        defaultTheme: null,
        enterToSend: false,
        mediaAutoDownload: true,
        chatLockPin: null, // Initially null - user must set PIN to lock chats

        // Notifications  
        notificationsEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        showPreviews: true,

        // Appearance
        fontSize: 'medium' as 'small' | 'medium' | 'large',
        wallpaper: 'https://i.redd.it/qwd83nc4xxf41.jpg',

        // Theme & UI Settings (for cross-device sync)
        themeSettings: {
            themeColor: { name: 'green', from: '#00a884', to: '#008a69' },
            toggleOnColor: { name: 'green', from: '#00a884', to: '#008a69' },
            toggleOffColor: { name: 'gray', color: '#374151' },
            chatBackground: 'https://i.redd.it/qwd83nc4xxf41.jpg',
            uiStyle: 'normal' as 'normal' | 'glossy',
            animationsEnabled: true,
            fontSize: 'medium' as 'small' | 'medium' | 'large',
            headerAnimation: 'none' as 'none' | 'shine' | 'wave',
            swipeSensitivity: 50,
            wallpaperQuality: 'medium' as 'low' | 'medium' | 'high',
        },

        // Security & Passcode Settings (for cross-device sync)
        passcodeSettings: {
            lockedChats: { enabled: true, passcode: "1234" },
            vanishMode: { enabled: true, passcode: "5678" },
            dailyChatLock: { enabled: true, passcode: "0000" },
        },

        // Locked dates (empty for new users)
        lockedDates: {} as Record<string, string[]>,
    };

    const newUser: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        avatar: '/assets/images/default-avatar.png',
        about: 'Hey there! I am using WhatsApp.',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        phone: '',
        statusText: 'Available',
        followerCount: 0,
        followingCount: 0,
        settings: defaultSettings
    };

    // Create user document in Firestore
    await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    return newUser;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch user details from Firestore
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));

    if (userDoc.exists()) {
        await updateUserStatus(firebaseUser.uid, true);
        return userDoc.data() as User;
    } else {
        // Handle case where user exists in Auth but not Firestore (shouldn't happen normally)
        throw new Error('User profile not found');
    }
};

export const logoutUser = async (userId: string): Promise<void> => {
    await updateUserStatus(userId, false);
    await signOut(auth);
};

export const updateUserStatus = async (userId: string, isOnline: boolean): Promise<void> => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, {
        isOnline,
        lastSeen: new Date().toISOString()
    }, { merge: true });
};
