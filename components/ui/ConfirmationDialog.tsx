import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  isDanger?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children, 
  confirmText = 'Confirm',
  isDanger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#2a3942] rounded-lg shadow-xl w-full max-w-md mx-4 text-white">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div className="p-6">
          {children}
        </div>
        <div className="px-6 py-4 bg-[#202c33] rounded-b-lg flex justify-end space-x-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-white ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-500' 
                : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;