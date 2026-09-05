import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Clock, Bell, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceWidget } from '../attendance/AttendanceWidget';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part) => part.charAt(0).toUpperCase() + part.slice(1));

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
        <span className="header-breadcrumb-item">PeoplePay360</span>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <span className="header-breadcrumb-sep">/</span>
            <span
              className={`header-breadcrumb-item ${
                idx === breadcrumbs.length - 1 ? 'current' : ''
              }`}
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="header-actions">
        <button
          className={`header-icon-btn ${isAttendanceOpen ? 'active' : ''}`}
          onClick={() => setIsAttendanceOpen(!isAttendanceOpen)}
          title="Attendance Punch Clock"
          type="button"
        >
          <Clock size={19} color={isAttendanceOpen ? 'var(--brand-primary)' : 'var(--text-secondary)'} />
        </button>

        <AttendanceWidget
          isOpen={isAttendanceOpen}
          onClose={() => setIsAttendanceOpen(false)}
        />

        <button className="header-icon-btn" title="Notifications" type="button">
          <Bell size={19} />
        </button>

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
