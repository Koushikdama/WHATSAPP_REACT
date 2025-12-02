import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    serverTimestamp,
    updateDoc,
    increment
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { User } from '../../types';

const FOLLOWERS_COLLECTION = 'followers';
const FOLLOWING_COLLECTION = 'following';
const USERS_COLLECTION = 'users';

/**
 * Follow a user
 */
export const followUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
    if (currentUserId === targetUserId) {
        throw new Error('Cannot follow yourself');
    }

    const batch = [
        // Add to current user's following
        setDoc(doc(db, FOLLOWING_COLLECTION, currentUserId, 'userFollowing', targetUserId), {
            followedAt: serverTimestamp()
        }),
        // Add to target user's followers
        setDoc(doc(db, FOLLOWERS_COLLECTION, targetUserId, 'userFollowers', currentUserId), {
            followedAt: serverTimestamp()
        }),
        // Increment current user's following count
        updateDoc(doc(db, USERS_COLLECTION, currentUserId), {
            followingCount: increment(1)
        }),
        // Increment target user's followers count
        updateDoc(doc(db, USERS_COLLECTION, targetUserId), {
            followersCount: increment(1)
        })
    ];

    await Promise.all(batch);
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
    const batch = [
        // Remove from current user's following
        deleteDoc(doc(db, FOLLOWING_COLLECTION, currentUserId, 'userFollowing', targetUserId)),
        // Remove from target user's followers
        deleteDoc(doc(db, FOLLOWERS_COLLECTION, targetUserId, 'userFollowers', currentUserId)),
        // Decrement current user's following count
        updateDoc(doc(db, USERS_COLLECTION, currentUserId), {
            followingCount: increment(-1)
        }),
        // Decrement target user's followers count
        updateDoc(doc(db, USERS_COLLECTION, targetUserId), {
            followersCount: increment(-1)
        })
    ];

    await Promise.all(batch);
};

/**
 * Check if current user is following target user
 */
export const isFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    const docRef = doc(db, FOLLOWING_COLLECTION, currentUserId, 'userFollowing', targetUserId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
};

/**
 * Get user's followers
 */
export const getFollowers = async (userId: string): Promise<User[]> => {
    const followersRef = collection(db, FOLLOWERS_COLLECTION, userId, 'userFollowers');
    const snapshot = await getDocs(followersRef);

    const followers: User[] = [];

    // Fetch each follower's user data
    for (const docSnap of snapshot.docs) {
        const followerUserId = docSnap.id;
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, followerUserId));
        if (userDoc.exists()) {
            followers.push({ id: userDoc.id, ...userDoc.data() } as User);
        }
    }

    return followers;
};

/**
 * Get users that a user is following
 */
export const getFollowing = async (userId: string): Promise<User[]> => {
    const followingRef = collection(db, FOLLOWING_COLLECTION, userId, 'userFollowing');
    const snapshot = await getDocs(followingRef);

    const following: User[] = [];

    // Fetch each followed user's data
    for (const docSnap of snapshot.docs) {
        const followingUserId = docSnap.id;
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, followingUserId));
        if (userDoc.exists()) {
            following.push({ id: userDoc.id, ...userDoc.data() } as User);
        }
    }

    return following;
};

/**
 * Update user privacy settings
 */
export const updatePrivacySettings = async (
    userId: string,
    settings: { hideFollowers?: boolean; hideFollowing?: boolean }
): Promise<void> => {
    await updateDoc(doc(db, USERS_COLLECTION, userId), settings);
};
