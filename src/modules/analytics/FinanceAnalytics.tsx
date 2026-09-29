import React, { useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import {
  DollarSign, CreditCard, Receipt, TrendingUp, AlertTriangle,
  BarChart3, ChevronRight, ArrowUpRight
} from 'lucide-react';

export const FinanceAnalytics: React.FC = () => {
  const { invoices, payments, expenses, financeMetrics, companies, projects, navigateTo } = useCRM();

  // ── Revenue by Client ──
  const revenueByClient = useMemo(() => {
    const map: Record<string, { name: string; billed: number; collected: number; outstanding: number }> = {};
    invoices.forEach(inv => {
      if (!map[inv.clientName]) map[inv.clientName] = { name: inv.clientName, billed: 0, collected: 0, outstanding: 0 };
      map[inv.clientName].billed += inv.total;
      map[inv.clientName].collected += inv.paidAmount;
      map[inv.clientName].outstanding += inv.outstandingAmount;
    });
    return Object.values(map).sort((a, b) => b.billed - a.billed);
  }, [invoices]);

  // ── Revenue by Project ──
  const revenueByProject = useMemo(() => {
    const map: Record<string, { name: string; billed: number; collected: number }> = {};
    invoices.filter(inv => inv.projectName).forEach(inv => {
      const key = inv.projectName!;
      if (!map[key]) map[key] = { name: key, billed: 0, collected: 0 };
      map[key].billed += inv.total;
      map[key].collected += inv.paidAmount;
    });
    return Object.values(map).sort((a, b) => b.billed - a.billed);
  }, [invoices]);

  // ── Expenses by Category ──
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(exp => {
      map[exp.category] = (map[exp.category] || 0) + exp.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // ── KPIs ──
  const kpis = [
    { label: 'Total Revenue', value: `₹${(financeMetrics.totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Collected', value: `₹${(financeMetrics.totalCollected / 100000).toFixed(1)}L`, icon: CreditCard, color: 'text-teal-400' },
    { label: 'Outstanding', value: `₹${(financeMetrics.totalPending / 100000).toFixed(1)}L`, icon: Receipt, color: 'text-amber-400' },
    { label: 'Overdue', value: `₹${(financeMetrics.totalOverdue / 100000).toFixed(1)}L`, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Expenses', value: `₹${(financeMetrics.totalExpenses / 100000).toFixed(1)}L`, icon: Receipt, color: 'text-orange-400' },
    { label: 'Net Revenue', value: `₹${(financeMetrics.netRevenue / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-turquoise' },
  ];

  // ── Invoices Table ──
  const invoiceColumns: DataTableColumn<typeof invoices[0]>[] = [
    { key: 'invoiceNumber', label: 'Invoice', render: r => <span className="font-mono text-xs text-crm-text">{r.invoiceNumber}</span> },
    { key: 'clientName', label: 'Client' },
    { key: 'projectName', label: 'Project', render: r => <span className="text-crm-textSecondary">{r.projectName || '—'}</span> },
    { key: 'total', label: 'Amount', align: 'right', sortable: true, render: r => <span className="font-mono">₹{(r.total / 1000).toFixed(0)}K</span> },
    { key: 'paidAmount', label: 'Paid', align: 'right', sortable: true, render: r => <span className="font-mono text-emerald-400">₹{(r.paidAmount / 1000).toFixed(0)}K</span> },
    { key: 'outstandingAmount', label: 'Due', align: 'right', sortable: true, render: r => (
      <span className={`font-mono ${r.outstandingAmount > 0 ? 'text-amber-400' : 'text-crm-textMuted'}`}>₹{(r.outstandingAmount / 1000).toFixed(0)}K</span>
    )},
    { key: 'status', label: 'Status', render: r => {
      const v = r.status === 'paid' ? 'success' : r.status === 'overdue' ? 'error' : r.status === 'sent' ? 'primary' : 'neutral';
      return <Badge variant={v} size="sm">{r.status}</Badge>;
    }},
    { key: 'dueDate', label: 'Due Date', sortable: true, render: r => <span className="text-[11px] text-crm-textMuted">{r.dueDate}</span> },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-lg font-bold text-crm-text tracking-tight">Financial Analytics</h1>
        <p className="text-xs text-crm-textMuted mt-0.5">Revenue, collections, expenses, and financial performance drill-downs</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-crm-card border border-crm-border rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              <span className="text-[10px] text-crm-textMuted uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className="text-base font-bold text-crm-text">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue by Client */}
        <Card>
          <CardHeader><CardTitle>Revenue by Client</CardTitle></CardHeader>
          <div className="space-y-2">
            {revenueByClient.slice(0, 6).map(c => {
              const maxVal = revenueByClient[0]?.billed || 1;
              return (
                <div key={c.name} onClick={() => navigateTo('/app/analytics/clients')} className="space-y-1 cursor-pointer hover:bg-crm-surface/20 rounded px-1 -mx-1 py-0.5 transition-colors">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-crm-textSecondary truncate max-w-[120px]">{c.name}</span>
                    <span className="font-semibold text-crm-text">₹{(c.billed / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="h-1.5 bg-crm-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500/60" style={{ width: `${(c.billed / maxVal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Revenue by Project */}
        <Card>
          <CardHeader><CardTitle>Revenue by Project</CardTitle></CardHeader>
          <div className="space-y-2">
            {revenueByProject.slice(0, 6).map(p => {
              const maxVal = revenueByProject[0]?.billed || 1;
              return (
                <div key={p.name} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-crm-textSecondary truncate max-w-[120px]">{p.name}</span>
                    <span className="font-semibold text-crm-text">₹{(p.billed / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="h-1.5 bg-crm-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-turquoise/60" style={{ width: `${(p.billed / maxVal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {revenueByProject.length === 0 && <p className="text-xs text-crm-textMuted py-4 text-center">No project-linked invoices</p>}
          </div>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
          <div className="space-y-2">
            {expensesByCategory.map(([cat, amount]) => {
              const maxVal = expensesByCategory[0]?.[1] || 1;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-crm-textSecondary capitalize">{cat}</span>
                    <span className="font-semibold text-crm-text">₹{(amount / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="h-1.5 bg-crm-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-orange-500/60" style={{ width: `${(amount / maxVal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Full Invoices Table */}
      <Card>
        <DataTable
          data={invoices}
          columns={invoiceColumns}
          keyExtractor={r => r.id}
          title="All Invoices"
          subtitle={`${invoices.length} invoices · ₹${(financeMetrics.totalRevenue / 100000).toFixed(1)}L total billed`}
          searchPlaceholder="Search invoices…"
          exportFilename="finance_invoices"
          onRowClick={r => navigateTo(`/app/finance/invoices/${r.id}`)}
          pageSize={10}
        />
      </Card>
    </div>
  );
};
