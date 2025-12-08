import React, { useState, useEffect } from 'react';
import { Message, Thread } from '../../types';
import { X, MessageSquare, Users } from 'lucide-react';
import MessageBubble from '../chat/MessageBubble';
import MessageComposer from '../chat/MessageComposer';

interface ThreadViewProps {
    parentMessage: Message;
    chatId: string;
    onClose: () => void;
    isOpen: boolean;
}

const ThreadView: React.FC<ThreadViewProps> = ({ parentMessage, chatId, onClose, isOpen }) => {
    const [threadReplies, setThreadReplies] = useState<Message[]>([]);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);

    useEffect(() => {
        if (isOpen && parentMessage.threadId) {
            // TODO: Fetch thread replies from Firebase
            // For now, using empty array
            setThreadReplies([]);
        }
    }, [isOpen, parentMessage.threadId]);

    const handleMessageSent = (newMessage: Message) => {
        // Add thread metadata to the message
        const threadMessage = {
            ...newMessage,
            threadId: parentMessage.id,
        };
        // TODO: Send to Firebase
        setThreadReplies([...threadReplies, threadMessage]);
    };

    const handleReply = (message: Message) => {
        setReplyingTo(message);
    };

    const handleEdit = (message: Message) => {
        setEditingMessage(message);
    };

    const handleClearReply = () => {
        setReplyingTo(null);
    };

    const handleEditComplete = () => {
        setEditingMessage(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-[#111b21] border-l border-gray-700 z-50 flex flex-col shadow-2xl">
            {/* Thread Header */}
            <div className="bg-[#202c33] p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <div>
                        <h3 className="font-semibold text-white">Thread</h3>
                        <p className="text-xs text-gray-400">
                            {threadReplies.length} {threadReplies.length === 1 ? 'reply' : 'replies'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Parent Message */}
            <div className="bg-[#0d1418] p-4 border-b border-gray-700">
                <div className="flex items-start space-x-2">
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-primary mb-1">
                            {parentMessage.senderName || 'User'}
                        </p>
                        <p className="text-sm text-white whitespace-pre-wrap">
                            {parentMessage.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            {new Date(parentMessage.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Thread participants */}
                {parentMessage.threadParticipants && parentMessage.threadParticipants.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-700">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-400">
                            {parentMessage.threadParticipants.length} {parentMessage.threadParticipants.length === 1 ? 'participant' : 'participants'}
                        </span>
                    </div>
                )}
            </div>

            {/* Thread Replies */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {threadReplies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="h-12 w-12 text-gray-600 mb-3" />
                        <p className="text-gray-400">No replies yet</p>
                        <p className="text-sm text-gray-500 mt-1">Be the first to reply in this thread</p>
                    </div>
                ) : (
                    threadReplies.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            chatId={chatId}
                            bubbleColor="#00a884"
                            onActionSuccess={() => { }}
                            onReply={handleReply}
                            onEdit={handleEdit}
                            selectionMode={false}
                            isSelected={false}
                            onToggleSelection={() => { }}
                            onEnterSelectionMode={() => { }}
                        />
                    ))
                )}
            </div>

            {/* Thread Reply Composer */}
            <div className="border-t border-gray-700">
                <MessageComposer
                    onMessageSent={handleMessageSent}
                    replyingTo={replyingTo}
                    onClearReply={handleClearReply}
                    editingMessage={editingMessage}
                    onEditComplete={handleEditComplete}
                />
            </div>
        </div>
    );
};

export default ThreadView;
