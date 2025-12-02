import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { PhoneIcon, MuteIcon, UnmuteIcon, ExpandIcon } from '../icons';
import { motion, useDragControls } from 'framer-motion';

const FloatingCallView = () => {
  const { activeCall, hangUp, toggleMute } = useAppContext();
  const navigate = useNavigate();
  const [duration, setDuration] = useState('00:00');
  const constraintsRef = useRef(null);
  const dragControls = useDragControls();

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

  if (!activeCall) return null;
  const { contact, isMuted, type } = activeCall;

  const returnToCall = () => {
    navigate(`/call/${contact.id}`);
  };

  return (
    <>
      {/* Invisible container for drag constraints */}
      <div ref={constraintsRef} className="fixed inset-4 pointer-events-none z-40" />

      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        initial={{ x: 0, y: 0, scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="fixed bottom-24 right-6 w-72 bg-[#202c33] rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-700 cursor-grab active:cursor-grabbing"
      >
        {/* Header / Drag Handle */}
        <div
          className="bg-[#2a3942] p-2 flex items-center justify-between cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-300 font-medium uppercase tracking-wider">
              {type === 'video' ? 'Video Call' : 'Voice Call'}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-mono">{duration}</span>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col items-center justify-center relative bg-[#111b21]">
          <div className="relative mb-3">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="h-16 w-16 rounded-full border-2 border-[#2a3942] shadow-md"
            />
            {isMuted && (
              <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-[#111b21]">
                <MuteIcon className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          <p className="text-white font-semibold text-lg truncate w-full text-center mb-1">
            {contact.name}
          </p>
          <p className="text-xs text-[#00a884] font-medium">
            Tap to return
          </p>

          {/* Overlay Controls (visible on hover) */}
          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
            <button
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              {isMuted ? <UnmuteIcon className="h-5 w-5" /> : <MuteIcon className="h-5 w-5" />}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); hangUp(); }}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
            >
              <PhoneIcon className="h-5 w-5" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); returnToCall(); }}
              className="p-3 bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] transition-colors shadow-lg"
            >
              <ExpandIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default FloatingCallView;