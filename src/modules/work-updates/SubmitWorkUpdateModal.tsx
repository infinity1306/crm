import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Plus, Trash2, AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface SubmitWorkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultTaskId?: string;
}

export const SubmitWorkUpdateModal: React.FC<SubmitWorkUpdateModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
  defaultTaskId
}) => {
  const { projects, tasks, currentUser, submitDailyUpdate, updateTaskStatus } = useCRM();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '');
  const [taskId, setTaskId] = useState(defaultTaskId || '');
  const [hoursSpent, setHoursSpent] = useState('7.5');

  // Bullet items
  const [completedItems, setCompletedItems] = useState<string[]>(['']);
  const [inProgressItems, setInProgressItems] = useState<string[]>(['']);
  const [blockedItems, setBlockedItems] = useState<string[]>([]);
  const [blockedReason, setBlockedReason] = useState('');
  const [nextActionItems, setNextActionItems] = useState<string[]>(['']);
  const [error, setError] = useState('');

  const projectTasks = tasks.filter(t => t.projectId === projectId);

  const handleAddItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev => [...prev, '']);
  };

  const handleUpdateItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleRemoveItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError('Please select the delivery project you worked on');
      return;
    }

    const filteredCompleted = completedItems.map(s => s.trim()).filter(Boolean);
    const filteredInProgress = inProgressItems.map(s => s.trim()).filter(Boolean);
    const filteredBlocked = blockedItems.map(s => s.trim()).filter(Boolean);
    const filteredNext = nextActionItems.map(s => s.trim()).filter(Boolean);

    if (filteredCompleted.length === 0 && filteredInProgress.length === 0 && filteredBlocked.length === 0) {
      setError('Please record at least one completed, in-progress, or blocked item');
      return;
    }

    const selectedProject = projects.find(p => p.id === projectId);
    const selectedTask = tasks.find(t => t.id === taskId);

    submitDailyUpdate({
      date,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeAvatar: currentUser.avatar,
      employeeDesignation: currentUser.designation || currentUser.role,
      projectId,
      projectName: selectedProject?.name || 'Project',
      taskId: selectedTask?.id,
      taskTitle: selectedTask?.title,
      completedItems: filteredCompleted,
      inProgressItems: filteredInProgress,
      blockedItems: filteredBlocked,
      blockedReason: filteredBlocked.length > 0 ? (blockedReason.trim() || filteredBlocked[0]) : undefined,
      nextActionItems: filteredNext,
      hoursSpent: Number(hoursSpent) || 0
    });

    // If a task is linked and blocked items were reported, mark task as blocked
    if (selectedTask && filteredBlocked.length > 0) {
      updateTaskStatus(selectedTask.id, 'blocked', blockedReason.trim() || filteredBlocked[0]);
    }

    onClose();
    // Reset form
    setCompletedItems(['']);
    setInProgressItems(['']);
    setBlockedItems([]);
    setBlockedReason('');
    setNextActionItems(['']);
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Daily Work Update (EOD)"
      description="Record what you completed today, active tasks, blockers, and next sprint priorities."
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Date, Project & Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Date *
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Project *
            </label>
            <Select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setTaskId('');
              }}
              options={projects.map(p => ({ value: p.id, label: p.name }))}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Hours Logged
            </label>
            <Input
              type="number"
              step="0.5"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Linked Task */}
        {projectTasks.length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Associated Task (Optional)
            </label>
            <Select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              options={[
                { value: '', label: 'General Project Work (No specific task)' },
                ...projectTasks.map(t => ({ value: t.id, label: `${t.title} [${t.status}]` }))
              ]}
              className="text-xs"
            />
          </div>
        )}

        {/* 1. COMPLETED TODAY */}
        <div className="p-3 bg-[#0D1216] border border-[#1E262E] rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed Today
            </span>
            <button
              type="button"
              onClick={() => handleAddItem(setCompletedItems)}
              className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Add item
            </button>
          </div>

          {completedItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-emerald-500 font-bold">•</span>
              <Input
                value={item}
                onChange={(e) => handleUpdateItem(setCompletedItems, idx, e.target.value)}
                placeholder="e.g. Implemented OAuth2 JWT token verification middleware"
                className="text-xs flex-1"
              />
              {completedItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(setCompletedItems, idx)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 2. IN PROGRESS */}
        <div className="p-3 bg-[#0D1216] border border-[#1E262E] rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              In Progress
            </span>
            <button
              type="button"
              onClick={() => handleAddItem(setInProgressItems)}
              className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Add item
            </button>
          </div>

          {inProgressItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-teal-500 font-bold">•</span>
              <Input
                value={item}
                onChange={(e) => handleUpdateItem(setInProgressItems, idx, e.target.value)}
                placeholder="e.g. Profiling Postgres query plans on high concurrency read loads"
                className="text-xs flex-1"
              />
              {inProgressItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(setInProgressItems, idx)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 3. BLOCKED / IMPEDIMENTS */}
        <div className="p-3 bg-rose-950/10 border border-rose-500/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Blocked Items / Dependencies
            </span>
            <button
              type="button"
              onClick={() => handleAddItem(setBlockedItems)}
              className="text-[11px] text-rose-300 hover:text-rose-200 flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Report blocker
            </button>
          </div>

          {blockedItems.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic">
              No impediments reported. Click "+ Report blocker" if you are stuck or waiting for external inputs.
            </p>
          ) : (
            blockedItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-rose-500 font-bold">•</span>
                <Input
                  value={item}
                  onChange={(e) => handleUpdateItem(setBlockedItems, idx, e.target.value)}
                  placeholder="e.g. Waiting for client sandbox webhook API keys & staging bank certificate"
                  className="text-xs flex-1 border-rose-500/40 text-rose-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(setBlockedItems, idx)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}

          {blockedItems.length > 0 && (
            <div className="mt-2 pt-2 border-t border-rose-500/20">
              <label className="block text-[11px] font-semibold text-rose-300 mb-1">
                Root Cause & What is Required to Unblock?
              </label>
              <Input
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                placeholder="e.g. NextGen IT security needs to provide public signing cert for mTLS sandbox"
                className="text-xs w-full border-rose-500/40"
              />
            </div>
          )}
        </div>

        {/* 4. NEXT ACTIONS */}
        <div className="p-3 bg-[#0D1216] border border-[#1E262E] rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
              Planned for Tomorrow
            </span>
            <button
              type="button"
              onClick={() => handleAddItem(setNextActionItems)}
              className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Add item
            </button>
          </div>

          {nextActionItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">•</span>
              <Input
                value={item}
                onChange={(e) => handleUpdateItem(setNextActionItems, idx, e.target.value)}
                placeholder="e.g. Conduct load test drill on staging cluster"
                className="text-xs flex-1"
              />
              {nextActionItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(setNextActionItems, idx)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E262E]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Record EOD Update
          </Button>
        </div>
      </form>
    </Modal>
  );
};
