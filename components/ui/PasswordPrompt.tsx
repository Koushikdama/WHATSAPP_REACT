import React, { useState, useEffect } from 'react';
import { LockIcon } from '../icons';

interface PasswordPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  title: string;
  placeholder?: string;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ isOpen, onClose, onSubmit, title, placeholder = "Enter password" }) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#2a3942] rounded-lg shadow-xl w-full max-w-sm mx-4 text-white flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center justify-center p-6 border-b border-gray-700">
            <div className="p-4 bg-primary rounded-full mb-4">
                <LockIcon className="h-8 w-8 text-white"/>
            </div>
          <h2 className="text-xl font-semibold text-center">{title}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#202c33] border-2 border-gray-600 rounded-lg px-4 py-3 text-white text-center tracking-widest text-lg focus:outline-none focus:ring-2 ring-primary"
              placeholder={placeholder}
              autoFocus
            />
          </div>
          <div className="px-6 py-4 bg-[#202c33] rounded-b-lg flex justify-end space-x-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500 glossy-button"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-hover glossy-button"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordPrompt;