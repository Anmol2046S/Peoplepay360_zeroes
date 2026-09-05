import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Calendar, Clock,
  DollarSign, Settings, UserCheck, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user, hasRole } = useAuth();

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
          <div className="nav-section-label">Core Operations</div>
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

        {/* Time & Attendance */}
        <div className="nav-section">
          <div className="nav-section-label">Time & Attendance</div>
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

        {/* Payroll Processing */}
        {hasRole('HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN') && (
          <div className="nav-section">
            <div className="nav-section-label">Payroll Processing</div>
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
        )}

        {/* Administration */}
        {hasRole('ADMIN') && (
          <div className="nav-section">
            <div className="nav-section-label">Administration</div>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Shield className="nav-item-icon" />
              <span>User Management</span>
            </NavLink>
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
