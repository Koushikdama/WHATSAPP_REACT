/**
 * Centralized media handling service for base64 storage
 * Supports images, videos, and audio with automatic compression and chunking
 */

import { collection, doc, setDoc, getDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Base64Media, MediaMetadata, MediaChunk, MediaType } from '../../types/media';
import {
    imageToBase64,
    generateThumbnail,
    videoToBase64,
    generateVideoThumbnail,
    getVideoMetadata,
    audioToBase64,
    getAudioMetadata,
    validateFile,
    willFitInDocument,
    calculateChunksNeeded,
    chunkBase64,
    reassembleBase64,
    generateChunkId,
} from '../../utils/media';

const MEDIA_COLLECTION = 'media';
const CHUNKS_COLLECTION = 'media_chunks';

/**
 * Upload media file with automatic compression and base64 conversion
 */
export const uploadMedia = async (
    file: File,
    mediaType: MediaType,
    onProgress?: (progress: number) => void
): Promise<Base64Media> => {
    // Validate file
    const validation = validateFile(file, mediaType);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    onProgress?.(10);

    let base64: string;
    let thumbnail: string | undefined;
    let metadata: MediaMetadata;

    try {
        switch (mediaType) {
            case 'image':
                onProgress?.(20);
                const imageResult = await imageToBase64(file);
                base64 = imageResult.base64;
                metadata = imageResult.metadata;

                // Generate thumbnail
                onProgress?.(60);
                thumbnail = await generateThumbnail(file);
                break;

            case 'video':
                onProgress?.(20);
                base64 = await videoToBase64(file);
                metadata = await getVideoMetadata(file);

                // Generate thumbnail from first frame
                onProgress?.(60);
                thumbnail = await generateVideoThumbnail(file);
                break;

            case 'audio':
                onProgress?.(20);
                base64 = await audioToBase64(file);
                metadata = await getAudioMetadata(file);
                onProgress?.(60);
                break;

            default:
                throw new Error(`Unsupported media type: ${mediaType}`);
        }

        onProgress?.(80);

        // Check if needs chunking
        const needsChunking = !willFitInDocument(file);

        const mediaData: Base64Media = {
            type: mediaType,
            base64: needsChunking ? '' : base64, // Don't store if chunked
            thumbnail,
            metadata,
            isChunked: needsChunking,
            chunkIds: needsChunking ? [] : undefined,
        };

        // If needs chunking, split and store chunks
        if (needsChunking) {
            const chunks = chunkBase64(base64);
            const chunkIds: string[] = [];
            const mediaId = doc(collection(db, MEDIA_COLLECTION)).id; // Generate ID

            for (let i = 0; i < chunks.length; i++) {
                const chunkId = generateChunkId(mediaId, i);
                const chunk: MediaChunk = {
                    id: chunkId,
                    index: i,
                    totalChunks: chunks.length,
                    data: chunks[i],
                    parentId: mediaId,
                };

                await setDoc(doc(db, CHUNKS_COLLECTION, chunkId), chunk);
                chunkIds.push(chunkId);
            }

            mediaData.chunkIds = chunkIds;
        }

        onProgress?.(100);
        return mediaData;

    } catch (error) {
        console.error('Error uploading media:', error);
        throw error;
    }
};

/**
 * Retrieve media including reassembly of chunks if needed
 */
export const getMedia = async (mediaData: Base64Media): Promise<string> => {
    if (!mediaData.isChunked) {
        return mediaData.base64;
    }

    // Retrieve all chunks
    if (!mediaData.chunkIds || mediaData.chunkIds.length === 0) {
        throw new Error('No chunks found for chunked media');
    }

    const chunkPromises = mediaData.chunkIds.map(async (chunkId) => {
        const chunkDoc = await getDoc(doc(db, CHUNKS_COLLECTION, chunkId));
        if (!chunkDoc.exists()) {
            throw new Error(`Chunk ${chunkId} not found`);
        }
        return chunkDoc.data() as MediaChunk;
    });

    const chunks = await Promise.all(chunkPromises);

    // Sort by index to ensure correct order
    chunks.sort((a, b) => a.index - b.index);

    // Reassemble
    return reassembleBase64(chunks.map(c => c.data));
};

/**
 * Delete media and all associated chunks
 */
export const deleteMedia = async (mediaData: Base64Media): Promise<void> => {
    if (mediaData.isChunked && mediaData.chunkIds) {
        // Delete all chunks
        const deletePromises = mediaData.chunkIds.map(chunkId =>
            deleteDoc(doc(db, CHUNKS_COLLECTION, chunkId))
        );
        await Promise.all(deletePromises);
    }
};

/**
 * Get displayable URL from media data
 */
export const getMediaUrl = (mediaData: Base64Media): string => {
    if (mediaData.base64) {
        return `data:${mediaData.metadata.mimeType};base64,${mediaData.base64}`;
    }
    // For chunked media, return thumbnail as placeholder
    if (mediaData.thumbnail) {
        return `data:image/jpeg;base64,${mediaData.thumbnail}`;
    }
    return '';
};

/**
 * Get thumbnail URL
 */
export const getThumbnailUrl = (mediaData: Base64Media): string | undefined => {
    if (mediaData.thumbnail) {
        return `data:image/jpeg;base64,${mediaData.thumbnail}`;
    }
    return undefined;
};
