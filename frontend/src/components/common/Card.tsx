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
    <div className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
          <div>
            {typeof title === 'string' ? <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3> : title}
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
