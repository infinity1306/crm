import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { MetricCardWidget, MetricItem } from '../widgets/MetricCardWidget';
import { PersonalAttendanceWidget } from '../widgets/PersonalAttendanceWidget';
import { WidgetContainer } from '../components/WidgetContainer';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { WidgetId } from '../types';
import { 
  Users, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface HRDashboardProps {
  enabledWidgets: WidgetId[];
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ enabledWidgets }) => {
  const { 
    employees, 
    attendanceRecords, 
    leaveRequests, 
    reviewLeaveRequest,
    navigateTo 
  } = useCRM();

  const isEnabled = (id: WidgetId) => enabledWidgets.includes(id);

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => (r.date === todayDateStr || r.date === '2026-09-27'));
  const presentCount = todayRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
  const workingNowCount = todayRecords.filter(r => r.sessionState === 'working').length;
  const lateCount = todayRecords.filter(r => r.status === 'late' || r.lateMinutes > 0).length;
  const leaveTodayCount = todayRecords.filter(r => r.status === 'leave').length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const unplannedAbsent = Math.max(0, employees.length - presentCount - leaveTodayCount);

  // 6 Primary HR Metrics (Section 10)
  const attendanceRate = employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0;
  const hrMetrics: MetricItem[] = [
    { id: 'hr-total', label: 'Total Headcount', value: `${employees.length}`, change: `${employees.length} active`, isPositive: true, icon: Users, onClick: () => navigateTo('/app/team') },
    { id: 'hr-present', label: 'Present Today', value: `${presentCount}`, context: `${attendanceRate}% on duty`, icon: UserCheck, onClick: () => navigateTo('/app/attendance') },
    { id: 'hr-working', label: 'Working Now', value: `${workingNowCount}`, context: 'Active live desks', icon: Clock, onClick: () => navigateTo('/app/attendance/working-now') },
    { id: 'hr-late', label: 'Late Arrivals', value: `${lateCount}`, context: 'Grace period used', icon: AlertTriangle, isPositive: lateCount === 0, onClick: () => navigateTo('/app/attendance') },
    { id: 'hr-leave', label: 'On Approved Leave', value: `${leaveTodayCount}`, context: 'Scheduled PTO/Sick', icon: Calendar, onClick: () => navigateTo('/app/leave') },
    { id: 'hr-absent', label: 'Unplanned Absent', value: `${unplannedAbsent}`, context: unplannedAbsent > 0 ? 'Requires contact' : 'Full attendance', isPositive: unplannedAbsent === 0, icon: AlertTriangle, onClick: () => navigateTo('/app/attendance') }
  ];

  const recentEmployees = employees.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Attendance Clock & Shift Timer */}
      {isEnabled('personal_attendance') && (
        <PersonalAttendanceWidget />
      )}

      {/* 6 Primary HR Workforce Metrics */}
      {isEnabled('hr_metrics') && (
        <MetricCardWidget metrics={hrMetrics} columns={6} />
      )}

      {/* Leave Management Overview & Pending Applications */}
      {isEnabled('leave_overview') && (
        <WidgetContainer
          title="Leave Management Queue"
          subtitle="PTO, sick leave, and casual leave applications awaiting HR review"
          badge={`${pendingLeaves.length} Pending`}
          badgeType={pendingLeaves.length > 0 ? "warning" : "success"}
          action={
            <button
              onClick={() => navigateTo('/app/leave')}
              className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
            >
              Leave Desk <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          {pendingLeaves.length === 0 ? (
            <div className="py-6 text-center text-xs text-crm-textMuted">
              All leave requests have been reviewed.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingLeaves.slice(0, 4).map(leave => (
                <div 
                  key={leave.id}
                  className="p-3 bg-crm-surface border border-crm-border/60 rounded flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={leave.employeeName} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-crm-text truncate">
                        {leave.employeeName} — {leave.leaveType.toUpperCase()} ({leave.daysCount} days)
                      </p>
                      <p className="text-[10px] text-crm-textMuted truncate">
                        Dates: {leave.startDate} to {leave.endDate} · Reason: {leave.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => reviewLeaveRequest(leave.id, 'approve')}
                      className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reviewLeaveRequest(leave.id, 'reject', 'Capacity conflict')}
                      className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </WidgetContainer>
      )}

      {/* Employee Overview & Workforce Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Directory Overview */}
        {isEnabled('employee_overview') && (
          <WidgetContainer
            title="Employee Directory Status"
            subtitle="Staff departments, operational status, and attendance"
            action={
              <button
                onClick={() => navigateTo('/app/team')}
                className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
              >
                All Staff <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-crm-border/60 text-[10px] uppercase font-bold text-crm-textMuted tracking-wider">
                    <th className="pb-2 font-semibold">Employee</th>
                    <th className="pb-2 font-semibold">Department</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold text-right">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-crm-border/30">
                  {recentEmployees.map(emp => (
                    <tr 
                      key={emp.id}
                      onClick={() => navigateTo(`/app/team/${emp.id}`)}
                      className="hover:bg-crm-surfaceHover/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={emp.name} size="sm" />
                          <div>
                            <p className="font-semibold text-crm-text truncate">{emp.name}</p>
                            <p className="text-[10px] text-crm-textMuted">{emp.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-crm-textMuted">{emp.department}</td>
                      <td className="py-2.5">
                        <Badge variant={emp.status === 'active' ? 'success' : 'warning'}>
                          {emp.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-mono text-[10px] text-crm-textMuted">
                        {emp.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </WidgetContainer>
        )}

        {/* Workforce Trends */}
        {isEnabled('workforce_trends') && (
          <WidgetContainer
            title="Workforce Trends & Analytics"
            subtitle="Punctuality patterns and working hour discipline"
            badge="Healthy Metrics"
            badgeType="success"
            action={
              <button
                onClick={() => navigateTo('/app/analytics/attendance')}
                className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
              >
                Analytics <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-crm-surface rounded border border-crm-border/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-crm-text">Average Daily Working Hours</span>
                  <span className="font-mono font-bold text-turquoise">
                    {attendanceRecords.filter(r => r.totalWorkingMinutes > 0).length > 0 
                      ? ((attendanceRecords.filter(r => r.totalWorkingMinutes > 0).reduce((s, r) => s + r.totalWorkingMinutes, 0) / attendanceRecords.filter(r => r.totalWorkingMinutes > 0).length) / 60).toFixed(1) 
                      : '0.0'} hrs
                  </span>
                </div>
                <div className="w-full h-1.5 bg-crm-card rounded-full overflow-hidden">
                  <div className="h-full bg-turquoise" style={{ width: `${Math.min(100, Math.round((presentCount / Math.max(1, employees.length)) * 100))}%` }} />
                </div>
              </div>

              <div className="p-3 bg-crm-surface rounded border border-crm-border/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-crm-text">On-Time Arrival Rate</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {presentCount > 0 ? Math.round(((presentCount - lateCount) / presentCount) * 100) : 100}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-crm-card rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${presentCount > 0 ? Math.round(((presentCount - lateCount) / presentCount) * 100) : 100}%` }} />
                </div>
              </div>

              <div className="p-3 bg-crm-surface rounded border border-crm-border/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-crm-text">Leave Utilization</span>
                  <span className="font-mono font-bold text-amber-400">
                    {leaveRequests.filter(l => l.status === 'approved').length} Approved
                  </span>
                </div>
                <div className="w-full h-1.5 bg-crm-card rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, leaveRequests.filter(l => l.status === 'approved').length * 10)}%` }} />
                </div>
              </div>
            </div>
          </WidgetContainer>
        )}
      </div>
    </div>
  );
};
