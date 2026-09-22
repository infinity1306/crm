import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Task, TaskPriority, TaskStatus } from '../../types/projects';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { CreateTaskModal } from './CreateTaskModal';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  ListFilter, 
  AlertTriangle, 
  Calendar, 
  ArrowRight, 
  ArrowLeft,
  ShieldAlert, 
  Clock, 
  FolderKanban, 
  User, 
  MessageSquare,
  Paperclip,
  CheckCircle2
} from 'lucide-react';

const KANBAN_COLUMNS: Array<{ id: TaskStatus; label: string; color: string }> = [
  { id: 'backlog', label: 'Backlog', color: 'border-slate-700/60' },
  { id: 'todo', label: 'Todo', color: 'border-slate-600/60' },
  { id: 'in_progress', label: 'In Progress', color: 'border-teal-500/50' },
  { id: 'in_review', label: 'In Review', color: 'border-amber-500/50' },
  { id: 'blocked', label: 'Blocked', color: 'border-rose-500/60' },
  { id: 'done', label: 'Done', color: 'border-emerald-500/50' },
];

export const TasksWorkspace: React.FC = () => {
  const { 
    tasks, 
    projects, 
    employees, 
    currentUser, 
    updateTaskStatus 
  } = useCRM();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isMyTasksOnly, setIsMyTasksOnly] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (isMyTasksOnly && t.assigneeId !== currentUser.id) return false;
      if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;
      if (assigneeFilter !== 'all' && t.assigneeId !== assigneeFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesProject = t.projectName.toLowerCase().includes(q);
        const matchesAssignee = t.assigneeName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesProject && !matchesAssignee) return false;
      }
      return true;
    });
  }, [tasks, isMyTasksOnly, currentUser.id, projectFilter, assigneeFilter, priorityFilter, statusFilter, searchQuery]);

  // Total summary counts
  const totalCount = tasks.length;
  const blockedCount = tasks.filter(t => t.status === 'blocked').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < todayStr).length;

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="error" className="text-[10px] py-0">Critical</Badge>;
      case 'high':
        return <Badge variant="warning" className="text-[10px] py-0">High</Badge>;
      case 'medium':
        return <Badge variant="primary" className="text-[10px] py-0">Medium</Badge>;
      case 'low':
        return <Badge variant="neutral" className="text-[10px] py-0">Low</Badge>;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return <Badge variant="success" className="text-[10px]">Done</Badge>;
      case 'blocked':
        return <Badge variant="error" className="text-[10px]">Blocked</Badge>;
      case 'in_progress':
        return <Badge variant="primary" className="text-[10px]">In Progress</Badge>;
      case 'in_review':
        return <Badge variant="warning" className="text-[10px]">In Review</Badge>;
      default:
        return <Badge variant="neutral" className="text-[10px]">{status}</Badge>;
    }
  };

  // Helper to advance/regress stage
  const handleMoveStage = (taskId: string, currentStatus: TaskStatus, direction: 'next' | 'prev', e: React.MouseEvent) => {
    e.stopPropagation();
    const order: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];
    const idx = order.indexOf(currentStatus);
    if (idx === -1) {
      // If currently blocked, moving next goes to in_progress
      updateTaskStatus(taskId, 'in_progress');
      return;
    }
    if (direction === 'next' && idx < order.length - 1) {
      updateTaskStatus(taskId, order[idx + 1]);
    } else if (direction === 'prev' && idx > 0) {
      updateTaskStatus(taskId, order[idx - 1]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <CheckSquare className="w-6 h-6 text-teal-400" />
              Engineering & Delivery Tasks
            </h1>
            <Badge variant="neutral" className="bg-[#12181E] border-[#1E262E] text-slate-300">
              {filteredTasks.length} tasks
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global task board across active projects, sprint workstreams, dependency trees, and blocker resolution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={isMyTasksOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsMyTasksOnly(!isMyTasksOnly)}
            className="text-xs"
          >
            {isMyTasksOnly ? 'Showing: My Tasks' : 'Filter: My Tasks'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-slate-500">Total Work Items</p>
          <p className="text-lg font-bold text-white mt-0.5">{totalCount}</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-teal-400">In Progress</p>
          <p className="text-lg font-bold text-teal-400 mt-0.5">{inProgressCount}</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-rose-400">Blocked Tasks</p>
          <p className="text-lg font-bold text-rose-400 mt-0.5">{blockedCount}</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-amber-400">Overdue Tasks</p>
          <p className="text-lg font-bold text-amber-400 mt-0.5">{overdueCount}</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-emerald-400">Completed</p>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">{doneCount}</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, project, assignee..."
              className="pl-9 w-full text-xs"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Projects' },
                ...projects.map(p => ({ value: p.id, label: p.name }))
              ]}
              className="text-xs"
            />

            <Select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Assignees' },
                ...employees.map(e => ({ value: e.id, label: e.name }))
              ]}
              className="text-xs"
            />

            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              className="text-xs"
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'backlog', label: 'Backlog' },
                { value: 'todo', label: 'Todo' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'in_review', label: 'In Review' },
                { value: 'blocked', label: 'Blocked' },
                { value: 'done', label: 'Done' }
              ]}
              className="text-xs"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-[#1E262E] rounded p-0.5 bg-[#12181E] shrink-0 self-end lg:self-center">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'kanban' ? 'bg-teal-500/20 text-teal-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'list' ? 'bg-teal-500/20 text-teal-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Main Task View: Kanban vs List */}
      {viewMode === 'kanban' ? (
        /* 6-Column Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4 items-start">
          {KANBAN_COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                className="bg-[#0B0F13] border border-[#1E262E] rounded-lg p-2.5 flex flex-col min-w-[200px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E262E]">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      col.id === 'blocked' ? 'bg-rose-500' :
                      col.id === 'done' ? 'bg-emerald-500' :
                      col.id === 'in_progress' ? 'bg-teal-500' :
                      col.id === 'in_review' ? 'bg-amber-500' : 'bg-slate-500'
                    }`} />
                    {col.label}
                  </span>
                  <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-[#12181E] text-slate-400 border border-[#1E262E]">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Tasks Stack */}
                <div className="space-y-2.5 min-h-[300px]">
                  {colTasks.length === 0 ? (
                    <div className="h-24 border border-dashed border-[#1E262E] rounded flex items-center justify-center text-[11px] text-slate-600">
                      Empty column
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const isOverdue = task.status !== 'done' && task.deadline && task.deadline < todayStr;
                      const hasPrerequisites = task.dependencies.length > 0;

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className={`p-3 rounded-lg bg-[#0D1216] border cursor-pointer transition-all hover:bg-[#12181E] group relative ${
                            task.status === 'blocked' 
                              ? 'border-rose-500/50 bg-rose-950/10' 
                              : 'border-[#1E262E] hover:border-teal-500/40'
                          }`}
                        >
                          {/* Priority & Project Tag */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[10px] text-slate-500 truncate max-w-[90px]">
                              {task.projectName}
                            </span>
                            {getPriorityBadge(task.priority)}
                          </div>

                          {/* Title */}
                          <h4 className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors line-clamp-2">
                            {task.title}
                          </h4>

                          {/* Blocker alert snippet */}
                          {task.status === 'blocked' && (
                            <div className="mt-2 p-1.5 bg-rose-500/15 border border-rose-500/30 rounded text-[10px] text-rose-300 flex items-start gap-1">
                              <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{task.blockedReason || 'Blocked'}</span>
                            </div>
                          )}

                          {/* Card Footer */}
                          <div className="mt-3 pt-2 border-t border-[#1E262E] flex items-center justify-between text-[10px] text-slate-400">
                            {/* Assignee */}
                            <div className="flex items-center gap-1.5" title={task.assigneeName}>
                              <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-300">
                                {task.assigneeName.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[65px]">{task.assigneeName.split(' ')[0]}</span>
                            </div>

                            {/* Deadline indicator */}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span className={isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
                                {task.deadline.slice(5)}
                              </span>
                            </div>
                          </div>

                          {/* Quick Stage Shift Trigger Buttons */}
                          <div className="mt-2 pt-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity border-t border-[#1E262E]">
                            <button
                              onClick={(e) => handleMoveStage(task.id, task.status, 'prev', e)}
                              className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5 p-0.5"
                              title="Move Previous"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTaskStatus(task.id, task.status === 'blocked' ? 'in_progress' : 'blocked');
                              }}
                              className={`text-[9px] px-1 py-0.5 rounded border ${
                                task.status === 'blocked' 
                                  ? 'border-teal-500/40 text-teal-300 hover:bg-teal-500/20' 
                                  : 'border-rose-500/40 text-rose-300 hover:bg-rose-500/20'
                              }`}
                            >
                              {task.status === 'blocked' ? 'Unblock' : 'Block'}
                            </button>

                            <button
                              onClick={(e) => handleMoveStage(task.id, task.status, 'next', e)}
                              className="text-[10px] text-slate-500 hover:text-teal-300 flex items-center gap-0.5 p-0.5"
                              title="Advance Next"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Table View */
        <div className="border border-[#1E262E] rounded overflow-hidden bg-[#0D1216]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E262E] bg-[#12181E] text-slate-400 font-medium">
                  <th className="py-3 px-4">Task & Description</th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3">Dependencies</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E262E] text-slate-300">
                {filteredTasks.map(t => {
                  const isOverdue = t.status !== 'done' && t.deadline && t.deadline < todayStr;
                  return (
                    <tr 
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="hover:bg-[#12181E] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                          {t.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate max-w-sm mt-0.5">
                          {t.description}
                        </p>
                      </td>

                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {t.projectName}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-300">
                            {t.assigneeName.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{t.assigneeName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {getPriorityBadge(t.priority)}
                      </td>

                      <td className="py-3 px-3">
                        {getStatusBadge(t.status)}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                          {t.deadline}
                        </span>
                      </td>

                      <td className="py-3 px-3 min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-teal-400 h-full" style={{ width: `${t.progress}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400">{t.progress}%</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        {t.dependencies.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300">
                            {t.dependencies.length} prerequisite(s)
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">None</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-white text-xs p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTaskId(t.id);
                          }}
                        >
                          Details →
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Task 360 Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
};
