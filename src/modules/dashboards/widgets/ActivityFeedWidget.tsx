import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { WidgetContainer } from '../components/WidgetContainer';
import { ActivityEvent } from '../../../types';
import { 
  Activity, 
  Clock, 
  ChevronRight, 
  FolderKanban, 
  CheckSquare, 
  DollarSign, 
  UserCheck, 
  LifeBuoy 
} from 'lucide-react';

interface ActivityFeedWidgetProps {
  title?: string;
  maxEvents?: number;
  filterScope?: 'all' | 'team' | 'sales' | 'developer' | 'client';
}

export const ActivityFeedWidget: React.FC<ActivityFeedWidgetProps> = ({
  title = 'Live Company Activity',
  maxEvents = 6,
  filterScope = 'all'
}) => {
  const { activityEvents, currentUser, navigateTo } = useCRM();

  const getFilteredEvents = (): ActivityEvent[] => {
    switch (filterScope) {
      case 'sales':
        return activityEvents.filter(e => 
          e.entityType === 'lead' || e.entityType === 'deal' || e.type.includes('DEAL') || e.type.includes('LEAD')
        );

      case 'developer':
        return activityEvents.filter(e => 
          e.actorId === currentUser.id || e.entityType === 'task' || e.entityType === 'work_update' || e.entityType === 'ticket'
        );

      case 'team':
        return activityEvents.filter(e => 
          e.entityType === 'task' || e.entityType === 'project' || e.entityType === 'work_update' || e.entityType === 'ticket'
        );

      case 'client':
        return activityEvents.filter(e => 
          e.entityType === 'project' || e.entityType === 'milestone' || e.entityType === 'invoice'
        );

      default:
        return activityEvents;
    }
  };

  const events = getFilteredEvents().slice(0, maxEvents);

  const getEventIcon = (entityType: string) => {
    switch (entityType) {
      case 'project':
      case 'milestone':
        return FolderKanban;
      case 'task':
      case 'work_update':
        return CheckSquare;
      case 'deal':
      case 'invoice':
      case 'payment':
        return DollarSign;
      case 'attendance':
      case 'leave':
        return UserCheck;
      case 'ticket':
        return LifeBuoy;
      default:
        return Activity;
    }
  };

  const getEventPath = (e: ActivityEvent) => {
    switch (e.entityType) {
      case 'project': return `/app/projects/${e.entityId}`;
      case 'task': return '/app/tasks';
      case 'ticket': return '/app/tickets';
      case 'deal': return '/app/sales/pipeline';
      case 'lead': return `/app/crm/leads/${e.entityId}`;
      case 'invoice': return `/app/finance/invoices/${e.entityId}`;
      case 'attendance': return '/app/attendance';
      case 'leave': return '/app/leave';
      case 'employee': return `/app/team/${e.entityId}`;
      default: return '/app/audit';
    }
  };

  return (
    <WidgetContainer
      title={title}
      subtitle="Real-time chronological telemetry across workflows"
      badge="Live Stream"
      badgeType="neutral"
      action={
        <button
          onClick={() => navigateTo('/app/audit')}
          className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
        >
          View Audit Log <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {events.length === 0 ? (
        <div className="py-6 text-center text-xs text-crm-textMuted">
          No recent activity logged for this view.
        </div>
      ) : (
        <div className="space-y-2">
          {events.map(ev => {
            const Icon = getEventIcon(ev.entityType);
            return (
              <div
                key={ev.id}
                onClick={() => navigateTo(getEventPath(ev))}
                className="p-2.5 bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/50 hover:border-crm-borderHover rounded flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded bg-crm-card border border-crm-border/60 flex items-center justify-center text-turquoise flex-shrink-0">
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-crm-text font-medium truncate">
                      {ev.description || `${ev.actorName} performed ${ev.type.toLowerCase().replace(/_/g, ' ')}`}
                    </p>
                    <p className="text-[10px] text-crm-textMuted truncate">
                      {ev.actorName} ({ev.actorRole}) · {ev.entityName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-crm-textMuted flex-shrink-0 font-mono">
                  <Clock className="w-2.5 h-2.5 opacity-60" />
                  <span>{ev.timestamp.includes('T') ? ev.timestamp.split('T')[1]?.slice(0, 5) : ev.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetContainer>
  );
};
