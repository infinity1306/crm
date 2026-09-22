import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { CRMActivityType } from '../../../types/crm';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Phone, Mail, Calendar, CheckSquare, FileText, Clock } from 'lucide-react';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  defaultClientName?: string;
}

export const LogActivityModal: React.FC<LogActivityModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
  defaultClientName
}) => {
  const { leads, companies, currentUser, addToast } = useCRM();

  const [type, setType] = useState<CRMActivityType>('call');
  const [clientName, setClientName] = useState(defaultClientName || (leads[0]?.name ?? ''));
  const [duration, setDuration] = useState('20 mins');
  const [outcome, setOutcome] = useState('Product demo delivered. Client requested commercial proposal.');
  const [nextAction, setNextAction] = useState('Send formal pricing schedule by Thursday');
  const [nextFollowUp, setNextFollowUp] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      addToast({
        type: 'success',
        title: 'Activity Logged',
        message: `${type.toUpperCase()} with ${clientName} recorded in CRM activity stream.`
      });

      onClose();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Failed to log activity.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityTypes: { value: CRMActivityType; label: string }[] = [
    { value: 'call', label: 'Phone / Conference Call' },
    { value: 'email', label: 'Outbound / Inbound Email' },
    { value: 'meeting', label: 'Live Video / Offline Sync' },
    { value: 'followup', label: 'Milestone Follow-up' },
    { value: 'note', label: 'Internal Account Note' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Sales Activity & Client Touchpoint"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging...' : 'Save Activity Record'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Activity Type"
            value={type}
            onChange={e => setType(e.target.value as CRMActivityType)}
            options={activityTypes}
          />
          <Input
            label="Client / Lead Name"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="e.g. Vikram Malhotra"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Call / Meeting Duration"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="e.g. 25 mins"
            leftIcon={<Clock className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
          <Input
            label="Next Follow-up Date"
            type="date"
            value={nextFollowUp}
            onChange={e => setNextFollowUp(e.target.value)}
            leftIcon={<Calendar className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
        </div>

        <Input
          label="Outcome Summary *"
          value={outcome}
          onChange={e => setOutcome(e.target.value)}
          placeholder="What was agreed or accomplished during this interaction?"
          required
        />

        <Input
          label="Agreed Next Action"
          value={nextAction}
          onChange={e => setNextAction(e.target.value)}
          placeholder="e.g. Send security audit whitepaper and NDA"
        />

        <div>
          <label className="block text-xs font-medium text-crm-text mb-1">
            Detailed Meeting / Call Transcript & Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-crm-surface border border-crm-border rounded-md text-xs text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
            placeholder="Technical topics discussed, objections raised, key decision-makers present..."
          />
        </div>
      </form>
    </Modal>
  );
};
