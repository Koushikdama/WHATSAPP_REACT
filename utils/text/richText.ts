/**
 * Rich text formatting utilities
 * Support for bold, italic, code, strikethrough in plain text
 */

export interface TextStyle {
    bold: boolean;
    italic: boolean;
    code: boolean;
    strikethrough: boolean;
}

/**
 * Convert markdown-style formatting to HTML
 */
export const parseMarkdown = (text: string): string => {
    if (!text) return '';

    let formatted = text;

    // Code blocks (```code```)
    formatted = formatted.replace(/```(.*?)```/g, '<code class="block bg-gray-800 p-2 rounded my-1">$1</code>');

    // Inline code (`code`)
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>');

    // Bold (**text** or __text__)
    formatted = formatted.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    formatted = formatted.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Strikethrough (~~text~~)
    formatted = formatted.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br/>');

    return formatted;
};

/**
 * Apply formatting to selected text
 */
export const applyFormatting = (
    text: string,
    selectionStart: number,
    selectionEnd: number,
    format: 'bold' | 'italic' | 'code' | 'strikethrough'
): { text: string; cursorPosition: number } => {
    const before = text.substring(0, selectionStart);
    const selected = text.substring(selectionStart, selectionEnd);
    const after = text.substring(selectionEnd);

    let formatted = selected;
    let wrapper = '';

    switch (format) {
        case 'bold':
            wrapper = '**';
            formatted = `**${selected}**`;
            break;
        case 'italic':
            wrapper = '*';
            formatted = `*${selected}*`;
            break;
        case 'code':
            wrapper = '`';
            formatted = `\`${selected}\``;
            break;
        case 'strikethrough':
            wrapper = '~~';
            formatted = `~~${selected}~~`;
            break;
    }

    const newText = before + formatted + after;
    const cursorPosition = selectionEnd + (wrapper.length * 2);

    return { text: newText, cursorPosition };
};

/**
 * Detect if text has any formatting
 */
export const hasFormatting = (text: string): boolean => {
    const patterns = [
        /\*\*[^\*]+\*\*/,  // Bold
        /\*[^\*]+\*/,      // Italic
        /`[^`]+`/,         // Code
        /~~[^~]+~~/,       // Strikethrough
    ];

    return patterns.some(pattern => pattern.test(text));
};

/**
 * Strip all formatting from text
 */
export const stripFormatting = (text: string): string => {
    return text
        .replace(/\*\*([^\*]+)\*\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/\*([^\*]+)\*/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/```(.*?)```/g, '$1');
};

/**
 * Get formatting toolbar shortcuts
 */
export const getFormattingShortcuts = (): { [key: string]: string } => {
    return {
        'Ctrl+B': 'Bold',
        'Ctrl+I': 'Italic',
        'Ctrl+E': 'Code',
        'Ctrl+Shift+X': 'Strikethrough',
    };
};
