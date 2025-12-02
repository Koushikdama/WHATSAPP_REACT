import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { useAppContext } from '../../context/AppContext';
import { Conversation, User } from '../../types';
import { LockIcon } from '../../components/icons';
import { createChat } from '../../services/firebase/chat.service';

const NewChatScreenHeader = () => {
  const { isLockedViewActive, promptAndToggleLockView, passcodeSettings } = useAppContext();

  const handleDoubleClick = () => {
    if (!passcodeSettings.lockedChats.enabled) {
      alert("Locked Chats feature is disabled. Enable it in Settings > Passcode Manager.");
      return;
    }
    promptAndToggleLockView();
  };

  return (
    <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
      <LockIcon className={`h-6 w-6 ${isLockedViewActive ? 'text-primary' : 'text-gray-400'}`} />
    </div>
  );
};


const NewChatScreen = () => {
  const [activeTab, setActiveTab] = useState('Following');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, setSelectedChat, conversations, isLockedViewActive, users, addConversation } = useAppContext();

  const handleContactClick = async (user: User, event: React.MouseEvent) => {
    // Only handle single clicks (detail === 1), double clicks handled separately
    if (event.detail !== 1) return;

    if (!currentUser) {
      alert('Please log in to start a chat');
      return;
    }

    // Check if we already have an individual chat with this user
    const existingChat = conversations.find(
      c => c.conversationType === 'INDIVIDUAL' && c.participants?.includes(user.id)
    );

    if (existingChat) {
      setSelectedChat(existingChat);
      navigate(`/chat/${user.id}`); // Navigate using user ID
      return;
    }

    setLoading(true);
    try {
      // Create or get existing chat from Firebase
      const chatId = await createChat([currentUser.id, user.id], 'individual');

      // Add conversation to global state immediately (optional, as listener will pick it up)
      // But for immediate navigation feedback:
      const conversation: Conversation = {
        id: chatId,
        conversationType: 'INDIVIDUAL',
        name: user.name,
        profileImage: user.avatar,
        isOnline: user.isOnline,
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        lastMessageType: 'text',
        lastMessageSentById: '',
        lastMessageSentByName: '',
        unreadCount: 0,
        participants: [currentUser.id, user.id],
        isLocked: false,
        isVanishMode: false,
        theme: undefined
      };

      // We don't strictly need addConversation if we rely on the listener, 
      // but it helps if the listener is slow.
      // addConversation(conversation); 

      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Failed to create/find chat:', error);
      alert('Failed to open chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContactDoubleClick = (user: User, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Double-click - show contact info
    navigate(`/contact/${user.id}`);
  };

  const lockedContactIds = conversations
    .filter(c => c.isLocked && c.conversationType === 'INDIVIDUAL')
    .map(c => c.id);

  const contacts = users
    .filter(u => u.id !== currentUser?.id)
    .filter(u => isLockedViewActive ? lockedContactIds.includes(u.id) : !lockedContactIds.includes(u.id));

  return (
    <SettingsLayout title="New chat" onBack={() => navigate('/')}>
      <div className="p-4 bg-[#202c33] flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Contacts</h2>
        <NewChatScreenHeader />
      </div>
      <div className="p-4 bg-[#111b21] border-b border-gray-700">
        <button
          onClick={() => alert('New Contact feature coming soon!')}
          className="flex items-center space-x-4 w-full text-left"
        >
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
            </svg>
          </div>
          <span className="text-white font-semibold">New contact</span>
        </button>
      </div>
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 p-3 text-sm font-semibold ${activeTab === 'Following' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
          onClick={() => setActiveTab('Following')}
        >
          FOLLOWING
        </button>
        <button
          className={`flex-1 p-3 text-sm font-semibold ${activeTab === 'Followers' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
          onClick={() => setActiveTab('Followers')}
        >
          FOLLOWERS
        </button>
      </div>
      <div className="overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-3 text-gray-400">Opening chat...</p>
          </div>
        )}
        {!loading && contacts.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            {isLockedViewActive ? 'No locked contacts found.' : 'No contacts found.'}
          </p>
        )}
        {!loading && contacts.map(user => (
          <div
            key={user.id}
            onClick={(e) => handleContactClick(user, e)}
            onDoubleClick={(e) => handleContactDoubleClick(user, e)}
            className="flex items-center p-3 hover:bg-[#202c33] cursor-pointer border-b border-gray-800"
          >
            <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full mr-4" />
            <div>
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-sm text-gray-400">{user.statusText || user.bio || 'Hey there! I am using WhatsApp.'}</p>
            </div>
          </div>
        ))}
      </div>
    </SettingsLayout >
  );
};

export default NewChatScreen;