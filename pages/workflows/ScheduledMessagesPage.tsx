import React, { useEffect, useState } from 'react';
import { Clock, Trash2, Edit, Calendar, MessageCircle } from 'lucide-react';
import {
    getUserScheduledMessages,
    cancelScheduledMessage,
    deleteScheduledMessage,
} from '../../services/firebase/scheduledMessage.service';
import { useAuth } from '../../context/AuthContext';
import { ScheduledMessage } from '../../types/workflow.types';
import { format } from 'date-fns';

const ScheduledMessagesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'cancelled'>('pending');

    useEffect(() => {
        if (currentUser) {
            loadScheduledMessages();
        }
    }, [currentUser]);

    const loadScheduledMessages = async () => {
        if (!currentUser) return;

        try {
            const messages = await getUserScheduledMessages(currentUser.id);
            setScheduledMessages(messages);
        } catch (error) {
            console.error('Error loading scheduled messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (messageId: string) => {
        if (!confirm('Cancel this scheduled message?')) return;

        try {
            await cancelScheduledMessage(messageId);
            await loadScheduledMessages();
        } catch (error) {
            console.error('Error cancelling message:', error);
        }
    };

    const handleDelete = async (messageId: string) => {
        if (!confirm('Delete this scheduled message?')) return;

        try {
            await deleteScheduledMessage(messageId);
            await loadScheduledMessages();
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const filteredMessages = scheduledMessages.filter((msg) => {
        if (filter === 'all') return true;
        return msg.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-blue-500/20 text-blue-400';
            case 'sent':
                return 'bg-green-500/20 text-green-400';
            case 'failed':
                return 'bg-red-500/20 text-red-400';
            case 'cancelled':
                return 'bg-gray-500/20 text-gray-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0b141a] text-white">
                <p>Loading scheduled messages...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b141a] text-white">
            {/* Header */}
            <div className="bg-[#111b21] border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Scheduled Messages</h1>
                        <p className="text-gray-400">Manage your scheduled messages</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex space-x-2 mt-6">
                        {['all', 'pending', 'sent', 'cancelled'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-4 py-2 rounded-lg transition-colors ${filter === f
                                        ? 'bg-primary text-white'
                                        : 'bg-[#202c33] text-gray-400 hover:bg-[#2a3942]'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {filteredMessages.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-[#202c33] rounded-full flex items-center justify-center mb-6">
                            <Clock className="h-12 w-12 text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">No scheduled messages</h3>
                        <p className="text-gray-400">
                            {filter === 'pending'
                                ? 'You have no pending scheduled messages'
                                : 'No messages found'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMessages.map((message) => (
                            <div
                                key={message.id}
                                className="bg-[#111b21] border border-gray-800 rounded-lg p-6 hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Message Content */}
                                        <div className="mb-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <MessageCircle className="h-5 w-5 text-gray-400" />
                                                <span className="text-sm text-gray-400">Message</span>
                                            </div>
                                            <p className="text-white text-base">{message.content}</p>
                                        </div>

                                        {/* Schedule Info */}
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center text-gray-400">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                <span>
                                                    {format(new Date(message.scheduledFor), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-gray-400">
                                                <Clock className="h-4 w-4 mr-2" />
                                                <span>
                                                    {format(new Date(message.scheduledFor), 'hh:mm a')}
                                                </span>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                    message.status
                                                )}`}
                                            >
                                                {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                            </span>
                                        </div>

                                        {/* Sent/Error Info */}
                                        {message.sentAt && (
                                            <div className="mt-3 text-xs text-gray-500">
                                                Sent at: {format(new Date(message.sentAt), 'MMM dd, yyyy hh:mm a')}
                                            </div>
                                        )}
                                        {message.error && (
                                            <div className="mt-3 text-xs text-red-400">Error: {message.error}</div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2 ml-4">
                                        {message.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancel(message.id)}
                                                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(message.id)}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduledMessagesPage;
