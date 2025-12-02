import { AxiosAdapter } from 'axios';
import { MOCK_USERS, MOCK_CHATS, MOCK_MESSAGES, MOCK_CALLS, MOCK_NOTIFICATIONS, MOCK_STATUSES, CURRENT_USER_ID } from './mockData';
import { Message, Chat } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAdapter: AxiosAdapter = async (config) => {
    await delay(300); // Simulate network latency

    const { url, method, data } = config;
    const parsedData = data ? JSON.parse(data) : null;

    // --- Users ---
    if (url === '/users/me' && method === 'get') {
        const user = MOCK_USERS.find(u => u.id === CURRENT_USER_ID);
        return { data: user, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url === '/users' && method === 'get') {
        return { data: MOCK_USERS, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url?.startsWith('/users/') && method === 'get' && !url.includes('/followers') && !url.includes('/following')) {
        const userId = url.split('/')[2];
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
            return { data: user, status: 200, statusText: 'OK', headers: {}, config };
        }
        return { data: null, status: 404, statusText: 'Not Found', headers: {}, config };
    }

    // Search users
    if (url === '/users/search' && method === 'get') {
        const { query } = config.params || {};
        const filteredUsers = MOCK_USERS.filter(u =>
            u.name.toLowerCase().includes(query.toLowerCase()) ||
            u.email?.toLowerCase().includes(query.toLowerCase())
        );
        return { data: filteredUsers, status: 200, statusText: 'OK', headers: {}, config };
    }

    // Follow user
    if (url === '/users/follow' && method === 'post') {
        const { targetUserId } = parsedData;
        const targetUser = MOCK_USERS.find(u => u.id === targetUserId);
        const currentUser = MOCK_USERS.find(u => u.id === CURRENT_USER_ID);

        if (targetUser && currentUser) {
            // Update target user's followers
            if (!targetUser.followers?.includes(CURRENT_USER_ID)) {
                targetUser.followers = [...(targetUser.followers || []), CURRENT_USER_ID];
                targetUser.followerCount = (targetUser.followerCount || 0) + 1;
                targetUser.isFollowedByCurrentUser = true;
            }

            // Update current user's following
            if (!currentUser.following?.includes(targetUserId)) {
                currentUser.following = [...(currentUser.following || []), targetUserId];
                currentUser.followingCount = (currentUser.followingCount || 0) + 1;
            }

            return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
        }
        return { data: { success: false }, status: 404, statusText: 'User not found', headers: {}, config };
    }

    // Unfollow user
    if (url === '/users/unfollow' && method === 'post') {
        const { targetUserId } = parsedData;
        const targetUser = MOCK_USERS.find(u => u.id === targetUserId);
        const currentUser = MOCK_USERS.find(u => u.id === CURRENT_USER_ID);

        if (targetUser && currentUser) {
            // Update target user's followers
            if (targetUser.followers?.includes(CURRENT_USER_ID)) {
                targetUser.followers = targetUser.followers.filter(id => id !== CURRENT_USER_ID);
                targetUser.followerCount = Math.max(0, (targetUser.followerCount || 1) - 1);
                targetUser.isFollowedByCurrentUser = false;
            }

            // Update current user's following
            if (currentUser.following?.includes(targetUserId)) {
                currentUser.following = currentUser.following.filter(id => id !== targetUserId);
                currentUser.followingCount = Math.max(0, (currentUser.followingCount || 1) - 1);
            }

            return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
        }
        return { data: { success: false }, status: 404, statusText: 'User not found', headers: {}, config };
    }

    // Get followers
    if (url?.match(/\/users\/.*\/followers/) && method === 'get') {
        const userId = url.split('/')[2];
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
            const followers = MOCK_USERS.filter(u => user.followers?.includes(u.id));
            return { data: followers, status: 200, statusText: 'OK', headers: {}, config };
        }
        return { data: [], status: 404, statusText: 'User not found', headers: {}, config };
    }

    // Get following
    if (url?.match(/\/users\/.*\/following/) && method === 'get') {
        const userId = url.split('/')[2];
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
            const following = MOCK_USERS.filter(u => user.following?.includes(u.id));
            return { data: following, status: 200, statusText: 'OK', headers: {}, config };
        }
        return { data: [], status: 404, statusText: 'User not found', headers: {}, config };
    }

    // --- Chats ---
    if (url === '/chats' && method === 'get') {
        const chatsWithMessages = MOCK_CHATS.map(chat => ({
            ...chat,
            messages: MOCK_MESSAGES[chat.id] || []
        }));
        return { data: chatsWithMessages, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url === '/chats' && method === 'post') {
        // Create new chat
        const { participantId } = parsedData;
        // Check if exists
        const existing = MOCK_CHATS.find(c =>
            c.type === 'individual' &&
            c.participants.includes(CURRENT_USER_ID) &&
            c.participants.includes(participantId)
        );

        if (existing) {
            return { data: existing, status: 200, statusText: 'OK', headers: {}, config };
        }

        // Create new
        const newChat: Chat = {
            id: `chat_${Date.now()}`,
            type: 'individual',
            participants: [CURRENT_USER_ID, participantId],
            messages: [],
            unreadCount: 0,
            isMuted: false,
            isPinned: false,
            isLocked: false,
            theme: 'default'
        };
        MOCK_CHATS.push(newChat);
        MOCK_MESSAGES[newChat.id] = [];

        return { data: newChat, status: 201, statusText: 'Created', headers: {}, config };
    }

    // --- Calls ---
    if (url === '/calls' && method === 'get') {
        return { data: MOCK_CALLS, status: 200, statusText: 'OK', headers: {}, config };
    }

    // --- Messages ---
    // Get messages for a chat
    if (url?.match(/\/chats\/.*\/messages/) && method === 'get') {
        const chatId = url.split('/')[2];
        const messages = MOCK_MESSAGES[chatId] || [];
        return { data: messages, status: 200, statusText: 'OK', headers: {}, config };
    }

    // Send message
    if (url?.match(/\/chats\/.*\/messages/) && method === 'post') {
        const chatId = url.split('/')[2];
        const { content, type, senderId } = parsedData;

        const newMessage: Message = {
            id: `msg_${Date.now()}`,
            content,
            senderId,
            timestamp: new Date().toISOString(),
            status: 'sent',
            messageType: type || 'text',
            reactions: {}
        };

        if (!MOCK_MESSAGES[chatId]) MOCK_MESSAGES[chatId] = [];
        MOCK_MESSAGES[chatId].push(newMessage);

        return { data: newMessage, status: 201, statusText: 'Created', headers: {}, config };
    }

    // --- Other Actions ---
    if (url?.match(/\/messages\/.*\/me/) && method === 'delete') {
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url?.match(/\/messages\/.*\/everyone/) && method === 'delete') {
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url?.match(/\/messages\/[^\/]+$/) && method === 'put') {
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url?.match(/\/chats\/.*\/messages/) && method === 'delete') {
        const chatId = url.split('/')[2];
        if (MOCK_MESSAGES[chatId]) MOCK_MESSAGES[chatId] = [];
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url?.match(/\/messages\/.*\/reactions/) && method === 'post') {
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url?.match(/\/messages\/.*\/vote/) && method === 'post') {
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url?.match(/\/chats\/.*\/theme/) && method === 'put') {
        const chatId = url.split('/')[2];
        const { theme, isReceived } = parsedData;
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            if (isReceived) {
                chat.receivedTheme = theme;
            } else {
                chat.theme = theme;
            }
            return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
        }
    }

    if (url?.match(/\/chats\/.*\/lock/) && method === 'put') {
        const chatId = url.split('/')[2];
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            chat.isLocked = !chat.isLocked;
            return { data: { success: true, isLocked: chat.isLocked }, status: 200, statusText: 'OK', headers: {}, config };
        }
    }

    if (url?.match(/\/chats\/.*\/vanish/) && method === 'put') {
        const chatId = url.split('/')[2];
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            chat.isVanishMode = !chat.isVanishMode;
            return { data: { success: true, isVanishMode: chat.isVanishMode }, status: 200, statusText: 'OK', headers: {}, config };
        }
    }

    // --- Conversations ---
    // Get all conversations for a user (sorted)
    if (url?.match(/\/conversations\/user\/.*\/all-sorted/) && method === 'get') {
        const userId = url.split('/')[3]; // Extract userId from URL

        // Convert MOCK_CHATS to Conversations format
        const conversations = MOCK_CHATS
            .filter(chat => chat.participants.includes(userId))
            .map(chat => {
                const messages = MOCK_MESSAGES[chat.id] || [];
                const lastMsg = messages[messages.length - 1];

                // Get other participant info for individual chats
                let otherUser = null;
                if (chat.type === 'individual') {
                    const otherUserId = chat.participants.find(p => p !== userId);
                    otherUser = MOCK_USERS.find(u => u.id === otherUserId);
                }

                return {
                    id: chat.id,
                    conversationType: chat.type === 'group' ? 'GROUP' : 'INDIVIDUAL',
                    otherUserId: chat.type === 'individual' ? chat.participants.find(p => p !== userId) : undefined,
                    otherUserName: otherUser?.name || chat.name,
                    otherUserAvatar: otherUser?.avatar || chat.avatar,
                    otherUserStatus: otherUser?.isOnline ? 'online' : 'offline',
                    lastMessage: lastMsg?.content || '',
                    lastMessageAt: lastMsg?.timestamp || new Date().toISOString(),
                    lastMessageType: lastMsg?.messageType?.toUpperCase() || 'TEXT',
                    lastMessageSentById: lastMsg?.senderId || '',
                    lastMessageSentByName: MOCK_USERS.find(u => u.id === lastMsg?.senderId)?.name || '',
                    unreadCount: chat.unreadCount || 0,
                    isPinned: chat.isPinned || false,
                    isMuted: chat.isMuted || false,
                    isLocked: chat.isLocked || false,
                    isVanishMode: chat.isVanishMode || false,
                    theme: chat.theme || 'default',
                    receivedTheme: chat.receivedTheme,
                    groupName: chat.type === 'group' ? chat.name : undefined,
                    groupAvatar: chat.type === 'group' ? chat.avatar : undefined,
                    groupMembers: chat.type === 'group' ? chat.participants : undefined
                };
            })
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

        return {
            data: { conversations },
            status: 200,
            statusText: 'OK',
            headers: {},
            config
        };
    }

    // --- Calls ---
    // Get call history
    if (url === '/calls/history' && method === 'get') {
        // Map MOCK_CALLS to include user information
        const callHistory = MOCK_CALLS.map(call => {
            const contact = MOCK_USERS.find(u => u.id === call.contactId);
            return {
                ...call,
                contactName: contact?.name,
                contactAvatar: contact?.avatar
            };
        });
        return { data: callHistory, status: 200, statusText: 'OK', headers: {}, config };
    }

    // --- Status ---
    if (url === '/status/contacts' && method === 'get') {
        const { userId } = config.params || {};
        // Filter statuses if needed, or just return all mock statuses
        // In a real app, we would filter by contacts of userId
        return { data: MOCK_STATUSES, status: 200, statusText: 'OK', headers: {}, config };
    }

    // Default fallback
    return { data: null, status: 404, statusText: 'Not Found', headers: {}, config };
};
