import React from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';

const HelpScreen = () => {
  const navigate = useNavigate();
  return (
    <SettingsLayout title="Help" onBack={() => navigate('/settings')}>
      <div className="p-6 text-white">
        <p>Help and support information will be displayed here.</p>
        <p className="mt-4 text-gray-400">Access the Help Center, contact support, and view our privacy policy.</p>
      </div>
    </SettingsLayout>
  );
};

export default HelpScreen;