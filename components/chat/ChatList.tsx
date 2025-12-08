import React from 'react';
import ChatListItem from '../chat/ChatListItem';
import { useAppContext } from '../../context/AppContext';
import { ChatFilter } from '../../types';

interface ChatListProps {
  filter: ChatFilter;
  searchTerm: string;
}

const ChatList = ({ filter, searchTerm }: ChatListProps) => {
  const { conversations, loading, error, isLockedViewActive } = useAppContext();

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <p>Loading chats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  const filteredConversations = React.useMemo(() => {
    return conversations
      .filter((conv) => isLockedViewActive ? conv.isLocked : !conv.isLocked)
      .filter((conv) => {
        if (filter === ChatFilter.All) return true;
        if (filter === ChatFilter.Chat) return conv.conversationType === 'INDIVIDUAL';
        if (filter === ChatFilter.Group) return conv.conversationType === 'GROUP';
        return false;
      })
      .filter((conv) => {
        return conv.name?.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [conversations, isLockedViewActive, filter, searchTerm]);


  return (
    <div className="flex-grow overflow-y-auto">
      {filteredConversations.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <svg className="h-20 w-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {isLockedViewActive ? 'No locked chats' : 'No chats yet'}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mb-6">
            {isLockedViewActive
              ? 'Use the passcode manager to lock important conversations'
              : 'Start a new conversation to begin chatting'}
          </p>
        </div>
      )}
      {filteredConversations.map((conv) => (
        <ChatListItem key={conv.id} conversation={conv} />
      ))}
    </div>
  );
};

export default ChatList;