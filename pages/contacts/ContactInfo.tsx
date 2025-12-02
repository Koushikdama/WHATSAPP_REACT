import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { getUserInfo } from '../../api';
import { PhoneIcon, VideoCallIcon, QrCodeIcon, CheckIcon } from '../../components/icons';
import { useAppContext } from '../../context/AppContext';
import { gradients } from '../../utils/theme/themes';
import ThemeToggle from '../../components/ui/ThemeToggle';
import SettingsLayout from '../../components/layout/SettingsLayout';

interface ContactInfoProps {
  userId: string;
  noLayout?: boolean; // When true, renders without SettingsLayout wrapper
}

const ContactInfo = ({ userId, noLayout = false }: ContactInfoProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const { initiateCall, conversations, toggleChatLock, promptAndToggleVanishMode, passcodeSettings, updateChatTheme, updateChatReceivedTheme, currentUser } = useAppContext();

  // Find chat by checking if userId is in participants (for individual chats) or if it's the chat ID
  const chat = conversations.find(c =>
    c.id === userId ||
    (c.conversationType === 'INDIVIDUAL' && c.participants?.includes(userId))
  );
  const isLocked = chat?.isLocked || false;
  const isVanishMode = chat?.isVanishMode || false;

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        console.log('ContactInfo: Fetching user info for userId:', userId);
        const userInfo = await getUserInfo(userId);
        if (userInfo) {
          console.log('ContactInfo: User info loaded successfully:', userInfo.name);
          setUser(userInfo);
        } else {
          console.error('ContactInfo: User info returned null for userId:', userId);
        }
      } catch (error) {
        console.error("ContactInfo: Failed to fetch user info for userId:", userId, error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleMessage = async () => {
    if (!currentUser || !user || messageLoading) return;

    // Check if account is private and we don't follow them
    if (user.isPrivate) {
      const isFollowing = currentUser.following?.includes(userId) || false;
      if (!isFollowing) {
        alert('You need to follow this user to send messages.');
        return;
      }
    }

    setMessageLoading(true);
    try {
      // Navigate using userId (not chatId) - routes expect user ID for individual chats
      navigate(`/chat/${userId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to open chat. Please try again.');
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return <div className="flex-grow overflow-y-auto p-4 text-center">Loading contact info...</div>;
  }

  if (!user) {
    return (
      <SettingsLayout title="Contact Info">
        <div className="flex-grow overflow-y-auto flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-500 mb-2">Contact Not Found</h2>
            <p className="text-gray-300 mb-4">
              Unable to load contact information. This user may have been deleted or the ID is invalid.
            </p>
            <div className="bg-gray-800/50 rounded p-3 mb-4">
              <p className="text-xs text-gray-400 mb-1">User ID:</p>
              <p className="text-xs text-gray-300 font-mono break-all">{userId}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Go Back
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Check browser console for more details
            </p>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  // Check if we can show message button
  const canMessage = !user.isPrivate || (currentUser?.following?.includes(userId) || false);

  // Format lastSeen to handle Firestore Timestamp
  const formatLastSeen = (lastSeen: any): string => {
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
  };

  const contactContent = (
    <div className="flex-grow overflow-y-auto">
      <div className="flex flex-col items-center p-4 md:p-6 bg-[#111b21] border-b border-gray-700">

        <div className={`flip-card h-32 w-32 md:h-40 md:w-40 mb-4 cursor-pointer ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <img src={user.avatar} alt={user.name} className="h-32 w-32 md:h-40 md:w-40 rounded-full" />
            </div>
            <div className="flip-card-back bg-white rounded-full flex items-center justify-center p-4">
              <QrCodeIcon className="h-24 w-24 md:h-32 md:w-32 text-gray-800" />
            </div>
          </div>
        </div>

        <h1 className="text-xl md:text-2xl text-white">{user.name}</h1>
        {user.isPrivate && (
          <p className="text-xs text-gray-400 mt-1">🔒 Private Account</p>
        )}
        <p className="text-gray-400">{user.isOnline ? 'online' : formatLastSeen(user.lastSeen)}</p>

        {/* Call buttons */}
        <div className="flex space-x-4 mt-4">
          <button onClick={() => initiateCall(user.id, 'voice')} className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors">
            <div className="p-2 rounded-full bg-gray-800">
              <PhoneIcon className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">Call</span>
          </button>
          <button onClick={() => initiateCall(user.id, 'video')} className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors">
            <div className="p-2 rounded-full bg-gray-800">
              <VideoCallIcon className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">Video</span>
          </button>
        </div>
      </div>

      <div className="bg-[#111b21] p-4 my-3">
        <p className="text-gray-400 text-sm">About</p>
        <p className="text-white mt-1">{user.statusText || user.bio || 'Hey there! I am using WhatsApp.'}</p>
      </div>

      <div className="bg-[#111b21] my-3">
        <div className="p-4">
          <p className="text-white">Theme</p>
          <div className="flex flex-wrap gap-3 mt-2">
            <button onClick={() => chat && updateChatTheme(chat.id, null)}
              className={`w-10 h-10 rounded-full focus:outline-none flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#111b21] bg-gray-600 transition-transform hover:scale-110 ${!chat?.theme ? 'ring-white' : 'ring-transparent'}`}
            >
              {!chat?.theme && <CheckIcon className="h-5 w-5 text-white" />}
            </button>
            {gradients.map(theme => (
              <button key={theme.name} onClick={() => chat && updateChatTheme(chat.id, theme.name)}
                className={`w-10 h-10 rounded-full focus:outline-none flex-shrink-0 flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#111b21] transition-transform hover:scale-110 ${chat?.theme === theme.name ? 'ring-white' : 'ring-transparent'}`}
                style={{ backgroundImage: `linear-gradient(to right, ${theme.gradient.from}, ${theme.gradient.to})` }}
              >
                {chat?.theme === theme.name && <CheckIcon className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <p className="text-white">Received Message Theme</p>
          <div className="flex flex-wrap gap-3 mt-2">
            <button onClick={() => chat && updateChatReceivedTheme(chat.id, null)}
              className={`w-10 h-10 rounded-full focus:outline-none flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#111b21] bg-gray-600 transition-transform hover:scale-110 ${!chat?.receivedTheme ? 'ring-white' : 'ring-transparent'}`}
            >
              {!chat?.receivedTheme && <CheckIcon className="h-5 w-5 text-white" />}
            </button>
            {gradients.map(theme => (
              <button key={theme.name} onClick={() => chat && updateChatReceivedTheme(chat.id, theme.name)}
                className={`w-10 h-10 rounded-full focus:outline-none flex-shrink-0 flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#111b21] transition-transform hover:scale-110 ${chat?.receivedTheme === theme.name ? 'ring-white' : 'ring-transparent'}`}
                style={{ backgroundImage: `linear-gradient(to right, ${theme.gradient.from}, ${theme.gradient.to})` }}
              >
                {chat?.receivedTheme === theme.name && <CheckIcon className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 cursor-pointer hover:bg-[#2a3942]">
          <p className="text-white">Mute notifications</p>
        </div>
        <div className="flex items-center justify-between p-4">
          <p className="text-white">Chat lock</p>
          <ThemeToggle checked={isLocked} onChange={() => chat && toggleChatLock(chat.id)} />
        </div>
        <div className="flex items-center justify-between p-4">
          <p className="text-white">Vanish mode</p>
          <ThemeToggle checked={isVanishMode} onChange={() => chat && promptAndToggleVanishMode(chat.id)} />
        </div>
        <div className="p-4 cursor-pointer hover:bg-[#2a3942]">
          <p className="text-white">Starred messages</p>
        </div>
      </div>

      <div className="bg-[#111b21] my-3 text-red-500">
        <div className="p-4 cursor-pointer hover:bg-[#2a3942]">
          <p>Block {user.name}</p>
        </div>
        <div className="p-4 cursor-pointer hover:bg-[#2a3942]">
          <p>Report {user.name}</p>
        </div>
      </div>
    </div>
  );

  // If noLayout is true, return just the content without SettingsLayout wrapper
  if (noLayout) {
    return contactContent;
  }

  // Otherwise, wrap in SettingsLayout
  return (
    <SettingsLayout title="Contact Info">
      {contactContent}
    </SettingsLayout>
  );
};

export default ContactInfo;