import React from 'react';
import { User } from '../../types';
import FollowButton from '../ui/FollowButton';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

interface UserListProps {
    users: User[];
    loading?: boolean;
    emptyMessage?: string;
}

const UserList: React.FC<UserListProps> = ({ users, loading, emptyMessage = 'No users found.' }) => {
    const navigate = useNavigate();
    const { currentUser, addConversation, setSelectedChat, conversations } = useAppContext();

    const handleUserClick = async (user: User) => {
        if (!currentUser) return;

        // Check if chat exists in conversations
        let existingChat = conversations.find(
            c => c.conversationType === 'INDIVIDUAL' && c.participants?.includes(user.id)
        );

        if (existingChat) {
            setSelectedChat(existingChat);
            navigate(`/chat/${user.id}`);
        } else {
            // Create actual chat in Firestore
            try {
                const { createChat } = await import('../../services/firebase/chat.service');
                const chatId = await createChat([currentUser.id, user.id], 'individual');

                // Create conversation object with real chat ID
                const conversation = {
                    id: chatId,
                    conversationType: 'INDIVIDUAL' as const,
                    name: user.name,
                    profileImage: user.avatar,
                    isOnline: user.isOnline,
                    lastMessage: '',
                    lastMessageAt: new Date().toISOString(),
                    lastMessageType: 'text' as const,
                    lastMessageSentById: '',
                    lastMessageSentByName: '',
                    unreadCount: 0,
                    participants: [currentUser.id, user.id],
                    isLocked: false,
                    isVanishMode: false
                };
                addConversation(conversation);
                setSelectedChat(conversation);
                navigate(`/chat/${user.id}`);
            } catch (error) {
                console.error('Error creating chat:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="flex justify-center p-8 text-gray-400">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {users.map(user => (
                <div
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center justify-between p-4 hover:bg-[#202c33] cursor-pointer border-b border-gray-800 transition-colors"
                >
                    <div className="flex items-center space-x-3">
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                            <h3 className="text-white font-semibold">{user.name}</h3>
                            <p className="text-gray-400 text-sm truncate max-w-[200px]">{user.about || user.email}</p>
                            {/* Optional: Show mutuals or follower count */}
                            {user.followerCount !== undefined && (
                                <p className="text-xs text-gray-500">{user.followerCount} followers</p>
                            )}
                        </div>
                    </div>
                    <FollowButton user={user} />
                </div>
            ))}
        </div>
    );
};

export default UserList;
