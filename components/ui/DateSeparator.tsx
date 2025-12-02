import React from 'react';
import { LockIcon } from '../icons';
import { formatDateSeparator } from '../../utils/date/dateFormatter';

interface DateSeparatorProps {
  timestamp: string;
  isLocked: boolean;
  onDoubleClick: (e: React.MouseEvent) => void;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ timestamp, isLocked, onDoubleClick }) => {
  const lockedClasses = "bg-red-900/50 text-red-300";
  const unlockedClasses = "bg-[#1f2c34] text-gray-400";

  return (
    <div
      className="flex justify-center my-4"
      onDoubleClick={onDoubleClick}
    >
      <div className={`flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md cursor-pointer select-none transition-colors duration-300 ${isLocked ? lockedClasses : unlockedClasses}`}>
        {isLocked && <LockIcon className="h-3 w-3" />}
        <span>{formatDateSeparator(timestamp)}</span>
      </div>
    </div>
  );
};

export default DateSeparator;