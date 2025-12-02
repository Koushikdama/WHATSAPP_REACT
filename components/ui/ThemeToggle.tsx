import React from 'react';
import { useAppContext } from '../../context/AppContext';

interface ThemeToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ checked, onChange, disabled = false, id }) => {
  const { themeSettings } = useAppContext();
  const isGlossy = themeSettings.uiStyle === 'glossy';

  const toggleStyle = checked
    ? {
      backgroundImage: `linear-gradient(to right, ${themeSettings.toggleOnColor.from}, ${themeSettings.toggleOnColor.to})`,
      ...(isGlossy && {
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.2)`,
      }),
    }
    : {
      backgroundColor: themeSettings.toggleOffColor.color,
    };

  return (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full transition-colors peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
        style={toggleStyle}
      ></div>
    </label>
  );
};

export default ThemeToggle;