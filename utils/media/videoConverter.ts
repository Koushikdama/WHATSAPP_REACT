import { MediaMetadata } from '../../types/media';

/**
 * Generate video thumbnail from first frame
 */
export const generateVideoThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;

        video.onloadedmetadata = () => {
            // Seek to 1 second or 10% of duration, whichever is smaller
            const seekTime = Math.min(1, video.duration * 0.1);
            video.currentTime = seekTime;
        };

        video.onseeked = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = Math.min(video.videoWidth, 640);
                canvas.height = Math.min(video.videoHeight, 480);

                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const base64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(base64.split(',')[1]); // Remove data:image prefix

                // Cleanup
                URL.revokeObjectURL(video.src);
            } catch (error) {
                reject(error);
            }
        };

        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            reject(new Error('Failed to load video'));
        };

        video.src = URL.createObjectURL(file);
    });
};

/**
 * Get video duration
 */
export const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            resolve(video.duration);
            URL.revokeObjectURL(video.src);
        };

        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            reject(new Error('Failed to load video'));
        };

        video.src = URL.createObjectURL(file);
    });
};

/**
 * Get video dimensions
 */
export const getVideoDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            resolve({
                width: video.videoWidth,
                height: video.videoHeight,
            });
            URL.revokeObjectURL(video.src);
        };

        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            reject(new Error('Failed to load video'));
        };

        video.src = URL.createObjectURL(file);
    });
};

/**
 * Extract video metadata
 */
export const getVideoMetadata = async (file: File): Promise<MediaMetadata> => {
    const [duration, dimensions] = await Promise.all([
        getVideoDuration(file),
        getVideoDimensions(file),
    ]);

    return {
        duration,
        width: dimensions.width,
        height: dimensions.height,
        size: file.size,
        mimeType: file.type,
        originalName: file.name,
    };
};

/**
 * Convert video to base64
 * Note: For large videos, this should be used with chunking
 */
export const videoToBase64 = (file: File): Promise<string> => {
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
