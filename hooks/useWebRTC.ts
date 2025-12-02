import { useState, useEffect, useCallback, useRef } from 'react';
import {
    createPeerConnection,
    getLocalStream,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    addIceCandidate as addIceCandidateToPC,
    toggleVideo as toggleVideoTrack,
    toggleAudio as toggleAudioTrack,
    cleanup,
    stopMediaStream,
} from '../services/webrtc.service';
import {
    initiateCall,
    answerCall,
    addIceCandidateToCall,
    endCall as endCallSignaling,
    subscribeToCall,
    CallDocument,
} from '../services/callSignaling.service';

interface UseWebRTCParams {
    userId: string;
    onRemoteStream?: (stream: MediaStream) => void;
    onCallEnded?: () => void;
}

export const useWebRTC = ({ userId, onRemoteStream, onCallEnded }: UseWebRTCParams) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
    const [callId, setCallId] = useState<string | null>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
    const isCallerRef = useRef(false);

    /**
     * Initialize peer connection and set up event handlers
     */
    const setupPeerConnection = useCallback(() => {
        const pc = createPeerConnection();
        peerConnectionRef.current = pc;

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && callId) {
                addIceCandidateToCall(callId, event.candidate.toJSON(), isCallerRef.current);
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            const [stream] = event.streams;
            setRemoteStream(stream);
            if (onRemoteStream) {
                onRemoteStream(stream);
            }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            setConnectionState(pc.connectionState);

            if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                if (onCallEnded) {
                    onCallEnded();
                }
            }
        };

        return pc;
    }, [callId, onRemoteStream, onCallEnded]);

    /**
     * Start a call (as caller)
     */
    const startCall = useCallback(
        async (receiverId: string, type: 'audio' | 'video') => {
            try {
                isCallerRef.current = true;

                // Get local media
                const stream = await getLocalStream(type === 'video', true);
                setLocalStream(stream);

                // Setup peer connection
                const pc = setupPeerConnection();

                // Add local tracks to peer connection
                stream.getTracks().forEach((track) => {
                    pc.addTrack(track, stream);
                });

                // Create offer
                const offer = await createOffer(pc);

                // Save to Firestore
                const newCallId = await initiateCall(userId, receiverId, type, offer);
                setCallId(newCallId);

                return newCallId;
            } catch (error) {
                console.error('Error starting call:', error);
                throw error;
            }
        },
        [userId, setupPeerConnection]
    );

    /**
     * Answer a call (as receiver)
     */
    const answerIncomingCall = useCallback(
        async (call: CallDocument) => {
            try {
                isCallerRef.current = false;
                setCallId(call.id);

                // Get local media
                const stream = await getLocalStream(call.type === 'video', true);
                setLocalStream(stream);

                // Setup peer connection
                const pc = setupPeerConnection();

                // Add local tracks
                stream.getTracks().forEach((track) => {
                    pc.addTrack(track, stream);
                });

                // Create answer from offer
                if (call.offer) {
                    const answer = await createAnswer(pc, call.offer);
                    await answerCall(call.id, answer);
                }

                // Add any pending ICE candidates
                if (call.callerIceCandidates) {
                    for (const candidate of call.callerIceCandidates) {
                        await addIceCandidateToPC(pc, candidate);
                    }
                }
            } catch (error) {
                console.error('Error answering call:', error);
                throw error;
            }
        },
        [setupPeerConnection]
    );

    /**
     * End the current call
     */
    const endCurrentCall = useCallback(async () => {
        if (callId) {
            await endCallSignaling(callId);
        }

        cleanup(peerConnectionRef.current, localStream, remoteStream);

        setLocalStream(null);
        setRemoteStream(null);
        setCallId(null);
        peerConnectionRef.current = null;

        if (onCallEnded) {
            onCallEnded();
        }
    }, [callId, localStream, remoteStream, onCallEnded]);

    /**
     * Toggle video on/off
     */
    const toggleVideo = useCallback(() => {
        const newState = !isVideoEnabled;
        toggleVideoTrack(localStream, newState);
        setIsVideoEnabled(newState);
    }, [localStream, isVideoEnabled]);

    /**
     * Toggle audio (mute/unmute)
     */
    const toggleAudio = useCallback(() => {
        const newState = !isAudioEnabled;
        toggleAudioTrack(localStream, newState);
        setIsAudioEnabled(newState);
    }, [localStream, isAudioEnabled]);

    /**
     * Subscribe to call updates
     */
    useEffect(() => {
        if (!callId) return;

        const unsubscribe = subscribeToCall(callId, async (call) => {
            if (!call) return;

            const pc = peerConnectionRef.current;
            if (!pc) return;

            // If we're the caller and we received an answer
            if (isCallerRef.current && call.answer && !pc.currentRemoteDescription) {
                await setRemoteAnswer(pc, call.answer);

                // Add pending ICE candidates from receiver
                if (call.receiverIceCandidates) {
                    for (const candidate of call.receiverIceCandidates) {
                        await addIceCandidateToPC(pc, candidate);
                    }
                }
            }

            // If we're the receiver, add caller's ICE candidates
            if (!isCallerRef.current && call.callerIceCandidates) {
                for (const candidate of call.callerIceCandidates) {
                    if (pendingIceCandidatesRef.current.includes(candidate)) continue;
                    pendingIceCandidatesRef.current.push(candidate);
                    await addIceCandidateToPC(pc, candidate);
                }
            }

            // Handle call ended
            if (call.status === 'ended' || call.status === 'rejected') {
                endCurrentCall();
            }
        });

        return () => unsubscribe();
    }, [callId, endCurrentCall]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            cleanup(peerConnectionRef.current, localStream, remoteStream);
        };
    }, [localStream, remoteStream]);

    return {
        localStream,
        remoteStream,
        isVideoEnabled,
        isAudioEnabled,
        connectionState,
        callId,
        startCall,
        answerIncomingCall,
        endCurrentCall,
        toggleVideo,
        toggleAudio,
    };
};