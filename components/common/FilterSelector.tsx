import React from 'react';

interface FilterOption {
    label: string;
    value: string | number;
}

interface FilterSelectorProps {
    options: FilterOption[];
    value: string | number;
    onChange: (value: any) => void;
    className?: string;
}

/**
 * Reusable filter selector (dropdown) component
 * Used for time ranges, chat type filters, etc.
 */
const FilterSelector: React.FC<FilterSelectorProps> = ({
    options,
    value,
    onChange,
    className = ''
}) => {
    return (
        <select
            value={value}
            onChange={(e) => {
                const val = e.target.value;
                // Try to parse as number if it looks like a number
                const parsedValue = !isNaN(Number(val)) ? Number(val) : val;
                onChange(parsedValue);
            }}
            className={`bg-[#202c33] text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default FilterSelector;
