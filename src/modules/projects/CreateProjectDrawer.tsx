import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ProjectPriority } from '../../types/projects';
import { FolderKanban, Users, Calendar, AlertCircle } from 'lucide-react';

interface CreateProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectDrawer: React.FC<CreateProjectDrawerProps> = ({ isOpen, onClose }) => {
  const { companies, employees, createProject, deals } = useCRM();

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState(companies[0]?.id || '');
  const [managerId, setManagerId] = useState(employees[0]?.id || '');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([employees[0]?.id || '']);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [budget, setBudget] = useState('2500000');
  const [priority, setPriority] = useState<ProjectPriority>('high');
  const [template, setTemplate] = useState('Enterprise Web Application');
  const [tagsInput, setTagsInput] = useState('Enterprise, Delivery');
  const [dealId, setDealId] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleToggleTeamMember = (empId: string) => {
    setSelectedTeamIds(prev => 
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Project name is required';
    if (!clientId) newErrors.clientId = 'Client selection is required';
    if (!managerId) newErrors.managerId = 'Project Manager is required';
    if (selectedTeamIds.length === 0) newErrors.team = 'At least one team member must be assigned';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedClient = companies.find(c => c.id === clientId);
    const selectedManager = employees.find(e => e.id === managerId);
    const assignedTeamMembers = employees
      .filter(e => selectedTeamIds.includes(e.id))
      .map(e => ({
        id: e.id,
        name: e.name,
        role: e.designation || e.role,
        department: e.department,
        avatar: e.avatar
      }));

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    createProject({
      name: name.trim(),
      clientId,
      clientName: selectedClient?.name || 'Enterprise Client',
      managerId,
      managerName: selectedManager?.name || 'Project Manager',
      managerAvatar: selectedManager?.avatar,
      teamIds: selectedTeamIds,
      teamMembers: assignedTeamMembers,
      description: description.trim() || 'Internal delivery project.',
      status: 'active',
      health: 'on_track',
      startDate,
      deadline,
      budget: Number(budget) || 0,
      priority,
      tags,
      template,
      dealId: dealId || undefined
    });

    onClose();
    // Reset form
    setName('');
    setDescription('');
    setErrors({});
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Delivery Project"
      subtitle="Initialize delivery workflow, assign team members, and set milestone targets."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Project Title *
          </label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Omnichannel Supply Chain & Inventory Portal"
            className="w-full"
          />
          {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
        </div>

        {/* Client & Originating Deal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Client Account *
            </label>
            <Select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              options={companies.map(c => ({ value: c.id, label: `${c.name} (${c.industry})` }))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Originating Deal (Optional)
            </label>
            <Select
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              options={[
                { value: '', label: 'None (Direct Project Creation)' },
                ...deals.map(d => ({ value: d.id, label: `${d.name} (₹${(d.value / 100000).toFixed(1)}L)` }))
              ]}
              className="w-full"
            />
          </div>
        </div>

        {/* Project Manager & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Project Manager (PM) *
            </label>
            <Select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              options={employees.map(e => ({ value: e.id, label: `${e.name} — ${e.designation}` }))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Delivery Priority *
            </label>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ProjectPriority)}
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' },
                { value: 'critical', label: 'Critical / Executive Attention' },
              ]}
              className="w-full"
            />
          </div>
        </div>

        {/* Start Date, Deadline & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Delivery Deadline *
            </label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Budget (INR ₹)
            </label>
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="2500000"
              className="w-full"
            />
          </div>
        </div>

        {/* Team Members Multi-Select */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Assign Team Members *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-[#0D1216] border border-[#1E262E] rounded">
            {employees.map(emp => {
              const isSelected = selectedTeamIds.includes(emp.id);
              return (
                <button
                  type="button"
                  key={emp.id}
                  onClick={() => handleToggleTeamMember(emp.id)}
                  className={`flex items-center justify-between p-2 rounded text-left transition-colors border ${
                    isSelected 
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-300' 
                      : 'bg-[#12181E] border-[#1E262E] text-slate-300 hover:bg-[#161F28]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium truncate">{emp.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{emp.designation}</p>
                    </div>
                  </div>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] shrink-0 ${
                    isSelected ? 'border-teal-400 bg-teal-400 text-black font-bold' : 'border-slate-600'
                  }`}>
                    {isSelected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.team && <p className="text-xs text-rose-400 mt-1">{errors.team}</p>}
        </div>

        {/* Architecture Template & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Project Architecture Template
            </label>
            <Select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              options={[
                { value: 'Enterprise Web Application', label: 'Enterprise Web Application' },
                { value: 'High-Concurrency API Mesh', label: 'High-Concurrency API Mesh' },
                { value: 'Regulated Data Vault', label: 'Regulated Data Vault (HIPAA / DISHA)' },
                { value: 'Cloud Platform Architecture', label: 'Cloud Platform Infrastructure' },
                { value: 'Custom Architecture', label: 'Custom Scope / Greenfield' }
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Tags (comma-separated)
            </label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Enterprise, React, Node.js, SAP"
              className="w-full"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Scope & Objectives Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Outline deliverables, primary architecture components, and key client milestones..."
            className="w-full px-3 py-2 bg-[#0D1216] border border-[#1E262E] rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-[#12181E] border border-[#1E262E] rounded flex items-start gap-2.5 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p>
            Creating this project will register the delivery scope, assign the Project Manager, notify assigned engineers, and seed the initial Milestones and Tasks hierarchy.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E262E]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Initiate Project Delivery
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
