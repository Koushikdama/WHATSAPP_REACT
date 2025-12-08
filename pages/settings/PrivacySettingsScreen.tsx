import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { useAppContext } from '../../context/AppContext';
import { updateUserSettings } from '../../services/firebase/user.settings.service';
import { useToast } from '../../context/ToastContext';
import type { UserSettings } from '../../types';
import { SettingItem } from '../../components/common';

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


    if (!currentUser) return null;

    return (
        <SettingsLayout title="Privacy" onBack={() => navigate('/settings')}>
            <div className="divide-y divide-gray-800">
                {/* Followers & Following Privacy */}
                <div className="p-4">
                    <h2 className="text-primary font-semibold text-sm mb-3">SOCIAL PRIVACY</h2>

                    <SettingItem
                        type="toggle"
                        title="Hide Followers"
                        description="Prevent others from seeing who follows you"
                        value={settings.hideFollowers ?? false}
                        onChange={(value) => handleSettingChange('hideFollowers', value)}
                        disabled={loading}
                    />

                    <SettingItem
                        type="toggle"
                        title="Hide Following"
                        description="Prevent others from seeing who you follow"
                        value={settings.hideFollowing ?? false}
                        onChange={(value) => handleSettingChange('hideFollowing', value)}
                        disabled={loading}
                    />
                </div>

                {/* Read Receipts */}
                <div>
                    <SettingItem
                        type="toggle"
                        title="Read Receipts"
                        description="Let others know when you've read their messages"
                        value={settings.readReceipts ?? true}
                        onChange={(value) => handleSettingChange('readReceipts', value)}
                        disabled={loading}
                    />
                </div>

                {/* Last Seen Visibility */}
                <div>
                    <SettingItem
                        type="select"
                        title="Last Seen"
                        description="Who can see when you were last online"
                        value={settings.lastSeenVisibility ?? 'everyone'}
                        options={[
                            { label: 'Everyone', value: 'everyone' },
                            { label: 'Contacts', value: 'contacts' },
                            { label: 'Nobody', value: 'nobody' }
                        ]}
                        onChange={(value) => handleSettingChange('lastSeenVisibility', value)}
                        disabled={loading}
                    />
                </div>

                {/* Profile Photo Visibility */}
                <div>
                    <SettingItem
                        type="select"
                        title="Profile Photo"
                        description="Who can see your profile photo"
                        value={settings.profilePhotoVisibility ?? 'everyone'}
                        options={[
                            { label: 'Everyone', value: 'everyone' },
                            { label: 'Contacts', value: 'contacts' },
                            { label: 'Nobody', value: 'nobody' }
                        ]}
                        onChange={(value) => handleSettingChange('profilePhotoVisibility', value)}
                        disabled={loading}
                    />
                </div>
            </div>
        </SettingsLayout>
    );
};

export default PrivacySettingsScreen;
