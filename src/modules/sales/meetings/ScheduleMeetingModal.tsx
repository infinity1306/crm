import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { MeetingType } from '../../../types/crm';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Calendar, Clock, Video, MapPin, Users } from 'lucide-react';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientName?: string;
  defaultCompanyName?: string;
  onSuccess?: (meetingId: string) => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  defaultClientName,
  defaultCompanyName,
  onSuccess
}) => {
  const { employees, currentUser, scheduleMeeting, addToast } = useCRM();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<MeetingType>('online');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [location, setLocation] = useState('');
  const [clientName, setClientName] = useState(defaultClientName || '');
  const [companyName, setCompanyName] = useState(defaultCompanyName || '');
  const [hostId, setHostId] = useState(currentUser?.id || (employees[0]?.id ?? ''));
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('03:30 PM');
  const [duration, setDuration] = useState('45 mins');
  const [agenda, setAgenda] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) return;

    setIsSubmitting(true);
    try {
      const host = employees.find(e => e.id === hostId);

      const meeting = scheduleMeeting({
        title: title.trim(),
        type,
        meetingUrl: type === 'online' ? meetingUrl.trim() : undefined,
        location: type === 'offline' ? location.trim() : undefined,
        clientName: clientName.trim(),
        companyName: companyName.trim() || 'Enterprise Client',
        hostEmployeeId: hostId,
        hostEmployeeName: host ? host.name : 'Host Rep',
        date,
        time,
        duration: 45,
        agenda: agenda.trim()
      });

      addToast({
        type: 'success',
        title: 'Meeting Scheduled',
        message: `${title} booked for ${date} at ${time}.`
      });

      onClose();
      if (onSuccess) {
        onSuccess(meeting.id);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Failed to schedule meeting.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions: { value: MeetingType; label: string }[] = [
    { value: 'online', label: 'Online Video Conference (Google Meet)' },
    { value: 'offline', label: 'In-person / Onsite Office Sync' },
    { value: 'phone', label: 'Audio / Teleconference' },
  ];

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.designation})`
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Client Meeting / Demo Sync"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Calendar className="w-3.5 h-3.5" />}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Scheduling...' : 'Confirm Meeting'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <Input
          label="Meeting Subject *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. SOW Review & Architecture Alignment"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Client Stakeholder *"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="e.g. Vikram Malhotra"
            required
          />
          <Input
            label="Client Company"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="e.g. NextGen Systems"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Meeting Type"
            value={type}
            onChange={e => setType(e.target.value as MeetingType)}
            options={typeOptions}
          />
          <Select
            label="Host Lead Rep"
            value={hostId}
            onChange={e => setHostId(e.target.value)}
            options={employeeOptions}
          />
        </div>

        {type === 'online' ? (
          <Input
            label="Video Conference URL"
            value={meetingUrl}
            onChange={e => setMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/xyz-abcd-efg"
            leftIcon={<Video className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
        ) : type === 'offline' ? (
          <Input
            label="Physical Location / Office Address"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Star Chain Labs Bengaluru HQ — Conference Room 4B"
            leftIcon={<MapPin className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <Input
            label="Start Time"
            value={time}
            onChange={e => setTime(e.target.value)}
            placeholder="03:30 PM"
            leftIcon={<Clock className="w-3.5 h-3.5 text-crm-textMuted" />}
          />
          <Input
            label="Duration"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="45 mins"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-crm-text mb-1">
            Meeting Agenda & Desired Outcomes
          </label>
          <textarea
            value={agenda}
            onChange={e => setAgenda(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-crm-surface border border-crm-border rounded-md text-xs text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
            placeholder="Specific topics to cover, technical architecture to present..."
          />
        </div>
      </form>
    </Modal>
  );
};
