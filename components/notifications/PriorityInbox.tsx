import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Filter, Check } from 'lucide-react';
import { SmartNotification, NotificationBundle, bundleNotifications, getNotificationSummary } from '../../services/notifications.service';

interface PriorityInboxProps {
    notifications: SmartNotification[];
    onNotificationClick: (chatId: string) => void;
    onMarkAsRead: (notificationIds: string[]) => void;
    onMarkAllAsRead: () => void;
}

const PriorityInbox: React.FC<PriorityInboxProps> = ({
    notifications,
    onNotificationClick,
    onMarkAsRead,
    onMarkAllAsRead,
}) => {
    const [showOnlyHighPriority, setShowOnlyHighPriority] = useState(false);
    const [bundles, setBundles] = useState<NotificationBundle[]>([]);

    useEffect(() => {
        const filtered = showOnlyHighPriority
            ? notifications.filter(n => n.priority === 'high')
            : notifications;

        const bundled = bundleNotifications(filtered);
        setBundles(bundled);
    }, [notifications, showOnlyHighPriority]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
        switch (priority) {
            case 'high':
                return 'text-red-400 bg-red-400/10';
            case 'medium':
                return 'text-yellow-400 bg-yellow-400/10';
            case 'low':
                return 'text-gray-400 bg-gray-400/10';
        }
    };

    const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
        switch (priority) {
            case 'high':
                return '🔴';
            case 'medium':
                return '🟡';
            case 'low':
                return '⚪';
        }
    };

    return (
        <div className="bg-[#111b21] h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                            <Bell className="h-5 w-5" />
                            <span>Priority Inbox</span>
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="flex items-center space-x-2 px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors text-sm"
                        >
                            <Check className="h-4 w-4" />
                            <span>Mark all read</span>
                        </button>
                    )}
                </div>

                {/* Filter */}
                <button
                    onClick={() => setShowOnlyHighPriority(!showOnlyHighPriority)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${showOnlyHighPriority
                            ? 'bg-red-400/20 text-red-400'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <Filter className="h-4 w-4" />
                    <span>{showOnlyHighPriority ? 'High Priority Only' : 'All Notifications'}</span>
                </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
                {bundles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <BellOff className="h-16 w-16 text-gray-600 mb-4" />
                        <p className="text-gray-400">No notifications</p>
                        <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {bundles.map((bundle) => (
                            <NotificationBundleItem
                                key={bundle.id}
                                bundle={bundle}
                                onClick={() => onNotificationClick(bundle.chatId)}
                                onMarkAsRead={() => {
                                    const notifIds = notifications
                                        .filter(n => n.chatId === bundle.chatId && !n.isRead)
                                        .map(n => n.id);
                                    onMarkAsRead(notifIds);
                                }}
                                getPriorityColor={getPriorityColor}
                                getPriorityIcon={getPriorityIcon}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const NotificationBundleItem: React.FC<{
    bundle: NotificationBundle;
    onClick: () => void;
    onMarkAsRead: () => void;
    getPriorityColor: (p: any) => string;
    getPriorityIcon: (p: any) => string;
}> = ({ bundle, onClick, onMarkAsRead, getPriorityColor, getPriorityIcon }) => {
    const isUnread = !bundle.lastNotification.isRead;
    const timeAgo = getTimeAgo(bundle.timestamp);

    return (
        <div
            className={`p-4 hover:bg-[#202c33] transition-colors cursor-pointer group ${isUnread ? 'bg-[#182229]' : ''
                }`}
            onClick={onClick}
        >
            <div className="flex items-start space-x-3">
                {/* Priority Indicator */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${getPriorityColor(bundle.priority)}`}>
                    {getPriorityIcon(bundle.priority)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate ${isUnread ? 'text-white' : 'text-gray-300'}`}>
                            {bundle.chatName}
                        </h3>
                        {isUnread && (
                            <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full ml-2"></div>
                        )}
                    </div>

                    <p className={`text-sm truncate ${isUnread ? 'text-gray-300' : 'text-gray-400'}`}>
                        {bundle.lastNotification.senderName}: {getNotificationSummary(bundle)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{timeAgo}</span>
                        {bundle.count > 1 && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                {bundle.count} messages
                            </span>
                        )}
                    </div>
                </div>

                {/* Mark as read button */}
                {isUnread && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead();
                        }}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 hover:bg-gray-700 rounded transition-all"
                        title="Mark as read"
                    >
                        <Check className="h-4 w-4 text-gray-400" />
                    </button>
                )}
            </div>
        </div>
    );
};

const getTimeAgo = (timestamp: string): string => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
};

export default PriorityInbox;
