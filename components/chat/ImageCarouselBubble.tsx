import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Message } from '../../types';
import { DoubleCheckIcon, CheckIcon, CheckCircleIcon } from '../icons';
import { useAppContext } from '../../context/AppContext';
import { formatTimestamp } from '../../utils/date/dateFormatter';

interface MediaCarouselBubbleProps {
  mediaMessages: Message[];
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (messageIds: string[]) => void;
  onEnterSelectionMode?: (messageIds: string[]) => void;
}

const MediaCarouselBubble: React.FC<MediaCarouselBubbleProps> = ({
  mediaMessages,
  selectionMode,
  isSelected,
  onToggleSelection,
  onEnterSelectionMode
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { currentUser } = useAppContext();

  const gestureRef = useRef({ isDragging: false, didLongPress: false });
  const longPressTimer = useRef<number | null>(null);
  const dragStartX = useRef(0);

  if (!mediaMessages || mediaMessages.length === 0 || !currentUser) {
    return null;
  }

  const firstMessage = mediaMessages[0];
  const lastMessage = mediaMessages[mediaMessages.length - 1];
  const isSent = firstMessage.senderId === currentUser.id;
  const currentMedia = mediaMessages[currentIndex];

  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    dragStartX.current = info.point.x;
    gestureRef.current.isDragging = false;
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDistance = Math.abs(info.point.x - dragStartX.current);
    if (dragDistance > 10) {
      gestureRef.current.isDragging = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    const swipeVelocityThreshold = 500;

    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold) {
      if (info.offset.x > 0 && currentIndex > 0) {
        // Swipe right - previous
        setCurrentIndex(prev => prev - 1);
      } else if (info.offset.x < 0 && currentIndex < mediaMessages.length - 1) {
        // Swipe left - next
        setCurrentIndex(prev => prev + 1);
      }
    }

    gestureRef.current.isDragging = false;
  };

  const allMessageIds = mediaMessages.map(m => m.id);

  const handlePointerDown = (e: React.PointerEvent) => {
    gestureRef.current = { isDragging: false, didLongPress: false };
    if (!selectionMode && onEnterSelectionMode) {
      longPressTimer.current = window.setTimeout(() => {
        onEnterSelectionMode(allMessageIds);
        gestureRef.current.didLongPress = true;
        longPressTimer.current = null;
      }, 500);
    }
  };

  const handlePointerMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (selectionMode && !gestureRef.current.didLongPress && !gestureRef.current.isDragging) {
      onToggleSelection?.(allMessageIds);
    }
  };

  const renderStatus = () => {
    if (!isSent || !lastMessage.status) return null;
    if (lastMessage.isSeen) return <DoubleCheckIcon className="w-4 h-4 text-blue-400" />;
    switch (lastMessage.status) {
      case 'read': return <DoubleCheckIcon className="w-4 h-4 text-blue-400" />;
      case 'delivered': return <DoubleCheckIcon className="w-4 h-4 text-gray-500" />;
      case 'sent': return <CheckIcon className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  return (
    <div
      className={`flex my-1 relative ${isSent ? 'justify-end' : 'justify-start'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className={`relative ${isSelected ? 'bg-emerald-500/20' : ''} rounded-lg`}>
        {selectionMode && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30">
            {isSelected
              ? <CheckCircleIcon className="w-6 h-6 text-primary" />
              : <div className="w-6 h-6 rounded-full border-2 border-gray-500 bg-[#111b21]"></div>
            }
          </div>
        )}
        <div className={`rounded-lg p-1 max-w-sm w-full relative overflow-hidden ${isSent ? 'bg-[#005c4b]' : 'bg-[#202c33]'} ${selectionMode ? (isSent ? 'mr-10' : 'ml-10') : ''}`}>
          <div className="relative">
            {/* Swipeable Media Container */}
            <div className="relative overflow-hidden">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentIndex}
                  drag={!selectionMode ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragStart={handleDragStart}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="relative"
                >
                  {currentMedia.messageType === 'image' ? (
                    <img
                      src={currentMedia.fileInfo?.url}
                      alt={`Image ${currentIndex + 1}`}
                      className="rounded-md w-full aspect-square object-cover select-none"
                      draggable={false}
                    />
                  ) : (
                    <video
                      src={currentMedia.fileInfo?.url}
                      controls={!selectionMode}
                      className="rounded-md w-full aspect-square object-cover bg-black"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Instagram-style Dots Navigation */}
            {mediaMessages.length > 1 && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
                {mediaMessages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!selectionMode) setCurrentIndex(index);
                    }}
                    className={`h-1.5 rounded-full transition-all ${index === currentIndex
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/50'
                      }`}
                    aria-label={`Go to media ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Timestamp and Status */}
          <div className="flex justify-end items-center mt-1 px-2 pb-1 text-white">
            <p className="text-xs text-gray-400 mr-1">{formatTimestamp(lastMessage.timestamp)}</p>
            {renderStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCarouselBubble;