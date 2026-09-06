import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { useBreadcrumb } from '../../contexts/BreadcrumbContext';
import { useAuth } from '../../contexts/AuthContext';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Workforce & Employees',
  contracts: 'Employment Contracts',
  users: 'User Accounts & RBAC',
  attendance: 'Attendance & Punch Log',
  'time-off': 'Time Off & Approvals',
  allocations: 'Allocations & Balances',
  payroll: 'Payroll & Compensation',
  run: 'Pay Run Processing',
  structures: 'Salary Structures & Rules',
  payslips: 'My Payslips',
  reports: 'Reports & Analytics',
  settings: 'System Settings',
  approvals: 'Approvals',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { role } = useAuth();
  const { extraBreadcrumbs } = useBreadcrumb();

  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Build standard route items
  const items: { label: string; path?: string }[] = [];

  // Home / Dashboard Item
  items.push({
    label: role === 'EMPLOYEE' ? 'Employee Portal' : role === 'ADMIN' ? 'Admin Portal' : 'Home',
    path: '/dashboard',
  });

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1 && extraBreadcrumbs.length === 0;

    let label = ROUTE_LABELS[segment.toLowerCase()] ||
      segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // If segment is an ID (e.g., employee ID or CUID), label nicely
    if (segment.length > 10 || !isNaN(Number(segment))) {
      label = 'Details';
    }

    items.push({
      label,
      path: isLast ? undefined : currentPath,
    });
  });

  // Append dynamic extra sub-tab or page title breadcrumbs
  if (extraBreadcrumbs && extraBreadcrumbs.length > 0) {
    extraBreadcrumbs.forEach((extra) => {
      items.push({
        label: extra.label,
        path: extra.path,
      });
    });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="px-6 pt-4 pb-1 flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 select-none overflow-x-auto"
    >
      <ol className="flex items-center flex-wrap gap-1.5 min-w-0">
        {items.map((item, idx) => {
          const isCurrent = idx === items.length - 1;
          const isHome = idx === 0;

          return (
            <li key={`crumb-${idx}`} className="inline-flex items-center gap-1.5 shrink-0">
              {idx > 0 && (
                <ChevronRight
                  size={12}
                  aria-hidden="true"
                  className="text-gray-300 dark:text-gray-600 flex-shrink-0"
                />
              )}

              {isCurrent || !item.path ? (
                <span
                  aria-current="page"
                  className="inline-flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-100"
                >
                  {isHome && <Home size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors focus:outline-none focus:underline"
                >
                  {isHome && <Home size={13} className="shrink-0 text-gray-400 dark:text-gray-500" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
