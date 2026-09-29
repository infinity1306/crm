// ==============================================================================
// STAR CHAIN LABS CRM — Payroll & Payslip Service
// Manages salary ledger, automated calculations, payslip generation & CSV exports
// ==============================================================================

import { PayrollRecord, PayrollPaymentStatus, PayrollSummaryMetrics } from '../types/payroll';
import { supabaseAdmin } from '../lib/supabase';

const PAYROLL_STORAGE_KEY = 'scl_payroll_records_v1';

/**
 * Converts a numeric amount to Indian currency words format
 * e.g. 125500 -> "Rupees One Lakh Twenty Five Thousand Five Hundred Only"
 */
export function convertNumberToWordsIndian(num: number): string {
  if (num === 0) return 'Rupees Zero Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  const rounded = Math.round(num);
  return `Rupees ${inWords(rounded)} Only`;
}

/**
 * Builds standard salary breakdown from a Gross CTC amount
 */
export function calculateSalaryBreakdown(gross: number, paidDays: number = 30, totalDays: number = 30) {
  // Pro-rate if loss of pay
  const dayRatio = totalDays > 0 ? paidDays / totalDays : 1;
  const effectiveGross = Math.round(gross * dayRatio);

  const basicSalary = Math.round(effectiveGross * 0.50);
  const hra = Math.round(effectiveGross * 0.25);
  const specialAllowance = Math.round(effectiveGross * 0.20);
  const performanceBonus = Math.round(effectiveGross * 0.05);
  const totalEarnings = basicSalary + hra + specialAllowance + performanceBonus;

  // Deductions
  const providentFund = basicSalary >= 15000 ? 1800 : Math.round(basicSalary * 0.12);
  const professionalTax = 200; // Standard Karnataka/Maharashtra PT
  let tds = 0;
  if (gross >= 150000) tds = 15000;
  else if (gross >= 100000) tds = 7500;
  else if (gross >= 60000) tds = 2500;

  const totalDeductions = providentFund + professionalTax + tds;
  const netSalary = Math.max(0, totalEarnings - totalDeductions);

  return {
    grossSalary: gross,
    basicSalary,
    hra,
    specialAllowance,
    performanceBonus,
    totalEarnings,
    providentFund,
    professionalTax,
    tds,
    otherDeductions: 0,
    totalDeductions,
    netSalary
  };
}

/**
 * Reads stored payroll records
 */
function getStoredRawRecords(): PayrollRecord[] {
  try {
    const raw = localStorage.getItem(PAYROLL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Initializes or fetches payroll records for a selected month and syncs with current employees
 */
export function getPayrollRecords(monthCode: string = '2026-09', employees: any[]): PayrollRecord[] {
  const stored = getStoredRawRecords();
  const existingForMonth = stored.filter(r => r.monthCode === monthCode);

  if (existingForMonth.length > 0) {
    return existingForMonth;
  }

  // Pre-seed for this month from existing team directory
  const monthName = 'September 2026';
  const defaultRecords: PayrollRecord[] = employees.map((emp, index) => {
    // 1. Try reading 3-segment bank details from local storage
    let bankName = 'HDFC Bank';
    let accountNumber = `501002345678${String(index + 10).padStart(2, '0')}`;
    let ifscCode = 'HDFC0001234';
    let panNumber = `ABCDE${String(1000 + index)}F`;
    let uanNumber = `10123456${String(7890 + index)}`;

    try {
      const segRaw = localStorage.getItem(`scl_emp_segments_${emp.id}`);
      if (segRaw) {
        const seg = JSON.parse(segRaw);
        if (seg.bank?.bankName) bankName = seg.bank.bankName;
        if (seg.bank?.accountNumber) accountNumber = seg.bank.accountNumber;
        if (seg.bank?.ifscCode) ifscCode = seg.bank.ifscCode;
      }
    } catch {}

    // 2. Base salary based on designation / role
    let baseGross = 75000;
    const des = (emp.designation || '').toLowerCase();
    const role = (emp.role || '').toLowerCase();

    if (role === 'super_admin' || des.includes('director') || des.includes('lead') || des.includes('vp')) {
      baseGross = 185000;
    } else if (des.includes('senior') || des.includes('manager')) {
      baseGross = 125000;
    } else if (des.includes('engineer') || des.includes('sales') || des.includes('hr')) {
      baseGross = 85000;
    } else {
      baseGross = 55000;
    }

    const calc = calculateSalaryBreakdown(baseGross, 30, 30);

    return {
      id: `pay-${emp.id}-${monthCode}`,
      employeeId: emp.id.toUpperCase(),
      employeeName: emp.name,
      designation: emp.designation || 'Staff',
      department: emp.department || 'Engineering',
      month: monthName,
      monthCode,
      year: 2026,
      bankName,
      accountNumber,
      ifscCode,
      panNumber,
      uanNumber,
      joiningDate: emp.joinedDate || '2025-01-01',
      totalDaysInMonth: 30,
      workingDays: 26,
      paidDays: 30,
      lopDays: 0,
      ...calc,
      status: index % 3 === 0 ? 'paid' : index % 3 === 1 ? 'processing' : 'pending',
      paymentDate: index % 3 === 0 ? '2026-09-28' : undefined,
      paymentMode: 'NEFT',
      transactionRef: index % 3 === 0 ? `NEFT-SCL-${Date.now().toString().slice(-6)}-${index}` : undefined,
      remarks: 'Standard monthly salary disbursement'
    };
  });

  // Save initialized records
  const allStored = [...stored.filter(r => r.monthCode !== monthCode), ...defaultRecords];
  localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(allStored));
  return defaultRecords;
}

/**
 * Saves or updates an individual payroll record
 */
export function savePayrollRecord(record: PayrollRecord): PayrollRecord {
  const stored = getStoredRawRecords();
  const existingIdx = stored.findIndex(r => r.id === record.id);
  const now = new Date().toISOString();

  let updatedList: PayrollRecord[];
  if (existingIdx >= 0) {
    updatedList = [...stored];
    updatedList[existingIdx] = { ...record, updatedAt: now };
  } else {
    updatedList = [{ ...record, updatedAt: now }, ...stored];
  }

  localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(updatedList));

  // Sync to Supabase audit log
  try {
    supabaseAdmin.from('audit_logs').insert({
      user_name: 'HR Payroll Desk',
      user_role: 'admin',
      action: 'PAYROLL_SALARY_UPDATE',
      details: {
        recordId: record.id,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        grossSalary: record.grossSalary,
        netSalary: record.netSalary,
        status: record.status
      },
      timestamp: now
    });
  } catch {}

  return record;
}

/**
 * Bulk updates payment status for selected records
 */
export function bulkUpdatePayrollStatus(ids: string[], status: PayrollPaymentStatus): void {
  const stored = getStoredRawRecords();
  const now = new Date().toISOString().split('T')[0];

  const updatedList = stored.map(r => {
    if (ids.includes(r.id)) {
      return {
        ...r,
        status,
        paymentDate: status === 'paid' ? now : r.paymentDate,
        transactionRef: status === 'paid' && !r.transactionRef ? `NEFT-SCL-${Date.now().toString().slice(-6)}` : r.transactionRef,
        updatedAt: new Date().toISOString()
      };
    }
    return r;
  });

  localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(updatedList));
}

/**
 * Deletes a payroll record
 */
export function deletePayrollRecord(id: string): boolean {
  const stored = getStoredRawRecords();
  const filtered = stored.filter(r => r.id !== id);
  localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Calculates overall summary metrics for the payroll sheet
 */
export function getPayrollSummary(records: PayrollRecord[]): PayrollSummaryMetrics {
  const totalEmployees = records.length;
  const totalDisbursement = records.reduce((sum, r) => sum + r.netSalary, 0);
  const paidCount = records.filter(r => r.status === 'paid').length;
  const pendingCount = records.filter(r => r.status === 'pending').length;
  const processingCount = records.filter(r => r.status === 'processing').length;
  const averageSalary = totalEmployees > 0 ? Math.round(totalDisbursement / totalEmployees) : 0;

  return {
    totalDisbursement,
    totalEmployees,
    paidCount,
    pendingCount,
    processingCount,
    averageSalary
  };
}

/**
 * Exports payroll sheet as CSV formatted with Indian numbering
 */
export function exportPayrollToCSV(records: PayrollRecord[]): void {
  const headers = [
    'EMPLOYEE ID',
    'EMPLOYEE NAME',
    'DESIGNATION',
    'DEPARTMENT',
    'MONTH',
    'BANK NAME',
    'ACCOUNT NUMBER',
    'IFSC CODE',
    'PAID DAYS',
    'LOSS OF PAY DAYS',
    'MONTHLY GROSS CTC (INR)',
    'BASIC SALARY (INR)',
    'HRA (INR)',
    'SPECIAL ALLOWANCES (INR)',
    'BONUS / INCENTIVES (INR)',
    'TOTAL EARNINGS (INR)',
    'PF DEDUCTION (INR)',
    'PROFESSIONAL TAX (INR)',
    'TDS / INCOME TAX (INR)',
    'TOTAL DEDUCTIONS (INR)',
    'NET PAYABLE SALARY (INR)',
    'PAYMENT STATUS',
    'PAYMENT DATE',
    'TXN REFERENCE'
  ];

  const rows = records.map(r => [
    `"${r.employeeId}"`,
    `"${r.employeeName}"`,
    `"${r.designation}"`,
    `"${r.department}"`,
    `"${r.month}"`,
    `"${r.bankName}"`,
    `"${r.accountNumber}"`,
    `"${r.ifscCode}"`,
    r.paidDays,
    r.lopDays,
    r.grossSalary,
    r.basicSalary,
    r.hra,
    r.specialAllowance,
    r.performanceBonus,
    r.totalEarnings,
    r.providentFund,
    r.professionalTax,
    r.tds,
    r.totalDeductions,
    r.netSalary,
    `"${r.status.toUpperCase()}"`,
    `"${r.paymentDate || ''}"`,
    `"${r.transactionRef || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `StarChainLabs_Payroll_Sheet_${records[0]?.monthCode || '2026-09'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
