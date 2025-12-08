import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ChatWindow from './pages/chats/ChatWindow';
import StatusScreen from './pages/status/StatusScreen';
import CallsScreen from './pages/calls/CallsScreen';
import ChatListScreen from './pages/chats/ChatListScreen';
import SettingsScreen from './pages/settings/SettingsScreen';
import ProfileScreen from './pages/settings/ProfileScreen';
import PrivacyScreen from './pages/settings/PrivacyScreen';
import AccountScreen from './pages/settings/AccountScreen';
import ChatsSettingsScreen from './pages/settings/ChatsSettingsScreen';
import NotificationsScreen from './pages/settings/NotificationsScreen';
import StorageScreen from './pages/settings/StorageScreen';
import HelpScreen from './pages/settings/HelpScreen';
import DiscoverScreen from './pages/contacts/DiscoverScreen';
import CallScreen from './pages/calls/CallScreen';
import FloatingCallView from './components/calls/FloatingCallView';
import NotificationPopup from './components/ui/NotificationPopup';
import PasscodeManagerScreen from './pages/settings/PasscodeManagerScreen';
import AuthScreen from './pages/auth/AuthScreen';
import FollowRequestsScreen from './components/FollowRequestsScreen';
import ActivityScreen from './pages/activity/ActivityScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import WorkflowListPage from './pages/workflows/WorkflowListPage';
import WorkflowBuilderPage from './pages/workflows/WorkflowBuilderPage';
import ScheduledMessagesPage from './pages/workflows/ScheduledMessagesPage';
import CreateGroupScreen from './pages/groups/CreateGroupScreen';


import { CloseIcon } from './components/icons';
import ContactInfo from './pages/contacts/ContactInfo';

const ContactInfoWrapper = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <ContactInfo userId={id} />;
};

const ChatWindowWrapper = () => {
  const navigate = useNavigate();
  return <ChatWindow onHeaderClick={(id) => { if (id) navigate(`/contact-info/${id}`); }} />;
};

// Import test utilities (available in browser console)
import './utils/testing/testWebRTC';
import './utils/testing/testNotifications';
import { useScheduler } from './hooks/useScheduler';

const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '🙏', '🔥'];

const StatusViewer = () => {
  const { activeStatusUser, closeStatusViewer, nextStatusUser, prevStatusUser, reactToStatus, statuses: appStatuses } = useAppContext();
  const [currentUserStatuses, setCurrentUserStatuses] = useState(appStatuses.find(s => s.userId === activeStatusUser?.id));
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setCurrentUserStatuses(appStatuses.find(s => s.userId === activeStatusUser?.id));
    setCurrentUpdateIndex(0);
  }, [activeStatusUser, appStatuses]);

  useEffect(() => {
    if (!currentUserStatuses || isPaused) return;

    const timer = setTimeout(() => {
      if (currentUpdateIndex < currentUserStatuses.updates.length - 1) {
        setCurrentUpdateIndex(prev => prev + 1);
      } else {
        closeStatusViewer();
      }
    }, 5000); // 5 seconds per status

    return () => clearTimeout(timer);
  }, [currentUpdateIndex, currentUserStatuses, isPaused, closeStatusViewer]);

  if (!activeStatusUser || !currentUserStatuses) {
    return null;
  }

  const currentUpdate = currentUserStatuses.updates[currentUpdateIndex];

  const handleNavigation = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, direction: 'next' | 'prev') => {
    e.stopPropagation();
    if (direction === 'next') {
      if (currentUpdateIndex < currentUserStatuses.updates.length - 1) {
        setCurrentUpdateIndex(prev => prev + 1);
      } else {
        closeStatusViewer();
      }
    } else { // prev
      if (currentUpdateIndex > 0) {
        setCurrentUpdateIndex(prev => prev - 1);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center" onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onMouseLeave={() => setIsPaused(false)}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex flex-col z-10">
        {/* Progress Bars */}
        <div className="flex space-x-1 mb-2">
          {currentUserStatuses.updates.map((update, index) => (
            <div key={update.id} className="h-1 flex-1 bg-white/30 rounded-full">
              <div className="h-full bg-white rounded-full" style={{ width: `${index < currentUpdateIndex ? 100 : (index === currentUpdateIndex ? (isPaused ? 0 : 100) : 0)}%`, transition: index === currentUpdateIndex && !isPaused ? 'width 5s linear' : 'none' }}></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={activeStatusUser.avatar} alt={activeStatusUser.name} className="h-10 w-10 rounded-full" />
            <p className="text-white font-semibold">{activeStatusUser.name}</p>
          </div>
          <button onClick={closeStatusViewer} className="text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute left-0 top-0 h-full w-1/2" onClick={(e) => handleNavigation(e, 'prev')}></div>
        <div className="absolute right-0 top-0 h-full w-1/2" onClick={(e) => handleNavigation(e, 'next')}></div>

        {currentUpdate.type === 'image' ? (
          <img src={currentUpdate.url} alt={currentUpdate.caption} className="max-h-[80vh] max-w-[95vw] object-contain rounded-lg" />
        ) : (
          <video src={currentUpdate.url} controls autoPlay className="max-h-[80vh] max-w-[95vw] object-contain rounded-lg" />
        )}

        {currentUpdate.caption && <p className="absolute bottom-20 text-white bg-black/50 p-2 rounded">{currentUpdate.caption}</p>}
      </div>

      {/* Footer / Reactions */}
      <div className="absolute bottom-4 flex space-x-2 bg-[#2a3942] p-2 rounded-full shadow-lg">
        {EMOJI_REACTIONS.map(emoji => (
          <button key={emoji} onClick={() => reactToStatus(activeStatusUser.id, currentUpdate.id, emoji)} className="text-2xl hover:scale-125 transition-transform">
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

const AppContent = () => {
  const { currentUser: authUser, loading: authLoading, userProfile } = useAuth();
  const { activeCall, themeSettings, activeStatusUser, loading, currentUser, error } = useAppContext();
  const location = useLocation();
  const onCallScreen = location.pathname.startsWith('/call/');

  // Initialize scheduler
  useScheduler();

  // Show auth screen if not authenticated
  if (authLoading) {
    console.log('⏳ Auth is loading...');
    return (
      <div className="bg-[#111b21] h-screen w-screen flex flex-col items-center justify-center text-white">
        <img src="https://static.whatsapp.net/rsrc.php/v3/y7/r/_DSx_SM7ITE.png" alt="WhatsApp Logo" className="w-24 h-24 mb-4" />
        <p className="text-lg">Connecting...</p>
        <div className="mt-4 w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-pulse w-full"></div>
        </div>
      </div>
    );
  }

  const themeClass = `theme-${themeSettings.themeColor.name}`;
  const uiStyleClass = themeSettings.uiStyle === 'glossy' ? 'glossy' : '';
  const animationClass = themeSettings.animationsEnabled ? '' : 'no-animations';
  const fontSizeClass = `font-size-${themeSettings.fontSize}`;

  return (
    <div className={`bg-[#111b21] text-gray-300 h-screen w-screen overflow-hidden ${themeClass} ${uiStyleClass} ${animationClass} ${fontSizeClass}`}>
      <Routes>
        <Route path="/auth" element={<AuthScreen />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<ChatListScreen />} />
          <Route path="chat/:id" element={<ChatWindowWrapper />} />
          <Route path="status" element={<StatusScreen />} />
          <Route path="calls" element={<CallsScreen />} />
          <Route path="activity" element={<ActivityScreen />} />
          <Route path="follow-requests" element={<FollowRequestsScreen />} />
        </Route>

        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsScreen />
          </ProtectedRoute>
        } />
        <Route path="/settings/profile" element={
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        } />
        <Route path="/settings/privacy" element={
          <ProtectedRoute>
            <PrivacyScreen />
          </ProtectedRoute>
        } />
        <Route path="/settings/account" element={
          <ProtectedRoute>
            <AccountScreen />
          </ProtectedRoute>
        } />
        <Route path="/settings/chats" element={
          <ProtectedRoute>
            <ChatsSettingsScreen />
          </ProtectedRoute>
        } />
        <Route path="/settings/notifications" element={
          <ProtectedRoute>
            <NotificationsScreen />
          </ProtectedRoute>
        } />
        <Route path="/settings/storage" element={
          <ProtectedRoute>
            <StorageScreen />
          </ProtectedRoute>
        } />
        <Route path="/settings/help" element={
          <ProtectedRoute>
            <HelpScreen />
          </ProtectedRoute>
        } />
        <Route path="/settings/passcode-manager" element={
          <ProtectedRoute>
            <PasscodeManagerScreen />
          </ProtectedRoute>
        } />
        <Route path="/new-chat" element={
          <ProtectedRoute>
            <DiscoverScreen />
          </ProtectedRoute>
        } />
        <Route path="/create-group" element={
          <ProtectedRoute>
            <CreateGroupScreen />
          </ProtectedRoute>
        } />
        <Route path="/contact-info/:id" element={
          <ProtectedRoute>
            <ContactInfoWrapper />
          </ProtectedRoute>
        } />
        <Route path="/call/:id" element={
          <ProtectedRoute>
            <CallScreen />
          </ProtectedRoute>
        } />
        <Route path="/workflows" element={
          <ProtectedRoute>
            <WorkflowListPage />
          </ProtectedRoute>
        } />
        <Route path="/workflows/new" element={
          <ProtectedRoute>
            <WorkflowBuilderPage />
          </ProtectedRoute>
        } />
        <Route path="/workflows/edit/:id" element={
          <ProtectedRoute>
            <WorkflowBuilderPage />
          </ProtectedRoute>
        } />
        <Route path="/scheduled-messages" element={
          <ProtectedRoute>
            <ScheduledMessagesPage />
          </ProtectedRoute>
        } />
      </Routes>
      {activeCall && !onCallScreen && <FloatingCallView />}
      <NotificationPopup />
      {activeStatusUser && <StatusViewer />}
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;