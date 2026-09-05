import React from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        zIndex: 1500,
        display: 'flex',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '260px',
          height: '100%',
          backgroundColor: 'var(--sidebar-bg)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>
        <Sidebar />
      </div>
    </div>
  );
};
