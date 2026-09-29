import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Building2, Globe, MapPin, Users, Mail, Phone } from 'lucide-react';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (companyId: string) => void;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { employees, currentUser, addCompany, addToast } = useCRM();

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Fintech / Blockchain Infrastructure');
  const [website, setWebsite] = useState('https://');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [ownerId, setOwnerId] = useState(currentUser?.id || (employees[0]?.id ?? ''));
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [employeeRange, setEmployeeRange] = useState('50-200 employees');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedOwner = employees.find(e => e.id === ownerId);

      const company = addCompany({
        name: name.trim(),
        industry: industry.trim(),
        website: website.trim(),
        primaryContactId: 'c-' + Date.now(),
        primaryContactName: primaryContactName.trim() || 'Principal Stakeholder',
        ownerId: ownerId || currentUser.id,
        ownerName: selectedOwner ? selectedOwner.name : 'Enterprise Lead',
        currency: '₹',
        location: location.trim(),
        employeeRange: employeeRange.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined
      });

      addToast({
        type: 'success',
        title: 'Company Added',
        message: `${name} has been enrolled into accounts registry.`
      });

      setName('');
      onClose();
      if (onSuccess) {
        onSuccess(company.id);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Failed to create company.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: emp.name
  }));

  const industries = [
    'Fintech / Banking Infrastructure',
    'Blockchain / Web3 Infrastructure',
    'AI / Machine Learning Services',
    'Enterprise SaaS / Cloud',
    'Cybersecurity & Auditing',
    'Healthcare & Diagnostics',
    'E-commerce & Logistics',
    'Other'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enroll New Client / Enterprise Company"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Building2 className="w-3.5 h-3.5" />}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Company'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <Input
          label="Company Registered Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Acme FinTech Technologies Pvt Ltd"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">Industry Sector</label>
            <select
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-crm-surface border border-crm-border rounded text-xs text-crm-text focus:outline-none focus:border-turquoise"
            >
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <Input
            label="Website URL"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            placeholder="https://acme.io"
            leftIcon={<Globe className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Key Stakeholder Contact"
            value={primaryContactName}
            onChange={e => setPrimaryContactName(e.target.value)}
            placeholder="e.g. Vikram Malhotra"
          />
          <Select
            label="Assigned Account Manager"
            value={ownerId}
            onChange={e => setOwnerId(e.target.value)}
            options={employeeOptions}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Headquarters Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Mumbai, Maharashtra"
            leftIcon={<MapPin className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
          <Input
            label="Company Size Range"
            value={employeeRange}
            onChange={e => setEmployeeRange(e.target.value)}
            placeholder="e.g. 100-500 employees"
            leftIcon={<Users className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Official Contact Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="partnerships@acme.io"
            leftIcon={<Mail className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
          <Input
            label="Corporate Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+91 22 6123 4567"
            leftIcon={<Phone className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-crm-text mb-1">
            Account Strategy / Executive Summary
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-crm-surface border border-crm-border rounded-md text-xs text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
            placeholder="Key initiatives, strategic value, architecture requirements..."
          />
        </div>
      </form>
    </Modal>
  );
};
