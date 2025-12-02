import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';

interface ActiveCallScreenProps {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    remoteUser: User | null;
    callType: 'audio' | 'video';
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    isSpeakerOn?: boolean;
    onToggleVideo: () => void;
    onToggleAudio: () => void;
    onToggleSpeaker?: () => void;
    onSwitchCamera?: () => void;
    onEndCall: () => void;
}

const ActiveCallScreen: React.FC<ActiveCallScreenProps> = ({
    localStream,
    remoteStream,
    remoteUser,
    callType,
    isVideoEnabled,
    isAudioEnabled,
    isSpeakerOn = false,
    onToggleVideo,
    onToggleAudio,
    onToggleSpeaker,
    onSwitchCamera,
    onEndCall,
}) => {
    const [callDuration, setCallDuration] = useState(0);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Setup video streams
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Call duration timer - optimized
    useEffect(() => {
        const interval = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0b141a] flex flex-col">
            {/* Remote Video/Avatar */}
            <div className="flex-1 relative bg-gray-900">
                {callType === 'video' && remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden mb-6">
                            {remoteUser?.avatar ? (
                                <img
                                    src={remoteUser.avatar}
                                    alt={remoteUser.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-6xl">👤</span>
                            )}
                        </div>
                        <h2 className="text-white text-2xl font-semibold mb-2">
                            {remoteUser?.name || 'Unknown'}
                        </h2>
                    </div>
                )}

                {/* Header - Call Info */}
                <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent">
                    <div className="text-center">
                        <h3 className="text-white text-xl font-semibold">
                            {remoteUser?.name || 'Unknown'}
                        </h3>
                        <p className="text-gray-300 text-sm mt-1">{formatDuration(callDuration)}</p>
                        <div className="flex items-center justify-center mt-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            <span className="text-xs text-gray-400">Connected</span>
                        </div>
                    </div>
                </div>

                {/* Local Video (Picture-in-Picture) */}
                {callType === 'video' && localStream && isVideoEnabled && (
                    <div className="absolute top-20 right-4 w-24 h-32 rounded-lg overflow-hidden bg-gray-800 shadow-lg border-2 border-gray-700">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover mirror"
                        />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-[#0b141a] p-6 pb-8">
                <div className="flex items-center justify-center gap-6">
                    {/* Toggle Video (only for video calls) */}
                    {callType === 'video' && (
                        <button
                            onClick={onToggleVideo}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${isVideoEnabled
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            {isVideoEnabled ? (
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            )}
                        </button>
                    )}

                    {/* Toggle Audio (Mute) */}
                    <button
                        onClick={onToggleAudio}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${isAudioEnabled
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-red-500 hover:bg-red-600'
                            }`}
                    >
                        {isAudioEnabled ? (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        )}
                    </button>

                    {/* End Call */}
                    <button
                        onClick={onEndCall}
                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg"
                    >
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                        </svg>
                    </button>

                    {/* Speaker Toggle (for audio calls) */}
                    {onToggleSpeaker && (
                        <button
                            onClick={onToggleSpeaker}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${isSpeakerOn
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                        >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        </button>
                    )}

                    {/* Switch Camera (for video calls on mobile) */}
                    {callType === 'video' && onSwitchCamera && (
                        <button
                            onClick={onSwitchCamera}
                            className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
        </div>
    );
};

export default ActiveCallScreen;