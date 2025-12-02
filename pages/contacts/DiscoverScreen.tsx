import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';
import { searchUsers, getFollowers, getFollowing, getUsers } from '../../api';
import UserList from '../../components/user/UserList';
import { SearchIcon } from '../../components/icons';

type Tab = 'Discover' | 'Following' | 'Followers';

const DiscoverScreen = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('Discover');
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, currentUser]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'Discover') {
                fetchData();
            }
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const fetchData = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            let data: User[] = [];
            if (activeTab === 'Discover') {
                if (searchQuery) {
                    data = await searchUsers(searchQuery);
                } else {
                    // Fetch suggested users (all users for now, filtered by not following)
                    const allUsers = await getUsers();
                    // Filter out self and already following
                    // Note: In a real app, the backend would handle "suggested" logic
                    const following = await getFollowing(currentUser.id);
                    const followingIds = following.map(u => u.id);
                    data = allUsers.filter(u => u.id !== currentUser.id && !followingIds.includes(u.id));
                }
            } else if (activeTab === 'Following') {
                // Check if current user has hidden their following list
                if (currentUser.hideFollowing) {
                    // User has hidden their own following list, just show it to them
                    data = await getFollowing(currentUser.id);
                } else {
                    data = await getFollowing(currentUser.id);
                }
            } else if (activeTab === 'Followers') {
                // Check if current user has hidden their followers list
                if (currentUser.hideFollowers) {
                    // User has hidden their own followers list, just show it to them
                    data = await getFollowers(currentUser.id);
                } else {
                    data = await getFollowers(currentUser.id);
                }
            }
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SettingsLayout title="Discover People" onBack={() => navigate('/')}>
            {/* Search Bar */}
            <div className="p-4 bg-[#202c33]">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search people..."
                        className="w-full bg-[#111b21] text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 bg-[#111b21]">
                {(['Discover', 'Following', 'Followers'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                        className={`flex-1 p-3 text-sm font-semibold transition-colors ${activeTab === tab
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-[#111b21]">
                <UserList
                    users={users}
                    loading={loading}
                    emptyMessage={
                        activeTab === 'Discover'
                            ? 'No users found.'
                            : activeTab === 'Following'
                                ? 'You are not following anyone yet.'
                                : 'You have no followers yet.'
                    }
                />
            </div>
        </SettingsLayout>
    );
};

export default DiscoverScreen;
