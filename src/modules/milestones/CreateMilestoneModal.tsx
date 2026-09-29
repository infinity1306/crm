import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MilestoneStatus } from '../../types/projects';

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName
}) => {
  const { employees, createMilestone } = useCRM();

  const [name, setName] = useState('');
  const [moduleName, setModuleName] = useState('Backend');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState(employees[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<MilestoneStatus>('upcoming');
  const [order, setOrder] = useState('1');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Milestone name is required');
      return;
    }

    const selectedOwner = employees.find(e => e.id === ownerId);

    createMilestone({
      projectId,
      projectName,
      name: name.trim(),
      moduleName,
      description: description.trim(),
      ownerId,
      ownerName: selectedOwner?.name || 'Assigned Lead',
      startDate,
      deadline,
      status,
      order: Number(order) || 1
    });

    onClose();
    setName('');
    setDescription('');
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Define Project Milestone"
      description={`Add a delivery milestone target to ${projectName}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Milestone Name *
          </label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Core API & High-Velocity Mutex Engine"
            className="w-full text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Module / Workstream
            </label>
            <Select
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              options={[
                { value: 'Architecture', label: 'Architecture & Blueprint' },
                { value: 'Authentication', label: 'Auth & SSO Federation' },
                { value: 'Backend', label: 'Core Backend APIs' },
                { value: 'Frontend', label: 'Frontend Interface' },
                { value: 'Integration', label: '3rd-Party Integrations' },
                { value: 'Testing', label: 'QA, Security & UAT' },
                { value: 'Deployment', label: 'Production Cutover' }
              ]}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Milestone Lead *
            </label>
            <Select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              options={employees.map(e => ({ value: e.id, label: `${e.name} (${e.designation})` }))}
              className="text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Deadline Target *
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
              Status
            </label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
              options={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'delayed', label: 'Delayed' },
              ]}
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Description & Acceptance Scope
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Define deliverables required to achieve this milestone sign-off..."
            className="w-full px-3 py-2 bg-[#0D1216] border border-[#1E262E] rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E262E]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Milestone
          </Button>
        </div>
      </form>
    </Modal>
  );
};
