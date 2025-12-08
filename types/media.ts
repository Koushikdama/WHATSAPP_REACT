/**
 * Media type definitions for base64 storage
 */

export interface MediaMetadata {
    width?: number;
    height?: number;
    duration?: number;
    size: number;
    mimeType: string;
    originalName: string;
}

export interface Base64Media {
    type: 'image' | 'video' | 'audio';
    base64: string;
    thumbnail?: string;
    metadata: MediaMetadata;
    isChunked?: boolean;
    chunkIds?: string[];
}

export interface MediaChunk {
    id: string;
    index: number;
    totalChunks: number;
    data: string;
    parentId: string;
}

export type MediaType = 'image' | 'video' | 'audio' | 'document';

export const MEDIA_SIZE_LIMITS = {
    maxFileSize: 10 * 1024 * 1024, // 10 MB absolute max
    targetImageSize: 400, // Target 400 KB for images
    targetAudioSize: 500, // Target 500 KB for audio
    targetVideoSize: 800, // Target 800 KB for video (heavily compressed)
    thumbnailSize: 50, // 50 KB for thumbnails
    chunkSize: 700 * 1024, // 700 KB per chunk (leaves room for overhead)
} as const;

export const ALLOWED_MIME_TYPES = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
    video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a'],
    document: ['application/pdf', 'text/plain', 'application/msword'],
} as const;
