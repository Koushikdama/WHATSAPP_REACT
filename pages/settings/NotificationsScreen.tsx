import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { useAppContext } from '../../context/AppContext';
import { getUserInfo, getNotifications } from '../../api';
import { User } from '../../types';
import { MOCK_USERS } from '../../services/mockData';
import { formatRelativeTime } from '../../utils/date/dateFormatter';
import { groupByTime } from '../../utils/date/groupByTime';
import { EmptyStateMessage } from '../../components/common';

type NotificationFilter = 'Follows' | 'Requests';

interface EnrichedNotification {
  id: string;
  type: string;
  fromUserId?: string;
  toUserId?: string;
  fromUser?: User | null;
  createdAt: any;
  read: boolean;
  message?: string;
  chatId?: string;
}

const NotificationsScreen = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();
  const [notifications, setNotifications] = useState<EnrichedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('Follows');
  const [processingNotifs, setProcessingNotifs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadNotifications = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        // Load notifications from API
        const notifs = await getNotifications(currentUser.id);

        // Enrich with user data
        const enrichedNotifs = notifs.map(notif => {
          const fromUser = MOCK_USERS.find(u => u.id === notif.fromUserId);
          return {
            ...notif,
            fromUser
          };
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    console.log('Mock delete notification', id);
  };

  const handleMarkAsRead = async (id: string) => {
    console.log('Mock mark as read', id);
  };

  const handleMarkAllAsRead = async () => {
    console.log('Mock mark all as read');
  };

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
    handleMarkAsRead(notif.id);

    switch (notif.type) {
      case 'message':
        if (notif.chatId) {
          navigate(`/chat/${notif.chatId}`);
        } else if (notif.fromUserId) {
          navigate(`/chat/${notif.fromUserId}`);
        }
        break;
      case 'follow_success':
      case 'follow_request_accepted':
        if (notif.fromUserId) {
          navigate(`/contact/${notif.fromUserId}`);
        }
        break;
      default:
        break;
    }
  };



  const getNotificationContent = (notif: EnrichedNotification) => {
    const userName = notif.fromUser?.name || 'Someone';

    switch (notif.type) {
      case 'follow_request':
        return {
          text: `${userName} requested to follow you`,
          action: 'follow_request',
          icon: '👤'
        };
      case 'follow_success':
        return {
          text: `${userName} started following you`,
          action: 'follow_back',
          icon: '✅'
        };
      case 'follow_request_accepted':
        return {
          text: `${userName} accepted your follow request`,
          action: 'none',
          icon: '🎉'
        };
      case 'message':
        return {
          text: `${userName} sent you a message`,
          action: 'none',
          icon: '💬'
        };
      default:
        return {
          text: notif.message || 'New notification',
          action: 'none',
          icon: '🔔'
        };
    }
  };



  // Filter notifications based on active filter
  const filteredNotifications = notifications.filter(notif => {
    switch (activeFilter) {
      case 'Follows':
        return ['follow_request', 'follow_success', 'follow_request_accepted'].includes(notif.type);
      case 'Requests':
        return notif.type === 'follow_request';
      default:
        return true;
    }
  });

  const { today, thisWeek, earlier } = groupByTime(filteredNotifications, (notif) => notif.createdAt);
  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = (notif: EnrichedNotification) => {
    const content = getNotificationContent(notif);
    const isProcessing = processingNotifs.has(notif.id);

    return (
      <div
        key={notif.id}
        onClick={() => handleNotificationClick(notif)}
        className={`flex items-start gap-3 p-4 hover:bg-[#202c33] cursor-pointer transition-all border-b border-gray-800 ${!notif.read ? 'bg-[#1a2730]' : ''
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
            <span className="text-gray-300">{content.text.substring(content.text.indexOf(' '))}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(notif.createdAt)}</p>

          {/* Action Buttons */}
          {content.action === 'follow_request' && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={(e) => handleAcceptFollow(e, notif)}
                disabled={isProcessing}
                className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={(e) => handleDeclineFollow(e, notif)}
                disabled={isProcessing}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}

          {content.action === 'follow_back' && notif.fromUser && (
            <button
              onClick={(e) => handleFollowBack(e, notif)}
              disabled={isProcessing}
              className="mt-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-1.5 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : notif.fromUser.isPrivate ? 'Request' : 'Follow Back'}
            </button>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => handleDelete(e, notif.id)}
          className="text-gray-500 hover:text-red-400 p-1 transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <SettingsLayout title="Notifications" onBack={() => navigate('/settings')}>
      <div className="flex-grow overflow-y-auto bg-[#111b21]">
        {/* Filter Tabs */}
        <div className="sticky top-0 z-10 bg-[#111b21] border-b border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {(['Follows', 'Requests'] as NotificationFilter[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeFilter === filter
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-primary text-sm font-semibold whitespace-nowrap hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyStateMessage
            icon="🔔"
            title="No notifications yet"
            message={
              activeFilter === 'Requests'
                ? "You don't have any follow requests"
                : "You don't have any follow notifications"
            }
          />
        ) : (
          <div>
            {/* Today */}
            {today.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#0d1418]">
                  <h3 className="text-sm font-semibold text-gray-400">Today</h3>
                </div>
                {today.map(renderNotification)}
              </div>
            )}

            {/* This Week */}
            {thisWeek.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#0d1418]">
                  <h3 className="text-sm font-semibold text-gray-400">This Week</h3>
                </div>
                {thisWeek.map(renderNotification)}
              </div>
            )}

            {/* Earlier */}
            {earlier.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#0d1418]">
                  <h3 className="text-sm font-semibold text-gray-400">Earlier</h3>
                </div>
                {earlier.map(renderNotification)}
              </div>
            )}
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};

export default NotificationsScreen;