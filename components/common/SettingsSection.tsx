import React from 'react';

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

/**
 * Reusable section container for settings screens
 * Provides consistent styling and structure for grouped settings
 */
const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
    <div className="py-4">
        <h2 className="text-primary font-semibold text-sm mb-3">{title}</h2>
        {children}
    </div>
);

export default SettingsSection;
