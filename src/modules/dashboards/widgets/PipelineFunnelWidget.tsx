import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { WidgetContainer } from '../components/WidgetContainer';
import { DealStage } from '../../../types/crm';
import { ChevronRight, IndianRupee, Target } from 'lucide-react';
import { formatINR } from '../../../utils/indianNumberSystem';

interface PipelineFunnelWidgetProps {
  title?: string;
  scope?: 'my_deals' | 'all_deals';
}

const STAGES: { stage: DealStage; label: string; color: string }[] = [
  { stage: 'new', label: 'New Lead', color: 'bg-slate-500' },
  { stage: 'qualified', label: 'Qualified', color: 'bg-blue-500' },
  { stage: 'proposal', label: 'Proposal', color: 'bg-indigo-500' },
  { stage: 'negotiation', label: 'Negotiation', color: 'bg-amber-500' },
  { stage: 'won', label: 'Closed Won', color: 'bg-emerald-500' },
  { stage: 'lost', label: 'Closed Lost', color: 'bg-red-500' }
];

export const PipelineFunnelWidget: React.FC<PipelineFunnelWidgetProps> = ({
  title = "My Sales Pipeline",
  scope = 'my_deals'
}) => {
  const { deals, currentUser, navigateTo } = useCRM();

  const filteredDeals = scope === 'my_deals' 
    ? deals.filter(d => d.ownerId === currentUser.id)
    : deals;

  const totalValue = filteredDeals
    .filter(d => d.stage !== 'lost')
    .reduce((sum, d) => sum + d.value, 0);

  const stageBreakdown = STAGES.map(s => {
    const stageDeals = filteredDeals.filter(d => d.stage === s.stage);
    const value = stageDeals.reduce((sum, d) => sum + d.value, 0);
    return {
      ...s,
      count: stageDeals.length,
      value
    };
  });

  return (
    <WidgetContainer
      title={title}
      subtitle={`Active Pipeline: ₹${totalValue.toLocaleString('en-IN')}`}
      badge={`${filteredDeals.length} Deals`}
      action={
        <button
          onClick={() => navigateTo('/app/sales/pipeline')}
          className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
        >
          View Kanban <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {stageBreakdown.map(s => (
          <div
            key={s.stage}
            onClick={() => navigateTo('/app/sales/pipeline')}
            className="p-2.5 bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/60 hover:border-crm-borderHover rounded cursor-pointer transition-colors select-none text-center"
          >
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-crm-textMuted truncate">
                {s.label}
              </span>
            </div>
            <p className="text-sm font-mono font-bold text-crm-text">
              {s.count}
            </p>
            <p className="text-[10px] font-mono text-crm-textMuted mt-0.5">
              {formatINR(s.value, { compact: true })}
            </p>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
};
