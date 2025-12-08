import React from 'react';
import { useAppContext } from '../../context/AppContext';

interface SegmentedOption {
    label: string;
    value: string;
}

interface SegmentedButtonProps {
    options: SegmentedOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

/**
 * Reusable segmented button component
 * Displays a group of mutually exclusive buttons with glossy theme support
 */
const SegmentedButton: React.FC<SegmentedButtonProps> = ({
    options,
    value,
    onChange,
    className = ''
}) => {
    const { themeSettings } = useAppContext();
    const isGlossy = themeSettings.uiStyle === 'glossy';

    return (
        <div className={`flex flex-wrap gap-2 bg-[#2a3942] rounded-lg p-1 w-full ${className}`}>
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`flex-grow px-3 py-1 text-sm rounded-md transition-colors text-center ${isSelected
                                ? `text-white shadow ${isGlossy ? '' : 'bg-primary'}`
                                : 'text-gray-300 hover:bg-[#3c4a54]'
                            } ${isSelected && isGlossy ? 'glossy-button' : ''}`}
                        style={
                            isSelected && !isGlossy
                                ? {
                                    backgroundImage: `linear-gradient(to right, ${themeSettings.themeColor.from}, ${themeSettings.themeColor.to})`,
                                }
                                : {}
                        }
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default SegmentedButton;
