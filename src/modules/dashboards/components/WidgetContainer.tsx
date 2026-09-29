import React from 'react';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { WidgetState } from '../types';
import { AlertTriangle, Lock, Inbox, RefreshCw, X } from 'lucide-react';

interface WidgetContainerProps {
  id?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeType?: 'primary' | 'turquoise' | 'success' | 'warning' | 'error' | 'neutral';
  state?: WidgetState;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onRemove?: () => void;
  isCustomizing?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noCardWrapper?: boolean;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  title,
  subtitle,
  badge,
  badgeType = 'neutral',
  state = 'ready',
  emptyMessage = 'No data available for this section.',
  errorMessage = 'An error occurred while loading this widget.',
  onRetry,
  onRemove,
  isCustomizing = false,
  action,
  children,
  className = '',
  noCardWrapper = false
}) => {
  if (state === 'no_access') {
    return (
      <Card className={`p-5 border-crm-border/40 bg-crm-card/50 flex flex-col items-center justify-center text-center py-8 ${className}`}>
        <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-2">
          <Lock className="w-4 h-4" />
        </div>
        <p className="text-xs font-medium text-crm-text">Restricted Access</p>
        <p className="text-[11px] text-crm-textMuted max-w-xs mt-1">
          Your current security clearance does not permit viewing this widget.
        </p>
      </Card>
    );
  }

  if (state === 'loading') {
    return (
      <Card className={`p-5 min-h-[140px] flex flex-col justify-center items-center ${className}`}>
        <div className="w-6 h-6 border-2 border-turquoise/20 border-t-turquoise rounded-full animate-spin mb-2" />
        <p className="text-xs text-crm-textMuted">Syncing telemetry...</p>
      </Card>
    );
  }

  if (state === 'error') {
    return (
      <Card className={`p-5 border-red-500/20 bg-red-500/5 ${className}`}>
        <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Failed to load widget data</span>
        </div>
        <p className="text-[11px] text-crm-textMuted mb-3">{errorMessage}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1 text-xs">
            <RefreshCw className="w-3 h-3" /> Retry
          </Button>
        )}
      </Card>
    );
  }

  if (state === 'empty') {
    return (
      <Card className={`p-5 ${className}`}>
        {title && (
          <CardHeader className="p-0 pb-3 flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-crm-textMuted">
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <Inbox className="w-8 h-8 text-crm-textMuted/40 mb-2" />
          <p className="text-xs text-crm-textMuted">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  if (noCardWrapper) {
    return (
      <div className={`relative ${className}`}>
        {isCustomizing && onRemove && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 flex items-center justify-center text-xs transition-colors"
            title="Remove widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {children}
      </div>
    );
  }

  return (
    <Card className={`p-5 relative ${className}`}>
      {isCustomizing && onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 flex items-center justify-center text-xs transition-colors shadow"
          title="Remove widget"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {(title || subtitle || badge || action) && (
        <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-crm-text">
                  {title}
                </CardTitle>
                {badge && <Badge variant={badgeType}>{badge}</Badge>}
              </div>
              {subtitle && <p className="text-[11px] text-crm-textMuted mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </CardHeader>
      )}

      {children}
    </Card>
  );
};
