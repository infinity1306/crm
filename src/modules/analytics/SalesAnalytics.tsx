import React, { useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import {
  Target, TrendingUp, Briefcase, Users, DollarSign,
  ArrowUpRight, ChevronRight, BarChart3, Calendar
} from 'lucide-react';

export const SalesAnalytics: React.FC = () => {
  const { leads, deals, meetings, followUps, companies, salesMetrics, navigateTo } = useCRM();

  // ── Funnel Calculations ──
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.stage === 'qualified' || l.stage === 'proposal' || l.stage === 'negotiation' || l.stage === 'won').length;
  const meetingsCount = meetings.length;
  const proposalDeals = deals.filter(d => d.stage === 'proposal' || d.stage === 'negotiation' || d.stage === 'won').length;
  const negotiationDeals = deals.filter(d => d.stage === 'negotiation' || d.stage === 'won').length;
  const wonDeals = deals.filter(d => d.stage === 'won');
  const lostDeals = deals.filter(d => d.stage === 'lost');
  const conversionRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;
  const pipelineValue = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((s, d) => s + d.value, 0);
  const closedRevenue = wonDeals.reduce((s, d) => s + d.value, 0);
  const avgDealValue = wonDeals.length > 0 ? Math.round(closedRevenue / wonDeals.length) : 0;

  // ── Funnel Stages ──
  const funnelStages = [
    { label: 'Total Leads', count: totalLeads, color: 'bg-slate-500', pct: 100 },
    { label: 'Qualified', count: qualifiedLeads, color: 'bg-indigo-500', pct: totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0 },
    { label: 'Meetings Held', count: meetingsCount, color: 'bg-blue-500', pct: totalLeads > 0 ? Math.round((meetingsCount / totalLeads) * 100) : 0 },
    { label: 'Proposals', count: proposalDeals, color: 'bg-cyan-500', pct: totalLeads > 0 ? Math.round((proposalDeals / totalLeads) * 100) : 0 },
    { label: 'Negotiation', count: negotiationDeals, color: 'bg-teal-500', pct: totalLeads > 0 ? Math.round((negotiationDeals / totalLeads) * 100) : 0 },
    { label: 'Won', count: wonDeals.length, color: 'bg-emerald-500', pct: totalLeads > 0 ? Math.round((wonDeals.length / totalLeads) * 100) : 0 },
    { label: 'Lost', count: lostDeals.length, color: 'bg-red-500', pct: totalLeads > 0 ? Math.round((lostDeals.length / totalLeads) * 100) : 0 },
  ];

  // ── Revenue By Source ──
  const revenueBySource = useMemo(() => {
    const map: Record<string, number> = {};
    wonDeals.forEach(d => {
      const src = d.source || 'Other';
      map[src] = (map[src] || 0) + d.value;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [wonDeals]);

  // ── Revenue By Client ──
  const revenueByClient = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; deals: number }> = {};
    wonDeals.forEach(d => {
      if (!map[d.companyName]) map[d.companyName] = { name: d.companyName, revenue: 0, deals: 0 };
      map[d.companyName].revenue += d.value;
      map[d.companyName].deals++;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [wonDeals]);

  // ── Revenue By Employee ──
  const revenueByEmployee = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; deals: number }> = {};
    wonDeals.forEach(d => {
      if (!map[d.ownerName]) map[d.ownerName] = { name: d.ownerName, revenue: 0, deals: 0 };
      map[d.ownerName].revenue += d.value;
      map[d.ownerName].deals++;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [wonDeals]);

  // ── KPI Cards ──
  const kpis = [
    { label: 'Total Leads', value: totalLeads, icon: Target, color: 'text-slate-400' },
    { label: 'Qualified', value: qualifiedLeads, icon: Users, color: 'text-indigo-400' },
    { label: 'Meetings', value: meetingsCount, icon: Calendar, color: 'text-blue-400' },
    { label: 'Proposals', value: proposalDeals, icon: Briefcase, color: 'text-cyan-400' },
    { label: 'Negotiations', value: negotiationDeals, icon: BarChart3, color: 'text-teal-400' },
    { label: 'Won Deals', value: wonDeals.length, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Lost Deals', value: lostDeals.length, icon: Target, color: 'text-red-400' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: ArrowUpRight, color: 'text-turquoise' },
    { label: 'Pipeline Value', value: `₹${(pipelineValue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-amber-400' },
    { label: 'Closed Revenue', value: `₹${(closedRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-emerald-400' },
  ];

  // ── Deals Table ──
  const dealColumns: DataTableColumn<typeof deals[0]>[] = [
    { key: 'name', label: 'Deal', render: (d) => <span className="font-medium text-crm-text">{d.name}</span> },
    { key: 'companyName', label: 'Client' },
    { key: 'ownerName', label: 'Owner' },
    { key: 'value', label: 'Value', align: 'right', render: (d) => <span className="font-mono">₹{(d.value / 1000).toFixed(0)}K</span> },
    { key: 'stage', label: 'Stage', render: (d) => {
      const v = d.stage === 'won' ? 'success' : d.stage === 'lost' ? 'error' : d.stage === 'negotiation' ? 'warning' : 'neutral';
      return <Badge variant={v} size="sm">{d.stage}</Badge>;
    }},
    { key: 'probability', label: 'Prob.', align: 'right', render: (d) => <span className="text-crm-textSecondary">{d.probability}%</span> },
    { key: 'expectedCloseDate', label: 'Close Date', render: (d) => <span className="text-crm-textMuted text-[11px]">{d.expectedCloseDate}</span> },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-crm-text tracking-tight">Sales Analytics</h1>
          <p className="text-xs text-crm-textMuted mt-0.5">Pipeline performance, funnel analysis, and revenue breakdown</p>
        </div>
        <button
          onClick={() => navigateTo('/app/analytics/sales-performance')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-crm-surface border border-crm-border rounded-lg text-turquoise hover:bg-crm-surface/80 transition-colors"
        >
          Rep Performance <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-crm-card border border-crm-border rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              <span className="text-[10px] text-crm-textMuted uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className="text-base font-bold text-crm-text">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Funnel + Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visual Funnel */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
          <div className="space-y-2.5">
            {funnelStages.map((stage, i) => {
              const width = Math.max(stage.pct, 8);
              return (
                <div key={stage.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-crm-textSecondary">{stage.label}</span>
                    <span className="text-[11px] font-semibold text-crm-text">{stage.count} <span className="text-crm-textMuted font-normal">({stage.pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-crm-surface rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${stage.color} transition-all duration-300`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-3 mt-2 border-t border-crm-border/50 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-crm-textMuted">Avg Deal Value</span>
                <span className="text-crm-text font-semibold">₹{(avgDealValue / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-crm-textMuted">Stage Conversion</span>
                <span className="text-crm-text font-semibold">{qualifiedLeads > 0 ? Math.round((wonDeals.length / qualifiedLeads) * 100) : 0}% qualified→won</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Revenue By Source */}
        <Card>
          <CardHeader><CardTitle>Revenue by Source</CardTitle></CardHeader>
          <div className="space-y-2">
            {revenueBySource.map(([source, revenue]) => {
              const maxRev = revenueBySource[0]?.[1] || 1;
              return (
                <div key={source} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-crm-textSecondary">{source}</span>
                    <span className="font-semibold text-crm-text">₹{(revenue / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="h-1.5 bg-crm-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-turquoise/60" style={{ width: `${(revenue / maxRev) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {revenueBySource.length === 0 && <p className="text-xs text-crm-textMuted py-4 text-center">No revenue data</p>}
          </div>
        </Card>

        {/* Revenue By Client */}
        <Card>
          <CardHeader><CardTitle>Revenue by Client</CardTitle></CardHeader>
          <div className="space-y-2">
            {revenueByClient.slice(0, 6).map(client => {
              const maxRev = revenueByClient[0]?.revenue || 1;
              return (
                <div key={client.name} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-crm-textSecondary truncate max-w-[140px]">{client.name}</span>
                    <span className="font-semibold text-crm-text">₹{(client.revenue / 100000).toFixed(1)}L <span className="text-crm-textMuted font-normal">({client.deals} deals)</span></span>
                  </div>
                  <div className="h-1.5 bg-crm-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500/60" style={{ width: `${(client.revenue / maxRev) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Revenue by Employee */}
      <Card>
        <CardHeader><CardTitle>Revenue by Sales Rep</CardTitle></CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {revenueByEmployee.map(emp => (
            <div key={emp.name} className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-crm-surface/40">
              <div className="w-8 h-8 rounded-full bg-crm-surface border border-crm-border flex items-center justify-center text-xs font-bold text-turquoise">
                {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-crm-text truncate">{emp.name}</p>
                <p className="text-[10px] text-crm-textMuted">{emp.deals} deals closed</p>
              </div>
              <span className="text-sm font-bold text-emerald-400">₹{(emp.revenue / 100000).toFixed(1)}L</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Full Deals Table */}
      <Card>
        <DataTable
          data={deals}
          columns={dealColumns}
          keyExtractor={d => d.id}
          title="All Deals"
          subtitle={`${deals.length} deals in pipeline`}
          searchPlaceholder="Search deals…"
          exportFilename="sales_deals"
          onRowClick={d => navigateTo(`/app/crm/deals`)}
          pageSize={10}
        />
      </Card>
    </div>
  );
};
