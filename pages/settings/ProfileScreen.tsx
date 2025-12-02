import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { PencilIcon, CameraOnIcon } from '../../components/icons';
import { useAppContext } from '../../context/AppContext';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { currentUser, updateCurrentUser } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateCurrentUser({ avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!currentUser) {
    return null; // or a loading state
  }

  return (
    <SettingsLayout title="Profile" onBack={() => navigate('/settings')}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <div className="flex flex-col items-center p-8 bg-[#202c33]">
        <div className="relative group cursor-pointer" onClick={handleImageChangeClick}>
          <img src={currentUser.avatar} alt="Profile" className="h-40 w-40 rounded-full" />
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <CameraOnIcon className="h-8 w-8 text-white" />
            <p className="text-xs text-white mt-1 uppercase">Change</p>
          </div>
        </div>
      </div>

      <div className="py-4">
        <div className="px-6 py-4">
          <p className="text-sm text-primary mb-2">Your name</p>
          <div className="flex justify-between items-center">
            <p className="text-lg text-white">{currentUser.name}</p>
            <button className="text-gray-400 hover:text-white">
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <p className="px-6 text-xs text-gray-500">This is not your username or pin. This name will be visible to your WhatsApp contacts.</p>

        <div className="px-6 py-4 mt-4">
          <p className="text-sm text-primary mb-2">About</p>
          <div className="flex justify-between items-center">
            <p className="text-lg text-white">{currentUser.statusText || currentUser.bio || 'Hey there! I am using WhatsApp.'}</p>
            <button className="text-gray-400 hover:text-white">
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="px-6 py-4 mt-4 border-t border-gray-700">
          <p className="text-sm text-primary mb-2">Privacy</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-base text-white">Private Account</p>
              <p className="text-xs text-gray-500 mt-1">
                When your account is private, only followers can message you
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={currentUser.isPrivate || false}
                onChange={async (e) => {
                  const newValue = e.target.checked;
                  updateCurrentUser({ isPrivate: newValue });

                  // Mock Update in Firestore
                  try {
                    console.log('Mock update user privacy:', newValue);
                    // await updateUser(currentUser.id, { isPrivate: newValue });
                  } catch (error) {
                    console.error('Error updating privacy setting:', error);
                  }
                }}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default ProfileScreen;