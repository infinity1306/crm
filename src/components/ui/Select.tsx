import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  label,
  options,
  error,
  helperText,
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full h-8.5 px-3 py-1.5 pr-8 text-xs bg-crm-surface text-crm-text rounded-md border border-crm-border appearance-none",
            "transition-colors focus:border-turquoise focus:outline-none focus:ring-1 focus:ring-turquoise/40 cursor-pointer",
            "disabled:opacity-50 disabled:bg-crm-bg disabled:cursor-not-allowed",
            error && "border-red-500/70 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        >
          {options ? (
            options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-crm-card text-crm-text py-1">
                {opt.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        <div className="absolute right-2.5 text-crm-textMuted pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
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

Select.displayName = 'Select';
