import React, { useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import {
  FolderKanban, CheckSquare, AlertTriangle, Clock, Users,
  TrendingUp, ChevronRight, BarChart3, Target
} from 'lucide-react';

export const ProjectAnalytics: React.FC = () => {
  const { projects, tasks, tickets, milestones, navigateTo, calculateProjectProgress, evaluateProjectHealth } = useCRM();

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const delayedProjects = activeProjects.filter(p => evaluateProjectHealth(p.id) === 'delayed');
  const atRiskProjects = activeProjects.filter(p => evaluateProjectHealth(p.id) === 'at_risk');
  const onTrackProjects = activeProjects.filter(p => evaluateProjectHealth(p.id) === 'on_track');

  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < '2026-09-21');
  const blockedTasks = tasks.filter(t => t.status === 'blocked');
  const avgCompletion = activeProjects.length > 0
    ? Math.round(activeProjects.reduce((s, p) => s + calculateProjectProgress(p.id).overall, 0) / activeProjects.length)
    : 0;

  // ── Health Reasons ──
  const getHealthReasons = (projectId: string): string[] => {
    const reasons: string[] = [];
    const pTasks = tasks.filter(t => t.projectId === projectId);
    const pTickets = tickets.filter(tk => tk.projectId === projectId);
    const pMilestones = milestones.filter(m => m.projectId === projectId);

    const overdueCount = pTasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < '2026-09-21').length;
    const blockedCount = pTasks.filter(t => t.status === 'blocked').length;
    const criticalTickets = pTickets.filter(tk => tk.priority === 'critical' && tk.status !== 'resolved' && tk.status !== 'closed').length;
    const delayedMilestones = pMilestones.filter(m => m.status === 'delayed').length;

    if (overdueCount > 0) reasons.push(`${overdueCount} overdue task${overdueCount > 1 ? 's' : ''}`);
    if (blockedCount > 0) reasons.push(`${blockedCount} blocked task${blockedCount > 1 ? 's' : ''}`);
    if (criticalTickets > 0) reasons.push(`${criticalTickets} critical ticket${criticalTickets > 1 ? 's' : ''}`);
    if (delayedMilestones > 0) reasons.push(`${delayedMilestones} delayed milestone${delayedMilestones > 1 ? 's' : ''}`);
    return reasons;
  };

  // ── KPIs ──
  const kpis = [
    { label: 'Active Projects', value: activeProjects.length, icon: FolderKanban, color: 'text-cyan-400' },
    { label: 'Completed', value: completedProjects.length, icon: CheckSquare, color: 'text-emerald-400' },
    { label: 'On Track', value: onTrackProjects.length, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'At Risk', value: atRiskProjects.length, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Delayed', value: delayedProjects.length, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Avg Completion', value: `${avgCompletion}%`, icon: BarChart3, color: 'text-turquoise' },
    { label: 'Overdue Tasks', value: overdueTasks.length, icon: Clock, color: 'text-red-400' },
    { label: 'Blocked Tasks', value: blockedTasks.length, icon: Target, color: 'text-amber-400' },
  ];

  // ── Table ──
  type ProjectRow = typeof projects[0] & { health: string; progress: number; openTasks: number; blockedCount: number; healthReasons: string[] };
  const tableData: ProjectRow[] = useMemo(() => activeProjects.map(p => {
    const prog = calculateProjectProgress(p.id);
    const health = evaluateProjectHealth(p.id);
    const reasons = getHealthReasons(p.id);
    return {
      ...p,
      health,
      progress: prog.overall,
      openTasks: prog.openTasks,
      blockedCount: prog.blockedTasks,
      healthReasons: reasons,
    };
  }), [activeProjects]);

  const columns: DataTableColumn<ProjectRow>[] = [
    { key: 'name', label: 'Project', render: r => (
      <div>
        <div className="text-xs font-medium text-crm-text">{r.name}</div>
        <div className="text-[10px] text-crm-textMuted">{r.clientName}</div>
      </div>
    )},
    { key: 'progress', label: 'Progress', align: 'center', sortable: true, render: r => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-crm-surface rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-turquoise/70" style={{ width: `${r.progress}%` }} />
        </div>
        <span className="text-[11px] text-crm-textSecondary font-mono">{r.progress}%</span>
      </div>
    )},
    { key: 'deadline', label: 'Deadline', sortable: true, render: r => <span className="text-[11px] text-crm-textMuted">{r.deadline}</span> },
    { key: 'health', label: 'Health', sortable: true, render: r => {
      const v = r.health === 'on_track' ? 'success' : r.health === 'at_risk' ? 'warning' : 'error';
      return (
        <div>
          <Badge variant={v} size="sm">{r.health.replace('_', ' ')}</Badge>
          {r.healthReasons.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {r.healthReasons.map((reason, i) => (
                <div key={i} className="text-[10px] text-crm-textMuted">· {reason}</div>
              ))}
            </div>
          )}
        </div>
      );
    }},
    { key: 'openTasks', label: 'Open Tasks', align: 'right', sortable: true },
    { key: 'blockedCount', label: 'Blocked', align: 'right', sortable: true, render: r => (
      <span className={r.blockedCount > 0 ? 'text-red-400 font-semibold' : 'text-crm-textMuted'}>{r.blockedCount}</span>
    )},
    { key: 'managerName', label: 'Manager', render: r => <span className="text-[11px] text-crm-textSecondary">{r.managerName}</span> },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-lg font-bold text-crm-text tracking-tight">Project & Delivery Analytics</h1>
        <p className="text-xs text-crm-textMuted mt-0.5">Active workstreams, health status, and delivery performance</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-crm-card border border-crm-border rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              <span className="text-[10px] text-crm-textMuted uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className="text-base font-bold text-crm-text">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Health Distribution */}
      <Card>
        <CardHeader><CardTitle>Health Distribution</CardTitle></CardHeader>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-emerald-950/20 border border-emerald-800/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{onTrackProjects.length}</div>
            <div className="text-[10px] text-emerald-400/70 uppercase tracking-wider mt-1">On Track</div>
          </div>
          <div className="bg-amber-950/20 border border-amber-800/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{atRiskProjects.length}</div>
            <div className="text-[10px] text-amber-400/70 uppercase tracking-wider mt-1">At Risk</div>
          </div>
          <div className="bg-red-950/20 border border-red-800/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{delayedProjects.length}</div>
            <div className="text-[10px] text-red-400/70 uppercase tracking-wider mt-1">Delayed</div>
          </div>
        </div>

        {/* At-risk/Delayed detail list */}
        {[...delayedProjects, ...atRiskProjects].length > 0 && (
          <div className="space-y-2 pt-3 border-t border-crm-border/50">
            {[...delayedProjects, ...atRiskProjects].map(p => {
              const health = evaluateProjectHealth(p.id);
              const reasons = getHealthReasons(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => navigateTo(`/app/projects/${p.id}`)}
                  className="flex items-start gap-3 px-3 py-2 rounded-md bg-crm-surface/30 hover:bg-crm-surface cursor-pointer transition-colors"
                >
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${health === 'delayed' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-crm-text">{p.name}</span>
                      <Badge variant={health === 'delayed' ? 'error' : 'warning'} size="sm">{health.replace('_', ' ')}</Badge>
                    </div>
                    {reasons.length > 0 && (
                      <div className="text-[10px] text-crm-textMuted mt-0.5">
                        {reasons.join(' · ')}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-crm-textMuted mt-0.5" />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Full Projects Table */}
      <Card>
        <DataTable
          data={tableData}
          columns={columns}
          keyExtractor={r => r.id}
          title="Active Projects"
          subtitle={`${activeProjects.length} projects in delivery`}
          searchPlaceholder="Search projects…"
          exportFilename="project_analytics"
          onRowClick={r => navigateTo(`/app/projects/${r.id}`)}
          pageSize={10}
        />
      </Card>
    </div>
  );
};
