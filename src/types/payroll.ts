// ==============================================================================
// STAR CHAIN LABS CRM — Payroll & Payslip Generator Types
// Access restricted strictly to HR Operations and Super Admin
// ==============================================================================

export type PayrollPaymentStatus = 'paid' | 'pending' | 'processing';

export type PaymentMode = 'NEFT' | 'IMPS' | 'Direct Bank Transfer' | 'Cheque';

export interface PayrollRecord {
  id: string;
  employeeId: string;           // e.g. EMP-001, SCL-001
  employeeName: string;         // NAME
  designation: string;          // DESIGNATION
  department: string;           // DEPARTMENT
  month: string;                // e.g. "September 2026"
  monthCode: string;            // e.g. "2026-09"
  year: number;                 // e.g. 2026
  
  // Bank & Verification Details
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  panNumber?: string;
  uanNumber?: string;
  joiningDate?: string;

  // Attendance & Days
  totalDaysInMonth: number;     // e.g. 30
  workingDays: number;          // e.g. 26
  paidDays: number;             // e.g. 26
  lopDays: number;              // Loss of pay / unpaid leave

  // Compensation Structure (Monthly INR)
  grossSalary: number;          // Total Monthly Gross CTC
  basicSalary: number;          // Usually 50% of gross
  hra: number;                  // House Rent Allowance (usually 25% of gross)
  specialAllowance: number;     // Special allowance / Conveyance
  performanceBonus: number;     // Variable / Incentive
  totalEarnings: number;        // Sum of all earnings

  // Deductions
  providentFund: number;        // Employee PF contribution (12% of basic or cap)
  professionalTax: number;      // Statutory PT (₹200)
  tds: number;                  // Tax Deducted at Source (Income Tax)
  otherDeductions: number;      // LOP or advances
  totalDeductions: number;      // Sum of all deductions

  // Final Net Pay
  netSalary: number;            // totalEarnings - totalDeductions

  // Payment Tracking
  status: PayrollPaymentStatus;
  paymentDate?: string;
  paymentMode?: PaymentMode;
  transactionRef?: string;
  remarks?: string;

  updatedAt?: string;
}

export interface PayrollSummaryMetrics {
  totalDisbursement: number;
  totalEmployees: number;
  paidCount: number;
  pendingCount: number;
  processingCount: number;
  averageSalary: number;
}
