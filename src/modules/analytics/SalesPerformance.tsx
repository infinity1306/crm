import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { Target, ChevronLeft, Users, TrendingUp, DollarSign } from 'lucide-react';

interface RepRow {
  id: string;
  name: string;
  role: string;
  meetings: number;
  meetingsTarget: number;
  followups: number;
  followupsTarget: number;
  qualified: number;
  qualifiedTarget: number;
  proposals: number;
  proposalsTarget: number;
  conversions: number;
  conversionsTarget: number;
  revenue: number;
  revenueTarget: number;
  conversionRate: number;
}

export const SalesPerformance: React.FC = () => {
  const { salesMetrics, deals, navigateTo } = useCRM();

  // Build rows from salesMetrics
  const rows: RepRow[] = salesMetrics.map(m => {
    const repDeals = deals.filter(d => d.ownerId === m.employeeId);
    const wonCount = repDeals.filter(d => d.stage === 'won').length;
    const totalDeals = repDeals.filter(d => d.stage !== 'lost').length;
    return {
      id: m.employeeId,
      name: m.employeeName,
      role: m.role,
      meetings: m.meetings.actual,
      meetingsTarget: m.meetings.target,
      followups: m.followups.actual,
      followupsTarget: m.followups.target,
      qualified: m.qualifiedLeads.actual,
      qualifiedTarget: m.qualifiedLeads.target,
      proposals: m.proposals.actual,
      proposalsTarget: m.proposals.target,
      conversions: m.conversions.actual,
      conversionsTarget: m.conversions.target,
      revenue: m.revenue.actual,
      revenueTarget: m.revenue.target,
      conversionRate: totalDeals > 0 ? Math.round((wonCount / totalDeals) * 100) : 0,
    };
  });

  const renderMetric = (actual: number, target: number, fmt?: 'currency') => {
    const variance = actual - target;
    const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
    const isGood = actual >= target;
    const displayActual = fmt === 'currency' ? `₹${(actual / 100000).toFixed(1)}L` : String(actual);
    const displayTarget = fmt === 'currency' ? `₹${(target / 100000).toFixed(1)}L` : String(target);
    const displayVariance = fmt === 'currency' ? `${variance >= 0 ? '+' : ''}₹${(Math.abs(variance) / 100000).toFixed(1)}L` : `${variance >= 0 ? '+' : ''}${variance}`;

    return (
      <div className="text-right">
        <div className="text-xs font-semibold text-crm-text">{displayActual}</div>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] text-crm-textMuted">/ {displayTarget}</span>
          <span className={`text-[10px] font-medium ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
            {displayVariance}
          </span>
        </div>
      </div>
    );
  };

  const columns: DataTableColumn<RepRow>[] = [
    {
      key: 'name',
      label: 'Employee',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-crm-surface border border-crm-border flex items-center justify-center text-[10px] font-bold text-turquoise">
            {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="text-xs font-medium text-crm-text">{r.name}</div>
            <div className="text-[10px] text-crm-textMuted">{r.role}</div>
          </div>
        </div>
      ),
    },
    { key: 'meetings', label: 'Meetings', align: 'right', sortable: true, render: r => renderMetric(r.meetings, r.meetingsTarget) },
    { key: 'followups', label: 'Follow-ups', align: 'right', sortable: true, render: r => renderMetric(r.followups, r.followupsTarget) },
    { key: 'qualified', label: 'Qualified', align: 'right', sortable: true, render: r => renderMetric(r.qualified, r.qualifiedTarget) },
    { key: 'proposals', label: 'Proposals', align: 'right', sortable: true, render: r => renderMetric(r.proposals, r.proposalsTarget) },
    { key: 'conversions', label: 'Conversions', align: 'right', sortable: true, render: r => renderMetric(r.conversions, r.conversionsTarget) },
    { key: 'revenue', label: 'Revenue', align: 'right', sortable: true, getValue: r => r.revenue, render: r => renderMetric(r.revenue, r.revenueTarget, 'currency') },
    { key: 'conversionRate', label: 'Conv. Rate', align: 'right', sortable: true, render: r => (
      <span className={`text-xs font-semibold ${r.conversionRate >= 30 ? 'text-emerald-400' : r.conversionRate >= 15 ? 'text-amber-400' : 'text-red-400'}`}>
        {r.conversionRate}%
      </span>
    )},
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('/app/analytics/sales')} className="p-1.5 rounded hover:bg-crm-surface text-crm-textMuted hover:text-crm-text transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-crm-text tracking-tight">Sales Rep Performance</h1>
            <p className="text-xs text-crm-textMuted mt-0.5">Individual sales employee metrics · Target vs Actual vs Variance</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Reps', value: rows.length, icon: Users, color: 'text-indigo-400' },
          { label: 'Combined Revenue', value: `₹${(rows.reduce((s, r) => s + r.revenue, 0) / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-emerald-400' },
          { label: 'Revenue Target', value: `₹${(rows.reduce((s, r) => s + r.revenueTarget, 0) / 100000).toFixed(1)}L`, icon: Target, color: 'text-amber-400' },
          { label: 'Avg. Conversion', value: `${rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.conversionRate, 0) / rows.length) : 0}%`, icon: TrendingUp, color: 'text-turquoise' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-crm-card border border-crm-border rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              <span className="text-[10px] text-crm-textMuted uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className="text-base font-bold text-crm-text">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Detail Cards Per Rep */}
      <div className="space-y-4">
        {rows.map(rep => {
          const metrics = [
            { label: 'Meetings', actual: rep.meetings, target: rep.meetingsTarget },
            { label: 'Follow-ups', actual: rep.followups, target: rep.followupsTarget },
            { label: 'Qualified Leads', actual: rep.qualified, target: rep.qualifiedTarget },
            { label: 'Proposals', actual: rep.proposals, target: rep.proposalsTarget },
            { label: 'Conversions', actual: rep.conversions, target: rep.conversionsTarget },
          ];
          return (
            <Card key={rep.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-crm-surface border border-crm-border flex items-center justify-center text-sm font-bold text-turquoise">
                  {rep.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-crm-text">{rep.name}</h3>
                  <p className="text-[11px] text-crm-textMuted">{rep.role}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm font-bold text-emerald-400">₹{(rep.revenue / 100000).toFixed(1)}L</div>
                  <div className="text-[10px] text-crm-textMuted">of ₹{(rep.revenueTarget / 100000).toFixed(1)}L target</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {metrics.map(m => {
                  const pct = m.target > 0 ? Math.round((m.actual / m.target) * 100) : 0;
                  const isGood = m.actual >= m.target;
                  return (
                    <div key={m.label} className="p-2.5 rounded-md bg-crm-surface/40 border border-crm-border/30">
                      <div className="text-[10px] text-crm-textMuted uppercase tracking-wider mb-1">{m.label}</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-crm-text">{m.actual}</span>
                        <span className="text-[10px] text-crm-textMuted">/ {m.target}</span>
                      </div>
                      <div className="h-1 bg-crm-surface rounded-full mt-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${isGood ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <div className={`text-[10px] mt-1 font-medium ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                        {m.actual - m.target >= 0 ? '+' : ''}{m.actual - m.target} variance
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Comparative Table */}
      <Card>
        <DataTable
          data={rows}
          columns={columns}
          keyExtractor={r => r.id}
          title="Performance Comparison"
          subtitle="All values show Actual / Target with variance"
          searchPlaceholder="Search reps…"
          exportFilename="sales_rep_performance"
          onRowClick={r => navigateTo(`/app/team/${r.id}`)}
          pageSize={10}
        />
      </Card>
    </div>
  );
};
