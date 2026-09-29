import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { DashboardPersona } from '../types';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Receipt, 
  LifeBuoy, 
  FolderKanban, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface RoleAlertsBannerProps {
  persona: DashboardPersona;
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  desc: string;
  count?: number;
  path: string;
  icon: React.ElementType;
}

export const RoleAlertsBanner: React.FC<RoleAlertsBannerProps> = ({ persona }) => {
  const { 
    currentUser, 
    tasks, 
    tickets, 
    projects, 
    leaveRequests, 
    followUps, 
    financeMetrics, 
    meetings,
    navigateTo 
  } = useCRM();

  const alerts: AlertItem[] = [];

  const todayStr = '2026-09-21';

  if (persona === 'super_admin' || persona === 'admin') {
    if (financeMetrics.overdueInvoicesCount > 0) {
      alerts.push({
        id: 'overdue-inv',
        type: 'critical',
        title: `${financeMetrics.overdueInvoicesCount} Overdue Invoices`,
        desc: 'Immediate recovery action required for past-due receivables',
        path: '/app/finance/overdue',
        icon: Receipt
      });
    }

    const delayedProjects = projects.filter(p => p.status === 'active' && p.deadline && p.deadline < todayStr);
    if (delayedProjects.length > 0) {
      alerts.push({
        id: 'delayed-proj',
        type: 'critical',
        title: `${delayedProjects.length} Delayed Deliverables`,
        desc: `Projects running past projected completion (${delayedProjects.map(p => p.name).slice(0, 2).join(', ')})`,
        path: '/app/projects',
        icon: FolderKanban
      });
    }

    const criticalTickets = tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed');
    if (criticalTickets.length > 0) {
      alerts.push({
        id: 'crit-tk',
        type: 'warning',
        title: `${criticalTickets.length} Critical Tickets Open`,
        desc: 'Unresolved Sev-1 incidents requiring operational escalation',
        path: '/app/tickets',
        icon: LifeBuoy
      });
    }

    const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
    if (pendingLeaves.length > 0) {
      alerts.push({
        id: 'pending-leave',
        type: 'info',
        title: `${pendingLeaves.length} Pending Leave Approvals`,
        desc: 'Team requests awaiting management review',
        path: '/app/leave',
        icon: Clock
      });
    }
  }

  if (persona === 'manager') {
    const blockedTasks = tasks.filter(t => t.status === 'blocked');
    if (blockedTasks.length > 0) {
      alerts.push({
        id: 'mgr-blocked',
        type: 'critical',
        title: `${blockedTasks.length} Blocked Tasks in Team`,
        desc: `Blockers stalling sprint delivery: ${blockedTasks.slice(0, 2).map(t => t.title).join(', ')}`,
        path: '/app/tasks',
        icon: AlertTriangle
      });
    }

    const atRiskProjects = projects.filter(p => p.status === 'active' && p.health === 'at_risk');
    if (atRiskProjects.length > 0) {
      alerts.push({
        id: 'mgr-risk',
        type: 'warning',
        title: `Project Delivery Health Review`,
        desc: 'Review team milestone pacing and capacity commitments',
        path: '/app/projects',
        icon: FolderKanban
      });
    }
  }

  if (persona === 'sales_exec') {
    const overdueFollowUps = followUps.filter(f => f.status === 'overdue' || (f.dueDate && f.dueDate < todayStr && f.status !== 'completed'));
    if (overdueFollowUps.length > 0) {
      alerts.push({
        id: 'sales-fu',
        type: 'critical',
        title: `${overdueFollowUps.length} Overdue Client Follow-ups`,
        desc: 'Immediate outreach needed to prevent prospect drop-off',
        path: '/app/sales/activities',
        icon: Clock
      });
    }

    const todayMeetings = meetings.filter(m => m.date === todayStr && m.status === 'scheduled');
    if (todayMeetings.length > 0) {
      alerts.push({
        id: 'sales-meet',
        type: 'info',
        title: `${todayMeetings.length} Scheduled Client Meetings Today`,
        desc: `Upcoming pitch: ${todayMeetings[0]?.title || 'Demo'} at ${todayMeetings[0]?.time || 'TBD'}`,
        path: '/app/sales/meetings',
        icon: Calendar
      });
    }
  }

  if (persona === 'sales_manager') {
    alerts.push({
      id: 'sm-stagnant',
      type: 'warning',
      title: '3 Stagnant Deals in Negotiation',
      desc: 'No deal activity recorded in >7 days across team accounts',
      path: '/app/sales/pipeline',
      icon: AlertTriangle
    });
  }

  if (persona === 'developer') {
    const myOverdueTasks = tasks.filter(t => t.assigneeId === currentUser.id && t.status !== 'done' && t.deadline && t.deadline < todayStr);
    if (myOverdueTasks.length > 0) {
      alerts.push({
        id: 'dev-overdue',
        type: 'critical',
        title: `${myOverdueTasks.length} Tasks Past Deadline`,
        desc: `Action needed on: ${myOverdueTasks.slice(0, 2).map(t => t.title).join(', ')}`,
        path: '/app/tasks',
        icon: Clock
      });
    }

    const myBlocked = tasks.filter(t => t.assigneeId === currentUser.id && t.status === 'blocked');
    if (myBlocked.length > 0) {
      alerts.push({
        id: 'dev-blocked',
        type: 'warning',
        title: `${myBlocked.length} of Your Tasks are Blocked`,
        desc: 'Raise ticket or request team unblock via Daily Update',
        path: '/app/tasks',
        icon: AlertTriangle
      });
    }

    const myUrgentTickets = tickets.filter(t => t.assignedToId === currentUser.id && (t.priority === 'high' || t.priority === 'critical') && t.status !== 'resolved' && t.status !== 'closed');
    if (myUrgentTickets.length > 0) {
      alerts.push({
        id: 'dev-ticket',
        type: 'warning',
        title: `${myUrgentTickets.length} Priority Tickets Assigned to You`,
        desc: 'Urgent developer attention requested',
        path: '/app/tickets',
        icon: LifeBuoy
      });
    }
  }

  if (persona === 'finance') {
    if (financeMetrics.overdueInvoicesCount > 0) {
      alerts.push({
        id: 'fin-overdue',
        type: 'critical',
        title: `Overdue Receivables: ₹${financeMetrics.totalOverdue.toLocaleString('en-IN')}`,
        desc: `${financeMetrics.overdueInvoicesCount} invoices pending payment follow-up`,
        path: '/app/finance/overdue',
        icon: Receipt
      });
    }
    if (financeMetrics.pendingExpensesCount > 0) {
      alerts.push({
        id: 'fin-expense',
        type: 'warning',
        title: `${financeMetrics.pendingExpensesCount} Expenses Awaiting Approval`,
        desc: 'Review submitted departmental reimbursement claims',
        path: '/app/finance/expenses',
        icon: AlertTriangle
      });
    }
  }

  if (persona === 'hr') {
    const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
    if (pendingLeaves.length > 0) {
      alerts.push({
        id: 'hr-leave',
        type: 'warning',
        title: `${pendingLeaves.length} Leave Applications Awaiting Review`,
        desc: 'Process employee PTO and sick leave applications',
        path: '/app/leave',
        icon: Clock
      });
    }
  }

  if (persona === 'client') {
    alerts.push({
      id: 'client-update',
      type: 'info',
      title: 'Milestone Review Available',
      desc: 'Smart Contract Audit Sprint completed. Click to inspect deliverables.',
      path: '/app/projects',
      icon: FolderKanban
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.slice(0, 2).map(alert => {
        const borderClass = 
          alert.type === 'critical' ? 'border-red-500/30 bg-red-500/5 text-red-300' :
          alert.type === 'warning' ? 'border-amber-500/30 bg-amber-500/5 text-amber-300' :
          'border-turquoise/30 bg-turquoise/5 text-turquoise';

        const iconColor =
          alert.type === 'critical' ? 'text-red-400' :
          alert.type === 'warning' ? 'text-amber-400' :
          'text-turquoise';

        return (
          <div
            key={alert.id}
            onClick={() => navigateTo(alert.path)}
            className={`flex items-center justify-between px-4 py-2.5 rounded-md border text-xs cursor-pointer transition-all hover:brightness-110 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <alert.icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
              <span className="font-semibold">{alert.title}</span>
              <span className="text-crm-textMuted hidden sm:inline truncate">— {alert.desc}</span>
            </div>
            <div className="flex items-center gap-1 font-medium text-[11px] opacity-80 hover:opacity-100 flex-shrink-0">
              <span>View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
