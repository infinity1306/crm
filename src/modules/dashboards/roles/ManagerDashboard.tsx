import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { MetricCardWidget, MetricItem } from '../widgets/MetricCardWidget';
import { TeamWorkloadWidget } from '../widgets/TeamWorkloadWidget';
import { ProjectHealthWidget } from '../widgets/ProjectHealthWidget';
import { ActivityFeedWidget } from '../widgets/ActivityFeedWidget';
import { PersonalAttendanceWidget } from '../widgets/PersonalAttendanceWidget';
import { WidgetContainer } from '../components/WidgetContainer';
import { WidgetId } from '../types';
import { 
  Users, 
  FolderKanban, 
  Clock, 
  AlertTriangle, 
  LifeBuoy, 
  CheckSquare, 
  ChevronRight,
  Send,
  FileCheck2
} from 'lucide-react';

interface ManagerDashboardProps {
  enabledWidgets: WidgetId[];
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ enabledWidgets }) => {
  const { 
    employees, 
    projects, 
    tasks, 
    tickets, 
    workUpdates, 
    navigateTo 
  } = useCRM();

  const isEnabled = (id: WidgetId) => enabledWidgets.includes(id);

  const todayDateStr = new Date().toISOString().split('T')[0];
  const teamMembersCount = employees.filter(e => e.department === 'Engineering').length || employees.length;
  const activeProjectsCount = projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length;
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < todayDateStr).length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const openTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
  const unassignedTickets = tickets.filter(t => !t.assignedToId && t.status !== 'closed');
  const sprintTasks = tasks.filter(t => t.status !== 'done');

  const managerMetrics: MetricItem[] = [
    { id: 'mgr-team', label: 'Team Members', value: `${teamMembersCount}`, context: 'Eng Pod 1', icon: Users, onClick: () => navigateTo('/app/team') },
    { id: 'mgr-proj', label: 'Active Projects', value: `${activeProjectsCount}`, context: 'Sprint 38', icon: FolderKanban, onClick: () => navigateTo('/app/projects') },
    { id: 'mgr-due', label: 'Tasks Due This Sprint', value: `${sprintTasks.length}`, context: `${sprintTasks.filter(t => t.status === 'in_progress').length} in progress`, icon: Clock, onClick: () => navigateTo('/app/tasks') },
    { id: 'mgr-overdue', label: 'Overdue Tasks', value: `${overdueTasks}`, context: 'Sprint slips', icon: AlertTriangle, isPositive: overdueTasks === 0, onClick: () => navigateTo('/app/tasks') },
    { id: 'mgr-blocked', label: 'Blocked Tasks', value: `${blockedTasks}`, context: 'Requires unblocking', icon: AlertTriangle, isPositive: blockedTasks === 0, onClick: () => navigateTo('/app/tasks') },
    { id: 'mgr-tickets', label: 'Open Tickets', value: `${openTickets}`, context: 'Support & dev escalations', icon: LifeBuoy, onClick: () => navigateTo('/app/tickets') }
  ];

  return (
    <div className="space-y-6">
      {/* Attendance Clock & Shift Timer */}
      {isEnabled('personal_attendance') && (
        <PersonalAttendanceWidget />
      )}

      {/* Primary Manager Metrics (6 cards) */}
      <MetricCardWidget metrics={managerMetrics} columns={6} />

      {/* Manager Action Center (Urgent Blockers & Review Items) */}
      {isEnabled('manager_action_center') && (
        <WidgetContainer
          title="Manager Action Center"
          subtitle="Blockers, review queues, and milestone risks requiring team lead intervention"
          badge="Priority Triage"
          badgeType="warning"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div 
              onClick={() => navigateTo('/app/tasks')}
              className="p-3 bg-red-500/5 border border-red-500/20 hover:border-red-500/40 rounded-md cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-red-400">Blocked Tasks ({blockedTasks})</span>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              </div>
              <p className="text-[11px] text-crm-textMuted">
                {blockedTasks} task(s) currently flagged as blocked.
              </p>
            </div>

            <div 
              onClick={() => navigateTo('/app/work-updates')}
              className="p-3 bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 rounded-md cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-400">Pending Daily Updates</span>
                <Send className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[11px] text-crm-textMuted">
                {Math.max(0, teamMembersCount - workUpdates.length)} member(s) have pending updates today.
              </p>
            </div>

            <div 
              onClick={() => navigateTo('/app/tickets')}
              className="p-3 bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 rounded-md cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-400">Tickets Awaiting Assignment ({unassignedTickets.length})</span>
                <LifeBuoy className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-[11px] text-crm-textMuted">
                {unassignedTickets.length} ticket(s) currently unassigned in queue.
              </p>
            </div>
          </div>
        </WidgetContainer>
      )}

      {/* Team Workload Breakdown */}
      {isEnabled('team_workload') && (
        <TeamWorkloadWidget />
      )}

      {/* Assigned Project Health */}
      {isEnabled('project_health') && (
        <ProjectHealthWidget title="Assigned Pod Projects & Health" scope="assigned_to_me" maxProjects={3} />
      )}

      {/* Team Activity Feed */}
      {isEnabled('team_activity') && (
        <ActivityFeedWidget title="Pod Activity Stream" filterScope="team" maxEvents={5} />
      )}
    </div>
  );
};
