import React from 'react';

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const ToastContainer: React.FC = () => {
  const { notifications, dismiss } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {notifications.map((n) => {
        let icon = <Info size={18} color="#3b82f6" />;
        let borderLeftColor = '#3b82f6';
        if (n.type === 'success') {
          icon = <CheckCircle2 size={18} color="#10b981" />;
          borderLeftColor = '#10b981';
        } else if (n.type === 'error') {
          icon = <AlertCircle size={18} color="#ef4444" />;
          borderLeftColor = '#ef4444';
        } else if (n.type === 'warning') {
          icon = <AlertTriangle size={18} color="#f59e0b" />;
          borderLeftColor = '#f59e0b';
        }

        return (
          <div
            key={n.id}
            style={{
              background: 'white',
              borderRadius: 'var(--border-radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              borderLeft: `4px solid ${borderLeftColor}`,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 280,
              maxWidth: 400,
            }}
          >
            {icon}
            <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{n.message}</span>
            <button
              onClick={() => dismiss(n.id)}
              style={{ color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
