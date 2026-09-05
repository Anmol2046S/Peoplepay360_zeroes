import React from 'react';

interface SmartButtonProps {
  icon?: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
  active?: boolean;
}

export const SmartButton: React.FC<SmartButtonProps> = ({
  icon,
  label,
  count,
  onClick,
  active = false,
}) => {
  return (
    <button
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
        active
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30 shadow-sm'
          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span>{label}</span>
      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 ml-0.5">
        {count}
      </span>
    </button>
  );
};
