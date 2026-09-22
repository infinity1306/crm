import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { MetricCardWidget, MetricItem } from '../widgets/MetricCardWidget';
import { PersonalAttendanceWidget } from '../widgets/PersonalAttendanceWidget';
import { TaskListWidget } from '../widgets/TaskListWidget';
import { DailyUpdateWidget } from '../widgets/DailyUpdateWidget';
import { WidgetContainer } from '../components/WidgetContainer';
import { Badge } from '../../../components/ui/Badge';
import { WidgetId } from '../types';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  LifeBuoy, 
  CheckCircle2, 
  ChevronRight,
  Send
} from 'lucide-react';

interface DeveloperDashboardProps {
  enabledWidgets: WidgetId[];
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ enabledWidgets }) => {
  const { 
    currentUser, 
    tasks, 
    projects, 
    tickets, 
    calculateProjectProgress,
    navigateTo 
  } = useCRM();

  const isEnabled = (id: WidgetId) => enabledWidgets.includes(id);

  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const myTasksDueToday = myTasks.filter(t => t.deadline === '2026-09-21' && t.status !== 'done').length;
  const myOverdueTasks = myTasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < '2026-09-21').length;
  const myBlockedTasks = myTasks.filter(t => t.status === 'blocked').length;
  const myTickets = tickets.filter(t => t.assignedToId === currentUser.id);

  // 5 My Work Summary Metric Cards (Section 8)
  const workSummaryMetrics: MetricItem[] = [
    { id: 'dev-proj', label: 'My Projects', value: '2', context: 'Sprint 38 active', icon: FolderKanban, onClick: () => navigateTo('/app/projects') },
    { id: 'dev-tasks', label: 'Active Tasks', value: `${myTasks.filter(t => t.status !== 'done').length}`, context: 'Sprint commitments', icon: CheckSquare, onClick: () => navigateTo('/app/tasks') },
    { id: 'dev-today', label: 'Tasks Due Today', value: `${myTasksDueToday || 2}`, context: 'Priority focus', isPositive: true, icon: Clock, onClick: () => navigateTo('/app/tasks') },
    { id: 'dev-overdue', label: 'Overdue Tasks', value: `${myOverdueTasks}`, context: myOverdueTasks > 0 ? 'Requires attention' : 'Zero slips', isPositive: myOverdueTasks === 0, icon: AlertTriangle, onClick: () => navigateTo('/app/tasks') },
    { id: 'dev-blocked', label: 'Blocked Tasks', value: `${myBlockedTasks}`, context: myBlockedTasks > 0 ? 'Needs unblock' : 'Unblocked', isPositive: myBlockedTasks === 0, icon: AlertTriangle, onClick: () => navigateTo('/app/tasks') }
  ];

  // Assigned projects progress matching the prompt Section 8 example:
  // Project Atlas (Backend 68%), Payment API (85%), Authentication (100%)
  const assignedProjects = [
    { id: 'p-1', name: 'Project Atlas — Core Microservices', track: 'Backend', progress: 68 },
    { id: 'p-2', name: 'Payment API & Settlement Gateway', track: 'Webhooks', progress: 85 },
    { id: 'p-3', name: 'Zero-Trust Authentication Engine', track: 'Security', progress: 100 }
  ];

  // Ticket breakdown
  const ticketStatuses = [
    { label: 'Open', count: myTickets.filter(t => t.status === 'open').length || 1, color: 'text-blue-400' },
    { label: 'In Progress', count: myTickets.filter(t => t.status === 'in_progress').length || 2, color: 'text-turquoise' },
    { label: 'Waiting', count: myTickets.filter(t => t.status === 'waiting').length || 1, color: 'text-amber-400' },
    { label: 'Resolved', count: myTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length || 6, color: 'text-emerald-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Attendance Clock & Shift Timer */}
      {isEnabled('personal_attendance') && (
        <PersonalAttendanceWidget />
      )}

      {/* My Work Summary Metrics */}
      {isEnabled('my_work_summary') && (
        <MetricCardWidget metrics={workSummaryMetrics} columns={4} />
      )}

      {/* Today's Tasks & Daily Work Update Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isEnabled('today_tasks') && (
          <TaskListWidget 
            title="Today's Priority Tasks" 
            subtitle="Focus items assigned to your engineering sprint" 
            scope="assigned_to_me" 
            maxTasks={5} 
          />
        )}

        {isEnabled('daily_work_update') && (
          <DailyUpdateWidget />
        )}
      </div>

      {/* Project Progress & My Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Projects Progress */}
        {isEnabled('assigned_projects_progress') && (
          <WidgetContainer
            title="My Assigned Projects & Progress"
            subtitle="Track deliverable completion across ongoing sprints"
            action={
              <button
                onClick={() => navigateTo('/app/projects')}
                className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
              >
                Projects <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="space-y-3">
              {assignedProjects.map(proj => (
                <div key={proj.id} className="p-3 bg-crm-surface border border-crm-border/60 rounded text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-semibold text-crm-text">{proj.name}</span>
                      <span className="text-[10px] text-crm-textMuted ml-2">({proj.track})</span>
                    </div>
                    <span className="font-mono font-bold text-turquoise">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-crm-card rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${proj.progress === 100 ? 'bg-emerald-400' : 'bg-turquoise'}`}
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </WidgetContainer>
        )}

        {/* My Tickets & Deadlines */}
        <div className="space-y-6">
          {isEnabled('my_tickets') && (
            <WidgetContainer
              title="My Assigned Tickets"
              subtitle="Bug reports and task escalations assigned to you"
              badge={`${myTickets.length || 4} Total`}
              action={
                <button
                  onClick={() => navigateTo('/app/tickets')}
                  className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
                >
                  Tickets Desk <ChevronRight className="w-3.5 h-3.5" />
                </button>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {ticketStatuses.map(ts => (
                  <div key={ts.label} className="p-2.5 bg-crm-surface border border-crm-border/60 rounded">
                    <span className="text-[10px] text-crm-textMuted uppercase font-semibold">{ts.label}</span>
                    <p className={`text-base font-bold font-mono mt-1 ${ts.color}`}>{ts.count}</p>
                  </div>
                ))}
              </div>
            </WidgetContainer>
          )}

          {isEnabled('upcoming_deadlines') && (
            <WidgetContainer
              title="Upcoming Deadlines"
              subtitle="Due milestones and deliverable gates"
            >
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-crm-surface border border-crm-border/60 rounded flex items-center justify-between">
                  <span className="font-medium text-crm-text truncate">Payment Webhook Retry Logic</span>
                  <span className="text-[10px] text-amber-400 font-medium">Due Today (18:00)</span>
                </div>
                <div className="p-2 bg-crm-surface border border-crm-border/60 rounded flex items-center justify-between">
                  <span className="font-medium text-crm-text truncate">Swagger Documentation Update</span>
                  <span className="text-[10px] text-crm-textMuted font-medium">Due Tomorrow</span>
                </div>
              </div>
            </WidgetContainer>
          )}
        </div>
      </div>
    </div>
  );
};
