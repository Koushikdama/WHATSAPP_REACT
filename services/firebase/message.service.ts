import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/schema';

/**
 * Edit a message (only text messages can be edited)
 */
export const editMessage = async (chatId: string, messageId: string, newContent: string): Promise<void> => {
    try {
        const messageRef = doc(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, messageId);

        await updateDoc(messageRef, {
            content: newContent,
            isEdited: true,
            editedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error editing message:', error);
        throw error;
    }
};
