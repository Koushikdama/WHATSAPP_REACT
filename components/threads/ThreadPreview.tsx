import React from 'react';
import { Message } from '../../types';
import { MessageSquare, User } from 'lucide-react';
import { formatTimestamp } from '../../utils/date/dateFormatter';

interface ThreadPreviewProps {
    message: Message;
    onClick: () => void;
}

const ThreadPreview: React.FC<ThreadPreviewProps> = ({ message, onClick }) => {
    if (!message.isThreadStarter || !message.threadCount || message.threadCount === 0) {
        return null;
    }

    const { lastThreadReply, threadCount, threadParticipants } = message;

    return (
        <button
            onClick={onClick}
            className="mt-2 flex items-center space-x-2 text-xs text-primary hover:underline transition-colors group"
        >
            <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span className="font-semibold">
                    {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
                </span>
            </div>

            {lastThreadReply && (
                <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-300">
                            {lastThreadReply.senderName}
                        </span>
                        <span className="text-gray-500">
                            {formatTimestamp(lastThreadReply.timestamp)}
                        </span>
                    </div>
                </>
            )}

            {threadParticipants && threadParticipants.length > 1 && (
                <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">
                        {threadParticipants.length} participants
                    </span>
                </>
            )}

            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                View thread →
            </span>
        </button>
    );
};

export default ThreadPreview;
