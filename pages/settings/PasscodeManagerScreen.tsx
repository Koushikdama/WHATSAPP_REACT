import React, { useState } from 'react';
import SettingsLayout from '../../components/layout/SettingsLayout';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { LockIcon } from '../../components/icons';
import { updateUserSettings } from '../../services/firebase/user.settings.service';
import { useToast } from '../../context/ToastContext';

const PasscodeManagerScreen = () => {
  const { currentUser, updateCurrentUser } = useAppContext();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showPinModal, setShowPinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const hasPinSet = !!currentUser?.settings?.chatLockPin;

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    // Validate
    if (!newPin || newPin.length < 4) {
      showToast('PIN must be at least 4 digits', 'error');
      return;
    }

    if (newPin !== confirmPin) {
      showToast('PINs do not match', 'error');
      return;
    }

    // If changing PIN, verify current PIN
    if (hasPinSet && currentPin !== currentUser.settings?.chatLockPin) {
      showToast('Current PIN is incorrect', 'error');
      return;
    }

    setLoading(true);
    try {
      await updateUserSettings(currentUser.id, { chatLockPin: newPin });

      // Update local state
      if (currentUser.settings) {
        updateCurrentUser({
          settings: {
            ...currentUser.settings,
            chatLockPin: newPin
          }
        });
      }

      showToast(hasPinSet ? 'PIN changed successfully' : 'PIN set successfully', 'success');
      setShowPinModal(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      console.error('Failed to set PIN:', error);
      showToast('Failed to set PIN', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsLayout title="Chat Lock PIN" onBack={() => navigate('/settings')}>
      <div className="p-4">
        <div className="bg-[#202c33] rounded-lg p-6 mb-4">
          <div className="flex items-center mb-4">
            <LockIcon className="h-12 w-12 text-primary mr-4" />
            <div>
              <h2 className="text-white text-lg font-semibold">Chat Lock PIN</h2>
              <p className="text-gray-400 text-sm">
                {hasPinSet
                  ? 'Your PIN is set. Change it below or use it to lock chats.'
                  : 'Set a PIN to lock individual chats for privacy.'
                }
              </p>
            </div>
          </div>

          {hasPinSet && (
            <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm">
              ✓ PIN is active. You can now lock chats.
            </div>
          )}

          {!hasPinSet && (
            <div className="bg-yellow-500/20 text-yellow-400 p-3 rounded-lg mb-4 text-sm">
              ⚠️ Set a PIN first before you can lock any chats.
            </div>
          )}

          <button
            onClick={() => setShowPinModal(true)}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {hasPinSet ? 'Change PIN' : 'Set PIN'}
          </button>
        </div>

        <div className="bg-[#202c33] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">How it works</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li>• Set a master PIN here first</li>
            <li>• Then open any chat and tap the lock icon</li>
            <li>• Enter your PIN to lock/unlock that chat</li>
            <li>• Locked chats require PIN to view messages</li>
          </ul>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#202c33] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">
              {hasPinSet ? 'Change PIN' : 'Set PIN'}
            </h2>

            <form onSubmit={handleSetPin}>
              {hasPinSet && (
                <div className="mb-4">
                  <label className="text-gray-400 text-sm block mb-2">Current PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    className="w-full bg-[#111b21] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter current PIN"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="text-gray-400 text-sm block mb-2">New PIN (4-6 digits)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full bg-[#111b21] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter new PIN"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="text-gray-400 text-sm block mb-2">Confirm New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full bg-[#111b21] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Re-enter new PIN"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setCurrentPin('');
                    setNewPin('');
                    setConfirmPin('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (hasPinSet ? 'Change PIN' : 'Set PIN')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
};

export default PasscodeManagerScreen;