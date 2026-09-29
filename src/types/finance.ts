// STAR CHAIN LABS — Internal CRM
// Phase 5: Finance, Revenue & Billing Type Definitions

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'upi' | 'card' | 'cash' | 'other';
export type PaymentStatus = 'successful' | 'pending' | 'failed' | 'refunded';
export type ExpenseCategory = 'travel' | 'software' | 'equipment' | 'marketing' | 'office' | 'client' | 'other';
export type ExpenseStatus = 'submitted' | 'approved' | 'rejected' | 'paid';
export type CurrencyCode = 'INR' | 'USD' | 'EUR';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number; // quantity * unitPrice
}

export interface RecurringInvoiceConfig {
  frequency: 'monthly' | 'quarterly' | 'yearly';
  nextIssueDate: string;
  autoSend: boolean;
  isActive: boolean;
}

export interface InvoiceHistoryEvent {
  id: string;
  timestamp: string;
  action: 'created' | 'sent' | 'payment_recorded' | 'status_changed' | 'overdue_marked' | 'cancelled';
  actorName: string;
  note?: string;
  amount?: number;
}

export interface Invoice {
  id: string; // e.g. "INV-2026-001"
  invoiceNumber: string; // e.g. "SCL-INV-1024"
  clientId: string; // references Company.id
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientGstNumber?: string;
  projectId?: string; // references Project.id
  projectName?: string;
  dealId?: string; // references Deal.id if originated from Won Deal
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  currency: CurrencyCode;
  items: InvoiceItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number; // e.g. 18 for 18% GST
  taxAmount: number;
  total: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  notes?: string;
  paymentTerms?: string; // e.g. "Net 15", "Net 30", "Due on Receipt"
  recurringConfig?: RecurringInvoiceConfig;
  history: InvoiceHistoryEvent[];
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string;
}

export interface Payment {
  id: string; // e.g. "PAY-2026-001"
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  amount: number;
  currency: CurrencyCode;
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  reference: string; // UTR / IMPS / Transaction Reference / Cheque No
  status: PaymentStatus;
  notes?: string;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
}

export interface Expense {
  id: string; // e.g. "EXP-2026-001"
  title: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  category: ExpenseCategory;
  amount: number;
  currency: CurrencyCode;
  date: string; // YYYY-MM-DD
  projectId?: string;
  projectName?: string;
  description: string;
  receiptFileName?: string;
  receiptFileSize?: string;
  notes?: string;
  status: ExpenseStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  paidAt?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceOrgConfig {
  defaultCurrency: CurrencyCode;
  defaultTaxRate: number; // 18% GST
  taxLabel: string; // e.g. "GST (CGST + SGST)"
  invoicePrefix: string; // e.g. "SCL-INV-"
  defaultPaymentTerms: string; // e.g. "Net 15 Days"
  companyGstNumber: string;
  companyPan: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
    upiId: string;
  };
}

export interface FinanceSummaryMetrics {
  totalRevenue: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  totalExpenses: number;
  netRevenue: number;
  invoicesCount: number;
  paidInvoicesCount: number;
  overdueInvoicesCount: number;
  pendingExpensesCount: number;
}
