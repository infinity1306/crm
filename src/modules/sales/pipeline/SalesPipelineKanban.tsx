import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Deal, DealStage } from '../../../types/crm';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { AddDealModal } from '../../crm/deals/AddDealModal';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  IndianRupee, 
  Plus, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  XCircle,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const SalesPipelineKanban: React.FC = () => {
  const { deals, updateDealStage, navigateTo, addToast } = useCRM();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('all');

  const STAGES: { id: DealStage; label: string; color: string }[] = [
    { id: 'new', label: 'New Lead', color: 'border-zinc-700' },
    { id: 'qualified', label: 'Qualified', color: 'border-blue-900/50' },
    { id: 'proposal', label: 'Proposal Sent', color: 'border-amber-900/50' },
    { id: 'negotiation', label: 'In Negotiation', color: 'border-purple-900/50' },
    { id: 'won', label: 'Closed Won', color: 'border-emerald-900/50' },
    { id: 'lost', label: 'Closed Lost', color: 'border-rose-900/50' },
  ];

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchesSearch = 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOwner = selectedOwner === 'all' || d.ownerId === selectedOwner;
      return matchesSearch && matchesOwner;
    });
  }, [deals, searchQuery, selectedOwner]);

  const metrics = useMemo(() => {
    const active = deals.filter(d => d.stage !== 'lost');
    const totalVal = active.reduce((acc, d) => acc + d.value, 0);
    const weighted = deals.filter(d => d.stage !== 'lost' && d.stage !== 'won')
      .reduce((acc, d) => acc + (d.value * (d.probability / 100)), 0);
    const avgSize = deals.length > 0 ? Math.round(totalVal / deals.length) : 0;
    return { totalVal, weighted, avgSize };
  }, [deals]);

  const handleStageMove = (dealId: string, currentStage: DealStage, direction: 'prev' | 'next') => {
    const stageIds: DealStage[] = ['new', 'qualified', 'proposal', 'negotiation', 'won'];
    const currIdx = stageIds.indexOf(currentStage);
    if (currIdx === -1) return;

    let targetIdx = direction === 'next' ? currIdx + 1 : currIdx - 1;
    if (targetIdx >= 0 && targetIdx < stageIds.length) {
      const newStage = stageIds[targetIdx];
      updateDealStage(dealId, newStage);
      addToast({
        type: 'info',
        title: 'Deal Advanced',
        message: `Opportunity moved to ${newStage.toUpperCase()}`
      });
    }
  };

  const handleMarkWon = (deal: Deal) => {
    updateDealStage(deal.id, 'won');
    addToast({
      type: 'success',
      title: 'Deal Won! 🎉',
      message: `${deal.name} for ₹${deal.value.toLocaleString('en-IN')} marked as Closed Won.`
    });
  };

  const handleMarkLost = (deal: Deal) => {
    const reason = prompt('Please enter the reason for closing as lost (optional):') || 'Budget constraints';
    updateDealStage(deal.id, 'lost', reason);
    addToast({
      type: 'info',
      title: 'Deal Closed Lost',
      message: `${deal.name} moved to Closed Lost.`
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-crm-text">Sales Pipeline Kanban</h1>
            <Badge variant="primary">{deals.length} Deals</Badge>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Real-time visual opportunity lifecycle tracking from qualification through signature.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateTo('/app/crm/deals')}
          >
            Table View
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            New Deal
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Pipeline Volume</div>
            <div className="text-xl font-bold text-crm-text mt-0.5">₹{(metrics.totalVal / 100000).toFixed(1)}L</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-crm-surface border border-crm-border flex items-center justify-center text-crm-textMuted">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Weighted Forecast</div>
            <div className="text-xl font-bold text-turquoise mt-0.5">₹{(metrics.weighted / 100000).toFixed(1)}L</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Average Deal Size</div>
            <div className="text-xl font-bold text-crm-text mt-0.5">₹{(metrics.avgSize / 100000).toFixed(1)}L</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-crm-surface border border-crm-border flex items-center justify-center text-crm-textMuted">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Active Pipeline Count</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{deals.filter(d => d.stage !== 'lost').length}</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 min-h-[580px] overflow-x-auto pb-4">
        {STAGES.map(col => {
          const colDeals = filteredDeals.filter(d => d.stage === col.id);
          const colTotal = colDeals.reduce((acc, d) => acc + d.value, 0);

          return (
            <div
              key={col.id}
              className={cn(
                "bg-crm-card border rounded-lg flex flex-col min-w-[240px]",
                col.color
              )}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-crm-border flex items-center justify-between bg-crm-surface/50">
                <div>
                  <div className="text-xs font-semibold text-crm-text uppercase tracking-wider">
                    {col.label}
                  </div>
                  <div className="text-[10px] text-crm-textMuted font-mono mt-0.5">
                    ₹{(colTotal / 100000).toFixed(1)}L • {colDeals.length}
                  </div>
                </div>
                <Badge variant={col.id === 'won' ? 'success' : col.id === 'lost' ? 'error' : 'neutral'} size="sm">
                  {colDeals.length}
                </Badge>
              </div>

              {/* Deals in Column */}
              <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[640px]">
                {colDeals.map(deal => (
                  <div
                    key={deal.id}
                    className="p-3 rounded-md bg-crm-surface border border-crm-border hover:border-turquoise/50 transition-all group space-y-2 text-xs"
                  >
                    {/* Title */}
                    <div className="font-medium text-crm-text group-hover:text-turquoise transition-colors leading-snug">
                      {deal.name}
                    </div>

                    {/* Company */}
                    <div
                      onClick={() => navigateTo(`/app/crm/companies/${deal.companyId}`)}
                      className="text-[11px] text-crm-textMuted hover:text-crm-text flex items-center gap-1 cursor-pointer truncate"
                    >
                      <Building2 className="w-3 h-3 text-crm-textDim flex-shrink-0" />
                      <span className="truncate">{deal.companyName}</span>
                    </div>

                    {/* Commercials & Probability */}
                    <div className="pt-1.5 border-t border-crm-border/40 flex items-center justify-between">
                      <div className="font-bold text-turquoise">
                        ₹{deal.value.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] font-mono text-crm-textMuted">{deal.probability}% Win</span>
                    </div>

                    {/* Probability line */}
                    <div className="w-full bg-crm-bg rounded-full h-1 border border-crm-border/50 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          deal.probability >= 70 ? "bg-emerald-400" : deal.probability >= 40 ? "bg-turquoise" : "bg-amber-400"
                        )}
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>

                    {/* Metadata footer */}
                    <div className="pt-1 flex items-center justify-between text-[10px] text-crm-textMuted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-crm-textDim" />
                        <span>{deal.expectedCloseDate}</span>
                      </div>
                      <Avatar name={deal.ownerName} size="xs" />
                    </div>

                    {/* Stage Transition Action Buttons */}
                    <div className="pt-2 border-t border-crm-border/40 flex items-center justify-between text-[11px]">
                      {col.id !== 'new' && col.id !== 'won' && col.id !== 'lost' ? (
                        <button
                          onClick={() => handleStageMove(deal.id, deal.stage, 'prev')}
                          className="p-1 rounded text-crm-textMuted hover:text-crm-text hover:bg-crm-bg transition-colors"
                          title="Move to Previous Stage"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      ) : <span />}

                      <div className="flex items-center gap-1.5">
                        {deal.stage !== 'won' && (
                          <button
                            onClick={() => handleMarkWon(deal)}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                            title="Mark as Won"
                          >
                            Won
                          </button>
                        )}
                        {deal.stage !== 'lost' && (
                          <button
                            onClick={() => handleMarkLost(deal)}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                            title="Mark as Lost"
                          >
                            Lost
                          </button>
                        )}
                      </div>

                      {col.id !== 'won' && col.id !== 'lost' && (
                        <button
                          onClick={() => handleStageMove(deal.id, deal.stage, 'next')}
                          className="p-1 rounded text-crm-textMuted hover:text-turquoise hover:bg-crm-bg transition-colors"
                          title="Advance to Next Stage"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colDeals.length === 0 && (
                  <div className="text-center py-10 text-[11px] text-crm-textDim border border-dashed border-crm-border/50 rounded-md">
                    No deals in {col.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddDealModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
