import { SalesDocument } from '../types/salesDocuments';

export const INITIAL_SALES_DOCUMENTS: SalesDocument[] = [
  {
    id: 'doc-prop-001',
    docNumber: 'SCL-PROP-2026-001',
    type: 'proposal',
    title: 'Enterprise CRM & Real-Time Cloud Infrastructure Proposal',
    status: 'sent',
    clientName: 'Vikramaditya Roy',
    clientCompany: 'Apex Financial Services Ltd.',
    clientEmail: 'vikram.roy@apexfin.com',
    clientPhone: '+91 98450 12345',
    clientAddress: 'Level 14, One Horizon Center, Golf Course Road, Gurugram 122002',
    clientGst: '06AAACA1234B1Z5',
    issueDate: '2026-09-25',
    validUntilOrDueDate: '2026-10-25',
    currency: 'INR',
    scopeOfWork: 'Design, engineering and deployment of full-stack CRM infrastructure with Supabase event-driven ledgers, multi-role dashboard controls, shift attendance geofencing, and automated client billing.',
    deliverables: [
      'Supabase event-sourced PostgreSQL architecture',
      'Role-based access matrix (Executive, Sales, HR, Client)',
      'Automated sales quotation & invoice PDF engine',
      'Integrated Google Meet scheduling matrix with executive access'
    ],
    timelineDays: 45,
    items: [
      {
        id: 'item-1',
        description: 'Custom Enterprise CRM Architecture & Deployment',
        quantity: 1,
        unitPrice: 350000,
        taxRate: 18,
        amount: 413000
      },
      {
        id: 'item-2',
        description: 'Supabase Real-Time Event Ledger & Geofenced Attendance Engine',
        quantity: 1,
        unitPrice: 150000,
        taxRate: 18,
        amount: 177000
      }
    ],
    subtotal: 500000,
    discountPercentage: 5,
    discountAmount: 25000,
    taxAmount: 85500,
    grandTotal: 560500,
    paymentTerms: '40% Mobilization Advance, 40% on UAT Approval, 20% on Production Go-Live',
    notes: 'Thank you for choosing Star Chain Labs as your digital engineering partner.',
    termsAndConditions: '1. Quotation valid for 30 calendar days from issue date.\n2. Scope adjustments requested after sign-off will be billed on time & materials basis.\n3. Source code ownership transfers upon final milestone clearance.',
    bankDetails: {
      bankName: 'HDFC Bank',
      accountHolder: 'Star Chain Labs Private Limited',
      accountNumber: '50100234567890',
      ifscCode: 'HDFC0001234',
      branch: 'Indiranagar 100ft Rd, Bangalore',
      upiId: 'starchainlabs@okhdfcbank'
    },
    preparedById: 'emp-admin',
    preparedByName: 'Harshit Sharma',
    preparedByEmail: 'harshit@starchainlabs.com',
    createdAt: '2026-09-25T10:00:00Z',
    updatedAt: '2026-09-25T10:00:00Z'
  },
  {
    id: 'doc-quo-002',
    docNumber: 'SCL-QUO-2026-002',
    type: 'quotation',
    title: 'Cloud DevOps & API Pipeline Modernization Quote',
    status: 'draft',
    clientName: 'Priya Nambiar',
    clientCompany: 'NexGen Mobility Labs',
    clientEmail: 'priya.nambiar@nexgen.io',
    clientPhone: '+91 99887 76655',
    clientAddress: 'Tower B, Brigade Tech Gardens, Whitefield, Bangalore 560066',
    clientGst: '29AABCN5678M1Z2',
    issueDate: '2026-09-28',
    validUntilOrDueDate: '2026-10-15',
    currency: 'INR',
    scopeOfWork: 'Automated CI/CD pipelines, Kubernetes container orchestration, and zero-downtime microservice migrations.',
    deliverables: [
      'GitLab/GitHub Actions automated deployment pipelines',
      'Managed Kubernetes cluster hardening',
      'Prometheus and Grafana observability stack'
    ],
    timelineDays: 30,
    items: [
      {
        id: 'item-1',
        description: 'Multi-Environment Cloud CI/CD Implementation',
        quantity: 1,
        unitPrice: 180000,
        taxRate: 18,
        amount: 212400
      },
      {
        id: 'item-2',
        description: 'SLA Support & Maintenance (First 3 Months)',
        quantity: 3,
        unitPrice: 40000,
        taxRate: 18,
        amount: 141600
      }
    ],
    subtotal: 300000,
    discountPercentage: 0,
    discountAmount: 0,
    taxAmount: 54000,
    grandTotal: 354000,
    paymentTerms: '50% Upon Acceptance, 50% Upon Handover',
    notes: 'Estimates based on current AWS/GCP cloud topology.',
    termsAndConditions: '1. Standard 30-day warranty included.\n2. Cloud hosting credits / billing handled directly by client account.',
    bankDetails: {
      bankName: 'HDFC Bank',
      accountHolder: 'Star Chain Labs Private Limited',
      accountNumber: '50100234567890',
      ifscCode: 'HDFC0001234',
      branch: 'Indiranagar 100ft Rd, Bangalore',
      upiId: 'starchainlabs@okhdfcbank'
    },
    preparedById: 'emp-admin',
    preparedByName: 'Harshit Sharma',
    preparedByEmail: 'harshit@starchainlabs.com',
    createdAt: '2026-09-28T14:30:00Z',
    updatedAt: '2026-09-28T14:30:00Z'
  },
  {
    id: 'doc-inv-003',
    docNumber: 'SCL-INV-2026-003',
    type: 'invoice',
    title: 'Milestone 1 Clearance: Mobile App & Portal Backend',
    status: 'sent',
    clientName: 'Rahul Verma',
    clientCompany: 'Zepf Health Technologies',
    clientEmail: 'rahul.verma@zepfhealth.in',
    clientPhone: '+91 97112 34567',
    clientAddress: 'Plot 45, Udyog Vihar Phase IV, Gurugram 122015',
    clientGst: '06AABCZ9988P1ZR',
    issueDate: '2026-09-27',
    validUntilOrDueDate: '2026-10-12',
    currency: 'INR',
    items: [
      {
        id: 'item-1',
        description: 'Milestone 1: Backend Architecture & Patient Health Record API',
        quantity: 1,
        unitPrice: 220000,
        taxRate: 18,
        amount: 259600
      }
    ],
    subtotal: 220000,
    discountPercentage: 0,
    discountAmount: 0,
    taxAmount: 39600,
    grandTotal: 259600,
    paymentTerms: 'Payment due within 15 calendar days of invoice date (Net 15)',
    notes: 'Please quote invoice number SCL-INV-2026-003 in your bank transfer reference.',
    termsAndConditions: '1. Overdue payments subject to 1.5% interest per month.\n2. All payments to be wired via NEFT/RTGS/IMPS to the designated bank account below.',
    bankDetails: {
      bankName: 'HDFC Bank',
      accountHolder: 'Star Chain Labs Private Limited',
      accountNumber: '50100234567890',
      ifscCode: 'HDFC0001234',
      branch: 'Indiranagar 100ft Rd, Bangalore',
      upiId: 'starchainlabs@okhdfcbank'
    },
    preparedById: 'emp-admin',
    preparedByName: 'Harshit Sharma',
    preparedByEmail: 'harshit@starchainlabs.com',
    createdAt: '2026-09-27T11:15:00Z',
    updatedAt: '2026-09-27T11:15:00Z'
  }
];
