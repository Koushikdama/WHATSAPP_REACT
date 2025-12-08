import React from 'react';

interface StatCardProps {
    icon: string;
    value: string | number;
    label: string;
    formatter?: (val: number) => string;
}

/**
 * Reusable statistics card component
 * Used for displaying metrics like message count, storage, etc.
 */
const StatCard: React.FC<StatCardProps> = ({ icon, value, label, formatter }) => {
    const displayValue = typeof value === 'number' && formatter
        ? formatter(value)
        : typeof value === 'number'
            ? value.toLocaleString()
            : value;

    return (
        <div className="bg-[#202c33] rounded-lg p-4">
            <div className="flex items-center gap-3">
                <div className="text-3xl">{icon}</div>
                <div>
                    <p className="text-2xl font-bold text-white">{displayValue}</p>
                    <p className="text-sm text-gray-400">{label}</p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
