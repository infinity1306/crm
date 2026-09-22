import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  AttendanceRecord, 
  AttendanceStatus 
} from '../../types/attendance';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { PunchControlWidget } from './PunchControlWidget';
import { AttendanceCorrectionModal } from './AttendanceCorrectionModal';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Search, 
  Filter, 
  Edit3, 
  Eye, 
  FolderKanban, 
  CheckSquare, 
  Download, 
  BarChart3, 
  CalendarDays, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  History,
  Coffee
} from 'lucide-react';

export const AttendanceDashboard: React.FC = () => {
  const { 
    currentUser, 
    employees, 
    attendanceRecords, 
    projects, 
    tasks, 
    navigateTo,
    attendanceConfig 
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'analytics'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-21');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [correctionRecord, setCorrectionRecord] = useState<AttendanceRecord | null>(null);

  // Today's Date String
  const todayStr = '2026-09-21';

  // Compute Top KPI Metrics for Today
  const todayRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.date === todayStr);
  }, [attendanceRecords, todayStr]);

  const totalTeamCount = employees.length;
  const workingNowCount = todayRecords.filter(r => r.sessionState === 'working' || r.sessionState === 'on_break').length;
  const presentCount = todayRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
  const lateCount = todayRecords.filter(r => r.status === 'late' || r.lateMinutes > 0).length;
  const onLeaveCount = todayRecords.filter(r => r.status === 'leave').length;
  const absentCount = totalTeamCount - presentCount - onLeaveCount;

  // Filtered records for selected date
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      // Date match (or all dates if specified)
      if (selectedDate && record.date !== selectedDate) return false;

      // Department filter
      if (departmentFilter !== 'all' && record.department !== departmentFilter) return false;

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'working' && record.sessionState !== 'working' && record.sessionState !== 'on_break') return false;
        if (statusFilter !== 'working' && record.status !== statusFilter) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = record.employeeName.toLowerCase().includes(q);
        const matchesRole = record.employeeRole.toLowerCase().includes(q);
        const matchesId = record.employeeId.toLowerCase().includes(q);
        const matchesProj = record.currentProjectName?.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesId && !matchesProj) return false;
      }

      return true;
    });
  }, [attendanceRecords, selectedDate, departmentFilter, statusFilter, searchQuery]);

  const formatMinutes = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  };

  // Monthly Matrix data computation (Days 1 to 21 for September 2026)
  const daysInMonth = Array.from({ length: 21 }, (_, i) => i + 1);

  const getDayStatus = (empId: string, dayNum: number) => {
    const dayStr = `2026-09-${String(dayNum).padStart(2, '0')}`;
    const rec = attendanceRecords.find(r => r.employeeId === empId && r.date === dayStr);
    
    // Check if weekend (Sep 2026: 5,6, 12,13, 19,20 were Sat/Sun)
    const dateObj = new Date(`2026-09-${String(dayNum).padStart(2, '0')}`);
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    if (!rec) {
      if (isWeekend) return { code: '-', label: 'Weekend', color: 'text-slate-600 bg-slate-900/30' };
      if (dayNum < 21) return { code: 'A', label: 'Absent', color: 'text-rose-400 bg-rose-500/10 border border-rose-500/20' };
      return { code: '—', label: 'Upcoming', color: 'text-slate-600' };
    }

    if (rec.status === 'leave') return { code: 'LV', label: 'Leave', color: 'text-purple-400 bg-purple-500/10 border border-purple-500/20 font-bold' };
    if (rec.status === 'late') return { code: 'L', label: 'Late', color: 'text-amber-400 bg-amber-500/10 border border-amber-500/20 font-bold' };
    if (rec.status === 'half_day') return { code: 'H', label: 'Half Day', color: 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' };
    if (rec.status === 'present' || rec.status === 'working') return { code: 'P', label: 'Present', color: 'text-teal-400 bg-teal-500/10 border border-teal-500/20 font-bold' };
    return { code: 'A', label: 'Absent', color: 'text-rose-400 bg-rose-500/10 border border-rose-500/20' };
  };

  const getStatusBadge = (status: AttendanceStatus, sessionState: string, lateMins: number) => {
    if (sessionState === 'working') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          WORKING NOW
        </span>
      );
    }
    if (sessionState === 'on_break') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Coffee className="w-2.5 h-2.5" />
          ON BREAK
        </span>
      );
    }
    if (status === 'late' || lateMins > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertCircle className="w-2.5 h-2.5" />
          LATE ({lateMins}m)
        </span>
      );
    }
    if (status === 'leave') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
          ON LEAVE
        </span>
      );
    }
    if (status === 'absent') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
          ABSENT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        PRESENT
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Fast Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>Workforce Attendance & Operations</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 uppercase">
              Phase 4 Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time punch tracking, working hours audit, operational floor radar, and workday compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs font-medium"
            leftIcon={<UserCheck className="w-3.5 h-3.5 text-teal-400" />}
            onClick={() => navigateTo('/app/attendance/working-now')}
          >
            Live Floor Radar ({workingNowCount})
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="text-xs font-medium"
            leftIcon={<Calendar className="w-3.5 h-3.5 text-slate-400" />}
            onClick={() => navigateTo('/app/leave')}
          >
            Leave Desk
          </Button>
        </div>
      </div>

      {/* Top 5 KPI Summary Strip (Dense, restrained, enterprise style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Present Today */}
        <div className="p-3.5 rounded-lg bg-[#0D1216] border border-[#1E262E] shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              PRESENT TODAY
            </span>
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {presentCount} <span className="text-sm font-normal text-slate-500">/ {totalTeamCount}</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            {Math.round((presentCount / (totalTeamCount || 1)) * 100)}% attendance rate
          </p>
        </div>

        {/* Working Now */}
        <div 
          onClick={() => navigateTo('/app/attendance/working-now')}
          className="p-3.5 rounded-lg bg-[#0D1216] border border-[#1E262E] hover:border-teal-500/40 transition-colors cursor-pointer shadow-card group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold group-hover:text-teal-300 transition-colors">
              WORKING NOW
            </span>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-teal-400">
              {workingNowCount}
            </span>
          </div>
          <p className="text-[10px] text-teal-500/80 mt-1 font-mono flex items-center gap-1">
            <span>Click to view live floor</span>
            <span>→</span>
          </p>
        </div>

        {/* Late Today */}
        <div className="p-3.5 rounded-lg bg-[#0D1216] border border-[#1E262E] shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              LATE TODAY
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-amber-400">
              {lateCount}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Past {attendanceConfig.expectedStartTime} AM + {attendanceConfig.gracePeriodMinutes}m grace
          </p>
        </div>

        {/* On Leave */}
        <div 
          onClick={() => navigateTo('/app/leave')}
          className="p-3.5 rounded-lg bg-[#0D1216] border border-[#1E262E] hover:border-purple-500/40 transition-colors cursor-pointer shadow-card group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold group-hover:text-purple-300 transition-colors">
              ON LEAVE
            </span>
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-purple-400">
              {onLeaveCount}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            1 approved medical leave
          </p>
        </div>

        {/* Absent Today */}
        <div className="p-3.5 rounded-lg bg-[#0D1216] border border-[#1E262E] shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              ABSENT (UNEXCUSED)
            </span>
            <UserX className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-rose-400">
              {Math.max(0, absentCount)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Missing punch-in record
          </p>
        </div>
      </div>

      {/* Primary Punch Control Banner */}
      <PunchControlWidget />

      {/* Tabs Switcher: Daily Records | Monthly Matrix | Analytics */}
      <div className="flex items-center justify-between border-b border-[#1E262E] pb-px">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === 'daily' ? 'text-teal-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Daily Attendance Records</span>
            {activeTab === 'daily' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === 'monthly' ? 'text-teal-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Monthly Attendance Matrix</span>
            {activeTab === 'monthly' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === 'analytics' ? 'text-teal-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Workforce Analytics</span>
            {activeTab === 'analytics' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 pb-2">
          <span className="text-[11px] font-mono text-slate-500">
            Selected: <strong className="text-slate-300 font-normal">{selectedDate}</strong>
          </span>
        </div>
      </div>

      {/* TAB 1: DAILY ATTENDANCE TABLE */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Toolbar: Search & Filters */}
          <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employee name, ID, role, or project..."
                  className="pl-9 w-full text-xs"
                />
              </div>

              {/* Date, Department, Status Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-mono"
                />

                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Departments' },
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Product', label: 'Product' },
                    { value: 'Executive', label: 'Executive' },
                    { value: 'Operations', label: 'Operations' },
                  ]}
                  className="text-xs"
                />

                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'working', label: 'Working Now' },
                    { value: 'present', label: 'Present' },
                    { value: 'late', label: 'Late Arrival' },
                    { value: 'leave', label: 'On Leave' },
                    { value: 'absent', label: 'Absent' },
                  ]}
                  className="text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Records Table */}
          <Card className="overflow-hidden bg-[#0D1216] border-[#1E262E] p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E262E] bg-[#12181E] text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-3">Punch In</th>
                    <th className="py-3 px-3">Punch Out</th>
                    <th className="py-3 px-3">Break</th>
                    <th className="py-3 px-3">Worked</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Late / Overtime</th>
                    <th className="py-3 px-3">Active Project / Task</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E262E]/60 text-slate-300">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-400">No attendance records found for selected filters</p>
                        <p className="text-[11px] text-slate-600 mt-1">Try resetting search filters or selecting another date</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(record => {
                      return (
                        <tr key={record.id} className="hover:bg-[#12181E]/60 transition-colors group">
                          {/* Employee info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={record.employeeName} size="sm" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-white truncate group-hover:text-teal-300 transition-colors">
                                    {record.employeeName}
                                  </span>
                                  {record.correction?.isCorrected && (
                                    <span 
                                      title={`Corrected by Admin (${record.correction.correctedByName}): "${record.correction.reason}"`}
                                      className="px-1 py-0.2 rounded text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                    >
                                      EDITED
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 block truncate">
                                  {record.employeeRole} • {record.department}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Punch In */}
                          <td className="py-3 px-3 font-mono text-slate-200">
                            {record.punchIn && record.punchIn !== '00:00' ? (
                              <div className="flex items-center gap-1.5">
                                <span>{record.punchIn}</span>
                                {record.lateMinutes > 0 && (
                                  <span className="text-[10px] text-amber-400">
                                    +{record.lateMinutes}m
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>

                          {/* Punch Out */}
                          <td className="py-3 px-3 font-mono text-slate-200">
                            {record.punchOut && record.punchOut !== '00:00' ? (
                              <span>{record.punchOut}</span>
                            ) : record.sessionState === 'working' ? (
                              <span className="text-teal-400 text-[11px] italic">Active</span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>

                          {/* Break */}
                          <td className="py-3 px-3 font-mono text-slate-400">
                            {record.breakMinutes > 0 ? `${record.breakMinutes}m` : '0m'}
                          </td>

                          {/* Worked Hours */}
                          <td className="py-3 px-3 font-mono font-semibold text-white">
                            {record.totalWorkingMinutes > 0 ? formatMinutes(record.totalWorkingMinutes) : '00h 00m'}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            {getStatusBadge(record.status, record.sessionState, record.lateMinutes)}
                          </td>

                          {/* Late / Overtime */}
                          <td className="py-3 px-3 font-mono text-[11px]">
                            {record.overtimeMinutes > 0 ? (
                              <span className="text-emerald-400">+{formatMinutes(record.overtimeMinutes)} OT</span>
                            ) : record.lateMinutes > 0 ? (
                              <span className="text-amber-400">{record.lateMinutes}m late</span>
                            ) : (
                              <span className="text-slate-600">Standard</span>
                            )}
                          </td>

                          {/* Active Delivery Context (Phase 3 Link) */}
                          <td className="py-3 px-3 max-w-[200px] truncate">
                            {record.currentProjectName ? (
                              <div className="truncate">
                                <div className="flex items-center gap-1 text-slate-200 truncate font-medium">
                                  <FolderKanban className="w-3 h-3 text-teal-400 shrink-0" />
                                  <span className="truncate">{record.currentProjectName}</span>
                                </div>
                                {record.currentTaskTitle && (
                                  <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                    <CheckSquare className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{record.currentTaskTitle}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-600 italic">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => navigateTo(`/app/team/${record.employeeId}/attendance`)}
                                title="View Personal Attendance Profile"
                                className="p-1 rounded text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setCorrectionRecord(record)}
                                title="Administrative Correction"
                                className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: MONTHLY ATTENDANCE MATRIX */}
      {activeTab === 'monthly' && (
        <Card className="bg-[#0D1216] border-[#1E262E] p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E262E]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-teal-400" />
                <span>September 2026 Monthly Attendance Matrix</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Compact enterprise roster showing daily shift presence, late markers, and approved leaves.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400" /> P: Present</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> L: Late</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> LV: Leave</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> A: Absent</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E262E] text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3 min-w-[150px]">Employee</th>
                  {daysInMonth.map(d => (
                    <th key={d} className={`py-2 px-1.5 text-center ${d === 21 ? 'text-teal-400 font-bold bg-teal-500/10 rounded' : ''}`}>
                      {d}
                    </th>
                  ))}
                  <th className="py-2 px-2 text-right">Present</th>
                  <th className="py-2 px-2 text-right">Late</th>
                  <th className="py-2 px-2 text-right">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E262E]/40 font-mono text-[11px]">
                {employees.map(emp => {
                  const empRecords = attendanceRecords.filter(r => r.employeeId === emp.id);
                  const totalPresentDays = empRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
                  const totalLateDays = empRecords.filter(r => r.status === 'late' || r.lateMinutes > 0).length;
                  const totalWorkedMins = empRecords.reduce((acc, r) => acc + (r.totalWorkingMinutes || 0), 0);

                  return (
                    <tr key={emp.id} className="hover:bg-[#12181E]/40 transition-colors">
                      <td className="py-2 px-3">
                        <span 
                          onClick={() => navigateTo(`/app/team/${emp.id}/attendance`)}
                          className="font-medium text-slate-200 hover:text-teal-300 cursor-pointer truncate block"
                        >
                          {emp.name}
                        </span>
                      </td>

                      {daysInMonth.map(d => {
                        const dayStatus = getDayStatus(emp.id, d);
                        return (
                          <td key={d} className="py-1 px-1 text-center">
                            <span 
                              title={`${emp.name} - Sep ${d}: ${dayStatus.label}`}
                              className={`inline-block w-6 h-6 leading-6 text-center text-[10px] rounded ${dayStatus.color}`}
                            >
                              {dayStatus.code}
                            </span>
                          </td>
                        );
                      })}

                      <td className="py-2 px-2 text-right text-teal-400 font-bold">
                        {totalPresentDays}
                      </td>
                      <td className="py-2 px-2 text-right text-amber-400 font-bold">
                        {totalLateDays}
                      </td>
                      <td className="py-2 px-2 text-right text-white font-bold">
                        {formatMinutes(totalWorkedMins)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: WORKFORCE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Rate</span>
              <TrendingUp className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              94.6%
            </div>
            <p className="text-xs text-slate-400">
              Calculated across 21 business days in September 2026. Consistent with quarterly SLA target (&gt;92%).
            </p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: '94.6%' }} />
            </div>
          </Card>

          <Card className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Working Hours</span>
              <Clock className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              08h 18m <span className="text-xs font-normal text-slate-500">/ day</span>
            </div>
            <p className="text-xs text-slate-400">
              Net effective working duration per employee excluding lunch breaks and standup buffers.
            </p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </Card>

          <Card className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Arrival Time</span>
              <History className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              09:22 AM
            </div>
            <p className="text-xs text-slate-400">
              8 minutes prior to standard 09:30 AM expected start. Late frequency is bounded at 7.2%.
            </p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92.8%' }} />
            </div>
          </Card>

          <Card className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Late Frequency</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-amber-400">
              7.2%
            </div>
            <p className="text-xs text-slate-400">
              6 total late arrivals logged across the month. Outer Ring Road transit delays account for 4.
            </p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '7.2%' }} />
            </div>
          </Card>

          <Card className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overtime Accumulation</span>
              <Sparkles className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-teal-400">
              42h 15m
            </div>
            <p className="text-xs text-slate-400">
              Logistics and Core Payment Mesh release sprints contributed to authorized overtime.
            </p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: '65%' }} />
            </div>
          </Card>

          <Card className="p-4 bg-[#0D1216] border-[#1E262E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Absence Rate (Unexcused)</span>
              <UserX className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-rose-400">
              1.8%
            </div>
            <p className="text-xs text-slate-400">
              Minimal unplanned absenteeism. Handled via automated reminders and line manager notifications.
            </p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '1.8%' }} />
            </div>
          </Card>
        </div>
      )}

      {/* Attendance Correction Modal */}
      <AttendanceCorrectionModal
        isOpen={!!correctionRecord}
        onClose={() => setCorrectionRecord(null)}
        record={correctionRecord}
      />
    </div>
  );
};
