import { MediaType, ALLOWED_MIME_TYPES, MEDIA_SIZE_LIMITS } from '../../types/media';

/**
 * Validate file size against limits
 */
export const validateFileSize = (file: File, maxSizeKB: number = MEDIA_SIZE_LIMITS.maxFileSize / 1024): boolean => {
    const fileSizeKB = file.size / 1024;
    return fileSizeKB <= maxSizeKB;
};

/**
 * Validate file type
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
};

/**
 * Get media type from file
 */
export const getMediaType = (file: File): MediaType => {
    const mimeType = file.type;

    if (ALLOWED_MIME_TYPES.image.includes(mimeType as any)) return 'image';
    if (ALLOWED_MIME_TYPES.video.includes(mimeType as any)) return 'video';
    if (ALLOWED_MIME_TYPES.audio.includes(mimeType as any)) return 'audio';
    return 'document';
};

/**
 * Calculate estimated base64 size
 * Base64 encoding increases size by approximately 33%
 */
export const calculateBase64Size = (originalSizeBytes: number): number => {
    return Math.ceil(originalSizeBytes * 1.33);
};

/**
 * Check if file will fit in single Firestore document
 * Firestore limit: 1 MB, leaving room for metadata
 */
export const willFitInDocument = (file: File): boolean => {
    const base64Size = calculateBase64Size(file.size);
    const firestoreLimit = 900 * 1024; // 900 KB to be safe
    return base64Size <= firestoreLimit;
};

/**
 * Calculate number of chunks needed
 */
export const calculateChunksNeeded = (file: File): number => {
    const base64Size = calculateBase64Size(file.size);
    return Math.ceil(base64Size / MEDIA_SIZE_LIMITS.chunkSize);
};

/**
 * Validate file before processing
 */
export const validateFile = (
    file: File,
    mediaType: MediaType
): { valid: boolean; error?: string } => {
    // Check file size
    if (!validateFileSize(file)) {
        return {
            valid: false,
            error: `File size exceeds ${MEDIA_SIZE_LIMITS.maxFileSize / (1024 * 1024)} MB limit`,
        };
    }

    // Check file type
    const allowedTypes = ALLOWED_MIME_TYPES[mediaType] || [];
    if (!validateFileType(file, allowedTypes)) {
        return {
            valid: false,
            error: `File type ${file.type} not supported for ${mediaType}`,
        };
    }

    return { valid: true };
};

/**
 * Format bytes to human-readable size
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
