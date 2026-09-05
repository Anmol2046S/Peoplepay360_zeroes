import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Clock, Bell, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceWidget } from '../attendance/AttendanceWidget';
import { NotificationDrawer } from './NotificationDrawer';
import type { SystemRole } from '../../types';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

interface BreadcrumbItem {
  key: string;
  label: string;
  to?: string;
  isCurrent: boolean;
}

const buildRoleAwareBreadcrumbs = (
  pathname: string,
  hasRole: (...roles: SystemRole[]) => boolean
): BreadcrumbItem[] => {
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.length === 0) return [];

  const items: BreadcrumbItem[] = [];

  const isRouteAccessible = (path: string): boolean => {
    if (path === '/dashboard') return true;
    if (path === '/hr/employees' || path.startsWith('/hr/employees/')) return true;
    if (path === '/hr/schedules' || path.startsWith('/hr/schedules/')) return true;
    if (path === '/hr/attendance' || path.startsWith('/hr/attendance/')) return true;
    if (
      path === '/time-off' ||
      path === '/time-off/requests' ||
      path.startsWith('/time-off/requests/') ||
      path === '/time-off/allocations' ||
      path.startsWith('/time-off/allocations/')
    ) {
      return true;
    }

    if (path === '/hr/contracts' || path.startsWith('/hr/contracts/')) {
      return hasRole('HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN');
    }
    if (path === '/time-off/types' || path.startsWith('/time-off/types/')) {
      return hasRole('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'ADMIN');
    }
    if (path.startsWith('/payroll/payruns') || path.startsWith('/payroll/payslips')) {
      return hasRole('HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN');
    }
    if (path.startsWith('/payroll/structures') || path.startsWith('/payroll/rules')) {
      return hasRole('HR_PAYROLL_MANAGER', 'ADMIN');
    }
    if (path.startsWith('/admin')) {
      return hasRole('ADMIN');
    }
    return false;
  };

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    const isLast = i === pathParts.length - 1;
    const currentSubpath = `/${pathParts.slice(0, i + 1).join('/')}`;

    let label = part;
    let targetUrl: string | undefined = currentSubpath;

    if (part.toLowerCase() === 'hr') {
      label = 'HR';
      targetUrl = '/hr/employees';
    } else if (part.toLowerCase() === 'payroll') {
      label = 'Payroll';
      targetUrl = hasRole('HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN')
        ? '/payroll/payruns'
        : undefined;
    } else if (part.toLowerCase() === 'time-off') {
      label = 'Time Off';
      targetUrl = '/time-off';
    } else if (part.toLowerCase() === 'admin') {
      label = 'Administration';
      targetUrl = hasRole('ADMIN') ? '/admin/users' : undefined;
    } else if (part.toLowerCase() === 'new') {
      label = 'New Record';
    } else if (i === pathParts.length - 1 && part.length > 6 && (/[0-9]/.test(part) || part.includes('-'))) {
      label = 'Details';
    } else {
      label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    }

    if (targetUrl && !isRouteAccessible(targetUrl)) {
      targetUrl = undefined;
    }

    if (isLast) {
      targetUrl = undefined;
    }

    items.push({
      key: `${currentSubpath}-${i}`,
      label,
      to: targetUrl,
      isCurrent: isLast,
    });
  }

  return items;
};

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const breadcrumbs = buildRoleAwareBreadcrumbs(location.pathname, hasRole);

  return (
    <header className="header" style={{ position: 'relative' }}>
      <button
        className="header-icon-btn mobile-only"
        onClick={onToggleMobileSidebar}
        style={{ display: 'none' }}
        aria-label="Toggle Navigation Menu"
        type="button"
      >
        <Menu size={20} />
      </button>

      <div className="header-breadcrumb">
        <Link to="/dashboard" className="header-breadcrumb-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          PeoplePay360
        </Link>
        {breadcrumbs.map((item) => (
          <React.Fragment key={item.key}>
            <span className="header-breadcrumb-sep">/</span>
            {item.isCurrent ? (
              <span className="header-breadcrumb-item current">{item.label}</span>
            ) : item.to ? (
              <Link to={item.to} className="header-breadcrumb-item" style={{ textDecoration: 'none' }}>
                {item.label}
              </Link>
            ) : (
              <span className="header-breadcrumb-item" style={{ color: 'var(--text-muted)', opacity: 0.75 }}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="header-actions">
        <button
          className={`header-icon-btn ${isAttendanceOpen ? 'active' : ''}`}
          onClick={() => {
            setIsAttendanceOpen(!isAttendanceOpen);
            setIsNotificationsOpen(false);
          }}
          title="Attendance Punch Clock"
          type="button"
        >
          <Clock size={19} color={isAttendanceOpen ? 'var(--brand-primary)' : 'var(--text-secondary)'} />
        </button>

        <AttendanceWidget
          isOpen={isAttendanceOpen}
          onClose={() => setIsAttendanceOpen(false)}
        />

        <button
          className={`header-icon-btn ${isNotificationsOpen ? 'active' : ''}`}
          onClick={() => {
            setIsNotificationsOpen(!isNotificationsOpen);
            setIsAttendanceOpen(false);
          }}
          title="Notifications"
          type="button"
          style={{ position: 'relative' }}
        >
          <Bell size={19} color={isNotificationsOpen ? 'var(--brand-primary)' : 'var(--text-secondary)'} />
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--brand-primary)',
            }}
          />
        </button>

        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 8px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name || 'User'}
            </span>
          </button>

          {isUserMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 42,
                right: 0,
                width: 200,
                backgroundColor: 'white',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
                zIndex: 1000,
                padding: '8px 0',
              }}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>

              <div style={{ padding: '4px 0' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <UserIcon size={16} />
                  <span>Role: {user?.role}</span>
                </div>

                <button
                  onClick={logout}
                  type="button"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    color: 'var(--color-error)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
