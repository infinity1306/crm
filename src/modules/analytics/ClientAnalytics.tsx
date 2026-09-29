import React, { useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import {
  Building2, IndianRupee, FolderKanban, Briefcase, LifeBuoy,
  ChevronRight, Users
} from 'lucide-react';

interface ClientRow {
  id: string;
  name: string;
  revenue: number;
  collected: number;
  outstanding: number;
  activeDeals: number;
  activeProjects: number;
  openTickets: number;
  lastActivity: string;
}

export const ClientAnalytics: React.FC = () => {
  const { companies, deals, projects, tickets, invoices, navigateTo } = useCRM();

  const rows: ClientRow[] = useMemo(() => {
    return companies.map(comp => {
      const compDeals = deals.filter(d => d.companyId === comp.id || d.companyName === comp.name);
      const activeDeals = compDeals.filter(d => d.stage !== 'lost').length;
      const compProjects = projects.filter(p => p.clientId === comp.id || p.clientName === comp.name);
      const activeProjects = compProjects.filter(p => p.status === 'active' || p.status === 'planning').length;
      const compTickets = tickets.filter(tk => compProjects.some(p => p.id === tk.projectId));
      const openTickets = compTickets.filter(tk => tk.status !== 'resolved' && tk.status !== 'closed').length;
      const compInvoices = invoices.filter(inv => inv.clientId === comp.id || inv.clientName === comp.name);
      const revenue = compInvoices.reduce((s, inv) => s + inv.total, 0);
      const collected = compInvoices.reduce((s, inv) => s + inv.paidAmount, 0);
      const outstanding = compInvoices.reduce((s, inv) => s + inv.outstandingAmount, 0);

      return {
        id: comp.id,
        name: comp.name,
        revenue,
        collected,
        outstanding,
        activeDeals,
        activeProjects,
        openTickets,
        lastActivity: comp.lastActivity,
      };
    });
  }, [companies, deals, projects, tickets, invoices]);

  const totalClients = companies.length;
  const clientsWithRevenue = rows.filter(r => r.revenue > 0).length;
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalOutstanding = rows.reduce((s, r) => s + r.outstanding, 0);

  const columns: DataTableColumn<ClientRow>[] = [
    { key: 'name', label: 'Client', render: r => <span className="text-xs font-medium text-crm-text">{r.name}</span> },
    { key: 'revenue', label: 'Revenue', align: 'right', sortable: true, getValue: r => r.revenue, render: r => (
      <span className="font-mono text-xs">₹{(r.revenue / 100000).toFixed(1)}L</span>
    )},
    { key: 'collected', label: 'Collected', align: 'right', sortable: true, getValue: r => r.collected, render: r => (
      <span className="font-mono text-xs text-emerald-400">₹{(r.collected / 100000).toFixed(1)}L</span>
    )},
    { key: 'outstanding', label: 'Outstanding', align: 'right', sortable: true, getValue: r => r.outstanding, render: r => (
      <span className={`font-mono text-xs ${r.outstanding > 0 ? 'text-amber-400' : 'text-crm-textMuted'}`}>₹{(r.outstanding / 1000).toFixed(0)}K</span>
    )},
    { key: 'activeDeals', label: 'Deals', align: 'right', sortable: true },
    { key: 'activeProjects', label: 'Projects', align: 'right', sortable: true },
    { key: 'openTickets', label: 'Tickets', align: 'right', sortable: true, render: r => (
      <span className={r.openTickets > 0 ? 'text-amber-400 font-semibold' : 'text-crm-textMuted'}>{r.openTickets}</span>
    )},
    { key: 'lastActivity', label: 'Last Activity', render: r => <span className="text-[11px] text-crm-textMuted">{r.lastActivity}</span> },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-lg font-bold text-crm-text tracking-tight">Client Analytics</h1>
        <p className="text-xs text-crm-textMuted mt-0.5">Client matrix — revenue, collections, deals, projects, and tickets per client</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Clients', value: totalClients, icon: Building2, color: 'text-indigo-400' },
          { label: 'Active (Revenue)', value: clientsWithRevenue, icon: Users, color: 'text-emerald-400' },
          { label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: IndianRupee, color: 'text-turquoise' },
          { label: 'Outstanding', value: `₹${(totalOutstanding / 100000).toFixed(1)}L`, icon: IndianRupee, color: 'text-amber-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-crm-card border border-crm-border rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              <span className="text-[10px] text-crm-textMuted uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className="text-base font-bold text-crm-text">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Client Table */}
      <Card>
        <DataTable
          data={rows}
          columns={columns}
          keyExtractor={r => r.id}
          title="Client Matrix"
          subtitle={`${totalClients} clients across CRM`}
          searchPlaceholder="Search clients…"
          exportFilename="client_analytics"
          onRowClick={r => navigateTo(`/app/crm/companies/${r.id}`)}
          pageSize={15}
        />
      </Card>
    </div>
  );
};
