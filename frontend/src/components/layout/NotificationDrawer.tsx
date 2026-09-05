import React, { useState } from 'react';
import { Bell, Check, CheckCheck, X, Calendar, DollarSign, Info } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'leave' | 'payroll' | 'system';
  isRead: boolean;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Leave Request Submitted',
      message: 'John Doe submitted a 3-day Paid Time Off request awaiting approval.',
      timestamp: '10 minutes ago',
      type: 'leave',
      isRead: false,
    },
    {
      id: '2',
      title: 'Payrun Draft Created',
      message: 'February 2026 Payrun has been computed and requires validation.',
      timestamp: '2 hours ago',
      type: 'payroll',
      isRead: false,
    },
    {
      id: '3',
      title: 'Attendance Alert',
      message: '2 employees missed check-in for today.',
      timestamp: '5 hours ago',
      type: 'system',
      isRead: false,
    },
    {
      id: '4',
      title: 'System Security Update',
      message: 'PeoplePay360 RBAC security rules successfully updated.',
      timestamp: 'Yesterday',
      type: 'system',
      isRead: true,
    },
  ]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'leave':
        return <Calendar size={16} color="var(--brand-primary)" />;
      case 'payroll':
        return <DollarSign size={16} color="var(--color-success)" />;
      case 'system':
      default:
        return <Info size={16} color="var(--color-warning)" />;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        right: 140,
        width: 360,
        maxHeight: 480,
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp 0.2s ease',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={18} color="var(--brand-primary)" />
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Notifications</span>
          {unreadCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              type="button"
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--brand-primary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            type="button"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No notifications available
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '12px 16px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: item.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.04)',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {getIcon(item.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: item.isRead ? 600 : 700, color: 'var(--text-primary)' }}>
                    {item.title}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.timestamp}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, margin: '2px 0 6px 0' }}>
                  {item.message}
                </p>
                {!item.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    type="button"
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: 11,
                      color: 'var(--brand-primary)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      padding: 0,
                    }}
                  >
                    <Check size={12} />
                    <span>Mark as read</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-secondary)',
        }}
      >
        PeoplePay360 Real-Time Alerts
      </div>
    </div>
  );
};
