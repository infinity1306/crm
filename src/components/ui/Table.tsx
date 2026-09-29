import React from 'react';
import { cn } from '../../utils/cn';

export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(({
  className,
  ...props
}, ref) => (
  <div className="w-full overflow-x-auto border border-crm-border rounded-lg bg-crm-card">
    <table ref={ref} className={cn("w-full text-left text-xs border-collapse", className)} {...props} />
  </div>
));
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => (
  <thead ref={ref} className={cn("bg-crm-surface border-b border-crm-border text-crm-textSecondary uppercase tracking-wider text-[11px]", className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => (
  <tbody ref={ref} className={cn("divide-y divide-crm-border/60 bg-crm-card", className)} {...props} />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({
  className,
  ...props
}, ref) => (
  <tr ref={ref} className={cn("transition-colors hover:bg-crm-surface/70 group", className)} {...props} />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({
  className,
  ...props
}, ref) => (
  <th ref={ref} className={cn("px-4 py-3 font-medium text-crm-textSecondary select-none whitespace-nowrap", className)} {...props} />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({
  className,
  ...props
}, ref) => (
  <td ref={ref} className={cn("px-4 py-3 text-crm-text align-middle", className)} {...props} />
));
TableCell.displayName = 'TableCell';

export const TableEmpty: React.FC<{ message?: string; icon?: React.ReactNode; action?: React.ReactNode }> = ({
  message = "No records found matching current criteria.",
  icon,
  action
}) => (
  <tr>
    <td colSpan={100} className="px-6 py-12 text-center text-crm-textMuted">
      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
        {icon && <div className="text-crm-textDim mb-1">{icon}</div>}
        <p className="text-xs">{message}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </td>
  </tr>
);
