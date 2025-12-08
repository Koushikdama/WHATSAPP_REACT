/**
 * Chat folder management
 */

export interface ChatFolder {
    id: string;
    name: string;
    icon: string;
    chatIds: string[];
    color?: string;
    position: number;
}

const FOLDERS_STORAGE_KEY = 'chat_folders';

/**
 * Get all folders
 */
export const getAllFolders = (): ChatFolder[] => {
    try {
        const folders = localStorage.getItem(FOLDERS_STORAGE_KEY);
        if (!folders) return getDefaultFolders();
        return JSON.parse(folders);
    } catch (error) {
        console.error('Error getting folders:', error);
        return getDefaultFolders();
    }
};

/**
 * Default folders
 */
const getDefaultFolders = (): ChatFolder[] => {
    return [
        {
            id: 'all',
            name: 'All Chats',
            icon: '💬',
            chatIds: [],
            position: 0,
        },
        {
            id: 'unread',
            name: 'Unread',
            icon: '🔴',
            chatIds: [],
            position: 1,
        },
        {
            id: 'groups',
            name: 'Groups',
            icon: '👥',
            chatIds: [],
            position: 2,
        },
        {
            id: 'personal',
            name: 'Personal',
            icon: '👤',
            chatIds: [],
            position: 3,
        },
    ];
};

/**
 * Create folder
 */
export const createFolder = (name: string, icon: string, color?: string): ChatFolder => {
    try {
        const folders = getAllFolders();
        const newFolder: ChatFolder = {
            id: Date.now().toString(),
            name,
            icon,
            chatIds: [],
            color,
            position: folders.length,
        };

        folders.push(newFolder);
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));

        return newFolder;
    } catch (error) {
        console.error('Error creating folder:', error);
        throw error;
    }
};

/**
 * Update folder
 */
export const updateFolder = (folderId: string, updates: Partial<ChatFolder>): void => {
    try {
        const folders = getAllFolders();
        const index = folders.findIndex(f => f.id === folderId);

        if (index !== -1) {
            folders[index] = { ...folders[index], ...updates };
            localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
        }
    } catch (error) {
        console.error('Error updating folder:', error);
    }
};

/**
 * Delete folder
 */
export const deleteFolder = (folderId: string): void => {
    try {
        const folders = getAllFolders();
        const filtered = folders.filter(f => f.id !== folderId && !['all', 'unread', 'groups', 'personal'].includes(f.id));
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting folder:', error);
    }
};

/**
 * Add chat to folder
 */
export const addChatToFolder = (folderId: string, chatId: string): void => {
    try {
        const folders = getAllFolders();
        const folder = folders.find(f => f.id === folderId);

        if (folder && !folder.chatIds.includes(chatId)) {
            folder.chatIds.push(chatId);
            localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
        }
    } catch (error) {
        console.error('Error adding chat to folder:', error);
    }
};

/**
 * Remove chat from folder
 */
export const removeChatFromFolder = (folderId: string, chatId: string): void => {
    try {
        const folders = getAllFolders();
        const folder = folders.find(f => f.id === folderId);

        if (folder) {
            folder.chatIds = folder.chatIds.filter(id => id !== chatId);
            localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
        }
    } catch (error) {
        console.error('Error removing chat from folder:', error);
    }
};

/**
 * Get folder for chat
 */
export const getFolderForChat = (chatId: string): ChatFolder | null => {
    try {
        const folders = getAllFolders();
        return folders.find(f => f.chatIds.includes(chatId)) || null;
    } catch (error) {
        console.error('Error getting folder for chat:', error);
        return null;
    }
};

/**
 * Reorder folders
 */
export const reorderFolders = (folderIds: string[]): void => {
    try {
        const folders = getAllFolders();
        const reordered = folderIds.map((id, index) => {
            const folder = folders.find(f => f.id === id);
            if (folder) {
                return { ...folder, position: index };
            }
            return null;
        }).filter(Boolean) as ChatFolder[];

        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(reordered));
    } catch (error) {
        console.error('Error reordering folders:', error);
    }
};
