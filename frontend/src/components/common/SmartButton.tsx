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
          ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-[var(--color-primary)] shadow-sm'
          : 'theme-surface text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-primary-soft)]'
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span>{label}</span>
      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary-soft)] text-[var(--color-primary)] ml-0.5">
        {count}
      </span>
    </button>
  );
};
