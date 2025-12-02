import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { KeyIcon, LockIcon, NotificationsIcon, HelpIcon, StorageIcon, QrCodeIcon } from '../../components/icons';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const ChatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" className={className}><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"></path></svg>
);

const LogoutIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" className={className}>
    <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path>
  </svg>
);

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setLoggingOut(true);
      try {
        await logout();
        // Auth state change will automatically redirect to login screen
        // No need to manually navigate
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
        setLoggingOut(false);
      }
    }
  };

  const settingsItems = [
    { icon: <KeyIcon className="h-6 w-6 text-gray-400" />, title: 'Account', subtitle: 'Security notifications, change number', link: '/settings/account' },
    { icon: <LockIcon className="h-6 w-6 text-gray-400" />, title: 'Privacy', subtitle: 'Block contacts, disappearing messages', link: '/settings/privacy' },
    { icon: <LockIcon className="h-6 w-6 text-gray-400" />, title: 'Passcode Manager', subtitle: 'Manage passcodes for locked chats', link: '/settings/passcode-manager' },
    { icon: <ChatIcon className="h-6 w-6 text-gray-400" />, title: 'Chats', subtitle: 'Theme, wallpapers, chat history', link: '/settings/chats' },
    { icon: <StorageIcon className="h-6 w-6 text-gray-400" />, title: 'Storage and data', subtitle: 'Network usage, auto-download', link: '/settings/storage' },
    { icon: <HelpIcon className="h-6 w-6 text-gray-400" />, title: 'Help', subtitle: 'Help center, contact us, privacy policy', link: '/settings/help' },
  ];

  const ListItem: React.FC<{ item: typeof settingsItems[0] }> = ({ item }) => (
    <Link to={item.link} className="block hover:bg-[#202c33] transition-colors">
      <div className="flex items-center p-4">
        <div className="w-12">{item.icon}</div>
        <div className="ml-4">
          <h3 className="text-white">{item.title}</h3>
          <p className="text-sm text-gray-400">{item.subtitle}</p>
        </div>
      </div>
    </Link>
  );

  if (!currentUser) return null; // or a loading state

  return (
    <SettingsLayout title="Settings" onBack={() => navigate('/')}>
      <div className="flex-grow flex flex-col">
        <Link to="/settings/profile" className="block hover:bg-[#202c33] border-b border-gray-700 transition-colors">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <img src={currentUser.avatar} alt={currentUser.name} className="h-16 w-16 rounded-full" />
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-white">{currentUser.name}</h2>
                <p className="text-sm text-gray-400">{currentUser.bio || currentUser.statusText || 'Hey there! I am using WhatsApp.'}</p>
              </div>
            </div>
            <QrCodeIcon className="h-6 w-6 text-primary" />
          </div>
        </Link>

        <div className="divide-y divide-gray-700 flex-shrink-0">
          {/* FIX: Pass the 'item' prop to the ListItem component. */}
          {settingsItems.map(item => (
            <ListItem key={item.title} item={item} />
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-auto border-t border-gray-700">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full hover:bg-[#202c33] transition-colors p-4 flex items-center disabled:opacity-50"
          >
            <div className="w-12 flex items-center justify-center">
              <LogoutIcon className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-red-500 font-medium">
                {loggingOut ? 'Logging out...' : 'Log Out'}
              </h3>
              <p className="text-sm text-gray-400">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
};

// FIX: Add default export to make the component available for import in other files.
export default SettingsScreen;