import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { ClientProjectPortalWidget } from '../widgets/ClientProjectPortalWidget';
import { WidgetContainer } from '../components/WidgetContainer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { WidgetId } from '../types';
import { 
  FolderKanban, 
  Receipt, 
  LifeBuoy, 
  MessageSquare, 
  FileText, 
  Download, 
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface ClientDashboardProps {
  enabledWidgets: WidgetId[];
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ enabledWidgets }) => {
  const { 
    currentUser, 
    tickets, 
    invoices, 
    createTicket, 
    navigateTo, 
    addToast 
  } = useCRM();

  const isEnabled = (id: WidgetId) => enabledWidgets.includes(id);

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');
  const [clientMessage, setClientMessage] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;

    createTicket({
      title: ticketSubject,
      description: ticketDetails || 'Client submitted request from portal',
      projectId: 'p-1',
      projectName: 'Project Atlas',
      priority: 'medium',
      type: 'client_issue',
      status: 'open',
      assignedToId: 'emp-3',
      assignedToName: 'Siddharth Rao',
      createdBy: currentUser.id,
      createdByName: currentUser.name
    });

    setTicketSubject('');
    setTicketDetails('');
    addToast({
      type: 'success',
      title: 'Ticket Submitted',
      message: 'Your request has been logged with the engineering team.'
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientMessage.trim()) return;

    addToast({
      type: 'success',
      title: 'Message Sent',
      message: 'Your project lead Siddharth Rao has been notified.'
    });
    setClientMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-4 bg-crm-surface border border-crm-border rounded-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-crm-text">ABC Technologies Client Workspace</h2>
            <p className="text-[11px] text-crm-textMuted">
              Dedicated client portal powered by Star Chain Labs. Enterprise SLA Active.
            </p>
          </div>
        </div>
        <Badge variant="primary" className="hidden sm:inline-flex">Enterprise Tier</Badge>
      </div>

      {/* Main Client Deliverables & Milestones */}
      <ClientProjectPortalWidget />

      {/* Client Support Ticket & Direct Communication */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Ticket */}
        <WidgetContainer
          title="Submit Support / Change Request"
          subtitle="Direct escalation to your dedicated account engineering team"
          badge="SLA: < 2 Hours"
          badgeType="primary"
        >
          <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-crm-textMuted mb-1">
                Subject
              </label>
              <Input
                placeholder="e.g. Request staging API credentials or review"
                value={ticketSubject}
                onChange={e => setTicketSubject(e.target.value)}
                className="text-xs py-1.5"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-crm-textMuted mb-1">
                Details & Scope
              </label>
              <textarea
                placeholder="Describe your request or issue..."
                value={ticketDetails}
                onChange={e => setTicketDetails(e.target.value)}
                className="w-full bg-crm-surface border border-crm-border rounded p-2 text-xs text-crm-text focus:border-turquoise focus:outline-none h-20 resize-none"
              />
            </div>
            <Button variant="primary" size="sm" type="submit" className="gap-1.5 text-xs">
              <LifeBuoy className="w-3.5 h-3.5" /> Submit Request
            </Button>
          </form>
        </WidgetContainer>

        {/* Message Project Lead */}
        <WidgetContainer
          title="Message Project Team"
          subtitle="Direct line to Siddharth Rao (Lead Architect)"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-crm-surface border border-crm-border/60 rounded space-y-2">
              <div className="flex items-center justify-between text-[10px] text-crm-textMuted">
                <span className="font-semibold text-turquoise">Siddharth Rao (Star Chain Labs)</span>
                <span>10:45 AM Today</span>
              </div>
              <p className="text-[11px] text-crm-text">
                "Hi Rajesh, we have finalized the webhook retry contracts. The staging sandbox has been updated for your team."
              </p>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-2">
              <Input
                placeholder="Type your response to the project lead..."
                value={clientMessage}
                onChange={e => setClientMessage(e.target.value)}
                className="text-xs py-1.5"
              />
              <div className="flex justify-end">
                <Button variant="outline" size="sm" type="submit" className="gap-1.5 text-xs">
                  <Send className="w-3 h-3 text-turquoise" /> Send Message
                </Button>
              </div>
            </form>
          </div>
        </WidgetContainer>
      </div>
    </div>
  );
};
