import React from 'react';
import { Sparkles } from 'lucide-react';

interface SmartReplyBarProps {
    suggestions: string[];
    onSelectReply: (reply: string) => void;
}

const SmartReplyBar: React.FC<SmartReplyBarProps> = ({ suggestions, onSelectReply }) => {
    if (suggestions.length === 0) return null;

    return (
        <div className="bg-[#202c33]/50 backdrop-blur-sm border-t border-gray-700 px-4 py-2">
            <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-gray-400 font-medium">Quick Replies</span>
            </div>

            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectReply(suggestion)}
                        className="flex-shrink-0 px-4 py-2 bg-[#2a3942] hover:bg-[#374248] text-white text-sm rounded-full transition-colors border border-gray-600"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SmartReplyBar;
