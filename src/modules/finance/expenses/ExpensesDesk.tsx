import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  IndianRupee,
  FileText,
  Upload,
  User,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { ExpenseCategory, ExpenseStatus, CurrencyCode } from '../../../types/finance';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  travel: 'Travel & Mobility',
  software: 'Cloud SaaS & Licenses',
  equipment: 'Hardware & Gear',
  marketing: 'Growth & Marketing',
  office: 'Facilities & Workplace',
  client: 'Client Hospitality',
  other: 'Other Operational',
};

export const ExpensesDesk: React.FC = () => {
  const { expenses, projects, submitExpense, reviewExpense, payExpense, currentUser } = useCRM();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'history'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Review modal state
  const [reviewingExpenseId, setReviewingExpenseId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');

  // Reimburse modal state
  const [payingExpenseId, setPayingExpenseId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');

  // New expense form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'software' as ExpenseCategory,
    amount: '',
    currency: 'INR' as CurrencyCode,
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    description: '',
    receiptFileName: '',
    receiptFileSize: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Calculations
  const pendingExpenses = expenses.filter(e => e.status === 'submitted');
  const approvedExpenses = expenses.filter(e => e.status === 'approved');
  const historyExpenses = expenses.filter(e => e.status === 'paid' || e.status === 'rejected');

  const totalPendingAmount = pendingExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalApprovedAmount = approvedExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalReimbursedAmount = expenses.filter(e => e.status === 'paid').reduce((acc, e) => acc + e.amount, 0);

  // Filter current tab's list
  const currentList = activeTab === 'pending'
    ? pendingExpenses
    : activeTab === 'approved'
    ? approvedExpenses
    : historyExpenses;

  const filteredExpenses = currentList.filter(e => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.projectName && e.projectName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Expense title is required';
    if (!formData.amount || Number(formData.amount) <= 0) errors.amount = 'Valid amount is required';
    if (!formData.description.trim()) errors.description = 'Justification is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const selectedProj = projects.find(p => p.id === formData.projectId);

    submitExpense({
      title: formData.title,
      employeeId: currentUser?.id || 'EMP-001',
      employeeName: currentUser?.name || 'Current User',
      category: formData.category,
      amount: Number(formData.amount),
      currency: formData.currency,
      date: formData.date,
      projectId: formData.projectId || undefined,
      projectName: selectedProj?.name,
      description: formData.description,
      receiptFileName: formData.receiptFileName || 'receipt_doc.pdf',
      receiptFileSize: formData.receiptFileSize || '1.2 MB',
    });

    setIsSubmitModalOpen(false);
    setFormData({
      title: '',
      category: 'software',
      amount: '',
      currency: 'INR',
      date: new Date().toISOString().split('T')[0],
      projectId: '',
      description: '',
      receiptFileName: '',
      receiptFileSize: '',
    });
    setFormErrors({});
  };

  const handleReviewSubmit = () => {
    if (!reviewingExpenseId) return;
    reviewExpense(
      reviewingExpenseId,
      reviewAction,
      reviewNotes.trim() || undefined
    );
    setReviewingExpenseId(null);
    setReviewNotes('');
  };

  const handlePaySubmit = () => {
    if (!payingExpenseId || !paymentRef.trim()) return;
    payExpense(payingExpenseId, paymentRef.trim());
    setPayingExpenseId(null);
    setPaymentRef('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Internal Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Expense Claims & Approvals</h1>
          <p className="text-sm text-slate-400">
            Internal corporate disbursements, project tooling, cloud licenses, and staff reimbursement claims.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Claim Expense
        </button>
      </div>

      {/* Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0D1216] border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            ₹{totalPendingAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {pendingExpenses.length} claims awaiting managerial sign-off
          </div>
        </div>

        <div className="p-4 bg-[#0D1216] border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase tracking-wider">Approved for Payout</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-400">
            ₹{totalApprovedAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {approvedExpenses.length} claims ready for finance wire transfer
          </div>
        </div>

        <div className="p-4 bg-[#0D1216] border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase tracking-wider">Disbursed (FY 2026)</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ₹{totalReimbursedAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total operational capital reimbursed
          </div>
        </div>
      </div>

      {/* Control Tabs & Filters */}
      <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#080C0E] p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Review
            {pendingExpenses.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-400 font-mono">
                {pendingExpenses.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'approved'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ready for Payout
            {approvedExpenses.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-500/20 text-teal-400 font-mono">
                {approvedExpenses.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Settled History
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search claim, employee, project..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#080C0E] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-[#080C0E] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
              <option key={cat} value={cat}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Claims List Table */}
      <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">No expense claims found</h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no claims matching the active criteria in this queue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D10] border-b border-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Expense Details</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted By</th>
                  <th className="py-3.5 px-4 font-semibold">Category & Project</th>
                  <th className="py-3.5 px-4 font-semibold">Date & Receipt</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-xs">{exp.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-sm">
                        {exp.description}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{exp.id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-medium text-slate-300">
                          {exp.employeeName.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-200">{exp.employeeName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-medium">
                        {CATEGORY_LABELS[exp.category]}
                      </div>
                      {exp.projectName ? (
                        <div className="text-[11px] text-teal-400/90 flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3 text-slate-500" />
                          {exp.projectName}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">General Overhead</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-mono">{exp.date}</div>
                      {exp.receiptFileName && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 font-mono">
                          <FileText className="w-2.5 h-2.5 text-teal-400" />
                          {exp.receiptFileName} ({exp.receiptFileSize})
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono text-sm font-bold text-white">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">{exp.currency}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {exp.status === 'submitted' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setReviewingExpenseId(exp.id);
                              setReviewAction('approve');
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-md transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setReviewingExpenseId(exp.id);
                              setReviewAction('reject');
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-md transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {exp.status === 'approved' && (
                        <button
                          onClick={() => setPayingExpenseId(exp.id)}
                          className="px-3 py-1 text-[11px] font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-md shadow-sm transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}

                      {exp.status === 'paid' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid ({exp.paymentReference || 'Cleared'})
                        </span>
                      )}

                      {exp.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/40 text-rose-400 border border-rose-800/40">
                          <XCircle className="w-3 h-3" />
                          Declined
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Expense Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0D1216] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-semibold text-white">Submit Operational Expense Claim</h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Expense Title / Item *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AWS Production Infrastructure, Client Flight Tickets"
                  className="w-full px-3 py-2 bg-[#080C0E] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
                {formErrors.title && <p className="text-[10px] text-rose-400 mt-1">{formErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 bg-[#080C0E] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                      <option key={cat} value={cat}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount (INR) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">₹</span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 bg-[#080C0E] border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  {formErrors.amount && <p className="text-[10px] text-rose-400 mt-1">{formErrors.amount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080C0E] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Associated Project (Optional)</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080C0E] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="">-- Internal Company Overhead --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Business Purpose / Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain why this expense was incurred for Star Chain Labs operations..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#080C0E] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
                {formErrors.description && <p className="text-[10px] text-rose-400 mt-1">{formErrors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Receipt Attachment (Simulation)</label>
                <div className="p-3 bg-[#080C0E] border border-dashed border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-teal-400" />
                    <span className="text-xs text-slate-400">
                      {formData.receiptFileName || 'Attach tax invoice or bill voucher'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      receiptFileName: `tax_voucher_${Date.now().toString().slice(-4)}.pdf`,
                      receiptFileSize: '1.4 MB'
                    })}
                    className="px-2.5 py-1 text-[10px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700"
                  >
                    Attach File
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors shadow-sm"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingExpenseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0D1216] border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">
              {reviewAction === 'approve' ? 'Authorize Expense Claim' : 'Reject Expense Claim'}
            </h3>
            <p className="text-xs text-slate-400">
              {reviewAction === 'approve'
                ? 'This claim will move to the approved disbursement queue for bank settlement.'
                : 'Please state the reason for rejecting this reimbursement claim.'}
            </p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Manager Note / Rationale</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={reviewAction === 'approve' ? 'Approved as per operational budget policy.' : 'Missing original tax invoice...'}
                rows={3}
                className="w-full px-3 py-2 bg-[#080C0E] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReviewingExpenseId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg ${
                  reviewAction === 'approve'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                }`}
              >
                Confirm {reviewAction === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {payingExpenseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0D1216] border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Record Reimbursement Payout</h3>
            <p className="text-xs text-slate-400">
              Enter the bank transaction reference / UTR used to disburse funds to the employee.
            </p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Bank Remittance UTR / Ref *</label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. UTR-HDFC-88392019"
                className="w-full px-3 py-2 bg-[#080C0E] border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPayingExpenseId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handlePaySubmit}
                disabled={!paymentRef.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 rounded-lg"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesDesk;
