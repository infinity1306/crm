import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { DealStage } from '../../../types/crm';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { AddContactModal } from '../contacts/AddContactModal';
import { AddDealModal } from '../deals/AddDealModal';
import { 
  ArrowLeft, 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  IndianRupee, 
  Briefcase, 
  Mail, 
  Phone, 
  Plus, 
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  FileText
} from 'lucide-react';
import { cn } from '../../../utils/cn';

interface CompanyDetailProps {
  companyId: string;
}

export const CompanyDetail: React.FC<CompanyDetailProps> = ({ companyId }) => {
  const { 
    companies, 
    contacts, 
    deals, 
    meetings,
    invoices,
    payments,
    navigateTo, 
    updateCompany, 
    addToast,
    currentUser 
  } = useCRM();

  const company = companies.find(c => c.id === companyId);
  const [activeTab, setActiveTab] = useState<'deals' | 'contacts' | 'meetings' | 'notes' | 'financials'>('deals');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [companyNotes, setCompanyNotes] = useState<string[]>(() => {
    return company?.notes ? [company.notes] : [
      'Strategic Indian enterprise account. Evaluating multi-node blockchain deployment.',
      'NDA executed. Commercial pricing schedule sent to Finance & Legal.'
    ];
  });

  if (!company) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <Building2 className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-base font-semibold text-crm-text">Company Account Not Found</h2>
        <p className="text-xs text-crm-textSecondary">The requested enterprise account could not be found in the registry.</p>
        <Button variant="secondary" size="sm" onClick={() => navigateTo('/app/crm/companies')}>
          Back to Companies Directory
        </Button>
      </div>
    );
  }

  // Linked entities
  const linkedContacts = contacts.filter(c => c.companyId === company.id);
  const linkedDeals = deals.filter(d => d.companyId === company.id);
  const linkedMeetings = meetings.filter(m => m.companyName === company.name || linkedDeals.some(d => d.id === m.dealId));

  const totalDealsValue = linkedDeals.reduce((acc, d) => acc + d.value, 0);

  const companyInvoices = invoices.filter(inv => inv.clientId === company.id);
  const companyPayments = payments.filter(p => p.clientId === company.id);
  const totalInvoiced = companyInvoices.reduce((a, b) => a + b.total, 0);
  const totalCollected = companyInvoices.reduce((a, b) => a + b.paidAmount, 0);
  const totalOutstanding = companyInvoices.reduce((a, b) => a + b.outstandingAmount, 0);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const updated = [noteText.trim(), ...companyNotes];
    setCompanyNotes(updated);
    updateCompany(company.id, { notes: updated.join('\n\n') });
    setNoteText('');
    addToast({ type: 'success', title: 'Note Saved', message: 'Account strategy note updated.' });
  };

  const getDealStageBadge = (stage: DealStage) => {
    switch (stage) {
      case 'new': return <Badge variant="neutral">New Deal</Badge>;
      case 'qualified': return <Badge variant="primary">Qualified</Badge>;
      case 'proposal': return <Badge variant="warning">Proposal</Badge>;
      case 'negotiation': return <Badge variant="warning">Negotiation</Badge>;
      case 'won': return <Badge variant="success">Closed Won</Badge>;
      case 'lost': return <Badge variant="error">Closed Lost</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigateTo('/app/crm/companies')}
          className="flex items-center gap-1.5 text-xs text-crm-textSecondary hover:text-turquoise transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Companies Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Briefcase className="w-3.5 h-3.5" />}
            onClick={() => setIsAddDealOpen(true)}
          >
            Create Deal
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddContactOpen(true)}
          >
            Add Stakeholder
          </Button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-5 rounded-lg bg-crm-card border border-crm-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-turquoise/10 border border-turquoise/30 flex items-center justify-center text-turquoise font-semibold text-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-crm-text">{company.name}</h1>
                <Badge variant="primary">{company.industry}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-crm-textSecondary mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-crm-textMuted" />
                  {company.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-crm-textMuted" />
                  {company.employeeRange}
                </span>
                <span>•</span>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-turquoise hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{company.website.replace('https://', '')}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-crm-border pt-3 md:pt-0 md:pl-6">
            <div>
              <div className="text-[11px] text-crm-textMuted uppercase tracking-wider font-mono">Total Account Pipeline</div>
              <div className="text-lg font-bold text-turquoise">
                ₹{totalDealsValue.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-crm-textMuted uppercase tracking-wider font-mono">Account Manager</div>
              <div className="text-xs font-medium text-crm-text mt-0.5 flex items-center gap-1.5">
                <Avatar name={company.ownerName} size="xs" />
                <span>{company.ownerName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Details & Specs */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-crm-card border border-crm-border space-y-3.5 text-xs">
            <div className="font-semibold text-crm-text uppercase tracking-wider text-[11px] border-b border-crm-border/60 pb-2">
              Corporate Account Profile
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="text-crm-textMuted text-[11px]">Primary Sign-off Contact</div>
                <div className="text-crm-text font-medium mt-0.5">{company.primaryContactName}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="text-crm-textMuted text-[11px]">Corporate Email</div>
                  <div className="text-crm-text mt-0.5 truncate">{company.email || 'None on file'}</div>
                </div>
                <div>
                  <div className="text-crm-textMuted text-[11px]">Direct Switchboard</div>
                  <div className="text-crm-text mt-0.5">{company.phone || '+91 22 4000 0000'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-crm-border/40">
                <div className="text-crm-textMuted text-[11px] mb-1">Commercial Summary</div>
                <div className="text-crm-text font-medium">
                  {linkedDeals.length} active opportunities ({linkedDeals.filter(d => d.stage === 'won').length} won contracts)
                </div>
              </div>

              <div className="pt-2 border-t border-crm-border/40">
                <div className="text-crm-textMuted text-[11px] mb-1">Executive Notes</div>
                <p className="text-crm-textSecondary text-xs p-2 rounded bg-crm-surface border border-crm-border/50">
                  {company.notes || 'Enterprise account actively being serviced by Star Chain Labs core development team.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workspaces (Deals, Contacts, Meetings, Notes) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-lg bg-crm-card border border-crm-border">
            {/* Nav Tabs */}
            <div className="flex items-center gap-2 border-b border-crm-border pb-3 mb-4 text-xs">
              <button
                onClick={() => setActiveTab('deals')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors",
                  activeTab === 'deals' ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder" : "text-crm-textSecondary hover:text-crm-text"
                )}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Deals ({linkedDeals.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('contacts')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors",
                  activeTab === 'contacts' ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder" : "text-crm-textSecondary hover:text-crm-text"
                )}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Stakeholders ({linkedContacts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('meetings')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors",
                  activeTab === 'meetings' ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder" : "text-crm-textSecondary hover:text-crm-text"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Syncs & Meetings ({linkedMeetings.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors",
                  activeTab === 'notes' ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder" : "text-crm-textSecondary hover:text-crm-text"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Account Strategy</span>
              </button>

              <button
                onClick={() => setActiveTab('financials')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors",
                  activeTab === 'financials' ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder" : "text-crm-textSecondary hover:text-crm-text"
                )}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Financials & Invoices ({companyInvoices.length})</span>
              </button>
            </div>

            {/* Tab 1: Deals */}
            {activeTab === 'deals' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-crm-textSecondary">Active Opportunities</span>
                  <Button
                    variant="primary"
                    size="xs"
                    icon={<Plus className="w-3 h-3" />}
                    onClick={() => setIsAddDealOpen(true)}
                  >
                    New Deal
                  </Button>
                </div>

                {linkedDeals.length === 0 ? (
                  <div className="text-center py-8 text-crm-textMuted border border-dashed border-crm-border/50 rounded-lg">
                    No active deals associated with this account.
                  </div>
                ) : (
                  linkedDeals.map(deal => (
                    <div
                      key={deal.id}
                      className="p-3.5 rounded-md bg-crm-surface border border-crm-border flex items-center justify-between hover:border-turquoise/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-crm-text flex items-center gap-2">
                          <span>{deal.name}</span>
                          {getDealStageBadge(deal.stage)}
                        </div>
                        <div className="text-[11px] text-crm-textMuted flex items-center gap-3">
                          <span>Contact: {deal.primaryContactName}</span>
                          <span>•</span>
                          <span>Close: {deal.expectedCloseDate}</span>
                          <span>•</span>
                          <span>Prob: {deal.probability}%</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-turquoise text-sm">
                          ₹{deal.value.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-crm-textMuted">Owner: {deal.ownerName}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Contacts */}
            {activeTab === 'contacts' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-crm-textSecondary">Enrolled Stakeholders</span>
                  <Button
                    variant="primary"
                    size="xs"
                    icon={<Plus className="w-3 h-3" />}
                    onClick={() => setIsAddContactOpen(true)}
                  >
                    Add Contact
                  </Button>
                </div>

                {linkedContacts.length === 0 ? (
                  <div className="text-center py-8 text-crm-textMuted border border-dashed border-crm-border/50 rounded-lg">
                    No individual contacts linked yet.
                  </div>
                ) : (
                  linkedContacts.map(contact => (
                    <div
                      key={contact.id}
                      className="p-3 rounded-md bg-crm-surface border border-crm-border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={contact.name} size="sm" />
                        <div>
                          <div className="font-semibold text-crm-text">{contact.name}</div>
                          <div className="text-[11px] text-crm-textMuted">{contact.role}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <div className="text-crm-text">{contact.email}</div>
                          <div className="text-[11px] text-crm-textMuted">{contact.phone}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => navigateTo('/app/communication/messages')}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-crm-textMuted hover:text-turquoise" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Meetings */}
            {activeTab === 'meetings' && (
              <div className="space-y-3 text-xs">
                {linkedMeetings.length === 0 ? (
                  <div className="text-center py-8 text-crm-textMuted border border-dashed border-crm-border/50 rounded-lg">
                    No scheduled meetings for this company.
                  </div>
                ) : (
                  linkedMeetings.map(m => (
                    <div key={m.id} className="p-3.5 rounded-md bg-crm-surface border border-crm-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-crm-text">{m.title}</div>
                        <Badge variant={m.status === 'completed' ? 'success' : 'neutral'}>{m.status}</Badge>
                      </div>
                      <div className="text-[11px] text-crm-textMuted">
                        {m.date} at {m.time} • Host: {m.hostEmployeeName}
                      </div>
                      <p className="text-crm-textSecondary text-xs">{m.agenda}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 4: Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4 text-xs">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={3}
                    placeholder="Log executive briefing, relationship status, or contract notes..."
                    className="w-full px-3 py-2 bg-crm-surface border border-crm-border rounded-md text-xs text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
                  />
                  <div className="flex justify-end">
                    <Button variant="primary" size="xs" type="submit">
                      Save Account Note
                    </Button>
                  </div>
                </form>

                <div className="space-y-2 pt-2 border-t border-crm-border/60">
                  {companyNotes.map((nt, idx) => (
                    <div key={idx} className="p-3 rounded bg-crm-surface/70 border border-crm-border/60 text-crm-textSecondary leading-relaxed">
                      {nt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Financials & Invoices */}
            {activeTab === 'financials' && (
              <div className="space-y-4 text-xs">
                {/* Account Financial Telemetry Strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-crm-surface border border-crm-border">
                    <span className="text-[10px] text-crm-textMuted uppercase tracking-wider block">Billed to Account</span>
                    <span className="text-sm font-bold font-mono text-crm-text mt-0.5 block">
                      ₹{totalInvoiced.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-crm-surface border border-crm-border">
                    <span className="text-[10px] text-crm-textMuted uppercase tracking-wider block">Total Received</span>
                    <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                      ₹{totalCollected.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-crm-surface border border-crm-border">
                    <span className="text-[10px] text-crm-textMuted uppercase tracking-wider block">Receivable Balance</span>
                    <span className={`text-sm font-bold font-mono mt-0.5 block ${totalOutstanding > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                      ₹{totalOutstanding.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Invoices List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-crm-text">Commercial Invoices ({companyInvoices.length})</span>
                    <button
                      onClick={() => navigateTo('/app/finance/invoices')}
                      className="text-[11px] text-turquoise hover:underline inline-flex items-center gap-1"
                    >
                      <span>Invoices Desk</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {companyInvoices.length === 0 ? (
                    <div className="text-center py-6 text-crm-textMuted border border-dashed border-crm-border/50 rounded-lg">
                      No invoices have been billed to this corporate account yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {companyInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="p-3 rounded bg-crm-surface border border-crm-border flex items-center justify-between hover:border-turquoise/40 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigateTo(`/app/finance/invoices/${inv.id}`)}
                                className="font-mono font-semibold text-turquoise hover:underline"
                              >
                                {inv.invoiceNumber}
                              </button>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                inv.status === 'paid' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40' :
                                inv.status === 'overdue' ? 'bg-rose-950/50 text-rose-400 border border-rose-800/40' :
                                inv.status === 'partially_paid' ? 'bg-amber-950/50 text-amber-400 border border-amber-800/40' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {inv.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-[11px] text-crm-textMuted mt-0.5">
                              Due: {inv.dueDate} • {inv.items.length} item(s) {inv.projectName ? `• Project: ${inv.projectName}` : ''}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-mono font-bold text-crm-text">₹{inv.total.toLocaleString('en-IN')}</div>
                            {inv.outstandingAmount > 0 && (
                              <div className="text-[10px] font-mono text-amber-400">Due: ₹{inv.outstandingAmount.toLocaleString('en-IN')}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payments Settled */}
                {companyPayments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-crm-border/50">
                    <span className="text-xs font-semibold text-crm-text">Remittance History ({companyPayments.length})</span>
                    <div className="space-y-1.5">
                      {companyPayments.map((p) => (
                        <div key={p.id} className="p-2.5 rounded bg-crm-surface/60 border border-crm-border/60 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-mono text-slate-300">{p.reference}</span>
                            <span className="text-crm-textMuted ml-2">({p.date} • {p.method.replace('_', ' ')})</span>
                          </div>
                          <span className="font-mono font-semibold text-emerald-400">
                            +₹{p.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        defaultCompanyId={company.id}
      />

      <AddDealModal
        isOpen={isAddDealOpen}
        onClose={() => setIsAddDealOpen(false)}
        defaultCompanyId={company.id}
      />
    </div>
  );
};
