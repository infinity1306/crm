import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Building2,
  Receipt,
  Percent,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowDownLeft,
  FileText
} from 'lucide-react';

export const FinancialReports: React.FC = () => {
  const { invoices, payments, expenses, companies, financeConfig } = useCRM();

  const [activeReportTab, setActiveReportTab] = useState<'monthly' | 'client_ledger' | 'gst_register'>('monthly');

  // Month-by-month aggregation
  const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
  const monthlyData = months.map(m => {
    const monthInvoices = invoices.filter(i => i.issueDate.startsWith(m) && i.status !== 'cancelled');
    const monthPayments = payments.filter(p => p.date.startsWith(m) && p.status === 'successful');
    const monthExpenses = expenses.filter(e => e.date.startsWith(m) && (e.status === 'paid' || e.status === 'approved'));

    const billed = monthInvoices.reduce((a, b) => a + b.total, 0);
    const taxBilled = monthInvoices.reduce((a, b) => a + b.taxAmount, 0);
    const collected = monthPayments.reduce((a, b) => a + b.amount, 0);
    const exp = monthExpenses.reduce((a, b) => a + b.amount, 0);
    const netCashFlow = collected - exp;

    return {
      month: m,
      monthLabel: new Date(`${m}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      invoicesCount: monthInvoices.length,
      billed,
      taxBilled,
      collected,
      expenses: exp,
      netCashFlow
    };
  });

  // Client Billing Ledger aggregation
  const clientLedger = companies.map(company => {
    const compInvoices = invoices.filter(i => i.clientId === company.id && i.status !== 'cancelled');
    const totalBilled = compInvoices.reduce((a, b) => a + b.total, 0);
    const totalCollected = compInvoices.reduce((a, b) => a + b.paidAmount, 0);
    const balanceDue = compInvoices.reduce((a, b) => a + b.outstandingAmount, 0);

    return {
      clientId: company.id,
      clientName: company.name,
      invoicesCount: compInvoices.length,
      totalBilled,
      totalCollected,
      balanceDue,
      gstNumber: compInvoices[0]?.clientGstNumber || 'Unregistered'
    };
  }).filter(c => c.totalBilled > 0);

  // GST Register
  const validInvoices = invoices.filter(i => i.status !== 'cancelled');
  const totalGstBilled = validInvoices.reduce((a, b) => a + b.taxAmount, 0);
  const totalTaxableValue = validInvoices.reduce((a, b) => a + b.subtotal - b.discountAmount, 0);

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = '';

    if (activeReportTab === 'monthly') {
      headers = ['Period', 'Invoices Issued', 'Total Billed (INR)', 'GST Billed (INR)', 'Receipts Collected (INR)', 'Expenses (INR)', 'Net Cash Flow (INR)'];
      rows = monthlyData.map(d => [
        d.monthLabel,
        d.invoicesCount,
        d.billed,
        d.taxBilled,
        d.collected,
        d.expenses,
        d.netCashFlow
      ]);
      filename = `SCL_Monthly_Statement_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (activeReportTab === 'client_ledger') {
      headers = ['Client Name', 'Invoices Count', 'GSTIN', 'Total Billed (INR)', 'Total Collected (INR)', 'Outstanding Due (INR)'];
      rows = clientLedger.map(c => [
        `"${c.clientName}"`,
        c.invoicesCount,
        c.gstNumber,
        c.totalBilled,
        c.totalCollected,
        c.balanceDue
      ]);
      filename = `SCL_Client_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = ['Invoice Number', 'Issue Date', 'Client Name', 'Taxable Value (INR)', 'GST Rate', 'CGST 9% (INR)', 'SGST 9% (INR)', 'Total GST (INR)', 'Grand Total (INR)'];
      rows = validInvoices.map(inv => [
        inv.invoiceNumber,
        inv.issueDate,
        `"${inv.clientName}"`,
        inv.subtotal - inv.discountAmount,
        `${inv.taxRate}%`,
        Math.round(inv.taxAmount / 2),
        Math.round(inv.taxAmount / 2),
        inv.taxAmount,
        inv.total
      ]);
      filename = `SCL_GST_Register_GSTR1_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Financial Audit & Tax</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Statements & Reports</h1>
          <p className="text-sm text-slate-400">
            Export-ready commercial books, monthly revenue-collection trajectories, and statutory tax registers.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Statement (.CSV)
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl p-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveReportTab('monthly')}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
            activeReportTab === 'monthly'
              ? 'bg-slate-800 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Monthly Revenue & Cash Flow
        </button>

        <button
          onClick={() => setActiveReportTab('client_ledger')}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
            activeReportTab === 'client_ledger'
              ? 'bg-slate-800 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Client Billing Ledger
        </button>

        <button
          onClick={() => setActiveReportTab('gst_register')}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
            activeReportTab === 'gst_register'
              ? 'bg-slate-800 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          Tax & GST Register (SAC 998314)
        </button>
      </div>

      {/* Report 1: Monthly Statement */}
      {activeReportTab === 'monthly' && (
        <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">FY 2026-27 Monthly Cash Inflow vs Disbursement</h3>
              <p className="text-xs text-slate-400 mt-0.5">Accrual-based billing versus direct wire receipts</p>
            </div>
            <span className="text-xs font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded">
              Currency: INR (₹)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D10] border-b border-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Period</th>
                  <th className="py-3 px-4 font-semibold text-center">Invoices</th>
                  <th className="py-3 px-4 font-semibold text-right">Billed Amount</th>
                  <th className="py-3 px-4 font-semibold text-right">GST Billed</th>
                  <th className="py-3 px-4 font-semibold text-right">Collections Received</th>
                  <th className="py-3 px-4 font-semibold text-right">Operational Expenses</th>
                  <th className="py-3 px-4 font-semibold text-right">Net Operational Cash Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {monthlyData.map(d => (
                  <tr key={d.month} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-white">{d.monthLabel}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{d.invoicesCount}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">₹{d.billed.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">₹{d.taxBilled.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">₹{d.collected.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">₹{d.expenses.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-teal-400">
                      ₹{d.netCashFlow.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Client Ledger */}
      {activeReportTab === 'client_ledger' && (
        <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Client Cumulative Account Statements</h3>
              <p className="text-xs text-slate-400 mt-0.5">Summary of commercial invoices, settlement ratio, and outstanding balances</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{clientLedger.length} active client accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D10] border-b border-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Client Company</th>
                  <th className="py-3 px-4 font-semibold">GSTIN</th>
                  <th className="py-3 px-4 font-semibold text-center">Invoices</th>
                  <th className="py-3 px-4 font-semibold text-right">Cumulative Billed</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Settled</th>
                  <th className="py-3 px-4 font-semibold text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {clientLedger.map(c => (
                  <tr key={c.clientId} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      {c.clientName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.gstNumber}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{c.invoicesCount}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200 font-medium">₹{c.totalBilled.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">₹{c.totalCollected.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-mono font-bold ${c.balanceDue > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        ₹{c.balanceDue.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Tax & GST Register */}
      {activeReportTab === 'gst_register' && (
        <div className="space-y-6">
          {/* Statutory Tax Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#0D1216] border border-slate-800/80 rounded-xl">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Total Taxable Value</span>
              <span className="text-xl font-bold font-mono text-white">₹{totalTaxableValue.toLocaleString('en-IN')}</span>
              <p className="text-[11px] text-slate-500 mt-1">Pre-tax IT/Web3 services billed</p>
            </div>

            <div className="p-4 bg-[#0D1216] border border-slate-800/80 rounded-xl">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Total GST Billed (18%)</span>
              <span className="text-xl font-bold font-mono text-teal-400">₹{totalGstBilled.toLocaleString('en-IN')}</span>
              <p className="text-[11px] text-slate-500 mt-1">Output tax liability for GSTR-1</p>
            </div>

            <div className="p-4 bg-[#0D1216] border border-slate-800/80 rounded-xl">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Company GSTIN</span>
              <span className="text-sm font-bold font-mono text-slate-200">{financeConfig.companyGstNumber}</span>
              <p className="text-[11px] text-slate-500 mt-1">PAN: {financeConfig.companyPan} (Karnataka State)</p>
            </div>
          </div>

          <div className="bg-[#0D1216] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Tax Register (GSTR-1 Outward Supplies)</h3>
                <p className="text-xs text-slate-400 mt-0.5">SAC Code 998314: Information Technology Software Development & Consulting Services</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090D10] border-b border-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Invoice #</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Client</th>
                    <th className="py-3 px-4 font-semibold text-right">Taxable Val</th>
                    <th className="py-3 px-4 font-semibold text-center">GST %</th>
                    <th className="py-3 px-4 font-semibold text-right">CGST (9%)</th>
                    <th className="py-3 px-4 font-semibold text-right">SGST (9%)</th>
                    <th className="py-3 px-4 font-semibold text-right">Total GST</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {validInvoices.map(inv => {
                    const taxable = inv.subtotal - inv.discountAmount;
                    const halfGst = Math.round(inv.taxAmount / 2);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-mono font-medium text-white">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{inv.issueDate}</td>
                        <td className="py-3 px-4 text-slate-300 font-medium">{inv.clientName}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">₹{taxable.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-400">{inv.taxRate}%</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">₹{halfGst.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">₹{halfGst.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right font-mono text-teal-400 font-semibold">₹{inv.taxAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right font-mono text-white font-bold">₹{inv.total.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;
