import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  DollarSign, CreditCard, AlertTriangle, TrendingUp, TrendingDown,
  Briefcase, FolderKanban, LifeBuoy, Users, Clock, CheckSquare,
  Activity, ChevronRight, ArrowUpRight, Target, Receipt, BarChart3,
  Zap, ArrowRight, Calendar, UserCheck, FileText
} from 'lucide-react';

type TimeFilter = 'today' | '7d' | '30d' | 'quarter' | 'year';

export const ExecutiveDashboard: React.FC = () => {
  const {
    navigateTo, leads, deals, companies, contacts,
    projects, tasks, tickets, milestones,
    employees, attendanceRecords, leaveRequests,
    invoices, payments, expenses, financeMetrics,
    followUps, meetings, workUpdates, salesMetrics,
    calculateProjectProgress, evaluateProjectHealth,
    activityEvents
  } = useCRM();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');

  // ── Derived Metrics ──
  const activeDeals = deals.filter(d => d.stage !== 'lost');
  const wonDeals = deals.filter(d => d.stage === 'won');
  const lostDeals = deals.filter(d => d.stage === 'lost');
  const conversionRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;
  const pipelineValue = activeDeals.filter(d => d.stage !== 'won').reduce((s, d) => s + d.value, 0);

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');
  const delayedProjects = activeProjects.filter(p => evaluateProjectHealth(p.id) === 'delayed');
  const atRiskProjects = activeProjects.filter(p => evaluateProjectHealth(p.id) === 'at_risk');

  const openTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
  const criticalTickets = openTickets.filter(t => t.priority === 'critical');

  const todayRecords = attendanceRecords.filter(r => r.date === '2026-09-21');
  const presentCount = todayRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
  const workingNow = todayRecords.filter(r => r.sessionState === 'working' || r.sessionState === 'on_break').length;

  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < '2026-09-21');
  const overdueFollowUps = followUps.filter(f => f.status === 'overdue');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');

  const urgentItems = overdueTasks.length + overdueFollowUps.length + overdueInvoices.length + criticalTickets.length + pendingLeaves.length;

  // ── KPI Cards ──
  const kpiCards = [
    { id: 'revenue', label: 'Total Revenue', value: `₹${(financeMetrics.totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-950/30', path: '/app/finance/revenue' },
    { id: 'collected', label: 'Collected', value: `₹${(financeMetrics.totalCollected / 100000).toFixed(1)}L`, icon: CreditCard, color: 'text-teal-400', bg: 'bg-teal-950/30', path: '/app/finance/payments' },
    { id: 'outstanding', label: 'Outstanding', value: `₹${(financeMetrics.totalPending / 100000).toFixed(1)}L`, icon: Receipt, color: 'text-amber-400', bg: 'bg-amber-950/30', path: '/app/finance/overdue' },
    { id: 'active-deals', label: 'Active Deals', value: `${activeDeals.filter(d => d.stage !== 'won').length}`, icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-950/30', path: '/app/crm/deals' },
    { id: 'conversion', label: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, color: 'text-turquoise', bg: 'bg-teal-950/30', path: '/app/analytics/sales' },
    { id: 'active-projects', label: 'Active Projects', value: `${activeProjects.length}`, icon: FolderKanban, color: 'text-cyan-400', bg: 'bg-cyan-950/30', path: '/app/projects' },
    { id: 'delayed', label: 'Delayed Projects', value: `${delayedProjects.length}`, icon: AlertTriangle, color: delayedProjects.length > 0 ? 'text-red-400' : 'text-emerald-400', bg: delayedProjects.length > 0 ? 'bg-red-950/30' : 'bg-emerald-950/30', path: '/app/analytics/projects' },
    { id: 'tickets', label: 'Open Tickets', value: `${openTickets.length}`, icon: LifeBuoy, color: 'text-orange-400', bg: 'bg-orange-950/30', path: '/app/tickets' },
    { id: 'present', label: 'Present Today', value: `${presentCount}`, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-950/30', path: '/app/attendance' },
    { id: 'working', label: 'Working Now', value: `${workingNow}`, icon: Clock, color: 'text-turquoise', bg: 'bg-teal-950/30', path: '/app/attendance/working-now' },
  ];

  // ── Action Items ──
  const actionItems = [
    { label: 'Overdue Tasks', count: overdueTasks.length, icon: CheckSquare, variant: 'error' as const, path: '/app/tasks' },
    { label: 'Overdue Invoices', count: overdueInvoices.length, icon: Receipt, variant: 'warning' as const, path: '/app/finance/overdue' },
    { label: 'Overdue Follow-ups', count: overdueFollowUps.length, icon: Calendar, variant: 'warning' as const, path: '/app/sales/followups' },
    { label: 'Critical Tickets', count: criticalTickets.length, icon: AlertTriangle, variant: 'error' as const, path: '/app/tickets' },
    { label: 'Pending Leave Approvals', count: pendingLeaves.length, icon: FileText, variant: 'invited' as const, path: '/app/leave' },
  ].filter(item => item.count > 0);

  // ── Project Health Summary ──
  const healthSummary = useMemo(() => {
    const onTrack = activeProjects.filter(p => evaluateProjectHealth(p.id) === 'on_track').length;
    const atRisk = atRiskProjects.length;
    const delayed = delayedProjects.length;
    return { onTrack, atRisk, delayed };
  }, [activeProjects, atRiskProjects, delayedProjects]);

  // ── Sales Funnel Counts ──
  const funnelStages = [
    { label: 'Leads', count: leads.length, color: 'bg-slate-600' },
    { label: 'Qualified', count: leads.filter(l => l.stage === 'qualified' || l.stage === 'proposal' || l.stage === 'negotiation' || l.stage === 'won').length, color: 'bg-indigo-600' },
    { label: 'Proposal', count: deals.filter(d => d.stage === 'proposal' || d.stage === 'negotiation' || d.stage === 'won').length, color: 'bg-cyan-600' },
    { label: 'Negotiation', count: deals.filter(d => d.stage === 'negotiation' || d.stage === 'won').length, color: 'bg-teal-600' },
    { label: 'Won', count: wonDeals.length, color: 'bg-emerald-600' },
  ];

  // ── Recent Activity ──
  const recentEvents = activityEvents.slice(0, 8);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-crm-text tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-crm-textMuted mt-0.5">Company-wide control center · Real-time operational intelligence</p>
        </div>
        <div className="flex items-center gap-1.5 bg-crm-surface border border-crm-border rounded-lg p-0.5">
          {(['today', '7d', '30d', 'quarter', 'year'] as TimeFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                timeFilter === f
                  ? 'bg-turquoise/15 text-turquoise border border-turquoise/30'
                  : 'text-crm-textMuted hover:text-crm-text'
              }`}
            >
              {f === 'today' ? 'Today' : f === '7d' ? '7 Days' : f === '30d' ? '30 Days' : f === 'quarter' ? 'Quarter' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Urgent Action Banner ─── */}
      {urgentItems > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 bg-amber-950/20 border border-amber-800/30 rounded-lg cursor-pointer hover:bg-amber-950/30 transition-colors"
          onClick={() => navigateTo('/app/action-center')}
        >
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-300 font-medium">
            {urgentItems} item{urgentItems !== 1 ? 's' : ''} require{urgentItems === 1 ? 's' : ''} immediate attention
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400/60 ml-auto" />
        </div>
      )}

      {/* ─── KPI Grid ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiCards.map(kpi => (
          <div
            key={kpi.id}
            onClick={() => navigateTo(kpi.path)}
            className="bg-crm-card border border-crm-border rounded-lg p-4 cursor-pointer hover:border-crm-borderHover hover:bg-crm-surface/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-crm-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-lg font-bold text-crm-text tracking-tight">{kpi.value}</div>
            <div className="text-[11px] text-crm-textMuted mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Main Grid: Action Items + Funnel + Projects ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Action Center Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
            <button
              onClick={() => navigateTo('/app/action-center')}
              className="text-[11px] text-turquoise hover:text-turquoise-hover flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </CardHeader>
          {actionItems.length === 0 ? (
            <div className="text-center py-6">
              <CheckSquare className="w-8 h-8 text-emerald-400/30 mx-auto mb-2" />
              <p className="text-xs text-crm-textMuted">All clear — no urgent items</p>
            </div>
          ) : (
            <div className="space-y-2">
              {actionItems.map(item => (
                <div
                  key={item.label}
                  onClick={() => navigateTo(item.path)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-crm-surface/40 hover:bg-crm-surface cursor-pointer transition-colors"
                >
                  <item.icon className="w-4 h-4 text-crm-textMuted flex-shrink-0" />
                  <span className="text-xs text-crm-text flex-1">{item.label}</span>
                  <Badge variant={item.variant} size="sm" showDot={false}>{item.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Sales Funnel Mini */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Funnel</CardTitle>
            <button
              onClick={() => navigateTo('/app/analytics/sales')}
              className="text-[11px] text-turquoise hover:text-turquoise-hover flex items-center gap-1"
            >
              Analytics <ChevronRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <div className="space-y-2">
            {funnelStages.map((stage, i) => {
              const maxCount = Math.max(...funnelStages.map(s => s.count), 1);
              const pct = (stage.count / maxCount) * 100;
              return (
                <div key={stage.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-crm-textSecondary">{stage.label}</span>
                    <span className="text-[11px] font-semibold text-crm-text">{stage.count}</span>
                  </div>
                  <div className="h-1.5 bg-crm-surface rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${stage.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-crm-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-crm-textMuted">Pipeline Value</span>
                <span className="text-xs font-bold text-crm-text">₹{(pipelineValue / 100000).toFixed(1)}L</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Project Health */}
        <Card>
          <CardHeader>
            <CardTitle>Project Health</CardTitle>
            <button
              onClick={() => navigateTo('/app/analytics/projects')}
              className="text-[11px] text-turquoise hover:text-turquoise-hover flex items-center gap-1"
            >
              Details <ChevronRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-emerald-950/20 border border-emerald-800/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-emerald-400">{healthSummary.onTrack}</div>
                <div className="text-[10px] text-emerald-400/70 uppercase tracking-wider mt-0.5">On Track</div>
              </div>
              <div className="bg-amber-950/20 border border-amber-800/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-amber-400">{healthSummary.atRisk}</div>
                <div className="text-[10px] text-amber-400/70 uppercase tracking-wider mt-0.5">At Risk</div>
              </div>
              <div className="bg-red-950/20 border border-red-800/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-400">{healthSummary.delayed}</div>
                <div className="text-[10px] text-red-400/70 uppercase tracking-wider mt-0.5">Delayed</div>
              </div>
            </div>
            {/* At-risk/delayed project list */}
            {[...delayedProjects, ...atRiskProjects].slice(0, 3).map(p => {
              const health = evaluateProjectHealth(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => navigateTo(`/app/projects/${p.id}`)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-crm-surface/40 hover:bg-crm-surface cursor-pointer transition-colors"
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${health === 'delayed' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  <span className="text-xs text-crm-text truncate flex-1">{p.name}</span>
                  <span className="text-[10px] text-crm-textMuted">{p.clientName}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ─── Bottom Row: Finance + Activity Feed ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Finance Pulse</CardTitle>
            <button
              onClick={() => navigateTo('/app/analytics/finance')}
              className="text-[11px] text-turquoise hover:text-turquoise-hover flex items-center gap-1"
            >
              Full Analytics <ChevronRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Revenue', value: financeMetrics.totalRevenue, color: 'text-emerald-400' },
              { label: 'Collected', value: financeMetrics.totalCollected, color: 'text-teal-400' },
              { label: 'Outstanding', value: financeMetrics.totalPending, color: 'text-amber-400' },
              { label: 'Overdue', value: financeMetrics.totalOverdue, color: 'text-red-400' },
              { label: 'Expenses', value: financeMetrics.totalExpenses, color: 'text-orange-400' },
              { label: 'Net Revenue', value: financeMetrics.netRevenue, color: 'text-turquoise' },
            ].map(item => (
              <div key={item.label} className="p-2.5 rounded-md bg-crm-surface/40">
                <div className="text-[10px] text-crm-textMuted uppercase tracking-wider">{item.label}</div>
                <div className={`text-sm font-bold ${item.color} mt-0.5`}>
                  ₹{(item.value / 100000).toFixed(1)}L
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-crm-border/50 flex items-center justify-between">
            <span className="text-[11px] text-crm-textMuted">{financeMetrics.invoicesCount} invoices · {financeMetrics.overdueInvoicesCount} overdue</span>
            <span className="text-[11px] text-crm-textMuted">{financeMetrics.pendingExpensesCount} pending expenses</span>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Company Activity</CardTitle>
            <button
              onClick={() => navigateTo('/app/activity')}
              className="text-[11px] text-turquoise hover:text-turquoise-hover flex items-center gap-1"
            >
              Full Log <ChevronRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <div className="space-y-1">
            {recentEvents.map(event => (
              <div key={event.id} className="flex items-start gap-2.5 py-1.5 border-b border-crm-border/30 last:border-0">
                <div className="w-1 h-1 rounded-full bg-turquoise/60 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-crm-text truncate">{event.description || `${event.type.replace(/_/g, ' ').toLowerCase()}`}</p>
                  <p className="text-[10px] text-crm-textMuted">{event.actorName} · {event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
