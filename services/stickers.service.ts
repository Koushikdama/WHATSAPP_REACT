/**
 * Sticker management service
 */

export interface Sticker {
    id: string;
    packId: string;
    imageUrl: string;
    tags: string[];
    isAnimated: boolean;
}

export interface StickerPack {
    id: string;
    name: string;
    author: string;
    stickers: Sticker[];
    isAnimated: boolean;
    isPublic: boolean;
    downloadCount: number;
    thumbnail: string;
    createdAt: string;
}

const STICKER_PACKS_KEY = 'sticker_packs';
const USER_STICKERS_KEY = 'user_stickers';

/**
 * Save default sticker packs
 */
const getDefaultStickerPacks = (): StickerPack[] => {
    return [
        {
            id: 'default-emoji',
            name: 'Classic Emoji',
            author: 'System',
            stickers: [
                { id: 'emoji-1', packId: 'default-emoji', imageUrl: '😀', tags: ['happy', 'smile'], isAnimated: false },
                { id: 'emoji-2', packId: 'default-emoji', imageUrl: '😂', tags: ['laugh', 'funny'], isAnimated: false },
                { id: 'emoji-3', packId: 'default-emoji', imageUrl: '❤️', tags: ['love', 'heart'], isAnimated: false },
                { id: 'emoji-4', packId: 'default-emoji', imageUrl: '👍', tags: ['thumbs', 'good'], isAnimated: false },
                { id: 'emoji-5', packId: 'default-emoji', imageUrl: '🎉', tags: ['party', 'celebrate'], isAnimated: false },
            ],
            isAnimated: false,
            isPublic: true,
            downloadCount: 0,
            thumbnail: '😀',
            createdAt: new Date().toISOString(),
        },
    ];
};

/**
 * Get all sticker packs
 */
export const getStickerPacks = (): StickerPack[] => {
    try {
        const packs = localStorage.getItem(STICKER_PACKS_KEY);
        if (!packs) return getDefaultStickerPacks();
        return JSON.parse(packs);
    } catch (error) {
        console.error('Error getting sticker packs:', error);
        return getDefaultStickerPacks();
    }
};

/**
 * Create custom sticker pack
 */
export const createStickerPack = (
    name: string,
    author: string,
    stickers: Omit<Sticker, 'id' | 'packId'>[]
): StickerPack => {
    try {
        const packId = `custom-${Date.now()}`;
        const pack: StickerPack = {
            id: packId,
            name,
            author,
            stickers: stickers.map((s, idx) => ({
                ...s,
                id: `${packId}-${idx}`,
                packId,
            })),
            isAnimated: stickers.some(s => s.isAnimated),
            isPublic: false,
            downloadCount: 0,
            thumbnail: stickers[0]?.imageUrl || '',
            createdAt: new Date().toISOString(),
        };

        const packs = getStickerPacks();
        packs.push(pack);
        localStorage.setItem(STICKER_PACKS_KEY, JSON.stringify(packs));

        return pack;
    } catch (error) {
        console.error('Error creating sticker pack:', error);
        throw error;
    }
};

/**
 * Add sticker to existing pack
 */
export const addStickerToPack = (
    packId: string,
    sticker: Omit<Sticker, 'id' | 'packId'>
): void => {
    try {
        const packs = getStickerPacks();
        const pack = packs.find(p => p.id === packId);

        if (pack) {
            const newSticker: Sticker = {
                ...sticker,
                id: `${packId}-${pack.stickers.length}`,
                packId,
            };
            pack.stickers.push(newSticker);
            localStorage.setItem(STICKER_PACKS_KEY, JSON.stringify(packs));
        }
    } catch (error) {
        console.error('Error adding sticker to pack:', error);
    }
};

/**
 * Delete sticker pack
 */
export const deleteStickerPack = (packId: string): void => {
    try {
        const packs = getStickerPacks();
        const filtered = packs.filter(p => p.id !== packId && p.id !== 'default-emoji');
        localStorage.setItem(STICKER_PACKS_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting sticker pack:', error);
    }
};

/**
 * Search stickers by tag
 */
export const searchStickers = (query: string): Sticker[] => {
    try {
        const packs = getStickerPacks();
        const allStickers = packs.flatMap(p => p.stickers);

        const lowerQuery = query.toLowerCase();
        return allStickers.filter(s =>
            s.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    } catch (error) {
        console.error('Error searching stickers:', error);
        return [];
    }
};
