import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { InvoiceItem, CurrencyCode } from '../../../types/finance';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Eye, 
  Send, 
  Building2, 
  FolderKanban, 
  Receipt,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
  preselectedProjectId?: string;
  preselectedDealId?: string;
  preselectedAmount?: number;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  preselectedClientId,
  preselectedProjectId,
  preselectedDealId,
  preselectedAmount
}) => {
  const { companies, projects, financeConfig, createInvoice } = useCRM();

  const [clientId, setClientId] = useState(preselectedClientId || companies[0]?.id || '');
  const [projectId, setProjectId] = useState(preselectedProjectId || '');
  const [currency, setCurrency] = useState<CurrencyCode>(financeConfig.defaultCurrency);
  const [issueDate, setIssueDate] = useState('2026-09-21');
  const [dueDate, setDueDate] = useState('2026-10-06');
  const [paymentTerms, setPaymentTerms] = useState(financeConfig.defaultPaymentTerms);
  const [notes, setNotes] = useState('Payment is due within 15 days of invoice date. Deliverables accepted as per statement of work.');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(financeConfig.defaultTaxRate);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [items, setItems] = useState<InvoiceItem[]>(() => {
    return [
      {
        id: 'item-1',
        description: preselectedProjectId 
          ? `Engineering Deliverables — Milestone Verification` 
          : 'Smart Contract Audit & Formal Verification Phase 1',
        quantity: 1,
        unitPrice: preselectedAmount || 500000,
        amount: preselectedAmount || 500000
      }
    ];
  });

  const selectedCompany = companies.find(c => c.id === clientId);
  const selectedProject = projects.find(p => p.id === projectId);

  // Filter projects for selected company if available
  const availableProjects = selectedCompany 
    ? projects.filter(p => p.clientId === selectedCompany.id || p.clientName.toLowerCase().includes(selectedCompany.name.toLowerCase()))
    : projects;

  // Real-time calculation helpers
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }
    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 50000,
        amount: 50000
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * (Number(discountValue) || 0)) / 100 
    : Number(discountValue) || 0;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableBase * (Number(taxRate) || 0)) / 100;
  const grandTotal = Math.round(taxableBase + taxAmount);

  const handleSave = (status: 'draft' | 'sent') => {
    if (!clientId) {
      alert('Please select a client company.');
      return;
    }
    if (items.some(i => !i.description.trim())) {
      alert('Please provide descriptions for all line items.');
      return;
    }

    createInvoice({
      invoiceNumber: '',
      clientId,
      clientName: selectedCompany?.name || 'Client',
      clientEmail: selectedCompany?.email || (selectedCompany?.website ? `billing@${selectedCompany.website.replace('https://', '').replace('http://', '').split('/')[0]}` : 'billing@client.com'),
      clientAddress: selectedCompany?.location || 'India',
      projectId: projectId || undefined,
      projectName: selectedProject?.name || undefined,
      dealId: preselectedDealId || undefined,
      issueDate,
      dueDate,
      currency,
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxRate,
      taxAmount,
      total: grandTotal,
      paidAmount: 0,
      outstandingAmount: grandTotal,
      status,
      notes,
      paymentTerms
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isPreviewMode ? "Invoice Preview — Executive Review" : "Generate Commercial Client Invoice"}
      size="xl"
    >
      <div className="space-y-5">
        {/* Step / Mode Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-crm-border">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-turquoise" />
            <span className="text-xs font-mono text-crm-textSecondary uppercase tracking-wider">
              STAR CHAIN LABS • BILLING ENGINE
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-crm-surface p-1 rounded border border-crm-border">
            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                !isPreviewMode ? 'bg-turquoise/20 text-turquoise border border-turquoise/30' : 'text-crm-textMuted hover:text-crm-text'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewMode(true)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                isPreviewMode ? 'bg-turquoise/20 text-turquoise border border-turquoise/30' : 'text-crm-textMuted hover:text-crm-text'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {!isPreviewMode ? (
          /* FORM EDITOR */
          <div className="space-y-4">
            {/* Top row: Client & Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-crm-textSecondary mb-1.5">
                  Client Company <span className="text-rose-400">*</span>
                </label>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setProjectId('');
                  }}
                  className="w-full bg-crm-surface border border-crm-border rounded p-2.5 text-xs text-crm-text focus:outline-none focus:border-turquoise"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.industry || 'Client'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-crm-textSecondary mb-1.5">
                  Associated Delivery Project (Optional)
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-crm-surface border border-crm-border rounded p-2.5 text-xs text-crm-text focus:outline-none focus:border-turquoise"
                >
                  <option value="">None / Standalone Retainer</option>
                  {availableProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates & Currency Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-crm-textSecondary mb-1">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-crm-surface border border-crm-border rounded p-2 text-xs text-crm-text font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-crm-textSecondary mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-crm-surface border border-crm-border rounded p-2 text-xs text-crm-text font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-crm-textSecondary mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Net 15 Days"
                  className="w-full bg-crm-surface border border-crm-border rounded p-2 text-xs text-crm-text font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-crm-textSecondary mb-1">Billing Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-crm-surface border border-crm-border rounded p-2 text-xs text-crm-text font-mono"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-crm-border/60">
                <span className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                  Invoice Items ({items.length})
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleAddItem}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Line Item
                </Button>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={item.id} className="p-3 rounded bg-crm-surface/50 border border-crm-border flex flex-col md:flex-row items-center gap-2 text-xs">
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Deliverable / Milestone / Service Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full bg-crm-bg border border-crm-border rounded p-2 text-xs text-crm-text placeholder:text-crm-textMuted"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full bg-crm-bg border border-crm-border rounded p-2 text-xs text-center text-crm-text font-mono"
                        />
                      </div>

                      <div className="w-32">
                        <input
                          type="number"
                          min="0"
                          placeholder="Rate"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full bg-crm-bg border border-crm-border rounded p-2 text-xs text-right text-crm-text font-mono"
                        />
                      </div>

                      <div className="w-32 text-right font-mono font-medium text-crm-text px-2">
                        {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€'}{item.amount.toLocaleString('en-IN')}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="p-1.5 text-crm-textMuted hover:text-rose-400 disabled:opacity-30 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown Strip */}
            <div className="p-4 rounded-lg bg-crm-surface/70 border border-crm-border grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-crm-textSecondary mb-1">
                    Client Memo / Statement of Work Reference
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-crm-bg border border-crm-border rounded p-2 text-xs text-crm-text"
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-crm-border/60">
                  <span className="text-crm-textSecondary">Line Items Subtotal:</span>
                  <span className="text-crm-text font-medium">
                    {currency === 'INR' ? '₹' : '$'}{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-crm-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-crm-textSecondary">Discount:</span>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="bg-crm-bg border border-crm-border text-[10px] rounded px-1.5 py-0.5"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">Fixed</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-16 bg-crm-bg border border-crm-border text-[11px] rounded px-1.5 py-0.5 text-right font-mono"
                    />
                  </div>
                  <span className="text-amber-400">
                    -{currency === 'INR' ? '₹' : '$'}{discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-crm-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-crm-textSecondary">{financeConfig.taxLabel}:</span>
                    <input
                      type="number"
                      min="0"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-12 bg-crm-bg border border-crm-border text-[11px] rounded px-1.5 py-0.5 text-right font-mono"
                    />
                    <span className="text-[10px] text-crm-textMuted">%</span>
                  </div>
                  <span className="text-crm-text">
                    +{currency === 'INR' ? '₹' : '$'}{Math.round(taxAmount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between pt-2 text-sm font-bold text-teal-300">
                  <span>Grand Total (Due):</span>
                  <span>{currency === 'INR' ? '₹' : '$'}{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* LIVE PREVIEW */
          <div className="p-6 rounded-lg bg-crm-surface border border-crm-border space-y-6 text-xs font-mono">
            {/* Invoice Header */}
            <div className="flex justify-between items-start pb-4 border-b border-crm-border">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wider">STAR CHAIN LABS</h3>
                <p className="text-[11px] text-crm-textMuted mt-0.5">High-Performance Blockchain & Cryptographic Engineering</p>
                <p className="text-[10px] text-crm-textMuted mt-1">GSTIN: {financeConfig.companyGstNumber} • PAN: {financeConfig.companyPan}</p>
                <p className="text-[10px] text-crm-textMuted">{financeConfig.bankDetails.branch}</p>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-teal-950/60 text-teal-300 border border-teal-800/40 font-mono text-[11px] uppercase">
                  TAX INVOICE
                </span>
                <p className="text-sm font-bold text-crm-text mt-2">DRAFT-PREVIEW</p>
                <p className="text-[10px] text-crm-textMuted mt-0.5">Issue: {issueDate} • Due: {dueDate}</p>
                <p className="text-[10px] text-crm-textMuted">Terms: {paymentTerms}</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-crm-border">
              <div>
                <span className="text-[10px] text-crm-textMuted uppercase block mb-1">BILLED TO:</span>
                <p className="font-bold text-white text-sm">{selectedCompany?.name}</p>
                <p className="text-crm-textSecondary mt-0.5">{selectedCompany?.location || 'India'}</p>
                <p className="text-crm-textMuted mt-0.5">{selectedCompany?.email || (selectedCompany?.website ? `billing@${selectedCompany.website.replace('https://', '').replace('http://', '').split('/')[0]}` : 'billing@client.com')}</p>
              </div>

              {selectedProject && (
                <div>
                  <span className="text-[10px] text-crm-textMuted uppercase block mb-1">PROJECT REFERENCE:</span>
                  <p className="font-semibold text-turquoise">{selectedProject.name}</p>
                  <p className="text-crm-textMuted mt-0.5">PM: {selectedProject.managerName}</p>
                </div>
              )}
            </div>

            {/* Items table preview */}
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-crm-border text-crm-textMuted text-[10px] uppercase">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Unit Rate</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crm-border/40">
                {items.map((it, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2 text-crm-text">{it.description}</td>
                    <td className="py-2 text-center text-crm-textMuted">{it.quantity}</td>
                    <td className="py-2 text-right text-crm-textMuted">₹{Number(it.unitPrice).toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right text-crm-text font-semibold">₹{Number(it.amount).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="pt-3 border-t border-crm-border flex justify-end">
              <div className="w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-crm-textMuted">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Discount:</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-crm-textMuted">
                  <span>GST ({taxRate}%):</span>
                  <span>+₹{Math.round(taxAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-teal-300 pt-2 border-t border-crm-border">
                  <span>Total Due:</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Bank details strip */}
            <div className="p-3 rounded bg-crm-bg/70 border border-crm-border/60 text-[10px] text-crm-textMuted space-y-1">
              <span className="font-bold text-crm-textSecondary uppercase block">Remittance Details:</span>
              <p>Bank: {financeConfig.bankDetails.bankName} • Account: {financeConfig.bankDetails.accountNumber} • IFSC: {financeConfig.bankDetails.ifsc}</p>
              <p>UPI ID: <strong className="text-teal-400">{financeConfig.bankDetails.upiId}</strong></p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-crm-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave('draft')}
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={() => handleSave('sent')}
            >
              Generate & Dispatch Invoice
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
