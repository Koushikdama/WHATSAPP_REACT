export interface CallDocument {
    id: string;
    callerId: string;
    receiverId: string;
    type: 'audio' | 'video';
    status: 'calling' | 'ringing' | 'active' | 'ended' | 'rejected' | 'missed';
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    callerIceCandidates: RTCIceCandidateInit[];
    receiverIceCandidates: RTCIceCandidateInit[];
    startTime: any;
    endTime?: any;
    duration?: number;
}

export const initiateCall = async (
    callerId: string,
    receiverId: string,
    type: 'audio' | 'video',
    offer: RTCSessionDescriptionInit
): Promise<string> => {
    console.log('Mock initiateCall', { callerId, receiverId, type });
    return 'mock-call-id';
};

export const answerCall = async (
    callId: string,
    answer: RTCSessionDescriptionInit
): Promise<void> => {
    console.log('Mock answerCall', { callId });
};

export const addIceCandidateToCall = async (
    callId: string,
    candidate: RTCIceCandidateInit,
    isCallerCandidate: boolean
): Promise<void> => {
    console.log('Mock addIceCandidateToCall', { callId, isCallerCandidate });
};

export const updateCallStatus = async (
    callId: string,
    status: CallDocument['status']
): Promise<void> => {
    console.log('Mock updateCallStatus', { callId, status });
};

export const endCall = async (callId: string): Promise<void> => {
    console.log('Mock endCall', { callId });
};

export const rejectCall = async (callId: string): Promise<void> => {
    console.log('Mock rejectCall', { callId });
};

export const markCallMissed = async (callId: string): Promise<void> => {
    console.log('Mock markCallMissed', { callId });
};

export const subscribeToCall = (
    callId: string,
    callback: (call: CallDocument | null) => void
): (() => void) => {
    console.log('Mock subscribeToCall', { callId });
    return () => { };
};

export const subscribeToIncomingCalls = (
    userId: string,
    callback: (call: CallDocument) => void
): (() => void) => {
    console.log('Mock subscribeToIncomingCalls', { userId });
    return () => { };
};

export const getUserCallHistory = async (userId: string): Promise<CallDocument[]> => {
    return [];
};