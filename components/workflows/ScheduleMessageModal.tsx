import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { scheduleMessage } from '../../services/firebase/scheduledMessage.service';
import { useAuth } from '../../context/AuthContext';

interface ScheduleMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string;
    onScheduled?: () => void;
}

const ScheduleMessageModal: React.FC<ScheduleMessageModalProps> = ({
    isOpen,
    onClose,
    chatId,
    onScheduled,
}) => {
    const { currentUser } = useAuth();
    const [message, setMessage] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [saving, setSaving] = useState(false);

    // Set default to tomorrow at current time
    React.useEffect(() => {
        if (isOpen) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = tomorrow.toISOString().split('T')[0];
            const timeStr = tomorrow.toTimeString().slice(0, 5);
            setScheduledDate(dateStr);
            setScheduledTime(timeStr);
        }
    }, [isOpen]);

    const handleSchedule = async () => {
        if (!message.trim() || !scheduledDate || !scheduledTime || !currentUser) {
            return;
        }

        setSaving(true);
        try {
            const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

            await scheduleMessage({
                userId: currentUser.id,
                chatId,
                content: message,
                messageType: 'text',
                scheduledFor: scheduledDateTime.toISOString(),
            });

            setMessage('');
            onScheduled?.();
            onClose();
            alert('Message scheduled successfully!');
        } catch (error) {
            console.error('Error scheduling message:', error);
            alert('Failed to schedule message');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#111b21] rounded-lg w-full max-w-md border border-gray-800 m-4">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">Schedule Message</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Message Input */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full bg-[#202c33] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            placeholder="Type your message..."
                        />
                    </div>

                    {/* Date Picker */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Date
                        </label>
                        <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-[#202c33] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Time Picker */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Time
                        </label>
                        <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full bg-[#202c33] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Preview */}
                    {scheduledDate && scheduledTime && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <p className="text-xs text-blue-400 font-semibold mb-1">
                                📅 Scheduled for:
                            </p>
                            <p className="text-sm text-white">
                                {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#202c33] hover:bg-[#2a3942] text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSchedule}
                        disabled={saving || !message.trim() || !scheduledDate || !scheduledTime}
                        className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Scheduling...' : 'Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleMessageModal;
