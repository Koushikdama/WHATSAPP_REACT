import React from 'react';

interface ChartOption {
    label: string;
    value: string;
}

interface ChartTypeSelectorProps {
    options: ChartOption[];
    selected: string;
    onChange: (value: string) => void;
}

/**
 * Reusable chart type selector component
 * Displays toggle buttons for switching between chart types (e.g., Line/Bar, Pie/Donut)
 */
const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({ options, selected, onChange }) => {
    return (
        <div className="flex gap-2 bg-[#111b21] rounded-lg p-1">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${selected === option.value
                            ? 'bg-primary text-white'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default ChartTypeSelector;
