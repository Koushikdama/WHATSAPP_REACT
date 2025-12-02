import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { StatusUpdate } from '../../types';
import { fileToBase64, getFileType, validateFileSize, formatFileSize, estimateBase64Size } from '../../utils/file/fileToBase64';
import { createStatus } from '../../services/status.service';

const StatusScreen = () => {
  const { currentUser, statuses, openStatusViewer, users } = useAppContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  console.log('StatusScreen rendering. Current User:', currentUser?.id, 'Statuses:', statuses.length);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full bg-[#111b21]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const myStatus = statuses.find(s => s.userId === currentUser.id);
  const recentUpdates = statuses.filter(s => s.userId !== currentUser.id);

  const handleStatusClick = () => {
    if (myStatus && myStatus.updates.length > 0) {
      fileInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (700KB limit to stay under 1MB with base64 encoding)
    if (!validateFileSize(file, 0.7)) {
      const fileSize = formatFileSize(file.size);
      const estimatedSize = formatFileSize(estimateBase64Size(file));
      showToast(
        `File too large (${fileSize}). After base64 encoding (~${estimatedSize}), it exceeds Firestore's 1MB limit. Please select a file under 700KB.`,
        'error'
      );
      return;
    }

    setUploading(true);
    try {
      // Determine type
      const type = getFileType(file);

      // Convert file to base64
      showToast('Converting file...', 'info');
      const base64Data = await fileToBase64(file);

      // Create update object
      const newUpdate: StatusUpdate = {
        id: Date.now().toString(),
        type,
        url: base64Data, // Store base64 string as URL
        timestamp: new Date().toISOString(),
        caption: '', // Could add caption input later
        reactions: []
      };

      // Upload to Firebase
      showToast('Uploading status...', 'info');
      await createStatus(currentUser.id, newUpdate);

      showToast('Status uploaded successfully!', 'success');

      // Refresh statuses - trigger a re-fetch in AppContext
      window.location.reload(); // Simple approach - could optimize with context update
    } catch (error) {
      console.error('Error uploading status:', error);
      showToast('Failed to upload status. Please try again.', 'error');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Updates</h2>
        </div>

        {/* Statuses Section */}
        <h3 className="text-md font-semibold text-gray-300 mb-2">Status</h3>
        <div className="flex items-start space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
          {/* My Status */}
          <div
            className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer w-20 text-center relative"
            onClick={handleStatusClick}
          >
            <div className="relative">
              <img src={currentUser.avatar} alt="My Status" className={`h-14 w-14 rounded-full ${uploading ? 'opacity-50' : ''}`} />
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-[#111b21]">
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" className="text-white"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-white truncate">My status</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*,audio/*"
              onChange={handleFileSelect}
            />
          </div>
          {/* Recent Updates */}
          {recentUpdates.map(status => {
            const user = users.find(u => u.id === status.userId);
            if (!user) return null;

            const latestUpdate = status.updates[status.updates.length - 1];
            const firstReaction = latestUpdate?.reactions?.[0];

            return (
              <div
                key={status.id}
                className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer w-20 text-center"
                onClick={() => openStatusViewer(user.id)}
              >
                <div className="relative p-0.5 border-2 border-primary rounded-full">
                  <img src={user.avatar} alt={user.name} className="h-[52px] w-[52px] rounded-full" />
                  {firstReaction && (
                    <div className="absolute -bottom-2 -right-2 bg-[#2a3942] rounded-full p-1 border-2 border-[#111b21]">
                      <span className="text-sm">{firstReaction}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-white truncate">{user.name}</p>
                </div>
              </div>
            );
          })}
        </div>


      </div>
    </div>
  );
};

export default StatusScreen;