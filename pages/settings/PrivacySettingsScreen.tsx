import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { useAppContext } from '../../context/AppContext';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { updateUserSettings } from '../../services/firebase/user.settings.service';
import { useToast } from '../../context/ToastContext';
import type { UserSettings } from '../../types';

const PrivacySettingsScreen = () => {
    const navigate = useNavigate();
    const { currentUser, updateCurrentUser } = useAppContext();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Local state for settings
    const [settings, setSettings] = useState<Partial<UserSettings>>({
        hideFollowers: currentUser?.settings?.hideFollowers ?? false,
        hideFollowing: currentUser?.settings?.hideFollowing ?? false,
        readReceipts: currentUser?.settings?.readReceipts ?? true,
        lastSeenVisibility: currentUser?.settings?.lastSeenVisibility ?? 'everyone',
        profilePhotoVisibility: currentUser?.settings?.profilePhotoVisibility ?? 'everyone',
    });

    const handleSettingChange = async (key: keyof UserSettings, value: any) => {
        if (!currentUser) return;

        setLoading(true);
        try {
            // Update local state
            setSettings(prev => ({ ...prev, [key]: value }));

            // Update Firebase
            await updateUserSettings(currentUser.id, { [key]: value });

            // Update global user state
            if (currentUser.settings) {
                updateCurrentUser({
                    settings: {
                        ...currentUser.settings,
                        [key]: value
                    }
                });
            }

            showToast('Setting updated', 'success');
        } catch (error) {
            console.error('Failed to update setting:', error);
            showToast('Failed to update setting', 'error');
            // Revert local state on error
            setSettings(prev => ({ ...prev, [key]: currentUser.settings?.[key] }));
        } finally {
            setLoading(false);
        }
    };

    const SettingItem = ({
        title,
        description,
        value,
        onChange
    }: {
        title: string;
        description: string;
        value: boolean;
        onChange: (value: boolean) => void;
    }) => (
        <div className="flex items-center justify-between p-4 hover:bg-[#202c33] transition-colors">
            <div className="flex-1">
                <h3 className="text-white font-medium">{title}</h3>
                <p className="text-sm text-gray-400 mt-1">{description}</p>
            </div>
            <ThemeToggle
                checked={value}
                onChange={onChange}
                disabled={loading}
            />
        </div>
    );

    const SelectSettingItem = ({
        title,
        description,
        value,
        options,
        onChange
    }: {
        title: string;
        description: string;
        value: string;
        options: { label: string; value: string }[];
        onChange: (value: string) => void;
    }) => (
        <div className="p-4 hover:bg-[#202c33] transition-colors">
            <div className="mb-3">
                <h3 className="text-white font-medium">{title}</h3>
                <p className="text-sm text-gray-400 mt-1">{description}</p>
            </div>
            <div className="flex gap-2">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${value === option.value
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

    if (!currentUser) return null;

    return (
        <SettingsLayout title="Privacy" onBack={() => navigate('/settings')}>
            <div className="divide-y divide-gray-800">
                {/* Followers & Following Privacy */}
                <div className="p-4">
                    <h2 className="text-primary font-semibold text-sm mb-3">SOCIAL PRIVACY</h2>

                    <SettingItem
                        title="Hide Followers"
                        description="Prevent others from seeing who follows you"
                        value={settings.hideFollowers ?? false}
                        onChange={(value) => handleSettingChange('hideFollowers', value)}
                    />

                    <SettingItem
                        title="Hide Following"
                        description="Prevent others from seeing who you follow"
                        value={settings.hideFollowing ?? false}
                        onChange={(value) => handleSettingChange('hideFollowing', value)}
                    />
                </div>

                {/* Read Receipts */}
                <div>
                    <SettingItem
                        title="Read Receipts"
                        description="Let others know when you've read their messages"
                        value={settings.readReceipts ?? true}
                        onChange={(value) => handleSettingChange('readReceipts', value)}
                    />
                </div>

                {/* Last Seen Visibility */}
                <div>
                    <SelectSettingItem
                        title="Last Seen"
                        description="Who can see when you were last online"
                        value={settings.lastSeenVisibility ?? 'everyone'}
                        options={[
                            { label: 'Everyone', value: 'everyone' },
                            { label: 'Contacts', value: 'contacts' },
                            { label: 'Nobody', value: 'nobody' }
                        ]}
                        onChange={(value) => handleSettingChange('lastSeenVisibility', value)}
                    />
                </div>

                {/* Profile Photo Visibility */}
                <div>
                    <SelectSettingItem
                        title="Profile Photo"
                        description="Who can see your profile photo"
                        value={settings.profilePhotoVisibility ?? 'everyone'}
                        options={[
                            { label: 'Everyone', value: 'everyone' },
                            { label: 'Contacts', value: 'contacts' },
                            { label: 'Nobody', value: 'nobody' }
                        ]}
                        onChange={(value) => handleSettingChange('profilePhotoVisibility', value)}
                    />
                </div>
            </div>
        </SettingsLayout>
    );
};

export default PrivacySettingsScreen;
