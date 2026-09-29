import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { LeadSource, LeadPriority, LeadStage } from '../../../types/crm';
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { UserPlus, Calendar, Clock, IndianRupee, Building, Mail, Phone, Tag } from 'lucide-react';

interface AddLeadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (leadId: string) => void;
}

export const AddLeadDrawer: React.FC<AddLeadDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { employees, currentUser, addLead, addToast } = useCRM();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<LeadSource>('Website');
  const [requirement, setRequirement] = useState('');
  const [budget, setBudget] = useState<number>(150000);
  const [value, setValue] = useState<number>(150000);
  const [ownerId, setOwnerId] = useState(currentUser?.id || (employees[0]?.id ?? ''));
  const [priority, setPriority] = useState<LeadPriority>('medium');
  const [stage, setStage] = useState<LeadStage>('new');
  const [expectedCloseDate, setExpectedCloseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [nextFollowUpDate, setNextFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [nextFollowUpTime, setNextFollowUpTime] = useState('11:00 AM');
  const [tagInput, setTagInput] = useState('Enterprise, Web3');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast({ type: 'warning', title: 'Name Required', message: 'Please provide lead contact name.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedOwner = employees.find(emp => emp.id === ownerId);
      const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);

      const newLead = addLead({
        name: name.trim(),
        companyName: companyName.trim() || 'Undisclosed Corp',
        email: email.trim(),
        phone: phone.trim(),
        source,
        requirement: requirement.trim(),
        budget: Number(budget) || 0,
        currency: '₹',
        ownerId: ownerId || currentUser.id,
        ownerName: selectedOwner ? selectedOwner.name : 'Assigned Rep',
        priority,
        stage,
        value: Number(value) || Number(budget) || 0,
        expectedCloseDate,
        nextFollowUpDate: nextFollowUpDate || undefined,
        nextFollowUpTime: nextFollowUpTime || undefined,
        tags,
        notes: notes.trim() || undefined
      });

      addToast({
        type: 'success',
        title: 'Lead Captured',
        message: `${name} has been added to CRM leads.`
      });

      // Reset form
      setName('');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setRequirement('');
      setNotes('');
      onClose();

      if (onSuccess) {
        onSuccess(newLead.id);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Failed to add lead.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sourceOptions: { value: LeadSource; label: string }[] = [
    { value: 'Website', label: 'Website (Direct Inbound)' },
    { value: 'Referral', label: 'Partner Referral' },
    { value: 'LinkedIn', label: 'LinkedIn Outreach' },
    { value: 'Instagram', label: 'Instagram / Social' },
    { value: 'Email', label: 'Direct Email' },
    { value: 'Cold Call', label: 'Cold Call Inbound' },
    { value: 'Advertisement', label: 'Sponsored Ads' },
    { value: 'Other', label: 'Other' },
  ];

  const priorityOptions: { value: LeadPriority; label: string }[] = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const stageOptions: { value: LeadStage; label: string }[] = [
    { value: 'new', label: 'New Lead' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal Sent' },
    { value: 'negotiation', label: 'Negotiation' },
  ];

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.designation})`
  }));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Lead"
      subtitle="Register inbound inquiry or outbound sales discovery prospect"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Add Lead to CRM'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Contact & Company Details */}
        <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-turquoise" />
            <span>Contact & Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name *"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Vikram Malhotra"
              required
            />
            <Input
              label="Company Name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="e.g. Nexus Tech Ltd"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vikram@nexus.io"
              leftIcon={<Mail className="w-3.5 h-3.5 text-crm-textMuted" />}
            />
            <Input
              label="Phone / Mobile"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              leftIcon={<Phone className="w-3.5 h-3.5 text-crm-textMuted" />}
            />
          </div>
        </div>

        {/* Lead Classification */}
        <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-turquoise" />
            <span>Classification & Assignment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Lead Source"
              value={source}
              onChange={e => setSource(e.target.value as LeadSource)}
              options={sourceOptions}
            />
            <Select
              label="Initial Stage"
              value={stage}
              onChange={e => setStage(e.target.value as LeadStage)}
              options={stageOptions}
            />
            <Select
              label="Priority"
              value={priority}
              onChange={e => setPriority(e.target.value as LeadPriority)}
              options={priorityOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Assigned Rep / Owner"
              value={ownerId}
              onChange={e => setOwnerId(e.target.value)}
              options={employeeOptions}
            />
            <Input
              label="Tags (Comma separated)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="Enterprise, High-Touch, Q3"
            />
          </div>
        </div>

        {/* Financials & Timeline */}
        <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-turquoise" />
            <span>Financials & Follow-up Scheduling</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Client Budget (₹ INR)"
              type="number"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              placeholder="150000"
            />
            <Input
              label="Estimated Deal Value (₹ INR)"
              type="number"
              value={value}
              onChange={e => setValue(Number(e.target.value))}
              placeholder="150000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Expected Close Date"
              type="date"
              value={expectedCloseDate}
              onChange={e => setExpectedCloseDate(e.target.value)}
              leftIcon={<Calendar className="w-3.5 h-3.5 text-crm-textMuted" />}
            />
            <Input
              label="Next Follow-up Date"
              type="date"
              value={nextFollowUpDate}
              onChange={e => setNextFollowUpDate(e.target.value)}
              leftIcon={<Calendar className="w-3.5 h-3.5 text-crm-textMuted" />}
            />
            <Input
              label="Follow-up Slot"
              value={nextFollowUpTime}
              onChange={e => setNextFollowUpTime(e.target.value)}
              placeholder="11:00 AM"
              leftIcon={<Clock className="w-3.5 h-3.5 text-crm-textMuted" />}
            />
          </div>
        </div>

        {/* Requirements & Notes */}
        <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border space-y-3">
          <label className="block text-xs font-medium text-crm-text">
            Client Requirements & Scope Brief
          </label>
          <textarea
            value={requirement}
            onChange={e => setRequirement(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-crm-bg border border-crm-border rounded-md text-xs text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise transition-colors"
            placeholder="Key client deliverables, infrastructure requirements, security compliance prerequisites..."
          />

          <label className="block text-xs font-medium text-crm-text pt-2 border-t border-crm-border/40">
            Internal Discovery Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-crm-bg border border-crm-border rounded-md text-xs text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise transition-colors"
            placeholder="Initial contact observations, gatekeeper notes, decision-maker timeline..."
          />
        </div>
      </form>
    </Drawer>
  );
};
