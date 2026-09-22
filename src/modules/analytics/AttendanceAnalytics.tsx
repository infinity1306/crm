import React, { useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import {
  Clock, Calendar, Users, TrendingUp, AlertTriangle, BarChart3,
  UserCheck, Coffee
} from 'lucide-react';

export const AttendanceAnalytics: React.FC = () => {
  const { employees, attendanceRecords, leaveRequests, navigateTo } = useCRM();

  const activeEmployees = employees.filter(e => e.status === 'active');

  // ── Aggregate Metrics ──
  const totalRecords = attendanceRecords.length;
  const presentRecords = attendanceRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
  const lateRecords = attendanceRecords.filter(r => r.status === 'late' || r.lateMinutes > 0).length;
  const absentRecords = attendanceRecords.filter(r => r.status === 'absent').length;
  const leaveRecords = attendanceRecords.filter(r => r.status === 'leave').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
  const lateRate = totalRecords > 0 ? Math.round((lateRecords / totalRecords) * 100) : 0;

  const totalWorkMinutes = attendanceRecords.reduce((s, r) => s + r.totalWorkingMinutes, 0);
  const avgWorkHours = totalRecords > 0 ? Math.round((totalWorkMinutes / totalRecords / 60) * 10) / 10 : 0;
  const totalOvertimeMinutes = attendanceRecords.reduce((s, r) => s + r.overtimeMinutes, 0);
  const totalBreakMinutes = attendanceRecords.reduce((s, r) => s + r.breakMinutes, 0);

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;
  const approvedLeaves = leaveRequests.filter(l => l.status === 'approved').length;

  // ── Department Breakdown ──
  const deptBreakdown = useMemo(() => {
    const map: Record<string, { dept: string; records: number; present: number; late: number; avgHours: number; totalMinutes: number }> = {};
    attendanceRecords.forEach(r => {
      if (!map[r.department]) map[r.department] = { dept: r.department, records: 0, present: 0, late: 0, avgHours: 0, totalMinutes: 0 };
      map[r.department].records++;
      if (r.status === 'present' || r.status === 'working' || r.status === 'late') map[r.department].present++;
      if (r.status === 'late' || r.lateMinutes > 0) map[r.department].late++;
      map[r.department].totalMinutes += r.totalWorkingMinutes;
    });
    return Object.values(map).map(d => ({
      ...d,
      attendanceRate: d.records > 0 ? Math.round((d.present / d.records) * 100) : 0,
      lateRate: d.records > 0 ? Math.round((d.late / d.records) * 100) : 0,
      avgHours: d.records > 0 ? Math.round((d.totalMinutes / d.records / 60) * 10) / 10 : 0,
    })).sort((a, b) => b.attendanceRate - a.attendanceRate);
  }, [attendanceRecords]);

  // ── Employee Attendance Table ──
  const empAttendance = useMemo(() => {
    return activeEmployees.map(emp => {
      const records = attendanceRecords.filter(r => r.employeeId === emp.id);
      const present = records.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
      const late = records.filter(r => r.status === 'late' || r.lateMinutes > 0).length;
      const totalMin = records.reduce((s, r) => s + r.totalWorkingMinutes, 0);
      const overtime = records.reduce((s, r) => s + r.overtimeMinutes, 0);
      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        totalDays: records.length,
        presentDays: present,
        lateDays: late,
        attendanceRate: records.length > 0 ? Math.round((present / records.length) * 100) : 0,
        avgHours: records.length > 0 ? Math.round((totalMin / records.length / 60) * 10) / 10 : 0,
        overtimeHours: Math.round(overtime / 60),
      };
    });
  }, [activeEmployees, attendanceRecords]);

  type EmpAtRow = typeof empAttendance[0];

  const columns: DataTableColumn<EmpAtRow>[] = [
    { key: 'name', label: 'Employee', render: r => (
      <div>
        <div className="text-xs font-medium text-crm-text">{r.name}</div>
        <div className="text-[10px] text-crm-textMuted">{r.department}</div>
      </div>
    )},
    { key: 'totalDays', label: 'Days', align: 'right', sortable: true },
    { key: 'presentDays', label: 'Present', align: 'right', sortable: true },
    { key: 'lateDays', label: 'Late', align: 'right', sortable: true, render: r => (
      <span className={r.lateDays > 2 ? 'text-amber-400 font-semibold' : 'text-crm-textMuted'}>{r.lateDays}</span>
    )},
    { key: 'attendanceRate', label: 'Rate', align: 'right', sortable: true, render: r => (
      <span className={`font-semibold ${r.attendanceRate >= 90 ? 'text-emerald-400' : r.attendanceRate >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
        {r.attendanceRate}%
      </span>
    )},
    { key: 'avgHours', label: 'Avg Hours', align: 'right', sortable: true, render: r => (
      <span className="text-crm-textSecondary">{r.avgHours}h</span>
    )},
    { key: 'overtimeHours', label: 'Overtime', align: 'right', sortable: true, render: r => (
      <span className="text-crm-textMuted">{r.overtimeHours}h</span>
    )},
  ];

  const kpis = [
    { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: UserCheck, color: 'text-emerald-400' },
    { label: 'Avg Work Hours', value: `${avgWorkHours}h`, icon: Clock, color: 'text-turquoise' },
    { label: 'Late Arrivals', value: `${lateRate}%`, icon: AlertTriangle, color: lateRate > 10 ? 'text-amber-400' : 'text-emerald-400' },
    { label: 'Total Overtime', value: `${Math.round(totalOvertimeMinutes / 60)}h`, icon: TrendingUp, color: 'text-cyan-400' },
    { label: 'Absent Days', value: absentRecords, icon: Users, color: 'text-red-400' },
    { label: 'Leave Days', value: leaveRecords, icon: Calendar, color: 'text-indigo-400' },
    { label: 'Pending Leaves', value: pendingLeaves, icon: Calendar, color: 'text-amber-400' },
    { label: 'Avg Break Time', value: `${totalRecords > 0 ? Math.round(totalBreakMinutes / totalRecords) : 0}m`, icon: Coffee, color: 'text-slate-400' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-lg font-bold text-crm-text tracking-tight">Attendance & Workforce Analytics</h1>
        <p className="text-xs text-crm-textMuted mt-0.5">Company-wide attendance trends, late arrivals, overtime, and workforce utilization</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-crm-card border border-crm-border rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              <span className="text-[10px] text-crm-textMuted uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className="text-base font-bold text-crm-text">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader><CardTitle>Department Breakdown</CardTitle></CardHeader>
        <div className="space-y-3">
          {deptBreakdown.map(dept => (
            <div key={dept.dept} className="flex items-center gap-4 px-3 py-2.5 rounded-md bg-crm-surface/30">
              <span className="text-xs font-medium text-crm-text w-28 truncate">{dept.dept}</span>
              <div className="flex-1">
                <div className="h-1.5 bg-crm-surface rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-turquoise/60" style={{ width: `${dept.attendanceRate}%` }} />
                </div>
              </div>
              <span className={`text-xs font-semibold w-10 text-right ${dept.attendanceRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {dept.attendanceRate}%
              </span>
              <span className="text-[11px] text-crm-textMuted w-14 text-right">{dept.avgHours}h avg</span>
              <span className="text-[11px] text-crm-textMuted w-14 text-right">{dept.lateRate}% late</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Employee Table */}
      <Card>
        <DataTable
          data={empAttendance}
          columns={columns}
          keyExtractor={r => r.id}
          title="Employee Attendance"
          searchPlaceholder="Search employees…"
          exportFilename="attendance_analytics"
          onRowClick={r => navigateTo(`/app/team/${r.id}/attendance`)}
          pageSize={15}
        />
      </Card>
    </div>
  );
};
