import React from 'react';
import { useLocation } from 'react-router-dom';
import SidebarHeader from './SidebarHeader';
import ChatListScreen from '../../pages/chats/ChatListScreen';
import StatusScreen from '../../pages/status/StatusScreen';
import CallsScreen from '../../pages/calls/CallsScreen';
import BottomNav from './BottomNav';
import useResponsive from '../../hooks/useResponsive';


const Sidebar = () => {
  const location = useLocation();
  const isDesktop = useResponsive();

  const renderContent = () => {
    // Both desktop and mobile now respect routing
    switch (location.pathname) {
      case '/status':
        return <StatusScreen />;
      case '/calls':
        return <CallsScreen />;
      case '/':
      default:
        return <ChatListScreen />;
    }
  };

  const showHeader = isDesktop || location.pathname !== '/';

  return (
    <div className="flex flex-col w-full lg:w-[35%] lg:max-w-[450px] h-full bg-[#111b21] border-r border-gray-700">
      {showHeader && <SidebarHeader />}
      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
      {!isDesktop && <BottomNav />}
    </div>
  );
};

export default Sidebar;