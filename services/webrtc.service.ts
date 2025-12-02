/**
 * WebRTC Service
 * Manages peer-to-peer audio/video connections
 */

// STUN servers for NAT traversal (using free public STUN servers)
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
};

export interface WebRTCConnection {
    peerConnection: RTCPeerConnection;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
}

/**
 * Create a new RTCPeerConnection
 */
export const createPeerConnection = (): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    return peerConnection;
};

/**
 * Get user's local media stream (camera/microphone)
 */
export const getLocalStream = async (
    video: boolean = true,
    audio: boolean = true
): Promise<MediaStream> => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
            audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
        });
        return stream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
        throw new Error('Failed to access camera/microphone. Please grant permissions.');
    }
};

/**
 * Create an SDP offer for initiating a call
 */
export const createOffer = async (
    peerConnection: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> => {
    const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
    });
    await peerConnection.setLocalDescription(offer);
    return offer;
};

/**
 * Create an SDP answer for accepting a call
 */
export const createAnswer = async (
    peerConnection: RTCPeerConnection,
    offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
};

/**
 * Set remote answer after receiving it
 */
export const setRemoteAnswer = async (
    peerConnection: RTCPeerConnection,
    answer: RTCSessionDescriptionInit
): Promise<void> => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
};

/**
 * Add ICE candidate to peer connection
 */
export const addIceCandidate = async (
    peerConnection: RTCPeerConnection,
    candidate: RTCIceCandidateInit
): Promise<void> => {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
        console.error('Error adding ICE candidate:', error);
    }
};

/**
 * Stop all tracks in a media stream
 */
export const stopMediaStream = (stream: MediaStream | null): void => {
    if (!stream) return;
    stream.getTracks().forEach(track => {
        track.stop();
    });
};

/**
 * Toggle video track
 */
export const toggleVideo = (stream: MediaStream | null, enabled: boolean): void => {
    if (!stream) return;
    stream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
    });
};

/**
 * Toggle audio track (mute/unmute)
 */
export const toggleAudio = (stream: MediaStream | null, enabled: boolean): void => {
    if (!stream) return;
    stream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
    });
};

/**
 * Switch between front and back camera (mobile)
 */
export const switchCamera = async (
    currentStream: MediaStream
): Promise<MediaStream> => {
    const videoTrack = currentStream.getVideoTracks()[0];
    const currentFacingMode = videoTrack.getSettings().facingMode;

    // Stop current video track
    videoTrack.stop();

    // Get new stream with opposite facing mode
    const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: currentFacingMode === 'user' ? 'environment' : 'user',
        },
        audio: true,
    });

    return newStream;
};

/**
 * Cleanup peer connection and streams
 */
export const cleanup = (
    peerConnection: RTCPeerConnection | null,
    localStream: MediaStream | null,
    remoteStream: MediaStream | null
): void => {
    stopMediaStream(localStream);
    stopMediaStream(remoteStream);

    if (peerConnection) {
        peerConnection.close();
    }
};

/**
 * Check if browser supports WebRTC
 */
export const isWebRTCSupported = (): boolean => {
    return !!(
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function' &&
        window.RTCPeerConnection
    );
};

/**
 * Get media device permissions status
 */
export const getMediaPermissions = async (): Promise<{
    camera: PermissionState;
    microphone: PermissionState;
}> => {
    try {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });

        return {
            camera: cameraPermission.state,
            microphone: microphonePermission.state,
        };
    } catch (error) {
        // Fallback for browsers that don't support permissions API
        return {
            camera: 'prompt',
            microphone: 'prompt',
        };
    }
};