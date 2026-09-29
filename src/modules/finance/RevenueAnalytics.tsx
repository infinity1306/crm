import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Building2, 
  FolderKanban, 
  Receipt, 
  CreditCard,
  Download,
  Calendar,
  Layers,
  PieChart
} from 'lucide-react';

export const RevenueAnalytics: React.FC = () => {
  const { 
    invoices, 
    payments, 
    expenses, 
    projects, 
    financeMetrics, 
    navigateTo 
  } = useCRM();

  const [period, setPeriod] = useState<'q3' | 'h1' | 'fy26'>('fy26');

  // Top clients leaderboard
  const clientRevenueList = useMemo(() => {
    const map: Record<string, { id: string; name: string; billed: number; paid: number; pending: number; realization: number }> = {};
    invoices.forEach(inv => {
      if (inv.status === 'cancelled') return;
      if (!map[inv.clientId]) {
        map[inv.clientId] = {
          id: inv.clientId,
          name: inv.clientName,
          billed: 0,
          paid: 0,
          pending: 0,
          realization: 0
        };
      }
      map[inv.clientId].billed += inv.total;
      map[inv.clientId].paid += inv.paidAmount;
      map[inv.clientId].pending += inv.outstandingAmount;
    });

    return Object.values(map)
      .map(c => ({
        ...c,
        realization: c.billed > 0 ? Math.round((c.paid / c.billed) * 100) : 0
      }))
      .sort((a, b) => b.billed - a.billed);
  }, [invoices]);

  // Top projects revenue
  const projectRevenueList = useMemo(() => {
    return projects.map(p => {
      const projInvoices = invoices.filter(i => i.projectId === p.id && i.status !== 'cancelled');
      const billed = projInvoices.reduce((acc, i) => acc + i.total, 0);
      const collected = projInvoices.reduce((acc, i) => acc + i.paidAmount, 0);
      const projExpenses = expenses.filter(e => e.projectId === p.id && (e.status === 'approved' || e.status === 'paid'));
      const spent = projExpenses.reduce((acc, e) => acc + e.amount, 0);
      const grossMargin = billed > 0 ? Math.round(((billed - spent) / billed) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        clientName: p.clientName,
        budget: p.budget,
        billed,
        collected,
        spent,
        grossMargin
      };
    }).sort((a, b) => b.billed - a.billed);
  }, [projects, invoices, expenses]);

  // Expenses category breakdown
  const expensesByCategory = useMemo(() => {
    const catMap: Record<string, number> = {};
    expenses.forEach(e => {
      if (e.status === 'approved' || e.status === 'paid') {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      }
    });

    const totalExp = Object.values(catMap).reduce((a, b) => a + b, 0);
    return Object.entries(catMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-crm-border">
        <div>
          <button
            onClick={() => navigateTo('/app/finance')}
            className="flex items-center gap-1.5 text-xs text-crm-textMuted hover:text-turquoise transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Finance Overview</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-crm-text">
            Revenue & Profitability Analytics
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/app/finance/reports')}
          >
            Export Detailed Reports
          </Button>
        </div>
      </div>

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-crm-textSecondary block mb-1">
            Total Revenue Invoiced
          </span>
          <p className="text-2xl font-bold font-mono text-crm-text">
            ₹{(financeMetrics.totalRevenue / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">
            +22.8% YoY growth trajectory
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-crm-textSecondary block mb-1">
            Cash Collection Realization
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {financeMetrics.totalRevenue > 0 ? Math.round((financeMetrics.totalCollected / financeMetrics.totalRevenue) * 100) : 0}%
          </p>
          <p className="text-[11px] text-crm-textMuted font-mono mt-1">
            ₹{(financeMetrics.totalCollected / 100000).toFixed(1)}L banked to date
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-crm-textSecondary block mb-1">
            Outstanding Accounts Receivable
          </span>
          <p className="text-2xl font-bold font-mono text-amber-300">
            ₹{((financeMetrics.totalPending + financeMetrics.totalOverdue) / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-amber-400 font-mono mt-1">
            ₹{(financeMetrics.totalOverdue / 100000).toFixed(1)}L overdue
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-crm-textSecondary block mb-1">
            Operating Net Margin
          </span>
          <p className="text-2xl font-bold font-mono text-teal-300">
            ₹{(financeMetrics.netRevenue / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-crm-textMuted font-mono mt-1">
            After infrastructure & team burn
          </p>
        </Card>
      </div>

      {/* Grid: Top Clients Leaderboard & Top Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <Card className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-turquoise" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                Client Accounts Leaderboard
              </h3>
            </div>
            <span className="text-[11px] font-mono text-crm-textMuted">
              {clientRevenueList.length} Accounts
            </span>
          </div>

          <div className="divide-y divide-crm-border/60">
            {clientRevenueList.map((c, i) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-crm-textMuted w-4">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-crm-text truncate">{c.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-crm-textMuted font-mono mt-0.5">
                      <span>Realized: {c.realization}%</span>
                      <span>•</span>
                      <span className={c.pending > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                        ₹{(c.pending / 100000).toFixed(1)}L pending
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono shrink-0">
                  <span className="text-xs font-bold text-white block">₹{(c.billed / 100000).toFixed(2)}L</span>
                  <span className="text-[10px] text-emerald-400">₹{(c.paid / 100000).toFixed(2)}L paid</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Projects */}
        <Card className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-turquoise" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                Project Delivery Value & Margins
              </h3>
            </div>
            <span className="text-[11px] font-mono text-crm-textMuted">
              Active Delivery
            </span>
          </div>

          <div className="divide-y divide-crm-border/60">
            {projectRevenueList.slice(0, 5).map((p, i) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-crm-text truncate">{p.name}</p>
                  <p className="text-[11px] text-crm-textMuted font-mono mt-0.5">
                    Client: {p.clientName}
                  </p>
                </div>

                <div className="text-right font-mono shrink-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-crm-textMuted block">Invoiced</span>
                      <span className="font-bold text-white">₹{(p.billed / 100000).toFixed(1)}L</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-crm-textMuted block">Margin</span>
                      <span className="font-bold text-teal-400">{p.grossMargin}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Expenses by Category Breakdown (Section 20) */}
      <Card className="p-5">
        <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-turquoise" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
              Operational Expenditures by Category
            </h3>
          </div>
          <span className="text-xs font-mono text-rose-400">
            Total Burn: ₹{(financeMetrics.totalExpenses / 100000).toFixed(2)}L
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {expensesByCategory.map(item => (
            <div key={item.category} className="p-3.5 rounded bg-crm-surface/70 border border-crm-border">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-crm-text capitalize">{item.category}</span>
                <span className="text-[11px] font-mono text-crm-textMuted">{item.percentage}%</span>
              </div>
              <p className="text-lg font-bold font-mono text-white mt-1">
                ₹{item.amount.toLocaleString('en-IN')}
              </p>
              <div className="w-full bg-crm-bg h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-turquoise h-full rounded-full" 
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
