import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { getNotifications, getUserInfo } from '../../api';
import { User, Notification } from '../../types';
import SettingsLayout from '../../components/layout/SettingsLayout';
import FollowButton from '../../components/ui/FollowButton';

const ActivityScreen = () => {
    const { currentUser } = useAppContext();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [userCache, setUserCache] = useState<Record<string, User>>({});

    // Fetch user details for notifications
    const getUserDetails = async (userId: string): Promise<User | null> => {
        if (userCache[userId]) return userCache[userId];

        try {
            const user = await getUserInfo(userId);
            if (user) {
                setUserCache(prev => ({ ...prev, [userId]: user }));
                return user;
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
        return null;
    };

    // Fetch notifications
    useEffect(() => {
        const loadNotifications = async () => {
            if (!currentUser) return;

            setLoading(true);
            try {
                const notifs = await getNotifications(currentUser.id);
                setNotifications(notifs);
            } catch (error) {
                console.error('Failed to load notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [currentUser]);

    const handleAcceptFollowRequest = async (fromId: string) => {
        console.log('Mock accept follow request', fromId);
    };

    const handleRejectFollowRequest = async (fromId: string) => {
        console.log('Mock reject follow request', fromId);
    };

    const handleMarkAsRead = async (notificationId: string) => {
        console.log('Mock mark as read', notificationId);
    };

    const handleDeleteNotification = async (notificationId: string) => {
        console.log('Mock delete notification', notificationId);
    };

    const handleMarkAllAsRead = async () => {
        console.log('Mock mark all as read');
    };

    const formatTimestamp = (timestamp: any): string => {
        if (!timestamp) return '';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
        return `${Math.floor(diffInSeconds / 604800)}w`;
    };

    const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
        const [fromUser, setFromUser] = useState<User | null>(null);

        useEffect(() => {
            getUserDetails(notification.fromUserId).then(setFromUser);
        }, [notification.fromUserId]);

        if (!fromUser) {
            return (
                <div className="flex items-center justify-between py-3 px-4 animate-pulse">
                    <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gray-700"></div>
                        <div className="h-4 w-32 bg-gray-700 rounded"></div>
                    </div>
                </div>
            );
        }

        const renderNotificationContent = () => {
            switch (notification.type) {
                case 'follow_request':
                    return (
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3 flex-1">
                                <div className="h-12 w-12 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                    <img src={fromUser.avatar} alt={fromUser.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-white truncate">
                                        {fromUser.name}
                                    </p>
                                    <p className="text-xs text-gray-400">Requested to follow you</p>
                                </div>
                            </div>
                            <div className="flex space-x-2 ml-3">
                                <button
                                    onClick={() => handleAcceptFollowRequest(notification.fromUserId)}
                                    className="bg-primary text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-primary-hover transition-colors whitespace-nowrap"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => handleRejectFollowRequest(notification.fromUserId)}
                                    className="bg-gray-700 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-600 transition-colors whitespace-nowrap"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );

                case 'follow_accepted':
                    return (
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                    <img src={fromUser.avatar} alt={fromUser.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="text-sm flex-1 min-w-0">
                                    <div>
                                        <span className="font-semibold text-white">{fromUser.name}</span>
                                        <span className="text-gray-300 ml-1">accepted your follow request.</span>
                                    </div>
                                    <span className="text-gray-500 text-xs">{formatTimestamp(notification.createdAt)}</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <FollowButton
                                    user={fromUser}
                                />
                            </div>
                        </div>
                    );

                case 'new_follower':
                    return (
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                    <img src={fromUser.avatar} alt={fromUser.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="text-sm flex-1 min-w-0">
                                    <div>
                                        <span className="font-semibold text-white">{fromUser.name}</span>
                                        <span className="text-gray-300 ml-1">started following you.</span>
                                    </div>
                                    <span className="text-gray-500 text-xs">{formatTimestamp(notification.createdAt)}</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <FollowButton
                                    user={fromUser}
                                />
                            </div>
                        </div>
                    );

                case 'status_reaction':
                    return (
                        <div className="flex items-center space-x-3 py-2">
                            <div className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                <img src={fromUser.avatar} alt={fromUser.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="text-sm flex-1 min-w-0">
                                <div>
                                    <span className="font-semibold text-white">{fromUser.name}</span>
                                    <span className="text-gray-300 ml-1">reacted {notification.metadata?.emoji || '❤️'} to your status.</span>
                                </div>
                                <span className="text-gray-500 text-xs">{formatTimestamp(notification.createdAt)}</span>
                            </div>
                        </div>
                    );

                case 'message':
                    return (
                        <div
                            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 -mx-4 px-4 py-2 rounded-lg transition-colors"
                            onClick={() => notification.metadata?.chatId && navigate(`/chat/${notification.metadata.chatId}`)}
                        >
                            <div className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                <img src={fromUser.avatar} alt={fromUser.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="text-sm flex-1 min-w-0">
                                <div>
                                    <span className="font-semibold text-white">{fromUser.name}</span>
                                    <span className="text-gray-300 ml-1">sent you a message.</span>
                                </div>
                                {notification.metadata?.messageContent && (
                                    <p className="text-gray-400 text-xs mt-1 truncate">{notification.metadata.messageContent}</p>
                                )}
                                <span className="text-gray-500 text-xs">{formatTimestamp(notification.createdAt)}</span>
                            </div>
                        </div>
                    );

                default:
                    return null;
            }
        };

        return (
            <div
                className={`px-4 ${!notification.read ? 'bg-[#1a2730]' : ''} hover:bg-[#202c33] transition-colors`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
                {renderNotificationContent()}
            </div>
        );
    };

    if (!currentUser) {
        return (
            <SettingsLayout title="Activity" onBack={() => navigate('/')}>
                <div className="flex items-center justify-center h-full text-gray-400">
                    Please log in to view notifications
                </div>
            </SettingsLayout>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;
    const followRequests = notifications.filter(n => n.type === 'follow_request');
    const otherNotifications = notifications.filter(n => n.type !== 'follow_request');

    return (
        <SettingsLayout title="Activity" onBack={() => navigate('/')}>
            <div className="bg-[#111b21] min-h-screen text-white">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 px-4">
                        <div className="text-6xl mb-4">🔔</div>
                        <p className="text-lg text-gray-400 mb-2">No notifications yet</p>
                        <p className="text-sm text-gray-500">When people interact with you, you'll see it here</p>
                    </div>
                ) : (
                    <>
                        {/* Header with mark all as read */}
                        {unreadCount > 0 && (
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                                <p className="text-sm text-gray-400">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-primary text-sm font-semibold hover:underline"
                                >
                                    Mark all as read
                                </button>
                            </div>
                        )}

                        {/* Follow Requests Section */}
                        {followRequests.length > 0 && (
                            <div className="border-b border-gray-800">
                                <h3 className="text-base font-semibold px-4 pt-4 pb-2">Follow Requests</h3>
                                <div className="divide-y divide-gray-800">
                                    {followRequests.map((notification) => (
                                        <NotificationItem key={notification.id} notification={notification} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Other Notifications */}
                        {otherNotifications.length > 0 && (
                            <div>
                                <h3 className="text-base font-semibold px-4 pt-4 pb-2">Recent Activity</h3>
                                <div className="divide-y divide-gray-800">
                                    {otherNotifications.map((notification) => (
                                        <NotificationItem key={notification.id} notification={notification} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </SettingsLayout>
    );
};

export default ActivityScreen;