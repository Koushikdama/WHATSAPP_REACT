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
        <p className="text-center text-gray-400 mt-10">
          {isLockedViewActive ? 'No locked chats found.' : 'No chats found.'}
        </p>
      )}
      {filteredConversations.map((conv) => (
        <ChatListItem key={conv.id} conversation={conv} />
      ))}
    </div>
  );
};

export default ChatList;