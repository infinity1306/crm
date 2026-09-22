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

  // Primary Sales Manager Metrics (7 cards as requested in Section 7)
  const activePipelineVal = deals.filter(d => d.stage !== 'lost').reduce((s, d) => s + d.value, 0) || 260000;
  const salesManagerMetrics: MetricItem[] = [
    { id: 'team-leads', label: 'Team Inbound Leads', value: `${leads.length}`, change: '+12 this week', isPositive: true, icon: Users, onClick: () => navigateTo('/app/crm/leads') },
    { id: 'team-meetings', label: 'Team Meetings', value: '32', context: '8 scheduled this week', icon: Calendar, onClick: () => navigateTo('/app/sales/meetings') },
    { id: 'team-fu', label: 'Follow-ups Completed', value: '76', context: '14 due today', icon: Clock, onClick: () => navigateTo('/app/sales/activities') },
    { id: 'team-proposals', label: 'Proposals In Play', value: '18', context: '$148k total ask', icon: FileText, onClick: () => navigateTo('/app/sales/pipeline') },
    { id: 'team-conversions', label: 'Deals Won (Q3)', value: '7', change: '+2 vs last mo', isPositive: true, icon: TrendingUp, onClick: () => navigateTo('/app/sales/pipeline') },
    { id: 'team-pipeline', label: 'Total Sales Pipeline', value: `$${(activePipelineVal / 1000).toFixed(0)}k`, context: `Across ${deals.length} deals`, icon: DollarSign, onClick: () => navigateTo('/app/sales/pipeline') },
    { id: 'team-rev', label: 'Closed Team Revenue', value: `$142k`, context: 'Target: $200k (71%)', icon: Target, onClick: () => navigateTo('/app/sales/overview') }
  ];

  // Team Sales Table matching the prompt Section 7 format:
  // Employee | Leads | Meetings | Follow-ups | Proposals | Conversions | Revenue
  const repsData = [
    { id: 'emp-2', name: 'Shivanshu Sharma', role: 'Sales Lead', leads: 28, meetings: 20, followUps: 46, qualified: 8, proposals: 5, won: 2, revenue: 68000 },
    { id: 'emp-8', name: 'Ayesha Khan', role: 'Sr Account Exec', leads: 32, meetings: 18, followUps: 38, qualified: 10, proposals: 7, won: 3, revenue: 54000 },
    { id: 'emp-13', name: 'Rajesh Gupta', role: 'Growth Lead', leads: 24, meetings: 12, followUps: 22, qualified: 6, proposals: 4, won: 2, revenue: 20000 }
  ];

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
          badge="3 Reps Active"
          action={
            <button
              onClick={() => navigateTo('/app/sales/overview')}
              className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
            >
              Sales Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        >
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
            badge="3 Stagnant"
            badgeType="warning"
          >
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-crm-surface border border-crm-border/60 rounded flex items-center justify-between">
                <div>
                  <p className="font-semibold text-crm-text">Fintech Core Engine Demo</p>
                  <p className="text-[10px] text-crm-textMuted">ABC Technologies · Rep: Shivanshu Sharma</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-400">$65,000</span>
                  <p className="text-[10px] text-red-400">Stalled 11 days</p>
                </div>
              </div>

              <div className="p-3 bg-crm-surface border border-crm-border/60 rounded flex items-center justify-between">
                <div>
                  <p className="font-semibold text-crm-text">Enterprise Analytics Platform</p>
                  <p className="text-[10px] text-crm-textMuted">Krypton Systems · Rep: Ayesha Khan</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-400">$42,000</span>
                  <p className="text-[10px] text-red-400">Stalled 8 days</p>
                </div>
              </div>

              <div className="p-3 bg-crm-surface border border-crm-border/60 rounded flex items-center justify-between">
                <div>
                  <p className="font-semibold text-crm-text">Security Smart Contract Audit</p>
                  <p className="text-[10px] text-crm-textMuted">Vertex Labs · Rep: Rajesh Gupta</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-400">$28,000</span>
                  <p className="text-[10px] text-red-400">Stalled 14 days</p>
                </div>
              </div>
            </div>
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
