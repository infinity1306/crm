import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { WidgetContainer } from '../components/WidgetContainer';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  LifeBuoy, 
  MessageSquare,
  FileText,
  Download
} from 'lucide-react';

export const ClientProjectPortalWidget: React.FC = () => {
  const { projects, invoices, tickets, calculateProjectProgress, navigateTo } = useCRM();

  // Show the client's assigned project (e.g. Project Atlas or CRM Integration)
  const clientProject = projects[0];
  const progress = clientProject ? calculateProjectProgress(clientProject.id).overall : 74;

  const clientInvoices = invoices.slice(0, 3);
  const clientTickets = tickets.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Active Project Delivery Status */}
      <WidgetContainer
        title="Project Delivery Portal"
        subtitle={clientProject ? `${clientProject.name} · Enterprise Integration` : 'Active Client Scope'}
        badge="Active Workstream"
        badgeType="success"
      >
        <div className="space-y-3">
          <div className="p-3 bg-crm-surface border border-crm-border/60 rounded-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <h4 className="text-xs font-bold text-crm-text">Current Phase: Phase 2 Core Integration</h4>
                <p className="text-[11px] text-crm-textMuted">Target Completion: October 30, 2026</p>
              </div>
              <span className="text-sm font-bold font-mono text-turquoise">{progress}%</span>
            </div>

            <div className="w-full h-2 bg-crm-card rounded-full overflow-hidden mb-3">
              <div className="h-full bg-turquoise transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-crm-card/50 rounded border border-crm-border/40">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Lead Architect</span>
                <p className="font-semibold text-crm-text mt-0.5">Siddharth Rao</p>
              </div>
              <div className="p-2 bg-crm-card/50 rounded border border-crm-border/40">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Upcoming Checkpoint</span>
                <p className="font-semibold text-turquoise mt-0.5">Security & API Audit</p>
              </div>
              <div className="p-2 bg-crm-card/50 rounded border border-crm-border/40">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Support SLA</span>
                <p className="font-semibold text-emerald-400 mt-0.5">99.9% Enterprise Tier</p>
              </div>
            </div>
          </div>
        </div>
      </WidgetContainer>

      {/* Client Deliverables & Milestones */}
      <WidgetContainer
        title="Approved Milestones & Releases"
        subtitle="Shared deliverables verified by Star Chain Labs quality team"
      >
        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-crm-surface border border-crm-border/60 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-crm-text">Milestone 1: Architecture Specification & Database Schema</p>
                <p className="text-[10px] text-crm-textMuted">Approved & Signed off on Aug 28, 2026</p>
              </div>
            </div>
            <Badge variant="success">Completed</Badge>
          </div>

          <div className="p-2.5 bg-crm-surface border border-crm-border/60 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-turquoise flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-medium text-crm-text">Milestone 2: External API Gateway & Webhook Sync</p>
                <p className="text-[10px] text-crm-textMuted">In Review · Ready for staging test</p>
              </div>
            </div>
            <Badge variant="warning">In Progress</Badge>
          </div>

          <div className="p-2.5 bg-crm-surface border border-crm-border/60 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-crm-textMuted flex-shrink-0" />
              <div>
                <p className="font-medium text-crm-text">Milestone 3: Final Security Penetration Report</p>
                <p className="text-[10px] text-crm-textMuted">Scheduled for Oct 15, 2026</p>
              </div>
            </div>
            <Badge variant="neutral">Upcoming</Badge>
          </div>
        </div>
      </WidgetContainer>

      {/* Client Billing & Invoices */}
      <WidgetContainer
        title="Invoices & Statements"
        subtitle="Official tax invoices for ABC Technologies scope"
        action={
          <button
            onClick={() => navigateTo('/app/finance/invoices')}
            className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
          >
            Download All Statements
          </button>
        }
      >
        <div className="space-y-2">
          {clientInvoices.map(inv => (
            <div
              key={inv.id}
              className="p-2.5 bg-crm-surface border border-crm-border/60 rounded flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-turquoise" />
                <div>
                  <p className="font-semibold text-crm-text">{inv.invoiceNumber}</p>
                  <p className="text-[10px] text-crm-textMuted">Due: {inv.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-crm-text">${inv.total.toLocaleString()}</span>
                <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'error' : 'warning'}>
                  {inv.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </WidgetContainer>
    </div>
  );
};
