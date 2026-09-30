import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { PayrollRecord, PayrollPaymentStatus } from '../../types/payroll';
import { 
  getPayrollRecords, 
  savePayrollRecord, 
  bulkUpdatePayrollStatus, 
  deletePayrollRecord, 
  getPayrollSummary, 
  exportPayrollToCSV,
  convertNumberToWordsIndian,
  calculateSalaryBreakdown
} from '../../services/payrollService';
import { formatINR } from '../../utils/indianNumberSystem';
import { 
  FileSpreadsheet, 
  IndianRupee, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Printer, 
  Share2, 
  Edit3, 
  Trash2, 
  Eye, 
  Building2, 
  CreditCard, 
  Users, 
  Plus, 
  X, 
  Check, 
  Copy, 
  ShieldAlert,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../utils/cn';
import { CorporatePayslip } from '../../components/payroll/CorporatePayslip';

const MONTH_OPTIONS = [
  { code: '2026-09', label: 'September 2026 (Current)' },
  { code: '2026-08', label: 'August 2026' },
  { code: '2026-07', label: 'July 2026' },
  { code: '2026-10', label: 'October 2026 (Draft)' }
];

const STATUS_BADGE: Record<PayrollPaymentStatus, { label: string; badge: string }> = {
  paid: { label: 'Paid', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  processing: { label: 'Processing', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  pending: { label: 'Pending', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
};

export const PayrollSheet: React.FC = () => {
  const { currentUser, employees, navigateTo, addToast } = useCRM();

  // STRICT ACCESS CONTROL: Only HR & Super Admin
  const hasAccess = useMemo(() => {
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.department === 'HR') return true;
    return false;
  }, [currentUser]);

  // Active Month Code
  const [selectedMonthCode, setSelectedMonthCode] = useState('2026-09');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PayrollPaymentStatus>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Selected row IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Revision state
  const [revision, setRevision] = useState(0);

  // Modals
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<PayrollRecord | null>(null);

  // Form State for editing salary
  const [editForm, setEditForm] = useState<{
    id: string;
    grossSalary: number;
    basicSalary: number;
    hra: number;
    conveyanceAllowance: number;
    specialAllowance: number;
    performanceBonus: number;
    providentFund: number;
    professionalTax: number;
    tds: number;
    otherDeductions: number;
    nonPayable: number;
    paidDays: number;
    lopDays: number;
    joiningDate: string;
    payDate: string;
    status: PayrollPaymentStatus;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    remarks: string;
  }>({
    id: '',
    grossSalary: 75000,
    basicSalary: 37500,
    hra: 18750,
    conveyanceAllowance: 1500,
    specialAllowance: 15000,
    performanceBonus: 0,
    providentFund: 1800,
    professionalTax: 200,
    tds: 0,
    otherDeductions: 0,
    nonPayable: 0,
    paidDays: 30,
    lopDays: 0,
    joiningDate: '13/08/2026',
    payDate: '01/09/2026',
    status: 'pending',
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: '',
    remarks: ''
  });

  // Load records for month
  const records = useMemo(() => {
    return getPayrollRecords(selectedMonthCode, employees);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonthCode, employees, revision]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeId.toLowerCase().includes(q) ||
          r.designation.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.bankName.toLowerCase().includes(q) ||
          r.accountNumber.includes(q);
        if (!matches) return false;
      }

      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }

      if (departmentFilter !== 'all' && r.department !== departmentFilter) {
        return false;
      }

      return true;
    });
  }, [records, searchQuery, statusFilter, departmentFilter]);

  // Overall summary metrics
  const summary = useMemo(() => {
    return getPayrollSummary(records);
  }, [records]);

  // Departments list for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => set.add(r.department));
    return Array.from(set);
  }, [records]);

  // Open Payslip modal
  const openPayslip = (record: PayrollRecord) => {
    setActiveRecord(record);
    setIsPayslipModalOpen(true);
  };

  // Open Edit modal
  const openEditModal = (record: PayrollRecord) => {
    setActiveRecord(record);
    setEditForm({
      id: record.id,
      grossSalary: record.grossSalary,
      basicSalary: record.basicSalary,
      hra: record.hra,
      conveyanceAllowance: record.conveyanceAllowance ?? 1500,
      specialAllowance: record.specialAllowance,
      performanceBonus: record.performanceBonus || 0,
      providentFund: record.providentFund,
      professionalTax: record.professionalTax,
      tds: record.tds,
      nonPayable: record.nonPayable ?? record.otherDeductions ?? 0,
      otherDeductions: record.otherDeductions || 0,
      paidDays: record.paidDays,
      lopDays: record.lopDays,
      joiningDate: record.joiningDate || '13/08/2026',
      payDate: record.payDate || record.paymentDate || '01/09/2026',
      status: record.status,
      bankName: record.bankName,
      accountNumber: record.accountNumber,
      ifscCode: record.ifscCode,
      remarks: record.remarks || ''
    });
    setIsEditModalOpen(true);
  };

  // Handle Gross CTC change to auto-calculate breakdown
  const handleGrossChange = (newGross: number) => {
    const calc = calculateSalaryBreakdown(newGross, editForm.paidDays, 30);
    setEditForm(prev => ({
      ...prev,
      grossSalary: newGross,
      basicSalary: calc.basicSalary,
      hra: calc.hra,
      conveyanceAllowance: calc.conveyanceAllowance,
      specialAllowance: calc.specialAllowance,
      performanceBonus: calc.performanceBonus,
      providentFund: calc.providentFund,
      professionalTax: calc.professionalTax,
      tds: calc.tds,
      nonPayable: calc.nonPayable
    }));
  };

  // Save Salary Structure Submit
  const handleSaveSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord) return;

    const conveyance = editForm.conveyanceAllowance || 0;
    const totalEarnings = 
      editForm.basicSalary + editForm.hra + conveyance + editForm.specialAllowance + editForm.performanceBonus;
    const nonPayable = editForm.nonPayable || 0;
    const totalDeductions = 
      editForm.providentFund + editForm.professionalTax + editForm.tds + nonPayable + editForm.otherDeductions;
    const netSalary = Math.max(0, totalEarnings - totalDeductions);

    const updated: PayrollRecord = {
      ...activeRecord,
      grossSalary: editForm.grossSalary,
      basicSalary: editForm.basicSalary,
      hra: editForm.hra,
      conveyanceAllowance: conveyance,
      specialAllowance: editForm.specialAllowance,
      performanceBonus: editForm.performanceBonus,
      totalEarnings,
      providentFund: editForm.providentFund,
      professionalTax: editForm.professionalTax,
      tds: editForm.tds,
      nonPayable: nonPayable,
      otherDeductions: editForm.otherDeductions,
      totalDeductions,
      netSalary,
      paidDays: editForm.paidDays,
      lopDays: editForm.lopDays,
      joiningDate: editForm.joiningDate,
      payDate: editForm.payDate,
      status: editForm.status,
      bankName: editForm.bankName,
      accountNumber: editForm.accountNumber,
      ifscCode: editForm.ifscCode,
      remarks: editForm.remarks
    };

    savePayrollRecord(updated);
    setRevision(r => r + 1);
    setIsEditModalOpen(false);
    addToast({
      title: 'Salary Structure Updated',
      message: `Payroll record for ${updated.employeeName} updated successfully.`,
      type: 'success'
    });
  };

  // Bulk Status Update (e.g. Mark all as Paid)
  const handleBulkStatusChange = (status: PayrollPaymentStatus) => {
    if (selectedIds.length === 0) {
      addToast({
        title: 'No Selection',
        message: 'Please select at least one employee from the sheet.',
        type: 'warning'
      });
      return;
    }

    bulkUpdatePayrollStatus(selectedIds, status);
    setRevision(r => r + 1);
    setSelectedIds([]);
    addToast({
      title: 'Bulk Status Updated',
      message: `Updated payment status to ${status.toUpperCase()} for ${selectedIds.length} employee(s).`,
      type: 'success'
    });
  };

  // Quick single row status update
  const handleSingleStatusUpdate = (record: PayrollRecord, status: PayrollPaymentStatus) => {
    const updated: PayrollRecord = {
      ...record,
      status,
      paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : record.paymentDate,
      transactionRef: status === 'paid' && !record.transactionRef ? `NEFT-SCL-${Date.now().toString().slice(-6)}` : record.transactionRef
    };
    savePayrollRecord(updated);
    setRevision(r => r + 1);
    addToast({
      title: 'Status Updated',
      message: `${record.employeeName} marked as ${status.toUpperCase()}.`,
      type: 'success'
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    exportPayrollToCSV(filteredRecords);
    addToast({
      title: 'Payroll Sheet Exported',
      message: `Exported ${filteredRecords.length} payroll record(s) to CSV spreadsheet.`,
      type: 'success'
    });
  };

  // Checkbox toggle all
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r.id));
    }
  };

  // Checkbox toggle single
  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Print Payslip
  const handlePrintPayslip = () => {
    window.print();
  };

  // Restricted Access View for Non-HR
  if (!hasAccess) {
    return (
      <div className="p-8 max-w-lg mx-auto my-16 bg-crm-card border border-rose-500/30 rounded-2xl shadow-modal text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-crm-text">Payroll Ledger — Restricted Access</h2>
          <p className="text-xs text-crm-textMuted mt-1 leading-relaxed">
            The corporate payroll sheet and salary records contain confidential compensation structures and banking details. Access is strictly limited to <span className="text-rose-400 font-semibold">HR Operations</span> and <span className="text-rose-400 font-semibold">Super Admin</span>.
          </p>
        </div>
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={() => navigateTo('/app/dashboard')}>
            Return to Authorized Workspace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-crm-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-turquoise/10 border border-turquoise/20 text-turquoise">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-crm-text tracking-tight">
                Corporate Payroll Sheet
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                HR & Super Admin Only
              </span>
            </div>
            <p className="text-xs text-crm-textMuted mt-0.5">
              Monthly employee salary ledger, statutory deductions & 1-click payslip generator
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-crm-surface px-2.5 py-1.5 rounded-lg border border-crm-border text-xs">
            <span className="text-crm-textMuted font-medium">Payroll Month:</span>
            <select
              value={selectedMonthCode}
              onChange={(e) => setSelectedMonthCode(e.target.value)}
              className="bg-transparent font-bold text-turquoise focus:outline-none cursor-pointer"
            >
              {MONTH_OPTIONS.map(m => (
                <option key={m.code} value={m.code} className="bg-crm-card text-crm-text">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export to CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5 text-turquoise" />}
          >
            Export Sheet (CSV)
          </Button>
        </div>
      </div>

      {/* 2. Payroll KPI Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border/60 hover:border-crm-border transition-colors">
          <div className="text-[10px] font-semibold uppercase text-turquoise mb-1">Total Net Disbursement</div>
          <div className="text-2xl font-bold font-mono text-crm-text">
            {formatINR(summary.totalDisbursement)}
          </div>
          <div className="text-[10px] text-crm-textMuted font-mono">
            Avg: {formatINR(summary.averageSalary)} / employee
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border/60 hover:border-crm-border transition-colors">
          <div className="text-[10px] font-semibold uppercase text-crm-textMuted mb-1">Total Employees</div>
          <div className="text-2xl font-bold font-mono text-crm-text">
            {summary.totalEmployees}
          </div>
          <div className="text-[10px] text-crm-textMuted">Active on Payroll</div>
        </div>

        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border/60 hover:border-crm-border transition-colors">
          <div className="text-[10px] font-semibold uppercase text-emerald-400 mb-1">Salaries Disbursed</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {summary.paidCount}
          </div>
          <div className="text-[10px] text-crm-textMuted">Settled to Bank Accounts</div>
        </div>

        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border/60 hover:border-crm-border transition-colors">
          <div className="text-[10px] font-semibold uppercase text-blue-400 mb-1">In Processing</div>
          <div className="text-2xl font-bold font-mono text-blue-400">
            {summary.processingCount}
          </div>
          <div className="text-[10px] text-crm-textMuted">Bank Batch Queued</div>
        </div>

        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border/60 hover:border-crm-border transition-colors">
          <div className="text-[10px] font-semibold uppercase text-amber-400 mb-1">Pending Approval</div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {summary.pendingCount}
          </div>
          <div className="text-[10px] text-crm-textMuted">Awaiting HR Clearance</div>
        </div>
      </div>

      {/* 3. Filter Toolbar & Bulk Actions */}
      <div className="p-4 rounded-xl bg-crm-card/70 border border-crm-border/70 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-crm-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee name, ID, designation, bank account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-crm-surface border border-crm-border text-crm-text placeholder-crm-textMuted focus:outline-none focus:border-turquoise text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-crm-textMuted hover:text-crm-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="p-2.5 rounded-lg bg-turquoise/10 border border-turquoise/30 flex items-center justify-between text-xs animate-in fade-in">
            <span className="font-semibold text-turquoise">
              {selectedIds.length} employee record(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange('processing')}
                className="text-xs h-7 border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
              >
                Mark Processing
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleBulkStatusChange('paid')}
                leftIcon={<Check className="w-3.5 h-3.5" />}
                className="text-xs h-7 bg-emerald-500 hover:bg-emerald-600"
              >
                Mark as Paid (Disbursed)
              </Button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-crm-textMuted hover:text-crm-text p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Spreadsheet-Style Payroll Matrix Table */}
      <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1550px]">
            <thead>
              <tr className="bg-crm-surface/80 border-b border-crm-border text-crm-textMuted font-semibold select-none">
                <th className="py-3 px-3 w-10 text-center sticky left-0 bg-crm-surface/95 z-20">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredRecords.length}
                    onChange={handleToggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-crm-border text-turquoise accent-turquoise cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-28 sticky left-10 bg-crm-surface/95 z-20">EMP ID</th>
                <th className="py-3 px-3.5 w-52 sticky left-38 bg-crm-surface/95 z-20">EMPLOYEE NAME</th>
                <th className="py-3 px-3.5 w-52">DESIGNATION & DEPT</th>
                <th className="py-3 px-3.5 w-48">BANK DETAILS</th>
                <th className="py-3 px-3 w-32 text-right">GROSS CTC</th>
                <th className="py-3 px-3 w-28 text-right">BASIC PAY</th>
                <th className="py-3 px-3 w-28 text-right">HRA</th>
                <th className="py-3 px-3 w-32 text-right">ALLOWANCES</th>
                <th className="py-3 px-3 w-32 text-right text-rose-300">DEDUCTIONS</th>
                <th className="py-3 px-3.5 w-40 text-right bg-emerald-500/5 text-emerald-400 font-bold">NET SALARY</th>
                <th className="py-3 px-3 w-24 text-center">DAYS</th>
                <th className="py-3 px-3.5 w-36 text-center">STATUS</th>
                <th className="py-3 px-3.5 sticky right-0 bg-crm-surface/95 z-20 text-center w-36">PAYSLIP ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-crm-border/40">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-crm-textMuted">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40 text-crm-textMuted" />
                    <p className="font-semibold text-crm-text">No payroll records match filter criteria</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => {
                  const isSelected = selectedIds.includes(r.id);
                  const statusCfg = STATUS_BADGE[r.status] || STATUS_BADGE.pending;

                  return (
                    <tr 
                      key={r.id} 
                      className={cn(
                        "hover:bg-crm-surface/40 transition-colors group",
                        isSelected && "bg-turquoise/[0.03]"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center sticky left-0 bg-crm-card group-hover:bg-crm-surface/40 z-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(r.id)}
                          className="w-3.5 h-3.5 rounded border-crm-border text-turquoise accent-turquoise cursor-pointer"
                        />
                      </td>

                      {/* EMP ID */}
                      <td className="py-3 px-3 font-mono font-semibold text-crm-text sticky left-10 bg-crm-card group-hover:bg-crm-surface/40 z-10">
                        {r.employeeId}
                      </td>

                      {/* EMPLOYEE NAME */}
                      <td className="py-3 px-3.5 sticky left-38 bg-crm-card group-hover:bg-crm-surface/40 z-10">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.employeeName} size="xs" />
                          <div>
                            <div className="font-bold text-crm-text">{r.employeeName}</div>
                            <div className="text-[10px] text-crm-textMuted font-mono">DOJ: {r.joiningDate || '2025-01-01'}</div>
                          </div>
                        </div>
                      </td>

                      {/* DESIGNATION & DEPT */}
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-crm-text">{r.designation}</div>
                        <div className="text-[10px] text-turquoise">{r.department}</div>
                      </td>

                      {/* BANK DETAILS */}
                      <td className="py-3 px-3.5 font-mono text-[11px]">
                        <div className="text-crm-text font-medium">{r.bankName}</div>
                        <div className="text-crm-textMuted">A/C: ••••{r.accountNumber.slice(-4)} • {r.ifscCode}</div>
                      </td>

                      {/* GROSS CTC */}
                      <td className="py-3 px-3 text-right font-mono text-crm-text">
                        {formatINR(r.grossSalary)}
                      </td>

                      {/* BASIC PAY */}
                      <td className="py-3 px-3 text-right font-mono text-crm-textSecondary">
                        {formatINR(r.basicSalary)}
                      </td>

                      {/* HRA */}
                      <td className="py-3 px-3 text-right font-mono text-crm-textSecondary">
                        {formatINR(r.hra)}
                      </td>

                      {/* ALLOWANCES */}
                      <td className="py-3 px-3 text-right font-mono text-crm-textSecondary">
                        {formatINR(r.specialAllowance + r.performanceBonus)}
                      </td>

                      {/* DEDUCTIONS */}
                      <td className="py-3 px-3 text-right font-mono text-rose-300 font-semibold">
                        -{formatINR(r.totalDeductions)}
                      </td>

                      {/* NET SALARY */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400 bg-emerald-500/[0.03]">
                        {formatINR(r.netSalary)}
                      </td>

                      {/* DAYS */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="text-crm-text">{r.paidDays}</span>
                        <span className="text-crm-textMuted text-[10px]">/{r.totalDaysInMonth}</span>
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-3.5 text-center">
                        <select
                          value={r.status}
                          onChange={(e) => handleSingleStatusUpdate(r, e.target.value as PayrollPaymentStatus)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[11px] font-bold border focus:outline-none cursor-pointer bg-crm-surface uppercase",
                            statusCfg.badge
                          )}
                        >
                          <option value="paid">Paid</option>
                          <option value="processing">Processing</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>

                      {/* PAYSLIP ACTION */}
                      <td className="py-3 px-3.5 sticky right-0 bg-crm-card group-hover:bg-crm-surface/40 z-10 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openPayslip(r)}
                            leftIcon={<FileText className="w-3.5 h-3.5" />}
                            className="text-xs h-7 px-2.5 bg-turquoise hover:bg-turquoise/90 text-crm-bg font-bold"
                          >
                            Payslip
                          </Button>

                          <button
                            onClick={() => openEditModal(r)}
                            title="Edit Salary Structure"
                            className="p-1.5 rounded hover:bg-crm-surface text-crm-textMuted hover:text-turquoise transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: OFFICIAL CORPORATE PAYSLIP ================= */}
      {isPayslipModalOpen && activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-crm-bg/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-crm-card border border-crm-border rounded-2xl shadow-modal max-w-3xl w-full p-4 sm:p-6 space-y-4 my-8 animate-in zoom-in-95">
            <CorporatePayslip 
              record={activeRecord} 
              onClose={() => setIsPayslipModalOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SALARY STRUCTURE ================= */}
      {isEditModalOpen && activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-crm-bg/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-crm-card border border-crm-border rounded-xl shadow-modal max-w-xl w-full p-5 space-y-4 my-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-crm-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-turquoise/15 text-turquoise">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-crm-text">Edit Salary Structure & Payslip Data</h2>
                  <p className="text-[11px] text-crm-textMuted">{activeRecord.employeeName} ({activeRecord.employeeId}) • {activeRecord.month}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-crm-textMuted hover:text-crm-text p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSalarySubmit} className="space-y-4 text-xs">
              {/* Monthly Gross Input with Auto-Split */}
              <div className="p-3 rounded-lg bg-turquoise/10 border border-turquoise/20">
                <label className="block text-crm-text font-bold mb-1">
                  Monthly Gross CTC (INR ₹) — Auto Recalculates Structure
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-turquoise font-mono font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={editForm.grossSalary}
                    onChange={(e) => handleGrossChange(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono font-bold text-sm focus:outline-none focus:border-turquoise"
                  />
                </div>
                <p className="text-[10px] text-crm-textMuted mt-1">
                  Changing Gross auto-populates Basic (50%), HRA (25%), Conveyance (10%), Allowances, and non-payable LOP.
                </p>
              </div>

              {/* Earnings Breakdown */}
              <div className="p-3 bg-crm-surface/60 rounded-lg border border-crm-border/60 space-y-2">
                <div className="font-semibold text-turquoise uppercase text-[10px] tracking-wider">Earnings Breakdown (Monthly)</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Basic Salary (₹)</label>
                    <input
                      type="number"
                      value={editForm.basicSalary}
                      onChange={(e) => setEditForm({ ...editForm, basicSalary: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">HRA (₹)</label>
                    <input
                      type="number"
                      value={editForm.hra}
                      onChange={(e) => setEditForm({ ...editForm, hra: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Conveyance Allowance (₹)</label>
                    <input
                      type="number"
                      value={editForm.conveyanceAllowance}
                      onChange={(e) => setEditForm({ ...editForm, conveyanceAllowance: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Special Allowance (₹)</label>
                    <input
                      type="number"
                      value={editForm.specialAllowance}
                      onChange={(e) => setEditForm({ ...editForm, specialAllowance: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Bonus / Incentives (₹)</label>
                    <input
                      type="number"
                      value={editForm.performanceBonus}
                      onChange={(e) => setEditForm({ ...editForm, performanceBonus: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="p-3 bg-crm-surface/60 rounded-lg border border-crm-border/60 space-y-2">
                <div className="font-semibold text-rose-400 uppercase text-[10px] tracking-wider">Deductions Breakdown</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Income Tax (₹)</label>
                    <input
                      type="number"
                      value={editForm.tds}
                      onChange={(e) => setEditForm({ ...editForm, tds: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">PF Deduction (₹)</label>
                    <input
                      type="number"
                      value={editForm.providentFund}
                      onChange={(e) => setEditForm({ ...editForm, providentFund: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Non - payable / LOP (₹)</label>
                    <input
                      type="number"
                      value={editForm.nonPayable}
                      onChange={(e) => setEditForm({ ...editForm, nonPayable: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Professional Tax (₹)</label>
                    <input
                      type="number"
                      value={editForm.professionalTax}
                      onChange={(e) => setEditForm({ ...editForm, professionalTax: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Attendance & Payslip Dates */}
              <div className="p-3 bg-crm-surface/60 rounded-lg border border-crm-border/60 space-y-2">
                <div className="font-semibold text-emerald-400 uppercase text-[10px] tracking-wider">Attendance & Key Dates</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Paid Days</label>
                    <input
                      type="number"
                      value={editForm.paidDays}
                      onChange={(e) => setEditForm({ ...editForm, paidDays: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">LOP Days</label>
                    <input
                      type="number"
                      value={editForm.lopDays}
                      onChange={(e) => setEditForm({ ...editForm, lopDays: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Joining Date</label>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={editForm.joiningDate}
                      onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Pay Date</label>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={editForm.payDate}
                      onChange={(e) => setEditForm({ ...editForm, payDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details & Status */}
              <div className="p-3 bg-crm-surface/60 rounded-lg border border-crm-border/60 space-y-2">
                <div className="font-semibold text-crm-text uppercase text-[10px] tracking-wider">Bank Details & Disbursement Status</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Bank Name</label>
                    <input
                      type="text"
                      value={editForm.bankName}
                      onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Account Number</label>
                    <input
                      type="text"
                      value={editForm.accountNumber}
                      onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-textMuted mb-0.5">Payment Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as PayrollPaymentStatus })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-bold uppercase"
                    >
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-crm-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
