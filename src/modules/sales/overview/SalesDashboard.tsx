import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { 
  BarChart3, 
  TrendingUp, 
  IndianRupee, 
  Briefcase, 
  Target, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Kanban,
  Award,
  Clock
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { formatINR } from '../../../utils/indianNumberSystem';

export const SalesDashboard: React.FC = () => {
  const { leads, deals, salesMetrics, navigateTo } = useCRM();

  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'ytd'>('quarter');

  // Aggregated Sales KPIs
  const pipelineMetrics = useMemo(() => {
    const totalPipeline = deals
      .filter(d => d.stage !== 'lost')
      .reduce((acc, d) => acc + d.value, 0);

    const wonValue = deals
      .filter(d => d.stage === 'won')
      .reduce((acc, d) => acc + d.value, 0);

    const weighted = deals
      .filter(d => d.stage !== 'lost' && d.stage !== 'won')
      .reduce((acc, d) => acc + (d.value * (d.probability / 100)), 0);

    const targetRevenue = 5000000; // ₹50L target for the quarter
    const achievementPercent = Math.round((wonValue / targetRevenue) * 100);

    return { totalPipeline, wonValue, weighted, targetRevenue, achievementPercent };
  }, [deals]);

  // Sales Funnel Data
  const funnel = useMemo(() => {
    const totalLeads = leads.length;
    const contacted = leads.filter(l => l.stage !== 'new').length;
    const qualified = leads.filter(l => ['qualified', 'proposal', 'negotiation', 'won'].includes(l.stage)).length;
    const proposal = deals.filter(d => ['proposal', 'negotiation', 'won'].includes(d.stage)).length;
    const won = deals.filter(d => d.stage === 'won').length;

    return [
      { label: 'Discovery Leads', count: totalLeads, rate: '100%' },
      { label: 'Contacted', count: contacted, rate: `${totalLeads > 0 ? Math.round((contacted/totalLeads)*100) : 0}%` },
      { label: 'Qualified Opportunities', count: qualified, rate: `${contacted > 0 ? Math.round((qualified/contacted)*100) : 0}%` },
      { label: 'Proposals Dispatched', count: proposal, rate: `${qualified > 0 ? Math.round((proposal/qualified)*100) : 0}%` },
      { label: 'Closed Won Contracts', count: won, rate: `${proposal > 0 ? Math.round((won/proposal)*100) : 0}%` },
    ];
  }, [leads, deals]);

  // Source Distribution
  const sourceStats = useMemo(() => {
    const map: Record<string, { count: number; totalVal: number }> = {};
    leads.forEach(l => {
      if (!map[l.source]) map[l.source] = { count: 0, totalVal: 0 };
      map[l.source].count += 1;
      map[l.source].totalVal += (l.value || l.budget || 0);
    });
    return Object.entries(map).map(([source, data]) => ({
      source,
      count: data.count,
      val: data.totalVal
    })).sort((a, b) => b.val - a.val);
  }, [leads]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-crm-text">Sales Overview & Commercial Analytics</h1>
            <Badge variant="primary">Q3 Fiscal 2026</Badge>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Quarterly revenue pacing, pipeline stage conversions, lead acquisition channels, and rep productivity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-crm-card border border-crm-border rounded-md p-0.5 text-xs">
            {(['month', 'quarter', 'ytd'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={cn(
                  "px-3 py-1 rounded transition-colors uppercase text-[10px] font-mono",
                  timeRange === t ? "bg-turquoise text-crm-bg font-bold" : "text-crm-textSecondary hover:text-crm-text"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Kanban className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/app/sales/pipeline')}
          >
            Pipeline Board
          </Button>
        </div>
      </div>

      {/* Primary Revenue Target Progress Hero Card */}
      <div className="p-5 rounded-lg bg-crm-card border border-crm-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-crm-textMuted">
              Q3 Contracted Target Realization
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-extrabold text-crm-text">
                ₹{(pipelineMetrics.wonValue / 100000).toFixed(1)}L
              </span>
              <span className="text-xs text-crm-textMuted">
                of ₹{(pipelineMetrics.targetRevenue / 100000).toFixed(0)}L Goal
              </span>
              <Badge variant="success" size="sm">
                {pipelineMetrics.achievementPercent}% Attained
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-crm-border pt-3 md:pt-0 md:pl-6 text-xs">
            <div>
              <div className="text-[11px] text-crm-textMuted font-mono">Weighted Pipeline</div>
              <div className="text-base font-bold text-turquoise mt-0.5">
                ₹{(pipelineMetrics.weighted / 100000).toFixed(1)}L
              </div>
            </div>
            <div>
              <div className="text-[11px] text-crm-textMuted font-mono">Total Volume in Play</div>
              <div className="text-base font-bold text-crm-text mt-0.5">
                ₹{(pipelineMetrics.totalPipeline / 100000).toFixed(1)}L
              </div>
            </div>
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-crm-surface rounded-full h-2.5 border border-crm-border/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-turquoise transition-all duration-500"
              style={{ width: `${Math.min(pipelineMetrics.achievementPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-crm-textMuted font-mono">
            <span>₹0L</span>
            <span>Target: ₹50.0L</span>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Sales Funnel & Source Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <div className="p-4 rounded-lg bg-crm-card border border-crm-border space-y-4">
          <div className="flex items-center justify-between border-b border-crm-border/60 pb-2">
            <div className="font-semibold text-xs text-crm-text uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-turquoise" />
              <span>Full-Funnel Stage Conversion</span>
            </div>
            <span className="text-[11px] text-crm-textMuted font-mono">Step-Through Velocity</span>
          </div>

          <div className="space-y-3">
            {funnel.map((step, idx) => (
              <div key={step.label} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-crm-surface border border-crm-border flex items-center justify-center text-[10px] font-mono text-crm-textMuted">
                      {idx + 1}
                    </span>
                    <span className="text-crm-text font-medium">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-crm-text">{step.count}</span>
                    <span className="text-turquoise text-[11px] font-semibold">{step.rate}</span>
                  </div>
                </div>
                <div className="w-full bg-crm-surface rounded-full h-1.5 border border-crm-border/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-turquoise/70"
                    style={{ width: `${Math.max(15, 100 - (idx * 18))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Source Yield */}
        <div className="p-4 rounded-lg bg-crm-card border border-crm-border space-y-4">
          <div className="flex items-center justify-between border-b border-crm-border/60 pb-2">
            <div className="font-semibold text-xs text-crm-text uppercase tracking-wider flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-turquoise" />
              <span>Acquisition Channel Performance</span>
            </div>
            <span className="text-[11px] text-crm-textMuted font-mono">Pipeline Valuation</span>
          </div>

          <div className="space-y-3">
            {sourceStats.map(s => (
              <div key={s.source} className="p-2.5 rounded bg-crm-surface/60 border border-crm-border/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-crm-text">{s.source}</div>
                  <div className="text-[11px] text-crm-textMuted">{s.count} Leads captured</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-turquoise">₹{(s.val / 100000).toFixed(1)}L</div>
                  <div className="text-[10px] text-crm-textMuted">
                    Avg: {formatINR(s.count > 0 ? (s.val / s.count) : 0, { compact: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Executive Productivity Scoreboard */}
      <div className="p-4 rounded-lg bg-crm-card border border-crm-border space-y-4">
        <div className="flex items-center justify-between border-b border-crm-border/60 pb-2">
          <div className="font-semibold text-xs text-crm-text uppercase tracking-wider flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-turquoise" />
            <span>Account Executive Performance Scoreboard</span>
          </div>
          <span className="text-[11px] text-crm-textMuted font-mono">Quarterly Quota Status</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-crm-border text-crm-textMuted font-medium">
                <th className="py-2.5 px-3 font-semibold">Sales Representative</th>
                <th className="py-2.5 px-3 font-semibold">Target Quota</th>
                <th className="py-2.5 px-3 font-semibold">Closed Won</th>
                <th className="py-2.5 px-3 font-semibold">Attainment %</th>
                <th className="py-2.5 px-3 font-semibold">Deals Closed</th>
                <th className="py-2.5 px-3 font-semibold">Discovery Calls</th>
                <th className="py-2.5 px-3 font-semibold">Live Demos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-border/40">
              {salesMetrics.map(rep => {
                const targetQuota = rep.revenue.target;
                const wonRevenue = rep.revenue.actual;
                const attainment = Math.round((wonRevenue / targetQuota) * 100);

                return (
                  <tr key={rep.employeeId} className="hover:bg-crm-surface/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={rep.employeeName} size="xs" />
                        <div>
                          <div className="font-semibold text-crm-text">{rep.employeeName}</div>
                          <div className="text-[10px] text-crm-textMuted">{rep.role}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-crm-textSecondary font-mono">
                        ₹{(targetQuota / 100000).toFixed(1)}L
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-turquoise font-mono">
                        ₹{(wonRevenue / 100000).toFixed(1)}L
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-crm-surface rounded-full h-1.5 border border-crm-border overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              attainment >= 100 ? "bg-emerald-400" : attainment >= 70 ? "bg-turquoise" : "bg-amber-400"
                            )}
                            style={{ width: `${Math.min(attainment, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-crm-text text-[11px]">{attainment}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-crm-text font-medium">{rep.conversions.actual} deals</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-crm-textSecondary">{rep.calls.actual}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-crm-textSecondary">{rep.meetings.actual}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
