/**
 * Enhanced status service with music, interactive stickers, and highlights
 */

import { StatusUpdate, InteractiveSticker } from '../types';

const STATUS_HIGHLIGHTS_KEY = 'status_highlights';
const CLOSE_FRIENDS_KEY = 'close_friends';

/**
 * Add music to status
 */
export const addMusicToStatus = (
    status: StatusUpdate,
    title: string,
    artist: string,
    albumArt?: string,
    previewUrl?: string
): StatusUpdate => {
    return {
        ...status,
        music: {
            title,
            artist,
            albumArt,
            previewUrl,
        },
    };
};

/**
 * Add interactive sticker to status
 */
export const addInteractiveSticker = (
    status: StatusUpdate,
    sticker: InteractiveSticker
): StatusUpdate => {
    return {
        ...status,
        interactiveStickers: [...(status.interactiveStickers || []), sticker],
    };
};

/**
 * Save status as highlight
 */
export const saveAsHighlight = (
    status: StatusUpdate,
    category: string
): void => {
    try {
        const highlights = getHighlights(status.userId);

        const highlight: StatusUpdate = {
            ...status,
            isHighlight: true,
            highlightCategory: category,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        };

        highlights.push(highlight);
        localStorage.setItem(
            `${STATUS_HIGHLIGHTS_KEY}_${status.userId}`,
            JSON.stringify(highlights)
        );
    } catch (error) {
        console.error('Error saving highlight:', error);
    }
};

/**
 * Get user's highlights
 */
export const getHighlights = (userId: string): StatusUpdate[] => {
    try {
        const data = localStorage.getItem(`${STATUS_HIGHLIGHTS_KEY}_${userId}`);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting highlights:', error);
        return [];
    }
};

/**
 * Get highlights grouped by category
 */
export const getHighlightsByCategory = (userId: string): Record<string, StatusUpdate[]> => {
    const highlights = getHighlights(userId);
    const grouped: Record<string, StatusUpdate[]> = {};

    highlights.forEach(h => {
        const category = h.highlightCategory || 'Uncategorized';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(h);
    });

    return grouped;
};

/**
 * Delete highlight
 */
export const deleteHighlight = (userId: string, statusId: string): void => {
    try {
        const highlights = getHighlights(userId);
        const filtered = highlights.filter(h => h.id !== statusId);
        localStorage.setItem(
            `${STATUS_HIGHLIGHTS_KEY}_${userId}`,
            JSON.stringify(filtered)
        );
    } catch (error) {
        console.error('Error deleting highlight:', error);
    }
};

/**
 * Get close friends list
 */
export const getCloseFriends = (userId: string): string[] => {
    try {
        const data = localStorage.getItem(`${CLOSE_FRIENDS_KEY}_${userId}`);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting close friends:', error);
        return [];
    }
};

/**
 * Add close friend
 */
export const addCloseFriend = (userId: string, friendId: string): void => {
    try {
        const friends = getCloseFriends(userId);
        if (!friends.includes(friendId)) {
            friends.push(friendId);
            localStorage.setItem(
                `${CLOSE_FRIENDS_KEY}_${userId}`,
                JSON.stringify(friends)
            );
        }
    } catch (error) {
        console.error('Error adding close friend:', error);
    }
};

/**
 * Remove close friend
 */
export const removeCloseFriend = (userId: string, friendId: string): void => {
    try {
        const friends = getCloseFriends(userId);
        const filtered = friends.filter(id => id !== friendId);
        localStorage.setItem(
            `${CLOSE_FRIENDS_KEY}_${userId}`,
            JSON.stringify(filtered)
        );
    } catch (error) {
        console.error('Error removing close friend:', error);
    }
};

/**
 * Check if user can view status
 */
export const canViewStatus = (
    status: StatusUpdate,
    viewerId: string,
    userId: string
): boolean => {
    // Own status - always can view
    if (status.userId === viewerId) return true;

    // Close friends only status
    if (status.closeFriendsOnly) {
        const closeFriends = getCloseFriends(status.userId);
        return closeFriends.includes(viewerId);
    }

    // Public status
    return true;
};

/**
 * Record status view
 */
export const recordStatusView = (
    status: StatusUpdate,
    viewerId: string,
    viewerName: string
): StatusUpdate => {
    const viewerList = status.viewerList || [];

    // Don't record duplicate views
    if (viewerList.some(v => v.userId === viewerId)) {
        return status;
    }

    viewerList.push({
        userId: viewerId,
        userName: viewerName,
        viewedAt: new Date().toISOString(),
    });

    return {
        ...status,
        views: [...(status.views || []), viewerId],
        viewerList,
    };
};

/**
 * Get interactive sticker results
 */
export const getStickerResults = (sticker: InteractiveSticker): any => {
    switch (sticker.type) {
        case 'poll':
            const pollData = sticker.data as any;
            const totalVotes = Object.values(pollData.votes).reduce((sum: number, count: any) => sum + count, 0);
            return { totalVotes, votes: pollData.votes };

        case 'question':
            const questionData = sticker.data as any;
            return { responseCount: questionData.responses.length, responses: questionData.responses };

        case 'quiz':
            const quizData = sticker.data as any;
            const correct = Object.values(quizData.responses).filter((ans: any) => ans === quizData.correctAnswer).length;
            return { totalResponses: Object.keys(quizData.responses).length, correctCount: correct };

        case 'slider':
            const sliderData = sticker.data as any;
            const values = Object.values(sliderData.responses) as number[];
            const average = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            return { average, responseCount: values.length };

        default:
            return {};
    }
};
