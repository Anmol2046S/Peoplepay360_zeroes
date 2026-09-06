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

  let variantClass = 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]';
  switch (normalized) {
    case 'ACTIVE':
    case 'RUNNING':
    case 'PRESENT':
    case 'APPROVED':
    case 'PAID':
    case 'DONE':
      variantClass = 'bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)]';
      break;
    case 'DRAFT':
    case 'PENDING':
    case 'TO_APPROVE':
    case 'COMPUTED':
    case 'LATE':
      variantClass = 'bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-[var(--color-warning)] border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)]';
      break;
    case 'EXPIRED':
    case 'CANCELLED':
    case 'REFUSED':
    case 'REJECTED':
    case 'ABSENT':
    case 'SUSPENDED':
    case 'INACTIVE':
      variantClass = 'bg-[color-mix(in_srgb,var(--color-error)_14%,transparent)] text-[var(--color-error)] border border-[color-mix(in_srgb,var(--color-error)_30%,transparent)]';
      break;
    case 'VALIDATED':
    case 'OVERTIME':
      variantClass = 'bg-[color-mix(in_srgb,var(--color-info)_14%,transparent)] text-[var(--color-info)] border border-[color-mix(in_srgb,var(--color-info)_30%,transparent)]';
      break;
    default:
      variantClass = 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold ${variantClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};
