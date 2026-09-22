import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  InternalTicketPriority, 
  InternalTicketType 
} from '../../types/projects';
import { LifeBuoy, AlertTriangle } from 'lucide-react';

interface RaiseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultTaskId?: string;
  isOperationalQuery?: boolean;
}

export const RaiseTicketModal: React.FC<RaiseTicketModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
  defaultTaskId,
  isOperationalQuery = false
}) => {
  const { projects, milestones, tasks, employees, currentUser, createTicket } = useCRM();

  const [title, setTitle] = useState(isOperationalQuery ? 'Payment API ka current status kya hai?' : '');
  const [type, setType] = useState<InternalTicketType>(isOperationalQuery ? 'operational_query' : 'technical');
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '');
  const [milestoneId, setMilestoneId] = useState('');
  const [taskId, setTaskId] = useState(defaultTaskId || '');
  const [assignedToId, setAssignedToId] = useState(employees[0]?.id || '');
  const [priority, setPriority] = useState<InternalTicketPriority>(isOperationalQuery ? 'high' : 'medium');
  const [description, setDescription] = useState(
    isOperationalQuery 
      ? 'Management operational inquiry requesting structured progress percentage, deliverables completed, and production deployment ETA.' 
      : ''
  );
  const [error, setError] = useState('');

  const projectMilestones = milestones.filter(m => m.projectId === projectId);
  const projectTasks = tasks.filter(t => t.projectId === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Ticket title is required');
      return;
    }
    if (!projectId) {
      setError('Project selection is required');
      return;
    }

    const selectedProject = projects.find(p => p.id === projectId);
    const selectedMilestone = milestones.find(m => m.id === milestoneId);
    const selectedTask = tasks.find(t => t.id === taskId);
    const selectedAssignee = employees.find(e => e.id === assignedToId);

    createTicket({
      title: title.trim(),
      description: description.trim() || 'Internal ticket request.',
      projectId,
      projectName: selectedProject?.name || 'Project',
      milestoneId: selectedMilestone?.id,
      milestoneName: selectedMilestone?.name,
      taskId: selectedTask?.id,
      taskTitle: selectedTask?.title,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdByAvatar: currentUser.avatar,
      assignedToId,
      assignedToName: selectedAssignee?.name || 'Assigned Lead',
      assignedToAvatar: selectedAssignee?.avatar,
      priority,
      status: 'assigned',
      type,
      initialMessage: description.trim()
    });

    onClose();
    setTitle('');
    setDescription('');
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isOperationalQuery ? 'Raise Admin Operational Status Inquiry' : 'Raise Internal Ticket'}
      description="Tickets connect directly to delivery projects, milestones, tasks, and engineers."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Ticket Title / Inquiry *
          </label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            placeholder={isOperationalQuery ? "e.g. Payment API ka current status kya hai?" : "e.g. Payment callback failing during staging webhook load"}
            className="w-full text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Category Type *
            </label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as InternalTicketType)}
              options={[
                { value: 'technical', label: 'Technical Issue / Bug' },
                { value: 'operational_query', label: 'Admin Status Query' },
                { value: 'client_issue', label: 'Client Escalation' },
                { value: 'internal', label: 'Internal Operations' },
                { value: 'bug', label: 'Critical Defect' }
              ]}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Severity / Priority *
            </label>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as InternalTicketPriority)}
              options={[
                { value: 'critical', label: 'Critical (Blocker)' },
                { value: 'high', label: 'High Priority' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              className="text-xs"
            />
          </div>
        </div>

        {/* Project & Assignee */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Associated Project *
            </label>
            <Select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setMilestoneId('');
                setTaskId('');
              }}
              options={projects.map(p => ({ value: p.id, label: p.name }))}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Assignee / Owner *
            </label>
            <Select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              options={employees.map(e => ({ value: e.id, label: `${e.name} (${e.designation})` }))}
              className="text-xs"
            />
          </div>
        </div>

        {/* Linked Milestone & Task */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Linked Milestone (Optional)
            </label>
            <Select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              options={[
                { value: '', label: 'General / No Milestone' },
                ...projectMilestones.map(m => ({ value: m.id, label: m.name }))
              ]}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Linked Task (Optional)
            </label>
            <Select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              options={[
                { value: '', label: 'General / No Task' },
                ...projectTasks.map(t => ({ value: t.id, label: t.title }))
              ]}
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Description & Context
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Explain the technical issue or the specific questions management needs addressed..."
            className="w-full px-3 py-2 bg-[#0D1216] border border-[#1E262E] rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E262E]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {isOperationalQuery ? 'Send Status Inquiry' : 'Raise Ticket'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
