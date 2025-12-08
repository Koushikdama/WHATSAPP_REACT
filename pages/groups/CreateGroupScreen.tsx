
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { getFollowers, getFollowing } from '../../api';
import { createChat } from '../../services/firebase/chat.service';
import { SearchIcon, CloseIcon } from '../../components/icons';

type ContactTab = 'Following' | 'Followers';

const CreateGroupScreen = () => {
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Select Participants
  const [activeTab, setActiveTab] = useState<ContactTab>('Following');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Step 2: Group Details
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Fetch users when tab changes
  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  // Filter users based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        allUsers.filter(user =>
          user.name.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, allUsers]);

  const fetchUsers = async () => {
    if (!authUser) return;
    setLoadingUsers(true);
    try {
      let users: User[] = [];

      if (activeTab === 'Following') {
        users = await getFollowing(authUser.uid);
      } else {
        users = await getFollowers(authUser.uid);
      }

      setAllUsers(users);
      setFilteredUsers(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load contacts');
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleParticipant = (user: User) => {
    setSelectedParticipants(prev => {
      const isSelected = prev.some(p => p.id === user.id);
      if (isSelected) {
        return prev.filter(p => p.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const removeParticipant = (userId: string) => {
    setSelectedParticipants(prev => prev.filter(p => p.id !== userId));
  };

  const handleContinue = () => {
    if (selectedParticipants.length < 1) {
      setError('Please select at least 1 participant');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCreateGroup = async () => {
    if (!authUser) return;
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setCreating(true);
    setError('');

    try {
      // Prepare participants list (current user + selected users)
      const participantIds = [authUser.uid, ...selectedParticipants.map(p => p.id)];

      // Create group chat
      const chatId = await createChat(
        participantIds,
        'group',
        {
          name: groupName,
          description: groupDescription || '',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=10b981&color=fff&size=200`,
          createdBy: authUser.uid,
        }
      );

      // Navigate to the new group chat
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
      setCreating(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setError('');
    } else {
      navigate(-1);
    }
  };

  if (!authUser) {
    return null;
  }

  return (
    <SettingsLayout
      title={step === 1 ? "Add Group Participants" : "New Group"}
      onBack={handleBack}
    >
      <div className="flex flex-col h-full bg-[#111b21]">
        {/* Step 1: Select Participants */}
        {step === 1 && (
          <>
            {/* Search Bar */}
            <div className="p-4 bg-[#111b21]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-full bg-[#202c33] text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Tabs for Following/Followers */}
            <div className="flex border-b border-gray-700 bg-[#111b21]">
              {(['Following', 'Followers'] as ContactTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                  className={`flex-1 p-3 text-sm font-semibold transition-colors ${activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Selected Participants */}
            {selectedParticipants.length > 0 && (
              <div className="px-4 pb-4 bg-[#111b21]">
                <div className="flex flex-wrap gap-3">
                  {selectedParticipants.map(user => (
                    <div
                      key={user.id}
                      className="flex flex-col items-center"
                    >
                      <div className="relative">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                          alt={user.name}
                          className="h-14 w-14 rounded-full object-cover"
                        />
                        <button
                          onClick={() => removeParticipant(user.id)}
                          className="absolute -top-1 -right-1 bg-gray-600 hover:bg-gray-700 rounded-full p-0.5"
                        >
                          <CloseIcon className="h-4 w-4 text-white" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-300 mt-1 max-w-[60px] truncate">{user.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-gray-700"></div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="spinner"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <svg className="h-16 w-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-400 mb-1">
                    {searchQuery
                      ? 'No contacts found'
                      : activeTab === 'Following'
                        ? 'You are not following anyone yet'
                        : 'You have no followers yet'
                    }
                  </p>
                  {!searchQuery && (
                    <p className="text-sm text-gray-500">
                      {activeTab === 'Following'
                        ? 'Follow people to add them to groups'
                        : 'Get followers to add to groups'
                      }
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  {filteredUsers.map(user => {
                    const isSelected = selectedParticipants.some(p => p.id === user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleParticipant(user)}
                        className="flex items-center p-4 hover:bg-[#202c33] cursor-pointer transition-colors active:bg-[#2a3942]"
                      >
                        {/* Avatar */}
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                          alt={user.name}
                          className="h-12 w-12 rounded-full object-cover mr-4"
                        />

                        {/* User Info */}
                        <div className="flex-1">
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.status || 'Hey there! I am using WhatsApp'}</p>
                        </div>

                        {/* Checkbox */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-gray-500'
                          }`}>
                          {isSelected && (
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Floating Action Button */}
            {selectedParticipants.length > 0 && (
              <button
                onClick={handleContinue}
                className="absolute bottom-6 right-6 bg-primary hover:opacity-90 active:opacity-80 text-white rounded-full p-4 shadow-lg transition-all z-10"
                title="Continue"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}
          </>
        )}

        {/* Step 2: Group Details */}
        {step === 2 && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Group Icon */}
            <div className="flex justify-center items-center p-8 bg-[#111b21]">
              <div className="relative">
                <div className="w-32 h-32 bg-[#2a3942] rounded-full flex items-center justify-center text-gray-400">
                  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-4 space-y-1 flex-1">
              {/* Group Name */}
              <div className="flex items-center bg-[#111b21] border-b border-gray-700 py-3">
                <input
                  type="text"
                  placeholder="Group subject"
                  className="flex-1 bg-transparent text-white text-lg focus:outline-none"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={25}
                  autoFocus
                />
                <span className="text-sm text-gray-500 ml-2">{groupName.length}/25</span>
              </div>

              {/* Group Description */}
              <div className="flex items-start bg-[#111b21] py-3">
                <textarea
                  placeholder="Group description (optional)"
                  className="flex-1 bg-transparent text-white focus:outline-none resize-none"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  rows={2}
                  maxLength={512}
                />
              </div>

              <p className="text-xs text-gray-500 pb-4">Provide an optional group description</p>

              {/* Participants Section */}
              <div className="pt-4">
                <p className="text-sm text-primary mb-2">Participants: {selectedParticipants.length + 1}</p>
                <div className="space-y-2">
                  {/* Current User */}
                  <div className="flex items-center p-2">
                    <img
                      src={authUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.displayName || 'You')}&background=random`}
                      alt="You"
                      className="h-10 w-10 rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <p className="text-white">You</p>
                      <p className="text-xs text-gray-400">Group admin</p>
                    </div>
                  </div>

                  {/* Selected Participants */}
                  {selectedParticipants.map(user => (
                    <div key={user.id} className="flex items-center p-2">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                        alt={user.name}
                        className="h-10 w-10 rounded-full mr-3"
                      />
                      <p className="text-white flex-1">{user.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Create Button */}
            <div className="p-4 bg-[#111b21]">
              {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || creating}
                className="absolute bottom-6 right-6 bg-primary hover:opacity-90 active:opacity-80 text-white rounded-full p-4 shadow-lg transition-all disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center"
                title="Create Group"
              >
                {creating ? (
                  <div className="spinner h-6 w-6"></div>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};

export default CreateGroupScreen;
