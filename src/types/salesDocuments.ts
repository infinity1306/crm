// ==============================================================================
// STAR CHAIN LABS CRM — Sales Documents Data Models
// Proposals, Quotations, and Invoices generation with PDF and client sharing
// ==============================================================================

export type SalesDocumentType = 'proposal' | 'quotation' | 'invoice';

export type SalesDocumentStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'paid' | 'expired';

export interface SalesDocItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 18 for 18% GST
  amount: number;  // (quantity * unitPrice) + tax
}

export interface SalesDocument {
  id: string;                         // e.g. "DOC-2026-001"
  docNumber: string;                  // e.g. "SCL-PROP-101", "SCL-QUO-204", "SCL-INV-305"
  type: SalesDocumentType;            // 'proposal' | 'quotation' | 'invoice'
  title: string;                      // Project / Service Title
  status: SalesDocumentStatus;

  // Client Details
  clientId?: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientGst?: string;

  // Commercial Details
  issueDate: string;                  // YYYY-MM-DD
  validUntilOrDueDate: string;        // YYYY-MM-DD
  currency: 'INR' | 'USD' | 'EUR';
  items: SalesDocItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;

  // Proposal / Quotation Specifics
  scopeOfWork?: string;
  deliverables?: string[];
  timelineDays?: number;

  // Payment & Bank Terms
  paymentTerms: string;               // e.g. "50% Advance, 50% upon deployment"
  notes?: string;
  termsAndConditions: string;

  // Company Banking Coordinates
  bankDetails: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
    upiId?: string;
  };

  // Sales Agent Metadata
  preparedById: string;
  preparedByName: string;
  preparedByEmail: string;

  createdAt: string;
  updatedAt: string;
}
