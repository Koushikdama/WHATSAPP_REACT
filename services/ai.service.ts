/**
 * AI Services - Smart replies and chat summarization
 * Initially using pattern matching, can be upgraded to OpenAI API later
 */

import { Message } from '../types';

/**
 * Generate smart reply suggestions based on message content
 */
export const generateSmartReplies = (message: Message): string[] => {
    const content = message.content.toLowerCase();

    // Pattern-based smart replies
    if (content.includes('how are you') || content.includes('how r u')) {
        return ['Good, thanks!', 'Doing great!', 'Busy but good'];
    }

    if (content.includes('thank you') || content.includes('thanks')) {
        return ["You're welcome!", 'No problem!', 'Anytime! 😊'];
    }

    if (content.includes('sorry')) {
        return ["It's okay", 'No worries', 'All good!'];
    }

    if (content.endsWith('?')) {
        return ['Yes', 'No', 'Maybe', 'Let me check'];
    }

    if (content.includes('meet') || content.includes('meeting')) {
        return ['Sure, when?', 'What time?', 'Sounds good'];
    }

    if (content.includes('lunch') || content.includes('dinner') || content.includes('coffee')) {
        return ["I'd love to!", 'Sure!', 'Maybe next time'];
    }

    if (content.includes('congrats') || content.includes('congratulations')) {
        return ['Thank you so much!', 'Thanks! 🎉', 'Appreciate it!'];
    }

    // Default replies
    return ['👍', 'Okay', 'Got it', 'Sure'];
};

/**
 * Summarize chat messages
 */
export const summarizeChat = (messages: Message[], maxMessages: number = 50): string => {
    if (messages.length === 0) return 'No messages to summarize.';

    const recentMessages = messages.slice(-maxMessages);

    // Extract participants
    const participants = [...new Set(recentMessages.map(m => m.senderName || 'Unknown'))];

    // Count message types
    const textCount = recentMessages.filter(m => m.messageType === 'text').length;
    const imageCount = recentMessages.filter(m => m.messageType === 'image').length;
    const videoCount = recentMessages.filter(m => m.messageType === 'video').length;
    const documentCount = recentMessages.filter(m => m.messageType === 'document').length;

    // Extract keywords (simple frequency analysis)
    const words = recentMessages
        .filter(m => m.messageType === 'text')
        .flatMap(m => m.content.toLowerCase().split(/\s+/))
        .filter(word => word.length > 4 && !commonWords.has(word));

    const wordFreq = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const keywords = Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);

    // Build summary
    let summary = `📊 **Chat Summary (Last ${recentMessages.length} messages)**\n\n`;
    summary += `**Participants:** ${participants.join(', ')}\n\n`;
    summary += `**Activity:**\n`;
    summary += `- 💬 ${textCount} text messages\n`;
    if (imageCount > 0) summary += `- 🖼️ ${imageCount} images\n`;
    if (videoCount > 0) summary += `- 🎥 ${videoCount} videos\n`;
    if (documentCount > 0) summary += `- 📎 ${documentCount} documents\n`;

    if (keywords.length > 0) {
        summary += `\n**Key Topics:** ${keywords.join(', ')}`;
    }

    // Add reactions summary
    const totalReactions = recentMessages.reduce((sum, msg) => {
        if (msg.reactions) {
            return sum + Object.values(msg.reactions).reduce((s, users) => s + (users as any).length, 0);
        }
        return sum;
    }, 0);

    if (totalReactions > 0) {
        summary += `\n\n**Engagement:** ${totalReactions} reactions`;
    }

    return summary;
};

/**
 * Common words to exclude from keyword extraction
 */
const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
    'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
    'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some',
    'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look',
    'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
    'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new',
    'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'yeah',
    'okay', 'ok', 'lol', 'haha', 'yes', 'no', 'sure',
]);

/**
 * Generate AI-powered context suggestions (placeholder for future API integration)
 */
export const generateContextSuggestions = async (
    messages: Message[],
    currentInput: string
): Promise<string[]> => {
    // This would integrate with OpenAI/Anthropic API in the future
    // For now, return simple suggestions based on context

    if (currentInput.length < 3) return [];

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return [];

    // Simple autocomplete suggestions
    const suggestions: string[] = [];

    if (currentInput.startsWith('i ')) {
        suggestions.push(`I think that's great`, `I agree`, `I'll check`);
    } else if (currentInput.startsWith('we ')) {
        suggestions.push(`We should discuss this`, `We can meet tomorrow`, `We need to finish this`);
    } else if (currentInput.startsWith('let')) {
        suggestions.push(`Let me know`, `Let's do it`, `Let's meet`);
    }

    return suggestions;
};
