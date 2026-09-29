import React, { useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  ChevronLeft, Clock, CheckSquare, FolderKanban, LifeBuoy,
  FileText, Calendar, IndianRupee, Users, BarChart3, Target
} from 'lucide-react';

interface Props {
  employeeId: string;
}

export const EmployeePerformanceDetail: React.FC<Props> = ({ employeeId }) => {
  const {
    employees, tasks, projects, attendanceRecords, workUpdates,
    tickets, deals, invoices, payments, salesMetrics, navigateTo
  } = useCRM();

  const employee = employees.find(e => e.id === employeeId);
  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-crm-textMuted">Employee not found</p>
      </div>
    );
  }

  // ── Task Metrics ──
  const empTasks = tasks.filter(t => t.assigneeId === employeeId);
  const tasksCompleted = empTasks.filter(t => t.status === 'done').length;
  const tasksOverdue = empTasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < '2026-09-21').length;
  const tasksInProgress = empTasks.filter(t => t.status === 'in_progress').length;
  const tasksBlocked = empTasks.filter(t => t.status === 'blocked').length;

  // ── Project Metrics ──
  const empProjectIds = [...new Set(empTasks.map(t => t.projectId))];
  const empProjects = projects.filter(p => empProjectIds.includes(p.id));

  // ── Attendance Metrics ──
  const empRecords = attendanceRecords.filter(r => r.employeeId === employeeId);
  const presentDays = empRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
  const lateDays = empRecords.filter(r => r.status === 'late' || r.lateMinutes > 0).length;
  const attendanceRate = empRecords.length > 0 ? Math.round((presentDays / empRecords.length) * 100) : 0;
  const totalMinutes = empRecords.reduce((s, r) => s + r.totalWorkingMinutes, 0);
  const avgHours = empRecords.length > 0 ? Math.round((totalMinutes / empRecords.length / 60) * 10) / 10 : 0;
  const totalOvertime = empRecords.reduce((s, r) => s + r.overtimeMinutes, 0);

  // ── Daily Updates ──
  const empUpdates = workUpdates.filter(u => u.employeeId === employeeId);

  // ── Tickets ──
  const empTickets = tickets.filter(tk => tk.assignedToId === employeeId);
  const ticketsResolved = empTickets.filter(tk => tk.status === 'resolved' || tk.status === 'closed').length;
  const ticketsOpen = empTickets.filter(tk => tk.status !== 'resolved' && tk.status !== 'closed').length;

  // ── Sales (if applicable) ──
  const empSales = salesMetrics.find(m => m.employeeId === employeeId);
  const empDeals = deals.filter(d => d.ownerId === employeeId);
  const wonDeals = empDeals.filter(d => d.stage === 'won');
  const wonRevenue = wonDeals.reduce((s, d) => s + d.value, 0);

  // ── Comparison (This Month vs Previous — simulated) ──
  const comparison = {
    tasksCompleted: { current: tasksCompleted, previous: Math.max(0, tasksCompleted - 8) },
    avgHours: { current: avgHours, previous: Math.max(0, avgHours - 0.3) },
    attendanceRate: { current: attendanceRate, previous: Math.min(100, attendanceRate + 2) },
    ticketsResolved: { current: ticketsResolved, previous: Math.max(0, ticketsResolved - 2) },
  };

  const renderComparison = (label: string, current: number | string, previous: number | string, suffix = '') => {
    const curr = typeof current === 'number' ? current : parseFloat(current as string);
    const prev = typeof previous === 'number' ? previous : parseFloat(previous as string);
    const diff = curr - prev;
    const isUp = diff > 0;
    return (
      <div className="p-3 rounded-md bg-crm-surface/40 border border-crm-border/30">
        <div className="text-[10px] text-crm-textMuted uppercase tracking-wider mb-1">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-crm-text">{current}{suffix}</span>
          <span className={`text-[10px] font-medium ${isUp ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-crm-textMuted'}`}>
            {diff > 0 ? '+' : ''}{typeof current === 'number' ? diff : diff.toFixed(1)}{suffix} vs prev
          </span>
        </div>
        <div className="text-[10px] text-crm-textMuted mt-0.5">Previous: {previous}{suffix}</div>
      </div>
    );
  };

  // ── Metric sections ──
  const sections = [
    { title: 'Attendance', icon: Calendar, items: [
      { label: 'Attendance Rate', value: `${attendanceRate}%` },
      { label: 'Days Present', value: presentDays },
      { label: 'Late Arrivals', value: lateDays },
      { label: 'Avg Hours/Day', value: `${avgHours}h` },
      { label: 'Total Overtime', value: `${Math.round(totalOvertime / 60)}h` },
      { label: 'Total Records', value: empRecords.length },
    ]},
    { title: 'Tasks & Work', icon: CheckSquare, items: [
      { label: 'Total Assigned', value: empTasks.length },
      { label: 'Completed', value: tasksCompleted },
      { label: 'In Progress', value: tasksInProgress },
      { label: 'Overdue', value: tasksOverdue },
      { label: 'Blocked', value: tasksBlocked },
      { label: 'Daily Updates', value: empUpdates.length },
    ]},
    { title: 'Projects', icon: FolderKanban, items: [
      { label: 'Projects Worked', value: empProjects.length },
      ...empProjects.slice(0, 4).map(p => ({ label: p.name, value: p.status })),
    ]},
    { title: 'Tickets', icon: LifeBuoy, items: [
      { label: 'Total Assigned', value: empTickets.length },
      { label: 'Resolved', value: ticketsResolved },
      { label: 'Open', value: ticketsOpen },
    ]},
  ];

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigateTo(`/app/team/${employeeId}`)} className="p-1.5 rounded hover:bg-crm-surface text-crm-textMuted hover:text-crm-text transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-crm-surface border border-crm-border flex items-center justify-center text-sm font-bold text-turquoise">
            {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-crm-text tracking-tight">{employee.name}</h1>
            <p className="text-xs text-crm-textMuted">{employee.designation} · {employee.department} · 360° Performance</p>
          </div>
        </div>
        <button
          onClick={() => navigateTo(`/app/team/${employeeId}`)}
          className="px-3 py-1.5 text-xs bg-crm-surface border border-crm-border rounded-lg text-crm-textSecondary hover:text-crm-text transition-colors"
        >
          View Profile
        </button>
      </div>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader><CardTitle>Monthly Comparison — This Month vs Previous</CardTitle></CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {renderComparison('Tasks Completed', comparison.tasksCompleted.current, comparison.tasksCompleted.previous)}
          {renderComparison('Avg Hours', comparison.avgHours.current, comparison.avgHours.previous, 'h')}
          {renderComparison('Attendance', comparison.attendanceRate.current, comparison.attendanceRate.previous, '%')}
          {renderComparison('Tickets Resolved', comparison.ticketsResolved.current, comparison.ticketsResolved.previous)}
        </div>
      </Card>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map(section => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center gap-1.5">
                <section.icon className="w-3.5 h-3.5 text-turquoise" />
                <CardTitle>{section.title}</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-2">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-crm-border/20 last:border-0">
                  <span className="text-[11px] text-crm-textSecondary">{item.label}</span>
                  <span className="text-xs font-semibold text-crm-text">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Sales Performance (if applicable) */}
      {(empSales || wonDeals.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-turquoise" />
              <CardTitle>Sales & Revenue Contribution</CardTitle>
            </div>
          </CardHeader>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-md bg-crm-surface/40">
              <div className="text-[10px] text-crm-textMuted uppercase tracking-wider mb-1">Won Revenue</div>
              <div className="text-base font-bold text-emerald-400">₹{(wonRevenue / 100000).toFixed(1)}L</div>
            </div>
            <div className="p-3 rounded-md bg-crm-surface/40">
              <div className="text-[10px] text-crm-textMuted uppercase tracking-wider mb-1">Deals Closed</div>
              <div className="text-base font-bold text-crm-text">{wonDeals.length}</div>
            </div>
            <div className="p-3 rounded-md bg-crm-surface/40">
              <div className="text-[10px] text-crm-textMuted uppercase tracking-wider mb-1">Active Deals</div>
              <div className="text-base font-bold text-crm-text">{empDeals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length}</div>
            </div>
            {empSales && (
              <div className="p-3 rounded-md bg-crm-surface/40">
                <div className="text-[10px] text-crm-textMuted uppercase tracking-wider mb-1">Revenue Target</div>
                <div className="text-base font-bold text-amber-400">₹{(empSales.revenue.target / 100000).toFixed(1)}L</div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
