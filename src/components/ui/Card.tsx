import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'interactive';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  className,
  variant = 'default',
  children,
  ...props
}, ref) => {
  const variants = {
    default: "bg-crm-card border-crm-border",
    surface: "bg-crm-surface border-crm-border",
    interactive: "bg-crm-card border-crm-border hover:border-crm-borderHover hover:bg-crm-surface/50 transition-colors cursor-pointer",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border shadow-card p-5 text-crm-text",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex items-center justify-between pb-3 border-b border-crm-border mb-4", className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn("text-xs font-semibold uppercase tracking-wider text-crm-textSecondary", className)} {...props} />
);
