import { doc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Channel } from '../../types';

const CHANNELS_COLLECTION = 'channels';

/**
 * Create a new channel in a group
 */
export const createChannel = async (
    groupId: string,
    name: string,
    description: string | undefined,
    type: Channel['type'],
    createdBy: string
): Promise<Channel> => {
    try {
        // Get current channels to determine position
        const q = query(collection(db, CHANNELS_COLLECTION), where('groupId', '==', groupId));
        const snapshot = await getDocs(q);
        const position = snapshot.size;

        const channelData: Omit<Channel, 'id'> = {
            groupId,
            name,
            description,
            type,
            createdBy,
            createdAt: new Date().toISOString(),
            position,
            permissions: {
                canPost: [], // Empty means all can post
                canRead: [], // Empty means all can read
            },
        };

        const channelRef = await addDoc(collection(db, CHANNELS_COLLECTION), channelData);

        return {
            id: channelRef.id,
            ...channelData,
        };
    } catch (error) {
        console.error('Error creating channel:', error);
        throw error;
    }
};

/**
 * Get all channels for a group
 */
export const getChannels = async (groupId: string): Promise<Channel[]> => {
    try {
        const q = query(
            collection(db, CHANNELS_COLLECTION),
            where('groupId', '==', groupId)
        );

        const snapshot = await getDocs(q);
        const channels: Channel[] = [];

        snapshot.forEach((doc) => {
            channels.push({
                id: doc.id,
                ...doc.data(),
            } as Channel);
        });

        return channels.sort((a, b) => a.position - b.position);
    } catch (error) {
        console.error('Error getting channels:', error);
        return [];
    }
};

/**
 * Update channel
 */
export const updateChannel = async (
    channelId: string,
    updates: Partial<Omit<Channel, 'id' | 'groupId' | 'createdBy' | 'createdAt'>>
): Promise<void> => {
    try {
        const channelRef = doc(db, CHANNELS_COLLECTION, channelId);
        await updateDoc(channelRef, updates);
    } catch (error) {
        console.error('Error updating channel:', error);
        throw error;
    }
};

/**
 * Delete channel
 */
export const deleteChannel = async (channelId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, CHANNELS_COLLECTION, channelId));
    } catch (error) {
        console.error('Error deleting channel:', error);
        throw error;
    }
};

/**
 * Add user permission to channel
 */
export const addChannelPermission = async (
    channelId: string,
    userId: string,
    permissionType: 'canPost' | 'canRead'
): Promise<void> => {
    try {
        const channelRef = doc(db, CHANNELS_COLLECTION, channelId);
        await updateDoc(channelRef, {
            [`permissions.${permissionType}`]: arrayUnion(userId),
        });
    } catch (error) {
        console.error('Error adding channel permission:', error);
        throw error;
    }
};

/**
 * Remove user permission from channel
 */
export const removeChannelPermission = async (
    channelId: string,
    userId: string,
    permissionType: 'canPost' | 'canRead'
): Promise<void> => {
    try {
        const channelRef = doc(db, CHANNELS_COLLECTION, channelId);
        await updateDoc(channelRef, {
            [`permissions.${permissionType}`]: arrayRemove(userId),
        });
    } catch (error) {
        console.error('Error removing channel permission:', error);
        throw error;
    }
};

/**
 * Check if user can post in channel
 */
export const canUserPostInChannel = async (channelId: string, userId: string, isAdmin: boolean): Promise<boolean> => {
    try {
        const channelRef = doc(db, CHANNELS_COLLECTION, channelId);
        const channelSnap = await getDoc(channelRef);

        if (!channelSnap.exists()) return false;

        const channel = channelSnap.data() as Channel;

        // Announcement channels: only admins can post
        if (channel.type === 'announcement') {
            return isAdmin;
        }

        // If canPost is empty, everyone can post
        if (!channel.permissions?.canPost || channel.permissions.canPost.length === 0) {
            return true;
        }

        // Check if user is in the canPost list
        return channel.permissions.canPost.includes(userId);
    } catch (error) {
        console.error('Error checking post permission:', error);
        return false;
    }
};

/**
 * Reorder channels
 */
export const reorderChannels = async (channelIds: string[]): Promise<void> => {
    try {
        const updatePromises = channelIds.map((channelId, index) =>
            updateDoc(doc(db, CHANNELS_COLLECTION, channelId), { position: index })
        );

        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error reordering channels:', error);
        throw error;
    }
};
