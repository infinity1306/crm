import React from 'react';
import { Card } from '../../../components/ui/Card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

export interface MetricItem {
  id: string;
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  context?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  accent?: 'default' | 'turquoise' | 'warning' | 'error' | 'success';
}

interface MetricCardWidgetProps {
  metrics: MetricItem[];
  columns?: 2 | 3 | 4 | 6;
}

export const MetricCardWidget: React.FC<MetricCardWidgetProps> = ({ 
  metrics,
  columns = 3 
}) => {
  const colClass = 
    columns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
    columns === 4 ? 'grid-cols-2 md:grid-cols-4' :
    columns === 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' :
    'grid-cols-1 sm:grid-cols-3';

  return (
    <div className={`grid ${colClass} gap-3`}>
      {metrics.map(m => {
        const Icon = m.icon;
        return (
          <Card
            key={m.id}
            onClick={m.onClick}
            className={`p-4 transition-all ${
              m.onClick ? 'cursor-pointer hover:border-turquoise/40 hover:bg-crm-surfaceHover select-none' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-medium text-crm-textMuted uppercase tracking-wider truncate">
                {m.label}
              </span>
              {Icon && (
                <div className="w-6 h-6 rounded bg-crm-surface border border-crm-border/60 flex items-center justify-center text-crm-textMuted flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-turquoise" />
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-crm-text tracking-tight font-mono">
                {m.value}
              </span>
              {m.change && (
                <span className={`inline-flex items-center text-[10px] font-medium ${
                  m.isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {m.isPositive ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                  {m.change}
                </span>
              )}
            </div>

            {m.context && (
              <p className="text-[10px] text-crm-textMuted mt-1 truncate">
                {m.context}
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
};
