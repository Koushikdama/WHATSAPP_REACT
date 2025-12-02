import React from 'react';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { useAppContext } from '../../context/AppContext';
import { KeyIcon, LockIcon, ChatIcon } from '../../components/icons';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ui/ThemeToggle';

const SettingsItem = ({ icon, title, subtitle, onClick }: { icon: React.ReactNode, title: string, subtitle: string, onClick?: () => void }) => (
  <button onClick={onClick} className="w-full text-left block hover:bg-[#202c33] disabled:opacity-50 transition-colors">
    <div className="flex items-center p-4">
      <div className="w-12">{icon}</div>
      <div className="ml-4">
        <h3 className="text-white">{title}</h3>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
    </div>
  </button>
);

const ToggleSettingsItem = ({ icon, title, subtitle, isEnabled, onToggle }: { icon: React.ReactNode, title: string, subtitle: string, isEnabled: boolean, onToggle: (enabled: boolean) => void }) => (
  <div className="flex items-center p-4">
    <div className="w-12">{icon}</div>
    <div className="ml-4 flex-grow">
      <h3 className="text-white">{title}</h3>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
    <ThemeToggle checked={isEnabled} onChange={onToggle} />
  </div>
);


const AccountScreen = () => {
  const { securityNotificationsEnabled, setSecurityNotificationsEnabled } = useAppContext();
  const navigate = useNavigate();

  return (
    <SettingsLayout title="Account" onBack={() => navigate('/settings')}>
      <div className="py-2 divide-y divide-gray-800">
        <div>
          <div className="px-6 py-4">
            <h2 className="text-primary font-semibold text-sm">Security</h2>
          </div>
          <ToggleSettingsItem
            icon={<KeyIcon className="h-6 w-6 text-gray-400" />}
            title="Security notifications"
            subtitle="Get notified when your security code changes for a contact."
            isEnabled={securityNotificationsEnabled}
            onToggle={setSecurityNotificationsEnabled}
          />
          <div className="px-6 py-2">
            <p className="text-xs text-gray-500">
              Your messages and calls are secured with end-to-end encryption. This means WhatsApp and third parties can't read or listen to them.
            </p>
          </div>
        </div>

        <div className="py-2">
          <SettingsItem
            icon={<KeyIcon className="h-6 w-6 text-gray-400" />}
            title="Change password"
            subtitle="Update your account password."
            onClick={() => navigate('/settings/change-password')}
          />
          <SettingsItem
            icon={<ChatIcon className="h-6 w-6 text-gray-400" />}
            title="Change number"
            subtitle="Change your phone number associated with your account."
            onClick={() => alert('Feature not implemented')}
          />
          <SettingsItem
            icon={<LockIcon className="h-6 w-6 text-gray-400" />}
            title="Request account info"
            subtitle="Get a report of your WhatsApp account information."
            onClick={() => alert('Feature not implemented')}
          />
          <SettingsItem
            icon={<LockIcon className="h-6 w-6 text-red-500" />}
            title="Delete my account"
            subtitle=""
            onClick={() => alert('Feature not implemented')}
          />
        </div>
      </div>
    </SettingsLayout>
  );
};

export default AccountScreen;