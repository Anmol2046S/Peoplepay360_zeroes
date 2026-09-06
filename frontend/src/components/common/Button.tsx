import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
    md: 'px-4 py-2 text-sm font-semibold rounded-xl',
    lg: 'px-5 py-2.5 text-base font-bold rounded-xl',
  };

  const variantClasses = {
    primary: 'theme-btn-primary',
    secondary: 'theme-btn-secondary border',
    danger: 'theme-btn-danger',
    success: 'theme-btn-success',
    warning: 'theme-btn-warning',
    ghost: 'theme-btn-ghost',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
