import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { ContactStatus } from '../../../types/crm';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { UserPlus, Building2, Mail, Phone, Briefcase } from 'lucide-react';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyId?: string;
  onSuccess?: (contactId: string) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  defaultCompanyId,
  onSuccess
}) => {
  const { companies, employees, currentUser, addContact, addToast } = useCRM();

  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState(defaultCompanyId || (companies[0]?.id ?? ''));
  const [role, setRole] = useState('Director / Head of Tech');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerId, setOwnerId] = useState(currentUser?.id || (employees[0]?.id ?? ''));
  const [status, setStatus] = useState<ContactStatus>('customer');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedCompany = companies.find(c => c.id === companyId);
      const selectedOwner = employees.find(e => e.id === ownerId);

      const contact = addContact({
        name: name.trim(),
        companyId: companyId,
        companyName: selectedCompany ? selectedCompany.name : 'Independent Client',
        role: role.trim(),
        email: email.trim(),
        phone: phone.trim(),
        ownerId: ownerId || currentUser.id,
        ownerName: selectedOwner ? selectedOwner.name : 'Account Executive',
        status,
        notes: notes.trim() || undefined
      });

      addToast({
        type: 'success',
        title: 'Contact Created',
        message: `${name} has been added to stakeholder contacts.`
      });

      setName('');
      setEmail('');
      setPhone('');
      onClose();
      if (onSuccess) {
        onSuccess(contact.id);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Failed to create contact.' });
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

  const statusOptions: { value: ContactStatus; label: string }[] = [
    { value: 'customer', label: 'Active Customer Stakeholder' },
    { value: 'active', label: 'Active Contact' },
    { value: 'lead', label: 'Lead Contact' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Contact Person"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Contact'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <Input
          label="Full Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Vikram Malhotra"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Associated Company"
            value={companyId}
            onChange={e => setCompanyId(e.target.value)}
            options={companyOptions}
          />
          <Input
            label="Title / Role"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. VP of Engineering"
            leftIcon={<Briefcase className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vikram@enterprise.com"
            leftIcon={<Mail className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            leftIcon={<Phone className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assigned Account Owner"
            value={ownerId}
            onChange={e => setOwnerId(e.target.value)}
            options={employeeOptions}
          />
          <Select
            label="Status"
            value={status}
            onChange={e => setStatus(e.target.value as ContactStatus)}
            options={statusOptions}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-crm-text mb-1">
            Notes / Stakeholder Context
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-crm-surface border border-crm-border rounded-md text-xs text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
            placeholder="Sign-off authority, communications preference, tech background..."
          />
        </div>
      </form>
    </Modal>
  );
};
