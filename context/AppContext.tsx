import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Conversation, Message, ThemeSettings, User, InAppNotification, PasscodeSettings, Status, PollInfo, Call } from '../types';
import {
  getConversations,
  deleteMessageForMe,
  deleteMessageForEveryone,
  toggleChatLock as apiToggleChatLock,
  toggleVanishMode as apiToggleVanishMode,
  clearChatMessages as apiClearChatMessages,
  reactToMessage as apiReactToMessage,
  voteOnPoll as apiVoteOnPoll,
  sendMessage as apiSendMessage,
  getCurrentUser,
  getUsers,
  getCalls,
  getStatuses,
  updateChatTheme as apiUpdateChatTheme,
  updateChatReceivedTheme as apiUpdateChatReceivedTheme,
  initializeDataCache,
} from '../api';
import { subscribeToUserChats } from '../services/firebase/chat.service';
import { updateUserProfile } from '../services/firebase/user.service';
import {
  getAllUserSettings,
  updateThemeSettings,
  updatePasscodeSettings,
  updateLockedDates
} from '../services/firebase/user.settings.service';

// Firebase imports removed
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { sortConversations } from '../utils/chat/chatHelpers';
import { addReactionToStatus as addFirebaseReaction } from '../services/status.service';

import usePushNotifications from '../hooks/usePushNotifications';
import { useNavigate } from 'react-router-dom';
import PasswordPrompt from '../components/ui/PasswordPrompt';

const defaultTheme: ThemeSettings = {
  themeColor: { name: 'green', from: '#00a884', to: '#008a69' },
  toggleOnColor: { name: 'green', from: '#00a884', to: '#008a69' },
  toggleOffColor: { name: 'gray', color: '#374151' },
  chatBackground: 'https://i.redd.it/qwd83nc4xxf41.jpg',
  uiStyle: 'normal',
  animationsEnabled: true,
  fontSize: 'medium',
  headerAnimation: 'none',
  swipeSensitivity: 50,
  wallpaperQuality: 'medium',
};

const defaultPasscodes: PasscodeSettings = {
  lockedChats: { enabled: true, passcode: "1234" },
  vanishMode: { enabled: true, passcode: "5678" },
  dailyChatLock: { enabled: true, passcode: "0000" },
};

interface ActiveCall {
  contact: User;
  type: 'voice' | 'video';
  status: 'calling' | 'ringing' | 'active';
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaker: boolean;
  isFrontCamera: boolean;
  startTime: number | null;
}

interface PasswordPromptState {
  isOpen: boolean;
  title: string;
  placeholder: string;
  onSubmit: (password: string) => void;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  calls: Call[];
  updateCurrentUser: (updatedUser: Partial<User>) => void;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  addConversation: (conversation: Conversation) => void;
  selectedChat: Conversation | null;
  setSelectedChat: (chat: Conversation | null) => void;
  loading: boolean;
  error: string | null;
  deleteMessage: (chatId: string, messageId: string, type: 'me' | 'everyone', conversationType: 'INDIVIDUAL' | 'GROUP') => Promise<boolean>;
  themeSettings: ThemeSettings;
  setThemeSettings: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  showBrowserNotification: (type: 'message' | 'call', title: string, body: string) => void;
  // Account Settings
  securityNotificationsEnabled: boolean;
  setSecurityNotificationsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  toggleChatLock: (chatId: string) => void;
  clearChat: (chatId: string) => Promise<void>;
  updateChatTheme: (chatId: string, themeName: string | null) => Promise<void>;
  updateChatReceivedTheme: (chatId: string, themeName: string | null) => Promise<void>;
  // Call state
  activeCall: ActiveCall | null;
  initiateCall: (contactId: string, type: 'voice' | 'video') => void;
  answerCall: () => void;
  rejectCall: () => void;
  hangUp: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;
  switchCamera: () => void;
  // In-app notifications
  inAppNotification: InAppNotification | null;
  showInAppNotification: (type: 'message' | 'call', title: string, body: string) => void;
  clearInAppNotification: () => void;
  // Locked View
  isLockedViewActive: boolean;
  promptAndToggleLockView: () => void;
  // Day Lock
  lockedDates: Record<string, string[]>;
  unlockedDatesForSession: Record<string, string[]>;
  toggleDailyLock: (chatId: string, date: string, isCurrentlyLocked: boolean) => void;
  // Vanish Mode
  promptAndToggleVanishMode: (chatId: string) => void;
  // Session Management for Day Lock
  clearUnlockedDatesForSession: (chatId: string) => void;
  // Passcode Manager
  passcodeSettings: PasscodeSettings;
  updatePasscodeSettings: (settings: Partial<PasscodeSettings>) => Promise<void>;
  // Theme Settings (now syncs to Firebase)
  updateThemeSettings: (settings: Partial<ThemeSettings>) => Promise<void>;
  // Status Viewer
  activeStatusUser: User | null;
  openStatusViewer: (userId: string) => void;
  closeStatusViewer: () => void;
  nextStatusUser: () => void;
  prevStatusUser: () => void;
  statuses: Status[];
  reactToStatus: (userId: string, updateId: string, emoji: string) => void;
  // New Features
  reactToMessage: (chatId: string, messageId: string, emoji: string) => Promise<void>;
  voteOnPoll: (chatId: string, messageId: string, optionIndex: number) => Promise<void>;
  createPoll: (chatId: string, poll: PollInfo) => Promise<Message | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { requestPermission, showNotification: showBrowserNotification } = usePushNotifications();
  const { showToast } = useToast();
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [inAppNotification, setInAppNotification] = useState<InAppNotification | null>(null);
  const navigate = useNavigate();

  const [isLockedViewActive, setIsLockedViewActive] = useState(false);

  // Initialize from localStorage, will be overwritten by Firebase data
  const [lockedDates, setLockedDates] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('whatsapp-locked-dates');
    return saved ? JSON.parse(saved) : {};
  });

  const [unlockedDatesForSession, setUnlockedDatesForSession] = useState<Record<string, string[]>>({});
  const [passwordPrompt, setPasswordPrompt] = useState<PasswordPromptState>({ isOpen: false, title: '', placeholder: '', onSubmit: () => { } });

  // Initialize from localStorage, will be overwritten by Firebase data
  const [passcodeSettings, setPasscodeSettings] = useState<PasscodeSettings>(() => {
    const saved = localStorage.getItem('whatsapp-passcode-settings');
    return saved ? JSON.parse(saved) : defaultPasscodes;
  });

  const [activeStatusUser, setActiveStatusUser] = useState<User | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Wrapper function to update passcode settings in Firebase + localStorage
  const updatePasscodeSettingsWrapper = async (settings: Partial<PasscodeSettings>) => {
    if (!authUser) {
      // Fallback to localStorage if not logged in
      setPasscodeSettings(prev => {
        const newSettings = { ...prev, ...settings };
        localStorage.setItem('whatsapp-passcode-settings', JSON.stringify(newSettings));
        return newSettings;
      });
      return;
    }

    // Update local state immediately for UI responsiveness
    setPasscodeSettings(prev => ({ ...prev, ...settings }));

    // Update Firebase in background
    try {
      await updatePasscodeSettings(authUser.id, settings);
    } catch (error) {
      console.error('Failed to sync passcode settings to Firebase:', error);
      showToast('Failed to sync settings', 'error');
    }
  };

  const [securityNotificationsEnabled, setSecurityNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('security-notifications-enabled');
    return saved ? JSON.parse(saved) : true;
  });

  const updateCurrentUser = (updatedUser: Partial<User>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...updatedUser };
      localStorage.setItem('whatsapp-current-user', JSON.stringify(newUser));
      return newUser;
    });
  };

  useEffect(() => {
    localStorage.setItem('security-notifications-enabled', JSON.stringify(securityNotificationsEnabled));
  }, [securityNotificationsEnabled]);

  // Initialize from localStorage, will be overwritten by Firebase data
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('whatsapp-theme-settings');
      return savedSettings ? { ...defaultTheme, ...JSON.parse(savedSettings) } : defaultTheme;
    } catch (e) {
      return defaultTheme;
    }
  });

  // Wrapper function to update theme settings in Firebase + localStorage
  const updateThemeSettingsWrapper = async (newSettings: Partial<ThemeSettings>) => {
    if (!authUser) {
      // Fallback to localStorage if not logged in
      setThemeSettings(prev => {
        const updated = { ...prev, ...newSettings };
        localStorage.setItem('whatsapp-theme-settings', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    // Update local state immediately for UI responsiveness
    setThemeSettings(prev => ({ ...prev, ...newSettings }));

    // Update Firebase in background
    try {
      await updateThemeSettings(authUser.id, newSettings);
    } catch (error) {
      console.error('Failed to sync theme to Firebase:', error);
      showToast('Failed to sync theme settings', 'error');
    }
  };

  // Wrapper function to update locked dates in Firebase + localStorage
  const updateLockedDatesWrapper = async (newDates: Record<string, string[]>) => {
    if (!authUser) {
      // Fallback to localStorage if not logged in
      setLockedDates(newDates);
      localStorage.setItem('whatsapp-locked-dates', JSON.stringify(newDates));
      return;
    }

    // Update local state immediately
    setLockedDates(newDates);

    // Update Firebase in background
    try {
      await updateLockedDates(authUser.id, newDates);
    } catch (error) {
      console.error('Failed to sync locked dates to Firebase:', error);
    }
  };


  // Get authenticated user from AuthContext
  const { userProfile: authUser, currentUser: firebaseAuthUser } = useAuth();

  useEffect(() => {
    // Request permission and get token on mount
    const initPushNotifications = async () => {
      if (!authUser) return;

      const token = await requestPermission();
      if (token) {
        // Save token to user profile
        try {
          await updateUserProfile(authUser.id, { fcmToken: token });
          console.log("FCM Token saved for user:", authUser.id);
        } catch (error) {
          console.error("Failed to save FCM token:", error);
        }
      }
    };

    initPushNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // Load user settings from Firebase when user logs in
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!authUser) {
        setSettingsLoaded(false);
        return;
      }

      try {
        // Load all settings from Firebase (will also cache in localStorage)
        const settings = await getAllUserSettings(authUser.id);

        if (settings) {
          // Use Firebase data as source of truth
          if (settings.themeSettings) {
            setThemeSettings(settings.themeSettings);
          }
          if (settings.passcodeSettings) {
            setPasscodeSettings(settings.passcodeSettings);
          }
          if (settings.lockedDates) {
            setLockedDates(settings.lockedDates);
          }
        } else {
          // No settings in Firebase yet - migrate from localStorage
          console.log('No settings in Firebase, will use localStorage cache');
        }

        setSettingsLoaded(true);
      } catch (error) {
        console.error('Error loading user settings from Firebase:', error);
        // Fallback to localStorage on error
        setSettingsLoaded(true);
      }
    };

    loadUserSettings();
  }, [authUser]);

  // Initialize data when authenticated user is available
  useEffect(() => {
    let unsubscribeChats: (() => void) | undefined;

    const fetchInitialData = async () => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Set current user from auth profile
        setCurrentUser(authUser);

        // Fetch all users
        const allUsers = await getUsers();
        setUsers(allUsers);

        // Subscribe to conversations
        unsubscribeChats = subscribeToUserChats(authUser.id, (userConversations) => {
          setConversations(userConversations);
        });

        // Fetch statuses
        const userStatuses = await getStatuses(authUser.id);
        setStatuses(userStatuses);

        // Fetch calls
        const userCalls = await getCalls(authUser.id);
        setCalls(userCalls);

        setError(null);
      } catch (err) {
        setError('Failed to load application data. Please refresh the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      if (unsubscribeChats) unsubscribeChats();
    };
  }, [authUser]);

  const showInAppNotification = (type: 'message' | 'call', title: string, body: string) => {
    setInAppNotification({ id: Date.now(), type, title, body });
  };

  const clearInAppNotification = () => {
    setInAppNotification(null);
  };

  const deleteMessage = async (chatId: string, messageId: string, type: 'me' | 'everyone', conversationType: 'INDIVIDUAL' | 'GROUP'): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      if (type === 'me') {
        await deleteMessageForMe(messageId, currentUser.id);
      } else {
        await deleteMessageForEveryone(messageId, currentUser.id);
      }
      return true;
    } catch (error) {
      console.error("Failed to delete message:", error);
      return false;
    }
  };

  const toggleChatLock = async (chatId: string) => {
    const success = await apiToggleChatLock(chatId);
    if (success) {
      setConversations(prev => prev.map(c =>
        c.id === chatId ? { ...c, isLocked: !c.isLocked } : c
      ));
    }
  };

  const clearChat = async (chatId: string) => {
    const success = await apiClearChatMessages(chatId);
    if (success) {
      setConversations(prev => prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: '',
            lastMessageAt: new Date().toISOString(),
            lastMessageType: 'TEXT',
            lastMessageSentById: '',
            lastMessageSentByName: '',
            unreadCount: 0,
          };
        }
        return c;
      }));
    }
  };

  const updateChatTheme = async (chatId: string, themeName: string | null) => {
    const success = await apiUpdateChatTheme(chatId, themeName);
    if (success) {
      const newTheme = themeName === null ? undefined : themeName;
      setConversations(prev => prev.map(c =>
        c.id === chatId ? { ...c, theme: newTheme } : c
      ));
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, theme: newTheme } : null);
      }
    }
  };

  const updateChatReceivedTheme = async (chatId: string, themeName: string | null) => {
    const success = await apiUpdateChatReceivedTheme(chatId, themeName);
    if (success) {
      const newTheme = themeName === null ? undefined : themeName;
      setConversations(prev => prev.map(c =>
        c.id === chatId ? { ...c, receivedTheme: newTheme } : c
      ));
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, receivedTheme: newTheme } : null);
      }
    }
  };

  const showPasswordPrompt = (title: string, placeholder: string, onSubmit: (password: string) => void) => {
    setPasswordPrompt({ isOpen: true, title, placeholder, onSubmit });
  };
  const closePasswordPrompt = () => setPasswordPrompt(prev => ({ ...prev, isOpen: false }));

  const promptAndToggleLockView = () => {
    if (!passcodeSettings.lockedChats.enabled) {
      showToast("Locked Chats feature is disabled. Enable it in Settings > Passcode Manager.", 'warning');
      return;
    }
    if (isLockedViewActive) {
      setIsLockedViewActive(false);
      return;
    }
    showPasswordPrompt(
      "Enter Password to View Locked Content",
      `Locked Chats Password (${passcodeSettings.lockedChats.passcode})`,
      (password) => {
        if (password === passcodeSettings.lockedChats.passcode) {
          setIsLockedViewActive(true);
          showToast("Locked view activated", 'success');
        } else {
          showToast("Incorrect password", 'error');
        }
        closePasswordPrompt();
      }
    );
  };

  const promptAndToggleVanishMode = (chatId: string) => {
    if (!passcodeSettings.vanishMode.enabled) {
      showToast("Vanish Mode feature is disabled. Enable it in Settings > Passcode Manager.", 'warning');
      return;
    }
    showPasswordPrompt(
      "Vanish Mode",
      `Vanish Mode Password (${passcodeSettings.vanishMode.passcode})`,
      async (password) => {
        if (password === passcodeSettings.vanishMode.passcode) {
          const success = await apiToggleVanishMode(chatId);
          if (success) {
            const chat = conversations.find(c => c.id === chatId);
            const newState = !chat?.isVanishMode;
            setConversations(prev => prev.map(c =>
              c.id === chatId ? { ...c, isVanishMode: newState } : c
            ));
            showToast(`Vanish Mode ${newState ? 'enabled' : 'disabled'}`, 'success');
          }
        } else {
          showToast("Incorrect password", 'error');
        }
        closePasswordPrompt();
      });
  };

  const toggleDailyLock = (chatId: string, date: string, isCurrentlyLocked: boolean) => {
    if (!passcodeSettings.dailyChatLock.enabled) {
      showToast("Daily Chat Lock feature is disabled. Enable it in Settings > Passcode Manager.", 'warning');
      return;
    }
    const title = isCurrentlyLocked ? `Unlock messages for this day?` : `Lock messages for this day?`;
    showPasswordPrompt(title, `Daily Lock Password (${passcodeSettings.dailyChatLock.passcode})`, (password) => {
      if (password === passcodeSettings.dailyChatLock.passcode) {
        // Calculate new locked dates
        const chatLocks = lockedDates[chatId] || [];
        const newLocks = isCurrentlyLocked
          ? chatLocks.filter(d => d !== date)
          : [...chatLocks, date];
        const newLockedDates = { ...lockedDates, [chatId]: newLocks };

        // Update using wrapper (syncs to Firebase)
        updateLockedDatesWrapper(newLockedDates);

        if (isCurrentlyLocked) {
          setUnlockedDatesForSession(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), date]
          }));
        }
        showToast(isCurrentlyLocked ? 'Day unlocked' : 'Day locked', 'success');
      } else {
        showToast("Incorrect password", 'error');
      }
      closePasswordPrompt();
    });
  };

  const clearUnlockedDatesForSession = (chatId: string) => {
    setUnlockedDatesForSession(prev => {
      const { [chatId]: _, ...rest } = prev;
      return rest;
    });
  };

  const addConversation = (conversation: Conversation) => {
    setConversations(prev => {
      // Check if conversation already exists
      const exists = prev.some(c => c.id === conversation.id);
      if (exists) {
        return prev;
      }
      // Add the new conversation and sort
      const updated = [...prev, conversation];
      return sortConversations(updated);
    });
  };

  const openStatusViewer = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setActiveStatusUser(user);
  };
  const closeStatusViewer = () => setActiveStatusUser(null);
  const nextStatusUser = () => { };
  const prevStatusUser = () => { };
  const reactToStatus = async (userId: string, updateId: string, emoji: string) => {
    try {
      // Call Firebase service to add reaction
      await addFirebaseReaction(userId, updateId, emoji);

      // Update local state optimistically
      setStatuses(prev => prev.map(s => {
        if (s.userId === userId) {
          return {
            ...s,
            updates: s.updates.map(u => {
              if (u.id === updateId) {
                const reactions = u.reactions || [];
                if (!reactions.includes(emoji)) {
                  return { ...u, reactions: [emoji, ...reactions] };
                }
              }
              return u;
            })
          };
        }
        return s;
      }));

      showToast('Reaction added!', 'success');
    } catch (error) {
      console.error('Error adding reaction:', error);
      showToast('Failed to add reaction', 'error');
    }
  };

  const reactToMessage = async (chatId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;
    await apiReactToMessage(chatId, messageId, currentUser.id, emoji);
  };

  const voteOnPoll = async (chatId: string, messageId: string, optionIndex: number) => {
    if (!currentUser) return;
    await apiVoteOnPoll(messageId, currentUser.id, optionIndex);
  };

  const createPoll = async (chatId: string, poll: PollInfo): Promise<Message | null> => {
    if (!selectedChat || !currentUser) return null;
    const pollMessage: Partial<Message> = {
      pollInfo: poll,
      messageType: 'poll',
      content: poll.question,
    };
    try {
      const actualChatId = chatId || selectedChat.id;
      const content = pollMessage.content || poll.question;
      const newMessage = await apiSendMessage(
        actualChatId,
        currentUser.id,
        content,
        selectedChat.conversationType.toLowerCase() as 'individual' | 'group',
        pollMessage
      );
      return newMessage;
    } catch (e) {
      console.error("Failed to create poll", e);
      return null;
    }
  };

  const initiateCall = async (contactId: string, type: 'voice' | 'video') => {
    const contact = users.find(u => u.id === contactId);
    if (!contact) return;

    try {
      const constraints = { audio: true, video: type === 'video' };
      await navigator.mediaDevices.getUserMedia(constraints).then(stream => stream.getTracks().forEach(track => track.stop()));
      setActiveCall({
        contact, type, status: 'calling', isMuted: false, isVideoOff: type === 'voice', isSpeaker: type === 'video', isFrontCamera: true, startTime: null
      });
      navigate(`/call/${contactId}`);
    } catch (e) {
      console.error("Failed to get media permissions", e);
      showToast(`Could not start ${type} call. Please allow access to your camera and microphone.`, 'error');
    }
  };

  const answerCall = () => {
    if (activeCall) {
      setActiveCall({ ...activeCall, status: 'active', startTime: Date.now() });
      navigate(`/call/${activeCall.contact.id}`);
    }
  };

  const rejectCall = () => {
    setActiveCall(null);
  };

  const hangUp = () => {
    setActiveCall(null);
    navigate('/');
  };

  const toggleMute = () => setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
  const toggleVideo = () => setActiveCall(prev => prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null);
  const toggleSpeaker = () => setActiveCall(prev => prev ? { ...prev, isSpeaker: !prev.isSpeaker } : null);
  const switchCamera = () => setActiveCall(prev => prev ? { ...prev, isFrontCamera: !prev.isFrontCamera } : null);

  const contextValue: AppContextType = {
    currentUser,
    users,
    calls,
    updateCurrentUser,
    conversations,
    setConversations,
    addConversation,
    selectedChat,
    setSelectedChat,
    loading,
    error,
    deleteMessage,
    themeSettings,
    setThemeSettings,
    showBrowserNotification,
    securityNotificationsEnabled,
    setSecurityNotificationsEnabled,
    toggleChatLock,
    clearChat,
    updateChatTheme,
    updateChatReceivedTheme,
    activeCall,
    initiateCall,
    answerCall,
    rejectCall,
    hangUp,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
    inAppNotification,
    showInAppNotification,
    clearInAppNotification,
    isLockedViewActive,
    promptAndToggleLockView,
    lockedDates,
    unlockedDatesForSession,
    toggleDailyLock,
    promptAndToggleVanishMode,
    clearUnlockedDatesForSession,
    passcodeSettings,
    updatePasscodeSettings: updatePasscodeSettingsWrapper,
    updateThemeSettings: updateThemeSettingsWrapper,
    activeStatusUser,
    openStatusViewer,
    closeStatusViewer,
    nextStatusUser,
    prevStatusUser,
    statuses,
    reactToStatus,
    reactToMessage,
    voteOnPoll,
    createPoll,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <PasswordPrompt
        isOpen={passwordPrompt.isOpen}
        onClose={closePasswordPrompt}
        onSubmit={passwordPrompt.onSubmit}
        title={passwordPrompt.title}
        placeholder={passwordPrompt.placeholder}
      />
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};