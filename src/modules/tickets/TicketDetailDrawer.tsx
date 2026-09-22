import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { InternalTicket, InternalTicketPriority, InternalTicketStatus, OperationalQueryResponse } from '../../types/projects';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  LifeBuoy, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  FolderKanban, 
  Target, 
  CheckSquare, 
  Paperclip,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface TicketDetailDrawerProps {
  ticketId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  ticketId,
  isOpen,
  onClose
}) => {
  const { tickets, updateTicketStatus, addTicketMessage, currentUser, navigateTo } = useCRM();

  const [replyInput, setReplyInput] = useState('');
  const [showStatusBriefingForm, setShowStatusBriefingForm] = useState(false);

  // Operational query structured response form
  const [currentProgress, setCurrentProgress] = useState('85');
  const [completedSummary, setCompletedSummary] = useState('');
  const [remainingSummary, setRemainingSummary] = useState('');
  const [eta, setEta] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const ticket = tickets.find(t => t.id === ticketId);

  if (!ticket) return null;

  const isOperationalQuery = ticket.type === 'operational_query' || ticket.title.includes('status');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    addTicketMessage(ticket.id, replyInput.trim());
    setReplyInput('');
  };

  const handleSubmitBriefing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedSummary.trim() || !remainingSummary.trim()) return;

    const briefing: OperationalQueryResponse = {
      currentProgressPercent: Number(currentProgress) || 0,
      completedSummary: completedSummary.trim(),
      remainingSummary: remainingSummary.trim(),
      eta,
      additionalNotes: notes.trim()
    };

    const formattedMessage = `Current Status: ${briefing.currentProgressPercent}%\nCompleted: ${briefing.completedSummary}\nRemaining: ${briefing.remainingSummary}\nETA: ${briefing.eta}`;
    addTicketMessage(ticket.id, formattedMessage, briefing);
    setShowStatusBriefingForm(false);
  };

  const getPriorityBadge = (priority: InternalTicketPriority) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="error">Critical</Badge>;
      case 'high':
        return <Badge variant="warning">High Priority</Badge>;
      case 'medium':
        return <Badge variant="primary">Medium</Badge>;
      case 'low':
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  const getStatusBadge = (status: InternalTicketStatus) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <Badge variant="success">Resolved</Badge>;
      case 'in_progress':
        return <Badge variant="primary">In Progress</Badge>;
      case 'waiting':
        return <Badge variant="warning">Waiting on Client</Badge>;
      case 'assigned':
        return <Badge variant="neutral">Assigned</Badge>;
      default:
        return <Badge variant="neutral">Open</Badge>;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${ticket.id}: ${ticket.title}`}
      subtitle={`${ticket.projectName} • ${ticket.milestoneName || 'General Delivery'}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Linked Hierarchy Breadcrumb Strip */}
        <div className="p-3 bg-[#0D1216] border border-[#1E262E] rounded-lg text-xs space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
            <span className="font-semibold text-white flex items-center gap-1">
              <FolderKanban className="w-3.5 h-3.5 text-teal-400" />
              {ticket.projectName}
            </span>
            {ticket.milestoneName && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-slate-300 flex items-center gap-1">
                  <Target className="w-3 h-3 text-slate-500" />
                  {ticket.milestoneName}
                </span>
              </>
            )}
            {ticket.taskTitle && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-teal-400 flex items-center gap-1 font-medium">
                  <CheckSquare className="w-3 h-3 text-teal-400" />
                  {ticket.taskTitle}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#1E262E] text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span>Assigned: <strong className="text-white">{ticket.assignedToName}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Raised by: <strong className="text-slate-300">{ticket.createdByName}</strong></span>
            </div>
            <div>
              <span>Created: {ticket.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Status, Priority & Quick Actions */}
        <div className="flex items-center justify-between gap-3 p-3 bg-[#0D1216] border border-[#1E262E] rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
            <Badge variant="neutral" className="text-[10px] uppercase">
              {ticket.type.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={ticket.status}
              onChange={(e) => updateTicketStatus(ticket.id, e.target.value as InternalTicketStatus)}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'waiting', label: 'Waiting on Input' },
                { value: 'resolved', label: 'Mark Resolved' },
                { value: 'closed', label: 'Closed' }
              ]}
              className="text-xs h-7 py-0"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Issue Description & Scope
          </h4>
          <div className="p-3 bg-[#0D1216] border border-[#1E262E] rounded text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </div>
        </div>

        {/* Admin Operational Status Briefing Prompt */}
        {isOperationalQuery && ticket.status !== 'resolved' && !showStatusBriefingForm && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-teal-300">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Admin has requested an executive status briefing on this work item.</span>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowStatusBriefingForm(true)}
              className="text-xs py-1"
            >
              Submit Status Briefing
            </Button>
          </div>
        )}

        {/* Structured Operational Query Response Form */}
        {showStatusBriefingForm && (
          <form onSubmit={handleSubmitBriefing} className="p-3.5 bg-[#12181E] border border-teal-500/40 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-semibold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Structured Operational Status Response
              </h5>
              <button
                type="button"
                onClick={() => setShowStatusBriefingForm(false)}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Current Progress (%)</label>
                <Input
                  type="number"
                  value={currentProgress}
                  onChange={(e) => setCurrentProgress(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Production ETA</label>
                <Input
                  type="date"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Completed Deliverables Summary</label>
              <Input
                value={completedSummary}
                onChange={(e) => setCompletedSummary(e.target.value)}
                placeholder="e.g. Webhook integration, HMAC-SHA256 verification and retry backoff mesh."
                className="text-xs w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Remaining Scope & Pending Items</label>
              <Input
                value={remainingSummary}
                onChange={(e) => setRemainingSummary(e.target.value)}
                placeholder="e.g. Bank simulator testing once NextGen provides updated certificate."
                className="text-xs w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional executive briefing notes for management..."
                className="w-full px-3 py-1.5 bg-[#0D1216] border border-[#1E262E] rounded text-xs text-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" size="sm" variant="outline" onClick={() => setShowStatusBriefingForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Record Status in History
              </Button>
            </div>
          </form>
        )}

        {/* Conversation Thread */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Internal Conversation ({ticket.messages?.length || 0})
          </h4>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {(!ticket.messages || ticket.messages.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-3 bg-[#0D1216] border border-[#1E262E] rounded">
                No conversation history. Post a message or briefing below.
              </p>
            ) : (
              ticket.messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                    msg.isAdminQuery
                      ? 'bg-amber-950/15 border-amber-500/30'
                      : msg.queryResponseData
                      ? 'bg-teal-950/15 border-teal-500/30'
                      : 'bg-[#0D1216] border-[#1E262E]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">{msg.authorName}</span>
                      <span className="text-[10px] text-slate-500">({msg.authorRole})</span>
                      {msg.isAdminQuery && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-semibold">
                          Admin Query
                        </span>
                      )}
                      {msg.queryResponseData && (
                        <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[9px] font-semibold">
                          Status Briefing
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500">{msg.createdAt}</span>
                  </div>

                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* Render structured response box if available */}
                  {msg.queryResponseData && (
                    <div className="mt-2 p-2.5 bg-[#0B0F13] border border-teal-500/20 rounded space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-teal-400 font-semibold">
                        <span>Current Progress: {msg.queryResponseData.currentProgressPercent}%</span>
                        <span>ETA: {msg.queryResponseData.eta}</span>
                      </div>
                      <p className="text-slate-300"><strong className="text-slate-400">Completed:</strong> {msg.queryResponseData.completedSummary}</p>
                      <p className="text-slate-300"><strong className="text-slate-400">Remaining:</strong> {msg.queryResponseData.remainingSummary}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="flex gap-2">
            <Input
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="Reply to ticket thread..."
              className="text-xs flex-1"
            />
            <Button type="submit" size="sm" variant="primary" icon={<Send className="w-3 h-3" />}>
              Send Reply
            </Button>
          </form>
        </div>

        {/* Attachments Section */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Diagnostic Logs & Attachments
            </h4>
            <div className="space-y-1.5">
              {ticket.attachments.map(att => (
                <div 
                  key={att.id}
                  className="p-2 bg-[#0D1216] border border-[#1E262E] rounded flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-white truncate">{att.name}</span>
                    <span className="text-[10px] text-slate-500">({att.size})</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs text-teal-400 hover:text-teal-300 p-1">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
