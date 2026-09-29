import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CreateInvoiceModal } from './invoices/CreateInvoiceModal';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Receipt, 
  ArrowUpRight, 
  ArrowRight,
  Plus, 
  FileText, 
  CreditCard, 
  Calendar,
  Building2,
  FolderKanban,
  CheckCircle2,
  PieChart,
  BarChart3,
  ExternalLink
} from 'lucide-react';

type TimeFilter = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

export const FinanceOverview: React.FC = () => {
  const { 
    invoices, 
    payments, 
    expenses, 
    companies, 
    projects, 
    activityEvents, 
    financeMetrics, 
    navigateTo 
  } = useCRM();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  // Filtered metrics based on time filter
  const filteredMetrics = useMemo(() => {
    // For 'all' or 'month' (September 2026 is current), use base metrics
    // Multipliers or date filtering can adjust if specific dates match
    return financeMetrics;
  }, [financeMetrics, timeFilter]);

  // Overdue invoices list
  const overdueInvoices = useMemo(() => {
    return invoices.filter(inv => inv.status === 'overdue');
  }, [invoices]);

  // Top clients by invoiced volume
  const topClients = useMemo(() => {
    const clientMap: Record<string, { name: string; total: number; paid: number; pending: number; count: number }> = {};
    invoices.forEach(inv => {
      if (inv.status === 'cancelled') return;
      if (!clientMap[inv.clientId]) {
        clientMap[inv.clientId] = {
          name: inv.clientName,
          total: 0,
          paid: 0,
          pending: 0,
          count: 0
        };
      }
      clientMap[inv.clientId].total += inv.total;
      clientMap[inv.clientId].paid += inv.paidAmount;
      clientMap[inv.clientId].pending += inv.outstandingAmount;
      clientMap[inv.clientId].count += 1;
    });

    return Object.values(clientMap).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [invoices]);

  // Recent finance activity events
  const financeActivities = useMemo(() => {
    return activityEvents.filter(a => 
      a.entityType === 'invoice' || 
      a.entityType === 'payment' || 
      a.entityType === 'expense' ||
      a.type.startsWith('INVOICE_') ||
      a.type.startsWith('PAYMENT_') ||
      a.type.startsWith('EXPENSE_')
    ).slice(0, 6);
  }, [activityEvents]);

  // Monthly revenue mock trajectory for 6 months (Apr - Sep 2026)
  const monthlyTrend = [
    { month: 'Apr', revenue: 28.5, collected: 26.0 },
    { month: 'May', revenue: 34.0, collected: 32.5 },
    { month: 'Jun', revenue: 42.0, collected: 39.0 },
    { month: 'Jul', revenue: 48.5, collected: 45.0 },
    { month: 'Aug', revenue: 54.0, collected: 51.5 },
    { month: 'Sep', revenue: 64.2, collected: 44.0 } // Current month
  ];

  const maxTrendVal = Math.max(...monthlyTrend.map(t => t.revenue));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              Finance & Revenue Operations
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30 uppercase">
              Phase 5 Active
            </span>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Real-time billing telemetry, revenue recognition, accounts receivable, and company burn-rate.
          </p>
        </div>

        {/* Quick Action Ribbon */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BarChart3 className="w-3.5 h-3.5 text-turquoise" />}
            onClick={() => navigateTo('/app/finance/revenue')}
          >
            Revenue Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CreditCard className="w-3.5 h-3.5 text-turquoise" />}
            onClick={() => navigateTo('/app/finance/payments')}
          >
            Payments Ledger
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Receipt className="w-3.5 h-3.5 text-turquoise" />}
            onClick={() => navigateTo('/app/finance/expenses')}
          >
            Expenses Desk
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateInvoiceOpen(true)}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Time Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-2 rounded-lg bg-crm-surface/60 border border-crm-border text-xs">
        <div className="flex items-center gap-2 text-crm-textMuted font-mono">
          <Calendar className="w-3.5 h-3.5 text-turquoise" />
          <span>Accounting Period:</span>
        </div>

        <div className="flex items-center gap-1">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'quarter', label: 'This Quarter (Q3)' },
            { id: 'year', label: 'FY 2026-27' },
            { id: 'all', label: 'All Time' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id as TimeFilter)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                timeFilter === f.id
                  ? 'bg-turquoise/20 text-turquoise border border-turquoise/40 font-medium'
                  : 'text-crm-textMuted hover:text-crm-text hover:bg-crm-surface'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Top-Level Compact Metric Cards (Section 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Revenue */}
        <div 
          onClick={() => navigateTo('/app/finance/invoices')}
          className="p-3.5 rounded-lg bg-crm-card border border-crm-border hover:border-turquoise/50 cursor-pointer transition-all shadow-card group"
        >
          <div className="flex items-center justify-between text-crm-textMuted mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-crm-textSecondary group-hover:text-turquoise">
              Total Invoiced
            </span>
            <Receipt className="w-3.5 h-3.5 text-slate-500 group-hover:text-turquoise" />
          </div>
          <p className="text-xl font-bold font-mono text-crm-text">
            ₹{(filteredMetrics.totalRevenue / 100000).toFixed(1)}L
          </p>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-2.5 h-2.5" /> +18.4% vs Q2
          </span>
        </div>

        {/* Collected */}
        <div 
          onClick={() => navigateTo('/app/finance/payments')}
          className="p-3.5 rounded-lg bg-crm-card border border-crm-border hover:border-emerald-500/50 cursor-pointer transition-all shadow-card group"
        >
          <div className="flex items-center justify-between text-crm-textMuted mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-crm-textSecondary group-hover:text-emerald-400">
              Collected
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-400">
            ₹{(filteredMetrics.totalCollected / 100000).toFixed(1)}L
          </p>
          <span className="text-[10px] font-mono text-crm-textMuted mt-1 block">
            {filteredMetrics.paidInvoicesCount} full settlements
          </span>
        </div>

        {/* Pending */}
        <div 
          onClick={() => navigateTo('/app/finance/invoices')}
          className="p-3.5 rounded-lg bg-crm-card border border-crm-border hover:border-cyan-500/50 cursor-pointer transition-all shadow-card group"
        >
          <div className="flex items-center justify-between text-crm-textMuted mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-crm-textSecondary group-hover:text-cyan-400">
              Pending
            </span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xl font-bold font-mono text-cyan-300">
            ₹{(filteredMetrics.totalPending / 100000).toFixed(1)}L
          </p>
          <span className="text-[10px] font-mono text-crm-textMuted mt-1 block">
            Within payment terms
          </span>
        </div>

        {/* Overdue */}
        <div 
          onClick={() => navigateTo('/app/finance/overdue')}
          className={`p-3.5 rounded-lg bg-crm-card border transition-all shadow-card cursor-pointer group ${
            filteredMetrics.totalOverdue > 0 
              ? 'border-amber-900/60 bg-amber-950/10 hover:border-amber-600/80' 
              : 'border-crm-border hover:border-crm-borderHover'
          }`}
        >
          <div className="flex items-center justify-between text-crm-textMuted mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
              Overdue
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-bold font-mono text-amber-300">
            ₹{(filteredMetrics.totalOverdue / 100000).toFixed(1)}L
          </p>
          <span className="text-[10px] font-mono text-amber-400/90 mt-1 block">
            {filteredMetrics.overdueInvoicesCount} overdue accounts
          </span>
        </div>

        {/* Expenses */}
        <div 
          onClick={() => navigateTo('/app/finance/expenses')}
          className="p-3.5 rounded-lg bg-crm-card border border-crm-border hover:border-rose-500/50 cursor-pointer transition-all shadow-card group"
        >
          <div className="flex items-center justify-between text-crm-textMuted mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-crm-textSecondary group-hover:text-rose-400">
              Expenses
            </span>
            <DollarSign className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-xl font-bold font-mono text-rose-300">
            ₹{(filteredMetrics.totalExpenses / 100000).toFixed(2)}L
          </p>
          <span className="text-[10px] font-mono text-crm-textMuted mt-1 block">
            {filteredMetrics.pendingExpensesCount} pending approval
          </span>
        </div>

        {/* Net Revenue */}
        <div 
          onClick={() => navigateTo('/app/finance/revenue')}
          className="p-3.5 rounded-lg bg-crm-card border border-teal-900/40 bg-teal-950/10 hover:border-turquoise/60 cursor-pointer transition-all shadow-card group"
        >
          <div className="flex items-center justify-between text-crm-textMuted mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-turquoise">
              Net Margin
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-turquoise" />
          </div>
          <p className="text-xl font-bold font-mono text-white">
            ₹{(filteredMetrics.netRevenue / 100000).toFixed(1)}L
          </p>
          <span className="text-[10px] font-mono text-teal-400 mt-1 block">
            Collected minus burn
          </span>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Trend & Top Clients), Right 1 Col (Overdue & Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue vs Collection Trajectory (Restrained clean visual) */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-text flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-turquoise" />
                  <span>Revenue & Collection Trajectory (Last 6 Months)</span>
                </h3>
                <p className="text-[11px] text-crm-textMuted mt-0.5">
                  Comparison between total value invoiced and actual cash collections received into bank accounts.
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-teal-500" />
                  <span className="text-crm-textSecondary">Invoiced</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span className="text-crm-textSecondary">Collected</span>
                </span>
              </div>
            </div>

            {/* Custom SVG/Bar Chart */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-6 gap-3 items-end h-44 border-b border-crm-border/60 pb-2">
                {monthlyTrend.map((m, i) => {
                  const revHeight = (m.revenue / maxTrendVal) * 100;
                  const colHeight = (m.collected / maxTrendVal) * 100;

                  return (
                    <div key={i} className="flex flex-col items-center h-full justify-end gap-1.5 group">
                      <div className="w-full flex items-end justify-center gap-1.5 h-36">
                        {/* Invoiced Bar */}
                        <div 
                          style={{ height: `${revHeight}%` }}
                          className="w-4 bg-teal-500/70 group-hover:bg-teal-400 rounded-t transition-all"
                          title={`${m.month}: ₹${m.revenue}L Invoiced`}
                        />
                        {/* Collected Bar */}
                        <div 
                          style={{ height: `${colHeight}%` }}
                          className="w-4 bg-emerald-500/70 group-hover:bg-emerald-400 rounded-t transition-all"
                          title={`${m.month}: ₹${m.collected}L Collected`}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-crm-textMuted group-hover:text-white">
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-crm-textMuted">
                <span>Peak Monthly Billing: ₹64.2L (Sep 2026)</span>
                <span>Average Realization Rate: 84.6%</span>
              </div>
            </div>
          </Card>

          {/* Top Client Accounts by Revenue (Section 3) */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-text flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-turquoise" />
                  <span>Key Client Accounts — Revenue & Recovery Status</span>
                </h3>
              </div>
              <button
                onClick={() => navigateTo('/app/crm/companies')}
                className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
              >
                <span>All Companies</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-crm-border/60">
              {topClients.map((client, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-crm-text truncate">{client.name}</p>
                    <p className="text-[11px] text-crm-textMuted font-mono mt-0.5">
                      {client.count} Commercial Invoices Generated
                    </p>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-right shrink-0">
                    <div>
                      <span className="text-[10px] text-crm-textMuted uppercase block">Total Billed</span>
                      <span className="font-medium text-crm-text">₹{(client.total / 100000).toFixed(2)}L</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-crm-textMuted uppercase block">Collected</span>
                      <span className="font-medium text-emerald-400">₹{(client.paid / 100000).toFixed(2)}L</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-crm-textMuted uppercase block">Outstanding</span>
                      <span className={`font-semibold ${client.pending > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        ₹{(client.pending / 100000).toFixed(2)}L
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Overdue Action Cards & Audit Feed */}
        <div className="space-y-6">
          {/* Overdue Invoices Alert Card */}
          <Card className="p-4 border-amber-900/40 bg-amber-950/5">
            <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Overdue Invoices Alert ({overdueInvoices.length})
                </h3>
              </div>
              <button
                onClick={() => navigateTo('/app/finance/overdue')}
                className="text-[11px] text-amber-400 hover:underline font-mono"
              >
                View Recovery Desk →
              </button>
            </div>

            {overdueInvoices.length === 0 ? (
              <p className="text-xs text-crm-textMuted py-4 text-center">
                All client invoices are currently within healthy payment terms.
              </p>
            ) : (
              <div className="space-y-2.5">
                {overdueInvoices.slice(0, 3).map(inv => (
                  <div 
                    key={inv.id} 
                    className="p-3 rounded bg-crm-surface/80 border border-amber-900/30 hover:border-amber-600/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">{inv.invoiceNumber}</span>
                        <p className="text-xs font-medium text-white truncate">{inv.clientName}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        ₹{(inv.outstandingAmount / 100000).toFixed(2)}L
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-crm-border/40 text-[10px] font-mono text-crm-textMuted">
                      <span>Due: {inv.dueDate}</span>
                      <button
                        onClick={() => navigateTo(`/app/finance/invoices/${inv.id}`)}
                        className="text-turquoise hover:underline"
                      >
                        Open Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Financial Activity Trail (Section 15) */}
          <Card className="p-4">
            <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary">
                Financial Audit Trail
              </h3>
              <button
                onClick={() => navigateTo('/app/audit')}
                className="text-[11px] text-turquoise hover:underline"
              >
                Full Audit Log
              </button>
            </div>

            {financeActivities.length === 0 ? (
              <p className="text-xs text-crm-textMuted py-4 text-center">
                No recent financial events logged.
              </p>
            ) : (
              <div className="space-y-3">
                {financeActivities.map(act => (
                  <div key={act.id} className="text-xs space-y-1 pb-2 border-b border-crm-border/40 last:border-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">{act.actorName}</span>
                      <span className="text-[10px] text-crm-textMuted font-mono">{act.timestamp}</span>
                    </div>
                    <p className="text-crm-textSecondary text-[11px] leading-relaxed">
                      {act.description}
                    </p>
                    <span className="inline-block text-[9px] font-mono text-turquoise/80 uppercase">
                      {act.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Invoice Generator Modal */}
      {isCreateInvoiceOpen && (
        <CreateInvoiceModal
          isOpen={true}
          onClose={() => setIsCreateInvoiceOpen(false)}
        />
      )}
    </div>
  );
};
