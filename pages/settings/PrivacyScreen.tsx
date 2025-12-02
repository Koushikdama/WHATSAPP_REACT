import React from 'react';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { useNavigate } from 'react-router-dom';

const PrivacyOption = ({ title, value, onClick }: { title: string, value: string, onClick?: () => void }) => (
    <button onClick={onClick} className="w-full text-left block hover:bg-[#202c33] px-6 py-3 transition-colors">
        <p className="text-white text-base">{title}</p>
        <p className="text-gray-400 text-sm">{value}</p>
    </button>
);

const PrivacyScreen = () => {
    const navigate = useNavigate();
    return (
        <SettingsLayout title="Privacy" onBack={() => navigate('/settings')}>
            <div className="divide-y divide-gray-800">
                <div className="py-4">
                    <div className="px-6 pb-2">
                        <p className="text-sm text-gray-400">Who can see my personal info</p>
                    </div>
                    <PrivacyOption title="Last seen & online" value="My contacts" />
                    <PrivacyOption title="Profile photo" value="Everyone" />
                    <PrivacyOption title="About" value="Everyone" />
                    <PrivacyOption title="Status" value="My contacts" />
                </div>

                <div className="py-2">
                    <PrivacyOption title="Read receipts" value="If turned off, you won't send or receive Read receipts. Read receipts are always sent for group chats." />
                </div>

                <div className="py-4">
                    <div className="px-6 pb-2">
                        <p className="text-sm text-gray-400">Disappearing messages</p>
                    </div>
                    <PrivacyOption title="Default message timer" value="Off" />
                </div>

                <div className="py-4">
                    <PrivacyOption title="Groups" value="Everyone" />
                    <PrivacyOption title="Live location" value="None" />
                    <PrivacyOption title="Blocked contacts" value="0" />
                </div>
            </div>
        </SettingsLayout>
    );
};

export default PrivacyScreen;