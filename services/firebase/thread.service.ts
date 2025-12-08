import { doc, collection, addDoc, updateDoc, getDocs, query, where, orderBy, limit, serverTimestamp, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/schema';
import { Message, Thread } from '../../types';

/**
 * Create a new thread from a message
 */
export const createThread = async (parentMessageId: string, chatId: string, channelId?: string): Promise<Thread> => {
    try {
        const threadData: Omit<Thread, 'id'> = {
            parentMessageId,
            chatId,
            channelId,
            participants: [],
            replyCount: 0,
            lastReplyAt: new Date().toISOString(),
            lastReplyBy: '',
            isFollowing: false,
        };

        const threadRef = await addDoc(collection(db, COLLECTIONS.THREADS), threadData);

        // Update parent message to indicate it has a thread
        const messageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, parentMessageId);
        await updateDoc(messageRef, {
            isThreadStarter: true,
            threadId: threadRef.id,
            threadCount: 0,
            threadParticipants: [],
        });

        return {
            id: threadRef.id,
            ...threadData,
        };
    } catch (error) {
        console.error('Error creating thread:', error);
        throw error;
    }
};

/**
 * Add reply to thread
 */
export const addThreadReply = async (
    threadId: string,
    chatId: string,
    messageData: Partial<Message>,
    userId: string
): Promise<string> => {
    try {
        // Get thread info
        const threadRef = doc(db, COLLECTIONS.THREADS, threadId);
        const threadSnap = await getDoc(threadRef);

        if (!threadSnap.exists()) {
            throw new Error('Thread not found');
        }

        const thread = threadSnap.data() as Thread;

        // Add message with threadId
        const messageRef = await addDoc(
            collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES),
            {
                ...messageData,
                threadId,
                timestamp: serverTimestamp(),
            }
        );

        // Update thread metadata
        const newParticipants = thread.participants.includes(userId)
            ? thread.participants
            : [...thread.participants, userId];

        await updateDoc(threadRef, {
            participants: newParticipants,
            replyCount: thread.replyCount + 1,
            lastReplyAt: serverTimestamp(),
            lastReplyBy: userId,
        });

        // Update parent message thread info
        const parentMessageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, thread.parentMessageId);
        await updateDoc(parentMessageRef, {
            threadCount: thread.replyCount + 1,
            threadParticipants: newParticipants,
            lastThreadReply: {
                senderId: userId,
                senderName: messageData.senderName || 'User',
                timestamp: new Date().toISOString(),
                preview: messageData.content?.substring(0, 50) || '',
            },
        });

        return messageRef.id;
    } catch (error) {
        console.error('Error adding thread reply:', error);
        throw error;
    }
};

/**
 * Get thread replies
 */
export const getThreadReplies = async (threadId: string, chatId: string): Promise<Message[]> => {
    try {
        const q = query(
            collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES),
            where('threadId', '==', threadId),
            orderBy('timestamp', 'asc')
        );

        const snapshot = await getDocs(q);
        const messages: Message[] = [];

        snapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data(),
            } as Message);
        });

        return messages;
    } catch (error) {
        console.error('Error getting thread replies:', error);
        return [];
    }
};

/**
 * Delete thread
 */
export const deleteThread = async (threadId: string, chatId: string, parentMessageId: string): Promise<void> => {
    try {
        // Delete all thread messages
        const messages = await getThreadReplies(threadId, chatId);
        const deletePromises = messages.map(msg =>
            deleteDoc(doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, msg.id))
        );
        await Promise.all(deletePromises);

        // Delete thread document
        await deleteDoc(doc(db, COLLECTIONS.THREADS, threadId));

        // Update parent message
        const parentMessageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, parentMessageId);
        await updateDoc(parentMessageRef, {
            isThreadStarter: false,
            threadId: null,
            threadCount: 0,
            threadParticipants: [],
            lastThreadReply: null,
        });
    } catch (error) {
        console.error('Error deleting thread:', error);
        throw error;
    }
};
