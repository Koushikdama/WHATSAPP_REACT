import { MediaMetadata, MEDIA_SIZE_LIMITS } from '../../types/media';

/**
 * Compress and convert image to base64
 */
export const imageToBase64 = async (
    file: File,
    maxSizeKB: number = MEDIA_SIZE_LIMITS.targetImageSize
): Promise<{ base64: string; metadata: MediaMetadata }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    // Get original dimensions
                    const originalWidth = img.width;
                    const originalHeight = img.height;

                    // Compress image
                    const compressed = await compressImage(img, maxSizeKB, file.type);

                    const metadata: MediaMetadata = {
                        width: originalWidth,
                        height: originalHeight,
                        size: compressed.size,
                        mimeType: compressed.type,
                        originalName: file.name,
                    };

                    resolve({
                        base64: compressed.base64,
                        metadata,
                    });
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

/**
 * Compress image to target size
 */
const compressImage = async (
    img: HTMLImageElement,
    maxSizeKB: number,
    mimeType: string
): Promise<{ base64: string; size: number; type: string }> => {
    // Convert HEIC/HEIF to JPEG
    const outputType = mimeType.includes('heic') || mimeType.includes('heif')
        ? 'image/jpeg'
        : mimeType;

    // Start with max dimensions
    let maxWidth = 1920;
    let maxHeight = 1080;
    let quality = 0.85;

    let result: { base64: string; size: number; type: string } | null = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        // Resize image
        const resized = resizeImage(img, maxWidth, maxHeight);

        // Convert to base64
        const base64 = canvasToBase64(resized.canvas, outputType, quality);
        const sizeKB = calculateBase64SizeKB(base64);

        result = {
            base64: base64.split(',')[1], // Remove data:image prefix
            size: sizeKB * 1024,
            type: outputType,
        };

        // Check if size is acceptable
        if (sizeKB <= maxSizeKB) {
            break;
        }

        // Reduce quality or dimensions for next iteration
        if (quality > 0.5) {
            quality -= 0.1;
        } else {
            maxWidth = Math.floor(maxWidth * 0.8);
            maxHeight = Math.floor(maxHeight * 0.8);
            quality = 0.85; // Reset quality
        }

        attempts++;
    }

    return result!;
};

/**
 * Resize image maintaining aspect ratio
 */
const resizeImage = (
    img: HTMLImageElement,
    maxWidth: number,
    maxHeight: number
): { canvas: HTMLCanvasElement; width: number; height: number } => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    let width = img.width;
    let height = img.height;

    // Calculate new dimensions
    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;

    // Draw image with high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    return { canvas, width, height };
};

/**
 * Convert canvas to base64
 */
const canvasToBase64 = (
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality: number
): string => {
    return canvas.toDataURL(mimeType, quality);
};

/**
 * Calculate base64 string size in KB
 */
const calculateBase64SizeKB = (base64: string): number => {
    // Remove data URL prefix if present
    const base64Data = base64.split(',')[1] || base64;
    const bytes = (base64Data.length * 3) / 4;
    return bytes / 1024;
};

/**
 * Generate thumbnail from image
 */
export const generateThumbnail = async (
    file: File,
    size: number = 300
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const resized = resizeImage(img, size, size);
                const base64 = canvasToBase64(resized.canvas, 'image/jpeg', 0.7);
                resolve(base64.split(',')[1]); // Remove data:image prefix
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

/**
 * Simple file to base64 conversion (without compression)
 */
export const fileToBase64 = (file: File): Promise<string> => {
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
