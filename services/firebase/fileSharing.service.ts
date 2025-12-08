/**
 * Advanced file sharing service
 * Support for large files, previews, and shared media galleries
 */

import { doc, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject, getStorage } from 'firebase/storage';
import { db } from '../../firebase/config';

const storage = getStorage();

export interface FileMetadata {
    id: string;
    chatId: string;
    uploadedBy: string;
    uploaderName: string;
    fileName: string;
    fileSize: number;
    fileType: 'image' | 'video' | 'document' | 'audio';
    mimeType: string;
    url: string;
    thumbnailUrl?: string;
    uploadedAt: string;
    messageId?: string;
}

const FILES_COLLECTION = 'shared_files';

/**
 * Upload file with progress tracking
 */
export const uploadFileWithProgress = async (
    file: File,
    chatId: string,
    userId: string,
    userName: string,
    onProgress?: (progress: number) => void
): Promise<FileMetadata> => {
    try {
        // Create unique file path
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `chats/${chatId}/${timestamp}_${sanitizedFileName}`;

        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Track upload progress
        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress?.(progress);
                },
                (error) => {
                    console.error('Upload error:', error);
                    reject(error);
                },
                async () => {
                    // Upload complete
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // Determine file type
                    const fileType = getFileType(file.type);

                    // Create metadata
                    const metadata: Omit<FileMetadata, 'id'> = {
                        chatId,
                        uploadedBy: userId,
                        uploaderName: userName,
                        fileName: file.name,
                        fileSize: file.size,
                        fileType,
                        mimeType: file.type,
                        url: downloadURL,
                        uploadedAt: new Date().toISOString(),
                    };

                    // Save metadata to Firestore
                    const docRef = await addDoc(collection(db, FILES_COLLECTION), metadata);

                    resolve({
                        id: docRef.id,
                        ...metadata,
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

/**
 * Get file type from MIME type
 */
const getFileType = (mimeType: string): FileMetadata['fileType'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
};

/**
 * Get shared media gallery for a chat
 */
export const getSharedMedia = async (
    chatId: string,
    fileType?: FileMetadata['fileType'],
    limitCount: number = 50
): Promise<FileMetadata[]> => {
    try {
        let q = query(
            collection(db, FILES_COLLECTION),
            where('chatId', '==', chatId),
            orderBy('uploadedAt', 'desc'),
            limit(limitCount)
        );

        if (fileType) {
            q = query(
                collection(db, FILES_COLLECTION),
                where('chatId', '==', chatId),
                where('fileType', '==', fileType),
                orderBy('uploadedAt', 'desc'),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(q);
        const files: FileMetadata[] = [];

        snapshot.forEach((doc) => {
            files.push({
                id: doc.id,
                ...doc.data(),
            } as FileMetadata);
        });

        return files;
    } catch (error) {
        console.error('Error getting shared media:', error);
        return [];
    }
};

/**
 * Delete file
 */
export const deleteFile = async (fileId: string, fileUrl: string): Promise<void> => {
    try {
        // Delete from Storage
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);

        // Delete metadata from Firestore
        await deleteDoc(doc(db, FILES_COLLECTION, fileId));
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

/**
 * Get file preview URL (for images/videos)
 */
export const getFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target?.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        } else {
            resolve(''); // No preview for non-media files
        }
    });
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
