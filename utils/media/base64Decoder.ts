/**
 * Convert base64 string to Blob
 */
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

/**
 * Convert base64 to object URL
 */
export const base64ToObjectURL = (base64: string, mimeType: string): string => {
    const blob = base64ToBlob(base64, mimeType);
    return URL.createObjectURL(blob);
};

/**
 * Download base64 file
 */
export const downloadBase64File = (
    base64: string,
    filename: string,
    mimeType: string
): void => {
    const blob = base64ToBlob(base64, mimeType);
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
};

/**
 * Create data URL from base64
 */
export const base64ToDataURL = (base64: string, mimeType: string): string => {
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    return `data:${mimeType};base64,${base64Data}`;
};

/**
 * Get base64 size in bytes
 */
export const getBase64Size = (base64: string): number => {
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    return (base64Data.length * 3) / 4;
};
