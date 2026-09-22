import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { MetricCardWidget, MetricItem } from '../widgets/MetricCardWidget';
import { InvoiceStatusWidget } from '../widgets/InvoiceStatusWidget';
import { PersonalAttendanceWidget } from '../widgets/PersonalAttendanceWidget';
import { WidgetContainer } from '../components/WidgetContainer';
import { WidgetId } from '../types';
import { 
  DollarSign, 
  Receipt, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  CreditCard,
  ChevronRight,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

interface FinanceDashboardProps {
  enabledWidgets: WidgetId[];
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ enabledWidgets }) => {
  const { financeMetrics, expenses, invoices, navigateTo } = useCRM();

  const isEnabled = (id: WidgetId) => enabledWidgets.includes(id);

  // 6 Primary Finance Metrics (Section 9)
  const financeMetricsList: MetricItem[] = [
    { id: 'fin-rev', label: 'Gross Revenue', value: `$${(financeMetrics.totalRevenue / 1000).toFixed(0)}k`, change: '+14%', isPositive: true, icon: DollarSign, onClick: () => navigateTo('/app/finance') },
    { id: 'fin-coll', label: 'Collected Cash', value: `$${(financeMetrics.totalCollected / 1000).toFixed(0)}k`, context: 'Inward settled', icon: CreditCard, onClick: () => navigateTo('/app/finance/payments') },
    { id: 'fin-out', label: 'Outstanding Receivables', value: `$${(financeMetrics.totalPending / 1000).toFixed(0)}k`, context: 'Active invoices', icon: Receipt, onClick: () => navigateTo('/app/finance/invoices') },
    { id: 'fin-overdue', label: 'Overdue Recovery', value: `$${(financeMetrics.totalOverdue / 1000).toFixed(0)}k`, context: `${financeMetrics.overdueInvoicesCount} overdue invoices`, isPositive: financeMetrics.overdueInvoicesCount === 0, icon: AlertTriangle, onClick: () => navigateTo('/app/finance/overdue') },
    { id: 'fin-exp', label: 'Total Expenses', value: `$${(financeMetrics.totalExpenses / 1000).toFixed(0)}k`, context: 'Approved claims', icon: Clock, onClick: () => navigateTo('/app/finance/expenses') },
    { id: 'fin-net', label: 'Net Profit', value: `$${(financeMetrics.netRevenue / 1000).toFixed(0)}k`, change: `${financeMetrics.totalRevenue > 0 ? Math.round((financeMetrics.netRevenue / financeMetrics.totalRevenue) * 100) : 74}% margin`, isPositive: true, icon: TrendingUp, onClick: () => navigateTo('/app/finance/reports') }
  ];

  // Expenses breakdown
  const submittedExp = expenses.filter(e => e.status === 'submitted').length;
  const approvedExp = expenses.filter(e => e.status === 'approved').length;
  const reimbursedExp = expenses.filter(e => e.status === 'paid').length;

  return (
    <div className="space-y-6">
      {/* Attendance Clock & Shift Timer */}
      {isEnabled('personal_attendance') && (
        <PersonalAttendanceWidget />
      )}

      {/* 6 Primary Finance Metrics */}
      <MetricCardWidget metrics={financeMetricsList} columns={6} />

      {/* Finance Action Center */}
      {isEnabled('finance_action_center') && (
        <WidgetContainer
          title="Finance Action Center — Treasury Triage"
          subtitle="Immediate financial follow-ups and cashflow bottlenecks"
          badge="High Priority"
          badgeType="warning"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div 
              onClick={() => navigateTo('/app/finance/overdue')}
              className="p-3 bg-red-500/5 border border-red-500/20 hover:border-red-500/40 rounded cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-red-400">Overdue Invoices ({financeMetrics.overdueInvoicesCount})</span>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              </div>
              <p className="text-[11px] text-crm-textMuted">
                ${financeMetrics.totalOverdue.toLocaleString()} pending recovery. Issue payment dunning letters.
              </p>
            </div>

            <div 
              onClick={() => navigateTo('/app/finance/expenses')}
              className="p-3 bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 rounded cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-400">Pending Expense Claims ({submittedExp})</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[11px] text-crm-textMuted">
                Departmental receipts awaiting finance controller review and reimbursement approval.
              </p>
            </div>

            <div 
              onClick={() => navigateTo('/app/finance/invoices')}
              className="p-3 bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 rounded cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-400">Draft Invoices Pending Dispatch</span>
                <Receipt className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-[11px] text-crm-textMuted">
                2 client invoices drafted for milestone sign-offs awaiting dispatch.
              </p>
            </div>
          </div>
        </WidgetContainer>
      )}

      {/* Invoices Status & Payment Settlements */}
      {isEnabled('invoice_overview') && (
        <InvoiceStatusWidget />
      )}

      {/* Expense Management Overview */}
      {isEnabled('expense_overview') && (
        <WidgetContainer
          title="Department Expense Claims Overview"
          subtitle="Submitted reimbursement requests and monthly category spend"
          action={
            <button
              onClick={() => navigateTo('/app/finance/expenses')}
              className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
            >
              Expenses Desk <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-crm-surface border border-crm-border/60 rounded">
              <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Submitted</span>
              <p className="text-base font-bold font-mono text-amber-400 mt-1">{submittedExp}</p>
              <p className="text-[10px] text-crm-textMuted">Awaiting Approval</p>
            </div>
            <div className="p-3 bg-crm-surface border border-crm-border/60 rounded">
              <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Approved</span>
              <p className="text-base font-bold font-mono text-turquoise mt-1">{approvedExp}</p>
              <p className="text-[10px] text-crm-textMuted">Queued for Payout</p>
            </div>
            <div className="p-3 bg-crm-surface border border-crm-border/60 rounded">
              <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Reimbursed</span>
              <p className="text-base font-bold font-mono text-emerald-400 mt-1">{reimbursedExp}</p>
              <p className="text-[10px] text-crm-textMuted">Settled</p>
            </div>
            <div className="p-3 bg-crm-surface border border-crm-border/60 rounded">
              <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Total Approved</span>
              <p className="text-base font-bold font-mono text-crm-text mt-1">${(financeMetrics.totalExpenses / 1000).toFixed(0)}k</p>
              <p className="text-[10px] text-crm-textMuted">MTD Budget</p>
            </div>
          </div>
        </WidgetContainer>
      )}
    </div>
  );
};
