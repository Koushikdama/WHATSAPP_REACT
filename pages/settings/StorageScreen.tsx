import React from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';

const StorageScreen = () => {
  const navigate = useNavigate();
  return (
    <SettingsLayout title="Storage and data" onBack={() => navigate('/settings')}>
      <div className="p-6 text-white">
        <p>Storage and data settings will be displayed here.</p>
        <p className="mt-4 text-gray-400">Manage network usage and auto-download settings.</p>
      </div>
    </SettingsLayout>
  );
};

export default StorageScreen;