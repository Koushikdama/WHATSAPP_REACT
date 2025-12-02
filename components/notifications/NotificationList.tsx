import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { getNotifications, getUserInfo } from '../../api';
import { User } from '../../types';
import { MOCK_USERS } from '../../services/mockData';

interface EnrichedNotification {
    id: string;
    type: string;
    fromUserId?: string;
    toUserId?: string;
    fromUser?: User | null;
    createdAt: any;
    read: boolean;
}

const NotificationList = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    const [notifications, setNotifications] = useState<EnrichedNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingNotifs, setProcessingNotifs] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadNotifications = async () => {
            if (!currentUser) return;

            setLoading(true);
            try {
                const notifs = await getNotifications(currentUser.id);
                const enrichedNotifs = notifs.map(notif => {
                    const fromUser = MOCK_USERS.find(u => u.id === notif.fromUserId);
                    return { ...notif, fromUser };
                });
                setNotifications(enrichedNotifs);
            } catch (error) {
                console.error('Failed to load notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [currentUser]);

    const handleAcceptFollow = async (e: React.MouseEvent, notif: EnrichedNotification) => {
        e.stopPropagation();
        console.log('Mock accept follow', notif.id);
    };

    const handleDeclineFollow = async (e: React.MouseEvent, notif: EnrichedNotification) => {
        e.stopPropagation();
        console.log('Mock decline follow', notif.id);
    };

    const handleFollowBack = async (e: React.MouseEvent, notif: EnrichedNotification) => {
        e.stopPropagation();
        console.log('Mock follow back', notif.id);
    };

    const handleNotificationClick = (notif: EnrichedNotification) => {
        if (notif.type === 'follow_success' || notif.type === 'follow_request_accepted') {
            if (notif.fromUserId) {
                navigate(`/contact/${notif.fromUserId}`);
            }
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
        return `${Math.floor(diffInSeconds / 604800)}w`;
    };

    const getNotificationContent = (notif: EnrichedNotification) => {
        const userName = notif.fromUser?.name || 'Someone';

        switch (notif.type) {
            case 'follow_request':
                return { text: `requested to follow you`, action: 'follow_request', icon: '👤' };
            case 'follow_success':
                return { text: `started following you`, action: 'follow_back', icon: '✅' };
            case 'follow_request_accepted':
                return { text: `accepted your follow request`, action: 'none', icon: '🎉' };
            default:
                return { text: 'New notification', action: 'none', icon: '🔔' };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-lg font-semibold text-white mb-2">No notifications</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                    You don't have any notifications yet
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto">
            {notifications.map(notif => {
                const content = getNotificationContent(notif);
                const isProcessing = processingNotifs.has(notif.id);

                return (
                    <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`flex items-start gap-3 p-3 hover:bg-[#202c33] cursor-pointer transition-all border-b border-gray-800 ${!notif.read ? 'bg-[#1a2730]' : ''
                            }`}
                    >
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                            {notif.fromUser?.avatar ? (
                                <img
                                    src={notif.fromUser.avatar}
                                    alt={notif.fromUser.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                                    {content.icon}
                                </div>
                            )}
                            {!notif.read && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-[#111b21]"></div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white leading-relaxed">
                                <span className="font-semibold">{notif.fromUser?.name || 'Someone'}</span>{' '}
                                <span className="text-gray-300">{content.text}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{formatTime(notif.createdAt)}</p>

                            {/* Action Buttons */}
                            {content.action === 'follow_request' && (
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={(e) => handleAcceptFollow(e, notif)}
                                        disabled={isProcessing}
                                        className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Processing...' : 'Confirm'}
                                    </button>
                                    <button
                                        onClick={(e) => handleDeclineFollow(e, notif)}
                                        disabled={isProcessing}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}

                            {content.action === 'follow_back' && notif.fromUser && (
                                <button
                                    onClick={(e) => handleFollowBack(e, notif)}
                                    disabled={isProcessing}
                                    className="mt-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isProcessing ? 'Processing...' : notif.fromUser.isPrivate ? 'Request' : 'Follow Back'}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default NotificationList;