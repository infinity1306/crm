import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { MetricCardWidget, MetricItem } from '../widgets/MetricCardWidget';
import { PipelineFunnelWidget } from '../widgets/PipelineFunnelWidget';
import { ActivityFeedWidget } from '../widgets/ActivityFeedWidget';
import { PersonalAttendanceWidget } from '../widgets/PersonalAttendanceWidget';
import { WidgetContainer } from '../components/WidgetContainer';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { WidgetId } from '../types';
import { 
  Users, 
  Target, 
  Calendar, 
  Clock, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  ChevronRight 
} from 'lucide-react';

interface SalesManagerDashboardProps {
  enabledWidgets: WidgetId[];
}

export const SalesManagerDashboard: React.FC<SalesManagerDashboardProps> = ({ enabledWidgets }) => {
  const { 
    employees, 
    deals, 
    leads, 
    meetings, 
    followUps, 
    financeMetrics, 
    navigateTo 
  } = useCRM();

  const isEnabled = (id: WidgetId) => enabledWidgets.includes(id);

  // Dynamic sales team metrics and reps data
  const salesEmployees = employees.filter(e => e.department === 'Sales' || e.role === 'employee');
  const repsData = salesEmployees.map(rep => {
    const repLeads = leads.filter(l => l.ownerId === rep.id);
    const repMeetings = meetings.filter(m => m.hostEmployeeId === rep.id || m.salesEmployeeId === rep.id);
    const repFollowUps = followUps.filter(f => f.assignedToId === rep.id);
    const repDeals = deals.filter(d => d.ownerId === rep.id);
    const repWonDeals = repDeals.filter(d => d.stage === 'won');
    const repProposals = repDeals.filter(d => d.stage === 'proposal');
    const repRevenue = repWonDeals.reduce((s, d) => s + (d.value || 0), 0);

    return {
      id: rep.id,
      name: rep.name,
      role: rep.designation || 'Sales Representative',
      leads: repLeads.length,
      meetings: repMeetings.length,
      followUps: repFollowUps.length,
      qualified: repLeads.filter(l => l.stage === 'qualified').length,
      proposals: repProposals.length,
      won: repWonDeals.length,
      revenue: repRevenue
    };
  });

  const activePipelineVal = deals.filter(d => d.stage !== 'lost').reduce((s, d) => s + (d.value || 0), 0);
  const totalWonRevenue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + (d.value || 0), 0);
  const proposalsInPlay = deals.filter(d => d.stage === 'proposal').length;
  const dealsWonCount = deals.filter(d => d.stage === 'won').length;

  const salesManagerMetrics: MetricItem[] = [
    { id: 'team-leads', label: 'Team Inbound Leads', value: `${leads.length}`, change: `${leads.length > 0 ? '+100%' : '0'}`, isPositive: true, icon: Users, onClick: () => navigateTo('/app/crm/leads') },
    { id: 'team-meetings', label: 'Team Meetings', value: `${meetings.length}`, context: 'Recorded client demos', icon: Calendar, onClick: () => navigateTo('/app/sales/meetings') },
    { id: 'team-fu', label: 'Follow-ups Completed', value: `${followUps.length}`, context: 'Pipeline touchpoints', icon: Clock, onClick: () => navigateTo('/app/sales/activities') },
    { id: 'team-proposals', label: 'Proposals In Play', value: `${proposalsInPlay}`, context: 'Active proposals', icon: FileText, onClick: () => navigateTo('/app/sales/pipeline') },
    { id: 'team-conversions', label: 'Deals Won', value: `${dealsWonCount}`, change: `${dealsWonCount > 0 ? 'Active conversions' : 'Awaiting close'}`, isPositive: dealsWonCount > 0, icon: TrendingUp, onClick: () => navigateTo('/app/sales/pipeline') },
    { id: 'team-pipeline', label: 'Total Sales Pipeline', value: `$${(activePipelineVal / 1000).toFixed(0)}k`, context: `Across ${deals.length} deals`, icon: DollarSign, onClick: () => navigateTo('/app/sales/pipeline') },
    { id: 'team-rev', label: 'Closed Team Revenue', value: `$${(totalWonRevenue / 1000).toFixed(0)}k`, context: 'Total settled revenue', icon: Target, onClick: () => navigateTo('/app/sales/overview') }
  ];

  const stagnantDeals = deals.filter(d => d.stage === 'proposal' || d.stage === 'negotiation').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Attendance Clock & Shift Timer */}
      {isEnabled('personal_attendance') && (
        <PersonalAttendanceWidget />
      )}

      {/* Primary Metrics Grid */}
      {isEnabled('sales_metrics') && (
        <MetricCardWidget metrics={salesManagerMetrics} columns={4} />
      )}

      {/* Team Sales Leaderboard Table */}
      {isEnabled('team_sales_table') && (
        <WidgetContainer
          title="Team Sales Leaderboard & Activity Matrix"
          subtitle="Direct sales output per Account Executive"
          badge={`${repsData.length} Reps Registered`}
          action={
            <button
              onClick={() => navigateTo('/app/sales/overview')}
              className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
            >
              Sales Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          {repsData.length === 0 ? (
            <div className="py-8 text-center text-xs text-crm-textMuted">
              No sales representatives registered in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-crm-border/60 text-[10px] uppercase font-bold text-crm-textMuted tracking-wider">
                    <th className="pb-2.5 font-semibold">Account Exec</th>
                    <th className="pb-2.5 font-semibold text-center">Leads</th>
                    <th className="pb-2.5 font-semibold text-center">Meetings</th>
                    <th className="pb-2.5 font-semibold text-center">Follow-ups</th>
                    <th className="pb-2.5 font-semibold text-center">Proposals</th>
                    <th className="pb-2.5 font-semibold text-center">Conversions</th>
                    <th className="pb-2.5 font-semibold text-right">Revenue Won</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-crm-border/30">
                  {repsData.map(rep => (
                    <tr 
                      key={rep.id}
                      onClick={() => navigateTo(`/app/team/${rep.id}`)}
                      className="hover:bg-crm-surfaceHover/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={rep.name} size="sm" />
                          <div>
                            <p className="font-semibold text-crm-text truncate">{rep.name}</p>
                            <p className="text-[10px] text-crm-textMuted">{rep.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-center font-mono text-crm-text">{rep.leads}</td>
                      <td className="py-2.5 text-center font-mono text-crm-text">{rep.meetings}</td>
                      <td className="py-2.5 text-center font-mono text-crm-text">{rep.followUps}</td>
                      <td className="py-2.5 text-center font-mono text-turquoise">{rep.proposals}</td>
                      <td className="py-2.5 text-center font-mono text-emerald-400 font-bold">{rep.won}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                        ${(rep.revenue / 1000).toFixed(0)}k
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WidgetContainer>
      )}

      {/* Pipeline Health & Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isEnabled('pipeline_health') && (
          <PipelineFunnelWidget title="Organization Sales Pipeline Stages" scope="all_deals" />
        )}

        {isEnabled('pipeline_health') && (
          <WidgetContainer
            title="Pipeline Health & Stagnant Deals Warning"
            subtitle="Deals with zero recorded activity in >7 business days"
            badge={`${stagnantDeals.length} Flagged`}
            badgeType={stagnantDeals.length > 0 ? "warning" : "neutral"}
          >
            {stagnantDeals.length === 0 ? (
              <div className="py-6 text-center text-xs text-crm-textMuted">
                No stagnant deals detected. Sales pipeline is healthy.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {stagnantDeals.map(deal => (
                  <div key={deal.id} className="p-3 bg-crm-surface border border-crm-border/60 rounded flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-crm-text">{deal.name}</p>
                      <p className="text-[10px] text-crm-textMuted">{deal.companyName || 'Enterprise Account'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400">${(deal.value || 0).toLocaleString()}</span>
                      <p className="text-[10px] text-red-400">{deal.stage.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </WidgetContainer>
        )}
      </div>

      {/* Sales Activity Timeline */}
      {isEnabled('sales_activity') && (
        <ActivityFeedWidget title="Team Sales Touchpoint Feed" filterScope="sales" maxEvents={5} />
      )}
    </div>
  );
};
