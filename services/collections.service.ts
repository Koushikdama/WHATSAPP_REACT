/**
 * Collections service for saving messages to organized collections
 */

export interface Collection {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    isShared: boolean;
    sharedWith: string[];
    messageIds: string[];
    createdAt: string;
    coverImage?: string;
    color?: string;
}

const COLLECTIONS_KEY = 'message_collections';

/**
 * Get all collections for a user
 */
export const getUserCollections = (userId: string): Collection[] => {
    try {
        const collections = localStorage.getItem(COLLECTIONS_KEY);
        if (!collections) return [];

        const all: Collection[] = JSON.parse(collections);
        return all.filter(c => c.ownerId === userId || c.sharedWith.includes(userId));
    } catch (error) {
        console.error('Error getting collections:', error);
        return [];
    }
};

/**
 * Create new collection
 */
export const createCollection = (
    name: string,
    ownerId: string,
    description?: string,
    color?: string
): Collection => {
    try {
        const collection: Collection = {
            id: `col-${Date.now()}`,
            name,
            description,
            ownerId,
            isShared: false,
            sharedWith: [],
            messageIds: [],
            createdAt: new Date().toISOString(),
            color: color || '#3b82f6',
        };

        const all = getAllCollections();
        all.push(collection);
        localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(all));

        return collection;
    } catch (error) {
        console.error('Error creating collection:', error);
        throw error;
    }
};

/**
 * Add message to collection
 */
export const addMessageToCollection = (collectionId: string, messageId: string): void => {
    try {
        const all = getAllCollections();
        const collection = all.find(c => c.id === collectionId);

        if (collection && !collection.messageIds.includes(messageId)) {
            collection.messageIds.push(messageId);
            localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(all));
        }
    } catch (error) {
        console.error('Error adding message to collection:', error);
    }
};

/**
 * Remove message from collection
 */
export const removeMessageFromCollection = (collectionId: string, messageId: string): void => {
    try {
        const all = getAllCollections();
        const collection = all.find(c => c.id === collectionId);

        if (collection) {
            collection.messageIds = collection.messageIds.filter(id => id !== messageId);
            localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(all));
        }
    } catch (error) {
        console.error('Error removing message from collection:', error);
    }
};

/**
 * Share collection with users
 */
export const shareCollection = (collectionId: string, userIds: string[]): void => {
    try {
        const all = getAllCollections();
        const collection = all.find(c => c.id === collectionId);

        if (collection) {
            collection.isShared = true;
            collection.sharedWith = [...new Set([...collection.sharedWith, ...userIds])];
            localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(all));
        }
    } catch (error) {
        console.error('Error sharing collection:', error);
    }
};

/**
 * Delete collection
 */
export const deleteCollection = (collectionId: string, userId: string): void => {
    try {
        const all = getAllCollections();
        const filtered = all.filter(c => c.id !== collectionId || c.ownerId !== userId);
        localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting collection:', error);
    }
};

/**
 * Get all collections (private helper)
 */
const getAllCollections = (): Collection[] => {
    try {
        const collections = localStorage.getItem(COLLECTIONS_KEY);
        return collections ? JSON.parse(collections) : [];
    } catch (error) {
        return [];
    }
};

/**
 * Update collection
 */
export const updateCollection = (
    collectionId: string,
    updates: Partial<Omit<Collection, 'id' | 'ownerId' | 'createdAt'>>
): void => {
    try {
        const all = getAllCollections();
        const collection = all.find(c => c.id === collectionId);

        if (collection) {
            Object.assign(collection, updates);
            localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(all));
        }
    } catch (error) {
        console.error('Error updating collection:', error);
    }
};
