import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const NotificationBadge: React.FC = () => {
    const { currentUser } = useAppContext();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!currentUser) {
            setUnreadCount(0);
            return;
        }
        // Mock data
        setUnreadCount(0);
    }, [currentUser]);

    if (unreadCount === 0) {
        return null;
    }

    return (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
        </div>
    );
};

export default NotificationBadge;