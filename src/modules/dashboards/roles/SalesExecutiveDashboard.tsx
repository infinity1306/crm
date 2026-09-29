import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { MetricCardWidget, MetricItem } from '../widgets/MetricCardWidget';
import { PipelineFunnelWidget } from '../widgets/PipelineFunnelWidget';
import { ClientCommunicationWidget } from '../widgets/ClientCommunicationWidget';
import { ActivityFeedWidget } from '../widgets/ActivityFeedWidget';
import { PersonalAttendanceWidget } from '../widgets/PersonalAttendanceWidget';
import { WidgetContainer } from '../components/WidgetContainer';
import { WidgetId } from '../types';
import { formatINR } from '../../../utils/indianNumberSystem';
import { 
  Users, 
  Target, 
  Calendar, 
  Clock, 
  FileText, 
  TrendingUp, 
  IndianRupee, 
  CheckCircle2, 
  PhoneCall, 
  Mail, 
  ChevronRight 
} from 'lucide-react';

interface SalesExecutiveDashboardProps {
  enabledWidgets: WidgetId[];
}

export const SalesExecutiveDashboard: React.FC<SalesExecutiveDashboardProps> = ({ enabledWidgets }) => {
  const { 
    currentUser, 
    leads, 
    deals, 
    meetings, 
    followUps, 
    navigateTo 
  } = useCRM();

  const isEnabled = (id: WidgetId) => enabledWidgets.includes(id);

  const myLeads = leads.filter(l => l.ownerId === currentUser.id || !l.ownerId);
  const myDeals = deals.filter(d => d.ownerId === currentUser.id);
  const myMeetings = meetings.filter(m => m.hostEmployeeId === currentUser.id || m.salesEmployeeId === currentUser.id);
  const myFollowUps = followUps.filter(f => f.assignedToId === currentUser.id);
  const myPipelineValue = myDeals.filter(d => d.stage !== 'lost').reduce((s, d) => s + d.value, 0);
  const myWonRevenue = myDeals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0);
  const myProposals = myDeals.filter(d => d.stage === 'proposal');
  const myConversions = myDeals.filter(d => d.stage === 'won');

  // Primary Sales Metrics (8 cards as requested in Section 6)
  const qualifiedCount = myLeads.filter(l => l.stage === 'qualified').length;
  const qualRate = myLeads.length > 0 ? Math.round((qualifiedCount / myLeads.length) * 100) : 0;
  const salesMetrics: MetricItem[] = [
    { id: 'my-leads', label: 'My Leads', value: `${myLeads.length}`, change: `${myLeads.length > 0 ? '+100%' : '0'}`, isPositive: true, icon: Users, onClick: () => navigateTo('/app/crm/leads') },
    { id: 'qualified', label: 'Qualified Leads', value: `${qualifiedCount}`, change: `${qualRate}% rate`, isPositive: true, icon: Target, onClick: () => navigateTo('/app/crm/leads') },
    { id: 'meetings-count', label: 'Meetings Booked', value: `${myMeetings.length}`, context: 'Recorded client syncs', icon: Calendar, onClick: () => navigateTo('/app/sales/meetings') },
    { id: 'follow-ups-count', label: 'Follow-ups Queued', value: `${myFollowUps.length}`, context: 'Pending touchpoints', isPositive: myFollowUps.length === 0, icon: Clock, onClick: () => navigateTo('/app/sales/activities') },
    { id: 'proposals', label: 'Sent Proposals', value: `${myProposals.length}`, context: `${formatINR(myProposals.reduce((s, d) => s + d.value, 0), { compact: true })} total value`, icon: FileText, onClick: () => navigateTo('/app/sales/pipeline') },
    { id: 'conversions', label: 'Conversions (Won)', value: `${myConversions.length}`, change: `${myConversions.length > 0 ? 'Active conversion' : 'In pipeline'}`, isPositive: true, icon: TrendingUp, onClick: () => navigateTo('/app/sales/pipeline') },
    { id: 'pipeline-value', label: 'My Pipeline Value', value: formatINR(myPipelineValue, { compact: true }), context: 'Active negotiations', icon: IndianRupee, onClick: () => navigateTo('/app/sales/pipeline') },
    { id: 'revenue-actual', label: 'Closed Revenue', value: formatINR(myWonRevenue, { compact: true }), context: 'Won revenue', icon: CheckCircle2, onClick: () => navigateTo('/app/sales/overview') }
  ];

  const todayMeetings = meetings.filter(m => m.date === '2026-09-21' || m.status === 'scheduled').slice(0, 3);
  const todayFollowUps = followUps.filter(f => f.status !== 'completed').slice(0, 3);

  // Performance Target vs Actual comparison
  const targets = [
    { label: 'Meetings Held', target: 10, actual: myMeetings.length, unit: '' },
    { label: 'Qualified Leads', target: 10, actual: qualifiedCount, unit: '' },
    { label: 'Proposals Submitted', target: 5, actual: myProposals.length, unit: '' },
    { label: 'Deals Won', target: 3, actual: myConversions.length, unit: '' },
    { label: 'Revenue Quota', target: 500000, actual: myWonRevenue, unit: '₹' }
  ];

  return (
    <div className="space-y-6">
      {/* Attendance Clock & Shift Timer */}
      {isEnabled('personal_attendance') && (
        <PersonalAttendanceWidget />
      )}

      {/* 8 Primary Sales Metrics */}
      {isEnabled('sales_metrics') && (
        <MetricCardWidget metrics={salesMetrics} columns={4} />
      )}

      {/* Today's Sales Work (Meetings, Follow-ups, Calls) */}
      {isEnabled('today_sales_work') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Meetings Today */}
          <WidgetContainer
            title="Today's Scheduled Client Demos & Meetings"
            subtitle="Prioritize punctuality and meeting notes capture"
            badge={`${todayMeetings.length} Today`}
            badgeType="primary"
            action={
              <button
                onClick={() => navigateTo('/app/sales/meetings')}
                className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
              >
                Calendar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="space-y-2">
              {todayMeetings.length === 0 ? (
                <div className="py-6 text-center text-xs text-crm-textMuted">No meetings scheduled for today.</div>
              ) : todayMeetings.map(m => (
                <div 
                  key={m.id}
                  onClick={() => navigateTo('/app/sales/meetings')}
                  className="p-3 bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/60 rounded flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-turquoise" />
                    <div>
                      <p className="font-semibold text-crm-text">{m.title}</p>
                      <p className="text-[10px] text-crm-textMuted">{m.clientName || 'Enterprise Prospect'}</p>
                    </div>
                  </div>
                  <span className="font-mono font-medium text-turquoise">{m.time || '11:30 AM'}</span>
                </div>
              ))}
            </div>
          </WidgetContainer>

          {/* Overdue Follow-ups & Action Queue */}
          <WidgetContainer
            title="Follow-up Call & Email Queue"
            subtitle="Touchpoints scheduled to prevent deal stall"
            badge={`${todayFollowUps.length} Pending`}
            badgeType="warning"
            action={
              <button
                onClick={() => navigateTo('/app/sales/activities')}
                className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
              >
                All Activities <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="space-y-2">
              {todayFollowUps.length === 0 ? (
                <div className="py-6 text-center text-xs text-crm-textMuted">No pending follow-ups in queue.</div>
              ) : todayFollowUps.map(f => (
                <div 
                  key={f.id}
                  onClick={() => navigateTo('/app/sales/activities')}
                  className="p-3 bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/60 rounded flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="font-semibold text-crm-text">{f.title || f.taskDescription}</p>
                      <p className="text-[10px] text-crm-textMuted">Contact: {f.clientName || 'Client VP'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-red-400 font-medium">Due Today</span>
                </div>
              ))}
            </div>
          </WidgetContainer>
        </div>
      )}

      {/* My Active Deals Pipeline */}
      {isEnabled('my_pipeline') && (
        <PipelineFunnelWidget title="My Sales Pipeline & Deal Stages" scope="my_deals" />
      )}

      {/* Client Communication & My Performance (Target vs Actual) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isEnabled('client_communication') && (
          <ClientCommunicationWidget />
        )}

        {isEnabled('my_performance') && (
          <WidgetContainer
            title="Monthly Sales Quota vs Actual Achievement"
            subtitle="Objective progress without arbitrary grading formulas"
            badge="Q3 Closing"
          >
            <div className="space-y-3">
              {targets.map(t => {
                const percent = Math.min(100, Math.round((t.actual / t.target) * 100));
                const remaining = Math.max(0, t.target - t.actual);

                return (
                  <div key={t.label} className="p-2.5 bg-crm-surface border border-crm-border/60 rounded text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-crm-text">{t.label}</span>
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="text-turquoise font-bold">
                          {t.unit === '₹' ? formatINR(t.actual, { compact: true }) : t.actual}
                        </span>
                        <span className="text-crm-textMuted">/ {t.unit === '₹' ? formatINR(t.target, { compact: true }) : t.target}</span>
                        <span className="text-[10px] text-amber-400">({remaining > 0 ? `${t.unit === '₹' ? formatINR(remaining, { compact: true }) : remaining} to go` : 'Target Met!'})</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-crm-card rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${percent >= 100 ? 'bg-emerald-400' : 'bg-turquoise'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </WidgetContainer>
        )}
      </div>

      {/* Sales Activity Feed */}
      {isEnabled('sales_activity') && (
        <ActivityFeedWidget title="My Recent Sales Activities & Logs" filterScope="sales" maxEvents={4} />
      )}
    </div>
  );
};
