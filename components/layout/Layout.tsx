import React, { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import useResponsive from '../../hooks/useResponsive';
import WelcomeScreen from '../../pages/chats/WelcomeScreen';
import ChatWindow from '../../pages/chats/ChatWindow';
import InfoPanel from '../panels/InfoPanel';
import { useAppContext } from '../../context/AppContext';

const Layout = () => {
  const isDesktop = useResponsive();
  const { id } = useParams<{ id: string }>();
  const [isInfoPanelOpen, setInfoPanelOpen] = useState(false);
  const { selectedChat } = useAppContext();

  if (isDesktop) {
    return (
      <div className="flex h-screen w-screen p-0 md:p-4">
        <div className="flex w-full h-full bg-[#222e35] shadow-2xl overflow-hidden">
          <Sidebar />
          <div className="flex-grow bg-[#0b141a] relative">
            <div className="absolute inset-0 transition-all duration-300 ease-in-out" style={{ right: isInfoPanelOpen && selectedChat ? '35%' : '0' }}>
              {id && selectedChat ? (
                <ChatWindow onHeaderClick={() => setInfoPanelOpen(true)} />
              ) : (
                <WelcomeScreen />
              )}
            </div>
            {isInfoPanelOpen && selectedChat && (
              <InfoPanel chat={selectedChat} onClose={() => setInfoPanelOpen(false)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="h-full w-full bg-[#111b21]">
      <div className={`${id ? 'hidden' : 'block'} h-full`}>
        <Sidebar />
      </div>
      <div className={`${id ? 'block' : 'hidden'} h-full`}>
        {id && <ChatWindow onHeaderClick={() => setInfoPanelOpen(true)} />}
      </div>
      {/* On mobile, InfoPanel could be a modal or a new screen. For simplicity, we'll reuse the desktop logic for now */}
      {isInfoPanelOpen && selectedChat && <InfoPanel chat={selectedChat} onClose={() => setInfoPanelOpen(false)} />}
    </div>
  );
};

export default Layout;