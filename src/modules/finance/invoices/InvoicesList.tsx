import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Invoice, InvoiceStatus } from '../../../types/finance';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { RecordPaymentModal } from '../payments/RecordPaymentModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Send, 
  CreditCard, 
  Eye, 
  ExternalLink,
  Download,
  Building2,
  FolderKanban
} from 'lucide-react';

export const InvoicesList: React.FC = () => {
  const { 
    invoices, 
    companies, 
    projects, 
    sendInvoice, 
    cancelInvoice, 
    markInvoiceOverdue, 
    navigateTo 
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Search
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.projectName && inv.projectName.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

      // Client
      const matchesClient = clientFilter === 'all' || inv.clientId === clientFilter;

      // Project
      const matchesProject = projectFilter === 'all' || inv.projectId === projectFilter;

      return matchesSearch && matchesStatus && matchesClient && matchesProject;
    });
  }, [invoices, searchQuery, statusFilter, clientFilter, projectFilter]);

  // Counts by status
  const counts = useMemo(() => {
    return {
      all: invoices.length,
      draft: invoices.filter(i => i.status === 'draft').length,
      sent: invoices.filter(i => i.status === 'sent').length,
      partially_paid: invoices.filter(i => i.status === 'partially_paid').length,
      paid: invoices.filter(i => i.status === 'paid').length,
      overdue: invoices.filter(i => i.status === 'overdue').length,
      cancelled: invoices.filter(i => i.status === 'cancelled').length,
    };
  }, [invoices]);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">PAID</span>;
      case 'partially_paid':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">PARTIALLY PAID</span>;
      case 'overdue':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">OVERDUE</span>;
      case 'sent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30">SENT</span>;
      case 'draft':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">DRAFT</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-950/40 text-rose-400/80 border border-rose-900/30">CANCELLED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              Commercial Invoices
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30">
              {invoices.length} Total
            </span>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Client billing records, milestone payment tranches, and tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('/app/finance/overdue')}
            leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
          >
            Overdue Recovery ({counts.overdue})
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        {[
          { id: 'all', label: 'All Invoices', count: counts.all },
          { id: 'draft', label: 'Draft', count: counts.draft },
          { id: 'sent', label: 'Sent', count: counts.sent },
          { id: 'partially_paid', label: 'Partially Paid', count: counts.partially_paid },
          { id: 'paid', label: 'Paid', count: counts.paid },
          { id: 'overdue', label: 'Overdue', count: counts.overdue },
          { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setStatusFilter(t.id)}
            className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 shrink-0 ${
              statusFilter === t.id
                ? 'bg-turquoise/20 text-turquoise border border-turquoise/40 font-semibold'
                : 'bg-crm-surface/60 text-crm-textMuted hover:text-crm-text border border-crm-border'
            }`}
          >
            <span>{t.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-crm-bg/80 text-crm-textSecondary">
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-crm-textMuted" />
            <input
              type="text"
              placeholder="Search by invoice number, client name, or project title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded bg-crm-surface border border-crm-border text-xs text-crm-text placeholder:text-crm-textMuted focus:outline-none focus:border-turquoise"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="bg-crm-surface border border-crm-border rounded px-2.5 py-1.5 text-xs text-crm-text font-mono focus:outline-none focus:border-turquoise"
            >
              <option value="all">All Clients</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-crm-surface border border-crm-border rounded px-2.5 py-1.5 text-xs text-crm-text font-mono focus:outline-none focus:border-turquoise"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-crm-surface/80 border-b border-crm-border text-[11px] font-mono text-crm-textMuted uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">Project</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-right">Paid</th>
                <th className="p-3.5 text-right">Outstanding</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-border/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-crm-textMuted">
                    No commercial invoices found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr 
                    key={inv.id} 
                    className="hover:bg-crm-surface/40 transition-colors"
                  >
                    <td className="p-3.5 font-mono font-bold text-turquoise">
                      <button
                        onClick={() => navigateTo(`/app/finance/invoices/${inv.id}`)}
                        className="hover:underline flex items-center gap-1 text-left"
                      >
                        <span>{inv.invoiceNumber}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </button>
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => navigateTo(`/app/crm/companies/${inv.clientId}`)}
                        className="font-medium text-crm-text hover:text-turquoise transition-colors block text-left"
                      >
                        {inv.clientName}
                      </button>
                    </td>

                    <td className="p-3.5 text-crm-textSecondary truncate max-w-[200px]">
                      {inv.projectName ? (
                        <button
                          onClick={() => inv.projectId && navigateTo(`/app/projects/${inv.projectId}`)}
                          className="hover:text-turquoise transition-colors truncate block text-left"
                        >
                          {inv.projectName}
                        </button>
                      ) : (
                        <span className="text-crm-textMuted italic">—</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right font-mono font-semibold text-white">
                      ₹{inv.total.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-right font-mono text-emerald-400">
                      ₹{inv.paidAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold">
                      <span className={inv.outstandingAmount > 0 ? (inv.status === 'overdue' ? 'text-rose-400' : 'text-amber-400') : 'text-slate-500'}>
                        ₹{inv.outstandingAmount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      {getStatusBadge(inv.status)}
                    </td>

                    <td className="p-3.5 font-mono text-crm-textMuted text-[11px]">
                      {inv.dueDate}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== 'paid' && inv.status !== 'cancelled' && inv.status !== 'draft' && (
                          <Button
                            variant="secondary"
                            size="xs"
                            leftIcon={<CreditCard className="w-3 h-3 text-turquoise" />}
                            onClick={() => setSelectedInvoiceForPayment(inv)}
                            title="Record Payment"
                          >
                            Pay
                          </Button>
                        )}

                        {inv.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="xs"
                            leftIcon={<Send className="w-3 h-3 text-turquoise" />}
                            onClick={() => sendInvoice(inv.id)}
                            title="Send to client"
                          >
                            Send
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => navigateTo(`/app/finance/invoices/${inv.id}`)}
                          title="View Invoice Detail"
                        >
                          <Eye className="w-3.5 h-3.5 text-crm-textMuted hover:text-white" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <CreateInvoiceModal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <RecordPaymentModal
          isOpen={true}
          onClose={() => setSelectedInvoiceForPayment(null)}
          invoice={selectedInvoiceForPayment}
        />
      )}
    </div>
  );
};
