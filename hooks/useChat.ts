import { useState, useEffect } from 'react';
import { subscribeToChatMessages, sendMessage as sendFirebaseMessage, markMessageAsRead } from '../services/firebase/chat.service';
import { Message } from '../types';

export const useChat = (chatId: string | null) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToChatMessages(chatId, (newMessages) => {
            setMessages(newMessages);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chatId]);

    const sendMessage = async (senderId: string, content: string, type?: string, fileInfo?: any, messageData?: any) => {
        if (!chatId) return;

        try {
            // Extract reply info if present in messageData
            const replyInfo = messageData && messageData.replyMessageId ? {
                replyMessageId: messageData.replyMessageId,
                replyMessageSender: messageData.replyMessageSender,
                replyMessageContent: messageData.replyMessageContent
            } : undefined;

            await sendFirebaseMessage(chatId, senderId, content, type || 'text', fileInfo, replyInfo);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    const markAsRead = async (messageId: string) => {
        if (!chatId) return;
        await markMessageAsRead(chatId, messageId);
    };

    return { messages, loading, sendMessage, markAsRead };
};
