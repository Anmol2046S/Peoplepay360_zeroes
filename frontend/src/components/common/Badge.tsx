import React from 'react';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'gray' | 'purple' | 'green' | 'amber' | 'red' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  showDot = true,
  className = '',
}) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider badge-${variant} ${className}`}>
      {showDot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status ? status.toUpperCase() : '';

  let variantClass = 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300';
  switch (normalized) {
    case 'ACTIVE':
    case 'RUNNING':
    case 'PRESENT':
    case 'APPROVED':
    case 'PAID':
    case 'DONE':
      variantClass = 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30';
      break;
    case 'DRAFT':
    case 'PENDING':
    case 'TO_APPROVE':
    case 'COMPUTED':
    case 'LATE':
      variantClass = 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30';
      break;
    case 'EXPIRED':
    case 'CANCELLED':
    case 'REFUSED':
    case 'REJECTED':
    case 'ABSENT':
    case 'SUSPENDED':
    case 'INACTIVE':
      variantClass = 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30';
      break;
    case 'VALIDATED':
    case 'OVERTIME':
      variantClass = 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30';
      break;
    default:
      variantClass = 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold ${variantClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};
