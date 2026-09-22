import React, { useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import {
  Users, Clock, CheckSquare, FolderKanban, LifeBuoy,
  FileText, Calendar, ChevronRight, BarChart3
} from 'lucide-react';

interface EmployeeRow {
  id: string;
  name: string;
  department: string;
  designation: string;
  attendanceRate: number;
  avgHours: number;
  tasksCompleted: number;
  tasksOverdue: number;
  projectsWorked: number;
  dailyUpdates: number;
  ticketsResolved: number;
  assignedWork: number;
  completedWork: number;
}

export const EmployeeAnalytics: React.FC = () => {
  const { employees, tasks, projects, attendanceRecords, workUpdates, tickets, navigateTo } = useCRM();

  const activeEmployees = employees.filter(e => e.status === 'active');

  const rows: EmployeeRow[] = useMemo(() => {
    return activeEmployees.map(emp => {
      const empTasks = tasks.filter(t => t.assigneeId === emp.id);
      const completed = empTasks.filter(t => t.status === 'done').length;
      const overdue = empTasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < '2026-09-21').length;
      const empProjects = [...new Set(empTasks.map(t => t.projectId))].length;
      const empUpdates = workUpdates.filter(u => u.employeeId === emp.id).length;
      const empTicketsResolved = tickets.filter(tk => tk.assignedToId === emp.id && (tk.status === 'resolved' || tk.status === 'closed')).length;
      const empRecords = attendanceRecords.filter(r => r.employeeId === emp.id);
      const presentDays = empRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
      const attendanceRate = empRecords.length > 0 ? Math.round((presentDays / empRecords.length) * 100) : 0;
      const totalMinutes = empRecords.reduce((s, r) => s + r.totalWorkingMinutes, 0);
      const avgHours = empRecords.length > 0 ? Math.round((totalMinutes / empRecords.length / 60) * 10) / 10 : 0;

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        designation: emp.designation,
        attendanceRate,
        avgHours,
        tasksCompleted: completed,
        tasksOverdue: overdue,
        projectsWorked: empProjects,
        dailyUpdates: empUpdates,
        ticketsResolved: empTicketsResolved,
        assignedWork: empTasks.length,
        completedWork: completed,
      };
    });
  }, [activeEmployees, tasks, projects, attendanceRecords, workUpdates, tickets]);

  const columns: DataTableColumn<EmployeeRow>[] = [
    { key: 'name', label: 'Employee', render: r => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-crm-surface border border-crm-border flex items-center justify-center text-[10px] font-bold text-turquoise">
          {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <div className="text-xs font-medium text-crm-text">{r.name}</div>
          <div className="text-[10px] text-crm-textMuted">{r.department} · {r.designation}</div>
        </div>
      </div>
    )},
    { key: 'attendanceRate', label: 'Attendance', align: 'right', sortable: true, render: r => (
      <span className={`text-xs font-semibold ${r.attendanceRate >= 90 ? 'text-emerald-400' : r.attendanceRate >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
        {r.attendanceRate}%
      </span>
    )},
    { key: 'avgHours', label: 'Avg Hours', align: 'right', sortable: true, render: r => (
      <span className="text-xs text-crm-textSecondary">{r.avgHours}h</span>
    )},
    { key: 'tasksCompleted', label: 'Tasks Done', align: 'right', sortable: true, render: r => (
      <span className="text-xs font-semibold text-emerald-400">{r.tasksCompleted}</span>
    )},
    { key: 'tasksOverdue', label: 'Overdue', align: 'right', sortable: true, render: r => (
      <span className={`text-xs font-semibold ${r.tasksOverdue > 0 ? 'text-red-400' : 'text-crm-textMuted'}`}>{r.tasksOverdue}</span>
    )},
    { key: 'projectsWorked', label: 'Projects', align: 'right', sortable: true },
    { key: 'dailyUpdates', label: 'Updates', align: 'right', sortable: true },
    { key: 'ticketsResolved', label: 'Tickets', align: 'right', sortable: true },
    { key: 'assignedWork', label: 'Assigned', align: 'right', sortable: true, visible: false },
    { key: 'completedWork', label: 'Completed', align: 'right', sortable: true, visible: false },
  ];

  // Summary KPIs
  const totalTasksDone = rows.reduce((s, r) => s + r.tasksCompleted, 0);
  const totalOverdue = rows.reduce((s, r) => s + r.tasksOverdue, 0);
  const avgAttendance = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.attendanceRate, 0) / rows.length) : 0;
  const totalTicketsResolved = rows.reduce((s, r) => s + r.ticketsResolved, 0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-lg font-bold text-crm-text tracking-tight">Employee Performance</h1>
        <p className="text-xs text-crm-textMuted mt-0.5">Operational metrics based on real activity — attendance, tasks, projects, updates, tickets</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Employees', value: activeEmployees.length, icon: Users, color: 'text-indigo-400' },
          { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: Calendar, color: 'text-emerald-400' },
          { label: 'Tasks Completed', value: totalTasksDone, icon: CheckSquare, color: 'text-turquoise' },
          { label: 'Tasks Overdue', value: totalOverdue, icon: Clock, color: totalOverdue > 0 ? 'text-red-400' : 'text-emerald-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-crm-card border border-crm-border rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              <span className="text-[10px] text-crm-textMuted uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className="text-base font-bold text-crm-text">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Full Table */}
      <Card>
        <DataTable
          data={rows}
          columns={columns}
          keyExtractor={r => r.id}
          title="Employee Activity Overview"
          subtitle={`${rows.length} active employees · Real operational metrics`}
          searchPlaceholder="Search employees…"
          exportFilename="employee_performance"
          onRowClick={r => navigateTo(`/app/team/${r.id}/performance`)}
          pageSize={15}
        />
      </Card>
    </div>
  );
};
