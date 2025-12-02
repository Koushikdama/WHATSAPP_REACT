import React from 'react';
import { Call } from '../../types';
import { PhoneIcon, VideoCallIcon } from '../../components/icons';
import { formatTimestamp } from '../../utils/date/dateFormatter';
import { useAppContext } from '../../context/AppContext';

interface CallItemProps {
  call: Call;
}
const CallItem: React.FC<CallItemProps> = ({ call }) => {
  const { users } = useAppContext();
  const contact = users.find(u => u.id === call.contactId);

  const renderCallIcon = () => {
    if (call.callType === 'VIDEO') {
      return <VideoCallIcon className="h-5 w-5 text-gray-400" />;
    }
    return <PhoneIcon className="h-5 w-5 text-gray-400" />;
  };

  const renderArrow = () => {
    if (call.type === 'incoming') {
      return <svg viewBox="0 0 24 24" width="16" height="16" className="text-emerald-500"><path fill="currentColor" d="M20 5.41 18.59 4 7 15.59V9H5v10h10v-2H8.41z"></path></svg>;
    }
    if (call.type === 'outgoing') {
      return <svg viewBox="0 0 24 24" width="16" height="16" className="text-emerald-500"><path fill="currentColor" d="m20 9-8-8-1.41 1.41L16.17 8H4v2h12.17l-5.58 5.59L12 17l8-8z"></path></svg>;
    }
    // Missed call
    return <svg viewBox="0 0 24 24" width="16" height="16" className="text-red-500"><path fill="currentColor" d="M20 5.41 18.59 4 7 15.59V9H5v10h10v-2H8.41z"></path></svg>;
  };

  return (
    <div className="flex items-center p-3 hover:bg-[#202c33] cursor-pointer">
      <img src={contact?.avatar} alt={contact?.name} className="h-12 w-12 rounded-full mr-4" />
      <div className="flex-grow">
        <h3 className={`font-semibold ${call.type === 'missed' ? 'text-red-500' : 'text-white'}`}>{contact?.name}</h3>
        <div className="flex items-center text-sm text-gray-400">
          {renderArrow()}
          <span className="ml-2">{formatTimestamp(call.startedAt)}</span>
        </div>
      </div>
      {renderCallIcon()}
    </div>
  );
};

const CallsScreen = () => {
  const { calls } = useAppContext();

  return (
    <div className="flex flex-col h-full bg-[#111b21]">
      <div className="flex-grow overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-600 rounded-full">
              <PhoneIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-white">Create call link</h3>
              <p className="text-sm text-gray-400">Share a link for your WhatsApp call</p>
            </div>
          </div>
        </div>
        <h2 className="p-4 text-gray-400 font-semibold text-sm">Recent</h2>
        {calls.map(call => <CallItem key={call.id} call={call} />)}
      </div>
      <button className="absolute bottom-24 right-6 lg:bottom-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 shadow-lg">
        <PhoneIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default CallsScreen;