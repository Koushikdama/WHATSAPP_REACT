import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';

const ChangePasswordScreen = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from current password.');
            return;
        }

        setLoading(true);

        try {
            // Mock password change delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Navigate back after 2 seconds
            setTimeout(() => {
                navigate('/settings/account');
            }, 2000);
        } catch (error: any) {
            console.error('Password change error:', error);
            setError('Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SettingsLayout title="Change Password" onBack={() => navigate('/settings/account')}>
            <div className="p-6 max-w-md mx-auto">
                <p className="text-gray-400 text-sm mb-6">
                    Enter your current password and choose a new password for your account.
                </p>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-lg mb-4">
                        Password changed successfully! Redirecting...
                    </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#2a3942] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter current password"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-[#2a3942] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter new password (min 6 characters)"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#2a3942] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Confirm new password"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-[#1f2c34] rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Password Requirements:</h3>
                    <ul className="text-sm text-gray-400 space-y-1">
                        <li>• At least 6 characters long</li>
                        <li>• Different from your current password</li>
                        <li>• Use a strong, unique password</li>
                    </ul>
                </div>
            </div>
        </SettingsLayout>
    );
};

export default ChangePasswordScreen;