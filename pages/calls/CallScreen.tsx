import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { PhoneIcon, SpeakerIcon, SpeakerOffIcon, AddUserIcon, CameraOnIcon, CameraOffIcon, MuteIcon, UnmuteIcon, SwitchCameraIcon } from '../../components/icons';

const CallScreen = () => {
  const { activeCall, hangUp, toggleMute, toggleVideo, toggleSpeaker, switchCamera } = useAppContext();
  const [duration, setDuration] = useState('00:00');
  const [isRemoteVideoOff, setRemoteVideoOff] = useState(false);

  useEffect(() => {
    if (activeCall?.type === 'video') {
      const timer = setTimeout(() => {
        setRemoteVideoOff(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeCall?.type]);

  useEffect(() => {
    if (activeCall?.status === 'active' && activeCall.startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - activeCall.startTime!) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        setDuration(`${minutes}:${seconds}`);
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [activeCall?.status, activeCall?.startTime]);

  if (!activeCall) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#111b21] text-white">
        <h1 className="text-2xl">Call ended or invalid</h1>
      </div>
    );
  }

  const { contact, status, isMuted, isVideoOff, isSpeaker, type } = activeCall;

  const getStatusText = () => {
    switch (status) {
      case 'calling': return 'Calling...';
      case 'ringing': return 'Ringing...';
      case 'active': return duration;
      default: return 'Connecting...';
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#111b21] text-white overflow-hidden">
      {/* Video feeds */}
      <div className="relative flex-grow">
        {/* Remote video (full screen) */}
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          {type === 'video' && isRemoteVideoOff ? (
            <div className="flex flex-col items-center">
              <img src={contact.avatar} alt={contact.name} className="h-32 w-32 rounded-full opacity-50" />
              <p className="mt-4 text-gray-400">{contact.name}'s video is off</p>
            </div>
          ) : type === 'voice' ? (
            <div className="flex flex-col items-center">
              <img src={contact.avatar} alt={contact.name} className="h-48 w-48 rounded-full" />
            </div>
          ) : (
            <div className="text-gray-400">{/* This would be the actual <video> element */} Remote Video Feed Placeholder</div>
          )}
        </div>
        {/* Local video (picture-in-picture) */}
        {type === 'video' && (
          <div className="absolute top-4 right-4 h-32 w-24 md:h-40 md:w-32 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
            {isVideoOff ? <p className="text-gray-400 text-sm p-2 text-center">Your video is off</p> : <p className="text-sm text-gray-400">Your Video</p>}
          </div>
        )}
      </div>

      {/* Header Info */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-3xl font-semibold">{contact.name}</h1>
        <p className="text-gray-300">{getStatusText()}</p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/50 to-transparent flex justify-center items-center space-x-4 md:space-x-6">
        <button onClick={toggleSpeaker} className="flex flex-col items-center justify-center text-gray-300 hover:text-white">
          <div className="p-4 bg-white/10 rounded-full">
            {isSpeaker ? <SpeakerIcon className="h-6 w-6" /> : <SpeakerOffIcon className="h-6 w-6" />}
          </div>
        </button>

        <button onClick={toggleMute} className="flex flex-col items-center justify-center text-gray-300 hover:text-white">
          <div className="p-4 bg-white/10 rounded-full">
            {isMuted ? <UnmuteIcon className="h-6 w-6" /> : <MuteIcon className="h-6 w-6" />}
          </div>
        </button>

        {type === 'video' && (
          <>
            <button onClick={toggleVideo} className="flex flex-col items-center justify-center text-gray-300 hover:text-white">
              <div className="p-4 bg-white/10 rounded-full">
                {isVideoOff ? <CameraOffIcon className="h-6 w-6" /> : <CameraOnIcon className="h-6 w-6" />}
              </div>
            </button>
            {!isVideoOff && (
              <button onClick={switchCamera} className="flex flex-col items-center justify-center text-gray-300 hover:text-white">
                <div className="p-4 bg-white/10 rounded-full">
                  <SwitchCameraIcon className="h-6 w-6" />
                </div>
              </button>
            )}
          </>
        )}

        <button onClick={hangUp} className="flex flex-col items-center justify-center text-white">
          <div className="p-4 bg-red-600 rounded-full"><PhoneIcon className="h-6 w-6 transform -rotate-45" /></div>
        </button>

        <button className="flex flex-col items-center justify-center text-gray-300 hover:text-white">
          <div className="p-4 bg-white/10 rounded-full"><AddUserIcon className="h-6 w-6" /></div>
        </button>
      </div>
    </div>
  );
};

export default CallScreen;