import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { followUser, unfollowUser, isFollowing as checkIsFollowing } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';

interface FollowButtonProps {
    user: User;
    onFollowChange?: (isFollowing: boolean) => void;
    className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ user, onFollowChange, className = '' }) => {
    const { currentUser } = useAppContext();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isRequested, setIsRequested] = useState(false);

    if (!currentUser || user.id === currentUser.id) return null;

    // Check following status on mount
    useEffect(() => {
        const checkStatus = async () => {
            if (currentUser) {
                const following = await checkIsFollowing(currentUser.id, user.id);
                setIsFollowing(following);
            }
        };
        checkStatus();
    }, [currentUser, user.id]);

    const handleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (loading || !currentUser) return;

        setLoading(true);
        const previousState = isFollowing;

        try {
            if (isFollowing) {
                // Unfollow
                setIsFollowing(false);
                const success = await unfollowUser(currentUser.id, user.id);
                if (!success) {
                    setIsFollowing(previousState);
                    showToast('Failed to unfollow', 'error');
                } else {
                    if (onFollowChange) onFollowChange(false);
                    showToast('Unfollowed successfully', 'success');
                }
            } else {
                // Follow
                if (user.isPrivate) {
                    setIsRequested(true);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    showToast('Follow request sent', 'success');
                } else {
                    setIsFollowing(true);
                    const success = await followUser(currentUser.id, user.id);
                    if (!success) {
                        setIsFollowing(previousState);
                        showToast('Failed to follow', 'error');
                    } else {
                        if (onFollowChange) onFollowChange(true);
                        showToast('Following successfully', 'success');
                    }
                }
            }
        } catch (error) {
            console.error('Follow action failed:', error);
            setIsFollowing(previousState);
            setIsRequested(false);
            showToast('Action failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getButtonText = () => {
        if (loading) return '...';
        if (isRequested) return 'Requested';
        if (isFollowing) return 'Following';
        return 'Follow';
    };

    const getButtonStyle = () => {
        if (isFollowing || isRequested) {
            return 'bg-[#2a3942] text-white hover:bg-[#374248]';
        }
        return 'bg-primary text-white hover:bg-primary-hover';
    };

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${getButtonStyle()} ${className}`}
        >
            {getButtonText()}
        </button>
    );
};

export default FollowButton;