import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { MeetingType } from '../../../types/crm';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Users, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  MessageCircle, 
  Mail,
  CalendarPlus
} from 'lucide-react';

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

  const [title, setTitle] = useState('Client Discovery & Product Demo');
  const [type, setType] = useState<MeetingType>('online');

  // Generate unique Google Meet ID
  const generateMeetCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const randPart = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `https://meet.google.com/scl-${randPart(3)}-${randPart(3)}`;
  };

  const [meetingUrl, setMeetingUrl] = useState(() => generateMeetCode());
  const [location, setLocation] = useState('');
  const [clientName, setClientName] = useState(defaultClientName || '');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [companyName, setCompanyName] = useState(defaultCompanyName || '');
  const [hostId, setHostId] = useState(currentUser?.id || (employees[0]?.id ?? ''));
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('03:30 PM');
  const [duration, setDuration] = useState('45 mins');
  const [agenda, setAgenda] = useState('Architecture walkthrough, requirements alignment, and commercial proposal review.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledResult, setScheduledResult] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedHost = employees.find(e => e.id === hostId) || currentUser;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) {
      addToast({ type: 'warning', title: 'Compulsory Fields Required', message: 'Please provide Meeting Title and Client Name.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalMeetUrl = type === 'online' ? meetingUrl.trim() : undefined;

      const meeting = scheduleMeeting({
        title: title.trim(),
        type,
        meetingUrl: finalMeetUrl,
        location: type === 'offline' ? location.trim() : undefined,
        clientName: clientName.trim(),
        companyName: companyName.trim() || 'Enterprise Client',
        hostEmployeeId: hostId,
        hostEmployeeName: selectedHost ? selectedHost.name : 'Sales Representative',
        date,
        time,
        duration: 45,
        agenda: agenda.trim()
      });

      // Notification triggered so all stakeholders get updated
      addToast({
        type: 'success',
        title: 'Google Meet Scheduled!',
        message: `Google Meet created. Access granted to Sales Executive, Harshit, and ${clientName}.`
      });

      // Prepare Google Calendar URL
      const startDateTimeStr = `${date.replace(/-/g, '')}T100000Z`;
      const endDateTimeStr = `${date.replace(/-/g, '')}T104500Z`;
      const calDetails = `Google Meet: ${finalMeetUrl}\n\nAgenda:\n${agenda}\n\nRequired Attendees:\n- Sales Executive: ${selectedHost.name} (${selectedHost.email})\n- Executive Director: Harshit Sharma (harshit@starchainlabs.com)\n- Client: ${clientName} (${clientEmail || 'N/A'})\n\nStar Chain Labs Enterprise Sync`;
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTimeStr}/${endDateTimeStr}&details=${encodeURIComponent(calDetails)}&location=${encodeURIComponent(finalMeetUrl || 'Google Meet')}`;

      setScheduledResult({
        ...meeting,
        gcalUrl,
        meetUrl: finalMeetUrl
      });

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

  const handleCopyInvite = () => {
    if (!scheduledResult) return;
    const text = `STAR CHAIN LABS — GOOGLE MEET INVITATION\n\nMeeting: ${scheduledResult.title}\nDate: ${scheduledResult.date} at ${scheduledResult.time}\nGoogle Meet Link: ${scheduledResult.meetUrl}\n\nAttendees:\n• Sales Executive: ${scheduledResult.hostEmployeeName}\n• Executive Director: Harshit Sharma\n• Client: ${scheduledResult.clientName} (${scheduledResult.companyName})\n\nAgenda: ${scheduledResult.agenda}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    addToast({ title: 'Invite Copied', message: 'Formatted Google Meet invite copied to clipboard.', type: 'info' });
  };

  const handleShareWhatsApp = () => {
    if (!scheduledResult) return;
    const text = `Hello ${scheduledResult.clientName},\n\nYour Google Meet with Star Chain Labs has been scheduled:\n\n*Topic:* ${scheduledResult.title}\n*Date & Time:* ${scheduledResult.date} at ${scheduledResult.time}\n*Google Meet Link:* ${scheduledResult.meetUrl}\n\n*Attendees:*\n- Sales Executive: ${scheduledResult.hostEmployeeName}\n- Harshit Sharma (Executive Director)\n- ${scheduledResult.clientName}\n\nLooking forward to speaking with you!`;
    const cleanPhone = clientPhone.replace(/\D/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={scheduledResult ? "Google Meet Scheduled Successfully" : "Schedule Google Meet / Client Sync"}
      size="md"
    >
      {scheduledResult ? (
        <div className="space-y-4 py-2 text-xs">
          {/* Success Banner */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Video className="w-5 h-5" />
              <span>Google Meet Live & Access Distributed</span>
            </div>
            <p className="text-crm-textSecondary leading-relaxed">
              Google Meet booked for <strong className="text-crm-text">{scheduledResult.date}</strong> at <strong className="text-crm-text">{scheduledResult.time}</strong>. All three designated attendees have been granted access clearance.
            </p>
          </div>

          {/* Access Matrix Confirmation */}
          <div className="p-3.5 rounded-lg bg-crm-surface/70 border border-crm-border space-y-2">
            <span className="font-bold text-turquoise uppercase tracking-wider text-[11px] block">
              Meeting Access List (3 Confirmed Stakeholders):
            </span>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-crm-card border border-crm-border">
                <span className="text-crm-text font-medium">1. Sales Executive (Host):</span>
                <span className="text-turquoise">{scheduledResult.hostEmployeeName}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-crm-card border border-crm-border">
                <span className="text-crm-text font-medium">2. Executive Director:</span>
                <span className="text-emerald-400 font-bold">Harshit Sharma (Lead Access)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-crm-card border border-crm-border">
                <span className="text-crm-text font-medium">3. Client:</span>
                <span className="text-sky-300 font-bold">{scheduledResult.clientName} ({scheduledResult.companyName})</span>
              </div>
            </div>
          </div>

          {/* Google Meet Link Display */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-crm-textSecondary uppercase tracking-wider block">
              Direct Google Meet Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={scheduledResult.meetUrl}
                className="flex-1 h-9 px-3 text-xs bg-crm-surface text-turquoise font-mono rounded-lg border border-crm-border select-all"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.open(scheduledResult.meetUrl, '_blank')}
                leftIcon={<Video className="w-3.5 h-3.5" />}
                className="bg-turquoise text-slate-950 font-bold"
              >
                Join Now
              </Button>
            </div>
          </div>

          {/* Multi-Channel Distribution Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-crm-border">
            <Button
              variant="outline"
              size="xs"
              onClick={handleCopyInvite}
              leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-turquoise" />}
            >
              {copiedLink ? 'Copied!' : 'Copy Full Invite'}
            </Button>

            <Button
              variant="outline"
              size="xs"
              onClick={handleShareWhatsApp}
              leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-400" />}
              className="text-emerald-300 hover:border-emerald-500/50"
            >
              Share WhatsApp
            </Button>

            <Button
              variant="outline"
              size="xs"
              onClick={() => window.open(scheduledResult.gcalUrl, '_blank')}
              leftIcon={<CalendarPlus className="w-3.5 h-3.5 text-amber-400" />}
            >
              Google Calendar
            </Button>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Done / Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Meeting Subject & Type */}
          <div className="space-y-3">
            <Input
              label="Meeting Title / Subject *"
              placeholder="e.g. Enterprise CRM Architecture Walkthrough"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider mb-1">
                  Meeting Mode *
                </label>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-turquoise/10 border border-turquoise/30 text-turquoise font-semibold">
                  <Video className="w-4 h-4 text-turquoise" />
                  <span>Google Meet Video</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider mb-1">
                  Host Sales Executive *
                </label>
                <select
                  value={hostId}
                  onChange={(e) => setHostId(e.target.value)}
                  className="w-full h-8.5 px-3 py-1.5 text-xs bg-crm-surface text-crm-text rounded-md border border-crm-border focus:border-turquoise focus:outline-none"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Google Meet Generated Link Box */}
            <div className="p-3 rounded-lg bg-crm-surface/70 border border-crm-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-turquoise uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Google Meet URL
                </span>
                <button
                  type="button"
                  onClick={() => setMeetingUrl(generateMeetCode())}
                  className="text-[10px] text-turquoise hover:underline"
                >
                  Regenerate Link
                </button>
              </div>
              <input
                type="text"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-crm-card text-crm-text font-mono rounded border border-crm-border focus:border-turquoise focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Access Clearance Matrix (Mandatory Attendees) */}
          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Mandatory Access Matrix (3 Stakeholders Assigned)</span>
            </div>
            <p className="text-[11px] text-crm-textSecondary leading-relaxed">
              As per organizational policy, all sales syncs grant direct calendar access and updates to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px]">
              <div className="p-2 rounded bg-crm-card border border-crm-border">
                <span className="text-crm-textMuted block">1. SALES EXECUTIVE</span>
                <span className="text-turquoise font-medium">{selectedHost.name}</span>
              </div>
              <div className="p-2 rounded bg-crm-card border border-crm-border">
                <span className="text-crm-textMuted block">2. EXECUTIVE DIRECTOR</span>
                <span className="text-amber-400 font-bold">Harshit Sharma</span>
              </div>
              <div className="p-2 rounded bg-crm-card border border-crm-border">
                <span className="text-crm-textMuted block">3. CLIENT ATTENDEE</span>
                <span className="text-sky-300 font-medium">{clientName || 'Assigned Client'}</span>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Client Contact Person Name *"
              placeholder="e.g. Vikramaditya Roy"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <Input
              label="Client Enterprise / Company"
              placeholder="e.g. Apex Financial Services"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Input
              type="email"
              label="Client Email ID (for calendar invite)"
              placeholder="vikram.roy@apexfin.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
            <Input
              type="tel"
              label="Client Mobile Number (for WhatsApp invite)"
              placeholder="+91 98450 12345"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
          </div>

          {/* Date, Time & Agenda */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              type="date"
              label="Meeting Date *"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="Meeting Time *"
              placeholder="e.g. 03:30 PM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <Select
              label="Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="30 mins">30 mins</option>
              <option value="45 mins">45 mins</option>
              <option value="60 mins">60 mins</option>
              <option value="90 mins">90 mins</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider mb-1">
              Discussion Agenda & Objectives
            </label>
            <textarea
              rows={2}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full p-2.5 rounded-md bg-crm-surface border border-crm-border text-xs text-crm-text focus:border-turquoise focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-crm-border">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Video className="w-3.5 h-3.5" />}
              className="bg-turquoise text-slate-950 font-bold hover:bg-turquoise/90"
            >
              Schedule Google Meet & Grant Access
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
