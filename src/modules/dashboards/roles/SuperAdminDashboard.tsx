import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { MetricCardWidget, MetricItem } from '../widgets/MetricCardWidget';
import { ActionCenterWidget } from '../widgets/ActionCenterWidget';
import { ActivityFeedWidget } from '../widgets/ActivityFeedWidget';
import { ProjectHealthWidget } from '../widgets/ProjectHealthWidget';
import { PipelineFunnelWidget } from '../widgets/PipelineFunnelWidget';
import { PersonalAttendanceWidget } from '../widgets/PersonalAttendanceWidget';
import { WidgetContainer } from '../components/WidgetContainer';
import { WidgetId } from '../types';
import { 
  DollarSign, 
  Target, 
  FolderKanban, 
  Users, 
  LifeBuoy, 
  Receipt,
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Building2,
  TrendingUp,
  Activity
} from 'lucide-react';

interface SuperAdminDashboardProps {
  enabledWidgets: WidgetId[];
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ enabledWidgets }) => {
  const { 
    employees, 
    projects, 
    deals, 
    tickets, 
    tasks, 
    financeMetrics, 
    attendanceRecords, 
    leaveRequests,
    navigateTo 
  } = useCRM();

  const isEnabled = (id: WidgetId) => enabledWidgets.includes(id);

  // Primary Metrics
  const activeProjectsCount = projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length;
  const activeDealsCount = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
  const openTicketsCount = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;

  const primaryMetrics: MetricItem[] = [
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      value: `$${(financeMetrics.totalCollected / 1000).toFixed(0)}k`,
      change: '+18.4%',
      isPositive: true,
      context: 'Recognized collections',
      icon: DollarSign,
      onClick: () => navigateTo('/app/finance')
    },
    {
      id: 'active-deals',
      label: 'Active Deals',
      value: `${activeDealsCount}`,
      change: '+4 this week',
      isPositive: true,
      context: `$${(deals.filter(d => d.stage !== 'lost').reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}k in pipeline`,
      icon: Target,
      onClick: () => navigateTo('/app/sales/pipeline')
    },
    {
      id: 'active-projects',
      label: 'Active Projects',
      value: `${activeProjectsCount}`,
      change: '100% on schedule',
      isPositive: true,
      context: `${tasks.length} total sprint tasks`,
      icon: FolderKanban,
      onClick: () => navigateTo('/app/projects')
    },
    {
      id: 'employees',
      label: 'Total Headcount',
      value: '127',
      change: '+6 this month',
      isPositive: true,
      context: 'Across 6 departments',
      icon: Users,
      onClick: () => navigateTo('/app/team')
    },
    {
      id: 'open-tickets',
      label: 'Open Tickets',
      value: `${openTicketsCount}`,
      change: openTicketsCount > 5 ? '-2 resolved' : 'Normal',
      isPositive: openTicketsCount <= 5,
      context: 'Mean resolution 4.2h',
      icon: LifeBuoy,
      onClick: () => navigateTo('/app/tickets')
    },
    {
      id: 'outstanding-payments',
      label: 'Outstanding Dues',
      value: `$${(financeMetrics.totalPending / 1000).toFixed(0)}k`,
      change: financeMetrics.overdueInvoicesCount > 0 ? `${financeMetrics.overdueInvoicesCount} overdue` : 'Healthy',
      isPositive: financeMetrics.overdueInvoicesCount === 0,
      context: 'Net receivables',
      icon: Receipt,
      onClick: () => navigateTo('/app/finance/overdue')
    }
  ];

  // Secondary Metrics
  const todayRecords = attendanceRecords.filter(r => (r.date === '2026-09-27' || r.date === '2026-09-21'));
  const presentCount = todayRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length || 118;
  const workingNowCount = todayRecords.filter(r => r.sessionState === 'working').length || 84;
  const overdueTasksCount = tasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < '2026-09-21').length;
  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'pending').length;

  const secondaryMetrics: MetricItem[] = [
    { id: 'present-today', label: 'Present Today', value: `${presentCount}`, context: '96% punctuality rate', icon: UserCheck, onClick: () => navigateTo('/app/attendance') },
    { id: 'working-now', label: 'Working Now', value: `${workingNowCount}`, context: 'Active shift desks', icon: Clock, onClick: () => navigateTo('/app/attendance/working-now') },
    { id: 'overdue-tasks', label: 'Overdue Tasks', value: `${overdueTasksCount}`, context: 'Action requested', icon: AlertTriangle, onClick: () => navigateTo('/app/tasks') },
    { id: 'delayed-projects', label: 'Delayed Projects', value: '1', context: 'SLA risk in Phase 2', icon: FolderKanban, onClick: () => navigateTo('/app/projects') },
    { id: 'pending-approvals', label: 'Pending Leaves', value: `${pendingLeavesCount}`, context: 'Awaiting HR/Manager review', icon: Clock, onClick: () => navigateTo('/app/leave') },
    { id: 'overdue-invoices', label: 'Overdue Invoices', value: `${financeMetrics.overdueInvoicesCount}`, context: `$${financeMetrics.totalOverdue.toLocaleString()} past due`, icon: Receipt, onClick: () => navigateTo('/app/finance/overdue') }
  ];

  return (
    <div className="space-y-6">
      {/* Attendance Clock & Shift Timer */}
      {isEnabled('personal_attendance') && (
        <PersonalAttendanceWidget />
      )}

      {/* Primary Metrics Grid (6 cards) */}
      {isEnabled('kpi_metrics') && (
        <MetricCardWidget metrics={primaryMetrics} columns={6} />
      )}

      {/* Secondary Metrics Grid (6 cards) */}
      {isEnabled('secondary_metrics') && (
        <MetricCardWidget metrics={secondaryMetrics} columns={6} />
      )}

      {/* Action Center Widget */}
      {isEnabled('action_center') && (
        <ActionCenterWidget maxItems={5} />
      )}

      {/* Pulses Section: Company, Sales, Project, Workforce, Finance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isEnabled('sales_pulse') && (
          <PipelineFunnelWidget title="Sales Pulse & Deal Funnel" scope="all_deals" />
        )}

        {isEnabled('project_pulse') && (
          <ProjectHealthWidget title="Project Delivery Pulse" scope="all" maxProjects={3} />
        )}
      </div>

      {/* Workforce & Finance Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Pulse */}
        {isEnabled('company_pulse') && (
          <WidgetContainer
            title="Company Pulse"
            subtitle="Organization-wide structure"
            badge="6 Pods"
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Employees</span>
                <p className="text-lg font-bold font-mono text-crm-text mt-1">127</p>
                <p className="text-[10px] text-emerald-400">98% active</p>
              </div>
              <div className="p-3 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Departments</span>
                <p className="text-lg font-bold font-mono text-crm-text mt-1">6</p>
                <p className="text-[10px] text-crm-textMuted">Eng, Sales, Fin, HR...</p>
              </div>
              <div className="p-3 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Deals Won</span>
                <p className="text-lg font-bold font-mono text-turquoise mt-1">{deals.filter(d => d.stage === 'won').length}</p>
                <p className="text-[10px] text-crm-textMuted">Avg size $38k</p>
              </div>
              <div className="p-3 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Client Accounts</span>
                <p className="text-lg font-bold font-mono text-crm-text mt-1">18</p>
                <p className="text-[10px] text-crm-textMuted">Enterprise Tier</p>
              </div>
            </div>
          </WidgetContainer>
        )}

        {/* Workforce Pulse */}
        {isEnabled('workforce_pulse') && (
          <WidgetContainer
            title="Workforce Pulse"
            subtitle="Real-time shift presence"
            badge="118 / 127 Present"
            badgeType="success"
          >
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-crm-surface rounded border border-crm-border/50">
                <span className="text-crm-textMuted">Working Now:</span>
                <span className="font-mono font-bold text-emerald-400">{workingNowCount} Active Desks</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-crm-surface rounded border border-crm-border/50">
                <span className="text-crm-textMuted">On Break / Idle:</span>
                <span className="font-mono font-bold text-amber-400">12</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-crm-surface rounded border border-crm-border/50">
                <span className="text-crm-textMuted">On Approved Leave:</span>
                <span className="font-mono font-bold text-crm-text">4 Staff</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-crm-surface rounded border border-crm-border/50">
                <span className="text-crm-textMuted">Late Punch-ins:</span>
                <span className="font-mono font-bold text-red-400">3 (&lt;15 min)</span>
              </div>
            </div>
          </WidgetContainer>
        )}

        {/* Finance Pulse */}
        {isEnabled('finance_pulse') && (
          <WidgetContainer
            title="Finance Pulse"
            subtitle="Cashflow & net liquidity"
            badge={`Net $${(financeMetrics.netRevenue / 1000).toFixed(0)}k`}
            badgeType="primary"
          >
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-crm-surface rounded border border-crm-border/50">
                <span className="text-crm-textMuted">Revenue Collected:</span>
                <span className="font-mono font-bold text-emerald-400">${financeMetrics.totalCollected.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-crm-surface rounded border border-crm-border/50">
                <span className="text-crm-textMuted">Total Invoiced:</span>
                <span className="font-mono font-bold text-crm-text">${financeMetrics.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-crm-surface rounded border border-crm-border/50">
                <span className="text-crm-textMuted">Total Expenses:</span>
                <span className="font-mono font-bold text-amber-400">${financeMetrics.totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-crm-surface rounded border border-crm-border/50">
                <span className="text-crm-textMuted">Gross Margin:</span>
                <span className="font-mono font-bold text-turquoise">{financeMetrics.totalRevenue > 0 ? Math.round((financeMetrics.netRevenue / financeMetrics.totalRevenue) * 100) : 74}%</span>
              </div>
            </div>
          </WidgetContainer>
        )}
      </div>

      {/* Live Company Activity Stream */}
      {isEnabled('live_activity') && (
        <ActivityFeedWidget title="Live Company Activity Feed" filterScope="all" maxEvents={6} />
      )}
    </div>
  );
};
