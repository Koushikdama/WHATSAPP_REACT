import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PhoneIcon, ChatIcon } from '../icons';

const NotificationPopup = () => {
  const { inAppNotification, clearInAppNotification, answerCall, rejectCall } = useAppContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (inAppNotification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Allow time for the slide-out animation before clearing
        setTimeout(clearInAppNotification, 300);
      }, inAppNotification.type === 'call' ? 10000 : 4000); // Calls stay longer

      return () => clearTimeout(timer);
    }
  }, [inAppNotification, clearInAppNotification]);

  if (!inAppNotification) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#2a3942] rounded-lg shadow-2xl p-4 z-50 ${isVisible ? 'animate-slide-down' : 'animate-slide-up'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {inAppNotification.type === 'call' ? 
            <PhoneIcon className="h-6 w-6 text-emerald-400" /> :
            <ChatIcon className="h-6 w-6 text-cyan-400" />
          }
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-white">{inAppNotification.title}</p>
          <p className="mt-1 text-sm text-gray-300">{inAppNotification.body}</p>
          {inAppNotification.type === 'call' && (
            <div className="mt-3 flex space-x-4">
              <button onClick={answerCall} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-semibold">Answer</button>
              <button onClick={rejectCall} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">Decline</button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button onClick={() => setIsVisible(false)} className="inline-flex text-gray-400 hover:text-gray-200">
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;