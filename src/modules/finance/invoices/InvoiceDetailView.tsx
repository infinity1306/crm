import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import {
  ArrowLeft,
  Printer,
  Send,
  CreditCard,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  Calendar,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  User,
  Info
} from 'lucide-react';
import { InvoiceStatus } from '../../../types/finance';
import RecordPaymentModal from '../payments/RecordPaymentModal';

const STATUS_BADGES: Record<InvoiceStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
  draft: { label: 'Draft', bg: 'bg-[#1e293b]/60', text: 'text-slate-400', border: 'border-slate-700/50', icon: Clock },
  sent: { label: 'Sent / Awaiting Payment', bg: 'bg-sky-950/40', text: 'text-sky-400', border: 'border-sky-800/40', icon: Send },
  partially_paid: { label: 'Partially Paid', bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40', icon: AlertTriangle },
  paid: { label: 'Fully Paid', bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/40', icon: CheckCircle2 },
  overdue: { label: 'Overdue', bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-800/40', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', bg: 'bg-zinc-900/60', text: 'text-zinc-500', border: 'border-zinc-800', icon: XCircle },
};

interface InvoiceDetailViewProps {
  invoiceId?: string;
}

export const InvoiceDetailView: React.FC<InvoiceDetailViewProps> = ({ invoiceId }) => {
  const { invoices, payments, sendInvoice, cancelInvoice, markInvoiceOverdue, financeConfig, navigateTo } = useCRM();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const invoice = invoices.find(inv => inv.id === invoiceId || inv.invoiceNumber === invoiceId);

  if (!invoice) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto mt-20">
        <div className="w-16 h-16 rounded-2xl bg-[#11161B] border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Invoice Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          The requested invoice identifier &quot;{invoiceId}&quot; does not exist or has been removed from the registry.
        </p>
        <button
          onClick={() => navigateTo('/app/finance/invoices')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>
      </div>
    );
  }

  // Linked payments for this invoice
  const invoicePayments = payments.filter(p => p.invoiceId === invoice.id);

  const statusConfig = STATUS_BADGES[invoice.status];
  const StatusIcon = statusConfig.icon;

  const handleSend = () => {
    sendInvoice(invoice.id);
    setActionSuccessMessage('Invoice dispatch marked successfully.');
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleCancel = () => {
    if (window.confirm(`Are you sure you want to cancel invoice ${invoice.invoiceNumber}? This action is recorded in the audit trail.`)) {
      cancelInvoice(invoice.id);
      setActionSuccessMessage('Invoice cancelled.');
      setTimeout(() => setActionSuccessMessage(null), 3000);
    }
  };

  const handleMarkOverdue = () => {
    markInvoiceOverdue(invoice.id);
    setActionSuccessMessage('Invoice flagged as overdue.');
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-full pb-16">
      {/* Top Breadcrumb & Actions Bar (Hidden during print) */}
      <div className="print:hidden border-b border-slate-800/80 bg-[#0B0F12]/80 backdrop-blur sticky top-0 z-20 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('/app/finance/invoices')}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg border border-slate-800 transition-colors"
              title="Back to Invoices"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <button onClick={() => navigateTo('/app/finance')} className="hover:text-slate-200">Finance</button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <button onClick={() => navigateTo('/app/finance/invoices')} className="hover:text-slate-200">Invoices</button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-mono text-teal-400 font-semibold">{invoice.invoiceNumber}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              Print / PDF
            </button>

            {invoice.status === 'draft' && (
              <button
                onClick={handleSend}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-sky-300 hover:text-white bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/60 rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Invoice
              </button>
            )}

            {(invoice.status === 'sent' || invoice.status === 'partially_paid' || invoice.status === 'overdue') && (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-sm transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Record Payment
              </button>
            )}

            {invoice.status === 'sent' && (
              <button
                onClick={handleMarkOverdue}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 rounded-lg transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Flag Overdue
              </button>
            )}

            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 bg-transparent hover:bg-slate-800/50 border border-slate-800 rounded-lg transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {actionSuccessMessage && (
          <div className="mt-3 px-3 py-2 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-xs font-medium text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {actionSuccessMessage}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Printable Executive Invoice Surface (Left 8 cols) */}
          <div className="lg:col-span-8 bg-[#0D1216] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
            
            {/* Invoice Document Header */}
            <div className="p-8 sm:p-10 border-b border-slate-800/80 print:border-slate-300">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm print:border-black print:text-black">
                      ★
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white uppercase print:text-black">STAR CHAIN LABS</span>
                  </div>
                  <p className="text-xs text-slate-400 print:text-slate-600">Enterprise Web3 & Cloud Systems</p>
                  <p className="text-xs text-slate-400 print:text-slate-600">GSTIN: {financeConfig.companyGstNumber}</p>
                  <p className="text-xs text-slate-400 print:text-slate-600">PAN: {financeConfig.companyPan}</p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block font-mono text-2xl font-bold text-white print:text-black tracking-wider">
                    TAX INVOICE
                  </span>
                  <div className="mt-1 font-mono text-sm text-teal-400 font-medium print:text-black">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border print:border-black print:text-black print:bg-transparent"
                    style={{
                      backgroundColor: statusConfig.bg,
                      color: statusConfig.text,
                      borderColor: statusConfig.border
                    }}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig.label}
                  </div>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/60 print:border-slate-300 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase tracking-wider mb-1">Issue Date</span>
                  <span className="text-slate-200 font-medium print:text-black">{invoice.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase tracking-wider mb-1">Due Date</span>
                  <span className={`font-medium ${invoice.status === 'overdue' ? 'text-rose-400 font-bold' : 'text-slate-200 print:text-black'}`}>
                    {invoice.dueDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase tracking-wider mb-1">Payment Terms</span>
                  <span className="text-slate-200 font-medium print:text-black">{invoice.paymentTerms || financeConfig.defaultPaymentTerms}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase tracking-wider mb-1">Currency</span>
                  <span className="text-teal-400 font-mono font-medium print:text-black">{invoice.currency} (₹)</span>
                </div>
              </div>
            </div>

            {/* Billing Entities */}
            <div className="p-8 sm:p-10 border-b border-slate-800/80 print:border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-2 block">
                  Billed By (Issuer)
                </span>
                <div className="space-y-1 text-slate-300 print:text-black">
                  <p className="font-semibold text-white print:text-black">Star Chain Labs Pvt. Ltd.</p>
                  <p>Cyber City Tech Park, Tower B, Level 6</p>
                  <p>Bangalore, Karnataka — 560103, India</p>
                  <p className="text-slate-400 print:text-slate-600">contact@starchainlabs.io</p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-teal-400/90 mb-2 block">
                  Billed To (Client)
                </span>
                <div className="space-y-1 text-slate-300 print:text-black">
                  <p className="font-bold text-white text-sm print:text-black flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-400 print:hidden" />
                    <button onClick={() => navigateTo('/app/crm/companies')} className="hover:underline text-left text-white">{invoice.clientName}</button>
                  </p>
                  {invoice.clientGstNumber && (
                    <p className="text-slate-400 font-mono text-[11px] print:text-slate-700">GSTIN: {invoice.clientGstNumber}</p>
                  )}
                  {invoice.clientAddress ? (
                    <p className="whitespace-pre-line text-slate-400 print:text-slate-700">{invoice.clientAddress}</p>
                  ) : (
                    <p className="text-slate-500 italic">No registered corporate address</p>
                  )}
                  {invoice.clientEmail && (
                    <p className="text-slate-400 print:text-slate-700">{invoice.clientEmail}</p>
                  )}
                  {invoice.projectName && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 print:border-slate-300">
                      <span className="text-slate-500 text-[11px]">Associated Project: </span>
                      <span className="font-medium text-slate-200 print:text-black">{invoice.projectName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-8 sm:p-10 border-b border-slate-800/80 print:border-slate-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 print:border-slate-400 text-slate-400 print:text-slate-700 uppercase tracking-wider text-[11px]">
                      <th className="pb-3 w-8">#</th>
                      <th className="pb-3 font-semibold">Scope Description</th>
                      <th className="pb-3 text-right font-semibold w-20">Qty</th>
                      <th className="pb-3 text-right font-semibold w-28">Rate (₹)</th>
                      <th className="pb-3 text-right font-semibold w-32">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 print:divide-slate-200">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id} className="text-slate-300 print:text-black">
                        <td className="py-4 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-4 pr-4">
                          <div className="font-medium text-white print:text-black">{item.description}</div>
                        </td>
                        <td className="py-4 text-right font-mono text-slate-400 print:text-slate-700">{item.quantity}</td>
                        <td className="py-4 text-right font-mono text-slate-400 print:text-slate-700">
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 text-right font-mono font-medium text-white print:text-black">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subtotals & Math Calculation Breakdown */}
              <div className="mt-8 pt-6 border-t border-slate-800 print:border-slate-300 flex justify-end">
                <div className="w-full sm:w-80 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-400 print:text-slate-700">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200 print:text-black">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : 'Flat'}):</span>
                      <span className="font-mono">- ₹{invoice.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400 print:text-slate-700">
                    <span>{financeConfig.taxLabel} ({invoice.taxRate}%):</span>
                    <span className="font-mono text-slate-200 print:text-black">₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 print:border-slate-400 flex justify-between text-sm font-bold text-white print:text-black">
                    <span>Total Amount:</span>
                    <span className="font-mono text-teal-400 print:text-black">₹{invoice.total.toLocaleString('en-IN')}</span>
                  </div>

                  {invoice.paidAmount > 0 && (
                    <div className="flex justify-between text-xs text-slate-400 print:text-slate-700">
                      <span>Amount Cleared:</span>
                      <span className="font-mono text-emerald-400">- ₹{invoice.paidAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-dashed border-slate-800 print:border-slate-300 flex justify-between text-xs font-semibold">
                    <span className="text-slate-400 uppercase tracking-wider">Balance Due:</span>
                    <span className={`font-mono text-base font-bold ${invoice.outstandingAmount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                      ₹{invoice.outstandingAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Banking & Remittance Instructions */}
            <div className="p-8 sm:p-10 bg-[#090D10] print:bg-white border-b border-slate-800/80 print:border-slate-300 text-xs">
              <h4 className="text-[11px] font-bold text-slate-300 print:text-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 print:hidden" />
                Settlement Banking Coordinates
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-400 print:text-slate-700">
                <div className="space-y-1">
                  <p><span className="text-slate-500">Beneficiary:</span> {financeConfig.bankDetails.accountName}</p>
                  <p><span className="text-slate-500">Bank:</span> {financeConfig.bankDetails.bankName}</p>
                  <p><span className="text-slate-500">Branch:</span> {financeConfig.bankDetails.branch}</p>
                </div>
                <div className="space-y-1">
                  <p><span className="text-slate-500">A/C Number:</span> <span className="font-mono text-slate-200 print:text-black">{financeConfig.bankDetails.accountNumber}</span></p>
                  <p><span className="text-slate-500">IFSC Code:</span> <span className="font-mono text-slate-200 print:text-black">{financeConfig.bankDetails.ifsc}</span></p>
                  <p><span className="text-slate-500">Corporate UPI:</span> <span className="font-mono text-teal-400 print:text-black">{financeConfig.bankDetails.upiId}</span></p>
                </div>
              </div>
              {invoice.notes && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 print:border-slate-200 text-slate-400">
                  <span className="text-slate-500 font-medium">Notes & Remittance terms: </span>
                  {invoice.notes}
                </div>
              )}
            </div>

            {/* Signature & Seal Footer */}
            <div className="p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
              <div>
                <p>This is a computer generated commercial document.</p>
                <p>Authorized by Star Chain Labs Internal Operations Engine.</p>
              </div>
              <div className="text-center sm:text-right">
                <div className="font-serif italic text-slate-300 print:text-black text-sm mb-1">
                  For Star Chain Labs Pvt. Ltd.
                </div>
                <div className="h-10 flex items-center justify-end">
                  <span className="font-mono text-[10px] text-teal-500/70 border border-teal-500/20 px-2 py-0.5 rounded">
                    DIGITALLY AUTHORIZED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Authorized Finance Officer</p>
              </div>
            </div>

          </div>

          {/* Right Column: Payment Ledger, Status Pipeline & Timeline (4 cols) */}
          <div className="lg:col-span-4 space-y-6 print:hidden">

            {/* Outstanding Summary Card */}
            <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Settlement Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  invoice.outstandingAmount === 0
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50'
                    : 'bg-amber-950/40 text-amber-400 border border-amber-800/50'
                }`}>
                  {invoice.outstandingAmount === 0 ? 'Fully Cleared' : 'Balance Pending'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Billed:</span>
                  <span className="font-mono text-white font-medium">₹{invoice.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Amount Received:</span>
                  <span className="font-mono text-emerald-400 font-medium">₹{invoice.paidAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Remaining Balance:</span>
                  <span className="font-mono text-amber-400 text-sm">₹{invoice.outstandingAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {invoice.outstandingAmount > 0 && invoice.status !== 'cancelled' && (
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Log Inward Payment
                </button>
              )}
            </div>

            {/* Payment Transactions Recorded */}
            <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-semibold text-white">Payment Ledger</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">{invoicePayments.length} logged</span>
              </div>

              {invoicePayments.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-slate-800 rounded-lg">
                  <Clock className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">No payment receipts logged yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoicePayments.map(p => (
                    <div key={p.id} className="p-3 bg-[#080C0E] border border-slate-800/80 rounded-lg text-xs">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono font-medium text-emerald-400 text-sm">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{p.date}</span>
                      </div>
                      <div className="space-y-0.5 text-slate-400 text-[11px]">
                        <p><span className="text-slate-500">UTR / Ref:</span> <span className="font-mono text-slate-300">{p.reference}</span></p>
                        <p><span className="text-slate-500">Channel:</span> <span className="capitalize">{p.method.replace('_', ' ')}</span></p>
                        <p><span className="text-slate-500">Logged by:</span> {p.recordedByName}</p>
                        {p.notes && <p className="text-slate-500 italic pt-1">{p.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lifecycle Audit Trail */}
            <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-white">Audit History</h3>
              </div>

              <div className="space-y-4 relative pl-4 before:content-[''] before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {invoice.history?.map((h) => (
                  <div key={h.id} className="relative text-xs">
                    <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-teal-500" />
                    <div className="flex items-center justify-between text-slate-400 mb-0.5">
                      <span className="font-medium text-slate-200 capitalize">{h.action.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">By {h.actorName}</p>
                    {h.note && <p className="text-[11px] text-slate-400 mt-1 italic">{h.note}</p>}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <RecordPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          defaultInvoiceId={invoice.id}
        />
      )}
    </div>
  );
};

export default InvoiceDetailView;
