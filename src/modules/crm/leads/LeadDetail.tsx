import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { LeadStage, LeadPriority } from '../../../types/crm';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { Tabs } from '../../../components/ui/Tabs';
import { Input } from '../../../components/ui/Input';
import { ConvertLeadModal } from './ConvertLeadModal';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  Tag, 
  FileText, 
  History, 
  MessageSquare, 
  Plus,
  Send,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../utils/cn';

interface LeadDetailProps {
  leadId: string;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({ leadId }) => {
  const { 
    leads, 
    updateLead, 
    navigateTo, 
    activityEvents, 
    meetings,
    followUps,
    completeFollowUp,
    addFollowUp,
    scheduleMeeting,
    addToast, 
    currentUser 
  } = useCRM();

  const lead = leads.find(l => l.id === leadId);

  const [activeTab, setActiveTab] = useState<'timeline' | 'followups' | 'notes' | 'meetings'>('timeline');
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteList, setNoteList] = useState<string[]>(() => {
    return lead?.notes ? [lead.notes] : [
      'Discovery call completed with executive team. Validated budget and deployment timeline for Q3.',
      'Shared architecture whitepaper on custom distributed ledger validator infrastructure.'
    ];
  });

  // Quick follow-up form
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  if (!lead) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-base font-semibold text-crm-text">Lead Not Found</h2>
        <p className="text-xs text-crm-textSecondary">The requested lead record could not be found or may have been converted/removed.</p>
        <Button variant="secondary" size="sm" onClick={() => navigateTo('/app/crm/leads')}>
          Back to Leads Directory
        </Button>
      </div>
    );
  }

  const stages: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];

  const handleStageChange = (newStage: LeadStage) => {
    updateLead(lead.id, { stage: newStage });
    addToast({
      type: 'info',
      title: 'Lead Stage Updated',
      message: `Status moved to ${newStage.toUpperCase()}`
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const updatedNotes = [newNote.trim(), ...noteList];
    setNoteList(updatedNotes);
    updateLead(lead.id, { notes: updatedNotes.join('\n\n') });
    setNewNote('');
    addToast({ type: 'success', title: 'Note Logged', message: 'Internal discovery note saved to lead timeline.' });
  };

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpTitle.trim()) return;

    addFollowUp({
      leadId: lead.id,
      clientName: lead.name,
      companyName: lead.companyName,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      dueDate: followUpDate,
      dueTime: '11:00 AM',
      priority: 'high',
      taskDescription: followUpTitle.trim()
    });

    setFollowUpTitle('');
    addToast({ type: 'success', title: 'Follow-up Scheduled', message: 'Task added to your active follow-up queue.' });
  };

  // Filter linked items
  const leadFollowUps = followUps.filter(f => f.leadId === lead.id);
  const leadMeetings = meetings.filter(m => m.leadId === lead.id);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigateTo('/app/crm/leads')}
          className="flex items-center gap-1.5 text-xs text-crm-textSecondary hover:text-turquoise transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads Directory</span>
        </button>

        <div className="flex items-center gap-2">
          {lead.stage !== 'won' && (
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => setIsConvertModalOpen(true)}
            >
              Convert to Client
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/app/communication/messages')}
          >
            Open Chat
          </Button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-5 rounded-lg bg-crm-card border border-crm-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-turquoise/10 border border-turquoise/30 flex items-center justify-center text-turquoise font-semibold text-lg">
              {lead.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-crm-text">{lead.name}</h1>
                <Badge variant={lead.priority === 'urgent' ? 'error' : lead.priority === 'high' ? 'warning' : 'neutral'}>
                  {lead.priority.toUpperCase()}
                </Badge>
                <Badge variant="primary">{lead.source}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-crm-textSecondary mt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-crm-textMuted" />
                  <strong className="text-crm-text font-medium">{lead.companyName}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-crm-textMuted" />
                  {lead.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-crm-textMuted" />
                  {lead.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-crm-border pt-3 md:pt-0 md:pl-6">
            <div>
              <div className="text-[11px] text-crm-textMuted uppercase tracking-wider font-mono">Opportunity Value</div>
              <div className="text-lg font-bold text-turquoise">
                ₹{((lead.value || lead.budget || 0)).toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-crm-textMuted uppercase tracking-wider font-mono">Assigned Owner</div>
              <div className="text-xs font-medium text-crm-text mt-0.5 flex items-center gap-1.5">
                <Avatar name={lead.ownerName} size="xs" />
                <span>{lead.ownerName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linear Stage Progression Bar */}
        <div className="pt-3 border-t border-crm-border/60">
          <div className="text-[11px] font-mono text-crm-textMuted uppercase mb-2 flex items-center justify-between">
            <span>Pipeline Qualification Lifecycle</span>
            <span className="text-turquoise font-medium">Stage: {lead.stage.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {stages.map((stg, idx) => {
              const currentIdx = stages.indexOf(lead.stage);
              const isPastOrCurrent = currentIdx >= idx;
              const isCurrent = lead.stage === stg;

              return (
                <button
                  key={stg}
                  onClick={() => handleStageChange(stg)}
                  className={cn(
                    "py-2 px-1 text-center rounded transition-all text-xs font-medium relative group",
                    isCurrent
                      ? "bg-turquoise text-crm-bg font-semibold shadow-sm"
                      : isPastOrCurrent
                      ? "bg-turquoise/20 text-turquoise border border-turquoise/30"
                      : "bg-crm-surface text-crm-textMuted hover:bg-crm-surface/80 hover:text-crm-text border border-crm-border/60"
                  )}
                >
                  <div className="truncate capitalize">{stg}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dossier & Metadata */}
        <div className="space-y-4">
          {/* Key Deal Metadata Card */}
          <div className="p-4 rounded-lg bg-crm-card border border-crm-border space-y-3.5 text-xs">
            <div className="font-semibold text-crm-text uppercase tracking-wider text-[11px] border-b border-crm-border/60 pb-2">
              Discovery Specifications
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="text-crm-textMuted text-[11px]">Core Requirements Brief</div>
                <div className="text-crm-text mt-0.5 p-2 rounded bg-crm-surface border border-crm-border/50 leading-relaxed text-xs">
                  {lead.requirement || 'No custom requirement recorded during intake.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="text-crm-textMuted text-[11px]">Client Stated Budget</div>
                  <div className="text-crm-text font-medium mt-0.5">₹{(lead.budget || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-crm-textMuted text-[11px]">Target Close Date</div>
                  <div className="text-crm-text font-medium mt-0.5">{lead.expectedCloseDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-crm-border/40">
                <div>
                  <div className="text-crm-textMuted text-[11px]">Next Follow-up Slot</div>
                  <div className="text-turquoise font-medium mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{lead.nextFollowUpDate || 'Not scheduled'}</span>
                  </div>
                </div>
                <div>
                  <div className="text-crm-textMuted text-[11px]">Slot Time</div>
                  <div className="text-crm-text font-medium mt-0.5">{lead.nextFollowUpTime || '11:00 AM'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-crm-border/40">
                <div className="text-crm-textMuted text-[11px] mb-1.5">Segment Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-crm-surface text-crm-textSecondary border border-crm-border/60 text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Follow-up Scheduler Box */}
          <div className="p-4 rounded-lg bg-crm-card border border-crm-border space-y-3 text-xs">
            <div className="font-semibold text-crm-text uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Quick Follow-up</span>
              <Clock className="w-3.5 h-3.5 text-turquoise" />
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-2.5">
              <Input
                label="Task / Action"
                value={followUpTitle}
                onChange={e => setFollowUpTitle(e.target.value)}
                placeholder="e.g. Send revised SOW & fee structure"
                required
              />
              <Input
                label="Due Date"
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                required
              />
              <Button variant="secondary" size="xs" className="w-full" type="submit">
                Schedule Action
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Interaction Workspaces */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-lg bg-crm-card border border-crm-border">
            {/* Nav Tabs */}
            <div className="flex items-center gap-2 border-b border-crm-border pb-3 mb-4 text-xs">
              <button
                onClick={() => setActiveTab('timeline')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors",
                  activeTab === 'timeline' ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder" : "text-crm-textSecondary hover:text-crm-text"
                )}
              >
                <History className="w-3.5 h-3.5" />
                <span>Activities & Timeline</span>
              </button>

              <button
                onClick={() => setActiveTab('followups')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors",
                  activeTab === 'followups' ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder" : "text-crm-textSecondary hover:text-crm-text"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Follow-ups ({leadFollowUps.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('meetings')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors",
                  activeTab === 'meetings' ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder" : "text-crm-textSecondary hover:text-crm-text"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Meetings ({leadMeetings.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors",
                  activeTab === 'notes' ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder" : "text-crm-textSecondary hover:text-crm-text"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Internal Notes ({noteList.length})</span>
              </button>
            </div>

            {/* Tab: Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-3">
                  {/* Lead Creation Event */}
                  <div className="flex items-start gap-3 p-3 rounded-md bg-crm-surface/60 border border-crm-border/60">
                    <div className="w-7 h-7 rounded bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise mt-0.5">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-crm-text">Inbound Discovery Lead Created</span>
                        <span className="text-[10px] text-crm-textMuted font-mono">{lead.createdDate}</span>
                      </div>
                      <p className="text-crm-textSecondary text-xs mt-1">
                        Acquired via <strong>{lead.source}</strong> channel. Assigned to {lead.ownerName}.
                      </p>
                    </div>
                  </div>

                  {/* Meetings */}
                  {leadMeetings.map(m => (
                    <div key={m.id} className="flex items-start gap-3 p-3 rounded-md bg-crm-surface/60 border border-crm-border/60">
                      <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-crm-text">{m.title}</span>
                          <span className="text-[10px] text-crm-textMuted font-mono">{m.date} • {m.time}</span>
                        </div>
                        <p className="text-crm-textSecondary text-xs mt-1">
                          Status: <span className="text-crm-text capitalize font-medium">{m.status}</span>. Host: {m.hostEmployeeName}
                        </p>
                        {m.outcome && (
                          <div className="mt-2 p-2 rounded bg-crm-bg border border-crm-border/50 text-[11px] text-crm-textSecondary">
                            <strong>Outcome:</strong> {m.outcome}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Stage progression updates */}
                  <div className="flex items-start gap-3 p-3 rounded-md bg-crm-surface/60 border border-crm-border/60">
                    <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-crm-text">Current Stage: {lead.stage.toUpperCase()}</span>
                        <span className="text-[10px] text-crm-textMuted font-mono">{lead.lastActivity}</span>
                      </div>
                      <p className="text-crm-textSecondary text-xs mt-1">
                        Qualification criteria evaluated. Next scheduled check: {lead.nextFollowUpDate || 'Pending'}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Follow-ups */}
            {activeTab === 'followups' && (
              <div className="space-y-3 text-xs">
                {leadFollowUps.length === 0 ? (
                  <div className="text-center py-8 text-crm-textMuted border border-dashed border-crm-border/50 rounded-lg">
                    No active follow-ups for this lead. Use the left panel to add one.
                  </div>
                ) : (
                  leadFollowUps.map(fu => (
                    <div
                      key={fu.id}
                      className={cn(
                        "p-3 rounded-md border flex items-center justify-between transition-colors",
                        fu.status === 'completed' 
                          ? "bg-crm-surface/30 border-crm-border/40 opacity-70" 
                          : "bg-crm-surface border-crm-border"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => completeFollowUp(fu.id)}
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                            fu.status === 'completed'
                              ? "bg-turquoise border-turquoise text-crm-bg"
                              : "border-crm-border hover:border-turquoise"
                          )}
                        >
                          {fu.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                        <div>
                          <div className={cn("font-medium text-crm-text", fu.status === 'completed' && "line-through text-crm-textMuted")}>
                            {fu.taskDescription}
                          </div>
                          <div className="text-[11px] text-crm-textMuted flex items-center gap-2 mt-0.5">
                            <span>Due: {fu.dueDate} ({fu.dueTime})</span>
                            <span>•</span>
                            <span className="capitalize">{fu.priority} priority</span>
                          </div>
                        </div>
                      </div>

                      <Badge variant={fu.status === 'completed' ? 'success' : 'warning'}>
                        {fu.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Meetings */}
            {activeTab === 'meetings' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-crm-textSecondary">Recorded Discovery & Pitch Syncs</span>
                  <Button
                    variant="primary"
                    size="xs"
                    icon={<Plus className="w-3 h-3" />}
                    onClick={() => {
                      scheduleMeeting({
                        title: `Strategy Call with ${lead.name}`,
                        type: 'online',
                        meetingUrl: 'https://meet.google.com/new',
                        leadId: lead.id,
                        clientName: lead.name,
                        companyName: lead.companyName,
                        hostEmployeeId: currentUser.id,
                        hostEmployeeName: currentUser.name,
                        date: new Date().toISOString().split('T')[0],
                        time: '03:00 PM',
                        duration: '30 mins',
                        agenda: 'Clarify deliverables & commercial SLAs'
                      });
                      addToast({ type: 'success', title: 'Meeting Scheduled', message: 'Online strategy sync recorded.' });
                    }}
                  >
                    Quick Schedule Sync
                  </Button>
                </div>

                {leadMeetings.length === 0 ? (
                  <div className="text-center py-8 text-crm-textMuted border border-dashed border-crm-border/50 rounded-lg">
                    No meetings recorded for this lead yet.
                  </div>
                ) : (
                  leadMeetings.map(m => (
                    <div key={m.id} className="p-3.5 rounded-md bg-crm-surface border border-crm-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-crm-text">{m.title}</div>
                        <Badge variant={m.status === 'completed' ? 'success' : 'neutral'}>{m.status}</Badge>
                      </div>
                      <div className="text-[11px] text-crm-textMuted flex items-center gap-3">
                        <span>{m.date} at {m.time} ({m.duration})</span>
                        <span>•</span>
                        <span className="capitalize">{m.type}</span>
                      </div>
                      <p className="text-crm-textSecondary text-xs">{m.agenda}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Internal Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4 text-xs">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    rows={3}
                    placeholder="Add an internal note or confidential update regarding this lead..."
                    className="w-full px-3 py-2 bg-crm-surface border border-crm-border rounded-md text-xs text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
                  />
                  <div className="flex justify-end">
                    <Button variant="primary" size="xs" icon={<Send className="w-3 h-3" />} type="submit">
                      Save Note
                    </Button>
                  </div>
                </form>

                <div className="space-y-2.5 pt-2 border-t border-crm-border/60">
                  {noteList.map((nt, idx) => (
                    <div key={idx} className="p-3 rounded bg-crm-surface/70 border border-crm-border/60 text-crm-textSecondary leading-relaxed">
                      {nt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Convert Lead Modal */}
      {isConvertModalOpen && (
        <ConvertLeadModal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          lead={lead}
          onSuccess={(companyId) => {
            if (companyId) {
              navigateTo(`/app/crm/companies/${companyId}`);
            }
          }}
        />
      )}
    </div>
  );
};
