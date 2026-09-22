import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import {
  CreditCard,
  Search,
  Plus,
  ArrowDownLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Building2,
  Filter,
  Download,
  ShieldCheck,
  Check
} from 'lucide-react';
import { PaymentMethod, PaymentStatus } from '../../../types/finance';
import RecordPaymentModal from './RecordPaymentModal';

const METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer (NEFT/RTGS)',
  upi: 'Corporate UPI',
  card: 'Credit/Debit Card',
  cash: 'Cash Remittance',
  other: 'Other Channel',
};

export const PaymentsList: React.FC = () => {
  const { payments, navigateTo } = useCRM();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Compute Telemetry
  const totalSettled = payments.reduce((acc, p) => p.status === 'successful' ? acc + p.amount : acc, 0);
  const totalCount = payments.length;
  const avgPayment = totalCount > 0 ? Math.round(totalSettled / totalCount) : 0;

  // Filtered Payments
  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.projectName && p.projectName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const handleCopy = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Payment ID', 'Reference / UTR', 'Invoice Number', 'Client Name', 'Project', 'Amount (INR)', 'Method', 'Status', 'Date', 'Recorded By'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.reference,
      p.invoiceNumber,
      `"${p.clientName}"`,
      `"${p.projectName || ''}"`,
      p.amount,
      p.method,
      p.status,
      p.date,
      `"${p.recordedByName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SCL_Payments_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Settlement Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inward Payments</h1>
          <p className="text-sm text-slate-400">
            Immutable settlement audit stream for client remittances, wire transfers, and account credits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export Ledger
          </button>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Payment Receipt
          </button>
        </div>
      </div>

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0D1216] border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase tracking-wider">Total Settled Receipts</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            ₹{totalSettled.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalCount} immutable transaction records logged
          </div>
        </div>

        <div className="p-4 bg-[#0D1216] border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase tracking-wider">Average Ticket Size</span>
            <CreditCard className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ₹{avgPayment.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across enterprise client contracts
          </div>
        </div>

        <div className="p-4 bg-[#0D1216] border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase tracking-wider">Primary Payment Channel</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-teal-400">
            NEFT / RTGS Wire
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            85%+ cleared via Direct Corporate Remittance
          </div>
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
            placeholder="Search UTR, client, invoice #..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#080C0E] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Method Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Channel:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="bg-[#080C0E] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Channels</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">Corporate UPI</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#080C0E] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">No payment transactions match filter</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the search query or channel filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D10] border-b border-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Reference / UTR</th>
                  <th className="py-3.5 px-4 font-semibold">Invoice Ref</th>
                  <th className="py-3.5 px-4 font-semibold">Client & Project</th>
                  <th className="py-3.5 px-4 font-semibold">Method & Status</th>
                  <th className="py-3.5 px-4 font-semibold">Date & Logged By</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Cleared Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-white">{payment.reference}</span>
                        <button
                          onClick={() => handleCopy(payment.reference)}
                          className="text-slate-500 hover:text-teal-400 transition-colors p-1"
                          title="Copy reference UTR"
                        >
                          {copiedRef === payment.reference ? (
                            <Check className="w-3.5 h-3.5 text-teal-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{payment.id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => navigateTo(`/app/finance/invoices/${payment.invoiceId}`)}
                        className="font-mono text-xs font-medium text-teal-400 hover:underline flex items-center gap-1"
                      >
                        {payment.invoiceNumber}
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {payment.clientName}
                      </div>
                      {payment.projectName && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {payment.projectName}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 capitalize text-xs">
                        {METHOD_LABELS[payment.method]}
                      </div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          payment.status === 'successful'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                            : payment.status === 'pending'
                            ? 'bg-amber-950/40 text-amber-400 border-amber-800/50'
                            : 'bg-rose-950/40 text-rose-400 border-rose-800/50'
                        }`}>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {payment.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-mono text-xs">{payment.date}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">By {payment.recordedByName}</div>
                      {payment.notes && (
                        <div className="text-[10px] text-slate-500 italic truncate max-w-xs">{payment.notes}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        ₹{payment.amount.toLocaleString('en-IN')}
                      </span>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">{payment.currency}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <RecordPaymentModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PaymentsList;
