/**
 * WebRTC Testing Utilities
 * Helper functions to test and verify WebRTC functionality
 */

/**
 * Check if WebRTC is supported in the current browser
 */
export const checkWebRTCSupport = (): {
    supported: boolean;
    details: {
        getUserMedia: boolean;
        RTCPeerConnection: boolean;
        mediaDevices: boolean;
    };
} => {
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasRTCPeerConnection = !!(window.RTCPeerConnection);
    const hasMediaDevices = !!(navigator.mediaDevices);

    return {
        supported: hasGetUserMedia && hasRTCPeerConnection && hasMediaDevices,
        details: {
            getUserMedia: hasGetUserMedia,
            RTCPeerConnection: hasRTCPeerConnection,
            mediaDevices: hasMediaDevices,
        },
    };
};

/**
 * Check media device permissions
 */
export const checkMediaPermissions = async (): Promise<{
    camera: {
        granted: boolean;
        state: PermissionState | 'unknown';
    };
    microphone: {
        granted: boolean;
        state: PermissionState | 'unknown';
    };
}> => {
    try {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });

        return {
            camera: {
                granted: cameraPermission.state === 'granted',
                state: cameraPermission.state,
            },
            microphone: {
                granted: microphonePermission.state === 'granted',
                state: microphonePermission.state,
            },
        };
    } catch (error) {
        // Fallback for browsers that don't support permissions API
        return {
            camera: {
                granted: false,
                state: 'unknown',
            },
            microphone: {
                granted: false,
                state: 'unknown',
            },
        };
    }
};

/**
 * List available media devices
 */
export const listMediaDevices = async (): Promise<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
}> => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        return {
            cameras: devices.filter(device => device.kind === 'videoinput'),
            microphones: devices.filter(device => device.kind === 'audioinput'),
            speakers: devices.filter(device => device.kind === 'audiooutput'),
        };
    } catch (error) {
        console.error('Error enumerating devices:', error);
        return {
            cameras: [],
            microphones: [],
            speakers: [],
        };
    }
};

/**
 * Test basic peer connection creation
 */
export const testPeerConnectionCreation = (): {
    success: boolean;
    error?: string;
    iceConnectionState?: RTCIceConnectionState;
} => {
    try {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ],
        });

        const state = pc.iceConnectionState;
        pc.close();

        return {
            success: true,
            iceConnectionState: state,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Test media stream acquisition
 */
export const testMediaStreamAcquisition = async (
    video: boolean = true,
    audio: boolean = true
): Promise<{
    success: boolean;
    error?: string;
    stream?: MediaStream;
    tracks?: {
        video: MediaStreamTrack[];
        audio: MediaStreamTrack[];
    };
}> => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
            audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
        });

        const tracks = {
            video: stream.getVideoTracks(),
            audio: stream.getAudioTracks(),
        };

        // Stop all tracks after testing
        stream.getTracks().forEach(track => track.stop());

        return {
            success: true,
            stream,
            tracks,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Run comprehensive WebRTC diagnostics
 */
export const runWebRTCDiagnostics = async (): Promise<{
    browserSupport: ReturnType<typeof checkWebRTCSupport>;
    permissions: Awaited<ReturnType<typeof checkMediaPermissions>>;
    devices: Awaited<ReturnType<typeof listMediaDevices>>;
    peerConnection: ReturnType<typeof testPeerConnectionCreation>;
    mediaStream: Awaited<ReturnType<typeof testMediaStreamAcquisition>>;
}> => {
    console.log('🔍 Running WebRTC Diagnostics...');

    const browserSupport = checkWebRTCSupport();
    console.log('✓ Browser Support:', browserSupport);

    const permissions = await checkMediaPermissions();
    console.log('✓ Permissions:', permissions);

    const devices = await listMediaDevices();
    console.log('✓ Devices:', devices);

    const peerConnection = testPeerConnectionCreation();
    console.log('✓ Peer Connection:', peerConnection);

    const mediaStream = await testMediaStreamAcquisition(true, true);
    console.log('✓ Media Stream:', mediaStream);

    const results = {
        browserSupport,
        permissions,
        devices,
        peerConnection,
        mediaStream,
    };

    console.log('✅ WebRTC Diagnostics Complete:', results);
    return results;
};

/**
 * Print diagnostic summary to console
 */
export const printWebRTCDiagnosticSummary = (
    diagnostics: Awaited<ReturnType<typeof runWebRTCDiagnostics>>
): void => {
    console.group('📊 WebRTC Diagnostic Summary');

    console.log('Browser Support:', diagnostics.browserSupport.supported ? '✅' : '❌');
    console.log('  - getUserMedia:', diagnostics.browserSupport.details.getUserMedia ? '✅' : '❌');
    console.log('  - RTCPeerConnection:', diagnostics.browserSupport.details.RTCPeerConnection ? '✅' : '❌');
    console.log('  - MediaDevices:', diagnostics.browserSupport.details.mediaDevices ? '✅' : '❌');

    console.log('\nPermissions:');
    console.log('  - Camera:', diagnostics.permissions.camera.state, diagnostics.permissions.camera.granted ? '✅' : '⚠️');
    console.log('  - Microphone:', diagnostics.permissions.microphone.state, diagnostics.permissions.microphone.granted ? '✅' : '⚠️');

    console.log('\nDevices:');
    console.log('  - Cameras:', diagnostics.devices.cameras.length);
    console.log('  - Microphones:', diagnostics.devices.microphones.length);
    console.log('  - Speakers:', diagnostics.devices.speakers.length);

    console.log('\nPeer Connection:', diagnostics.peerConnection.success ? '✅' : '❌');
    if (diagnostics.peerConnection.error) {
        console.log('  - Error:', diagnostics.peerConnection.error);
    }

    console.log('\nMedia Stream:', diagnostics.mediaStream.success ? '✅' : '❌');
    if (diagnostics.mediaStream.error) {
        console.log('  - Error:', diagnostics.mediaStream.error);
    } else if (diagnostics.mediaStream.tracks) {
        console.log('  - Video Tracks:', diagnostics.mediaStream.tracks.video.length);
        console.log('  - Audio Tracks:', diagnostics.mediaStream.tracks.audio.length);
    }

    console.groupEnd();
};

// Export for use in browser console
if (typeof window !== 'undefined') {
    (window as any).webrtcTest = {
        checkSupport: checkWebRTCSupport,
        checkPermissions: checkMediaPermissions,
        listDevices: listMediaDevices,
        testPeerConnection: testPeerConnectionCreation,
        testMediaStream: testMediaStreamAcquisition,
        runDiagnostics: runWebRTCDiagnostics,
        printSummary: printWebRTCDiagnosticSummary,
    };
    console.log('💡 WebRTC test utilities available at window.webrtcTest');
}