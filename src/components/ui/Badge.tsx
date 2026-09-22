import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'invited' | 'suspended' | 'inactive' | 'neutral' | 'turquoise' | 'role' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'sm',
  showDot = true,
  children,
  ...props
}) => {
  const variants = {
    active: {
      container: "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40",
      dot: "bg-emerald-400",
    },
    success: {
      container: "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40",
      dot: "bg-emerald-400",
    },
    invited: {
      container: "bg-amber-950/40 text-amber-400 border border-amber-800/40",
      dot: "bg-amber-400",
    },
    warning: {
      container: "bg-amber-950/40 text-amber-400 border border-amber-800/40",
      dot: "bg-amber-400",
    },
    suspended: {
      container: "bg-red-950/40 text-red-400 border border-red-800/40",
      dot: "bg-red-400",
    },
    error: {
      container: "bg-red-950/40 text-red-400 border border-red-800/40",
      dot: "bg-red-400",
    },
    inactive: {
      container: "bg-slate-900/60 text-slate-400 border border-slate-700/40",
      dot: "bg-slate-500",
    },
    neutral: {
      container: "bg-crm-surface text-crm-textSecondary border border-crm-border",
      dot: "bg-crm-textMuted",
    },
    turquoise: {
      container: "bg-teal-950/40 text-turquoise hover:text-turquoise-hover border border-teal-800/40",
      dot: "bg-turquoise",
    },
    primary: {
      container: "bg-teal-950/40 text-turquoise hover:text-turquoise-hover border border-teal-800/40",
      dot: "bg-turquoise",
    },
    role: {
      container: "bg-crm-surface text-crm-text font-mono border border-crm-border",
      dot: "bg-turquoise-muted",
    }
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  const currentVariant = variants[variant] || variants.neutral;

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded capitalize whitespace-nowrap tracking-wide select-none",
        currentVariant.container,
        sizes[size],
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", currentVariant.dot)} />
      )}
      {children}
    </span>
  );
};
