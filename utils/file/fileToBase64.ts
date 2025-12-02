/**
 * Utility functions for file conversion and validation
 */

/**
 * Converts a File to a base64 data URL string
 * @param file - The file to convert
 * @returns Promise that resolves to base64 data URL string
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Error reading file'));
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Determines the file type based on MIME type
 * @param file - The file to check
 * @returns The file type: 'image', 'video', or 'audio'
 */
export const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('video/')) {
        return 'video';
    } else if (file.type.startsWith('audio/')) {
        return 'audio';
    } else {
        return 'image';
    }
};

/**
 * Validates if a file size is within the allowed limit
 * @param file - The file to validate
 * @param maxSizeMB - Maximum allowed size in megabytes
 * @returns true if file is within size limit, false otherwise
 */
export const validateFileSize = (file: File, maxSizeMB: number = 0.7): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};

/**
 * Formats file size to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "500 KB")
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Estimates the base64 encoded size of a file
 * Base64 encoding increases size by approximately 33%
 * @param file - The file to estimate
 * @returns Estimated size in bytes after base64 encoding
 */
export const estimateBase64Size = (file: File): number => {
    return Math.ceil(file.size * 1.33);
};
