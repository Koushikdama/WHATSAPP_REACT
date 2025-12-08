import React, { useState } from 'react';
import { Channel } from '../../types';
import { Hash, Volume2, Megaphone, Plus, Settings, ChevronDown, ChevronRight } from 'lucide-react';

interface ChannelListProps {
    channels: Channel[];
    activeChannelId?: string;
    onChannelSelect: (channelId: string) => void;
    onCreateChannel?: () => void;
    canManageChannels?: boolean;
}

const ChannelList: React.FC<ChannelListProps> = ({
    channels,
    activeChannelId,
    onChannelSelect,
    onCreateChannel,
    canManageChannels = false,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const getChannelIcon = (type: Channel['type']) => {
        switch (type) {
            case 'voice':
                return <Volume2 className="h-4 w-4" />;
            case 'announcement':
                return <Megaphone className="h-4 w-4" />;
            default:
                return <Hash className="h-4 w-4" />;
        }
    };

    const sortedChannels = [...channels].sort((a, b) => a.position - b.position);

    return (
        <div className="bg-[#111b21] border-r border-gray-700">
            {/* Channels Header */}
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors flex-1"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="font-semibold text-sm">CHANNELS</span>
                    <span className="text-xs text-gray-500">({channels.length})</span>
                </button>

                {canManageChannels && onCreateChannel && (
                    <button
                        onClick={onCreateChannel}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                        title="Create Channel"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Channel List */}
            {!isCollapsed && (
                <div className="py-2 space-y-1">
                    {sortedChannels.map((channel) => {
                        const isActive = channel.id === activeChannelId;

                        return (
                            <button
                                key={channel.id}
                                onClick={() => onChannelSelect(channel.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-2 transition-colors ${isActive
                                        ? 'bg-[#2a3942] text-white border-l-4 border-primary'
                                        : 'text-gray-300 hover:bg-[#202c33] border-l-4 border-transparent'
                                    }`}
                            >
                                <div className={isActive ? 'text-primary' : 'text-gray-400'}>
                                    {getChannelIcon(channel.type)}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium truncate">{channel.name}</p>
                                    {channel.description && (
                                        <p className="text-xs text-gray-500 truncate">{channel.description}</p>
                                    )}
                                </div>
                                {channel.type === 'announcement' && (
                                    <div className="px-2 py-0.5 bg-yellow-600/20 rounded text-xs text-yellow-400">
                                        Announce
                                    </div>
                                )}
                            </button>
                        );
                    })}

                    {channels.length === 0 && (
                        <div className="px-4 py-8 text-center">
                            <Hash className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No channels yet</p>
                            {canManageChannels && (
                                <p className="text-xs text-gray-600 mt-1">Create your first channel</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChannelList;
