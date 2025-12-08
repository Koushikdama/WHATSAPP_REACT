import { MediaMetadata } from '../../types/media';

/**
 * Get audio duration
 */
export const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const audio = new Audio();

        audio.onloadedmetadata = () => {
            resolve(audio.duration);
            URL.revokeObjectURL(audio.src);
        };

        audio.onerror = () => {
            URL.revokeObjectURL(audio.src);
            reject(new Error('Failed to load audio'));
        };

        audio.src = URL.createObjectURL(file);
    });
};

/**
 * Extract audio metadata
 */
export const getAudioMetadata = async (file: File): Promise<MediaMetadata> => {
    const duration = await getAudioDuration(file);

    return {
        duration,
        size: file.size,
        mimeType: file.type,
        originalName: file.name,
    };
};

/**
 * Convert audio to base64
 */
export const audioToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Generate audio waveform data for visualization
 * Returns array of amplitudes (0-1) for waveform display
 */
export const generateWaveform = async (
    file: File,
    samples: number = 100
): Promise<number[]> => {
    return new Promise((resolve, reject) => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                const rawData = audioBuffer.getChannelData(0); // Use first channel
                const blockSize = Math.floor(rawData.length / samples);
                const waveform: number[] = [];

                for (let i = 0; i < samples; i++) {
                    const start = blockSize * i;
                    let sum = 0;

                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(rawData[start + j]);
                    }

                    waveform.push(sum / blockSize);
                }

                // Normalize to 0-1 range
                const max = Math.max(...waveform);
                const normalized = waveform.map(v => v / max);

                resolve(normalized);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};
