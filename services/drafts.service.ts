/**
 * Draft auto-save functionality
 */
export interface MessageDraft {
    chatId: string;
    content: string;
    timestamp: string;
    attachments?: {
        type: 'image' | 'video' | 'document';
        file: File;
        preview: string;
    }[];
}

const DRAFT_STORAGE_KEY = 'message_drafts';
export const AUTO_SAVE_DELAY = 1000; // 1 second - exported for use in components

/**
 * Get draft for a specific chat
 */
export const getDraft = (chatId: string): MessageDraft | null => {
    try {
        const drafts = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!drafts) return null;

        const allDrafts: MessageDraft[] = JSON.parse(drafts);
        return allDrafts.find(d => d.chatId === chatId) || null;
    } catch (error) {
        console.error('Error getting draft:', error);
        return null;
    }
};

/**
 * Save draft for a chat
 */
export const saveDraft = (chatId: string, content: string, attachments?: any[]): void => {
    try {
        const drafts = localStorage.getItem(DRAFT_STORAGE_KEY);
        const allDrafts: MessageDraft[] = drafts ? JSON.parse(drafts) : [];

        // Remove existing draft for this chat
        const filtered = allDrafts.filter(d => d.chatId !== chatId);

        // Add new draft if content exists
        if (content.trim()) {
            filtered.push({
                chatId,
                content,
                timestamp: new Date().toISOString(),
                attachments,
            });
        }

        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error saving draft:', error);
    }
};

/**
 * Clear draft for a chat
 */
export const clearDraft = (chatId: string): void => {
    try {
        const drafts = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!drafts) return;

        const allDrafts: MessageDraft[] = JSON.parse(drafts);
        const filtered = allDrafts.filter(d => d.chatId !== chatId);

        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error clearing draft:', error);
    }
};

/**
 * Get all drafts (for displaying draft indicators in chat list)
 */
export const getAllDrafts = (): Map<string, string> => {
    try {
        const drafts = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!drafts) return new Map();

        const allDrafts: MessageDraft[] = JSON.parse(drafts);
        const draftMap = new Map<string, string>();

        allDrafts.forEach(draft => {
            draftMap.set(draft.chatId, draft.content);
        });

        return draftMap;
    } catch (error) {
        console.error('Error getting all drafts:', error);
        return new Map();
    }
};

/**
 * Clean up old drafts (older than 7 days)
 */
export const cleanupOldDrafts = (): void => {
    try {
        const drafts = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!drafts) return;

        const allDrafts: MessageDraft[] = JSON.parse(drafts);
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        const filtered = allDrafts.filter(draft => {
            const draftTime = new Date(draft.timestamp).getTime();
            return draftTime > sevenDaysAgo;
        });

        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error cleaning up drafts:', error);
    }
};
