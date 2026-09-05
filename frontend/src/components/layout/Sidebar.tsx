import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Calendar, Clock,
  DollarSign, Settings, UserCheck, Shield, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user, hasRole } = useAuth();
  const location = useLocation();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sidebar_accordion_open');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { core: true, time: true, payroll: true, admin: true };
  });

  // Auto-expand section containing current route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard') || path.startsWith('/hr/employees') || path.startsWith('/hr/contracts') || path.startsWith('/hr/schedules')) {
      setOpenSections(prev => ({ ...prev, core: true }));
    } else if (path.startsWith('/hr/attendance') || path.startsWith('/time-off')) {
      setOpenSections(prev => ({ ...prev, time: true }));
    } else if (path.startsWith('/payroll')) {
      setOpenSections(prev => ({ ...prev, payroll: true }));
    } else if (path.startsWith('/admin')) {
      setOpenSections(prev => ({ ...prev, admin: true }));
    }
  }, [location.pathname]);

  const toggleSection = (key: string) => {
    setOpenSections(prev => {
      const nextState = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('sidebar_accordion_open', JSON.stringify(nextState));
      } catch {}
      return nextState;
    });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">P360</div>
        <div className="sidebar-logo-text">
          <h1>PeoplePay360</h1>
          <p>HR & Payroll OXP</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Core Operations */}
        <div className="nav-section">
          <button
            type="button"
            className="nav-section-header"
            onClick={() => toggleSection('core')}
            aria-expanded={!!openSections.core}
          >
            <span>Core Operations</span>
            <ChevronDown size={14} className={`nav-section-chevron ${openSections.core ? 'open' : ''}`} />
          </button>

          <div className={`nav-section-body ${openSections.core ? 'open' : 'closed'}`}>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard className="nav-item-icon" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/hr/employees"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Users className="nav-item-icon" />
              <span>Employees</span>
            </NavLink>

            {hasRole('HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN') && (
              <NavLink
                to="/hr/contracts"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <FileText className="nav-item-icon" />
                <span>Contracts</span>
              </NavLink>
            )}

            <NavLink
              to="/hr/schedules"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Calendar className="nav-item-icon" />
              <span>Schedules</span>
            </NavLink>
          </div>
        </div>

        {/* Time & Attendance */}
        <div className="nav-section">
          <button
            type="button"
            className="nav-section-header"
            onClick={() => toggleSection('time')}
            aria-expanded={!!openSections.time}
          >
            <span>Time & Attendance</span>
            <ChevronDown size={14} className={`nav-section-chevron ${openSections.time ? 'open' : ''}`} />
          </button>

          <div className={`nav-section-body ${openSections.time ? 'open' : 'closed'}`}>
            <NavLink
              to="/hr/attendance"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Clock className="nav-item-icon" />
              <span>Attendance</span>
            </NavLink>

            <NavLink
              to="/time-off/requests"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <UserCheck className="nav-item-icon" />
              <span>Time Off Requests</span>
            </NavLink>

            <NavLink
              to="/time-off/allocations"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Calendar className="nav-item-icon" />
              <span>Allocations</span>
            </NavLink>

            {hasRole('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'ADMIN') && (
              <NavLink
                to="/time-off/types"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Settings className="nav-item-icon" />
                <span>Leave Types</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Payroll Processing */}
        {hasRole('HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN') && (
          <div className="nav-section">
            <button
              type="button"
              className="nav-section-header"
              onClick={() => toggleSection('payroll')}
              aria-expanded={!!openSections.payroll}
            >
              <span>Payroll Processing</span>
              <ChevronDown size={14} className={`nav-section-chevron ${openSections.payroll ? 'open' : ''}`} />
            </button>

            <div className={`nav-section-body ${openSections.payroll ? 'open' : 'closed'}`}>
              <NavLink
                to="/payroll/payruns"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <DollarSign className="nav-item-icon" />
                <span>Payrun Batches</span>
              </NavLink>

              <NavLink
                to="/payroll/payslips"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <FileText className="nav-item-icon" />
                <span>Payslips</span>
              </NavLink>

              {hasRole('HR_PAYROLL_MANAGER', 'ADMIN') && (
                <>
                  <NavLink
                    to="/payroll/structures"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Settings className="nav-item-icon" />
                    <span>Salary Structures</span>
                  </NavLink>
                  <NavLink
                    to="/payroll/rules"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Settings className="nav-item-icon" />
                    <span>Salary Rules</span>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}

        {/* Administration */}
        {hasRole('ADMIN') && (
          <div className="nav-section">
            <button
              type="button"
              className="nav-section-header"
              onClick={() => toggleSection('admin')}
              aria-expanded={!!openSections.admin}
            >
              <span>Administration</span>
              <ChevronDown size={14} className={`nav-section-chevron ${openSections.admin ? 'open' : ''}`} />
            </button>

            <div className={`nav-section-body ${openSections.admin ? 'open' : 'closed'}`}>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Shield className="nav-item-icon" />
                <span>User Management</span>
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{user?.role ? user.role.replace(/_/g, ' ') : 'EMPLOYEE'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
