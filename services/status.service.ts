import { collection, addDoc, getDocs, query, where, updateDoc, doc, arrayUnion, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebase/firebase.config';
import { Status, StatusUpdate } from '../types';

const STATUSES_COLLECTION = 'statuses';

/**
 * Creates a new status or adds an update to existing status
 * @param userId - The user ID who is posting the status
 * @param update - The status update object
 */
export const createStatus = async (userId: string, update: StatusUpdate): Promise<void> => {
    try {
        // Check if user already has a status from today
        const statusesRef = collection(db, STATUSES_COLLECTION);
        const q = query(statusesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

        if (!querySnapshot.empty) {
            // Update existing status
            const existingDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, STATUSES_COLLECTION, existingDoc.id), {
                updates: arrayUnion(update),
                expiresAt: Timestamp.fromDate(expiresAt)
            });
        } else {
            // Create new status
            await addDoc(collection(db, STATUSES_COLLECTION), {
                userId,
                updates: [update],
                createdAt: Timestamp.fromDate(now),
                expiresAt: Timestamp.fromDate(expiresAt)
            });
        }
    } catch (error) {
        console.error('Error creating status:', error);
        throw new Error('Failed to create status');
    }
};

/**
 * Fetches all non-expired statuses
 * @param currentUserId - The current user's ID (to filter)
 * @returns Array of status objects
 */
export const getStatuses = async (currentUserId?: string): Promise<Status[]> => {
    try {
        const statusesRef = collection(db, STATUSES_COLLECTION);
        const querySnapshot = await getDocs(statusesRef);

        const now = new Date();
        const statuses: Status[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const expiresAt = data.expiresAt?.toDate();

            // Only include non-expired statuses
            if (expiresAt && expiresAt > now) {
                statuses.push({
                    id: doc.id,
                    userId: data.userId,
                    updates: data.updates || [],
                    expiresAt: expiresAt.toISOString()
                });
            }
        });

        return statuses;
    } catch (error) {
        console.error('Error fetching statuses:', error);
        throw new Error('Failed to fetch statuses');
    }
};

/**
 * Gets a single status by ID
 * @param statusId - The status document ID
 * @returns Status object or null if not found
 */
export const getStatus = async (statusId: string): Promise<Status | null> => {
    try {
        const statusDoc = await getDocs(query(collection(db, STATUSES_COLLECTION), where('__name__', '==', statusId)));

        if (statusDoc.empty) {
            return null;
        }

        const data = statusDoc.docs[0].data();
        return {
            id: statusDoc.docs[0].id,
            userId: data.userId,
            updates: data.updates || [],
            expiresAt: data.expiresAt?.toDate().toISOString() || new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching status:', error);
        return null;
    }
};

/**
 * Adds a reaction to a status update
 * @param userId - The user ID who owns the status
 * @param updateId - The update ID within the status
 * @param emoji - The emoji reaction
 */
export const addReactionToStatus = async (userId: string, updateId: string, emoji: string): Promise<void> => {
    try {
        const statusesRef = collection(db, STATUSES_COLLECTION);
        const q = query(statusesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const statusDoc = querySnapshot.docs[0];
            const data = statusDoc.data();
            const updates = data.updates || [];

            // Find and update the specific update
            const updatedUpdates = updates.map((update: StatusUpdate) => {
                if (update.id === updateId) {
                    const reactions = update.reactions || [];
                    // Add reaction if not already present
                    if (!reactions.includes(emoji)) {
                        return {
                            ...update,
                            reactions: [emoji, ...reactions]
                        };
                    }
                }
                return update;
            });

            await updateDoc(doc(db, STATUSES_COLLECTION, statusDoc.id), {
                updates: updatedUpdates
            });
        }
    } catch (error) {
        console.error('Error adding reaction:', error);
        throw new Error('Failed to add reaction');
    }
};

/**
 * Deletes expired statuses (older than 24 hours)
 * This should be called periodically or on app initialization
 */
export const deleteExpiredStatuses = async (): Promise<void> => {
    try {
        const statusesRef = collection(db, STATUSES_COLLECTION);
        const querySnapshot = await getDocs(statusesRef);

        const now = new Date();
        const deletePromises: Promise<void>[] = [];

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const expiresAt = data.expiresAt?.toDate();

            if (expiresAt && expiresAt < now) {
                deletePromises.push(deleteDoc(doc(db, STATUSES_COLLECTION, docSnapshot.id)));
            }
        });

        await Promise.all(deletePromises);
        console.log(`Deleted ${deletePromises.length} expired statuses`);
    } catch (error) {
        console.error('Error deleting expired statuses:', error);
    }
};
