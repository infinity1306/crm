import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Project, 
  Milestone, 
  Task, 
  ProjectHealth, 
  ProjectStatus, 
  TaskStatus,
  ProjectFileCategory,
  DailyWorkUpdate,
  InternalTicket
} from '../../types/projects';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { CreateMilestoneModal } from '../milestones/CreateMilestoneModal';
import { CreateTaskModal } from '../tasks/CreateTaskModal';
import { TaskDetailDrawer } from '../tasks/TaskDetailDrawer';
import { SubmitWorkUpdateModal } from '../work-updates/SubmitWorkUpdateModal';
import { RaiseTicketModal } from '../tickets/RaiseTicketModal';
import { TicketDetailDrawer } from '../tickets/TicketDetailDrawer';
import { 
  FolderKanban, 
  CheckSquare, 
  Target, 
  History, 
  LifeBuoy, 
  Users, 
  Files, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ArrowLeft, 
  Building2, 
  ShieldAlert, 
  FileText, 
  Download, 
  Sparkles,
  ChevronRight,
  Send,
  Upload,
  User,
  DollarSign,
  CreditCard
} from 'lucide-react';

interface ProjectDetailProps {
  projectId: string;
  initialTab?: string;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  projectId,
  initialTab = 'overview'
}) => {
  const { 
    projects, 
    milestones, 
    tasks, 
    workUpdates, 
    tickets, 
    projectFiles, 
    employees, 
    currentUser,
    invoices,
    payments,
    expenses,
    calculateProjectProgress, 
    evaluateProjectHealth,
    updateTaskStatus,
    uploadProjectFile,
    navigateTo 
  } = useCRM();

  const [activeTab, setActiveTab] = useState(initialTab);

  // Modals / Drawers state
  const [isCreateMilestoneOpen, setIsCreateMilestoneOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isSubmitUpdateOpen, setIsSubmitUpdateOpen] = useState(false);
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [fileCategoryFilter, setFileCategoryFilter] = useState<string>('all');

  const project = projects.find(p => p.id === projectId);

  // Derived progress and health
  const metrics = useMemo(() => {
    return calculateProjectProgress(projectId);
  }, [projectId, calculateProjectProgress, tasks, milestones]);

  const computedHealth = useMemo(() => {
    return evaluateProjectHealth(projectId);
  }, [projectId, evaluateProjectHealth, tasks, tickets]);

  if (!project) {
    return (
      <div className="p-12 text-center">
        <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Project Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested delivery project does not exist.</p>
        <Button variant="outline" size="sm" className="mt-4 text-xs" onClick={() => navigateTo('/app/projects')}>
          Return to Projects
        </Button>
      </div>
    );
  }

  // Filtered project sub-entities
  const projectMilestones = milestones.filter(m => m.projectId === projectId);
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const projectUpdates = workUpdates.filter(u => u.projectId === projectId);
  const projectTickets = tickets.filter(t => t.projectId === projectId);
  const projectFileList = projectFiles.filter(f => f.projectId === projectId && (fileCategoryFilter === 'all' || f.category === fileCategoryFilter));
  const projectInvoices = invoices.filter(i => i.projectId === projectId);
  const projectExpenses = expenses.filter(e => e.projectId === projectId);
  const totalBilled = projectInvoices.reduce((a, b) => a + b.total, 0);
  const totalPaid = projectInvoices.reduce((a, b) => a + b.paidAmount, 0);
  const totalOutstanding = projectInvoices.reduce((a, b) => a + b.outstandingAmount, 0);
  const totalProjectExpenses = projectExpenses.reduce((a, b) => a + b.amount, 0);
  const estimatedMargin = totalBilled > 0 ? Math.round(((totalBilled - totalProjectExpenses) / totalBilled) * 100) : 0;

  const blockedTasks = projectTasks.filter(t => t.status === 'blocked');
  const criticalTickets = projectTickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed');

  // Build unified project daily timeline events
  const unifiedTimeline = useMemo(() => {
    const events: Array<{
      id: string;
      timestamp: string;
      timeLabel: string;
      type: 'task_done' | 'task_blocked' | 'update' | 'ticket' | 'milestone' | 'file';
      title: string;
      actor: string;
      description?: string;
    }> = [];

    // Add updates
    projectUpdates.forEach(u => {
      events.push({
        id: `timeline-upd-${u.id}`,
        timestamp: u.createdAt,
        timeLabel: u.createdAt.includes('Today') ? 'Today' : 'Yesterday',
        type: 'update',
        title: `Submitted EOD update (${u.completedItems.length} completed, ${u.blockedItems.length} blocked)`,
        actor: u.employeeName,
        description: u.completedItems.slice(0, 2).join('; ')
      });
    });

    // Add tickets
    projectTickets.forEach(tk => {
      events.push({
        id: `timeline-tk-${tk.id}`,
        timestamp: tk.createdAt,
        timeLabel: 'Ticket Raised',
        type: 'ticket',
        title: `Raised ${tk.id}: ${tk.title}`,
        actor: tk.createdByName,
        description: tk.description
      });
    });

    // Add completed tasks
    projectTasks.filter(t => t.status === 'done').forEach(t => {
      events.push({
        id: `timeline-task-${t.id}`,
        timestamp: t.lastUpdated,
        timeLabel: 'Task Done',
        type: 'task_done',
        title: `Completed task: ${t.title}`,
        actor: t.assigneeName
      });
    });

    // Add blocked tasks
    blockedTasks.forEach(t => {
      events.push({
        id: `timeline-blocked-${t.id}`,
        timestamp: t.blockedAt || 'Recent',
        timeLabel: 'Blocker Flagged',
        type: 'task_blocked',
        title: `Blocked task: ${t.title}`,
        actor: t.assigneeName,
        description: t.blockedReason
      });
    });

    return events;
  }, [projectUpdates, projectTickets, projectTasks, blockedTasks]);

  const getHealthBadge = (health: ProjectHealth) => {
    switch (health) {
      case 'on_track':
        return <Badge variant="success" className="gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> On Track</Badge>;
      case 'at_risk':
        return <Badge variant="warning" className="gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> At Risk</Badge>;
      case 'delayed':
        return <Badge variant="error" className="gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Delayed</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button 
          onClick={() => navigateTo('/app/projects')}
          className="hover:text-teal-400 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Projects
        </button>
        <span>/</span>
        <span className="text-white font-medium truncate max-w-xs">{project.name}</span>
      </div>

      {/* Main Project Header Card */}
      <Card className="p-5 bg-[#0D1216] border-[#1E262E] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {project.name}
              </h1>
              {getHealthBadge(computedHealth)}
              <Badge variant="primary" className="text-[11px] uppercase">
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge variant="neutral" className="text-[11px]">
                {project.priority.toUpperCase()} PRIORITY
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {project.clientName}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                PM: <strong className="text-white">{project.managerName}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Deadline: <strong className="text-slate-200">{project.deadline}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span>Budget: <strong className="text-teal-400">{formatCurrency(project.budget)}</strong></span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateMilestoneOpen(true)}
              className="text-xs"
              icon={<Target className="w-3.5 h-3.5" />}
            >
              Add Milestone
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateTaskOpen(true)}
              className="text-xs"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Task
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRaiseTicketOpen(true)}
              className="text-xs"
              icon={<LifeBuoy className="w-3.5 h-3.5" />}
            >
              Raise Ticket
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSubmitUpdateOpen(true)}
              className="text-xs"
              icon={<History className="w-3.5 h-3.5" />}
            >
              EOD Update
            </Button>
          </div>
        </div>

        {/* Blocker Alert Banner (if any task or ticket is blocked/critical) */}
        {(blockedTasks.length > 0 || criticalTickets.length > 0) && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start justify-between gap-3 text-xs text-rose-300">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">
                  Active Delivery Impediment Detected ({blockedTasks.length} blocked task, {criticalTickets.length} critical ticket)
                </p>
                <p className="mt-0.5 text-rose-300/90">
                  {blockedTasks[0]?.blockedReason || criticalTickets[0]?.description || 'Delivery workstream is temporarily impeded.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 text-xs shrink-0"
            >
              View Blocked Tasks →
            </button>
          </div>
        )}

        {/* Derived Progress Breakdown Ribbon (Section 5) */}
        <div className="pt-3 border-t border-[#1E262E] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              Derived Progress: <strong className="text-white text-sm">{metrics.overall}%</strong>
            </span>
            <span className="text-[11px] text-slate-500">
              {metrics.completedTasks} of {metrics.totalTasks} tasks completed across {metrics.moduleBreakdown.length} workstreams
            </span>
          </div>

          {/* Master Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                metrics.overall === 100 
                  ? 'bg-emerald-400' 
                  : computedHealth === 'delayed'
                  ? 'bg-rose-400'
                  : computedHealth === 'at_risk'
                  ? 'bg-amber-400'
                  : 'bg-teal-400'
              }`}
              style={{ width: `${metrics.overall}%` }}
            />
          </div>

          {/* Module-by-Module Derived Workstream Breakdown (Section 5) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
            {metrics.moduleBreakdown.map((m, idx) => (
              <div key={idx} className="p-2 rounded bg-[#12181E] border border-[#1E262E] text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400 truncate">{m.name}</span>
                  <span className="font-semibold text-white">{m.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-400 h-full rounded-full" 
                    style={{ width: `${m.progress}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-slate-500">Overall Progress</p>
          <p className="text-lg font-bold text-teal-400 mt-0.5">{metrics.overall}%</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Calculated from tasks</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-slate-500">Total Tasks</p>
          <p className="text-lg font-bold text-white mt-0.5">{metrics.totalTasks}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">In delivery backlog</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-emerald-400">Completed</p>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">{metrics.completedTasks}</p>
          <p className="text-[10px] text-emerald-500/80 mt-0.5">Passed review</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-teal-400">In Progress</p>
          <p className="text-lg font-bold text-teal-400 mt-0.5">{metrics.inProgressTasks}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Active engineering</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-rose-400">Blocked Tasks</p>
          <p className="text-lg font-bold text-rose-400 mt-0.5">{metrics.blockedTasks}</p>
          <p className="text-[10px] text-rose-500/80 mt-0.5">Needs attention</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-slate-500">Team Engineers</p>
          <p className="text-lg font-bold text-white mt-0.5">{project.teamMembers.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Assigned to sprint</p>
        </Card>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex border-b border-[#1E262E] text-xs overflow-x-auto pb-0.5">
        {[
          { id: 'overview', label: 'Overview', icon: FolderKanban },
          { id: 'milestones', label: `Milestones (${projectMilestones.length})`, icon: Target },
          { id: 'tasks', label: `Tasks (${projectTasks.length})`, icon: CheckSquare },
          { id: 'updates', label: `Daily Updates (${projectUpdates.length})`, icon: History },
          { id: 'tickets', label: `Tickets (${projectTickets.length})`, icon: LifeBuoy },
          { id: 'timeline', label: 'Daily Timeline', icon: Clock },
          { id: 'team', label: `Team (${project.teamMembers.length})`, icon: Users },
          { id: 'files', label: `Files (${projectFileList.length})`, icon: Files },
          { id: 'billing', label: `Finance & Billing (${projectInvoices.length})`, icon: DollarSign }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                isActive 
                  ? 'border-teal-400 text-white' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Scope Summary */}
            <Card className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Delivery Scope & Objectives
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {project.description}
              </p>
              {project.notes && (
                <div className="p-2.5 bg-[#12181E] border border-[#1E262E] rounded text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Internal PM Memo:</span> {project.notes}
                </div>
              )}
            </Card>

            {/* Milestones Snapshot */}
            <Card className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Key Milestones Snapshot
                </h3>
                <button
                  onClick={() => setActiveTab('milestones')}
                  className="text-xs text-teal-400 hover:underline"
                >
                  View all ({projectMilestones.length}) →
                </button>
              </div>

              <div className="space-y-2">
                {projectMilestones.slice(0, 4).map(m => (
                  <div key={m.id} className="p-2.5 rounded bg-[#12181E] border border-[#1E262E] flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-3">
                      <p className="font-semibold text-white truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-500">Lead: {m.ownerName} • Due: {m.deadline}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-400 h-full" style={{ width: `${m.progress}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300 w-8 text-right">{m.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Daily Developer Updates */}
            <Card className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recent Work Updates
                </h3>
                <button
                  onClick={() => setActiveTab('updates')}
                  className="text-xs text-teal-400 hover:underline"
                >
                  All Updates ({projectUpdates.length}) →
                </button>
              </div>

              {projectUpdates.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No developer updates submitted yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {projectUpdates.slice(0, 2).map(u => (
                    <div key={u.id} className="p-3 rounded bg-[#12181E] border border-[#1E262E] text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white">{u.employeeName} ({u.employeeDesignation})</span>
                        <span className="text-slate-500">{u.createdAt}</span>
                      </div>
                      <div className="space-y-1 text-slate-300">
                        {u.completedItems.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Team Roster & Meta */}
          <div className="space-y-6">
            {/* Team Roster */}
            <Card className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Assigned Team Roster
              </h3>
              <div className="space-y-2">
                {project.teamMembers.map(m => {
                  const memberTasks = projectTasks.filter(t => t.assigneeId === m.id);
                  const memberDone = memberTasks.filter(t => t.status === 'done').length;
                  const memberBlocked = memberTasks.filter(t => t.status === 'blocked').length;

                  return (
                    <div key={m.id} className="p-2.5 rounded bg-[#12181E] border border-[#1E262E] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-white truncate">{m.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{m.role}</p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] shrink-0">
                        <span className="text-teal-400 font-medium">{memberDone}/{memberTasks.length} done</span>
                        {memberBlocked > 0 && (
                          <span className="text-rose-400 block text-[10px]">{memberBlocked} blocked</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Quick Meta Card */}
            <Card className="p-4 bg-[#0D1216] border-[#1E262E] text-xs space-y-3">
              <h3 className="font-semibold uppercase tracking-wider text-slate-400">
                Execution Metadata
              </h3>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Template:</span>
                  <span className="font-medium text-white">{project.template || 'Custom'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Start Date:</span>
                  <span>{project.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Delivery:</span>
                  <span>{project.deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Budget:</span>
                  <span className="text-teal-400 font-medium">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Open Tickets:</span>
                  <span>{projectTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 2. MILESTONES TAB */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Project Milestones & Deliverables</h3>
              <p className="text-xs text-slate-400">Sequential roadmap phases and module completion targets.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateMilestoneOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Add Milestone
            </Button>
          </div>

          <div className="space-y-3">
            {projectMilestones.map(m => {
              const mTasks = projectTasks.filter(t => t.milestoneId === m.id);
              const mCompletedTasks = mTasks.filter(t => t.status === 'done').length;

              return (
                <Card key={m.id} className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-teal-400">Phase {m.order}</span>
                        <h4 className="text-sm font-bold text-white">{m.name}</h4>
                        <Badge variant="neutral" className="text-[10px]">
                          {m.moduleName || 'Core'}
                        </Badge>
                        <Badge 
                          variant={m.status === 'completed' ? 'success' : m.status === 'delayed' ? 'error' : 'primary'}
                          className="text-[10px]"
                        >
                          {m.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{m.description}</p>
                    </div>

                    <div className="text-right text-xs shrink-0">
                      <p className="text-slate-400">Lead: <strong className="text-white">{m.ownerName}</strong></p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Due: {m.deadline}</p>
                    </div>
                  </div>

                  {/* Progress Bar & Linked Tasks */}
                  <div className="pt-2 border-t border-[#1E262E] flex items-center justify-between gap-4 text-xs">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Progress</span>
                        <span className="font-semibold text-white">{m.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-400 h-full rounded-full" style={{ width: `${m.progress}%` }} />
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-500 shrink-0">
                      {mCompletedTasks}/{mTasks.length} linked tasks complete
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Project Work Items & Sprints</h3>
              <p className="text-xs text-slate-400">Engineering tasks assigned to team members on {project.name}.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateTaskOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Add Task
            </Button>
          </div>

          {projectTasks.length === 0 ? (
            <Card className="p-8 text-center bg-[#0D1216] border-[#1E262E]">
              <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No tasks created yet</p>
              <Button size="sm" variant="primary" className="mt-3 text-xs" onClick={() => setIsCreateTaskOpen(true)}>
                Create First Task
              </Button>
            </Card>
          ) : (
            <div className="border border-[#1E262E] rounded overflow-hidden bg-[#0D1216]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E262E] bg-[#12181E] text-slate-400 font-medium">
                    <th className="py-3 px-4">Task Name</th>
                    <th className="py-3 px-3">Milestone</th>
                    <th className="py-3 px-3">Assignee</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Deadline</th>
                    <th className="py-3 px-3">Progress</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E262E] text-slate-300">
                  {projectTasks.map(t => (
                    <tr 
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="hover:bg-[#12181E] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                          {t.title}
                        </p>
                        {t.status === 'blocked' && (
                          <p className="text-[10px] text-rose-400 mt-0.5 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            {t.blockedReason}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400">{t.milestoneName || '—'}</td>
                      <td className="py-3 px-3">{t.assigneeName}</td>
                      <td className="py-3 px-3">
                        <Badge variant={t.priority === 'critical' ? 'error' : t.priority === 'high' ? 'warning' : 'primary'} className="text-[10px]">
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={t.status === 'done' ? 'success' : t.status === 'blocked' ? 'error' : 'neutral'} className="text-[10px]">
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">{t.deadline}</td>
                      <td className="py-3 px-3">{t.progress}%</td>
                      <td className="py-3 px-4 text-right">
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white text-xs p-1">
                          Inspect →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. DAILY UPDATES TAB */}
      {activeTab === 'updates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Standup & EOD Reports</h3>
              <p className="text-xs text-slate-400">Daily engineering updates logged for {project.name}.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSubmitUpdateOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Submit EOD Update
            </Button>
          </div>

          {projectUpdates.length === 0 ? (
            <Card className="p-8 text-center bg-[#0D1216] border-[#1E262E]">
              <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No daily updates recorded</p>
              <Button size="sm" variant="primary" className="mt-3 text-xs" onClick={() => setIsSubmitUpdateOpen(true)}>
                Record Today's Update
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {projectUpdates.map(u => (
                <Card key={u.id} className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1E262E]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{u.employeeName}</span>
                      <span className="text-[10px] text-slate-500">({u.employeeDesignation})</span>
                    </div>
                    <span className="text-slate-400">{u.createdAt}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-2.5 bg-[#12181E] rounded space-y-1">
                      <span className="text-emerald-400 font-semibold uppercase text-[10px]">Completed Today</span>
                      {u.completedItems.map((item, i) => (
                        <p key={i} className="text-slate-300 flex items-start gap-1">
                          <span className="text-emerald-500">•</span> {item}
                        </p>
                      ))}
                    </div>

                    <div className="p-2.5 bg-[#12181E] rounded space-y-1">
                      <span className="text-teal-400 font-semibold uppercase text-[10px]">In Progress</span>
                      {u.inProgressItems.map((item, i) => (
                        <p key={i} className="text-slate-300 flex items-start gap-1">
                          <span className="text-teal-500">•</span> {item}
                        </p>
                      ))}
                    </div>
                  </div>

                  {u.blockedItems && u.blockedItems.length > 0 && (
                    <div className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded text-rose-300 space-y-1">
                      <span className="font-semibold uppercase text-[10px] text-rose-400">Blocked Items:</span>
                      {u.blockedItems.map((item, i) => (
                        <p key={i}>• {item}</p>
                      ))}
                      {u.blockedReason && (
                        <p className="text-[11px] text-rose-400 mt-1"><strong>Reason:</strong> {u.blockedReason}</p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Internal Tickets & Inquiries</h3>
              <p className="text-xs text-slate-400">Operational questions and technical defects filed against {project.name}.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRaiseTicketOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Raise Ticket
            </Button>
          </div>

          {projectTickets.length === 0 ? (
            <Card className="p-8 text-center bg-[#0D1216] border-[#1E262E]">
              <LifeBuoy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No tickets raised for this project</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {projectTickets.map(tk => (
                <Card 
                  key={tk.id} 
                  onClick={() => setSelectedTicketId(tk.id)}
                  className="p-3.5 bg-[#0D1216] border border-[#1E262E] hover:border-teal-500/40 transition-colors cursor-pointer text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-400">{tk.id}</span>
                      <h4 className="font-semibold text-white">{tk.title}</h4>
                    </div>
                    <Badge variant={tk.priority === 'critical' ? 'error' : tk.priority === 'high' ? 'warning' : 'primary'} className="text-[10px]">
                      {tk.priority}
                    </Badge>
                  </div>

                  <p className="text-slate-400 line-clamp-2">{tk.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1E262E] text-[11px] text-slate-500">
                    <span>Assigned: <strong className="text-slate-300">{tk.assignedToName}</strong></span>
                    <span>Status: <strong className="text-white capitalize">{tk.status}</strong></span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. DAILY TIMELINE TAB (Unified Project Daily Timeline - Section 12) */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Unified Project Daily Timeline</h3>
            <p className="text-xs text-slate-400">Combined chronological log of tasks, developer updates, tickets, and milestones.</p>
          </div>

          <div className="p-4 bg-[#0D1216] border border-[#1E262E] rounded-lg">
            <div className="relative border-l border-[#1E262E] ml-3 pl-6 space-y-6">
              {unifiedTimeline.map(ev => (
                <div key={ev.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className={`absolute -left-[31px] top-0.5 w-3 h-3 rounded-full border-2 border-[#0D1216] ${
                    ev.type === 'task_blocked' ? 'bg-rose-500' :
                    ev.type === 'task_done' ? 'bg-emerald-500' :
                    ev.type === 'ticket' ? 'bg-amber-500' : 'bg-teal-500'
                  }`} />

                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-semibold text-white">{ev.actor}</span>
                    <span className="text-[10px] text-slate-500">{ev.timestamp}</span>
                  </div>

                  <p className="text-xs text-teal-300/90 font-medium">{ev.title}</p>
                  {ev.description && (
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed bg-[#12181E] p-2 rounded border border-[#1E262E]">
                      {ev.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. TEAM TAB */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Project Engineering Team & Workload</h3>
            <p className="text-xs text-slate-400">Personnel allocations, assigned workstreams, and sprint performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.teamMembers.map(m => {
              const mTasks = projectTasks.filter(t => t.assigneeId === m.id);
              const mDone = mTasks.filter(t => t.status === 'done');
              const mInProgress = mTasks.filter(t => t.status === 'in_progress');
              const mBlocked = mTasks.filter(t => t.status === 'blocked');

              return (
                <Card key={m.id} className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{m.name}</h4>
                        <p className="text-[11px] text-slate-400">{m.role} • {m.department}</p>
                      </div>
                    </div>
                    <Badge variant="primary" className="text-[10px]">
                      {mTasks.length} Tasks
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2 bg-[#12181E] rounded text-center text-[11px]">
                    <div>
                      <p className="text-slate-500">Completed</p>
                      <p className="font-bold text-emerald-400 mt-0.5">{mDone.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">In Progress</p>
                      <p className="font-bold text-teal-400 mt-0.5">{mInProgress.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Blocked</p>
                      <p className="font-bold text-rose-400 mt-0.5">{mBlocked.length}</p>
                    </div>
                  </div>

                  {mInProgress.length > 0 && (
                    <div className="text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">Active Work:</span> {mInProgress[0].title}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. FILES TAB */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Project File Repository</h3>
              <p className="text-xs text-slate-400">Architecture designs, specifications, builds, and audit reports.</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={fileCategoryFilter}
                onChange={(e) => setFileCategoryFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Files' },
                  { value: 'designs', label: 'Designs' },
                  { value: 'documents', label: 'Documents' },
                  { value: 'assets', label: 'Assets' },
                  { value: 'reports', label: 'Reports' },
                ]}
                className="text-xs"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  uploadProjectFile({
                    name: `Delivery_Audit_${Date.now().toString().slice(-4)}.pdf`,
                    category: 'documents',
                    size: '2.1 MB',
                    projectId: project.id,
                    projectName: project.name
                  });
                }}
                icon={<Upload className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Upload File
              </Button>
            </div>
          </div>

          {projectFileList.length === 0 ? (
            <Card className="p-8 text-center bg-[#0D1216] border-[#1E262E]">
              <Files className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No project files uploaded</p>
            </Card>
          ) : (
            <div className="border border-[#1E262E] rounded overflow-hidden bg-[#0D1216]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E262E] bg-[#12181E] text-slate-400 font-medium">
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-3">Uploaded By</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E262E] text-slate-300">
                  {projectFileList.map(f => (
                    <tr key={f.id} className="hover:bg-[#12181E] transition-colors">
                      <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-400" />
                        <span>{f.name}</span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="neutral" className="text-[10px] uppercase">
                          {f.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{f.size}</td>
                      <td className="py-3 px-3">{f.uploadedByName}</td>
                      <td className="py-3 px-3 text-slate-400">{f.uploadedAt}</td>
                      <td className="py-3 px-4 text-right">
                        <Button size="sm" variant="ghost" className="text-teal-400 hover:text-teal-300 text-xs p-1" icon={<Download className="w-3.5 h-3.5" />}>
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 9: FINANCE & BILLING */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Contract Budget</span>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                ₹{project.budget.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Approved budget</span>
            </Card>

            <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Billed</span>
              <span className="text-base font-bold font-mono text-teal-400 mt-1 block">
                ₹{totalBilled.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{projectInvoices.length} invoices issued</span>
            </Card>

            <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Cleared Receipts</span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                ₹{totalPaid.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-500/80 mt-0.5 block">Collected to date</span>
            </Card>

            <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Uncollected Balance</span>
              <span className={`text-base font-bold font-mono mt-1 block ${totalOutstanding > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                ₹{totalOutstanding.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Pending receivable</span>
            </Card>

            <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Direct Expenses</span>
              <span className="text-base font-bold font-mono text-rose-400 mt-1 block">
                ₹{totalProjectExpenses.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{projectExpenses.length} claims filed</span>
            </Card>

            <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Delivery Margin</span>
              <span className="text-base font-bold font-mono text-teal-300 mt-1 block">
                {estimatedMargin}%
              </span>
              <span className="text-[10px] text-teal-500/80 mt-0.5 block">Estimated profit</span>
            </Card>
          </div>

          {/* Invoices List */}
          <div className="bg-[#0D1216] border border-[#1E262E] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#1E262E] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Project Commercial Invoices</h3>
                <p className="text-xs text-slate-400 mt-0.5">Milestone billing and scope retainers for {project.name}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="text-xs"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => navigateTo('/app/finance/invoices')}
              >
                Create Invoice
              </Button>
            </div>

            {projectInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No invoices currently linked to this delivery project.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090D10] border-b border-[#1E262E] text-slate-400 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Invoice #</th>
                      <th className="py-3 px-4 font-semibold">Issue Date</th>
                      <th className="py-3 px-4 font-semibold">Due Date</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Billed (₹)</th>
                      <th className="py-3 px-4 font-semibold text-right">Balance Due (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E262E]/50">
                    {projectInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-mono font-medium">
                          <button
                            onClick={() => navigateTo(`/app/finance/invoices/${inv.id}`)}
                            className="text-teal-400 hover:underline"
                          >
                            {inv.invoiceNumber}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{inv.issueDate}</td>
                        <td className="py-3 px-4 text-slate-300">{inv.dueDate}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            inv.status === 'paid' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40' :
                            inv.status === 'overdue' ? 'bg-rose-950/50 text-rose-400 border border-rose-800/40' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {inv.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-white">
                          ₹{inv.total.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <span className={inv.outstandingAmount > 0 ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                            ₹{inv.outstandingAmount.toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Direct Project Expenses */}
          <div className="bg-[#0D1216] border border-[#1E262E] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#1E262E] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Attributed Operational Expenses</h3>
                <p className="text-xs text-slate-400 mt-0.5">Cloud tooling, licenses, and direct contractor expenses</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigateTo('/app/finance/expenses')}
              >
                Expense Desk
              </Button>
            </div>

            {projectExpenses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No direct expenses claimed against this project yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090D10] border-b border-[#1E262E] text-slate-400 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Expense Title</th>
                      <th className="py-3 px-4 font-semibold">Claimed By</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E262E]/50">
                    {projectExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-medium text-white">{exp.title}</td>
                        <td className="py-3 px-4 text-slate-300">{exp.employeeName}</td>
                        <td className="py-3 px-4 text-slate-400 capitalize">{exp.category}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{exp.date}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-rose-400">
                          ₹{exp.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS & DRAWERS */}
      <CreateMilestoneModal
        isOpen={isCreateMilestoneOpen}
        onClose={() => setIsCreateMilestoneOpen(false)}
        projectId={project.id}
        projectName={project.name}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultProjectId={project.id}
      />

      <SubmitWorkUpdateModal
        isOpen={isSubmitUpdateOpen}
        onClose={() => setIsSubmitUpdateOpen(false)}
        defaultProjectId={project.id}
      />

      <RaiseTicketModal
        isOpen={isRaiseTicketOpen}
        onClose={() => setIsRaiseTicketOpen(false)}
        defaultProjectId={project.id}
      />

      <TaskDetailDrawer
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onRaiseTicket={(task) => {
          setSelectedTaskId(null);
          setIsRaiseTicketOpen(true);
        }}
      />

      <TicketDetailDrawer
        ticketId={selectedTicketId}
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </div>
  );
};
