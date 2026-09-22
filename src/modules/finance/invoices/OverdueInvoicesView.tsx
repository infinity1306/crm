import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import {
  AlertTriangle,
  Clock,
  Building2,
  Mail,
  Send,
  CreditCard,
  FileText,
  Search,
  ExternalLink,
  CheckCircle2,
  PhoneCall,
  DollarSign
} from 'lucide-react';
import RecordPaymentModal from '../payments/RecordPaymentModal';

export const OverdueInvoicesView: React.FC = () => {
  const { invoices, financeMetrics, navigateTo } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgingBucket, setSelectedAgingBucket] = useState<'all' | '1-15' | '16-30' | '31-60' | '60+'>('all');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState<{ message: string; client: string } | null>(null);

  // Helper to calculate days overdue
  const getDaysOverdue = (dueDateStr: string): number => {
    const today = new Date('2026-09-21'); // Current app simulation date
    const due = new Date(dueDateStr);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Filter overdue or unpaid invoices past due date
  const overdueInvoices = invoices.filter(inv => {
    if (inv.status === 'cancelled' || inv.status === 'paid') return false;
    const days = getDaysOverdue(inv.dueDate);
    return inv.status === 'overdue' || (days > 0 && inv.outstandingAmount > 0);
  }).map(inv => ({
    ...inv,
    daysOverdue: getDaysOverdue(inv.dueDate)
  }));

  // Aging Buckets
  const bucket1_15 = overdueInvoices.filter(i => i.daysOverdue >= 1 && i.daysOverdue <= 15);
  const bucket16_30 = overdueInvoices.filter(i => i.daysOverdue >= 16 && i.daysOverdue <= 30);
  const bucket31_60 = overdueInvoices.filter(i => i.daysOverdue >= 31 && i.daysOverdue <= 60);
  const bucket60Plus = overdueInvoices.filter(i => i.daysOverdue > 60);

  const totalOverdueSum = overdueInvoices.reduce((acc, curr) => acc + curr.outstandingAmount, 0);

  // Filtered by search and bucket
  const filteredInvoices = overdueInvoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedAgingBucket === '1-15') return inv.daysOverdue >= 1 && inv.daysOverdue <= 15;
    if (selectedAgingBucket === '16-30') return inv.daysOverdue >= 16 && inv.daysOverdue <= 30;
    if (selectedAgingBucket === '31-60') return inv.daysOverdue >= 31 && inv.daysOverdue <= 60;
    if (selectedAgingBucket === '60+') return inv.daysOverdue > 60;

    return true;
  });

  const handleSendReminder = (clientName: string, invNum: string) => {
    setReminderToast({
      client: clientName,
      message: `Commercial follow-up dispatch recorded for ${invNum}. Notification ping dispatched to accounts.`
    });
    setTimeout(() => setReminderToast(null), 4000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Receivables & Recovery Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Overdue Receivables</h1>
          <p className="text-sm text-slate-400">
            Systematic tracking and recovery management for unsettled invoices past contracted payment terms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/app/finance/invoices')}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            All Invoices
          </button>
          <button
            onClick={() => navigateTo('/app/finance/payments')}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-slate-400" />
            Payment History
          </button>
        </div>
      </div>

      {reminderToast && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{reminderToast.message}</span>
          </div>
          <button onClick={() => setReminderToast(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Aging Analysis Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div
          onClick={() => setSelectedAgingBucket('all')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedAgingBucket === 'all'
              ? 'bg-[#10171D] border-teal-500/60 ring-1 ring-teal-500/20'
              : 'bg-[#0D1216] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Total Overdue</div>
          <div className="text-lg font-bold font-mono text-rose-400">₹{totalOverdueSum.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500 mt-1">{overdueInvoices.length} invoices</div>
        </div>

        <div
          onClick={() => setSelectedAgingBucket('1-15')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedAgingBucket === '1-15'
              ? 'bg-[#10171D] border-amber-500/60 ring-1 ring-amber-500/20'
              : 'bg-[#0D1216] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-medium text-amber-400/90 uppercase tracking-wider mb-1">1 - 15 Days</div>
          <div className="text-lg font-bold font-mono text-slate-200">
            ₹{bucket1_15.reduce((a, b) => a + b.outstandingAmount, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{bucket1_15.length} accounts</div>
        </div>

        <div
          onClick={() => setSelectedAgingBucket('16-30')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedAgingBucket === '16-30'
              ? 'bg-[#10171D] border-amber-500/60 ring-1 ring-amber-500/20'
              : 'bg-[#0D1216] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-medium text-amber-500 uppercase tracking-wider mb-1">16 - 30 Days</div>
          <div className="text-lg font-bold font-mono text-slate-200">
            ₹{bucket16_30.reduce((a, b) => a + b.outstandingAmount, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{bucket16_30.length} accounts</div>
        </div>

        <div
          onClick={() => setSelectedAgingBucket('31-60')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedAgingBucket === '31-60'
              ? 'bg-[#10171D] border-rose-500/60 ring-1 ring-rose-500/20'
              : 'bg-[#0D1216] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-medium text-rose-400 uppercase tracking-wider mb-1">31 - 60 Days</div>
          <div className="text-lg font-bold font-mono text-rose-300">
            ₹{bucket31_60.reduce((a, b) => a + b.outstandingAmount, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{bucket31_60.length} accounts</div>
        </div>

        <div
          onClick={() => setSelectedAgingBucket('60+')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedAgingBucket === '60+'
              ? 'bg-[#10171D] border-rose-500/60 ring-1 ring-rose-500/20'
              : 'bg-[#0D1216] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-medium text-rose-500 uppercase tracking-wider mb-1">60+ Days (Critical)</div>
          <div className="text-lg font-bold font-mono text-rose-400">
            ₹{bucket60Plus.reduce((a, b) => a + b.outstandingAmount, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{bucket60Plus.length} accounts</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search overdue invoice or client..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#080C0E] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Active filter:</span>
          <span className="font-semibold text-white uppercase bg-slate-800 px-2 py-0.5 rounded">
            {selectedAgingBucket === 'all' ? 'All Aging Tiers' : `${selectedAgingBucket} Days`}
          </span>
          {selectedAgingBucket !== 'all' && (
            <button
              onClick={() => setSelectedAgingBucket('all')}
              className="text-teal-400 hover:underline text-xs ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Overdue Queue Table */}
      <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No Invoices Match Current Filter</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Outstanding receivables are clear under this aging threshold.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D10] border-b border-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Invoice & Client</th>
                  <th className="py-3.5 px-4 font-semibold">Terms & Due Date</th>
                  <th className="py-3.5 px-4 font-semibold">Days Overdue</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Total Billed</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Outstanding Due</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredInvoices.map((inv) => {
                  const isSevere = inv.daysOverdue > 30;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isSevere ? 'bg-rose-950/40 text-rose-400 border border-rose-800/50' : 'bg-amber-950/40 text-amber-400 border border-amber-800/50'
                          }`}>
                            !
                          </div>
                          <div>
                            <button
                              onClick={() => navigateTo(`/app/finance/invoices/${inv.id}`)}
                              className="font-mono font-semibold text-white hover:text-teal-400 flex items-center gap-1.5"
                            >
                              {inv.invoiceNumber}
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </button>
                            <div className="text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-500" />
                              {inv.clientName}
                            </div>
                            {inv.clientEmail && (
                              <div className="text-slate-500 text-[10px] mt-0.5">{inv.clientEmail}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-slate-300 font-medium">{inv.dueDate}</div>
                        <div className="text-[11px] text-slate-500">Issued {inv.issueDate}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{inv.paymentTerms || 'Net 15'}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${
                          inv.daysOverdue > 60
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                            : inv.daysOverdue > 30
                            ? 'bg-rose-950/40 text-rose-400 border-rose-900/60'
                            : 'bg-amber-950/40 text-amber-400 border-amber-800/50'
                        }`}>
                          <Clock className="w-3 h-3" />
                          +{inv.daysOverdue} days
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-mono text-slate-400">
                        ₹{inv.total.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-bold text-sm text-rose-400">
                          ₹{inv.outstandingAmount.toLocaleString('en-IN')}
                        </div>
                        {inv.paidAmount > 0 && (
                          <div className="text-[10px] font-mono text-emerald-400">
                            (₹{inv.paidAmount.toLocaleString('en-IN')} cleared)
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendReminder(inv.clientName, inv.invoiceNumber)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
                            title="Dispatch Payment Reminder"
                          >
                            <Mail className="w-3 h-3 text-teal-400" />
                            Send Reminder
                          </button>

                          <button
                            onClick={() => setSelectedInvoiceForPayment(inv.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-md transition-colors shadow-sm"
                            title="Record Inward Payment"
                          >
                            <CreditCard className="w-3 h-3" />
                            Pay
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <RecordPaymentModal
          isOpen={!!selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          defaultInvoiceId={selectedInvoiceForPayment}
        />
      )}
    </div>
  );
};

export default OverdueInvoicesView;
