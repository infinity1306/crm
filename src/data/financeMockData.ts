import { 
  Invoice, 
  Payment, 
  Expense, 
  FinanceOrgConfig 
} from '../types/finance';

export const DEFAULT_FINANCE_CONFIG: FinanceOrgConfig = {
  defaultCurrency: 'INR',
  defaultTaxRate: 18,
  taxLabel: 'GST (18%)',
  invoicePrefix: 'SCL-INV-',
  defaultPaymentTerms: 'Net 30 Days',
  companyGstNumber: '',
  companyPan: '',
  bankDetails: {
    bankName: '',
    accountName: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    upiId: '',
  },
};

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_EXPENSES: Expense[] = [];
