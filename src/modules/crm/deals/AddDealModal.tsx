import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { DealStage, LeadSource } from '../../../types/crm';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Briefcase, DollarSign, Calendar, Percent } from 'lucide-react';

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyId?: string;
  onSuccess?: (dealId: string) => void;
}

export const AddDealModal: React.FC<AddDealModalProps> = ({
  isOpen,
  onClose,
  defaultCompanyId,
  onSuccess
}) => {
  const { companies, contacts, employees, currentUser, addDeal, addToast } = useCRM();

  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState(defaultCompanyId || (companies[0]?.id ?? ''));
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [value, setValue] = useState<number>(350000);
  const [stage, setStage] = useState<DealStage>('qualified');
  const [probability, setProbability] = useState<number>(40);
  const [expectedCloseDate, setExpectedCloseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split('T')[0];
  });
  const [source, setSource] = useState<LeadSource>('Referral');
  const [ownerId, setOwnerId] = useState(currentUser?.id || (employees[0]?.id ?? ''));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedCompany = companies.find(c => c.id === companyId);
      const selectedOwner = employees.find(e => e.id === ownerId);
      const linkedContact = contacts.find(c => c.companyId === companyId);

      const deal = addDeal({
        name: name.trim(),
        companyId: companyId,
        companyName: selectedCompany ? selectedCompany.name : 'Independent Client',
        primaryContactId: linkedContact?.id || 'c-1',
        primaryContactName: primaryContactName.trim() || (linkedContact?.name ?? 'Primary Stakeholder'),
        ownerId: ownerId || currentUser.id,
        ownerName: selectedOwner ? selectedOwner.name : 'Senior Rep',
        value: Number(value) || 0,
        currency: '₹',
        stage,
        probability: Number(probability) || 50,
        expectedCloseDate,
        source,
        notes: notes.trim() || undefined
      });

      addToast({
        type: 'success',
        title: 'Deal Created',
        message: `${name} has been added to the sales pipeline.`
      });

      setName('');
      onClose();
      if (onSuccess) {
        onSuccess(deal.id);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Failed to create deal.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const companyOptions = companies.map(c => ({
    value: c.id,
    label: c.name
  }));

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: emp.name
  }));

  const stageOptions: { value: DealStage; label: string }[] = [
    { value: 'new', label: 'New Lead' },
    { value: 'qualified', label: 'Qualified Opportunity' },
    { value: 'proposal', label: 'Proposal Sent' },
    { value: 'negotiation', label: 'In Negotiation' },
    { value: 'won', label: 'Closed Won' },
    { value: 'lost', label: 'Closed Lost' },
  ];

  const sourceOptions: { value: LeadSource; label: string }[] = [
    { value: 'Website', label: 'Website' },
    { value: 'Referral', label: 'Referral' },
    { value: 'LinkedIn', label: 'LinkedIn' },
    { value: 'Email', label: 'Direct Email' },
    { value: 'Cold Call', label: 'Cold Call' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sales Pipeline Deal"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Briefcase className="w-3.5 h-3.5" />}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Add Deal'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <Input
          label="Deal Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Enterprise Blockchain Node Infrastructure"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Target Company"
            value={companyId}
            onChange={e => setCompanyId(e.target.value)}
            options={companyOptions}
          />
          <Input
            label="Primary Stakeholder"
            value={primaryContactName}
            onChange={e => setPrimaryContactName(e.target.value)}
            placeholder="e.g. Vikram Malhotra"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Contract Value (₹ INR)"
            type="number"
            value={value}
            onChange={e => setValue(Number(e.target.value))}
            placeholder="350000"
            required
            leftIcon={<DollarSign className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
          <Select
            label="Pipeline Stage"
            value={stage}
            onChange={e => {
              const stg = e.target.value as DealStage;
              setStage(stg);
              if (stg === 'new') setProbability(15);
              if (stg === 'qualified') setProbability(35);
              if (stg === 'proposal') setProbability(60);
              if (stg === 'negotiation') setProbability(85);
              if (stg === 'won') setProbability(100);
              if (stg === 'lost') setProbability(0);
            }}
            options={stageOptions}
          />
          <Input
            label="Win Probability (%)"
            type="number"
            value={probability}
            onChange={e => setProbability(Number(e.target.value))}
            leftIcon={<Percent className="w-3.5 h-3.5 text-crm-textMuted" />}
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
          <Select
            label="Source"
            value={source}
            onChange={e => setSource(e.target.value as LeadSource)}
            options={sourceOptions}
          />
          <Select
            label="Deal Owner"
            value={ownerId}
            onChange={e => setOwnerId(e.target.value)}
            options={employeeOptions}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-crm-text mb-1">
            Deal Scope & Commercial Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-crm-surface border border-crm-border rounded-md text-xs text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
            placeholder="Contract terms, milestone payment structure, hardware requirements..."
          />
        </div>
      </form>
    </Modal>
  );
};
