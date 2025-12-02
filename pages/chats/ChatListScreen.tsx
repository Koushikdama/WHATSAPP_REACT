import React, { useState } from 'react';
import ChatList from '../../components/chat/ChatList';
import SidebarHeader from '../../components/layout/SidebarHeader';
import BottomNav from '../../components/layout/BottomNav';
import { useAppContext } from '../../context/AppContext';
import useResponsive from '../../hooks/useResponsive';
import NewChatScreen from '../contacts/NewChatScreen';
import { Link } from 'react-router-dom';
import { SearchIcon, MessagePlusIcon } from '../../components/icons';
import { ChatFilter } from '../../types';
import NotificationList from '../../components/notifications/NotificationList';

const ChatListScreen = () => {
  const [filter, setFilter] = useState<ChatFilter>(ChatFilter.All);
  const [searchTerm, setSearchTerm] = useState('');
  const isDesktop = useResponsive();

  const filters: ChatFilter[] = [ChatFilter.All, ChatFilter.Chat, ChatFilter.Group, ChatFilter.Notifications];

  return (
    <div className="flex flex-col h-full bg-[#111b21] relative">
      {!isDesktop && <SidebarHeader />}
      <div className="p-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={filter === ChatFilter.Notifications ? "Search notifications" : "Search or start new chat"}
            className="form-control form-control-sm w-full bg-[#202c33] border-transparent rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:bg-[#2a3942] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="px-3 py-2 flex space-x-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm rounded-full transition-colors border-0 whitespace-nowrap ${filter === f
              ? 'bg-primary text-white'
              : 'bg-[#202c33] text-gray-300 hover:bg-[#2a3942]'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Render NotificationList when Notifications tab is active */}
      {filter === ChatFilter.Notifications ? (
        <NotificationList />
      ) : (
        <ChatList filter={filter} searchTerm={searchTerm} />
      )}
    </div>
  );
};

export default ChatListScreen;