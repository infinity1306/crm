import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'secondary',
  size = 'sm',
  isLoading = false,
  leftIcon,
  icon,
  rightIcon,
  children,
  disabled,
  ...props
}, ref) => {
  const effectiveLeftIcon = leftIcon || icon;
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-turquoise disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] rounded-md";

  const variants = {
    primary: "bg-turquoise-muted hover:bg-turquoise text-white border border-turquoise/40 shadow-sm",
    secondary: "bg-crm-surface hover:bg-crm-surfaceHover text-crm-text border border-crm-border hover:border-crm-borderHover shadow-subtle",
    outline: "bg-transparent hover:bg-crm-surface text-crm-text border border-crm-border hover:border-crm-borderHover",
    ghost: "bg-transparent hover:bg-crm-surfaceHover text-crm-textSecondary hover:text-crm-text",
    danger: "bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/50 hover:border-red-700/60",
  };

  const sizes = {
    xs: "h-7 px-2 text-xs gap-1.5",
    sm: "h-8 px-3 text-xs gap-2",
    md: "h-9 px-4 text-sm gap-2",
    lg: "h-10 px-5 text-sm gap-2.5",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        effectiveLeftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';
