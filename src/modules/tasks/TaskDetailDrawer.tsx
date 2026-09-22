import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Task, TaskPriority, TaskStatus } from '../../types/projects';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { 
  CheckSquare, 
  AlertTriangle, 
  Clock, 
  User, 
  FolderKanban, 
  Target, 
  Send, 
  Paperclip, 
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  MessageSquare,
  History,
  Link2
} from 'lucide-react';

interface TaskDetailDrawerProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRaiseTicket?: (task: Task) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  taskId,
  isOpen,
  onClose,
  onRaiseTicket
}) => {
  const { 
    tasks, 
    employees, 
    updateTask, 
    updateTaskStatus, 
    addTaskComment, 
    currentUser,
    navigateTo 
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'dependencies'>('details');
  const [commentInput, setCommentInput] = useState('');
  const [blockerInput, setBlockerInput] = useState('');
  const [showBlockerPrompt, setShowBlockerPrompt] = useState(false);

  const task = tasks.find(t => t.id === taskId);

  if (!task) return null;

  // Prerequisite tasks
  const prerequisiteTasks = tasks.filter(t => task.dependencies.includes(t.id));
  const hasUnfinishedPrerequisites = prerequisiteTasks.some(t => t.status !== 'done');
  
  // Dependent tasks (tasks waiting for this task)
  const dependentTasks = tasks.filter(t => t.dependencies.includes(task.id));

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === 'blocked') {
      setShowBlockerPrompt(true);
    } else {
      setShowBlockerPrompt(false);
      updateTaskStatus(task.id, newStatus);
    }
  };

  const handleConfirmBlocker = () => {
    if (!blockerInput.trim()) return;
    updateTaskStatus(task.id, 'blocked', blockerInput.trim());
    setShowBlockerPrompt(false);
    setBlockerInput('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addTaskComment(task.id, commentInput.trim());
    setCommentInput('');
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="error">Critical</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="primary">Medium</Badge>;
      case 'low':
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return <Badge variant="success">Done</Badge>;
      case 'blocked':
        return <Badge variant="error" className="animate-pulse">Blocked</Badge>;
      case 'in_progress':
        return <Badge variant="primary">In Progress</Badge>;
      case 'in_review':
        return <Badge variant="warning">In Review</Badge>;
      case 'todo':
        return <Badge variant="neutral">Todo</Badge>;
      case 'backlog':
        return <Badge variant="neutral">Backlog</Badge>;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      subtitle={`${task.projectName} • ${task.milestoneName || 'General Milestone'}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Blocker Alert Banner */}
        {task.status === 'blocked' && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Active Workstream Blocker</p>
                <p className="mt-1 text-rose-300/90 leading-relaxed">
                  {task.blockedReason || 'Prerequisites or external credentials pending.'}
                </p>
                {task.blockedAt && (
                  <p className="text-[10px] text-rose-400/80 mt-1">Blocked since: {task.blockedAt}</p>
                )}
                <div className="flex items-center gap-2 mt-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[11px] py-1 border-rose-500/40 text-rose-200 hover:bg-rose-500/20"
                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                  >
                    Resolve & Resume
                  </Button>
                  {onRaiseTicket && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-[11px] py-1 bg-rose-600 hover:bg-rose-500 text-white"
                      onClick={() => onRaiseTicket(task)}
                    >
                      Escalate to Internal Ticket
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prompt to enter blocker reason if user selected 'blocked' */}
        {showBlockerPrompt && (
          <div className="p-3.5 bg-[#161F28] border border-amber-500/40 rounded-lg space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Specify Blocker Reason & Dependency
            </div>
            <Input
              value={blockerInput}
              onChange={(e) => setBlockerInput(e.target.value)}
              placeholder="e.g. Waiting for client sandbox webhook API keys & staging bank certificate..."
              className="text-xs w-full"
            />
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowBlockerPrompt(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleConfirmBlocker}>
                Confirm Blocker
              </Button>
            </div>
          </div>
        )}

        {/* Prerequisite warning */}
        {hasUnfinishedPrerequisites && task.status !== 'done' && task.status !== 'blocked' && (
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Prerequisite tasks are incomplete. Advancing this task may cause delivery friction.</span>
          </div>
        )}

        {/* Status & Priority Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-[#0D1216] border border-[#1E262E] rounded-lg">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Status</p>
            <Select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              options={[
                { value: 'backlog', label: 'Backlog' },
                { value: 'todo', label: 'Todo' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'in_review', label: 'In Review' },
                { value: 'blocked', label: 'Blocked' },
                { value: 'done', label: 'Done' }
              ]}
              className="text-xs h-7 py-0"
            />
          </div>

          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Priority</p>
            <Select
              value={task.priority}
              onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' }
              ]}
              className="text-xs h-7 py-0"
            />
          </div>

          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Assignee</p>
            <Select
              value={task.assigneeId}
              onChange={(e) => {
                const emp = employees.find(emp => emp.id === e.target.value);
                updateTask(task.id, { 
                  assigneeId: e.target.value, 
                  assigneeName: emp?.name || 'Engineer',
                  assigneeAvatar: emp?.avatar
                });
              }}
              options={employees.map(e => ({ value: e.id, label: e.name }))}
              className="text-xs h-7 py-0"
            />
          </div>

          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Deadline</p>
            <Input
              type="date"
              value={task.deadline}
              onChange={(e) => updateTask(task.id, { deadline: e.target.value })}
              className="text-xs h-7 py-0"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1E262E] text-xs">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'details' 
                ? 'border-teal-400 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Specification & Context
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'comments' 
                ? 'border-teal-400 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Discussion ({task.commentsCount || task.comments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('dependencies')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'dependencies' 
                ? 'border-teal-400 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Dependencies ({prerequisiteTasks.length + dependentTasks.length})
          </button>
        </div>

        {/* Tab 1: Details & Context */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Description & Acceptance Criteria
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed p-3 bg-[#0D1216] border border-[#1E262E] rounded">
                {task.description || 'No detailed technical specification provided.'}
              </p>
            </div>

            {/* Progress & Effort */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#0D1216] border border-[#1E262E] rounded text-xs">
              <div>
                <p className="text-slate-500">Effort Tracking</p>
                <p className="text-white font-medium mt-0.5">
                  {task.actualHours || 0} hrs actual / {task.estimatedHours || 0} hrs estimated
                </p>
              </div>

              <div>
                <p className="text-slate-500">Progress Completion</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-400 h-full rounded-full" 
                      style={{ width: `${task.progress}%` }} 
                    />
                  </div>
                  <span className="font-semibold text-white text-[11px]">{task.progress}%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Created on {task.createdAt} by {task.createdByName || 'Team Lead'}
              </span>

              {task.status !== 'done' ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => updateTaskStatus(task.id, 'done')}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Mark Complete
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateTaskStatus(task.id, 'in_progress')}
                >
                  Reopen Task
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Comments / Internal Discussion */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(!task.comments || task.comments.length === 0) ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No internal comments yet. Start the discussion below.
                </div>
              ) : (
                task.comments.map(c => (
                  <div key={c.id} className="p-2.5 bg-[#0D1216] border border-[#1E262E] rounded text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-teal-400">{c.authorName}</span>
                      <span className="text-slate-500">{c.createdAt}</span>
                    </div>
                    <p className="text-slate-300">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write an internal comment or status query..."
                className="text-xs flex-1"
              />
              <Button type="submit" size="sm" variant="primary" icon={<Send className="w-3 h-3" />}>
                Post
              </Button>
            </form>
          </div>
        )}

        {/* Tab 3: Task Dependencies */}
        {activeTab === 'dependencies' && (
          <div className="space-y-4 text-xs">
            {/* Prerequisites */}
            <div>
              <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                Prerequisites (Must be completed first)
              </h4>
              {prerequisiteTasks.length === 0 ? (
                <p className="text-slate-500 italic p-2 bg-[#0D1216] border border-[#1E262E] rounded">
                  No prerequisite dependencies configured.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {prerequisiteTasks.map(p => (
                    <div 
                      key={p.id}
                      className="p-2.5 bg-[#0D1216] border border-[#1E262E] rounded flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{p.title}</p>
                        <p className="text-[10px] text-slate-500">Assigned to {p.assigneeName}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.status === 'done' ? (
                          <Badge variant="success" className="text-[10px]">✓ Done</Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px]">{p.status}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blocking */}
            <div>
              <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                Blocks (Waiting for this task to finish)
              </h4>
              {dependentTasks.length === 0 ? (
                <p className="text-slate-500 italic p-2 bg-[#0D1216] border border-[#1E262E] rounded">
                  No downstream tasks waiting on this work item.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {dependentTasks.map(d => (
                    <div 
                      key={d.id}
                      className="p-2.5 bg-[#0D1216] border border-[#1E262E] rounded flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{d.title}</p>
                        <p className="text-[10px] text-slate-500">Assigned to {d.assigneeName}</p>
                      </div>
                      <Badge variant="neutral" className="text-[10px]">{d.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
