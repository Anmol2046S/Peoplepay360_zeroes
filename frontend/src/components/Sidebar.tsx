import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarOff, 
  Calculator, 
  FileText, 
  CheckSquare, 
  Settings 
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', path: '/employees', icon: Users },
  { label: 'Attendance', path: '/attendance', icon: Clock },
  { label: 'Time Off', path: '/time-off', icon: CalendarOff },
  { label: 'Payroll', path: '/payroll', icon: Calculator },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Approvals', path: '/approvals', icon: CheckSquare },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-indigo-950 text-white flex flex-col flex-shrink-0 transition-all duration-300 shadow-xl z-20 relative">
      <div className="h-16 flex items-center px-6 border-b border-indigo-900/50 bg-indigo-950/50">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-inner">
            <span className="text-white font-black text-sm">P</span>
          </div>
          PEOPLEPAY360
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-900/20" 
                  : "text-indigo-200 hover:bg-indigo-900/50 hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-indigo-300"} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-indigo-900/50 bg-indigo-950/50">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-indigo-900/50 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm font-bold text-white shadow-inner">
            SA
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-semibold text-white">Sarah Admin</span>
            <span className="text-xs text-indigo-300">HR Manager</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
