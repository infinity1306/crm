import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Meeting } from '../../../types/crm';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { CheckCircle2, ArrowRight, Calendar, FileText } from 'lucide-react';

interface MeetingOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
}

export const MeetingOutcomeModal: React.FC<MeetingOutcomeModalProps> = ({
  isOpen,
  onClose,
  meeting
}) => {
  const { recordMeetingOutcome, addToast } = useCRM();

  const [outcome, setOutcome] = useState(meeting.outcome || 'Product demo successfully delivered. Technical team validated smart contract throughput.');
  const [clientResponse, setClientResponse] = useState(meeting.clientResponse || 'Enthusiastic; requested enterprise SLA tier and commercial breakdown.');
  const [nextAction, setNextAction] = useState(meeting.nextAction || 'Prepare and dispatch revised proposal.');
  const [nextFollowUp, setNextFollowUp] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState(meeting.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome.trim()) return;

    setIsSubmitting(true);
    try {
      recordMeetingOutcome(meeting.id, {
        outcome: outcome.trim(),
        clientResponse: clientResponse.trim() || undefined,
        nextAction: nextAction.trim() || undefined,
        nextFollowUp: nextFollowUp || undefined,
        notes: notes.trim() || undefined
      });

      addToast({
        type: 'success',
        title: 'Outcome Recorded',
        message: `Meeting with ${meeting.clientName} marked as completed.`
      });

      onClose();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Failed to record outcome.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Meeting Outcome & Next Actions"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Complete Meeting'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="p-3 rounded bg-crm-surface border border-crm-border/60">
          <div className="font-semibold text-crm-text">{meeting.title}</div>
          <div className="text-[11px] text-crm-textMuted mt-0.5">
            Client: <strong className="text-crm-text">{meeting.clientName}</strong> {meeting.companyName && `(${meeting.companyName})`}
          </div>
        </div>

        <Input
          label="Meeting Outcome / Minutes *"
          value={outcome}
          onChange={e => setOutcome(e.target.value)}
          placeholder="Summary of agreements and discussion points..."
          required
        />

        <Input
          label="Client Sentiment / Stance"
          value={clientResponse}
          onChange={e => setClientResponse(e.target.value)}
          placeholder="e.g. Budget approved; requested security compliance review"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Agreed Next Action"
            value={nextAction}
            onChange={e => setNextAction(e.target.value)}
            placeholder="e.g. Send final SOW"
          />
          <Input
            label="Next Scheduled Checkpoint"
            type="date"
            value={nextFollowUp}
            onChange={e => setNextFollowUp(e.target.value)}
            leftIcon={<Calendar className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-crm-text mb-1">
            Internal Meeting Notes (Confidential)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-crm-surface border border-crm-border rounded-md text-xs text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
            placeholder="Key decision makers, internal team feedback..."
          />
        </div>
      </form>
    </Modal>
  );
};
