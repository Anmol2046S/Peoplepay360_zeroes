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
      className={`smart-btn ${active ? 'active' : ''}`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span>{label}</span>
      <span className="smart-btn-count">{count}</span>
    </button>
  );
};
