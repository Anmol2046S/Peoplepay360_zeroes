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
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  if (cleanPath === '/' || cleanPath === '/dashboard') {
    return [{ key: 'dashboard', label: 'Dashboard', isCurrent: true }];
  }

  const parts = cleanPath.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  const isAccessible = (path: string): boolean => {
    if (path.startsWith('/hr/contracts')) {
      return hasRole('HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN');
    }
    if (path.startsWith('/time-off/types')) {
      return hasRole('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'ADMIN');
    }
    if (path.startsWith('/payroll')) {
      return hasRole('HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN');
    }
    if (path.startsWith('/admin')) {
      return hasRole('ADMIN');
    }
    return true;
  };

  if (parts[0] === 'hr') {
    const sub = parts[1];
    if (sub === 'employees') {
      items.push({
        key: 'employees',
        label: 'Employees',
        to: parts.length > 2 ? '/hr/employees' : undefined,
        isCurrent: parts.length === 2,
      });
      if (parts[2]) {
        const detailLabel = parts[2] === 'new' ? 'New Employee' : 'Employee Profile';
        items.push({ key: 'employee-detail', label: detailLabel, isCurrent: true });
      }
    } else if (sub === 'contracts') {
      if (isAccessible('/hr/contracts')) {
        items.push({
          key: 'contracts',
          label: 'Contracts',
          to: parts.length > 2 ? '/hr/contracts' : undefined,
          isCurrent: parts.length === 2,
        });
        if (parts[2]) {
          const detailLabel = parts[2] === 'new' ? 'New Contract' : 'Contract Details';
          items.push({ key: 'contract-detail', label: detailLabel, isCurrent: true });
        }
      }
    } else if (sub === 'schedules') {
      items.push({
        key: 'schedules',
        label: 'Schedules',
        to: parts.length > 2 ? '/hr/schedules' : undefined,
        isCurrent: parts.length === 2,
      });
      if (parts[2]) {
        const detailLabel = parts[2] === 'new' ? 'New Schedule' : 'Schedule Details';
        items.push({ key: 'schedule-detail', label: detailLabel, isCurrent: true });
      }
    } else if (sub === 'attendance') {
      items.push({
        key: 'attendance',
        label: 'Attendance',
        to: parts.length > 2 ? '/hr/attendance' : undefined,
        isCurrent: parts.length === 2,
      });
      if (parts[2]) {
        const detailLabel = parts[2] === 'new' ? 'Log Attendance' : 'Attendance Record';
        items.push({ key: 'attendance-detail', label: detailLabel, isCurrent: true });
      }
    }
  } else if (parts[0] === 'time-off') {
    items.push({
      key: 'time-off-hub',
      label: 'Time Off',
      to: parts.length > 1 ? '/time-off' : undefined,
      isCurrent: parts.length === 1,
    });
    const sub = parts[1];
    if (sub === 'requests') {
      items.push({
        key: 'requests',
        label: 'Requests',
        to: parts.length > 2 ? '/time-off/requests' : undefined,
        isCurrent: parts.length === 2,
      });
      if (parts[2]) {
        const detailLabel = parts[2] === 'new' ? 'New Request' : 'Request Details';
        items.push({ key: 'request-detail', label: detailLabel, isCurrent: true });
      }
    } else if (sub === 'allocations') {
      items.push({
        key: 'allocations',
        label: 'Allocations',
        to: parts.length > 2 ? '/time-off/allocations' : undefined,
        isCurrent: parts.length === 2,
      });
      if (parts[2]) {
        const detailLabel = parts[2] === 'new' ? 'New Allocation' : 'Allocation Details';
        items.push({ key: 'allocation-detail', label: detailLabel, isCurrent: true });
      }
    } else if (sub === 'types') {
      if (isAccessible('/time-off/types')) {
        items.push({
          key: 'types',
          label: 'Leave Types',
          to: parts.length > 2 ? '/time-off/types' : undefined,
          isCurrent: parts.length === 2,
        });
        if (parts[2]) {
          const detailLabel = parts[2] === 'new' ? 'New Leave Type' : 'Type Details';
          items.push({ key: 'type-detail', label: detailLabel, isCurrent: true });
        }
      }
    }
  } else if (parts[0] === 'payroll') {
    const hasPayrollAccess = isAccessible('/payroll');
    const parentTarget = hasPayrollAccess ? '/payroll/payruns' : undefined;
    items.push({
      key: 'payroll-root',
      label: 'Payroll',
      to: parts.length > 1 && hasPayrollAccess ? parentTarget : undefined,
      isCurrent: false,
    });

    const sub = parts[1];
    if (sub === 'payruns') {
      items.push({
        key: 'payruns',
        label: 'Payrun Batches',
        to: parts.length > 2 && hasPayrollAccess ? '/payroll/payruns' : undefined,
        isCurrent: parts.length === 2,
      });
      if (parts[2]) {
        items.push({ key: 'payrun-detail', label: 'Batch Processing', isCurrent: true });
      }
    } else if (sub === 'payslips') {
      items.push({
        key: 'payslips',
        label: 'Payslips',
        to: parts.length > 2 && hasPayrollAccess ? '/payroll/payslips' : undefined,
        isCurrent: parts.length === 2,
      });
      if (parts[2]) {
        items.push({ key: 'payslip-detail', label: 'Payslip Computation', isCurrent: true });
      }
    } else if (sub === 'structures') {
      items.push({
        key: 'structures',
        label: 'Salary Structures',
        to: parts.length > 2 && hasPayrollAccess ? '/payroll/structures' : undefined,
        isCurrent: parts.length === 2,
      });
      if (parts[2]) {
        const detailLabel = parts[2] === 'new' ? 'New Structure' : 'Structure Details';
        items.push({ key: 'structure-detail', label: detailLabel, isCurrent: true });
      }
    } else if (sub === 'rules') {
      items.push({
        key: 'rules',
        label: 'Salary Rules',
        to: parts.length > 2 && hasPayrollAccess ? '/payroll/rules' : undefined,
        isCurrent: parts.length === 2,
      });
      if (parts[2]) {
        const detailLabel = parts[2] === 'new' ? 'New Rule' : 'Rule Details';
        items.push({ key: 'rule-detail', label: detailLabel, isCurrent: true });
      }
    }
  } else if (parts[0] === 'admin') {
    const isAdmin = isAccessible('/admin');
    items.push({
      key: 'admin-root',
      label: 'Administration',
      to: isAdmin ? '/admin/users' : undefined,
      isCurrent: false,
    });
    const sub = parts[1];
    if (sub === 'users') {
      items.push({ key: 'users', label: 'User Management', isCurrent: true });
    }
  } else {
    parts.forEach((p, idx) => {
      const isLast = idx === parts.length - 1;
      const subpath = `/${parts.slice(0, idx + 1).join('/')}`;
      const label = p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ');
      items.push({
        key: `${subpath}-${idx}`,
        label,
        to: !isLast && isAccessible(subpath) ? subpath : undefined,
        isCurrent: isLast,
      });
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
        <Link to="/dashboard" className="header-breadcrumb-item" style={{ textDecoration: 'none' }}>
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
              <span className="header-breadcrumb-item" style={{ color: 'var(--text-muted)' }}>
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
