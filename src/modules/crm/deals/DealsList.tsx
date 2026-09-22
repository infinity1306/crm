import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Deal, DealStage } from '../../../types/crm';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { AddDealModal } from './AddDealModal';
import { 
  Briefcase, 
  Search, 
  Plus, 
  DollarSign, 
  Building2, 
  TrendingUp, 
  Calendar, 
  Kanban,
  CheckCircle2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const DealsList: React.FC = () => {
  const { deals, companies, employees, navigateTo, updateDealStage, addToast } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Financial Metrics
  const stats = useMemo(() => {
    const totalPipeline = deals
      .filter(d => d.stage !== 'lost')
      .reduce((acc, d) => acc + d.value, 0);

    const weightedPipeline = deals
      .filter(d => d.stage !== 'lost' && d.stage !== 'won')
      .reduce((acc, d) => acc + (d.value * (d.probability / 100)), 0);

    const wonValue = deals
      .filter(d => d.stage === 'won')
      .reduce((acc, d) => acc + d.value, 0);

    const closedCount = deals.filter(d => d.stage === 'won' || d.stage === 'lost').length;
    const wonCount = deals.filter(d => d.stage === 'won').length;
    const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 65;

    return { totalPipeline, weightedPipeline, wonValue, winRate };
  }, [deals]);

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchesSearch = 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.primaryContactName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage = stageFilter === 'all' || d.stage === stageFilter;
      const matchesOwner = ownerFilter === 'all' || d.ownerId === ownerFilter;

      return matchesSearch && matchesStage && matchesOwner;
    });
  }, [deals, searchQuery, stageFilter, ownerFilter]);

  const getStageBadge = (stage: DealStage) => {
    switch (stage) {
      case 'new': return <Badge variant="neutral">New Deal</Badge>;
      case 'qualified': return <Badge variant="primary">Qualified</Badge>;
      case 'proposal': return <Badge variant="warning">Proposal</Badge>;
      case 'negotiation': return <Badge variant="warning">Negotiation</Badge>;
      case 'won': return <Badge variant="success">Closed Won</Badge>;
      case 'lost': return <Badge variant="error">Closed Lost</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-crm-text">Deals & Opportunities</h1>
            <Badge variant="primary">{deals.length} Active</Badge>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Active enterprise contract opportunities, pipeline probability valuations, and close projections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Kanban className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/app/sales/pipeline')}
          >
            Pipeline Board
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Create Deal
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Pipeline Volume</div>
            <div className="text-xl font-bold text-crm-text mt-0.5">₹{(stats.totalPipeline / 100000).toFixed(1)}L</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-crm-surface border border-crm-border flex items-center justify-center text-crm-textMuted">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Weighted Forecast</div>
            <div className="text-xl font-bold text-turquoise mt-0.5">₹{(stats.weightedPipeline / 100000).toFixed(1)}L</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Realized Won Value</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">₹{(stats.wonValue / 100000).toFixed(1)}L</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Sales Win Rate</div>
            <div className="text-xl font-bold text-crm-text mt-0.5">{stats.winRate}%</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-crm-surface border border-crm-border flex items-center justify-center text-turquoise">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-crm-textMuted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search deals by title, company, stakeholder..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-crm-surface border border-crm-border rounded-md text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-crm-surface border border-crm-border rounded text-xs text-crm-textSecondary focus:outline-none focus:border-turquoise"
          >
            <option value="all">All Stages</option>
            <option value="new">New Deal</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Closed Won</option>
            <option value="lost">Closed Lost</option>
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

          {(searchQuery || stageFilter !== 'all' || ownerFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStageFilter('all');
                setOwnerFilter('all');
              }}
              className="text-xs text-turquoise hover:underline ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Deals Table */}
      <div className="rounded-lg border border-crm-border bg-crm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-crm-border bg-crm-surface/60 text-crm-textMuted font-medium">
                <th className="py-2.5 px-4 font-semibold">Deal Title & Company</th>
                <th className="py-2.5 px-3 font-semibold">Stage</th>
                <th className="py-2.5 px-3 font-semibold">Probability</th>
                <th className="py-2.5 px-3 font-semibold">Deal Value</th>
                <th className="py-2.5 px-3 font-semibold">Stakeholder</th>
                <th className="py-2.5 px-3 font-semibold">Expected Close</th>
                <th className="py-2.5 px-3 font-semibold">Owner</th>
                <th className="py-2.5 px-4 text-right font-semibold">Advance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-border/40">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-crm-textMuted">
                    No deals match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredDeals.map(deal => (
                  <tr key={deal.id} className="hover:bg-crm-surface/40 transition-colors">
                    {/* Title & Company */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-crm-text hover:text-turquoise cursor-pointer" onClick={() => navigateTo(`/app/crm/companies/${deal.companyId}`)}>
                        {deal.name}
                      </div>
                      <div className="text-[11px] text-crm-textMuted flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-crm-textDim" />
                        <span>{deal.companyName}</span>
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="py-3 px-3">
                      {getStageBadge(deal.stage)}
                    </td>

                    {/* Probability */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-crm-surface rounded-full h-1.5 border border-crm-border overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              deal.probability >= 70 ? "bg-emerald-400" : deal.probability >= 40 ? "bg-turquoise" : "bg-amber-400"
                            )}
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-crm-textSecondary">{deal.probability}%</span>
                      </div>
                    </td>

                    {/* Deal Value */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-turquoise text-sm">
                        ₹{deal.value.toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Primary Contact */}
                    <td className="py-3 px-3">
                      <span className="text-crm-text">{deal.primaryContactName}</span>
                    </td>

                    {/* Expected Close */}
                    <td className="py-3 px-3">
                      <div className="text-crm-textSecondary flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-crm-textMuted" />
                        <span>{deal.expectedCloseDate}</span>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={deal.ownerName} size="xs" />
                        <span className="text-xs text-crm-textSecondary truncate max-w-[110px]">{deal.ownerName}</span>
                      </div>
                    </td>

                    {/* Advance Stage dropdown */}
                    <td className="py-3 px-4 text-right">
                      <select
                        value={deal.stage}
                        onChange={e => {
                          const newStage = e.target.value as DealStage;
                          updateDealStage(deal.id, newStage);
                          addToast({
                            type: 'info',
                            title: 'Deal Advanced',
                            message: `${deal.name} moved to ${newStage.toUpperCase()}`
                          });
                        }}
                        className="px-2 py-1 bg-crm-surface border border-crm-border rounded text-[11px] text-crm-textSecondary focus:outline-none focus:border-turquoise"
                      >
                        <option value="new">New</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal">Proposal</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddDealModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
