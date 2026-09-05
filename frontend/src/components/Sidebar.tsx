import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Clock, CalendarOff,
  Calculator, FileText, CheckSquare, Settings, LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../contexts/AuthContext';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',  path: '/dashboard',  icon: LayoutDashboard, roles: ['HR', 'EMPLOYEE'] as Role[] },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { label: 'Employees',  path: '/employees',  icon: Users,      roles: ['HR'] as Role[] },
      { label: 'Attendance', path: '/attendance', icon: Clock,      roles: ['HR', 'EMPLOYEE'] as Role[] },
      { label: 'Time Off',   path: '/time-off',   icon: CalendarOff,roles: ['HR', 'EMPLOYEE'] as Role[] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Payroll',    path: '/payroll',    icon: Calculator, roles: ['HR'] as Role[] },
      { label: 'Payslips',   path: '/payslips',   icon: FileText,   roles: ['HR', 'EMPLOYEE'] as Role[] },
      { label: 'Reports',    path: '/reports',    icon: FileText,   roles: ['HR'] as Role[] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Approvals',  path: '/approvals',  icon: CheckSquare,roles: ['HR'] as Role[] },
      { label: 'Settings',   path: '/settings',   icon: Settings,   roles: ['HR', 'EMPLOYEE'] as Role[] },
    ],
  },
];

const Sidebar = () => {
  const { role, user, logout } = useAuth();

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className="sidebar w-[220px] flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5 h-14 px-5 border-b border-white/5 flex-shrink-0">
        <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs leading-none">P</span>
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">PeoplePay360</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group, gi) => {
          const visible = group.items.filter(i => i.roles.includes(role));
          if (!visible.length) return null;

          return (
            <div key={group.label} className={gi > 0 ? 'mt-5' : ''}>
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-2.5 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {visible.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: gi * 0.05 + idx * 0.04 }}
                    >
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => clsx(
                          'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-400 hover:text-gray-100 hover:bg-white/[0.06]'
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <Icon size={15} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                            <span>{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-white/5 relative">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] hover:bg-red-500/10 transition-colors cursor-pointer group text-left"
          title="Sign out"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-500 group-hover:bg-red-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 transition-colors">
            {user?.name ? initials(user.name) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 group-hover:text-red-400 truncate transition-colors">{user?.name || '—'}</p>
            <p className="text-xs text-gray-600 group-hover:text-red-500/70 truncate transition-colors">{role === 'HR' ? 'HR Manager' : 'Employee'}</p>
          </div>
          <LogOut size={16} className="text-gray-600 group-hover:text-red-400 flex-shrink-0 transition-colors" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
