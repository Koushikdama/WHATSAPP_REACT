import React, { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, GroupInfo } from '../../types';
import { CheckIcon, DoubleCheckIcon, CaretDownIcon, DeletedIcon, ReplyIcon, CheckCircleIcon, DocumentIcon } from '../icons';
import { useAppContext } from '../../context/AppContext';
import { formatTimestamp } from '../../utils/date/dateFormatter';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { useGroupPermissions } from '../../hooks/useGroupPermissions';

interface MessageBubbleProps {
  message: Message;
  chatId: string;
  bubbleColor: string;
  receivedBubbleColor?: string;
  onActionSuccess: () => void;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (messageIds: string[]) => void;
  onEnterSelectionMode: (messageIds: string[]) => void;
  searchTerm?: string;
  showingReactions?: string | null; // ID of message showing reactions
  onShowReactions?: (messageId: string | null) => void; // Callback to set which message shows reactions
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  chatId,
  bubbleColor,
  receivedBubbleColor,
  onActionSuccess,
  onReply,
  onEdit,
  selectionMode,
  isSelected,
  onToggleSelection,
  onEnterSelectionMode,
  searchTerm,
  showingReactions,
  onShowReactions
}) => {
  const { currentUser, deleteMessage, conversations, reactToMessage, voteOnPoll, users } = useAppContext();

  if (!currentUser) return null;

  const isSent = message.senderId === currentUser.id;
  const chat = conversations.find(c => c.id === chatId);

  // Get group info if it's a group chat
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  useEffect(() => {
    const fetchGroupInfo = async () => {
      if (chat?.conversationType === 'GROUP') {
        try {
          const { getGroupInfo } = await import('../../api');
          const info = await getGroupInfo(chat.id, currentUser.id);
          setGroupInfo(info);
        } catch (error) {
          console.error('Failed to fetch group info:', error);
        }
      }
    };
    fetchGroupInfo();
  }, [chat, currentUser]);

  const permissions = useGroupPermissions(groupInfo, currentUser.id);
  const canDeleteForEveryone = isSent || permissions.canDeleteMessage(message.senderId);

  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const deleteTypeRef = useRef<'me' | 'everyone' | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  // Removed local showReactions state - now controlled by parent
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  const gestureRef = useRef({ isDragging: false, didLongPress: false });
  const longPressTimer = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    gestureRef.current = { isDragging: false, didLongPress: false };
    if (!selectionMode) {
      longPressTimer.current = window.setTimeout(() => {
        onEnterSelectionMode([message.id]);
        gestureRef.current.didLongPress = true;
        longPressTimer.current = null;
      }, 500);
    }
  };

  const handlePointerMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    gestureRef.current.isDragging = true;
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (selectionMode && !gestureRef.current.didLongPress && !gestureRef.current.isDragging) {
      onToggleSelection([message.id]);
    }
  };

  const performDelete = async () => {
    if (!chat || !deleteTypeRef.current) return;
    const success = await deleteMessage(chat.id, message.id, deleteTypeRef.current, chat.conversationType);
    if (success) {
      onActionSuccess();
    }
    setDeleteConfirmOpen(false);
    deleteTypeRef.current = null;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReaction = async (emoji: string) => {
    await reactToMessage(chatId, message.id, emoji);
    onShowReactions?.(null); // Hide reactions after selecting
    onActionSuccess(); // Re-fetch to show updated reactions
  };

  const handleVote = async (optionIndex: number) => {
    await voteOnPoll(chatId, message.id, optionIndex);
    onActionSuccess(); // Re-fetch to show updated poll results
  };

  const handleDeleteClick = (type: 'me' | 'everyone') => {
    deleteTypeRef.current = type;
    setDeleteConfirmOpen(true);
    setIsOptionsOpen(false);
  };

  const renderStatus = () => {
    if (!isSent || !message.status) return null;
    if (message.isSeen) return <DoubleCheckIcon className="w-4 h-4 text-blue-400" />;
    switch (message.status) {
      case 'read': return <DoubleCheckIcon className="w-4 h-4 text-blue-400" />;
      case 'delivered': return <DoubleCheckIcon className="w-4 h-4 text-gray-500" />;
      case 'sent': return <CheckIcon className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  if (message.deleteForEveryone) {
    return (
      <div className={`flex my-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
        <div className={`rounded-lg px-3 py-2 max-w-md bg-[#202c33] italic text-gray-400 flex items-center space-x-2`}>
          <DeletedIcon className="h-4 w-4" />
          <span>This message was deleted</span>
        </div>
      </div>
    );
  }
  if (message.deleteFor?.includes(currentUser.id)) return null;

  const renderPoll = () => {
    if (!message.pollInfo) return null;
    const { question, options } = message.pollInfo;
    const totalVotes = options.reduce((sum, opt) => sum + opt.voters.length, 0);
    const userVoteIndex = options.findIndex(opt => opt.voters.includes(currentUser.id));

    return (
      <div className="mt-2 space-y-2">
        <p className="font-bold">{question}</p>
        <div className="space-y-2">
          {options.map((option, index) => {
            const voteCount = option.voters.length;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            const isVotedByUser = userVoteIndex === index;

            return (
              <div key={index} onClick={() => handleVote(index)} className="relative p-2 rounded-lg border border-gray-500 hover:bg-white/10 cursor-pointer">
                <div className="absolute top-0 left-0 h-full bg-primary/30 rounded-lg" style={{ width: `${percentage}%` }}></div>
                <div className="relative flex justify-between items-center">
                  <span className={isVotedByUser ? "font-bold" : ""}>{option.text}</span>
                  <div className="flex items-center space-x-2">
                    {isVotedByUser && <CheckIcon className="h-4 w-4 text-primary" />}
                    <span className="text-xs text-gray-400">{voteCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-1">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
      </div>
    );
  };

  const renderContent = () => {
    switch (message.messageType) {
      case 'image':
        return <img src={message.fileInfo?.url} alt={message.fileInfo?.name} className="rounded-md max-w-full" />;
      case 'video':
        return <video src={message.fileInfo?.url} controls className="rounded-md max-w-full" />;
      case 'document':
        return (
          <div className="flex items-center bg-gray-800/50 p-2 rounded-md">
            <DocumentIcon className="h-8 w-8 text-gray-400 mr-2" />
            <div>
              <p className="font-semibold">{message.fileInfo?.name}</p>
              <p className="text-xs text-gray-400">{message.fileInfo?.size}</p>
            </div>
          </div>
        );
      case 'voice':
        return (
          <div className="flex items-center">
            <audio controls src={message.content} className="w-full h-8"></audio>
          </div>
        );
      case 'poll':
        return renderPoll();
      default: {
        if (searchTerm && message.content.toLowerCase().includes(searchTerm.toLowerCase())) {
          const parts = message.content.split(new RegExp(`(${searchTerm})`, 'gi'));
          return (
            <p className="whitespace-pre-wrap">
              {parts.map((part, index) =>
                part.toLowerCase() === searchTerm.toLowerCase() ? (
                  <span key={index} className="bg-yellow-500/50 rounded">{part}</span>
                ) : (
                  part
                )
              )}
            </p>
          );
        }
        return <p className="whitespace-pre-wrap">{message.content}</p>;
      }
    }
  };

  const bubbleStyle = isSent
    ? { backgroundColor: bubbleColor }
    : (receivedBubbleColor
      ? { backgroundColor: receivedBubbleColor }
      : (bubbleColor ? { backgroundColor: bubbleColor, filter: 'brightness(0.6) saturate(0.8)' } : {})
    );
  const senderName = users.find(u => u.id === message.senderId)?.name;

  return (
    <motion.div
      className={`flex my-1 relative ${isSent ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: 0.8,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        transition: {
          duration: 0.3,
          ease: "easeInOut"
        }
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      layout
    >
      <div
        className={`relative ${isSelected ? 'bg-emerald-500/20' : ''} rounded-lg`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {selectionMode && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30">
            {isSelected
              ? <CheckCircleIcon className="w-6 h-6 text-primary" />
              : <div className="w-6 h-6 rounded-full border-2 border-gray-500 bg-[#111b21]"></div>
            }
          </div>
        )}

        <div
          className={`group relative w-auto ${selectionMode ? (isSent ? 'mr-10' : 'ml-10') : ''}`}
          onMouseEnter={() => !selectionMode && onShowReactions?.(message.id)}
          onMouseLeave={() => !selectionMode && onShowReactions?.(null)}
        >
          {showingReactions === message.id && (
            <div
              className={`absolute -top-10 z-20 flex bg-[#2a3942] p-1 rounded-full shadow-lg transition-opacity ${isSent ? 'right-0' : 'left-0'}`}
              onMouseLeave={(e) => {
                e.stopPropagation();
              }}
            >
              {EMOJI_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReaction(emoji);
                  }}
                  className="p-1 text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <div
            className={`rounded-lg px-3 py-2 max-w-md relative ${isSent ? '' : 'bg-[#202c33]'}`}
            style={bubbleStyle}>

            {chat?.conversationType === 'GROUP' && !isSent && senderName && <p className="text-xs font-semibold text-primary mb-1">{senderName}</p>}

            {/* Replied message preview - shows what message this is replying to */}
            {message.replyMessageId && (
              <div className="mb-2 p-2 bg-black/30 rounded-md border-l-4 border-primary cursor-pointer hover:bg-black/40 transition-colors">
                <div className="flex items-start space-x-2">
                  <ReplyIcon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-primary">{message.replyMessageSender || 'Unknown'}</p>
                    <p className="text-xs opacity-70 truncate text-gray-300 mt-0.5">{message.replyMessageContent || 'Message'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Current message content */}
            {renderContent()}

            {message.reactions && Object.values(message.reactions).some(v => Array.isArray(v) && v.length > 0) && (
              <div className="absolute -bottom-4 right-2 flex space-x-1 z-10">
                {Object.entries(message.reactions).map(([emoji, userIds]) =>
                  Array.isArray(userIds) && userIds.length > 0 ? (
                    <div key={emoji} className="bg-[#2a3942] rounded-full px-1.5 py-0.5 flex items-center text-xs shadow">
                      <span>{emoji}</span>
                      <span className="ml-1 text-white">{userIds.length}</span>
                    </div>
                  ) : null
                )}
              </div>
            )}

            <div className="flex justify-end items-center mt-1 text-white">
              {message.isEdited && <span className="text-xs text-gray-400 mr-1">Edited</span>}
              <p className="text-xs text-gray-400 mr-1">{formatTimestamp(message.timestamp)}</p>
              {renderStatus()}
            </div>

            <div className={`absolute top-1 right-1 z-10`}>
              <button onClick={() => setIsOptionsOpen(o => !o)} className={`p-1 rounded-full transition-opacity opacity-0 group-hover:opacity-100 ${isOptionsOpen ? 'opacity-100' : ''}`}>
                <CaretDownIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
          {isOptionsOpen && (
            <div ref={optionsMenuRef} className={`absolute top-0 mt-8 w-48 bg-[#233138] rounded-md shadow-lg z-20 py-1 ${isSent ? 'right-0' : 'left-auto'}`}>
              <button onClick={() => { onReply(message); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#111b21]">Reply</button>
              {isSent && message.messageType === 'text' && <button onClick={() => { onEdit(message); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#111b21]">Edit</button>}
              <button onClick={() => handleDeleteClick('me')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#111b21]">Delete for me</button>
              {canDeleteForEveryone && <button onClick={() => handleDeleteClick('everyone')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#111b21]">Delete for everyone</button>}
            </div>
          )}
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={performDelete}
        title={`Delete message?`}
        confirmText="Delete"
        isDanger={true}
      >
        <p>Are you sure you want to delete this message?</p>
      </ConfirmationDialog>
    </motion.div>
  );
};

export default memo(MessageBubble);