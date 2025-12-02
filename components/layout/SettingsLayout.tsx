import React, { ReactNode } from 'react';
import { BackArrowIcon } from '../icons';

interface SettingsLayoutProps {
  title: string;
  children: ReactNode;
  onBack?: () => void;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ title, children, onBack }) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#111b21]">
      <header className="flex-shrink-0 bg-[#202c33] p-4 flex items-center space-x-6 shadow-md z-10">
        {onBack && (
          <button onClick={onBack} className="text-gray-300 hover:text-white">
            <BackArrowIcon className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </header>
      <main className="flex-grow overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default SettingsLayout;