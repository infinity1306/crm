import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { 
  SalesDocument, 
  SalesDocumentType, 
  SalesDocumentStatus, 
  SalesDocItem 
} from '../../../types/salesDocuments';
import { INITIAL_SALES_DOCUMENTS } from '../../../data/salesDocumentsMockData';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Share2, 
  Printer, 
  Send, 
  Check, 
  Trash2, 
  CreditCard, 
  Building2, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  ExternalLink, 
  Copy, 
  Sparkles,
  Layers,
  ArrowRight,
  MessageCircle,
  Mail,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export const SalesDocumentGenerator: React.FC = () => {
  const { currentUser, companies, contacts, addToast } = useCRM();

  // Load from localStorage or mock data
  const [documents, setDocuments] = useState<SalesDocument[]>(() => {
    const saved = localStorage.getItem('scl_sales_documents');
    return saved ? JSON.parse(saved) : INITIAL_SALES_DOCUMENTS;
  });

  const [activeTab, setActiveTab] = useState<'all' | SalesDocumentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<SalesDocument | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for creating/editing document
  const [docType, setDocType] = useState<SalesDocumentType>('proposal');
  const [docTitle, setDocTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientGst, setClientGst] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [timelineDays, setTimelineDays] = useState(30);
  const [paymentTerms, setPaymentTerms] = useState('50% Mobilization Advance, 50% upon deployment');
  const [notes, setNotes] = useState('Thank you for choosing Star Chain Labs as your digital engineering partner.');
  const [terms, setTerms] = useState('1. Document valid for 30 calendar days from issue date.\n2. Scope modifications will be billed based on mutual agreement.\n3. Taxes as applicable under GST guidelines.');

  // Dynamic Line Items
  const [items, setItems] = useState<SalesDocItem[]>([
    {
      id: 'item-1',
      description: 'Core Software Development & Architecture',
      quantity: 1,
      unitPrice: 150000,
      taxRate: 18,
      amount: 177000
    }
  ]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Sync to localStorage
  const saveDocumentsToStorage = (updated: SalesDocument[]) => {
    setDocuments(updated);
    localStorage.setItem('scl_sales_documents', JSON.stringify(updated));
  };

  // Calculations
  const calculatedSubtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
  }, [items]);

  const calculatedDiscount = useMemo(() => {
    return Math.round((calculatedSubtotal * discountPercent) / 100);
  }, [calculatedSubtotal, discountPercent]);

  const calculatedTax = useMemo(() => {
    const taxable = calculatedSubtotal - calculatedDiscount;
    return items.reduce((acc, it) => {
      const lineNet = it.quantity * it.unitPrice * (1 - discountPercent / 100);
      return acc + (lineNet * it.taxRate / 100);
    }, 0);
  }, [items, calculatedSubtotal, calculatedDiscount, discountPercent]);

  const calculatedGrandTotal = useMemo(() => {
    return Math.round((calculatedSubtotal - calculatedDiscount) + calculatedTax);
  }, [calculatedSubtotal, calculatedDiscount, calculatedTax]);

  // Open Create Modal with fresh defaults
  const handleOpenCreate = (type: SalesDocumentType = 'proposal') => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const prefix = type === 'proposal' ? 'SCL-PROP' : type === 'quotation' ? 'SCL-QUO' : 'SCL-INV';
    const year = new Date().getFullYear();
    
    setDocType(type);
    setDocNumber(`${prefix}-${year}-${randomSuffix}`);
    setDocTitle(type === 'proposal' ? 'Enterprise Software Proposal' : type === 'quotation' ? 'Price Quotation & Scope Estimate' : 'Commercial Tax Invoice');
    setClientName('');
    setClientCompany('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setClientGst('');
    setScopeOfWork(type === 'proposal' ? 'Full lifecycle architecture, design, and engineering delivery.' : '');
    setTimelineDays(30);
    setPaymentTerms(type === 'invoice' ? 'Net 15 Days from Invoice Date' : '50% Advance, 50% on Handover');
    setItems([
      {
        id: `item-${Date.now()}`,
        description: 'Solution Engineering & System Integration',
        quantity: 1,
        unitPrice: 100000,
        taxRate: 18,
        amount: 118000
      }
    ]);
    setDiscountPercent(0);
    setIsCreateModalOpen(true);
  };

  // Add Item
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 18,
        amount: 0
      }
    ]);
  };

  // Update Item
  const handleUpdateItem = (id: string, field: keyof SalesDocItem, value: any) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const updated = { ...it, [field]: value };
      const net = updated.quantity * updated.unitPrice;
      updated.amount = Math.round(net + (net * updated.taxRate / 100));
      return updated;
    }));
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      addToast({ title: 'At least one item required', message: 'You must have at least one line item in the document.', type: 'warning' });
      return;
    }
    setItems(prev => prev.filter(it => it.id !== id));
  };

  // Save Document
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !clientName.trim() || !docNumber.trim()) {
      addToast({ title: 'Compulsory Fields Required', message: 'Title, Document Number, and Client Name are required.', type: 'error' });
      return;
    }

    const newDoc: SalesDocument = {
      id: `doc-${Date.now()}`,
      docNumber: docNumber.trim(),
      type: docType,
      title: docTitle.trim(),
      status: docType === 'invoice' ? 'sent' : 'draft',
      clientName: clientName.trim(),
      clientCompany: clientCompany.trim() || clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim() || 'Corporate Headquarters',
      clientGst: clientGst.trim(),
      issueDate,
      validUntilOrDueDate: validUntil,
      currency,
      items,
      subtotal: calculatedSubtotal,
      discountPercentage: discountPercent,
      discountAmount: calculatedDiscount,
      taxAmount: Math.round(calculatedTax),
      grandTotal: calculatedGrandTotal,
      scopeOfWork: docType !== 'invoice' ? scopeOfWork : undefined,
      timelineDays: docType !== 'invoice' ? timelineDays : undefined,
      paymentTerms,
      notes,
      termsAndConditions: terms,
      bankDetails: {
        bankName: 'HDFC Bank',
        accountHolder: 'Star Chain Labs Private Limited',
        accountNumber: '50100234567890',
        ifscCode: 'HDFC0001234',
        branch: 'Indiranagar 100ft Rd, Bangalore',
        upiId: 'starchainlabs@okhdfcbank'
      },
      preparedById: currentUser.id,
      preparedByName: currentUser.name,
      preparedByEmail: currentUser.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveDocumentsToStorage([newDoc, ...documents]);
    setIsCreateModalOpen(false);
    setPreviewDoc(newDoc);
    addToast({
      title: `${docType.toUpperCase()} Generated!`,
      message: `${docNumber} created successfully. You can now download PDF or share with client.`,
      type: 'success'
    });
  };

  // Filtered List
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesTab = activeTab === 'all' || doc.type === activeTab;
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.clientCompany.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [documents, activeTab, searchQuery]);

  // Format Currency
  const formatCurrency = (amount: number, curr: string = 'INR') => {
    const symbol = curr === 'INR' ? '₹' : curr === 'USD' ? '$' : '€';
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  };

  // Client Share Handlers
  const handleShareWhatsApp = (doc: SalesDocument) => {
    const typeLabel = doc.type === 'proposal' ? 'Proposal' : doc.type === 'quotation' ? 'Quotation' : 'Invoice';
    const message = `Dear ${doc.clientName},\n\nPlease find the official Star Chain Labs ${typeLabel} (${doc.docNumber}) for ${doc.title}.\n\nTotal Amount: ${formatCurrency(doc.grandTotal, doc.currency)}\nValid / Due Date: ${doc.validUntilOrDueDate}\n\nPlease review and let us know your confirmation.\n\nRegards,\n${doc.preparedByName}\nStar Chain Labs\n+91 98765 00000`;
    const cleanPhone = doc.clientPhone.replace(/\D/g, '');
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleShareEmail = (doc: SalesDocument) => {
    const typeLabel = doc.type === 'proposal' ? 'Commercial Proposal' : doc.type === 'quotation' ? 'Price Quotation' : 'Tax Invoice';
    const subject = `Star Chain Labs — ${typeLabel} [${doc.docNumber}] for ${doc.clientCompany || doc.clientName}`;
    const body = `Dear ${doc.clientName},\n\nPlease find attached the official ${typeLabel} for ${doc.title}.\n\nDocument Number: ${doc.docNumber}\nTotal Investment: ${formatCurrency(doc.grandTotal, doc.currency)}\nPayment Terms: ${doc.paymentTerms}\n\nBank Transfer Details:\nBank: ${doc.bankDetails.bankName}\nA/C Name: ${doc.bankDetails.accountHolder}\nA/C No: ${doc.bankDetails.accountNumber}\nIFSC: ${doc.bankDetails.ifscCode}\n\nPlease let us know if you require any adjustments.\n\nWarm regards,\n${doc.preparedByName}\nStar Chain Labs`;
    const mailto = `mailto:${doc.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCopySummary = (doc: SalesDocument) => {
    const text = `${doc.docNumber} | ${doc.title}\nClient: ${doc.clientName} (${doc.clientCompany})\nGrand Total: ${formatCurrency(doc.grandTotal, doc.currency)}\nDue: ${doc.validUntilOrDueDate}`;
    navigator.clipboard.writeText(text);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({ title: 'Copied to Clipboard', message: 'Document summary copied.', type: 'info' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Title (Hidden during print) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              Sales Proposals, Quotations & Invoices
            </h1>
            <Badge variant="primary">{documents.length} Total</Badge>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Generate bespoke commercial proposals, quotation estimates, and tax invoices with instant PDF generation and client sharing via WhatsApp & Email.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileText className="w-3.5 h-3.5 text-sky-400" />}
            onClick={() => handleOpenCreate('proposal')}
          >
            + New Proposal
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => handleOpenCreate('quotation')}
          >
            + New Quotation
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => handleOpenCreate('invoice')}
            className="bg-turquoise text-slate-950 font-semibold hover:bg-turquoise/90"
          >
            + Generate Invoice
          </Button>
        </div>
      </div>

      {/* KPI Ribbon (Hidden during print) */}
      <div className="print:hidden grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-crm-textMuted tracking-wider block">
              Proposals Sent
            </span>
            <div className="text-xl font-bold text-sky-400 mt-0.5">
              {documents.filter(d => d.type === 'proposal').length}
            </div>
            <span className="text-[11px] text-crm-textSecondary mt-0.5 block">Enterprise Scopes & Pitches</span>
          </div>
          <div className="p-3 rounded-lg bg-sky-950/40 text-sky-400 border border-sky-800/40">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-crm-textMuted tracking-wider block">
              Active Quotations
            </span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {documents.filter(d => d.type === 'quotation').length}
            </div>
            <span className="text-[11px] text-crm-textSecondary mt-0.5 block">Priced Line-Item Estimates</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/40">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-crm-textMuted tracking-wider block">
              Generated Invoices
            </span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {documents.filter(d => d.type === 'invoice').length}
            </div>
            <span className="text-[11px] text-crm-textSecondary mt-0.5 block">Official Tax Billing</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-crm-surface border border-crm-border">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-turquoise text-slate-950 font-bold shadow-sm'
                : 'text-crm-textMuted hover:text-crm-text'
            }`}
          >
            All Documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('proposal')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'proposal'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-crm-textMuted hover:text-crm-text'
            }`}
          >
            Proposals ({documents.filter(d => d.type === 'proposal').length})
          </button>
          <button
            onClick={() => setActiveTab('quotation')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'quotation'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-crm-textMuted hover:text-crm-text'
            }`}
          >
            Quotations ({documents.filter(d => d.type === 'quotation').length})
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'invoice'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-crm-textMuted hover:text-crm-text'
            }`}
          >
            Invoices ({documents.filter(d => d.type === 'invoice').length})
          </button>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-crm-textMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by client, title, doc #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-crm-surface text-crm-text placeholder:text-crm-textDim rounded-lg border border-crm-border focus:border-turquoise focus:outline-none"
          />
        </div>
      </div>

      {/* Documents Grid / Table (Hidden during print) */}
      <div className="print:hidden space-y-3">
        {filteredDocs.length === 0 ? (
          <Card className="p-12 text-center text-crm-textMuted">
            <FileText className="w-10 h-10 mx-auto mb-2 text-crm-textDim opacity-50" />
            <p className="text-sm font-medium text-crm-text">No documents found</p>
            <p className="text-xs text-crm-textMuted mt-1">
              Create your first proposal, quote, or invoice by clicking the buttons above.
            </p>
          </Card>
        ) : (
          filteredDocs.map(doc => {
            const isProposal = doc.type === 'proposal';
            const isQuote = doc.type === 'quotation';
            const isInvoice = doc.type === 'invoice';

            return (
              <Card 
                key={doc.id}
                className="p-4 sm:p-5 hover:border-turquoise/40 transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Doc Type Badge, Title, Client */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isProposal ? 'bg-sky-950/60 text-sky-400 border border-sky-800/50' :
                        isQuote ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50' :
                        'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                      }`}>
                        {doc.type}
                      </span>
                      <span className="font-mono text-xs text-turquoise font-medium">
                        {doc.docNumber}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-crm-surface text-crm-textMuted border border-crm-border">
                        {doc.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-crm-text tracking-tight truncate">
                      {doc.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-crm-textSecondary font-mono">
                      <span className="text-crm-text font-medium flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-turquoise" />
                        {doc.clientCompany || doc.clientName}
                      </span>
                      <span>•</span>
                      <span>Rep: {doc.preparedByName}</span>
                      <span>•</span>
                      <span>Issued: {doc.issueDate}</span>
                      <span>•</span>
                      <span>Valid/Due: {doc.validUntilOrDueDate}</span>
                    </div>
                  </div>

                  {/* Right Column: Amount & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:text-right">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-crm-textMuted block">Grand Total</span>
                      <span className="text-base sm:text-lg font-bold font-mono text-crm-text">
                        {formatCurrency(doc.grandTotal, doc.currency)}
                      </span>
                      <span className="text-[10px] text-crm-textMuted block">
                        {doc.items.length} line {doc.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-crm-border">
                      {/* View Preview */}
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => setPreviewDoc(doc)}
                        leftIcon={<EyeIcon className="w-3.5 h-3.5 text-turquoise" />}
                      >
                        Preview
                      </Button>

                      {/* WhatsApp Share */}
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleShareWhatsApp(doc)}
                        leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-400" />}
                        title="Share on WhatsApp with Client"
                        className="hover:border-emerald-500/50 hover:bg-emerald-950/20"
                      >
                        WhatsApp
                      </Button>

                      {/* Email Share */}
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleShareEmail(doc)}
                        leftIcon={<Mail className="w-3.5 h-3.5 text-sky-400" />}
                        title="Share via Email"
                        className="hover:border-sky-500/50 hover:bg-sky-950/20"
                      >
                        Email
                      </Button>

                      {/* Copy Summary */}
                      <button
                        onClick={() => handleCopySummary(doc)}
                        title="Copy Summary"
                        className="p-1.5 rounded-md hover:bg-crm-surface text-crm-textMuted hover:text-crm-text transition-colors border border-crm-border"
                      >
                        {copiedId === doc.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* CREATE / GENERATE DOCUMENT MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Generate New ${docType.toUpperCase()}`}
        description="Build an official corporate proposal, quotation, or invoice with automatic tax and discount calculations."
        size="lg"
      >
        <form onSubmit={handleSaveDocument} className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
          {/* Document Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-crm-textSecondary uppercase tracking-wider mb-2">
              Select Document Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOpenCreate('proposal')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 ${
                  docType === 'proposal'
                    ? 'bg-sky-950/40 border-sky-500/60 text-sky-300 font-bold'
                    : 'bg-crm-surface border-crm-border text-crm-textMuted hover:text-crm-text'
                }`}
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Proposal</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCreate('quotation')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 ${
                  docType === 'quotation'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 font-bold'
                    : 'bg-crm-surface border-crm-border text-crm-textMuted hover:text-crm-text'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>Quotation</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCreate('invoice')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 ${
                  docType === 'invoice'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold'
                    : 'bg-crm-surface border-crm-border text-crm-textMuted hover:text-crm-text'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Tax Invoice</span>
              </button>
            </div>
          </div>

          {/* Client Details Section */}
          <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border space-y-3">
            <h4 className="text-xs font-bold text-turquoise uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Client / Customer Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Client Contact Person *"
                placeholder="e.g. Vikramaditya Roy"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
              <Input
                label="Company / Enterprise Name *"
                placeholder="e.g. Apex Financial Services"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                required
              />
              <Input
                type="email"
                label="Client Email ID *"
                placeholder="vikram.roy@apexfin.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
              />
              <Input
                type="tel"
                label="Client Mobile Number (for WhatsApp) *"
                placeholder="+91 98765 43210"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  label="Billing Address *"
                  placeholder="Street Address, City, State, PIN"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Document Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Document Title *"
              placeholder="e.g. Enterprise Cloud Deployment"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              required
            />
            <Input
              label="Document Number *"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              required
            />
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
            >
              <option value="INR">INR (₹ - Indian Rupee)</option>
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
            </Select>

            <Input
              type="date"
              label="Issue Date *"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            />
            <Input
              type="date"
              label={docType === 'invoice' ? "Payment Due Date *" : "Valid Until Date *"}
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              required
            />
            <Input
              label="Payment Terms *"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              required
            />
          </div>

          {/* Line Items Table Builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-crm-textSecondary uppercase tracking-wider">
                Line Items & Service Deliverables <span className="text-red-400">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAddItem}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="p-3 rounded-lg bg-crm-surface/70 border border-crm-border flex flex-col sm:flex-row gap-2.5 items-end">
                  <div className="flex-1 w-full space-y-1">
                    <span className="text-[10px] text-crm-textMuted uppercase font-mono block">Item {idx + 1} Description</span>
                    <input
                      type="text"
                      placeholder="e.g. Custom React Frontend Module"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      className="w-full h-8 px-2.5 text-xs bg-crm-card text-crm-text rounded border border-crm-border focus:border-turquoise focus:outline-none"
                      required
                    />
                  </div>

                  <div className="w-20 space-y-1">
                    <span className="text-[10px] text-crm-textMuted uppercase font-mono block">Qty</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full h-8 px-2 text-xs bg-crm-card text-crm-text rounded border border-crm-border focus:border-turquoise focus:outline-none"
                    />
                  </div>

                  <div className="w-32 space-y-1">
                    <span className="text-[10px] text-crm-textMuted uppercase font-mono block">Unit Rate</span>
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                      className="w-full h-8 px-2 text-xs bg-crm-card text-crm-text rounded border border-crm-border focus:border-turquoise focus:outline-none"
                    />
                  </div>

                  <div className="w-24 space-y-1">
                    <span className="text-[10px] text-crm-textMuted uppercase font-mono block">GST Tax %</span>
                    <select
                      value={item.taxRate}
                      onChange={(e) => handleUpdateItem(item.id, 'taxRate', Number(e.target.value))}
                      className="w-full h-8 px-1.5 text-xs bg-crm-card text-crm-text rounded border border-crm-border focus:border-turquoise focus:outline-none"
                    >
                      <option value="0">0% (Nil)</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18% (Standard)</option>
                      <option value="28">28%</option>
                    </select>
                  </div>

                  <div className="w-28 text-right space-y-1">
                    <span className="text-[10px] text-crm-textMuted uppercase font-mono block">Line Total</span>
                    <span className="h-8 flex items-center justify-end font-mono text-xs font-bold text-turquoise">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Summary Cards */}
          <div className="p-3.5 rounded-lg bg-crm-surface border border-crm-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-crm-textSecondary">Subtotal:</span>
              <span className="font-mono font-medium text-crm-text">{formatCurrency(calculatedSubtotal, currency)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-crm-textSecondary">Discount (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-16 h-6 px-1.5 text-xs bg-crm-card text-crm-text rounded border border-crm-border text-center"
                />
              </div>
              <span className="font-mono text-emerald-400">-{formatCurrency(calculatedDiscount, currency)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-crm-textSecondary">Tax (GST):</span>
              <span className="font-mono text-crm-text">{formatCurrency(Math.round(calculatedTax), currency)}</span>
            </div>

            <div className="pt-2 border-t border-crm-border flex items-center justify-between text-sm font-bold">
              <span className="text-crm-text">Grand Total:</span>
              <span className="font-mono text-turquoise text-base">{formatCurrency(calculatedGrandTotal, currency)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-crm-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-turquoise text-slate-950 font-bold hover:bg-turquoise/90"
            >
              Save & Generate Document
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* A4 DOCUMENT PREVIEW & PDF PRINT MODAL */}
      {/* ========================================================================= */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Corporate Document Preview: ${previewDoc.docNumber}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Top Toolbar: Print PDF, WhatsApp, Email (Hidden during print) */}
            <div className="print:hidden p-3 rounded-lg bg-crm-surface/80 border border-crm-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-turquoise">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>Ready to download as PDF or send directly to client.</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={handlePrintPdf}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                  className="bg-turquoise text-slate-950 font-semibold"
                >
                  Download / Print PDF
                </Button>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleShareWhatsApp(previewDoc)}
                  leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-400" />}
                >
                  Send via WhatsApp
                </Button>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleShareEmail(previewDoc)}
                  leftIcon={<Mail className="w-3.5 h-3.5 text-sky-400" />}
                >
                  Send Email
                </Button>
              </div>
            </div>

            {/* A4 Clean Paper Template for Screen & Print */}
            <div className="p-8 rounded-xl bg-white text-slate-900 shadow-xl border border-slate-300 font-sans space-y-6 print:p-0 print:border-0 print:shadow-none">
              {/* Header Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                      SCL
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">
                      STAR CHAIN LABS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-sm leading-tight">
                    Star Chain Labs Private Limited • CIN: U72900KA2026PTC123456<br />
                    Tower 4, Embassy Tech Village, Outer Ring Road, Bangalore 560103<br />
                    GSTIN: 29AABCS1234F1Z8 • ops@starchainlabs.com
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider mb-1">
                    {previewDoc.type.toUpperCase()}
                  </span>
                  <div className="font-mono text-sm font-bold text-slate-900">
                    {previewDoc.docNumber}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-mono">
                    Date: {previewDoc.issueDate}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    {previewDoc.type === 'invoice' ? 'Due Date:' : 'Valid Until:'} {previewDoc.validUntilOrDueDate}
                  </div>
                </div>
              </div>

              {/* Client & Title Card */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Prepared For / Billed To:
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{previewDoc.clientName}</div>
                  <div className="font-semibold text-slate-700">{previewDoc.clientCompany}</div>
                  <div className="text-slate-600 mt-0.5 leading-relaxed">{previewDoc.clientAddress}</div>
                  <div className="text-slate-600 font-mono mt-1">
                    Email: {previewDoc.clientEmail} • Phone: {previewDoc.clientPhone}
                  </div>
                  {previewDoc.clientGst && (
                    <div className="text-slate-600 font-mono">GSTIN: {previewDoc.clientGst}</div>
                  )}
                </div>

                <div className="text-right">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Project / Engagement:
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{previewDoc.title}</div>
                  <div className="text-slate-600 mt-1 font-mono">
                    Account Rep: {previewDoc.preparedByName}
                  </div>
                  <div className="text-slate-600 font-mono">
                    Payment Terms: {previewDoc.paymentTerms}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-y border-slate-300">
                      <th className="py-2 px-3 text-left font-bold">#</th>
                      <th className="py-2 px-3 text-left font-bold">Description</th>
                      <th className="py-2 px-3 text-center font-bold">Qty</th>
                      <th className="py-2 px-3 text-right font-bold">Rate</th>
                      <th className="py-2 px-3 text-right font-bold">Tax</th>
                      <th className="py-2 px-3 text-right font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewDoc.items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-200">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.unitPrice, previewDoc.currency)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{item.taxRate}%</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.amount, previewDoc.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary & Bank Coordinates */}
              <div className="grid grid-cols-2 gap-6 text-xs pt-2">
                {/* Bank Account */}
                <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide">
                    Bank Transfer Details:
                  </span>
                  <div className="font-mono text-slate-700">Bank: {previewDoc.bankDetails.bankName}</div>
                  <div className="font-mono text-slate-700">Beneficiary: {previewDoc.bankDetails.accountHolder}</div>
                  <div className="font-mono font-bold text-slate-900">A/C: {previewDoc.bankDetails.accountNumber}</div>
                  <div className="font-mono font-bold text-slate-900">IFSC: {previewDoc.bankDetails.ifscCode}</div>
                  <div className="font-mono text-slate-700">Branch: {previewDoc.bankDetails.branch}</div>
                </div>

                {/* Grand Total Breakdown */}
                <div className="space-y-1.5 text-right font-mono text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(previewDoc.subtotal, previewDoc.currency)}</span>
                  </div>
                  {previewDoc.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount ({previewDoc.discountPercentage}%):</span>
                      <span>-{formatCurrency(previewDoc.discountAmount, previewDoc.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Taxes (GST):</span>
                    <span>{formatCurrency(previewDoc.taxAmount, previewDoc.currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-900 pt-1.5">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(previewDoc.grandTotal, previewDoc.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Signatory Footer */}
              <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-6 text-[10px] text-slate-500">
                <div>
                  <span className="font-bold text-slate-700 uppercase block mb-1">Terms & Conditions:</span>
                  <p className="whitespace-pre-line leading-relaxed">{previewDoc.termsAndConditions}</p>
                </div>

                <div className="text-right flex flex-col justify-between items-end">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 uppercase block">For Star Chain Labs Pvt. Ltd.</span>
                    <div className="h-10 border-b border-slate-400 w-36" />
                    <span className="font-mono text-[9px] block">Authorized Signatory</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-crm-border">
              <Button variant="secondary" size="sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

function EyeIcon(props: any) {
  return (
    <svg 
      {...props} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
