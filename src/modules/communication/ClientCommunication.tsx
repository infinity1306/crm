import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Conversation, ChatMessage } from '../../types/crm';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Lock, 
  Building2, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  ExternalLink,
  Plus,
  Paperclip,
  Check,
  CheckCheck
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const ClientCommunication: React.FC = () => {
  const { 
    conversations, 
    sendChatMessage, 
    deals, 
    meetings, 
    followUps, 
    navigateTo, 
    currentUser, 
    addToast 
  } = useCRM();

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return conversations[0]?.id || '';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeClientName = activeConversation ? (activeConversation.clientName || activeConversation.contactName || 'Client') : '';
  const activeEmail = activeConversation ? (activeConversation.clientEmail || activeConversation.contactEmail || '') : '';
  const activePhone = activeConversation ? (activeConversation.clientPhone || '') : '';

  const filteredConversations = conversations.filter(c => {
    const cName = c.clientName || c.contactName || '';
    const lastMsg = c.lastMessagePreview || c.lastMessageSnippet || '';
    return (
      cName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    sendChatMessage(activeConversation.id, messageInput.trim(), isInternalNote);
    setMessageInput('');
  };

  // Linked details for active client
  const clientDeals = deals.filter(d => 
    d.companyName.toLowerCase() === activeConversation?.companyName.toLowerCase() ||
    d.primaryContactName.toLowerCase() === activeClientName.toLowerCase()
  );

  const clientMeetings = meetings.filter(m => 
    m.clientName.toLowerCase() === activeClientName.toLowerCase() ||
    (m.companyName && m.companyName.toLowerCase() === activeConversation?.companyName.toLowerCase())
  );

  const clientFollowUps = followUps.filter(f => 
    f.clientName.toLowerCase() === activeClientName.toLowerCase()
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-crm-bg">
      {/* 3-Panel Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: Conversations List (Left) */}
        <div className="w-80 border-r border-crm-border flex flex-col bg-crm-card flex-shrink-0">
          {/* Panel 1 Header */}
          <div className="p-3.5 border-b border-crm-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-crm-text">Client Conversations</span>
                <Badge variant="primary" size="sm">{conversations.length}</Badge>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-crm-textMuted" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search threads..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-crm-surface border border-crm-border rounded text-crm-text focus:outline-none focus:border-turquoise"
              />
            </div>
          </div>

          {/* Conversations Thread Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-crm-border/40 text-xs">
            {filteredConversations.map(conv => {
              const isActive = conv.id === activeConversation?.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={cn(
                    "p-3 cursor-pointer transition-colors space-y-1 relative",
                    isActive
                      ? "bg-turquoise-subtle/80 border-l-2 border-l-turquoise"
                      : "hover:bg-crm-surface/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={conv.clientName || conv.contactName || 'Client'} size="xs" />
                      <span className={cn("font-medium truncate", isActive ? "text-turquoise font-semibold" : "text-crm-text")}>
                        {conv.clientName || conv.contactName || 'Client'}
                      </span>
                    </div>
                    <span className="text-[10px] text-crm-textMuted font-mono flex-shrink-0">
                      {conv.lastMessageTime || conv.lastActivity || ''}
                    </span>
                  </div>

                  <div className="text-[11px] text-crm-textMuted flex items-center gap-1 truncate pl-7">
                    <Building2 className="w-3 h-3 text-crm-textDim flex-shrink-0" />
                    <span className="truncate">{conv.companyName}</span>
                  </div>

                  <div className="text-[11px] text-crm-textSecondary truncate pl-7 leading-relaxed">
                    {conv.lastMessagePreview || conv.lastMessageSnippet || ''}
                  </div>

                  {conv.unreadCount > 0 && (
                    <div className="absolute right-3 bottom-3 w-4 h-4 rounded-full bg-turquoise text-crm-bg text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL 2: Active Chat Thread (Center) */}
        <div className="flex-1 flex flex-col bg-crm-bg min-w-0 border-r border-crm-border">
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 border-b border-crm-border flex items-center justify-between bg-crm-card flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={activeClientName} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-crm-text truncate">
                        {activeClientName}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Online / Active" />
                    </div>
                    <div className="text-[11px] text-crm-textMuted truncate">
                      {activeConversation.companyName} • {activeEmail}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      addToast({
                        type: 'info',
                        title: 'Dialing Client',
                        message: `Initiating secure outbound bridge to ${activeConversation.clientPhone}`
                      });
                    }}
                    title="Audio Bridge Call"
                  >
                    <Phone className="w-3.5 h-3.5 text-crm-textMuted hover:text-turquoise" />
                  </Button>
                </div>
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {activeConversation.messages.map(msg => {
                  const isMe = msg.senderRole === 'rep';
                  const isInternal = msg.isInternalNote;

                  if (isInternal) {
                    return (
                      <div key={msg.id} className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs space-y-1 max-w-xl mx-auto my-2">
                        <div className="flex items-center justify-between text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Internal Team Note (Private — Not Visible to Client)</span>
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <div className="text-amber-100 text-xs leading-relaxed">
                          {msg.content}
                        </div>
                        <div className="text-[10px] text-amber-300/60 text-right">
                          Logged by {msg.senderName}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-lg",
                        isMe ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className="text-[10px] text-crm-textMuted mb-1 px-1 flex items-center gap-1">
                        <span>{msg.senderName}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={cn(
                          "p-3 rounded-lg leading-relaxed text-xs",
                          isMe
                            ? "bg-turquoise text-crm-bg font-medium rounded-br-none"
                            : "bg-crm-card border border-crm-border text-crm-text rounded-bl-none"
                        )}
                      >
                        {msg.content}
                      </div>

                      {isMe && (
                        <div className="flex items-center gap-1 text-[10px] text-crm-textDim mt-0.5 px-1">
                          <CheckCheck className="w-3 h-3 text-turquoise" />
                          <span>Delivered</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Message Composer */}
              <div className="p-3.5 border-t border-crm-border bg-crm-card flex-shrink-0 space-y-2">
                {/* Note toggle */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(false)}
                      className={cn(
                        "px-2.5 py-1 rounded text-xs transition-colors font-medium",
                        !isInternalNote
                          ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder"
                          : "text-crm-textMuted hover:text-crm-text"
                      )}
                    >
                      Direct Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(true)}
                      className={cn(
                        "px-2.5 py-1 rounded text-xs transition-colors font-medium flex items-center gap-1",
                        isInternalNote
                          ? "bg-amber-950/40 text-amber-400 border border-amber-800/60"
                          : "text-crm-textMuted hover:text-amber-400"
                      )}
                    >
                      <Lock className="w-3 h-3" />
                      <span>Internal Memo 🔒</span>
                    </button>
                  </div>

                  {isInternalNote && (
                    <span className="text-[11px] text-amber-400 font-medium">
                      Visible to Star Chain Labs team only
                    </span>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? "Write internal memo for team regarding this account..."
                        : `Reply to ${activeConversation.clientName}...`
                    }
                    className={cn(
                      "flex-1 px-3 py-2 text-xs rounded border focus:outline-none transition-colors",
                      isInternalNote
                        ? "bg-amber-950/20 border-amber-800/50 text-amber-100 focus:border-amber-400 placeholder-amber-400/40"
                        : "bg-crm-surface border-crm-border text-crm-text focus:border-turquoise focus:ring-1 focus:ring-turquoise"
                    )}
                  />

                  <Button
                    variant={isInternalNote ? "secondary" : "primary"}
                    size="sm"
                    icon={<Send className="w-3.5 h-3.5" />}
                    type="submit"
                  >
                    {isInternalNote ? 'Log Note' : 'Send'}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-crm-textMuted text-xs">
              Select a conversation to view chat history.
            </div>
          )}
        </div>

        {/* PANEL 3: Client Context & Dossier (Right) */}
        {activeConversation && (
          <div className="w-80 border-l border-crm-border flex flex-col bg-crm-card flex-shrink-0 overflow-y-auto p-4 space-y-4 text-xs">
            <div className="font-semibold text-crm-text uppercase tracking-wider text-[11px] border-b border-crm-border pb-2 flex items-center justify-between">
              <span>Account Dossier</span>
              <ShieldAlert className="w-3.5 h-3.5 text-turquoise" />
            </div>

            {/* Profile overview */}
            <div className="text-center py-2 space-y-2">
              <Avatar name={activeClientName} size="md" className="mx-auto" />
              <div>
                <div className="font-bold text-crm-text text-sm">{activeClientName}</div>
                <div className="text-[11px] text-crm-textMuted">{activeConversation.companyName}</div>
              </div>
            </div>

            {/* Channels */}
            <div className="p-3 rounded bg-crm-surface border border-crm-border/60 space-y-2">
              <div className="flex items-center gap-2 text-crm-textSecondary">
                <Mail className="w-3.5 h-3.5 text-crm-textMuted flex-shrink-0" />
                <span className="truncate">{activeEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-crm-textSecondary">
                <Phone className="w-3.5 h-3.5 text-crm-textMuted flex-shrink-0" />
                <span>{activePhone}</span>
              </div>
            </div>

            {/* Linked Deals */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider flex items-center justify-between">
                <span>Associated Deals ({clientDeals.length})</span>
                <Briefcase className="w-3 h-3 text-turquoise" />
              </div>

              {clientDeals.length === 0 ? (
                <div className="p-2.5 rounded bg-crm-surface border border-crm-border/40 text-[11px] text-crm-textMuted">
                  No direct deals linked yet.
                </div>
              ) : (
                clientDeals.map(d => (
                  <div key={d.id} className="p-2.5 rounded bg-crm-surface border border-crm-border space-y-1">
                    <div className="font-semibold text-crm-text truncate">{d.name}</div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-turquoise font-bold">₹{d.value.toLocaleString('en-IN')}</span>
                      <Badge variant="neutral" size="sm">{d.stage}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Scheduled Meetings */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider flex items-center justify-between">
                <span>Next Meeting</span>
                <Calendar className="w-3 h-3 text-turquoise" />
              </div>

              {clientMeetings.length === 0 ? (
                <div className="p-2.5 rounded bg-crm-surface border border-crm-border/40 text-[11px] text-crm-textMuted">
                  No upcoming meetings scheduled.
                </div>
              ) : (
                <div className="p-2.5 rounded bg-crm-surface border border-crm-border space-y-1">
                  <div className="font-medium text-crm-text">{clientMeetings[0].title}</div>
                  <div className="text-[11px] text-turquoise">
                    {clientMeetings[0].date} at {clientMeetings[0].time}
                  </div>
                </div>
              )}
            </div>

            {/* Pending Follow-ups */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider flex items-center justify-between">
                <span>Active SLA Tasks</span>
                <Clock className="w-3 h-3 text-turquoise" />
              </div>

              {clientFollowUps.length === 0 ? (
                <div className="p-2.5 rounded bg-crm-surface border border-crm-border/40 text-[11px] text-crm-textMuted">
                  No pending follow-ups.
                </div>
              ) : (
                clientFollowUps.slice(0, 2).map(fu => (
                  <div key={fu.id} className="p-2.5 rounded bg-crm-surface border border-crm-border space-y-0.5">
                    <div className="font-medium text-crm-text">{fu.taskDescription}</div>
                    <div className="text-[11px] text-crm-textMuted">Due: {fu.dueDate}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
