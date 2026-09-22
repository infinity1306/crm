import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  badge?: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'underline',
}) => {
  if (variant === 'pills') {
    return (
      <div className={cn("flex items-center gap-1.5 p-1 bg-crm-surface rounded-lg border border-crm-border w-fit overflow-x-auto", className)}>
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap",
                isActive 
                  ? "bg-crm-card text-crm-text shadow-subtle border border-crm-border" 
                  : "text-crm-textSecondary hover:text-crm-text hover:bg-crm-surfaceHover",
                tab.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-crm-textSecondary"
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={cn(
                  "px-1.5 py-0.2 text-[10px] rounded-full",
                  isActive ? "bg-turquoise/15 text-turquoise font-mono" : "bg-crm-surface text-crm-textMuted"
                )}>
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-crm-border text-crm-textMuted">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("border-b border-crm-border flex items-center gap-6 overflow-x-auto no-scrollbar", className)}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={cn(
              "pb-2.5 pt-1 text-xs font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap border-b-2 -mb-px select-none",
              isActive 
                ? "text-turquoise border-turquoise font-semibold" 
                : "text-crm-textSecondary hover:text-crm-text border-transparent hover:border-crm-border",
              tab.disabled && "opacity-40 cursor-not-allowed hover:text-crm-textSecondary hover:border-transparent"
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className={cn(
                "px-1.5 py-0.2 text-[10px] rounded-full",
                isActive ? "bg-turquoise/15 text-turquoise font-mono" : "bg-crm-surface text-crm-textMuted"
              )}>
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-crm-surface text-crm-textMuted border border-crm-border">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
