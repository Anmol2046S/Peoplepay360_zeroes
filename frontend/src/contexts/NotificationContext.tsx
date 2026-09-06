import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Role } from './AuthContext';

export interface SystemNotification {
  id: string;
  title: string;
  desc: string;
  type: 'success' | 'warning' | 'info' | 'error';
  targetRoles?: Role[];
  timestamp: string;
  unread: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'unread'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  getNotificationsForRole: (role: Role) => SystemNotification[];
}

const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Payroll Run Pending Review',
    desc: 'September 2026 payroll run initialized. 142 employees ready.',
    type: 'info',
    targetRoles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'],
    timestamp: '10m ago',
    unread: true,
    link: '/payroll',
  },
  {
    id: 'notif-2',
    title: '3 Time-Off Requests Pending',
    desc: 'Requests from Rohan Verma and Alice Smith require manager review.',
    type: 'warning',
    targetRoles: ['ADMIN', 'HR_MANAGER'],
    timestamp: '45m ago',
    unread: true,
    link: '/time-off',
  },
  {
    id: 'notif-3',
    title: 'Alex Turner Onboarded',
    desc: 'Employee profile activated under Engineering department.',
    type: 'success',
    targetRoles: ['ADMIN', 'HR_MANAGER'],
    timestamp: '2h ago',
    unread: false,
    link: '/employees',
  },
  {
    id: 'notif-4',
    title: 'Annual Leave Balance Updated',
    desc: '2026 time-off allocation breakdown updated for your account.',
    type: 'success',
    targetRoles: ['EMPLOYEE'],
    timestamp: '1h ago',
    unread: true,
    link: '/time-off',
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('peoplepay360_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved notifications', e);
      }
    }
    return DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('peoplepay360_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'unread'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
      unread: true,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationsForRole = (role: Role) => {
    return notifications.filter(n => !n.targetRoles || n.targetRoles.length === 0 || n.targetRoles.includes(role));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      getNotificationsForRole,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
