import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    getDoc,
    getDocs,
    deleteDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/schema';
import { ScheduledMessage, ScheduledMessageStatus } from '../../types/workflow.types';

/**
 * Schedule a message to be sent at a specific time
 */
export const scheduleMessage = async (
    message: Omit<ScheduledMessage, 'id' | 'createdAt' | 'status'>
): Promise<string> => {
    try {
        const messageRef = await addDoc(collection(db, COLLECTIONS.SCHEDULED_MESSAGES), {
            ...message,
            status: 'pending' as ScheduledMessageStatus,
            createdAt: serverTimestamp(),
        });
        return messageRef.id;
    } catch (error) {
        console.error('Error scheduling message:', error);
        throw error;
    }
};

/**
 * Update a scheduled message
 */
export const updateScheduledMessage = async (
    messageId: string,
    updates: Partial<ScheduledMessage>
): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.SCHEDULED_MESSAGES, messageId);
        await updateDoc(messageRef, updates);
    } catch (error) {
        console.error('Error updating scheduled message:', error);
        throw error;
    }
};

/**
 * Cancel a scheduled message
 */
export const cancelScheduledMessage = async (messageId: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.SCHEDULED_MESSAGES, messageId);
        await updateDoc(messageRef, {
            status: 'cancelled' as ScheduledMessageStatus,
        });
    } catch (error) {
        console.error('Error cancelling scheduled message:', error);
        throw error;
    }
};

/**
 * Delete a scheduled message
 */
export const deleteScheduledMessage = async (messageId: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.SCHEDULED_MESSAGES, messageId);
        await deleteDoc(messageRef);
    } catch (error) {
        console.error('Error deleting scheduled message:', error);
        throw error;
    }
};

/**
 * Get all scheduled messages for a user
 */
export const getUserScheduledMessages = async (userId: string): Promise<ScheduledMessage[]> => {
    try {
        const messagesRef = collection(db, COLLECTIONS.SCHEDULED_MESSAGES);
        const q = query(
            messagesRef,
            where('userId', '==', userId),
            orderBy('scheduledFor', 'asc')
        );

        const snapshot = await getDocs(q);
        const messages: ScheduledMessage[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                scheduledFor: data.scheduledFor,
                sentAt: data.sentAt?.toDate?.()?.toISOString(),
            } as ScheduledMessage);
        });

        return messages;
    } catch (error) {
        console.error('Error getting scheduled messages:', error);
        throw error;
    }
};

/**
 * Get pending scheduled messages for a user
 */
export const getPendingScheduledMessages = async (userId: string): Promise<ScheduledMessage[]> => {
    try {
        const messagesRef = collection(db, COLLECTIONS.SCHEDULED_MESSAGES);
        const q = query(
            messagesRef,
            where('userId', '==', userId),
            where('status', '==', 'pending'),
            orderBy('scheduledFor', 'asc')
        );

        const snapshot = await getDocs(q);
        const messages: ScheduledMessage[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                scheduledFor: data.scheduledFor,
            } as ScheduledMessage);
        });

        return messages;
    } catch (error) {
        console.error('Error getting pending scheduled messages:', error);
        throw error;
    }
};

/**
 * Get scheduled messages for a specific chat
 */
export const getChatScheduledMessages = async (chatId: string): Promise<ScheduledMessage[]> => {
    try {
        const messagesRef = collection(db, COLLECTIONS.SCHEDULED_MESSAGES);
        const q = query(
            messagesRef,
            where('chatId', '==', chatId),
            where('status', '==', 'pending'),
            orderBy('scheduledFor', 'asc')
        );

        const snapshot = await getDocs(q);
        const messages: ScheduledMessage[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                scheduledFor: data.scheduledFor,
            } as ScheduledMessage);
        });

        return messages;
    } catch (error) {
        console.error('Error getting chat scheduled messages:', error);
        throw error;
    }
};

/**
 * Subscribe to user's scheduled messages (real-time updates)
 */
export const subscribeToUserScheduledMessages = (
    userId: string,
    callback: (messages: ScheduledMessage[]) => void
): (() => void) => {
    const messagesRef = collection(db, COLLECTIONS.SCHEDULED_MESSAGES);
    const q = query(
        messagesRef,
        where('userId', '==', userId),
        orderBy('scheduledFor', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages: ScheduledMessage[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                scheduledFor: data.scheduledFor,
                sentAt: data.sentAt?.toDate?.()?.toISOString(),
            } as ScheduledMessage);
        });

        callback(messages);
    }, (error) => {
        console.error('Error subscribing to scheduled messages:', error);
    });
};

/**
 * Get due scheduled messages (messages that should be sent now)
 */
export const getDueScheduledMessages = async (): Promise<ScheduledMessage[]> => {
    try {
        const now = new Date().toISOString();
        const messagesRef = collection(db, COLLECTIONS.SCHEDULED_MESSAGES);
        const q = query(
            messagesRef,
            where('status', '==', 'pending'),
            where('scheduledFor', '<=', now)
        );

        const snapshot = await getDocs(q);
        const messages: ScheduledMessage[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                scheduledFor: data.scheduledFor,
            } as ScheduledMessage);
        });

        return messages;
    } catch (error) {
        console.error('Error getting due scheduled messages:', error);
        throw error;
    }
};

/**
 * Mark a scheduled message as sent
 */
export const markScheduledMessageAsSent = async (messageId: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.SCHEDULED_MESSAGES, messageId);
        await updateDoc(messageRef, {
            status: 'sent' as ScheduledMessageStatus,
            sentAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error marking scheduled message as sent:', error);
        throw error;
    }
};

/**
 * Mark a scheduled message as failed
 */
export const markScheduledMessageAsFailed = async (messageId: string, error: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.SCHEDULED_MESSAGES, messageId);
        await updateDoc(messageRef, {
            status: 'failed' as ScheduledMessageStatus,
            error,
        });
    } catch (error) {
        console.error('Error marking scheduled message as failed:', error);
        throw error;
    }
};
