import React from 'react';

interface EmptyStateMessageProps {
    icon?: string;
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Reusable empty state component
 * Displays a centered message when no data is available
 */
const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({
    icon = '📭',
    title,
    message,
    action
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 max-w-xs">{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-4 bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyStateMessage;
