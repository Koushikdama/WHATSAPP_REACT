import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User } from '../types';

/**
 * Component that displays pending follow requests for the current user.
 * Allows accepting or rejecting each request.
 */
const FollowRequestsScreen: React.FC = () => {
    const { currentUser, users } = useAppContext();
    const [requests, setRequests] = useState<Array<{ id: string; from: string }>>([]);

    useEffect(() => {
        if (!currentUser) return;
        // Mock data
        setRequests([]);
    }, [currentUser]);

    const getUserById = (id: string): User | undefined => users.find((u) => u.id === id);

    const handleAccept = async (fromId: string) => {
        console.log('Mock accept follow request', fromId);
    };

    const handleReject = async (fromId: string) => {
        console.log('Mock reject follow request', fromId);
    };

    if (!currentUser) return null;

    return (
        <div className="p-4 bg-[#111b21] min-h-screen">
            <h2 className="text-xl font-bold text-white mb-4">Follow Requests</h2>
            {requests.length === 0 ? (
                <p className="text-gray-400">No pending requests.</p>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => {
                        const fromUser = getUserById(req.from);
                        return (
                            <div key={req.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {fromUser && (
                                        <img src={fromUser.avatar} alt={fromUser.name} className="h-10 w-10 rounded-full" />
                                    )}
                                    <span className="text-white">{fromUser ? fromUser.name : req.from}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-hover"
                                        onClick={() => handleAccept(req.from)}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-500"
                                        onClick={() => handleReject(req.from)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FollowRequestsScreen;