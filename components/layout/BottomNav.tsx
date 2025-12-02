import React from 'react';
import { NavLink } from 'react-router-dom';
import { PhoneIcon, StatusIcon, ChatIcon } from '../icons';
import NotificationBadge from '../ui/NotificationBadge';

const BottomNav = () => {
  const activeLinkClass = "text-primary";
  const inactiveLinkClass = "text-gray-400";
  const baseLinkClass = "flex flex-col items-center justify-center w-full h-full pt-1 relative";

  return (
    <div className="flex-shrink-0 bg-[#202c33] flex justify-around items-center h-16 border-t border-gray-700">
      <NavLink to="/" end className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
        <ChatIcon className="h-6 w-6" />
        <span className="text-xs mt-1">Chats</span>
      </NavLink>
      <NavLink to="/status" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
        <StatusIcon className="h-6 w-6" />
        <span className="text-xs mt-1">Status</span>
      </NavLink>
      <NavLink to="/calls" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
        <PhoneIcon className="h-6 w-6" />
        <span className="text-xs mt-1">Calls</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;