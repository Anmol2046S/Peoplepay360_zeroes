import React from 'react';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'gray' | 'purple';

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
    <span className={`badge badge-${variant} ${className}`}>
      {showDot && <span className="badge-dot" style={{ backgroundColor: 'currentColor' }} />}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status ? status.toUpperCase() : '';

  let variant: BadgeVariant = 'gray';
  switch (normalized) {
    case 'ACTIVE':
    case 'RUNNING':
    case 'PRESENT':
    case 'APPROVED':
    case 'PAID':
    case 'DONE':
      variant = 'success';
      break;
    case 'DRAFT':
    case 'TO_APPROVE':
    case 'COMPUTED':
    case 'LATE':
      variant = 'warning';
      break;
    case 'EXPIRED':
    case 'CANCELLED':
    case 'REFUSED':
    case 'ABSENT':
    case 'SUSPENDED':
    case 'INACTIVE':
      variant = 'error';
      break;
    case 'VALIDATED':
    case 'OVERTIME':
      variant = 'info';
      break;
    default:
      variant = 'purple';
      break;
  }

  return <Badge variant={variant}>{status}</Badge>;
};
