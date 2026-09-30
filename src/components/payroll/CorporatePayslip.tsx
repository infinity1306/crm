import React from 'react';
import { PayrollRecord } from '../../types/payroll';
import { 
  formatINRWithDecimals, 
  formatIndianDate, 
  convertNumberToWordsIndian 
} from '../../services/payrollService';
import { Printer, Download, Copy, X, Check, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

interface CorporatePayslipProps {
  record: PayrollRecord;
  onClose?: () => void;
  showActions?: boolean;
}

export const CorporatePayslip: React.FC<CorporatePayslipProps> = ({
  record,
  onClose,
  showActions = true
}) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `📄 *Star Chain Labs — Payslip (${record.month})*\nEmployee: ${record.employeeName} (${record.employeeId})\nGross Earnings: ${formatINRWithDecimals(record.totalEarnings || record.grossSalary)}\nTotal Deductions: ${formatINRWithDecimals(record.totalDeductions)}\nNet Salary: ${formatINRWithDecimals(record.netSalary)}\nPaid Days: ${record.paidDays} | LOP Days: ${record.lopDays}\nStatus: ${record.status.toUpperCase()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine deductions list
  const nonPayableAmount = record.nonPayable ?? record.otherDeductions ?? 0;
  const earningsList = [
    { label: 'Basic', amount: record.basicSalary },
    { label: 'House Rent Allowance', amount: record.hra },
    { label: 'Conveyance Allowance', amount: record.conveyanceAllowance ?? 1500 },
    { label: 'Special Allowance', amount: record.specialAllowance ?? 1000 },
    ...(record.performanceBonus && record.performanceBonus > 0 ? [{ label: 'Performance Bonus', amount: record.performanceBonus }] : [])
  ];

  const deductionsList = [
    { label: 'Income Tax', amount: record.tds ?? 0 },
    { label: 'Provident Fund', amount: record.providentFund ?? 0 },
    { label: 'Non - payable', amount: nonPayableAmount },
    ...(record.professionalTax && record.professionalTax > 0 ? [{ label: 'Professional Tax', amount: record.professionalTax }] : [])
  ];

  const grossEarnings = record.totalEarnings || record.grossSalary || (earningsList.reduce((acc, curr) => acc + curr.amount, 0));
  const totalDeductions = record.totalDeductions || (deductionsList.reduce((acc, curr) => acc + curr.amount, 0));
  const netPayable = record.netSalary || Math.max(0, grossEarnings - totalDeductions);

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar (Hidden in Print) */}
      {showActions && (
        <div className="flex items-center justify-between pb-3 border-b border-crm-border print-hide">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-crm-text">Corporate Employee Payslip</h2>
              <p className="text-xs text-crm-textMuted">
                {record.employeeName} ({record.employeeId}) • {record.month}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              className="text-xs h-8"
            >
              {copied ? 'Copied' : 'Copy Summary'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Print / Save PDF
            </Button>

            {onClose && (
              <button
                onClick={onClose}
                className="text-crm-textMuted hover:text-crm-text p-1.5 rounded-lg ml-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          AUTHENTIC WHITE ZOHO PAYROLL STYLE CORPORATE PAYSLIP DOCUMENT
          Designed for 1:1 match with user specification and high-res A4 printing
          ========================================================================= */}
      <div 
        id="payslip-print-sheet" 
        className="bg-white text-gray-800 font-sans p-8 sm:p-10 rounded-xl shadow-lg border border-gray-200 max-w-2xl mx-auto selection:bg-emerald-100"
      >
        {/* Document Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          {/* Company Brand & Address */}
          <div className="flex items-start gap-3">
            {/* Star Logo */}
            <div className="flex-shrink-0 pt-0.5">
              <div className="flex items-center gap-1">
                <svg className="w-7 h-7 text-indigo-700" viewBox="0 0 32 32" fill="none">
                  {/* Stylized Star Logo Mark */}
                  <path 
                    d="M16 2L18.8 11.2L28 14L18.8 16.8L16 26L13.2 16.8L4 14L13.2 11.2L16 2Z" 
                    fill="currentColor" 
                  />
                  <circle cx="16" cy="14" r="3" fill="#38bdf8" />
                </svg>
                <span className="text-indigo-800 font-extrabold text-sm tracking-tight font-sans lowercase">star</span>
              </div>
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 uppercase">
                STAR CHAIN LABS
              </h1>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                Second Floor, Aakriti Business Centre , Bawadiya Kalan, Salaiya,
              </p>
              <p className="text-[11px] text-gray-500 leading-tight">
                Bhopal, 462039 India
              </p>
            </div>
          </div>

          {/* Month Indicator */}
          <div className="text-right flex-shrink-0">
            <div className="text-[11px] text-gray-400 font-medium">Payslip For the Month</div>
            <div className="text-sm sm:text-base font-bold text-gray-900 mt-0.5">
              {record.month}
            </div>
          </div>
        </div>

        {/* Employee Summary & Net Pay Box */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
          {/* Left: Employee Summary Data Grid */}
          <div className="sm:col-span-7 space-y-2">
            <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              EMPLOYEE SUMMARY
            </div>

            <div className="space-y-1.5 text-xs text-gray-800">
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-gray-600">Employee Name</span>
                <span className="col-span-1 text-gray-400">:</span>
                <span className="col-span-6 font-semibold text-gray-900">{record.employeeName}</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-gray-600">Employee ID</span>
                <span className="col-span-1 text-gray-400">:</span>
                <span className="col-span-6 font-medium text-gray-900">{record.employeeId}</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-gray-600">Pay Period</span>
                <span className="col-span-1 text-gray-400">:</span>
                <span className="col-span-6 font-medium text-gray-900">{record.month}</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-gray-600">Pay Date</span>
                <span className="col-span-1 text-gray-400">:</span>
                <span className="col-span-6 font-medium text-gray-900">
                  {formatIndianDate(record.payDate || record.paymentDate || '2026-09-01')}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Net Pay and Attendance Card */}
          <div className="sm:col-span-5">
            <div className="border border-emerald-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
              {/* Upper Section: Light Mint Green Header */}
              <div className="bg-[#EAF8EF] px-4 py-3 border-b border-emerald-100">
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                  {formatINRWithDecimals(netPayable)}
                </div>
                <div className="text-[11px] font-medium text-emerald-800/80 mt-0.5">
                  Total Net Pay
                </div>
              </div>

              {/* Lower Section: Paid & LOP Days */}
              <div className="bg-white px-4 py-2.5 space-y-1 text-xs text-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Paid Days</span>
                  <span className="font-medium text-gray-900">: {record.paidDays}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">LOP Days</span>
                  <span className="font-medium text-gray-900">: {record.lopDays}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dotted Divider Line */}
        <div className="border-b border-dotted border-gray-300 my-4" />

        {/* Joining Date Line */}
        <div className="text-xs text-gray-700 mb-4">
          <span className="text-gray-600">Joining date</span>
          <span className="ml-8 font-medium text-gray-900">
            : {formatIndianDate(record.joiningDate || '2026-08-13')}
          </span>
        </div>

        {/* Earnings & Deductions Dual Column Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-2 bg-gray-50/80 border-b border-dotted border-gray-300 text-[11px] font-bold text-gray-900 uppercase">
            <div className="flex justify-between px-3.5 py-2 border-r border-gray-200">
              <span>EARNINGS</span>
              <span className="text-right">AMOUNT</span>
            </div>
            <div className="flex justify-between px-3.5 py-2">
              <span>DEDUCTIONS</span>
              <span className="text-right">AMOUNT</span>
            </div>
          </div>

          {/* Table Body */}
          <div className="grid grid-cols-2 divide-x divide-gray-200 text-xs">
            {/* Left Column: Earnings Rows */}
            <div className="p-3.5 space-y-2">
              {earningsList.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    {formatINRWithDecimals(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Right Column: Deductions Rows */}
            <div className="p-3.5 space-y-2">
              {deductionsList.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    {formatINRWithDecimals(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary Row */}
          <div className="grid grid-cols-2 border-t border-gray-200 bg-gray-50/50 text-xs font-bold text-gray-900">
            <div className="flex justify-between px-3.5 py-2.5 border-r border-gray-200">
              <span>Gross Earnings</span>
              <span className="tabular-nums">{formatINRWithDecimals(grossEarnings)}</span>
            </div>
            <div className="flex justify-between px-3.5 py-2.5">
              <span>Total Deductions</span>
              <span className="tabular-nums">{formatINRWithDecimals(totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* Highlighted Banner: TOTAL NET PAYABLE */}
        <div className="mt-4 bg-[#F4FBF7] border border-[#D2F0DF] rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-gray-900">
              TOTAL NET PAYABLE
            </div>
            <div className="text-[10px] text-gray-500 font-normal mt-0.5">
              Gross Earnings - Total Deductions
            </div>
          </div>

          <div className="text-base sm:text-lg font-bold text-gray-900 tabular-nums">
            {formatINRWithDecimals(netPayable)}
          </div>
        </div>

        {/* Amount in Words */}
        <div className="text-right text-[11px] text-gray-600 mt-2 font-sans">
          <span>Amount in Words : </span>
          <span className="font-semibold text-gray-900">
            {convertNumberToWordsIndian(netPayable)}
          </span>
        </div>

        {/* System Generated Document Note */}
        <div className="text-center text-[10px] text-gray-400 mt-8 mb-4 tracking-wider">
          -- This is a system-generated document. --
        </div>
      </div>
    </div>
  );
};
