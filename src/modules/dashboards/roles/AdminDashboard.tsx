import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { MetricCardWidget, MetricItem } from '../widgets/MetricCardWidget';
import { ActionCenterWidget } from '../widgets/ActionCenterWidget';
import { ActivityFeedWidget } from '../widgets/ActivityFeedWidget';
import { ProjectHealthWidget } from '../widgets/ProjectHealthWidget';
import { PersonalAttendanceWidget } from '../widgets/PersonalAttendanceWidget';
import { WidgetContainer } from '../components/WidgetContainer';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { WidgetId } from '../types';
import { 
  Users, 
  UserCheck, 
  FolderKanban, 
  LifeBuoy, 
  DollarSign, 
  Receipt,
  ChevronRight,
  Clock,
  CheckSquare,
  AlertTriangle,
  Target
} from 'lucide-react';

interface AdminDashboardProps {
  enabledWidgets: WidgetId[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ enabledWidgets }) => {
  const { 
    employees, 
    projects, 
    tickets, 
    tasks, 
    financeMetrics, 
    attendanceRecords, 
    workUpdates,
    deals,
    navigateTo 
  } = useCRM();

  const isEnabled = (id: WidgetId) => enabledWidgets.includes(id);

  const activeProjects = projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled');
  const openTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
  const activePipelineValue = deals.filter(d => d.stage !== 'lost' && d.stage !== 'won').reduce((sum, d) => sum + d.value, 0);
  const todayRecords = attendanceRecords.filter(r => (r.date === '2026-09-27' || r.date === '2026-09-21'));
  const presentCount = todayRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length || 118;

  const primaryMetrics: MetricItem[] = [
    { id: 'admin-emp', label: 'Total Staff', value: '127', context: '98% on duty', icon: Users, onClick: () => navigateTo('/app/team') },
    { id: 'admin-pres', label: 'Present Today', value: `${presentCount}`, context: '12 on approved break', icon: UserCheck, onClick: () => navigateTo('/app/attendance') },
    { id: 'admin-proj', label: 'Active Projects', value: `${activeProjects.length}`, context: '4 active delivery tracks', icon: FolderKanban, onClick: () => navigateTo('/app/projects') },
    { id: 'admin-tk', label: 'Open Tickets', value: `${openTickets.length}`, context: '2 critical pending', icon: LifeBuoy, onClick: () => navigateTo('/app/tickets') },
    { id: 'admin-rev', label: 'Revenue Settled', value: `$${(financeMetrics.totalCollected / 1000).toFixed(0)}k`, context: 'Inward cash collections', icon: DollarSign, onClick: () => navigateTo('/app/finance') },
    { id: 'admin-out', label: 'Receivables Dues', value: `$${(financeMetrics.totalPending / 1000).toFixed(0)}k`, context: 'Pending payments', icon: Receipt, onClick: () => navigateTo('/app/finance/overdue') }
  ];

  // Team Overview mock data matching the exact example in the prompt:
  // Sid | Developer | Working | Payment API | 12 min ago
  // Shivanshu | Sales | In Meeting | ABC Pvt Ltd | 4 min ago
  const teamStatusList = [
    { id: 'emp-3', name: 'Siddharth "Sid" Rao', role: 'Developer', dept: 'Engineering', status: 'Working', currentWork: 'Payment API & Webhooks', lastActive: '12 min ago' },
    { id: 'emp-2', name: 'Shivanshu Sharma', role: 'Sales Lead', dept: 'Sales', status: 'In Meeting', currentWork: 'ABC Technologies Demo', lastActive: '4 min ago' },
    { id: 'emp-4', name: 'Dhruv Joshi', role: 'Sr Backend', dept: 'Engineering', status: 'Working', currentWork: 'Postgres Index Optimization', lastActive: '18 min ago' },
    { id: 'emp-6', name: 'Ananya Desai', role: 'HR Lead', dept: 'HR', status: 'Reviewing', currentWork: 'Q3 Appraisal Framework', lastActive: '25 min ago' },
    { id: 'emp-12', name: 'Sneha Bose', role: 'Finance Analyst', dept: 'Finance', status: 'Working', currentWork: 'September Invoice Run', lastActive: '30 min ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Attendance Clock & Shift Timer */}
      {isEnabled('personal_attendance') && (
        <PersonalAttendanceWidget />
      )}

      {/* Primary Metrics */}
      {isEnabled('kpi_metrics') && (
        <MetricCardWidget metrics={primaryMetrics} columns={6} />
      )}

      {/* Action Center Widget */}
      {isEnabled('action_center') && (
        <ActionCenterWidget maxItems={4} />
      )}

      {/* Team Overview Table & Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Overview */}
        {isEnabled('team_overview') && (
          <WidgetContainer
            title="Team Operational Overview"
            subtitle="Live status, active focus, and heartbeat per department"
            badge="Live Telemetry"
            action={
              <button
                onClick={() => navigateTo('/app/team')}
                className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
              >
                Team Directory <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-crm-border/60 text-[10px] uppercase font-bold text-crm-textMuted tracking-wider">
                    <th className="pb-2 font-semibold">Employee</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Current Work</th>
                    <th className="pb-2 font-semibold text-right">Heartbeat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-crm-border/30">
                  {teamStatusList.map(member => (
                    <tr 
                      key={member.id}
                      onClick={() => navigateTo(`/app/team/${member.id}`)}
                      className="hover:bg-crm-surfaceHover/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={member.name} size="sm" />
                          <div>
                            <p className="font-semibold text-crm-text truncate">{member.name}</p>
                            <p className="text-[10px] text-crm-textMuted">{member.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          member.status === 'Working' ? 'text-emerald-400' :
                          member.status === 'In Meeting' ? 'text-blue-400' : 'text-amber-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            member.status === 'Working' ? 'bg-emerald-400' :
                            member.status === 'In Meeting' ? 'bg-blue-400' : 'bg-amber-400'
                          }`} />
                          {member.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-crm-text truncate max-w-[140px]">
                        {member.currentWork}
                      </td>
                      <td className="py-2.5 text-right font-mono text-[10px] text-crm-textMuted">
                        {member.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </WidgetContainer>
        )}

        {/* Project Overview */}
        {isEnabled('project_overview') && (
          <ProjectHealthWidget title="Project Delivery Overview" scope="all" maxProjects={4} />
        )}
      </div>

      {/* Sales Overview & Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isEnabled('sales_overview') && (
          <WidgetContainer
            title="Sales & Pipeline Overview"
            subtitle="Pipeline generation, conversion pace, and top deals"
            action={
              <button
                onClick={() => navigateTo('/app/sales/pipeline')}
                className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
              >
                Pipeline <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Meetings</span>
                <p className="text-base font-bold font-mono text-crm-text mt-1">18</p>
                <p className="text-[10px] text-emerald-400">+4 vs last wk</p>
              </div>
              <div className="p-3 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Follow-ups</span>
                <p className="text-base font-bold font-mono text-crm-text mt-1">42</p>
                <p className="text-[10px] text-crm-textMuted">9 overdue</p>
              </div>
              <div className="p-3 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Pipeline</span>
                <p className="text-base font-bold font-mono text-turquoise mt-1">${(activePipelineValue / 1000).toFixed(0)}k</p>
                <p className="text-[10px] text-crm-textMuted">14 active deals</p>
              </div>
              <div className="p-3 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Conversions</span>
                <p className="text-base font-bold font-mono text-emerald-400 mt-1">32%</p>
                <p className="text-[10px] text-crm-textMuted">Win rate</p>
              </div>
            </div>
          </WidgetContainer>
        )}

        {isEnabled('attendance_summary') && (
          <WidgetContainer
            title="Attendance & Workforce Telemetry"
            subtitle="Today's shift attendance and floor distribution"
            action={
              <button
                onClick={() => navigateTo('/app/attendance')}
                className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
              >
                Live Floor <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Present</span>
                <p className="text-base font-bold font-mono text-emerald-400 mt-1">{presentCount}</p>
              </div>
              <div className="p-2.5 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Working</span>
                <p className="text-base font-bold font-mono text-turquoise mt-1">84</p>
              </div>
              <div className="p-2.5 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Late</span>
                <p className="text-base font-bold font-mono text-amber-400 mt-1">3</p>
              </div>
              <div className="p-2.5 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Leave</span>
                <p className="text-base font-bold font-mono text-crm-text mt-1">4</p>
              </div>
              <div className="p-2.5 bg-crm-surface rounded border border-crm-border/60">
                <span className="text-[10px] text-crm-textMuted uppercase font-semibold">Absent</span>
                <p className="text-base font-bold font-mono text-red-400 mt-1">1</p>
              </div>
            </div>
          </WidgetContainer>
        )}
      </div>

      {/* Live Recent Activity */}
      {isEnabled('live_activity') && (
        <ActivityFeedWidget title="Operations & Team Activity Timeline" filterScope="all" maxEvents={5} />
      )}
    </div>
  );
};
