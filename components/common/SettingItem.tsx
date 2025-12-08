import React from 'react';
import ThemeToggle from '../ui/ThemeToggle';

interface SettingOption {
    label: string;
    value: string;
}

interface BaseSettingItemProps {
    title: string;
    description: string;
    disabled?: boolean;
}

interface ToggleSettingItemProps extends BaseSettingItemProps {
    type: 'toggle';
    value: boolean;
    onChange: (value: boolean) => void;
}

interface SelectSettingItemProps extends BaseSettingItemProps {
    type: 'select';
    value: string;
    options: SettingOption[];
    onChange: (value: string) => void;
}

type SettingItemProps = ToggleSettingItemProps | SelectSettingItemProps;

/**
 * Reusable setting item component
 * Supports toggle and select variants for consistent settings UI
 */
const SettingItem: React.FC<SettingItemProps> = (props) => {
    const { title, description, disabled = false } = props;

    if (props.type === 'toggle') {
        return (
            <div className="flex items-center justify-between p-4 hover:bg-[#202c33] transition-colors">
                <div className="flex-1">
                    <h3 className="text-white font-medium">{title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{description}</p>
                </div>
                <ThemeToggle
                    checked={props.value}
                    onChange={props.onChange}
                    disabled={disabled}
                />
            </div>
        );
    }

    // Select variant
    return (
        <div className="p-4 hover:bg-[#202c33] transition-colors">
            <div className="mb-3">
                <h3 className="text-white font-medium">{title}</h3>
                <p className="text-sm text-gray-400 mt-1">{description}</p>
            </div>
            <div className="flex gap-2">
                {props.options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => props.onChange(option.value)}
                        disabled={disabled}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${props.value === option.value
                                ? 'bg-primary text-white'
                                : 'bg-[#2a3942] text-gray-300 hover:bg-[#374248]'
                            } disabled:opacity-50`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SettingItem;
