import React, { useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Users, CheckSquare, FolderKanban, DollarSign, LifeBuoy,
  Clock, Calendar, Target, BarChart3
} from 'lucide-react';

const DEPARTMENTS = ['Engineering', 'Sales', 'Design', 'Product', 'HR', 'Operations', 'Finance'] as const;

export const DepartmentAnalytics: React.FC = () => {
  const { employees, tasks, projects, deals, attendanceRecords, tickets, invoices, salesMetrics, navigateTo } = useCRM();

  const deptData = useMemo(() => {
    return DEPARTMENTS.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept && e.status === 'active');
      const deptIds = deptEmployees.map(e => e.id);

      const deptTasks = tasks.filter(t => deptIds.includes(t.assigneeId));
      const deptTasksDone = deptTasks.filter(t => t.status === 'done').length;
      const deptTasksOverdue = deptTasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < '2026-09-21').length;

      const deptProjectIds = [...new Set(deptTasks.map(t => t.projectId))];
      const deptProjects = projects.filter(p => deptProjectIds.includes(p.id));

      const deptRecords = attendanceRecords.filter(r => deptIds.includes(r.employeeId));
      const presentCount = deptRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
      const attendanceRate = deptRecords.length > 0 ? Math.round((presentCount / deptRecords.length) * 100) : 0;

      const deptTickets = tickets.filter(tk => deptIds.includes(tk.assignedToId || ''));
      const openTickets = deptTickets.filter(tk => tk.status !== 'resolved' && tk.status !== 'closed').length;

      // Sales-specific
      const deptDeals = deals.filter(d => deptIds.includes(d.ownerId));
      const wonRevenue = deptDeals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0);

      return {
        department: dept,
        employeeCount: deptEmployees.length,
        activeTasks: deptTasks.filter(t => t.status !== 'done').length,
        tasksDone: deptTasksDone,
        tasksOverdue: deptTasksOverdue,
        projects: deptProjects.length,
        attendanceRate,
        openTickets,
        wonRevenue,
        isSales: dept === 'Sales',
      };
    }).filter(d => d.employeeCount > 0);
  }, [employees, tasks, projects, deals, attendanceRecords, tickets]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-lg font-bold text-crm-text tracking-tight">Department Analytics</h1>
        <p className="text-xs text-crm-textMuted mt-0.5">Department-level overview — employees, tasks, projects, attendance, and performance</p>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deptData.map(dept => (
          <Card key={dept.department} className="hover:border-crm-borderHover transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-crm-surface border border-crm-border flex items-center justify-center">
                <Users className="w-5 h-5 text-turquoise" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-crm-text">{dept.department}</h3>
                <p className="text-[11px] text-crm-textMuted">{dept.employeeCount} employees</p>
              </div>
              <Badge variant="neutral" size="sm" showDot={false} className="ml-auto">{dept.attendanceRate}% attendance</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2 rounded-md bg-crm-surface/30 text-center">
                <div className="text-[10px] text-crm-textMuted uppercase tracking-wider">Active Tasks</div>
                <div className="text-sm font-bold text-crm-text mt-0.5">{dept.activeTasks}</div>
              </div>
              <div className="p-2 rounded-md bg-crm-surface/30 text-center">
                <div className="text-[10px] text-crm-textMuted uppercase tracking-wider">Completed</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{dept.tasksDone}</div>
              </div>
              <div className="p-2 rounded-md bg-crm-surface/30 text-center">
                <div className="text-[10px] text-crm-textMuted uppercase tracking-wider">Overdue</div>
                <div className={`text-sm font-bold mt-0.5 ${dept.tasksOverdue > 0 ? 'text-red-400' : 'text-crm-textMuted'}`}>{dept.tasksOverdue}</div>
              </div>
              <div className="p-2 rounded-md bg-crm-surface/30 text-center">
                <div className="text-[10px] text-crm-textMuted uppercase tracking-wider">Projects</div>
                <div className="text-sm font-bold text-crm-text mt-0.5">{dept.projects}</div>
              </div>
            </div>

            {/* Department-specific sections */}
            <div className="mt-3 pt-3 border-t border-crm-border/30 flex items-center gap-4 text-[11px]">
              <span className="text-crm-textMuted">
                <LifeBuoy className="w-3 h-3 inline mr-1" />{dept.openTickets} open tickets
              </span>
              {dept.isSales && dept.wonRevenue > 0 && (
                <span className="text-emerald-400">
                  <DollarSign className="w-3 h-3 inline mr-1" />₹{(dept.wonRevenue / 100000).toFixed(1)}L revenue
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
