import React, { useEffect } from 'react';

interface InAppNotificationProps {
    type: 'message' | 'call';
    title: string;
    body: string;
    avatar?: string;
    onDismiss: () => void;
    onClick?: () => void;
}

const InAppNotification: React.FC<InAppNotificationProps> = ({
    type,
    title,
    body,
    avatar,
    onDismiss,
    onClick,
}) => {
    // Auto-dismiss after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
        onDismiss();
    };

    return (
        <div
            onClick={handleClick}
            className="fixed top-4 right-4 z-50 animate-slide-in-right cursor-pointer"
        >
            <div className="bg-[#202c33] rounded-lg shadow-2xl overflow-hidden max-w-sm hover:shadow-3xl transition-shadow">
                <div className="p-4 flex items-start gap-3">
                    {/* Avatar */}
                    {avatar && (
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden">
                                <img src={avatar} alt={title} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-white font-semibold text-sm truncate">{title}</p>
                                <p className="text-gray-300 text-sm mt-1 line-clamp-2">{body}</p>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDismiss();
                                }}
                                className="ml-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Notification type indicator */}
                        <div className="flex items-center mt-2">
                            {type === 'call' && (
                                <div className="flex items-center text-green-500 text-xs">
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                    <span>Incoming call</span>
                                </div>
                            )}
                            {type === 'message' && (
                                <div className="flex items-center text-blue-400 text-xs">
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                        />
                                    </svg>
                                    <span>New message</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-700 overflow-hidden">
                    <div className="h-full bg-green-500 animate-progress-bar" />
                </div>
            </div>

            <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes progress-bar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-progress-bar {
          animation: progress-bar 5s linear;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
};

export default InAppNotification;