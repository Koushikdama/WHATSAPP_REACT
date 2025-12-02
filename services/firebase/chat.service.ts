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
    setDoc,
    limit,
    getDocs,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/schema';
import { Chat, Message, Conversation } from '../../types.ts';

export const createChat = async (participants: string[], type: 'individual' | 'group', initialData?: Partial<Chat>): Promise<string> => {
    // Check if individual chat already exists
    if (type === 'individual' && participants.length === 2) {
        const chatsRef = collection(db, COLLECTIONS.CHATS);
        const q = query(
            chatsRef,
            where('type', '==', 'individual'),
            where('participants', 'array-contains', participants[0])
        );

        const snapshot = await getDocs(q);
        const existingChat = snapshot.docs.find(doc => {
            const data = doc.data();
            return data.participants.includes(participants[1]);
        });

        if (existingChat) {
            return existingChat.id;
        }
    }

    const newChatRef = await addDoc(collection(db, COLLECTIONS.CHATS), {
        type,
        participants,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadCount: 0,
        isMuted: false,
        isPinned: false,
        ...initialData
    });

    return newChatRef.id;
};

export const sendMessage = async (
    chatId: string,
    senderId: string,
    content: string,
    type: string = 'text',
    fileInfo?: any,
    replyInfo?: {
        replyMessageId?: string;
        replyMessageSender?: string;
        replyMessageContent?: string;
    }
): Promise<void> => {
    const messagesRef = collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES);

    const newMessage: any = {
        senderId,
        content,
        messageType: type,
        timestamp: new Date().toISOString(),
        status: 'sent',
        fileInfo: fileInfo || null,
        reactions: {},
        deleteFor: [],
        deleteForEveryone: false,
        isEdited: false,
        isSeen: false,
    };

    // Add reply fields if provided
    if (replyInfo?.replyMessageId) {
        newMessage.replyMessageId = replyInfo.replyMessageId;
        newMessage.replyMessageSender = replyInfo.replyMessageSender;
        newMessage.replyMessageContent = replyInfo.replyMessageContent;
    }

    await addDoc(messagesRef, newMessage);

    // Update chat last message
    const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
    await updateDoc(chatRef, {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        lastMessageType: type,
        lastMessageSentById: senderId,
        updatedAt: serverTimestamp()
    });
};

export const subscribeToChatMessages = (chatId: string, callback: (messages: Message[]) => void) => {
    const messagesRef = collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() } as Message);
        });
        callback(messages);
    }, (error) => {
        console.error('❌ PERMISSION ERROR in subscribeToChatMessages (messages subcollection):', error);
        console.error('Query details:', { collection: 'messages', chatId, path: `chats/${chatId}/messages` });
    });
};

export const subscribeToUserChats = (userId: string, callback: (conversations: Conversation[]) => void) => {
    const chatsRef = collection(db, COLLECTIONS.CHATS);
    const q = query(chatsRef, where('participants', 'array-contains', userId), orderBy('updatedAt', 'desc'));

    return onSnapshot(q, async (snapshot) => {
        const conversations: Conversation[] = [];

        for (const docSnapshot of snapshot.docs) {
            const chatData = docSnapshot.data();
            const otherUserId = chatData.participants.find((p: string) => p !== userId);

            // Fetch other user info for display
            let name = chatData.name || 'Chat';
            let profileImage = chatData.avatar || '';

            if (chatData.type === 'individual' && otherUserId) {
                const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, otherUserId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    name = userData.name;
                    profileImage = userData.avatar;
                }
            }

            conversations.push({
                id: docSnapshot.id,
                conversationType: chatData.type === 'individual' ? 'INDIVIDUAL' : 'GROUP',
                name,
                profileImage,
                lastMessage: chatData.lastMessage || '',
                lastMessageAt: chatData.lastMessageAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                lastMessageType: chatData.lastMessageType || 'text',
                lastMessageSentById: chatData.lastMessageSentById || '',
                lastMessageSentByName: '', // Can be fetched if needed
                unreadCount: chatData.unreadCount || 0,
                participants: chatData.participants,
                isOnline: false // This would need a separate listener or check
            });
        }

        callback(conversations);
    }, (error) => {
        console.error('❌ PERMISSION ERROR in subscribeToUserChats (chats collection):', error);
        console.error('Query details:', { collection: 'chats', userId });
    });
};

export const markMessageAsRead = async (chatId: string, messageId: string) => {
    const messageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, messageId);
    await updateDoc(messageRef, { status: 'read' });
};

/**
 * Add or remove a reaction to a message
 */
export const reactToMessage = async (chatId: string, messageId: string, userId: string, emoji: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, messageId);
        const messageDoc = await getDoc(messageRef);

        if (!messageDoc.exists()) {
            throw new Error('Message not found');
        }

        const messageData = messageDoc.data();
        const reactions = messageData.reactions || {};

        // Check if user already reacted with this emoji
        if (reactions[emoji] && Array.isArray(reactions[emoji]) && reactions[emoji].includes(userId)) {
            // Remove reaction
            await updateDoc(messageRef, {
                [`reactions.${emoji}`]: arrayRemove(userId)
            });
        } else {
            // Add reaction
            await updateDoc(messageRef, {
                [`reactions.${emoji}`]: arrayUnion(userId)
            });
        }
    } catch (error) {
        console.error('Error reacting to message:', error);
        throw error;
    }
};
