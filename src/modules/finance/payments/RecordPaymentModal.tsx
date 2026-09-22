import React, { useState, useEffect } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Invoice, PaymentMethod } from '../../../types/finance';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { CheckCircle2, ArrowRight, ShieldCheck, Receipt } from 'lucide-react';

export interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice;
  defaultInvoiceId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoice: propInvoice,
  defaultInvoiceId
}) => {
  const { invoices, recordPayment } = useCRM();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    propInvoice?.id || defaultInvoiceId || invoices.find(i => i.outstandingAmount > 0)?.id || (invoices[0]?.id ?? '')
  );

  const activeInvoice = propInvoice || invoices.find(i => i.id === selectedInvoiceId) || invoices[0];

  const [amount, setAmount] = useState<number>(activeInvoice ? activeInvoice.outstandingAmount : 0);
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeInvoice) {
      setAmount(activeInvoice.outstandingAmount);
    }
  }, [selectedInvoiceId, activeInvoice]);

  if (!activeInvoice) return null;

  const numAmount = Number(amount) || 0;
  const newPaidTotal = activeInvoice.paidAmount + numAmount;
  const newOutstanding = Math.max(0, activeInvoice.total - newPaidTotal);
  const isFullSettlement = newOutstanding === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numAmount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    if (numAmount > activeInvoice.outstandingAmount) {
      setError(`Payment amount cannot exceed the current outstanding balance of ₹${activeInvoice.outstandingAmount.toLocaleString('en-IN')}.`);
      return;
    }

    if (!reference.trim()) {
      setError('Transaction / UTR Reference number is required for audit reconciliation.');
      return;
    }

    try {
      recordPayment({
        invoiceId: activeInvoice.id,
        amount: numAmount,
        method,
        reference: reference.trim(),
        notes: notes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment — ${activeInvoice.invoiceNumber}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!propInvoice && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Commercial Invoice</label>
            <Select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              options={invoices.filter(i => i.status !== 'cancelled').map(inv => ({
                value: inv.id,
                label: `${inv.invoiceNumber} — ${inv.clientName} (Due: ₹${inv.outstandingAmount.toLocaleString('en-IN')})`
              }))}
            />
          </div>
        )}

        {/* Invoice Summary Card */}
        <div className="p-3.5 rounded bg-crm-surface/70 border border-crm-border text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-crm-border/60">
            <div>
              <span className="text-[10px] font-mono text-crm-textMuted uppercase block">CLIENT COMPANY</span>
              <p className="font-semibold text-white">{activeInvoice.clientName}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-crm-textMuted uppercase block">INVOICE TOTAL</span>
              <p className="font-mono text-crm-text font-semibold">₹{activeInvoice.total.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-crm-textMuted block">Already Paid:</span>
              <span className="text-emerald-400 font-semibold">₹{activeInvoice.paidAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-right">
              <span className="text-crm-textMuted block">Current Outstanding:</span>
              <span className="text-amber-400 font-bold">₹{activeInvoice.outstandingAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Payment Amount */}
        <div>
          <label className="block text-xs font-medium text-crm-text mb-1">
            Settlement Amount (INR) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-crm-textMuted">₹</span>
            <input
              type="number"
              min="1"
              max={activeInvoice.outstandingAmount}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-8 pr-20 py-1.5 bg-crm-surface border border-crm-border rounded text-xs font-mono text-white focus:outline-none focus:border-turquoise"
              required
            />
            <button
              type="button"
              onClick={() => setAmount(activeInvoice.outstandingAmount)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-teal-950 text-teal-300 border border-teal-800/50 hover:bg-teal-900/60 transition-colors"
            >
              Full Due
            </button>
          </div>
        </div>

        {/* Remittance Method */}
        <div>
          <label className="block text-xs font-medium text-crm-text mb-1">
            Settlement Channel / Method *
          </label>
          <Select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            options={[
              { value: 'bank_transfer', label: 'Bank Wire / NEFT / RTGS / IMPS' },
              { value: 'upi', label: 'Corporate UPI' },
              { value: 'card', label: 'Corporate Credit/Debit Card' },
              { value: 'cash', label: 'Direct Cash Remittance' },
              { value: 'other', label: 'Other Bank Instrument' },
            ]}
          />
        </div>

        {/* Reference / UTR */}
        <div>
          <label className="block text-xs font-medium text-crm-text mb-1">
            UTR / Transaction Reference *
          </label>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. UTR-HDFC-992019482 or UPI Ref"
            required
            className="font-mono"
          />
          <p className="text-[10px] text-crm-textMuted mt-1">
            Mandatory bank-verified UTR / transaction sequence for immutable financial audit records.
          </p>
        </div>

        {/* Internal Settlement Notes */}
        <div>
          <label className="block text-xs font-medium text-crm-text mb-1">
            Internal Note / Remarks (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Milestone 1 milestone clearance verified via HDFC corporate portal"
            className="w-full px-3 py-1.5 bg-crm-surface border border-crm-border rounded text-xs text-crm-text focus:outline-none focus:border-turquoise"
          />
        </div>

        {/* Real-Time Settlement Impact Preview */}
        <div className="p-3 rounded bg-[#090D10] border border-crm-border/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-crm-textMuted">Post-Payment Status:</span>
            <span className={`font-semibold ${isFullSettlement ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isFullSettlement ? 'Fully Cleared (Paid)' : 'Partially Settled'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-crm-textMuted">Remaining Balance:</span>
            <span className="text-white font-bold">₹{newOutstanding.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-crm-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
          >
            Confirm & Log Settlement
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;
