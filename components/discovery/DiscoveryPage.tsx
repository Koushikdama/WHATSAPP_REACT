import React, { useState } from 'react';
import { Search, UserPlus, MapPin, Users } from 'lucide-react';

interface DiscoveryPageProps {
    onUserSelect: (userId: string) => void;
}

const DiscoveryPage: React.FC<DiscoveryPageProps> = ({ onUserSelect }) => {
    const [activeTab, setActiveTab] = useState<'search' | 'nearby' | 'groups'>('search');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = [
        { id: 'search', label: 'Search Users', icon: Search },
        { id: 'nearby', label: 'Nearby', icon: MapPin },
        { id: 'groups', label: 'Public Groups', icon: Users },
    ];

    return (
        <div className="h-full flex flex-col bg-[#111b21]">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-white mb-4">Discover</h1>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by username or name..."
                        className="w-full bg-[#202c33] text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 transition-colors ${activeTab === tab.id
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'search' && (
                    <div className="text-center py-12">
                        <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Search for users by username</p>
                        <p className="text-sm text-gray-500 mt-1">e.g., @username or full name</p>
                    </div>
                )}

                {activeTab === 'nearby' && (
                    <div className="text-center py-12">
                        <MapPin className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Find people nearby</p>
                        <p className="text-sm text-gray-500 mt-2 mb-4">
                            Enable location to discover users around you
                        </p>
                        <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">
                            Enable Location
                        </button>
                    </div>
                )}

                {activeTab === 'groups' && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">CATEGORIES</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['Technology', 'Gaming', 'Sports', 'Music', 'Education', 'Business'].map((category) => (
                                <button
                                    key={category}
                                    className="p-4 bg-[#202c33] hover:bg-[#2a3942] rounded-lg text-white text-sm font-medium transition-colors"
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscoveryPage;
