import React, { useState, useEffect } from 'react';
import { CallDocument } from '../../services/callSignaling.service';
import { User } from '../../types';

interface IncomingCallScreenProps {
    call: CallDocument;
    caller: User | null;
    onAnswer: () => void;
    onReject: () => void;
}

const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({
    call,
    caller,
    onAnswer,
    onReject,
}) => {
    const [isRinging, setIsRinging] = useState(true);

    useEffect(() => {
        // Play ringtone (we'll add this later)
        const audio = new Audio('/sounds/ringtone.mp3');
        audio.loop = true;
        audio.play().catch(() => console.log('Could not play ringtone'));

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            {/* Background with caller's avatar (blurred) */}
            <div
                className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-50"
                style={{
                    backgroundImage: caller?.avatar ? `url(${caller.avatar})` : 'none',
                    backgroundColor: '#111',
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-white">
                {/* Caller Avatar */}
                <div className="relative mb-8">
                    <div
                        className={`w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden ${isRinging ? 'animate-pulse' : ''
                            }`}
                    >
                        {caller?.avatar ? (
                            <img src={caller.avatar} alt={caller.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-5xl">👤</span>
                        )}
                    </div>
                    {/* Ring animation */}
                    {isRinging && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-40 h-40 rounded-full border-4 border-green-500 animate-ping opacity-75" />
                        </div>
                    )}
                </div>

                {/* Caller Info */}
                <h2 className="text-3xl font-semibold mb-2">{caller?.name || 'Unknown'}</h2>
                <p className="text-lg text-gray-300 mb-8">
                    Incoming {call.type === 'video' ? 'video' : 'audio'} call...
                </p>

                {/* Call status */}
                <div className="flex items-center mb-12">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                    <span className="text-sm text-gray-400">Ringing</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-8">
                    {/* Reject Button */}
                    <button
                        onClick={onReject}
                        className="flex flex-col items-center space-y-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white">Decline</span>
                    </button>

                    {/* Answer Button */}
                    <button
                        onClick={onAnswer}
                        className="flex flex-col items-center space-y-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white">Answer</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallScreen;