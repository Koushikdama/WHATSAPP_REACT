import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Conversation } from '../../types';
import { DoubleCheckIcon, DeletedIcon } from '../icons';
import { useAppContext } from '../../context/AppContext';
import { formatTimestamp } from '../../utils/date/dateFormatter';

interface ChatListItemProps {
  conversation: Conversation;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ conversation }) => {
  const navigate = useNavigate();
  const { setSelectedChat, currentUser } = useAppContext();

  const lastMessageIsDeleted = conversation.lastMessage === 'This message was deleted'; // Simple check

  const handleClick = () => {
    // For individual chats, navigate using the other user's ID
    // For group chats, use the conversation ID
    let targetId = conversation.id;

    if (conversation.conversationType === 'INDIVIDUAL' && conversation.participants) {
      // Find the other user's ID (not the current user)
      const otherUserId = conversation.participants.find(p => p !== currentUser?.id);
      if (otherUserId) {
        targetId = otherUserId;
      }
    }

    const currentPath = window.location.hash.replace('#', '');
    const targetPath = `/chat/${targetId}`;

    if (currentPath === targetPath) {
      return; // Already on this chat
    }

    setSelectedChat(conversation);
    navigate(targetPath);
  };

  const renderLastMessage = () => {
    // A more robust check might be needed depending on API response
    if (lastMessageIsDeleted) {
      return (
        <div className="flex items-center space-x-1">
          <DeletedIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <p className="truncate italic text-gray-400">{conversation.lastMessage}</p>
        </div>
      );
    }

    const content = conversation.lastMessageType === 'IMAGE' ? 'Photo' : conversation.lastMessage;
    return <p className="truncate">{content}</p>;
  };

  return (
    <motion.div
      onClick={handleClick}
      className="flex items-center p-3 hover:bg-[#202c33] cursor-pointer border-b border-gray-700"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(32, 44, 51, 0.8)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <img src={conversation.profileImage} alt={conversation.name} className="h-12 w-12 rounded-full mr-4" />
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-white">{conversation.name}</h3>
          <p className={`text-xs ${conversation.unreadCount > 0 ? 'text-primary' : 'text-gray-400'}`}>{formatTimestamp(conversation.lastMessageAt)}</p>
        </div>
        <div className="flex justify-between items-start text-sm text-gray-400">
          <div className="flex items-center space-x-1 truncate w-4/5">
            {currentUser && conversation.lastMessageSentById === currentUser.id && !lastMessageIsDeleted && <DoubleCheckIcon className={`w-4 h-4 text-blue-400`} />}
            {renderLastMessage()}
          </div>
          {conversation.unreadCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default memo(ChatListItem);