import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-2.5 text-crm-textMuted pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            "w-full h-8.5 px-3 py-1.5 text-xs bg-crm-surface text-crm-text placeholder:text-crm-textDim rounded-md border border-crm-border",
            "transition-colors focus:border-turquoise focus:outline-none focus:ring-1 focus:ring-turquoise/40",
            "disabled:opacity-50 disabled:bg-crm-bg disabled:cursor-not-allowed",
            leftIcon && "pl-8",
            rightIcon && "pr-8",
            error && "border-red-500/70 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-2.5 text-crm-textMuted pointer-events-none flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-red-400 mt-0.5">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-[11px] text-crm-textMuted mt-0.5">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
