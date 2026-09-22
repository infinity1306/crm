import React, { useMemo, useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  AlertTriangle, CheckSquare, Receipt, Calendar, LifeBuoy,
  Clock, FolderKanban, ChevronRight, Zap, Filter, Users
} from 'lucide-react';

type ActionCategory = 'all' | 'tasks' | 'invoices' | 'followups' | 'tickets' | 'milestones' | 'leave' | 'attendance';

interface ActionItem {
  id: string;
  category: ActionCategory;
  title: string;
  subtitle: string;
  severity: 'critical' | 'high' | 'medium';
  icon: React.ElementType;
  path: string;
  timestamp: string;
}

export const ActionCenter: React.FC = () => {
  const {
    tasks, invoices, followUps, tickets, milestones,
    leaveRequests, attendanceRecords, navigateTo
  } = useCRM();

  const [categoryFilter, setCategoryFilter] = useState<ActionCategory>('all');

  // ── Build Action Items ──
  const actionItems: ActionItem[] = useMemo(() => {
    const items: ActionItem[] = [];

    // Overdue tasks
    tasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < '2026-09-21').forEach(t => {
      items.push({
        id: `task-${t.id}`,
        category: 'tasks',
        title: `Overdue Task: ${t.title}`,
        subtitle: `${t.projectName} · Assigned to ${t.assigneeName} · Due ${t.deadline}`,
        severity: t.priority === 'critical' ? 'critical' : t.priority === 'high' ? 'high' : 'medium',
        icon: CheckSquare,
        path: '/app/tasks',
        timestamp: t.deadline,
      });
    });

    // Blocked tasks
    tasks.filter(t => t.status === 'blocked').forEach(t => {
      items.push({
        id: `blocked-${t.id}`,
        category: 'tasks',
        title: `Blocked: ${t.title}`,
        subtitle: `${t.projectName} · ${t.blockedReason || 'No reason specified'} · Assigned to ${t.assigneeName}`,
        severity: t.priority === 'critical' ? 'critical' : 'high',
        icon: AlertTriangle,
        path: '/app/tasks',
        timestamp: t.blockedAt || t.lastUpdated,
      });
    });

    // Overdue invoices
    invoices.filter(inv => inv.status === 'overdue').forEach(inv => {
      items.push({
        id: `inv-${inv.id}`,
        category: 'invoices',
        title: `Overdue Invoice: ${inv.invoiceNumber}`,
        subtitle: `${inv.clientName} · ₹${(inv.outstandingAmount / 1000).toFixed(0)}K outstanding · Due ${inv.dueDate}`,
        severity: inv.outstandingAmount > 100000 ? 'critical' : 'high',
        icon: Receipt,
        path: `/app/finance/invoices/${inv.id}`,
        timestamp: inv.dueDate,
      });
    });

    // Overdue follow-ups
    followUps.filter(f => f.status === 'overdue').forEach(f => {
      items.push({
        id: `fup-${f.id}`,
        category: 'followups',
        title: `Overdue Follow-up: ${f.clientName}`,
        subtitle: `${f.title || f.taskDescription || 'Follow-up'} · Due ${f.dueDate}`,
        severity: 'high',
        icon: Calendar,
        path: '/app/sales/followups',
        timestamp: f.dueDate,
      });
    });

    // Critical tickets
    tickets.filter(tk => tk.priority === 'critical' && tk.status !== 'resolved' && tk.status !== 'closed').forEach(tk => {
      items.push({
        id: `ticket-${tk.id}`,
        category: 'tickets',
        title: `Critical Ticket: ${tk.title}`,
        subtitle: `${tk.projectName} · ${tk.assignedToName || 'Unassigned'}`,
        severity: 'critical',
        icon: LifeBuoy,
        path: '/app/tickets',
        timestamp: tk.createdAt,
      });
    });

    // Delayed milestones
    milestones.filter(m => m.status === 'delayed').forEach(m => {
      items.push({
        id: `ms-${m.id}`,
        category: 'milestones',
        title: `Delayed Milestone: ${m.name}`,
        subtitle: `${m.projectName || 'Project'} · Deadline was ${m.deadline}`,
        severity: 'high',
        icon: FolderKanban,
        path: `/app/projects/${m.projectId}`,
        timestamp: m.deadline,
      });
    });

    // Pending leave approvals
    leaveRequests.filter(l => l.status === 'pending').forEach(l => {
      items.push({
        id: `leave-${l.id}`,
        category: 'leave',
        title: `Pending Leave: ${l.employeeName}`,
        subtitle: `${l.leaveType} · ${l.startDate} to ${l.endDate} · ${l.reason}`,
        severity: 'medium',
        icon: Calendar,
        path: '/app/leave',
        timestamp: l.requestedAt,
      });
    });

    // Missing punch-outs
    attendanceRecords.filter(r => r.date === '2026-09-21' && r.sessionState === 'working' && !r.punchOut).forEach(r => {
      // Only flag if time is past 8 PM (simulated)
      items.push({
        id: `punch-${r.id}`,
        category: 'attendance',
        title: `Missing Punch-out: ${r.employeeName}`,
        subtitle: `${r.department} · Punched in at ${r.punchIn} · Still working`,
        severity: 'medium',
        icon: Clock,
        path: `/app/team/${r.employeeId}/attendance`,
        timestamp: r.date,
      });
    });

    // Sort by severity then timestamp
    const severityOrder = { critical: 0, high: 1, medium: 2 };
    return items.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [tasks, invoices, followUps, tickets, milestones, leaveRequests, attendanceRecords]);

  const filtered = categoryFilter === 'all' ? actionItems : actionItems.filter(i => i.category === categoryFilter);

  // ── Category Counts ──
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: actionItems.length };
    actionItems.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1; });
    return counts;
  }, [actionItems]);

  const categories: { value: ActionCategory; label: string; icon: React.ElementType }[] = [
    { value: 'all', label: 'All', icon: Zap },
    { value: 'tasks', label: 'Tasks', icon: CheckSquare },
    { value: 'invoices', label: 'Invoices', icon: Receipt },
    { value: 'followups', label: 'Follow-ups', icon: Calendar },
    { value: 'tickets', label: 'Tickets', icon: LifeBuoy },
    { value: 'milestones', label: 'Milestones', icon: FolderKanban },
    { value: 'leave', label: 'Leave', icon: Users },
    { value: 'attendance', label: 'Attendance', icon: Clock },
  ];

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-lg font-bold text-crm-text tracking-tight">Action Center</h1>
        <p className="text-xs text-crm-textMuted mt-0.5">Items requiring immediate attention — operational triage inbox</p>
      </div>

      {/* Summary Banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
        actionItems.length > 0
          ? 'bg-amber-950/20 border-amber-800/30'
          : 'bg-emerald-950/20 border-emerald-800/30'
      }`}>
        <Zap className={`w-5 h-5 flex-shrink-0 ${actionItems.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
        <span className={`text-sm font-medium ${actionItems.length > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
          {actionItems.length > 0
            ? `${actionItems.length} item${actionItems.length !== 1 ? 's' : ''} require attention`
            : 'All clear — no urgent items at this time'
          }
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded-lg border transition-colors ${
              categoryFilter === cat.value
                ? 'bg-turquoise/15 text-turquoise border-turquoise/30'
                : 'bg-crm-surface text-crm-textMuted border-crm-border hover:text-crm-text'
            }`}
          >
            <cat.icon className="w-3 h-3" />
            {cat.label}
            {(categoryCounts[cat.value] || 0) > 0 && (
              <span className="ml-0.5 text-[10px] font-semibold">{categoryCounts[cat.value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Action Items List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <CheckSquare className="w-10 h-10 text-emerald-400/30 mx-auto mb-3" />
              <p className="text-sm text-crm-textMuted">No items in this category</p>
            </div>
          </Card>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              onClick={() => navigateTo(item.path)}
              className="flex items-start gap-3 px-4 py-3 bg-crm-card border border-crm-border rounded-lg cursor-pointer hover:border-crm-borderHover hover:bg-crm-surface/30 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                item.severity === 'critical' ? 'bg-red-950/30' : item.severity === 'high' ? 'bg-amber-950/30' : 'bg-crm-surface'
              }`}>
                <item.icon className={`w-4 h-4 ${
                  item.severity === 'critical' ? 'text-red-400' : item.severity === 'high' ? 'text-amber-400' : 'text-crm-textMuted'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-crm-text">{item.title}</p>
                  <Badge
                    variant={item.severity === 'critical' ? 'error' : item.severity === 'high' ? 'warning' : 'neutral'}
                    size="sm"
                    showDot={false}
                  >
                    {item.severity}
                  </Badge>
                </div>
                <p className="text-[11px] text-crm-textMuted mt-0.5">{item.subtitle}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-crm-textMuted flex-shrink-0 mt-1" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
