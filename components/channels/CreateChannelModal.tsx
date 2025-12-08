import React, { useState } from 'react';
import { Channel } from '../../types';
import { X, Hash, Volume2, Megaphone } from 'lucide-react';

interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateChannel: (channel: Omit<Channel, 'id' | 'createdAt' | 'createdBy'>) => void;
    groupId: string;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
    isOpen,
    onClose,
    onCreateChannel,
    groupId,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<Channel['type']>('text');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        onCreateChannel({
            groupId,
            name: name.trim(),
            description: description.trim() || undefined,
            type,
            position: 0, // Will be set by backend based on existing channels
        });

        // Reset form
        setName('');
        setDescription('');
        setType('text');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#202c33] rounded-lg w-full max-w-md p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Create Channel</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Channel Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Channel Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('text')}
                                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${type === 'text'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <Hash className="h-6 w-6 mb-1" />
                                <span className="text-xs">Text</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('voice')}
                                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${type === 'voice'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <Volume2 className="h-6 w-6 mb-1" />
                                <span className="text-xs">Voice</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('announcement')}
                                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${type === 'announcement'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <Megaphone className="h-6 w-6 mb-1" />
                                <span className="text-xs">Announce</span>
                            </button>
                        </div>
                    </div>

                    {/* Channel Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Channel Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., general, random, announcements"
                            className="w-full bg-[#111b21] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this channel about?"
                            rows={3}
                            className="w-full bg-[#111b21] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    {/* Info */}
                    {type === 'announcement' && (
                        <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3">
                            <p className="text-xs text-yellow-400">
                                <strong>Announcement channels</strong> can only be posted in by admins. Perfect for important updates.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setName('');
                                setDescription('');
                                setType('text');
                                onClose();
                            }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-lg py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Channel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateChannelModal;
