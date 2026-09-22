import React from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'active' | 'invited' | 'suspended' | 'inactive';
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  name,
  src,
  size = 'md',
  status,
  ...props
}) => {
  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizes = {
    xs: "w-5 h-5 text-[10px]",
    sm: "w-6.5 h-6.5 text-xs",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm font-semibold",
    xl: "w-16 h-16 text-lg font-bold",
  };

  const statusDotSizes = {
    xs: "w-1.5 h-1.5 ring-1",
    sm: "w-2 h-2 ring-1",
    md: "w-2.5 h-2.5 ring-2",
    lg: "w-3 h-3 ring-2",
    xl: "w-4 h-4 ring-2",
  };

  const statusColors = {
    active: "bg-emerald-500",
    invited: "bg-amber-500",
    suspended: "bg-red-500",
    inactive: "bg-slate-500",
  };

  return (
    <div className="relative inline-block flex-shrink-0" {...props}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-medium bg-crm-surface border border-crm-border text-crm-text select-none overflow-hidden",
          sizes[size],
          className
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-turquoise-muted tracking-tight">
            {getInitials(name)}
          </span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-crm-bg",
            statusDotSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};
