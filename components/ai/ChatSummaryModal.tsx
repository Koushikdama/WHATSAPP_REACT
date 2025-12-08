import React, { useState } from 'react';
import { X, Sparkles, Copy, Download } from 'lucide-react';
import { Message } from '../../types';
import { summarizeChat } from '../../services/ai.service';

interface ChatSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
}

const ChatSummaryModal: React.FC<ChatSummaryModalProps> = ({
    isOpen,
    onClose,
    messages,
}) => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            // Simulate delay for AI processing
            setTimeout(() => {
                const generated = summarizeChat(messages);
                setSummary(generated);
                setIsLoading(false);
            }, 500);
        }
    }, [isOpen, messages]);

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        alert('Summary copied to clipboard!');
    };

    const handleDownload = () => {
        const blob = new Blob([summary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-summary-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#202c33] rounded-lg w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Sparkles className="h-6 w-6 text-purple-400" />
                        <h2 className="text-xl font-semibold text-white">Chat Summary</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Loading or Summary */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-gray-400">Analyzing conversation...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Content */}
                        <div className="bg-[#111b21] rounded-lg p-4 mb-4 whitespace-pre-wrap text-sm text-gray-300">
                            {summary.split('\n').map((line, idx) => {
                                if (line.startsWith('📊') || line.startsWith('**')) {
                                    return <div key={idx} className="font-semibold text-white mb-2">{line.replace(/\*\*/g, '')}</div>;
                                }
                                return <div key={idx} className="mb-1">{line}</div>;
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCopy}
                                className="flex-1 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 transition-colors"
                            >
                                <Copy className="h-4 w-4" />
                                <span>Copy</span>
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex-1 flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white rounded-lg py-2 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                            </button>
                        </div>

                        {/* Info */}
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            Summary generated from last {Math.min(messages.length, 50)} messages
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatSummaryModal;
