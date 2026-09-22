import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { AttendanceRecord, DailySessionTimelineEvent } from '../../types/attendance';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  FolderKanban, 
  CheckSquare, 
  LifeBuoy, 
  History, 
  TrendingUp, 
  Sparkles,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';

interface EmployeeAttendanceProfileProps {
  employeeId: string;
}

export const EmployeeAttendanceProfile: React.FC<EmployeeAttendanceProfileProps> = ({ employeeId }) => {
  const { 
    employees, 
    attendanceRecords, 
    navigateTo 
  } = useCRM();

  const employee = employees.find(e => e.id === employeeId) || employees[0];
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-21');

  // All records for this employee
  const employeeRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.employeeId === employee.id);
  }, [attendanceRecords, employee.id]);

  // Selected Day Record
  const selectedRecord = useMemo(() => {
    return employeeRecords.find(r => r.date === selectedDate);
  }, [employeeRecords, selectedDate]);

  // Monthly summary metrics for September 2026
  const monthlyMetrics = useMemo(() => {
    const presentDays = employeeRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
    const absentDays = employeeRecords.filter(r => r.status === 'absent').length;
    const leaveDays = employeeRecords.filter(r => r.status === 'leave').length;
    const lateDays = employeeRecords.filter(r => r.status === 'late' || r.lateMinutes > 0).length;
    const totalWorkingMins = employeeRecords.reduce((acc, r) => acc + (r.totalWorkingMinutes || 0), 0);
    const totalOvertimeMins = employeeRecords.reduce((acc, r) => acc + (r.overtimeMinutes || 0), 0);
    const avgDailyMins = presentDays > 0 ? Math.round(totalWorkingMins / presentDays) : 0;

    return {
      presentDays,
      absentDays,
      leaveDays,
      lateDays,
      totalWorkingMins,
      totalOvertimeMins,
      avgDailyMins
    };
  }, [employeeRecords]);

  const formatHoursMinutes = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  };

  // 30 Days of September 2026 for Calendar grid
  const daysInSeptember = Array.from({ length: 30 }, (_, i) => i + 1);

  const getCalendarDayMeta = (dayNum: number) => {
    const dateStr = `2026-09-${String(dayNum).padStart(2, '0')}`;
    const dateObj = new Date(dateStr);
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const rec = employeeRecords.find(r => r.date === dateStr);

    if (rec) {
      if (rec.status === 'leave') return { code: 'LV', status: 'leave', label: 'On Leave', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      if (rec.status === 'late') return { code: 'L', status: 'late', label: 'Late', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      if (rec.status === 'half_day') return { code: 'H', status: 'half_day', label: 'Half Day', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      if (rec.status === 'absent') return { code: 'A', status: 'absent', label: 'Absent', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      return { code: 'P', status: 'present', label: 'Present', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
    }

    if (isWeekend) return { code: '-', status: 'weekend', label: 'Weekend', bg: 'bg-slate-900/40 text-slate-600 border-transparent' };
    if (dayNum <= 21) return { code: 'A', status: 'absent', label: 'Absent', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    return { code: '—', status: 'upcoming', label: 'Upcoming', bg: 'bg-slate-900/20 text-slate-700 border-transparent' };
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'punch_in':
      case 'punch_out':
        return <Clock className="w-3.5 h-3.5 text-teal-400" />;
      case 'break_start':
      case 'break_end':
        return <Coffee className="w-3.5 h-3.5 text-amber-400" />;
      case 'project_started':
        return <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />;
      case 'task_completed':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ticket_updated':
        return <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />;
      case 'work_update':
        return <History className="w-3.5 h-3.5 text-cyan-400" />;
      case 'correction':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-crm-border">
        <div>
          <button
            onClick={() => navigateTo(`/app/team/${employee.id}`)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {employee.name}'s Profile</span>
          </button>

          <div className="flex items-center gap-3">
            <Avatar name={employee.name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {employee.name}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                  {employee.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {employee.designation || employee.role} • {employee.department}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            leftIcon={<Calendar className="w-3.5 h-3.5 text-teal-400" />}
            onClick={() => navigateTo('/app/attendance')}
          >
            All Company Attendance
          </Button>
        </div>
      </div>

      {/* Monthly Stats Strip (Section 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div className="p-3 rounded-lg bg-[#0D1216] border border-[#1E262E]">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Present Days</span>
          <span className="text-xl font-bold font-mono text-teal-400">{monthlyMetrics.presentDays}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0D1216] border border-[#1E262E]">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Late Days</span>
          <span className="text-xl font-bold font-mono text-amber-400">{monthlyMetrics.lateDays}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0D1216] border border-[#1E262E]">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Leave Days</span>
          <span className="text-xl font-bold font-mono text-purple-400">{monthlyMetrics.leaveDays}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0D1216] border border-[#1E262E]">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Absent Days</span>
          <span className="text-xl font-bold font-mono text-rose-400">{monthlyMetrics.absentDays}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0D1216] border border-[#1E262E]">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Total Hours</span>
          <span className="text-xl font-bold font-mono text-white">{formatHoursMinutes(monthlyMetrics.totalWorkingMins)}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0D1216] border border-[#1E262E]">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Avg Daily Hours</span>
          <span className="text-xl font-bold font-mono text-teal-300">{formatHoursMinutes(monthlyMetrics.avgDailyMins)}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0D1216] border border-[#1E262E]">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Overtime</span>
          <span className="text-xl font-bold font-mono text-emerald-400">{formatHoursMinutes(monthlyMetrics.totalOvertimeMins)}</span>
        </div>
      </div>

      {/* Main 2-Column Split: Left Calendar View, Right Day Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Interactive Calendar (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 bg-[#0D1216] border-[#1E262E] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E262E]">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <span>September 2026 Calendar Roster</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click any calendar day to inspect the connected work session and activity timeline.
                </p>
              </div>

              {/* Status legend */}
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">P</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">L</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">LV</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">A</span>
              </div>
            </div>

            {/* Calendar Weekday headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono text-slate-500 uppercase tracking-wider pb-1">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div className="text-slate-600">Sat</div>
              <div className="text-slate-600">Sun</div>
            </div>

            {/* Calendar Days (Sep 1, 2026 is Tuesday -> 1 empty cell before day 1) */}
            <div className="grid grid-cols-7 gap-2 font-mono">
              <div className="h-16 rounded border border-transparent bg-transparent" />
              {daysInSeptember.map(day => {
                const dayMeta = getCalendarDayMeta(day);
                const dayDateStr = `2026-09-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDate === dayDateStr;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dayDateStr)}
                    className={`h-16 rounded-lg p-1.5 text-left border flex flex-col justify-between transition-all group ${
                      isSelected 
                        ? 'border-teal-400 bg-teal-500/10 shadow-sm' 
                        : 'border-[#1E262E] hover:border-slate-600 bg-[#12181E]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${isSelected ? 'text-teal-300' : 'text-slate-300'}`}>
                        {day}
                      </span>
                      <span className={`text-[9px] font-bold px-1 rounded border ${dayMeta.bg}`}>
                        {dayMeta.code}
                      </span>
                    </div>

                    <div className="text-[9px] text-slate-500 truncate w-full">
                      {dayDateStr === '2026-09-21' ? (
                        <span className="text-teal-400">Today</span>
                      ) : (
                        <span>{dayMeta.label}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Employee Day View & Connected Activity Timeline (5 Cols) (Section 14) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 bg-[#0D1216] border-[#1E262E] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E262E]">
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 font-semibold block">
                  DAILY SESSION AUDIT
                </span>
                <h3 className="text-sm font-bold text-white font-mono">
                  {selectedDate}
                </h3>
              </div>

              {selectedRecord ? (
                <Badge
                  variant={
                    selectedRecord.status === 'present' || selectedRecord.status === 'working' ? 'success' :
                    selectedRecord.status === 'late' ? 'warning' :
                    selectedRecord.status === 'leave' ? 'primary' : 'error'
                  }
                  size="sm"
                >
                  {selectedRecord.status.toUpperCase()}
                </Badge>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">NO PUNCH LOGGED</span>
              )}
            </div>

            {selectedRecord ? (
              <div className="space-y-4">
                {/* Punch In / Out / Break / Total Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded bg-[#12181E] border border-[#1E262E] font-mono text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Punch In</span>
                    <span className="font-semibold text-slate-200">{selectedRecord.punchIn || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Break</span>
                    <span className="font-semibold text-slate-200">{selectedRecord.breakMinutes}m</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Punch Out</span>
                    <span className="font-semibold text-slate-200">
                      {selectedRecord.punchOut || (selectedRecord.sessionState === 'working' ? 'Active' : '—')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Total</span>
                    <span className="font-semibold text-teal-400">{formatHoursMinutes(selectedRecord.totalWorkingMinutes)}</span>
                  </div>
                </div>

                {/* Administrative Correction Notice if exists */}
                {selectedRecord.correction?.isCorrected && (
                  <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Admin Correction Logged</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-snug">
                      "{selectedRecord.correction.reason}"
                    </p>
                    <span className="text-[9px] font-mono text-amber-400/70 block">
                      Corrected by Admin {selectedRecord.correction.correctedByName} at {selectedRecord.correction.correctedAt}
                    </span>
                  </div>
                )}

                {/* Connected Chronological Session Timeline */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-teal-400" />
                    <span>Work Session Event Stream</span>
                  </h4>

                  {selectedRecord.timeline.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      No timestamped events recorded for this session.
                    </p>
                  ) : (
                    <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-[#1E262E]">
                      {selectedRecord.timeline.map((event, idx) => (
                        <div key={event.id || idx} className="relative group">
                          {/* Dot indicator */}
                          <div className="absolute -left-6 top-0.5 p-1 rounded-full bg-[#12181E] border border-[#1E262E] group-hover:border-teal-400 transition-colors">
                            {getTimelineIcon(event.type)}
                          </div>

                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-[11px] font-mono font-semibold text-teal-400">
                                {event.time}
                              </span>
                              <span className="text-xs font-semibold text-slate-200">
                                {event.title}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-400">No work session recorded</p>
                <p className="text-[11px] text-slate-600 mt-1">This was an unworked day, weekend, or future date.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
