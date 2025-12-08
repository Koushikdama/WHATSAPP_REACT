import React from 'react';
import { Link } from 'react-router-dom';
import { MessagePlusIcon } from '../icons';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionText?: string;
    actionLink?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionText,
    actionLink,
    onAction,
}) => {
    return (
        <div className="empty-state fade-in">
            {icon && <div className="empty-state-icon">{icon}</div>}
            <h3 className="empty-state-text font-medium">{title}</h3>
            {description && <p className="empty-state-subtext">{description}</p>}
            {(actionText || actionLink) && (
                <div className="mt-6">
                    {actionLink ? (
                        <Link
                            to={actionLink}
                            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-full hover:opacity-90 transition-all duration-200 shadow-lg"
                        >
                            <MessagePlusIcon className="h-5 w-5 mr-2" />
                            {actionText}
                        </Link>
                    ) : onAction ? (
                        <button
                            onClick={onAction}
                            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-full hover:opacity-90 transition-all duration-200shadow-lg"
                        >
                            {actionText}
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
