import { User, Chat, Message, Status, Call, GroupInfo } from '../types';

export const MOCK_USERS: User[] = [
    {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
        about: 'Hey there! I am using WhatsApp.',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        phone: '+1234567890',
        isPrivate: false,
        followers: ['user2', 'user3'],
        following: ['user2', 'user4'],
        followerCount: 2,
        followingCount: 2,
        isFollowedByCurrentUser: false,
        isFollowingCurrentUser: false
    },
    {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
        about: 'Busy',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        phone: '+0987654321',
        isPrivate: true,
        followers: ['user1'],
        following: ['user1'],
        followerCount: 1,
        followingCount: 1,
        isFollowedByCurrentUser: true,
        isFollowingCurrentUser: true
    },
    {
        id: 'user3',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=random',
        about: 'At work',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        phone: '+1122334455',
        isPrivate: false,
        followers: ['user1'],
        following: [],
        followerCount: 1,
        followingCount: 0,
        isFollowedByCurrentUser: true,
        isFollowingCurrentUser: false
    },
    {
        id: 'user4',
        name: 'Bob Builder',
        email: 'bob@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Builder&background=random',
        about: 'Can we fix it?',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        phone: '+1231231234',
        isPrivate: false,
        followers: ['user1'],
        following: [],
        followerCount: 1,
        followingCount: 0,
        isFollowedByCurrentUser: true,
        isFollowingCurrentUser: false
    },
    {
        id: 'user5',
        name: 'Charlie Chef',
        email: 'charlie@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Charlie+Chef&background=random',
        about: 'Cooking something good',
        isOnline: false,
        lastSeen: new Date(Date.now() - 7200000).toISOString(),
        phone: '+3213214321',
        isPrivate: true,
        followers: [],
        following: [],
        followerCount: 0,
        followingCount: 0,
        isFollowedByCurrentUser: false,
        isFollowingCurrentUser: false
    }
];

export const CURRENT_USER_ID = 'user1';

export const MOCK_CHATS: Chat[] = [
    {
        id: 'chat1',
        participants: ['user1', 'user2'],
        unreadCount: 2,
        messages: [],
        type: 'individual',
        name: 'Jane Smith',
        isPinned: false,
        isMuted: false,
        isLocked: false,
        theme: 'default'
    },
    {
        id: 'chat2',
        participants: ['user1', 'user3'],
        unreadCount: 0,
        messages: [],
        type: 'individual',
        name: 'Alice Johnson',
        isPinned: true,
        isMuted: false,
        isLocked: false,
        theme: 'ocean'
    },
    {
        id: 'chat3',
        participants: ['user1', 'user4', 'user5'],
        unreadCount: 5,
        messages: [],
        type: 'group',
        name: 'Weekend Plans',
        avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop',
        isPinned: false,
        isMuted: true,
        isLocked: false,
        theme: 'sunset'
    },
    {
        id: 'chat4',
        participants: ['user1', 'user4'],
        unreadCount: 1,
        messages: [],
        type: 'individual',
        name: 'Bob Builder',
        isPinned: false,
        isMuted: false,
        isLocked: false,
        theme: 'lush'
    }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
    'chat1': [
        {
            id: 'msg1',
            content: 'Hi Jane!',
            senderId: 'user1',
            timestamp: new Date(Date.now() - 10000000).toISOString(),
            status: 'read',
            messageType: 'text',
            reactions: {}
        },
        {
            id: 'msg2',
            content: 'Hey John, how are you?',
            senderId: 'user2',
            timestamp: new Date(Date.now() - 9000000).toISOString(),
            status: 'read',
            messageType: 'text',
            reactions: {}
        },
        {
            id: 'msg3',
            content: 'I am good. Are we still on for tomorrow?',
            senderId: 'user1',
            timestamp: new Date(Date.now() - 8000000).toISOString(),
            status: 'delivered',
            messageType: 'text',
            reactions: {}
        },
        {
            id: 'msg4',
            content: 'Yes, absolutely!',
            senderId: 'user2',
            timestamp: new Date(Date.now() - 7000000).toISOString(),
            status: 'sent',
            messageType: 'text',
            reactions: {}
        },
        {
            id: 'msg5',
            content: 'See you tomorrow!',
            senderId: 'user2',
            timestamp: new Date().toISOString(),
            status: 'sent',
            messageType: 'text',
            reactions: {}
        }
    ],
    'chat2': [
        {
            id: 'msg6',
            content: 'Meeting at 3 PM',
            senderId: 'user1',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            status: 'read',
            messageType: 'text',
            reactions: {}
        }
    ],
    'chat3': [
        {
            id: 'msg7',
            content: 'Hey guys, any plans for the weekend?',
            senderId: 'user4',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'read',
            messageType: 'text',
            reactions: { '👍': ['user1'] }
        },
        {
            id: 'msg8',
            content: 'Check out this place!',
            senderId: 'user5',
            timestamp: new Date(Date.now() - 3500000).toISOString(),
            status: 'read',
            messageType: 'image',
            fileInfo: {
                url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
                name: 'camping.jpg',
                size: '1.2 MB'
            },
            reactions: { '😮': ['user1', 'user4'] }
        },
        {
            id: 'msg9',
            content: 'Looks amazing! I am in.',
            senderId: 'user1',
            timestamp: new Date(Date.now() - 3400000).toISOString(),
            status: 'read',
            messageType: 'text',
            reactions: {}
        }
    ],
    'chat4': [
        {
            id: 'msg10',
            content: 'Here are the site photos',
            senderId: 'user4',
            timestamp: new Date(Date.now() - 10000000).toISOString(),
            status: 'read',
            messageType: 'text',
            reactions: {}
        },
        {
            id: 'msg11',
            content: '',
            senderId: 'user4',
            timestamp: new Date(Date.now() - 9900000).toISOString(),
            status: 'read',
            messageType: 'image',
            fileInfo: {
                url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
                name: 'construction.jpg',
                size: '2.5 MB'
            },
            reactions: {}
        },
        {
            id: 'msg12',
            content: 'Also the updated blueprints',
            senderId: 'user4',
            timestamp: new Date(Date.now() - 9800000).toISOString(),
            status: 'read',
            messageType: 'document',
            fileInfo: {
                url: '#',
                name: 'blueprints_v2.pdf',
                size: '4.5 MB'
            },
            reactions: {}
        },
        {
            id: 'msg13',
            content: 'Listen to this update',
            senderId: 'user4',
            timestamp: new Date(Date.now() - 9700000).toISOString(),
            status: 'read',
            messageType: 'voice',
            duration: '0:45',
            reactions: {}
        }
    ]
};


// MOCK_STATUSES commented out - now using Firebase for status storage
export const MOCK_STATUSES: Status[] = [
    {
        id: 'status1',
        userId: 'user2',
        updates: [
            {
                id: 'update1',
                url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a',
                type: 'image',
                timestamp: new Date().toISOString(),
                caption: 'Beautiful view!'
            }
        ],
        expiresAt: new Date(Date.now() + 86400000).toISOString()
    }
];

export const MOCK_CALLS: Call[] = [
    {
        id: 'call1',
        callId: 'call1',
        contactId: 'user2',
        type: 'incoming',
        callType: 'AUDIO',
        status: 'MISSED',
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        initiatorId: 'user2',
        participantIds: ['user1', 'user2'],
        duration: 0,
        durationFormatted: '0:00'
    }
];

export interface MockNotification {
    id: string;
    type: 'follow_request' | 'follow_success' | 'follow_request_accepted';
    fromUserId: string;
    toUserId: string;
    createdAt: string;
    read: boolean;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
    {
        id: 'notif1',
        type: 'follow_request',
        fromUserId: 'user2',
        toUserId: 'user1',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: false
    },
    {
        id: 'notif2',
        type: 'follow_success',
        fromUserId: 'user3',
        toUserId: 'user1',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        read: false
    },
    {
        id: 'notif3',
        type: 'follow_request_accepted',
        fromUserId: 'user2',
        toUserId: 'user1',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        read: true
    }
];