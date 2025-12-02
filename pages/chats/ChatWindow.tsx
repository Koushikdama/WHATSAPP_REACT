import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import MessageBubble from '../../components/chat/MessageBubble';
import MessageComposer from '../../components/chat/MessageComposer';
import { ThreeDotsIcon, SearchIcon, VideoCallIcon, PhoneIcon, BackArrowIcon, CloseIcon, TrashIcon, LockIcon } from '../../components/icons';
import useResponsive from '../../hooks/useResponsive';
import { useChat } from '../../hooks/useChat';
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from './WelcomeScreen';
import { Message, User, GroupInfo } from '../../types';
import { getIndividualMessages, getGroupMessages, getUserInfo, getGroupInfo } from '../../api';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import MediaCarouselBubble from '../../components/chat/ImageCarouselBubble';
import DateSeparator from '../../components/ui/DateSeparator';
import { getISODate } from '../../utils/date/dateFormatter';
import { THEMES } from '../../utils/theme/themes';

interface ChatWindowProps {
  onHeaderClick: (id?: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onHeaderClick }) => {
  const { id } = useParams<{ id: string }>();
  const {
    currentUser,
    conversations,
    themeSettings,
    showBrowserNotification,
    deleteMessage,
    initiateCall,
    securityNotificationsEnabled,
    lockedDates,
    unlockedDatesForSession,
    toggleDailyLock,
    promptAndToggleVanishMode,
    clearUnlockedDatesForSession,
    passcodeSettings,
    clearChat,
    setSelectedChat,
    toggleChatLock,
  } = useAppContext();
  const isDesktop = useResponsive();
  const navigate = useNavigate();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Find chat by ID or by participant (if ID is a userId) - optimized with useMemo
  const chat = useMemo(() =>
    conversations.find(c => c.id === id) ||
    conversations.find(c => c.conversationType === 'INDIVIDUAL' && c.participants?.includes(id || ''))
    , [conversations, id]);

  const { messages, loading, sendMessage: sendChatMessage } = useChat(chat?.id || null);
  const [contactInfo, setContactInfo] = useState<User | null>(null);
  const [groupDetails, setGroupDetails] = useState<GroupInfo | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showingReactions, setShowingReactions] = useState<string | null>(null); // Track which message shows reactions

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isBulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [isClearChatConfirmOpen, setClearChatConfirmOpen] = useState(false);

  // Search & Filter State
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const isVanishMode = chat?.isVanishMode || false;

  // Real-time message subscription handled by useChat hook


  const handleEditComplete = useCallback(() => {
    setEditingMessage(null);
  }, []);

  const handleEnterSelectionMode = useCallback((messageIds: string[]) => {
    setSelectionMode(true);
    setSelectedMessages(messageIds);
  }, []);

  const handleToggleSelection = useCallback((messageIds: string[]) => {
    setSelectedMessages(prev => {
      const isAlreadySelected = messageIds.some(id => prev.includes(id));
      if (isAlreadySelected) {
        return prev.filter(id => !messageIds.includes(id));
      } else {
        return [...prev, ...messageIds];
      }
    });
  }, []);

  const handleExitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedMessages([]);
  }, []);

  useEffect(() => {
    if (selectionMode && selectedMessages.length === 0) {
      handleExitSelectionMode();
    }
  }, [selectedMessages, selectionMode, handleExitSelectionMode]);

  const handleBulkDelete = useCallback(() => {
    setBulkDeleteConfirmOpen(true);
  }, []);

  const confirmBulkDelete = useCallback(async () => {
    if (!chat) return;
    const promises = selectedMessages.map(msgId => deleteMessage(chat.id, msgId, 'everyone', chat.conversationType));
    await Promise.all(promises);

    setBulkDeleteConfirmOpen(false);
    handleExitSelectionMode();
  }, [chat, selectedMessages, deleteMessage, handleExitSelectionMode]);

  const confirmClearChat = useCallback(async () => {
    if (!chat) return;
    await clearChat(chat.id);
    // Messages will be cleared via listener if backend deletes them
    setClearChatConfirmOpen(false);
  }, [chat, clearChat]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!chat || !currentUser) return;

      setContactInfo(null);
      setGroupDetails(null);

      if (chat.conversationType === 'INDIVIDUAL') {
        try {
          // Determine the correct user ID to fetch
          // If chat.id is a user ID (which it should be for individual chats in the UI), use it.
          // If it's a document ID, find the other participant.
          let targetUserId = chat.id;

          // If the ID looks like a Firestore document ID (usually longer/random) and not the user ID we expect
          // or if we simply want to be sure, we can check participants.
          if (chat.participants && chat.participants.length === 2) {
            const otherId = chat.participants.find(p => p !== currentUser.id);
            if (otherId) targetUserId = otherId;
          }

          const info = await getUserInfo(targetUserId);
          setContactInfo(info);
        } catch (e) { console.error(e); }
      } else {
        try {
          const info = await getGroupInfo(chat.id, currentUser.id);
          setGroupDetails(info);
        } catch (e) { console.error(e); }
      }
    };

    // Set selectedChat in context so MessageComposer can access it
    setSelectedChat(chat || null);

    fetchDetails();
    setReplyingTo(null);
    setEditingMessage(null);
    handleExitSelectionMode();

    // Auto-relock dates when leaving chat
    return () => {
      if (chat) {
        clearUnlockedDatesForSession(chat.id);
      }
      // Clear selected chat when leaving
      setSelectedChat(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, chat, currentUser]);

  useEffect(() => {
    if (!selectionMode) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectionMode]);

  const handleMessageSent = useCallback((newMessage: Message) => {
    // Call Firebase service via hook with complete message data
    sendChatMessage(
      newMessage.senderId,
      newMessage.content,
      newMessage.messageType,
      newMessage.fileInfo,
      newMessage // Pass entire message object with reply fields
    );
  }, [sendChatMessage]);

  const handleActionSuccess = useCallback(async () => {
    // Actions like reactions are handled via real-time listener
  }, []);

  const handleBackNavigation = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Format lastSeen to handle Firestore Timestamp
  const formatLastSeen = useCallback((lastSeen: any): string => {
    if (!lastSeen) return 'last seen recently';

    // Check if it's a Firestore Timestamp object
    if (lastSeen && typeof lastSeen === 'object' && 'seconds' in lastSeen) {
      const date = new Date(lastSeen.seconds * 1000);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'last seen just now';
      if (diffInSeconds < 3600) return `last seen ${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `last seen ${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `last seen ${Math.floor(diffInSeconds / 86400)} days ago`;
    }

    // If it's already a string
    if (typeof lastSeen === 'string') return lastSeen;

    return 'last seen recently';
  }, []);

  if (!chat || !currentUser) {
    return <WelcomeScreen />;
  }

  const currentThemeName = chat.theme || themeSettings.themeColor.name || 'default';

  const name = chat.name;
  const avatar = chat.profileImage;
  const status = chat.conversationType === 'GROUP'
    ? `${groupDetails?.memberCount || '...'} participants`
    : (contactInfo?.isOnline ? 'online' : formatLastSeen(contactInfo?.lastSeen));

  // For individual chats, get the other user's ID for contact info navigation
  const userIdForContactInfo = chat.conversationType === 'INDIVIDUAL'
    ? (chat.participants?.find(p => p !== currentUser?.id) || contactInfo?.id || chat.id)
    : chat.id;

  const currentTheme = THEMES[(chat?.theme || 'default') as keyof typeof THEMES] || THEMES.default;
  const receivedTheme = chat?.receivedTheme ? THEMES[chat.receivedTheme as keyof typeof THEMES] : undefined;
  const bubbleColor = currentTheme.bubbleColor;
  const receivedBubbleColor = receivedTheme?.bubbleColor;
  const backgroundStyle = {
    backgroundImage: `url(${themeSettings.chatBackground})`,
    backgroundColor: isVanishMode ? '#0b141a' : 'transparent',
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    // Only handle single clicks
    if (e.detail !== 1) return;
    onHeaderClick(userIdForContactInfo);
  };

  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Double-click - toggle chat lock
    if (chat) toggleChatLock(chat.id);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveFilter('all');
  };

  const renderMessagesWithSeparators = () => {
    const elements: React.ReactNode[] = [];
    let lastDate: string | null = null;
    const dailyLocks = lockedDates[chat.id] || [];
    const sessionUnlocks = unlockedDatesForSession[chat.id] || [];

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const filteredMessages = messages
      .filter(msg => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'link') return msg.messageType === 'text' && urlRegex.test(msg.content);
        return msg.messageType === activeFilter;
      })
      .filter(msg => {
        if (!searchTerm) return true;
        // Search content and also file name for documents
        if (msg.messageType === 'document' && msg.fileInfo?.name) {
          return msg.fileInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return msg.content.toLowerCase().includes(searchTerm.toLowerCase());
      });

    for (let i = 0; i < filteredMessages.length; i++) {
      const msg = filteredMessages[i];
      const msgDate = getISODate(msg.timestamp);
      const isDayPermanentlyLocked = dailyLocks.includes(msgDate);
      const isDayTemporarilyUnlocked = sessionUnlocks.includes(msgDate);

      if (msgDate !== lastDate) {
        elements.push(
          <DateSeparator
            key={`date-${msgDate}`}
            timestamp={msg.timestamp}
            isLocked={isDayPermanentlyLocked}
            onDoubleClick={(e) => {
              e.stopPropagation();
              toggleDailyLock(chat.id, msgDate, isDayPermanentlyLocked);
            }}
          />
        );
        lastDate = msgDate;
      }

      if (isDayPermanentlyLocked && !isDayTemporarilyUnlocked) {
        continue;
      }

      // --- Media Grouping Logic ---
      const isMediaMessage = msg.messageType === 'image' || msg.messageType === 'video';
      if (isMediaMessage && activeFilter === 'all' && !searchTerm) {
        const mediaGroup = [msg];
        let j = i + 1;
        while (
          j < filteredMessages.length &&
          (filteredMessages[j].messageType === 'image' || filteredMessages[j].messageType === 'video') &&
          filteredMessages[j].senderId === msg.senderId
        ) {
          const nextMsgDate = getISODate(filteredMessages[j].timestamp);
          if (dailyLocks.includes(nextMsgDate) && !sessionUnlocks.includes(nextMsgDate)) break;
          mediaGroup.push(filteredMessages[j]);
          j++;
        }

        if (mediaGroup.length >= 2) {
          elements.push(
            <MediaCarouselBubble
              key={`carousel-${msg.id}`}
              mediaMessages={mediaGroup}
              selectionMode={selectionMode}
              isSelected={mediaGroup.some(msg => selectedMessages.includes(msg.id))}
              onEnterSelectionMode={handleEnterSelectionMode}
              onToggleSelection={handleToggleSelection}
            />
          );
          i = j - 1;
          continue;
        }
      }

      if (msg.messageType === 'security') {
        if (!securityNotificationsEnabled) continue;
        elements.push(
          <div key={msg.id} className="text-center my-2 flex justify-center">
            <div className="bg-[#1e2b32] text-yellow-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-2 max-w-md">
              <LockIcon className="h-4 w-4 flex-shrink-0" />
              <span>{msg.content}</span>
            </div>
          </div>
        );
      } else {
        elements.push(
          <MessageBubble
            key={msg.id}
            message={msg}
            chatId={chat.id}
            bubbleColor={bubbleColor}
            receivedBubbleColor={receivedBubbleColor}
            onActionSuccess={handleActionSuccess}
            onReply={setReplyingTo}
            onEdit={setEditingMessage}
            selectionMode={selectionMode}
            isSelected={selectedMessages.includes(msg.id)}
            onEnterSelectionMode={handleEnterSelectionMode}
            onToggleSelection={handleToggleSelection}
            searchTerm={searchTerm}
            showingReactions={showingReactions}
            onShowReactions={setShowingReactions}
          />
        );
      }
    }

    return elements;
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] bg-cover bg-center" style={backgroundStyle}>
      {selectionMode ? (
        <header className="flex-shrink-0 bg-[#202c33] p-3 flex justify-between items-center z-10">
          <div className="flex items-center space-x-4">
            <button onClick={handleExitSelectionMode} className="text-gray-300">
              <CloseIcon />
            </button>
            <span className="font-semibold text-white">{selectedMessages.length} selected</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleBulkDelete} className="text-gray-300">
              <TrashIcon className="h-6 w-6" />
            </button>
          </div>
        </header>
      ) : (
        <header className="flex-shrink-0 bg-[#202c33] p-3 flex justify-between items-center z-10">
          <div className="flex items-center min-w-0">
            {!isDesktop && (
              <button onClick={handleBackNavigation} className="mr-2 text-gray-300">
                <BackArrowIcon />
              </button>
            )}
            <div
              onClick={handleHeaderClick}
              onDoubleClick={handleHeaderDoubleClick}
              className="flex items-center cursor-pointer min-w-0"
            >
              <img src={avatar} alt={name} className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="ml-3 truncate flex items-center space-x-2">
                <div>
                  <h2 className="font-semibold text-white truncate">{name}</h2>
                  <p className="text-xs text-gray-400 truncate">{status}</p>
                </div>
                {contactInfo?.isOnline && chat.conversationType === 'INDIVIDUAL' && (
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-green flex-shrink-0"></div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            <button onClick={() => initiateCall(chat.id, 'voice')} className="text-gray-400 hover:text-gray-200">
              <PhoneIcon className="h-6 w-6" />
            </button>
            <button onClick={() => initiateCall(chat.id, 'video')} className="text-gray-400 hover:text-gray-200">
              <VideoCallIcon className="h-6 w-6" />
            </button>
            <button onClick={() => setIsSearchVisible(prev => !prev)} className="text-gray-400 hover:text-gray-200">
              <SearchIcon className="h-6 w-6" />
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen(o => !o)} className="text-gray-400 hover:text-gray-200">
                <ThreeDotsIcon className="h-6 w-6" />
              </button>
              {menuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#233138] rounded-md shadow-lg z-20">
                  <ul className="py-1">
                    {passcodeSettings.vanishMode.enabled && chat.conversationType === 'INDIVIDUAL' && (
                      <li><button onClick={() => promptAndToggleVanishMode(chat.id)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#111b21]">Vanish mode</button></li>
                    )}
                    <li><button onClick={() => { }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#111b21]">Disappearing messages</button></li>
                    <li><button onClick={() => { setClearChatConfirmOpen(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#111b21]">Clear chat</button></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {isSearchVisible && (
        <div className="p-2 bg-[#111b21] border-b border-gray-700">
          <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control form-control-sm w-full bg-[#202c33] border-transparent rounded-lg pl-10 pr-10 py-2 text-sm text-white focus:bg-[#2a3942] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {(searchTerm || activeFilter !== 'all') && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button onClick={handleClearSearch} className="text-gray-400 hover:text-white" aria-label="Clear search">
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {['all', 'image', 'video', 'document', 'link'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`btn btn-sm rounded-full transition-colors border-0 ${activeFilter === f
                  ? 'bg-primary text-white'
                  : 'bg-[#202c33] text-gray-300 hover:bg-[#2a3942]'
                  }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : (
          renderMessagesWithSeparators()
        )}
        <div ref={messagesEndRef} />
      </div>

      {isVanishMode && !selectionMode && (
        <div className="text-center p-2 bg-transparent text-gray-400 text-xs">
          Vanish mode is on. Seen messages will disappear when you close the chat.
        </div>
      )}

      {!selectionMode && <MessageComposer
        onMessageSent={handleMessageSent}
        replyingTo={replyingTo}
        onClearReply={() => setReplyingTo(null)}
        editingMessage={editingMessage}
        onEditComplete={handleEditComplete}
      />}

      <ConfirmationDialog
        isOpen={isBulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selectedMessages.length} message${selectedMessages.length > 1 ? 's' : ''}?`}
        confirmText="Delete for everyone"
        isDanger={true}
      >
        <p>Selected messages will be deleted for everyone in this chat. This action cannot be undone.</p>
      </ConfirmationDialog>

      <ConfirmationDialog
        isOpen={isClearChatConfirmOpen}
        onClose={() => setClearChatConfirmOpen(false)}
        onConfirm={confirmClearChat}
        title="Clear this chat?"
        confirmText="Clear Chat"
        isDanger={true}
      >
        <p>Messages in this chat will be permanently deleted.</p>
      </ConfirmationDialog>
    </div>
  );
};

export default ChatWindow;