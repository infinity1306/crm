import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Users, 
  UserCheck, 
  FolderKanban, 
  LifeBuoy, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  UserPlus, 
  ShieldCheck, 
  Building2, 
  Download, 
  Activity, 
  Server, 
  CheckCircle2, 
  Calendar, 
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  FileCheck2,
  CheckSquare,
  DollarSign,
  CreditCard,
  Receipt
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';

export const OverviewDashboard: React.FC = () => {
  const { 
    currentUser, 
    employees, 
    invitations, 
    activityEvents, 
    navigateTo, 
    setInviteModalOpen,
    exportTeamCSV,
    projects,
    tasks,
    tickets,
    workUpdates,
    calculateProjectProgress,
    evaluateProjectHealth,
    attendanceRecords,
    leaveRequests,
    financeMetrics
  } = useCRM();

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const pendingInvites = invitations.filter(i => i.status === 'pending').length;

  // Phase 4 Live Workforce Telemetry
  const todayRecords = attendanceRecords.filter(r => (r.date === '2026-09-27' || r.date === '2026-09-21'));
  const workingNowCount = todayRecords.filter(r => r.sessionState === 'working').length;
  const onBreakCount = todayRecords.filter(r => r.sessionState === 'on_break').length;
  const presentTodayCount = todayRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
  const lateTodayCount = todayRecords.filter(r => r.status === 'late' || r.lateMinutes > 0).length;
  const onLeaveTodayCount = todayRecords.filter(r => r.status === 'leave').length;
  const pendingLeaveCount = leaveRequests.filter(l => l.status === 'pending').length;

  const activeProjectsList = projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled');
  const onTrackCount = activeProjectsList.filter(p => evaluateProjectHealth(p.id) === 'on_track').length;
  const atRiskCount = activeProjectsList.filter(p => evaluateProjectHealth(p.id) === 'at_risk').length;
  const delayedCount = activeProjectsList.filter(p => evaluateProjectHealth(p.id) === 'delayed').length;

  const openTicketsList = tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved');
  const criticalTicketsCount = openTicketsList.filter(t => t.priority === 'critical').length;

  const topMetrics = [
    {
      id: 'total-employees',
      label: 'Total Employees',
      value: '127',
      change: '+12%',
      isPositive: true,
      context: 'Across 6 departments',
      icon: Users,
      onClick: () => navigateTo('/app/team')
    },
    {
      id: 'active-employees',
      label: 'Active Employees',
      value: `${activeEmployees}`,
      change: '+8%',
      isPositive: true,
      context: `${pendingInvites} onboarding pending`,
      icon: UserCheck,
      onClick: () => navigateTo('/app/team')
    },
    {
      id: 'active-projects',
      label: 'Active Projects',
      value: `${activeProjectsList.length}`,
      change: '+15%',
      isPositive: true,
      context: `${onTrackCount} on track, ${atRiskCount + delayedCount} attention needed`,
      icon: FolderKanban,
      onClick: () => navigateTo('/app/projects')
    },
    {
      id: 'open-tickets',
      label: 'Open Tickets',
      value: `${openTicketsList.length}`,
      change: criticalTicketsCount > 0 ? '+1' : '-3%',
      isPositive: criticalTicketsCount === 0,
      context: `${criticalTicketsCount} critical blockers`,
      icon: LifeBuoy,
      onClick: () => navigateTo('/app/tickets')
    },
    {
      id: 'pending-approvals',
      label: 'Pending Approvals',
      value: '6',
      change: '-14%',
      isPositive: true,
      context: '3 access, 3 invites',
      icon: Clock,
      onClick: () => navigateTo('/app/team')
    }
  ];

  const departmentBreakdown = [
    { name: 'Engineering', count: 62, percentage: 49, color: 'bg-teal-500' },
    { name: 'Sales & Growth', count: 28, percentage: 22, color: 'bg-emerald-500' },
    { name: 'Product & Design', count: 16, percentage: 13, color: 'bg-indigo-500' },
    { name: 'HR & Operations', count: 12, percentage: 9, color: 'bg-amber-500' },
    { name: 'Finance', count: 9, percentage: 7, color: 'bg-cyan-500' },
  ];

  const operationalServices = [
    { name: 'Internal CRM Engine', status: 'Operational', latency: '18ms' },
    { name: 'PostgreSQL Relational DB', status: 'Operational', latency: '12ms' },
    { name: 'Document & Blob Storage', status: 'Operational', latency: '24ms' },
    { name: 'Corporate Email Gateway', status: 'Operational', latency: '45ms' },
    { name: 'Audit & Telemetry Service', status: 'Operational', latency: '16ms' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              Good Evening, {currentUser.name.split(' ')[0]}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30 uppercase">
              Phase 1 Core
            </span>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Here's what's happening at Star Chain Labs today.
          </p>
        </div>

        <div className="text-right hidden md:block">
          <p className="text-xs italic text-crm-textMuted">
            "Systems turn ambition into reality."
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-crm-textDim mt-0.5">
            STAR CHAIN LABS
          </p>
        </div>
      </div>

      {/* 5 Top Foundation Metric Cards (Dense, restrained, no huge colorful KPI cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {topMetrics.map(m => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              onClick={m.onClick}
              className="p-4 rounded-lg bg-crm-card border border-crm-border hover:border-crm-borderHover hover:bg-crm-surface/50 transition-all cursor-pointer group shadow-card"
            >
              <div className="flex items-center justify-between text-crm-textMuted mb-2">
                <span className="text-[11px] font-medium text-crm-textSecondary uppercase tracking-wider group-hover:text-crm-text">
                  {m.label}
                </span>
                <div className="p-1.5 rounded bg-crm-surface text-crm-textMuted group-hover:text-turquoise transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-crm-text font-mono">
                  {m.value}
                </span>
                <div className="flex items-center text-[11px] font-mono text-emerald-400">
                  {m.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-0.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5 text-red-400" />
                  )}
                  <span>{m.change}</span>
                </div>
              </div>

              <p className="text-[11px] text-crm-textMuted mt-1.5 truncate">
                {m.context}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Operational Section: Left Activity Timeline & Capacity, Right Today/Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Activity Timeline & Department Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Activity Timeline */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-turquoise" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                  Recent Internal Activity
                </h2>
              </div>
              <button
                onClick={() => navigateTo('/app/audit')}
                className="text-[11px] text-turquoise hover:text-turquoise-hover font-medium flex items-center gap-1 transition-colors"
              >
                <span>View Full Audit Trail</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-crm-border/60">
              {activityEvents.slice(0, 6).map(act => (
                <div key={act.id} className="py-3 flex items-start gap-3 text-xs group hover:bg-crm-surface/30 px-2 rounded -mx-2 transition-colors">
                  <Avatar name={act.actorName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-crm-text leading-snug">
                      <strong className="font-semibold text-white mr-1.5">{act.actorName}</strong>
                      <span className="text-crm-textSecondary">{act.description}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-crm-textMuted font-mono">
                        {act.timestamp}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-crm-surface text-crm-textDim uppercase">
                        {act.entityType}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Delivery Projects Pulse */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-turquoise" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                  Delivery Projects Pulse
                </h2>
              </div>
              <button
                onClick={() => navigateTo('/app/projects')}
                className="text-[11px] text-turquoise hover:text-turquoise-hover font-medium flex items-center gap-1 transition-colors"
              >
                <span>View All ({projects.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {activeProjectsList.slice(0, 3).map(proj => {
                const prog = calculateProjectProgress(proj.id);
                const health = evaluateProjectHealth(proj.id);
                const hasBlocker = tasks.some(t => t.projectId === proj.id && t.status === 'blocked');

                return (
                  <div
                    key={proj.id}
                    onClick={() => navigateTo(`/app/projects/${proj.id}`)}
                    className="p-3 rounded-lg bg-crm-surface/40 hover:bg-crm-surface border border-crm-border hover:border-crm-borderHover transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs text-crm-textDim font-semibold">
                          {proj.id.toUpperCase()}
                        </span>
                        <h3 className="text-xs font-semibold text-crm-text group-hover:text-turquoise transition-colors truncate">
                          {proj.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {hasBlocker && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            BLOCKED
                          </span>
                        )}
                        <Badge
                          variant={health === 'on_track' ? 'success' : health === 'at_risk' ? 'warning' : 'error'}
                          size="sm"
                        >
                          {health.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-crm-textMuted font-mono">
                        <span>Delivery Progress</span>
                        <span className="text-crm-text font-semibold">{prog.overall}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-crm-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            hasBlocker ? 'bg-amber-400' : 'bg-turquoise'
                          }`}
                          style={{ width: `${prog.overall}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-crm-border/40 text-[11px] text-crm-textMuted">
                      <span>PM: <strong className="text-crm-textSecondary font-normal">{proj.managerName}</strong></span>
                      <span>Target: <strong className="text-crm-textSecondary font-mono font-normal">{proj.deadline}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Department Distribution & Operational Headcount */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-turquoise" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                  Organizational Distribution
                </h2>
              </div>
              <span className="text-[11px] font-mono text-crm-textMuted">
                127 Total Headcount
              </span>
            </div>

            <div className="space-y-3">
              {/* Stacked bar visualization */}
              <div className="h-2 w-full rounded-full bg-crm-surface overflow-hidden flex">
                {departmentBreakdown.map((dept, i) => (
                  <div
                    key={i}
                    style={{ width: `${dept.percentage}%` }}
                    className={`${dept.color} h-full`}
                    title={`${dept.name}: ${dept.count}`}
                  />
                ))}
              </div>

              {/* Department breakdown grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {departmentBreakdown.map((dept, i) => (
                  <div key={i} className="p-2.5 rounded bg-crm-surface/50 border border-crm-border">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-crm-textSecondary truncate">{dept.name}</span>
                      <span className="text-xs font-mono font-semibold text-crm-text">{dept.count}</span>
                    </div>
                    <div className="text-[10px] text-crm-textMuted font-mono mt-0.5">
                      {dept.percentage}% of company
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Today / Quick Actions & Operational System Status */}
        <div className="space-y-6">
          {/* Phase 4: Workforce Today Telemetry Card */}
          <Card className="border-teal-900/40">
            <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                  Workforce Today
                </h2>
              </div>
              <button
                onClick={() => navigateTo('/app/attendance/working-now')}
                className="text-[11px] text-turquoise hover:underline font-mono flex items-center gap-1"
              >
                <span>Live Floor Radar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div 
                onClick={() => navigateTo('/app/attendance/working-now')}
                className="p-2.5 rounded bg-teal-950/20 border border-teal-800/30 hover:border-teal-600/50 cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-teal-400 font-mono uppercase block">Working Now</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold font-mono text-teal-300">{workingNowCount}</span>
                  <span className="text-[10px] text-slate-400">active</span>
                </div>
              </div>

              <div 
                onClick={() => navigateTo('/app/attendance')}
                className="p-2.5 rounded bg-crm-surface/60 border border-crm-border hover:border-turquoise/40 cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-crm-textMuted font-mono uppercase block">Present Today</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold font-mono text-slate-200">{presentTodayCount}</span>
                  <span className="text-[10px] text-slate-400">clocked in</span>
                </div>
              </div>

              <div 
                onClick={() => navigateTo('/app/attendance')}
                className="p-2 rounded bg-crm-surface/40 border border-crm-border text-center cursor-pointer hover:border-crm-borderHover"
              >
                <span className="text-[10px] text-amber-400 font-mono block">Late: {lateTodayCount}</span>
              </div>

              <div 
                onClick={() => navigateTo('/app/leave')}
                className="p-2 rounded bg-crm-surface/40 border border-crm-border text-center cursor-pointer hover:border-crm-borderHover"
              >
                <span className="text-[10px] text-purple-400 font-mono block">On Leave: {onLeaveTodayCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-crm-border/60 text-xs">
              <button
                onClick={() => navigateTo('/app/my-attendance')}
                className="text-[11px] text-slate-300 hover:text-turquoise transition-colors flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5 text-turquoise" />
                <span>My Clock / Attendance</span>
              </button>
              {pendingLeaveCount > 0 && (
                <button
                  onClick={() => navigateTo('/app/leave')}
                  className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40 text-[10px] font-mono hover:bg-purple-900/40"
                >
                  {pendingLeaveCount} Leave Pending
                </button>
              )}
            </div>
          </Card>

          {/* Phase 5: Financial Operations & Cash Flow Telemetry */}
          <Card className="border-teal-900/40">
            <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-teal-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                  Finance & Revenue Pulse
                </h2>
              </div>
              <button
                onClick={() => navigateTo('/app/finance')}
                className="text-[11px] text-turquoise hover:underline font-mono flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div 
                onClick={() => navigateTo('/app/finance/revenue')}
                className="p-2.5 rounded bg-crm-surface/60 border border-crm-border hover:border-turquoise/40 cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-crm-textMuted font-mono uppercase block">Total Billed</span>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  ₹{(financeMetrics.totalRevenue / 100000).toFixed(1)}L
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{financeMetrics.invoicesCount} invoices</span>
              </div>

              <div 
                onClick={() => navigateTo('/app/finance/payments')}
                className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/30 hover:border-emerald-600/50 cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-emerald-400 font-mono uppercase block">Collections</span>
                <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                  ₹{(financeMetrics.totalCollected / 100000).toFixed(1)}L
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{financeMetrics.paidInvoicesCount} cleared</span>
              </div>

              <div 
                onClick={() => navigateTo('/app/finance/overdue')}
                className="p-2.5 rounded bg-rose-950/20 border border-rose-900/40 hover:border-rose-700/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-rose-400 font-mono uppercase">Overdue Due</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-rose-900/50 text-rose-300 font-mono">
                    {financeMetrics.overdueInvoicesCount}
                  </span>
                </div>
                <div className="text-sm font-bold font-mono text-rose-300 mt-0.5">
                  ₹{(financeMetrics.totalOverdue / 100000).toFixed(1)}L
                </div>
              </div>

              <div 
                onClick={() => navigateTo('/app/finance/expenses')}
                className="p-2.5 rounded bg-amber-950/20 border border-amber-900/40 hover:border-amber-700/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-mono uppercase">Pending Claims</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-amber-900/50 text-amber-300 font-mono">
                    {financeMetrics.pendingExpensesCount}
                  </span>
                </div>
                <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
                  Review Desk
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-crm-border/60 text-xs">
              <button
                onClick={() => navigateTo('/app/finance/invoices')}
                className="text-[11px] text-slate-300 hover:text-turquoise transition-colors flex items-center gap-1"
              >
                <CreditCard className="w-3.5 h-3.5 text-turquoise" />
                <span>Commercial Invoices</span>
              </button>
              <button
                onClick={() => navigateTo('/app/finance/reports')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Audit Statements →
              </button>
            </div>
          </Card>

          {/* Today & Quick Actions Panel */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-turquoise" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                  Today's Actions
                </h2>
              </div>
              <span className="text-[10px] font-mono text-crm-textMuted">
                Active Desk
              </span>
            </div>

            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<Clock className="w-3.5 h-3.5 text-turquoise" />}
                onClick={() => navigateTo('/app/my-attendance')}
              >
                Punch In / My Work Hours
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<Calendar className="w-3.5 h-3.5 text-turquoise" />}
                onClick={() => navigateTo('/app/leave')}
              >
                Apply for Leave / Time Off
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<FileCheck2 className="w-3.5 h-3.5 text-turquoise" />}
                onClick={() => navigateTo('/app/work-updates')}
              >
                Submit Daily Work Update
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<CheckSquare className="w-3.5 h-3.5 text-turquoise" />}
                onClick={() => navigateTo('/app/tasks')}
              >
                Kanban Tasks Board
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<LifeBuoy className="w-3.5 h-3.5 text-turquoise" />}
                onClick={() => navigateTo('/app/tickets')}
              >
                Internal Operations & Tickets
              </Button>

              <div className="my-2 border-t border-crm-border/60" />

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<UserPlus className="w-3.5 h-3.5 text-turquoise" />}
                onClick={() => setInviteModalOpen(true)}
              >
                + Invite Employee
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<Users className="w-3.5 h-3.5 text-turquoise" />}
                onClick={() => navigateTo('/app/team')}
              >
                Manage Employees Directory
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-turquoise" />}
                onClick={() => navigateTo('/app/settings/roles')}
              >
                Configure Roles & Permissions
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-medium text-crm-textSecondary"
                leftIcon={<Download className="w-3.5 h-3.5 text-crm-textMuted" />}
                onClick={exportTeamCSV}
              >
                Export Team Directory (CSV)
              </Button>
            </div>
          </Card>

          {/* Foundation Operational Status */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-turquoise" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                  System Status
                </h2>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                All Operational
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {operationalServices.map((svc, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-crm-border/40 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-crm-textSecondary text-[11px] truncate">{svc.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-crm-textMuted flex-shrink-0">
                    {svc.latency}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
