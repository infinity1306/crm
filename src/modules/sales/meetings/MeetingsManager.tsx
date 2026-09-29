import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Meeting, MeetingStatus } from '../../../types/crm';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { MeetingOutcomeModal } from './MeetingOutcomeModal';
import { 
  CalendarClock, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Building2,
  Users,
  MessageCircle,
  Copy,
  Check,
  CalendarPlus,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const MeetingsManager: React.FC = () => {
  const { meetings, navigateTo } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [outcomeMeeting, setOutcomeMeeting] = useState<Meeting | null>(null);
  const [copiedMeetId, setCopiedMeetId] = useState<string | null>(null);

  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const matchesSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.companyName && m.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.agenda || m.purpose || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [meetings, searchQuery, statusFilter]);

  const scheduledCount = meetings.filter(m => m.status === 'scheduled').length;
  const completedCount = meetings.filter(m => m.status === 'completed').length;

  const getStatusBadge = (status: MeetingStatus) => {
    switch (status) {
      case 'scheduled': return <Badge variant="primary">Scheduled</Badge>;
      case 'completed': return <Badge variant="success">Completed</Badge>;
      case 'rescheduled': return <Badge variant="warning">Rescheduled</Badge>;
      case 'cancelled': return <Badge variant="error">Cancelled</Badge>;
      case 'no_show': return <Badge variant="error">No Show</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-crm-text">Meetings & Product Demos</h1>
            <Badge variant="primary">{meetings.length} Recorded</Badge>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Client video syncs, architecture reviews, discovery calls, and post-meeting debriefs.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsScheduleModalOpen(true)}
        >
          Schedule Meeting
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Upcoming Scheduled</div>
            <div className="text-xl font-bold text-turquoise mt-0.5">{scheduledCount}</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Completed Demos</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{completedCount}</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Total Meeting Hours</div>
            <div className="text-xl font-bold text-crm-text mt-0.5">{(meetings.length * 0.6).toFixed(1)}h</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-crm-surface border border-crm-border flex items-center justify-center text-crm-textMuted">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-crm-textMuted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search meetings by subject, client, agenda..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-crm-surface border border-crm-border rounded-md text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-crm-surface border border-crm-border rounded text-xs text-crm-textSecondary focus:outline-none focus:border-turquoise"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-12 bg-crm-card border border-crm-border rounded-lg text-crm-textMuted text-xs">
            No meetings found matching current criteria.
          </div>
        ) : (
          filteredMeetings.map(meeting => (
            <div
              key={meeting.id}
              className="p-4 rounded-lg bg-crm-card border border-crm-border hover:border-turquoise/40 transition-colors space-y-3 text-xs"
            >
              {/* Meeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-crm-text text-sm">{meeting.title}</span>
                    {getStatusBadge(meeting.status)}
                    <span className="text-xs text-crm-textSecondary px-2 py-0.5 rounded bg-crm-surface border border-crm-border/60 capitalize">
                      {meeting.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-crm-textMuted flex flex-wrap items-center gap-2">
                    <span className="text-crm-text font-medium">{meeting.clientName}</span>
                    {meeting.companyName && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-crm-textDim" />
                          <span>{meeting.companyName}</span>
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1 text-turquoise">
                      <Clock className="w-3 h-3" />
                      <span>{meeting.date} at {meeting.time} ({meeting.duration})</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {meeting.status === 'scheduled' && (
                    <Button
                      variant="primary"
                      size="xs"
                      icon={<CheckCircle2 className="w-3 h-3" />}
                      onClick={() => setOutcomeMeeting(meeting)}
                    >
                      Record Outcome
                    </Button>
                  )}
                  {meeting.meetingUrl && (
                    <a
                      href={meeting.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-crm-surface hover:bg-crm-surface/80 text-crm-text text-xs border border-crm-border transition-colors"
                    >
                      <Video className="w-3 h-3 text-turquoise" />
                      <span>Join Meet</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Agenda */}
              <div className="p-2.5 rounded bg-crm-surface/50 border border-crm-border/50 text-crm-textSecondary text-xs">
                <strong className="text-crm-textMuted font-medium mr-1.5">Agenda:</strong>
                {meeting.agenda}
              </div>

              {/* Meeting Access Matrix (Sales Rep, Harshit, Client) */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-crm-surface/60 border border-crm-border text-[11px] font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-crm-textMuted uppercase text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-turquoise" />
                    Access Matrix:
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-crm-card text-turquoise border border-crm-border">
                    Rep: {meeting.hostEmployeeName || 'Sales Rep'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 font-bold">
                    Lead: Harshit Sharma
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-800/40">
                    Client: {meeting.clientName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {meeting.meetingUrl && (
                    <>
                      <button
                        onClick={() => {
                          const text = `STAR CHAIN LABS — Google Meet Invite\nMeeting: ${meeting.title}\nDate: ${meeting.date} at ${meeting.time}\nLink: ${meeting.meetingUrl}\nAttendees: Sales Rep (${meeting.hostEmployeeName}), Harshit Sharma, and ${meeting.clientName}`;
                          navigator.clipboard.writeText(text);
                          setCopiedMeetId(meeting.id);
                          setTimeout(() => setCopiedMeetId(null), 2000);
                        }}
                        className="p-1 rounded hover:bg-crm-card text-crm-textMuted hover:text-crm-text"
                        title="Copy Invitation"
                      >
                        {copiedMeetId === meeting.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Hello ${meeting.clientName},\nYour Google Meet is scheduled: ${meeting.title}\nTime: ${meeting.date} at ${meeting.time}\nGoogle Meet Link: ${meeting.meetingUrl}\nAttendees: ${meeting.hostEmployeeName}, Harshit Sharma, and ${meeting.clientName}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-crm-card text-emerald-400 hover:text-emerald-300"
                        title="Share on WhatsApp with Client & Harshit"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Outcome summary if completed */}
              {meeting.outcome && (
                <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/30 text-emerald-200 text-xs space-y-1">
                  <div>
                    <strong className="text-emerald-400 font-medium mr-1.5">Outcome:</strong>
                    {meeting.outcome}
                  </div>
                  {meeting.clientResponse && (
                    <div className="text-[11px] text-crm-textSecondary">
                      <strong className="text-crm-textMuted mr-1">Sentiment:</strong>
                      {meeting.clientResponse}
                    </div>
                  )}
                  {meeting.nextAction && (
                    <div className="text-[11px] text-turquoise flex items-center gap-1 pt-1">
                      <ArrowRight className="w-3 h-3" />
                      <span>Next Action: {meeting.nextAction}</span>
                      {meeting.nextFollowUp && <span>(Follow-up: {meeting.nextFollowUp})</span>}
                    </div>
                  )}
                </div>
              )}

              {/* Host rep footer */}
              <div className="pt-2 border-t border-crm-border/40 flex items-center justify-between text-[11px] text-crm-textMuted">
                <div className="flex items-center gap-1.5">
                  <span>Host Rep:</span>
                  <Avatar name={meeting.hostEmployeeName || meeting.salesEmployeeName || 'Host Rep'} size="xs" />
                  <span className="text-crm-textSecondary">{meeting.hostEmployeeName || meeting.salesEmployeeName || 'Host Rep'}</span>
                </div>
                {meeting.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-crm-textDim" />
                    <span>{meeting.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      {outcomeMeeting && (
        <MeetingOutcomeModal
          isOpen={Boolean(outcomeMeeting)}
          onClose={() => setOutcomeMeeting(null)}
          meeting={outcomeMeeting}
        />
      )}
    </div>
  );
};
