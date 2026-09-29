import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { WidgetContainer } from '../components/WidgetContainer';
import { Badge } from '../../../components/ui/Badge';
import { 
  AlertTriangle, 
  Clock, 
  Receipt, 
  LifeBuoy, 
  FolderKanban, 
  CheckSquare, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface ActionCenterWidgetProps {
  maxItems?: number;
  filterCategory?: 'all' | 'sales' | 'delivery' | 'finance' | 'people';
}

export const ActionCenterWidget: React.FC<ActionCenterWidgetProps> = ({ 
  maxItems = 6,
  filterCategory = 'all'
}) => {
  const { 
    tasks, 
    tickets, 
    projects, 
    invoices, 
    leaveRequests, 
    followUps, 
    financeMetrics, 
    navigateTo 
  } = useCRM();

  const todayStr = '2026-09-21';

  const items: Array<{
    id: string;
    title: string;
    subtitle: string;
    category: 'finance' | 'delivery' | 'support' | 'people' | 'sales';
    severity: 'critical' | 'warning' | 'info';
    path: string;
    icon: React.ElementType;
  }> = [];

  // Overdue Invoices
  invoices
    .filter(inv => inv.status === 'overdue' || (inv.status === 'sent' && inv.dueDate < todayStr))
    .forEach(inv => {
      items.push({
        id: `inv-${inv.id}`,
        title: `Overdue Invoice: ${inv.invoiceNumber} (₹${inv.total.toLocaleString('en-IN')})`,
        subtitle: `${inv.clientName} · Due ${inv.dueDate}`,
        category: 'finance',
        severity: 'critical',
        path: `/app/finance/invoices/${inv.id}`,
        icon: Receipt
      });
    });

  // Critical Tickets
  tickets
    .filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed')
    .forEach(t => {
      items.push({
        id: `tk-${t.id}`,
        title: `Critical Ticket: ${t.title}`,
        subtitle: `${t.projectName} · ${t.assignedToName || 'Unassigned'}`,
        category: 'support',
        severity: 'critical',
        path: '/app/tickets',
        icon: LifeBuoy
      });
    });

  // Delayed Projects
  projects
    .filter(p => (p.status === 'active' || p.status === 'planning') && p.deadline && p.deadline < todayStr)
    .forEach(p => {
      items.push({
        id: `prj-${p.id}`,
        title: `Delayed Project: ${p.name}`,
        subtitle: `Manager: ${p.managerName || 'Unassigned'} · Due ${p.deadline}`,
        category: 'delivery',
        severity: 'critical',
        path: `/app/projects/${p.id}`,
        icon: FolderKanban
      });
    });

  // Overdue Tasks
  tasks
    .filter(t => t.status !== 'done' && t.deadline && t.deadline < todayStr)
    .slice(0, 4)
    .forEach(t => {
      items.push({
        id: `task-${t.id}`,
        title: `Overdue Task: ${t.title}`,
        subtitle: `${t.projectName} · Assigned to ${t.assigneeName || 'Unassigned'}`,
        category: 'delivery',
        severity: 'warning',
        path: '/app/tasks',
        icon: CheckSquare
      });
    });

  // Pending Leaves
  leaveRequests
    .filter(l => l.status === 'pending')
    .forEach(l => {
      items.push({
        id: `leave-${l.id}`,
        title: `Pending Leave: ${l.employeeName} (${l.leaveType})`,
        subtitle: `${l.daysCount} days (${l.startDate} to ${l.endDate})`,
        category: 'people',
        severity: 'warning',
        path: '/app/leave',
        icon: Clock
      });
    });

  // Overdue Follow-ups
  followUps
    .filter(f => f.status === 'overdue' || (f.status !== 'completed' && f.dueDate < todayStr))
    .forEach(f => {
      items.push({
        id: `fu-${f.id}`,
        title: `Overdue Follow-up: ${f.title || f.taskDescription}`,
        subtitle: `${f.clientName || 'Client'} · Assigned to ${f.employeeName || f.assignedToName || 'Sales Rep'}`,
        category: 'sales',
        severity: 'warning',
        path: '/app/sales/activities',
        icon: Clock
      });
    });

  const filteredItems = filterCategory === 'all' 
    ? items 
    : items.filter(i => i.category === filterCategory);

  const displayItems = filteredItems.slice(0, maxItems);

  return (
    <WidgetContainer
      title="Action Center — Attention Required"
      subtitle={`${items.length} operational bottlenecks requiring executive action`}
      badge={`${items.length} Urgent`}
      badgeType={items.length > 0 ? 'warning' : 'success'}
      action={
        <button 
          onClick={() => navigateTo('/app/action-center')}
          className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
        >
          View Full Triage <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {displayItems.length === 0 ? (
        <div className="py-6 text-center text-xs text-crm-textMuted">
          No urgent items requiring attention. All systems running smooth.
        </div>
      ) : (
        <div className="space-y-2">
          {displayItems.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => navigateTo(item.path)}
                className="p-3 bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/60 hover:border-crm-borderHover rounded-md flex items-center justify-between gap-3 cursor-pointer transition-colors group select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${
                    item.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-crm-text group-hover:text-turquoise transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-crm-textMuted truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge 
                    variant={item.severity === 'critical' ? 'error' : 'warning'}
                    className="text-[10px] uppercase tracking-wider"
                  >
                    {item.severity}
                  </Badge>
                  <ChevronRight className="w-3.5 h-3.5 text-crm-textMuted opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetContainer>
  );
};
