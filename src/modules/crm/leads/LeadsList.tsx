import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Lead, LeadStage, LeadSource, LeadPriority } from '../../../types/crm';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Select';
import { Avatar } from '../../../components/ui/Avatar';
import { AddLeadDrawer } from './AddLeadDrawer';
import { ConvertLeadModal } from './ConvertLeadModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  LayoutList, 
  Kanban, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Building2, 
  UserCheck, 
  DollarSign, 
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  Trash2
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const LeadsList: React.FC = () => {
  const { 
    leads, 
    employees, 
    navigateTo, 
    updateLead, 
    deleteLead, 
    addToast 
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  // Quick stats
  const stats = useMemo(() => {
    const total = leads.length;
    const active = leads.filter(l => l.stage !== 'won' && l.stage !== 'lost').length;
    const won = leads.filter(l => l.stage === 'won').length;
    const totalValue = leads
      .filter(l => l.stage !== 'lost')
      .reduce((acc, curr) => acc + (curr.value || curr.budget || 0), 0);
    return { total, active, won, totalValue };
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.requirement.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
      const matchesOwner = ownerFilter === 'all' || lead.ownerId === ownerFilter;

      return matchesSearch && matchesSource && matchesStage && matchesPriority && matchesOwner;
    });
  }, [leads, searchQuery, sourceFilter, stageFilter, priorityFilter, ownerFilter]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Source', 'Stage', 'Priority', 'Budget (INR)', 'Owner', 'Expected Close'];
    const rows = filteredLeads.map(l => [
      `"${l.name}"`,
      `"${l.companyName}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.source}"`,
      `"${l.stage}"`,
      `"${l.priority}"`,
      `"${l.budget}"`,
      `"${l.ownerName}"`,
      `"${l.expectedCloseDate}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `star_chain_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'Export Generated',
      message: `Exported ${filteredLeads.length} leads to CSV.`
    });
  };

  const getStageBadge = (stage: LeadStage) => {
    switch (stage) {
      case 'new':
        return <Badge variant="neutral">New Lead</Badge>;
      case 'contacted':
        return <Badge variant="primary">Contacted</Badge>;
      case 'qualified':
        return <Badge variant="primary">Qualified</Badge>;
      case 'proposal':
        return <Badge variant="warning">Proposal</Badge>;
      case 'negotiation':
        return <Badge variant="warning">Negotiation</Badge>;
      case 'won':
        return <Badge variant="success">Won (Client)</Badge>;
      case 'lost':
        return <Badge variant="error">Lost</Badge>;
      default:
        return <Badge variant="neutral">{stage}</Badge>;
    }
  };

  const getPriorityBadge = (priority: LeadPriority) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="error">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="neutral">Medium</Badge>;
      case 'low':
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Title & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-crm-text">Leads & Inbound Prospects</h1>
            <Badge variant="primary">{leads.length} Records</Badge>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Capture, qualify, follow up, and convert discovery inquiries into active Star Chain Labs accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddDrawerOpen(true)}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Total Discovery</div>
            <div className="text-xl font-bold text-crm-text mt-0.5">{stats.total}</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-crm-surface border border-crm-border flex items-center justify-center text-crm-textMuted">
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Active In Pipeline</div>
            <div className="text-xl font-bold text-turquoise mt-0.5">{stats.active}</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Pipeline Valuation</div>
            <div className="text-xl font-bold text-crm-text mt-0.5">₹{(stats.totalValue / 100000).toFixed(1)}L</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-crm-surface border border-crm-border flex items-center justify-center text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Won & Converted</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{stats.won}</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View Mode Toggle */}
      <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-crm-textMuted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, company, email, requirement..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-crm-surface border border-crm-border rounded-md text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center bg-crm-surface border border-crm-border rounded-md p-0.5 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors",
                  viewMode === 'table' ? "bg-crm-card text-turquoise font-medium shadow-sm" : "text-crm-textMuted hover:text-crm-text"
                )}
                title="Table View"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors",
                  viewMode === 'kanban' ? "bg-crm-card text-turquoise font-medium shadow-sm" : "text-crm-textMuted hover:text-crm-text"
                )}
                title="Stage Kanban"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Stages</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-crm-border/40 text-xs">
          <div className="text-[11px] text-crm-textMuted flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>Filters:</span>
          </div>

          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-2 py-1 bg-crm-surface border border-crm-border rounded text-xs text-crm-textSecondary focus:outline-none focus:border-turquoise"
          >
            <option value="all">All Stages</option>
            <option value="new">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won (Client)</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="px-2 py-1 bg-crm-surface border border-crm-border rounded text-xs text-crm-textSecondary focus:outline-none focus:border-turquoise"
          >
            <option value="all">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Email">Email</option>
            <option value="Cold Call">Cold Call</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2 py-1 bg-crm-surface border border-crm-border rounded text-xs text-crm-textSecondary focus:outline-none focus:border-turquoise"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={ownerFilter}
            onChange={e => setOwnerFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-crm-surface border border-crm-border rounded text-xs text-crm-textSecondary focus:outline-none focus:border-turquoise"
          >
            <option value="all">All Owners</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>

          {(searchQuery || stageFilter !== 'all' || sourceFilter !== 'all' || priorityFilter !== 'all' || ownerFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStageFilter('all');
                setSourceFilter('all');
                setPriorityFilter('all');
                setOwnerFilter('all');
              }}
              className="text-xs text-turquoise hover:underline ml-2"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-[11px] text-crm-textMuted">
            Showing <strong className="text-crm-text">{filteredLeads.length}</strong> of {leads.length} leads
          </div>
        </div>
      </div>

      {/* Main View: Table or Kanban */}
      {viewMode === 'table' ? (
        <div className="rounded-lg border border-crm-border bg-crm-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-crm-border bg-crm-surface/60 text-crm-textMuted font-medium">
                  <th className="py-2.5 px-4 font-semibold">Lead Contact & Company</th>
                  <th className="py-2.5 px-3 font-semibold">Source</th>
                  <th className="py-2.5 px-3 font-semibold">Stage</th>
                  <th className="py-2.5 px-3 font-semibold">Priority</th>
                  <th className="py-2.5 px-3 font-semibold">Deal Value</th>
                  <th className="py-2.5 px-3 font-semibold">Assigned Rep</th>
                  <th className="py-2.5 px-3 font-semibold">Next Follow-up</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crm-border/40">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-crm-textMuted">
                      No leads match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => (
                    <tr 
                      key={lead.id} 
                      className="hover:bg-crm-surface/40 transition-colors group cursor-pointer"
                      onClick={() => navigateTo(`/app/crm/leads/${lead.id}`)}
                    >
                      {/* Name & Company */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-crm-text group-hover:text-turquoise transition-colors">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-crm-textMuted flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 text-crm-textDim" />
                          <span>{lead.companyName}</span>
                          <span className="text-crm-border">•</span>
                          <span>{lead.phone}</span>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3">
                        <span className="text-xs text-crm-textSecondary px-2 py-0.5 rounded bg-crm-surface border border-crm-border/60">
                          {lead.source}
                        </span>
                      </td>

                      {/* Stage */}
                      <td className="py-3 px-3">
                        {getStageBadge(lead.stage)}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        {getPriorityBadge(lead.priority)}
                      </td>

                      {/* Budget / Value */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-crm-text">
                          ₹{((lead.value || lead.budget || 0)).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-crm-textMuted">Budget: ₹{(lead.budget || 0).toLocaleString('en-IN')}</div>
                      </td>

                      {/* Assigned Rep */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={lead.ownerName} size="xs" />
                          <span className="text-xs text-crm-textSecondary truncate max-w-[120px]">{lead.ownerName}</span>
                        </div>
                      </td>

                      {/* Next Follow-up */}
                      <td className="py-3 px-3">
                        {lead.nextFollowUpDate ? (
                          <div className="text-xs text-crm-textSecondary flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-turquoise" />
                            <span>{lead.nextFollowUpDate}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-crm-textMuted">—</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.stage !== 'won' && (
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => setConvertingLead(lead)}
                              title="Convert to Client"
                            >
                              Convert
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => navigateTo(`/app/crm/leads/${lead.id}`)}
                            title="View 360° Lead Page"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Stages Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'] as LeadStage[]).map(stg => {
            const colLeads = filteredLeads.filter(l => l.stage === stg);
            const colTotal = colLeads.reduce((acc, curr) => acc + (curr.value || curr.budget || 0), 0);

            return (
              <div key={stg} className="bg-crm-card border border-crm-border rounded-lg flex flex-col min-h-[450px]">
                {/* Stage Header */}
                <div className="p-2.5 border-b border-crm-border flex items-center justify-between bg-crm-surface/40">
                  <div>
                    <div className="text-xs font-semibold text-crm-text uppercase tracking-wider">
                      {stg}
                    </div>
                    <div className="text-[10px] text-crm-textMuted">₹{(colTotal / 100000).toFixed(1)}L • {colLeads.length} leads</div>
                  </div>
                  <Badge variant="neutral" size="sm">{colLeads.length}</Badge>
                </div>

                {/* Cards Container */}
                <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[600px]">
                  {colLeads.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => navigateTo(`/app/crm/leads/${lead.id}`)}
                      className="p-3 rounded-md bg-crm-surface border border-crm-border/70 hover:border-turquoise/50 cursor-pointer transition-all group space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-medium text-crm-text group-hover:text-turquoise transition-colors">
                          {lead.name}
                        </div>
                        {getPriorityBadge(lead.priority)}
                      </div>

                      <div className="text-[11px] text-crm-textMuted flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 text-crm-textDim flex-shrink-0" />
                        <span className="truncate">{lead.companyName}</span>
                      </div>

                      <div className="text-[11px] text-crm-textSecondary line-clamp-2 bg-crm-bg/50 p-1.5 rounded border border-crm-border/40">
                        {lead.requirement || 'No requirements captured'}
                      </div>

                      <div className="pt-2 border-t border-crm-border/40 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-crm-text">
                          ₹{((lead.value || lead.budget || 0)).toLocaleString('en-IN')}
                        </span>
                        <div className="flex items-center gap-1 text-crm-textMuted">
                          <Avatar name={lead.ownerName} size="xs" />
                        </div>
                      </div>

                      {stg !== 'won' && (
                        <div className="pt-1.5 flex items-center justify-end" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setConvertingLead(lead)}
                            className="text-[10px] font-medium text-turquoise hover:underline flex items-center gap-1"
                          >
                            <span>Convert</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {colLeads.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-crm-textDim border border-dashed border-crm-border/50 rounded-md">
                      No leads in {stg}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawers & Modals */}
      <AddLeadDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onSuccess={(id) => navigateTo(`/app/crm/leads/${id}`)}
      />

      {convertingLead && (
        <ConvertLeadModal
          isOpen={Boolean(convertingLead)}
          onClose={() => setConvertingLead(null)}
          lead={convertingLead}
          onSuccess={(companyId) => {
            if (companyId) {
              navigateTo(`/app/crm/companies/${companyId}`);
            }
          }}
        />
      )}
    </div>
  );
};
