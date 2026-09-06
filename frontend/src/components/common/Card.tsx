import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`theme-surface border rounded-2xl shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <div>
            {typeof title === 'string' ? <h3 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">{title}</h3> : title}
            {subtitle && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
