import { MEDIA_SIZE_LIMITS } from '../../types/media';

/**
 * Split base64 string into chunks for Firestore storage
 */
export const chunkBase64 = (base64: string): string[] => {
    const chunkSize = MEDIA_SIZE_LIMITS.chunkSize;
    const chunks: string[] = [];

    for (let i = 0; i < base64.length; i += chunkSize) {
        chunks.push(base64.substring(i, i + chunkSize));
    }

    return chunks;
};

/**
 * Reassemble base64 chunks
 */
export const reassembleBase64 = (chunks: string[]): string => {
    return chunks.join('');
};

/**
 * Generate unique chunk ID
 */
export const generateChunkId = (parentId: string, index: number): string => {
    return `${parentId}_chunk_${index}`;
};
