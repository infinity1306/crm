import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TaskPriority, TaskStatus } from '../../types/projects';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultMilestoneId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
  defaultMilestoneId
}) => {
  const { projects, milestones, employees, tasks, createTask } = useCRM();

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '');
  const [milestoneId, setMilestoneId] = useState(defaultMilestoneId || '');
  const [assigneeId, setAssigneeId] = useState(employees[0]?.id || '');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [estimatedHours, setEstimatedHours] = useState('16');
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Update milestone choices when project changes
  const projectMilestones = milestones.filter(m => m.projectId === projectId);
  const candidatePrerequisites = tasks.filter(t => t.projectId === projectId);

  useEffect(() => {
    if (defaultProjectId) setProjectId(defaultProjectId);
  }, [defaultProjectId]);

  useEffect(() => {
    if (projectMilestones.length > 0 && !milestoneId) {
      setMilestoneId(projectMilestones[0].id);
    }
  }, [projectId, projectMilestones, milestoneId]);

  const handleToggleDependency = (taskId: string) => {
    setSelectedDependencies(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!projectId) {
      setError('Project selection is required');
      return;
    }

    const selectedProject = projects.find(p => p.id === projectId);
    const selectedMilestone = milestones.find(m => m.id === milestoneId);
    const selectedAssignee = employees.find(e => e.id === assigneeId);

    createTask({
      title: title.trim(),
      description: description.trim() || 'Delivery engineering task.',
      projectId,
      projectName: selectedProject?.name || 'Project',
      milestoneId: selectedMilestone?.id,
      milestoneName: selectedMilestone?.name,
      assigneeId,
      assigneeName: selectedAssignee?.name || 'Assigned Engineer',
      assigneeAvatar: selectedAssignee?.avatar,
      priority,
      status,
      deadline,
      estimatedHours: Number(estimatedHours) || 8,
      actualHours: 0,
      dependencies: selectedDependencies,
      createdBy: 'current_user',
      createdByName: 'Current User'
    });

    onClose();
    setTitle('');
    setDescription('');
    setSelectedDependencies([]);
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Delivery Task"
      description="Define actionable work item, assign owner, and configure task dependencies."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Task Name *
          </label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Build Real-Time Warehouse Inventory Mutex API"
            className="w-full text-xs"
          />
        </div>

        {/* Project & Milestone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Project *
            </label>
            <Select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setMilestoneId('');
                setSelectedDependencies([]);
              }}
              options={projects.map(p => ({ value: p.id, label: p.name }))}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Milestone (Optional)
            </label>
            <Select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              options={[
                { value: '', label: 'General / No Milestone' },
                ...projectMilestones.map(m => ({ value: m.id, label: `${m.name} (${m.moduleName || 'Module'})` }))
              ]}
              className="text-xs"
            />
          </div>
        </div>

        {/* Assignee & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Assignee *
            </label>
            <Select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              options={employees.map(e => ({ value: e.id, label: `${e.name} — ${e.designation}` }))}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Priority *
            </label>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
              className="text-xs"
            />
          </div>
        </div>

        {/* Status, Deadline & Estimate */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Initial Status
            </label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              options={[
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Deadline
            </label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Est. Hours
            </label>
            <Input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Prerequisites / Task Dependencies */}
        {candidatePrerequisites.length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Prerequisite Tasks (Dependencies)
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Select tasks that must be marked Done before this task can proceed.
            </p>
            <div className="max-h-28 overflow-y-auto p-2 bg-[#0D1216] border border-[#1E262E] rounded space-y-1">
              {candidatePrerequisites.map(t => {
                const isSelected = selectedDependencies.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => handleToggleDependency(t.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-xs transition-colors ${
                      isSelected 
                        ? 'bg-teal-500/15 text-teal-300 font-medium' 
                        : 'text-slate-400 hover:bg-[#12181E] hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{t.title}</span>
                    <span className="text-[10px] text-slate-500 ml-2 shrink-0">
                      {isSelected ? '✓ Prerequisite' : `(${t.status})`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Technical Specification & Notes
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Technical implementation details, test criteria, or API endpoint contracts..."
            className="w-full px-3 py-2 bg-[#0D1216] border border-[#1E262E] rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E262E]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
