import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { WidgetContainer } from '../components/WidgetContainer';
import { Badge } from '../../../components/ui/Badge';
import { Receipt, IndianRupee, ChevronRight, Clock, AlertTriangle } from 'lucide-react';

export const InvoiceStatusWidget: React.FC = () => {
  const { invoices, payments, financeMetrics, navigateTo } = useCRM();

  const statuses = [
    { status: 'draft', label: 'Draft', count: invoices.filter(i => i.status === 'draft').length, color: 'text-crm-textMuted' },
    { status: 'sent', label: 'Sent', count: invoices.filter(i => i.status === 'sent').length, color: 'text-blue-400' },
    { status: 'partially_paid', label: 'Partially Paid', count: invoices.filter(i => i.status === 'partially_paid').length, color: 'text-amber-400' },
    { status: 'paid', label: 'Paid', count: invoices.filter(i => i.status === 'paid').length, color: 'text-emerald-400' },
    { status: 'overdue', label: 'Overdue', count: financeMetrics.overdueInvoicesCount, color: 'text-red-400' }
  ];

  const recentPayments = payments.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Invoices Status Grid */}
      <WidgetContainer
        title="Invoice Lifecycle Overview"
        subtitle={`Total Active Billing: ₹${financeMetrics.totalRevenue.toLocaleString('en-IN')}`}
        badge={`${invoices.length} Invoices`}
        action={
          <button
            onClick={() => navigateTo('/app/finance/invoices')}
            className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
          >
            All Invoices <ChevronRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {statuses.map(s => (
            <div
              key={s.status}
              onClick={() => navigateTo('/app/finance/invoices')}
              className="p-3 bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/60 hover:border-crm-borderHover rounded cursor-pointer transition-colors text-center"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-crm-textMuted mb-1 truncate">
                {s.label}
              </p>
              <p className={`text-base font-mono font-bold ${s.color}`}>
                {s.count}
              </p>
            </div>
          ))}
        </div>
      </WidgetContainer>

      {/* Recent Inward Payments */}
      <WidgetContainer
        title="Recent Inward Payment Settlements"
        subtitle="Latest verified transaction inflows"
        action={
          <button
            onClick={() => navigateTo('/app/finance/payments')}
            className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
          >
            All Payments <ChevronRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="space-y-2">
          {recentPayments.map(p => (
            <div
              key={p.id}
              className="p-2.5 bg-crm-surface border border-crm-border/50 rounded flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <IndianRupee className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-crm-text truncate">{p.clientName}</p>
                  <p className="text-[10px] text-crm-textMuted truncate">
                    Inv: {p.invoiceNumber} · Method: {p.method.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 font-mono">
                <span className="font-bold text-emerald-400">+₹{p.amount.toLocaleString('en-IN')}</span>
                <p className="text-[10px] text-crm-textMuted">{p.date}</p>
              </div>
            </div>
          ))}
        </div>
      </WidgetContainer>
    </div>
  );
};
