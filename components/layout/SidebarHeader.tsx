import React, { useState, useRef, useEffect } from 'react';
import { ThreeDotsIcon, MessagePlusIcon, SearchIcon, ChatIcon, StatusIcon, PhoneIcon } from '../icons';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import useResponsive from '../../hooks/useResponsive';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import NotificationBadge from '../ui/NotificationBadge';

const AnimatedHeaderTitle = () => {
  const { currentUser, themeSettings, promptAndToggleLockView, passcodeSettings } = useAppContext();
  const animation = themeSettings.headerAnimation || 'none';

  const handleDoubleClick = () => {
    if (!passcodeSettings.lockedChats.enabled) {
      alert("Locked Chats feature is disabled. Enable it in Settings > Passcode Manager.");
      return;
    }
    promptAndToggleLockView();
  };

  const TitleContent = () => {
    if (!currentUser) {
      return <>WhatsApp</>;
    }

    if (animation === 'none') {
      return <>{currentUser.name}</>;
    }

    const name = currentUser.name;
    const animationClass = `header-title-animated ${animation}`;
    return (
      <div className={animationClass}>
        {name.split('').map((char, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <h1
      className="text-xl font-semibold text-gray-200 cursor-pointer"
      onDoubleClick={handleDoubleClick}
    >
      <TitleContent />
    </h1>
  );
};

const DesktopTabs = () => {
  const activeLinkClass = "border-b-2 border-primary text-primary";
  const inactiveLinkClass = "text-gray-400 hover:text-gray-200";
  const baseLinkClass = "flex items-center space-x-2 px-4 py-3 transition-colors relative";

  return (
    <div className="hidden lg:flex bg-[#202c33] border-b border-gray-700">
      <NavLink to="/" end className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
        <ChatIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Chats</span>
      </NavLink>
      <NavLink to="/status" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
        <StatusIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Status</span>
      </NavLink>
      <NavLink to="/calls" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
        <PhoneIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Calls</span>
      </NavLink>
    </div>
  );
};

const SidebarHeader = () => {
  const isDesktop = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        console.log('🚪 Logging out from header menu...');
        await logout();
        console.log('✅ Logout successful, redirecting to login...');
        setMenuOpen(false);
        // Navigation is handled by App.tsx auth guard
      } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Failed to logout. Please try again.');
      }
    }
  };

  return (
    <>
      <header className="flex-shrink-0 bg-[#202c33] p-3 md:p-4 flex justify-between items-center">
        <AnimatedHeaderTitle />

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Notification Bell */}
          <Link to="/activity" className="text-gray-400 hover:text-gray-200 active:text-white relative p-2 -m-2 min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <NotificationBadge />
          </Link>

          {isDesktop && (
            <>
              <Link to="/new-chat" className="text-gray-400 hover:text-gray-200 active:text-white p-2 -m-2 min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors" title="New Chat">
                <MessagePlusIcon className="h-6 w-6" />
              </Link>
              <Link to="/create-group" className="text-gray-400 hover:text-gray-200 active:text-white p-2 -m-2 min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors" title="Create Group">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </Link>
            </>
          )}

          {!isDesktop && (
            <button className="text-gray-400 hover:text-gray-200 active:text-white p-2 -m-2 min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors">
              <SearchIcon className="h-6 w- 6" />
            </button>
          )}

          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400 hover:text-gray-200 active:text-white p-2 -m-2 min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors">
              <ThreeDotsIcon className="h-6 w-6" />
            </button>
            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-[#233138] rounded-md shadow-lg z-20 py-1">
                <button className="w-full text-left px-4 py-3 md:py-2.5 text-sm text-gray-300 hover:bg-[#111b21] active:bg-[#111b21] transition-colors">New group</button>
                <button className="w-full text-left px-4 py-3 md:py-2.5 text-sm text-gray-300 hover:bg-[#111b21] active:bg-[#111b21] transition-colors">Starred messages</button>
                <Link to="/settings" className="block w-full text-left px-4 py-3 md:py-2.5 text-sm text-gray-300 hover:bg-[#111b21] active:bg-[#111b21] transition-colors" onClick={() => setMenuOpen(false)}>Settings</Link>
                <Link to="/settings/chats" className="block w-full text-left px-4 py-3 md:py-2.5 text-sm text-gray-300 hover:bg-[#111b21] active:bg-[#111b21] transition-colors" onClick={() => setMenuOpen(false)}>Chats Settings</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 md:py-2.5 text-sm text-red-400 hover:bg-[#111b21] active:bg-[#111b21] font-medium transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <DesktopTabs />
    </>
  );
};

export default SidebarHeader;