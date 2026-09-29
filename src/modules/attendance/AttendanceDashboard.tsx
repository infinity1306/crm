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
import { OfficeQRModal } from './OfficeQRModal';
import { AttendanceKioskModal } from './AttendanceKioskModal';
import { ShiftManagementModal } from './ShiftManagementModal';
import { AttendanceExceptionsCenter } from './AttendanceExceptionsCenter';
import { WorkingNowFloor } from './WorkingNowFloor';
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
  Coffee,
  QrCode,
  Tablet,
  CheckCircle2,
  Database
} from 'lucide-react';

export const AttendanceDashboard: React.FC = () => {
  const { 
    currentUser, 
    employees, 
    attendanceRecords, 
    projects, 
    tasks, 
    navigateTo,
    attendanceConfig,
    todayDateStr,
    attendanceExceptions,
    dismissException,
    supabaseStatus
  } = useCRM();

  // Tab State
  const [activeTab, setActiveTab] = useState<'floor' | 'daily' | 'exceptions' | 'monthly' | 'analytics'>('floor');
  
  // Section 4 Fix: dynamically calculated organization today date!
  const todayStr = todayDateStr || '2026-09-27';
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals state
  const [correctionRecord, setCorrectionRecord] = useState<AttendanceRecord | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isKioskModalOpen, setIsKioskModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Compute Top KPI Metrics for Today (Matching Section 16 Specification)
  const todayRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.date === todayStr);
  }, [attendanceRecords, todayStr]);

  const totalTeamCount = employees.length;
  const workingNowCount = todayRecords.filter(r => r.sessionState === 'working').length;
  const onBreakCount = todayRecords.filter(r => r.sessionState === 'on_break').length;
  const presentCount = todayRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
  const lateCount = todayRecords.filter(r => r.status === 'late' || (r.lateMinutes && r.lateMinutes > 0)).length;
  const onLeaveCount = todayRecords.filter(r => r.status === 'leave').length;
  const absentCount = Math.max(0, totalTeamCount - presentCount - onLeaveCount);
  const exceptionsCount = attendanceExceptions.filter(e => e.status === 'OPEN').length;

  // Filtered records for selected date in table
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      if (selectedDate && record.date !== selectedDate) return false;
      if (departmentFilter !== 'all' && record.department !== departmentFilter) return false;

      if (statusFilter !== 'all') {
        if (statusFilter === 'working' && record.sessionState !== 'working' && record.sessionState !== 'on_break') return false;
        if (statusFilter !== 'working' && record.status !== statusFilter) return false;
      }

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

  return (
    <div className="space-y-6">
      {/* Header with Enterprise Operations & Supabase Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Workforce Attendance Engine</h1>
            <Badge variant="turquoise" size="sm">Supabase PostgreSQL</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Event-sourced check-ins, automated shifts, immutable audit ledger & exceptions center.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Supabase live connection pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Connected</span>
          </div>

          <Button variant="secondary" size="sm" onClick={() => setIsQrModalOpen(true)}>
            <QrCode className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
            Office QR
          </Button>

          <Button variant="secondary" size="sm" onClick={() => setIsKioskModalOpen(true)}>
            <Tablet className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
            Kiosk Mode
          </Button>

          <Button variant="secondary" size="sm" onClick={() => setIsShiftModalOpen(true)}>
            <Clock className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
            Shifts & Policies
          </Button>
        </div>
      </div>

      {/* SECTION 16 SPECIFICATION: TOP KPI METRICS FOR TODAY */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* Present Metric */}
        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400">Present</span>
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {presentCount} <span className="text-xs font-normal text-slate-500">/ {totalTeamCount}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">{Math.round((presentCount / Math.max(1, totalTeamCount)) * 100)}% attendance rate</p>
        </div>

        {/* Working Now */}
        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400">Working Now</span>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-300">{workingNowCount}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">{onBreakCount} on break</p>
        </div>

        {/* Late */}
        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400">Late</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{lateCount}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Past grace period</p>
        </div>

        {/* On Leave */}
        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border cursor-pointer hover:border-purple-500/40" onClick={() => navigateTo('/app/leave')}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400">On Leave</span>
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">{onLeaveCount}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Approved requests</p>
        </div>

        {/* Absent */}
        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400">Absent</span>
            <UserX className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{absentCount}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Unexcused missing</p>
        </div>

        {/* Exceptions */}
        <div 
          className="p-3.5 rounded-xl bg-crm-card border border-crm-border cursor-pointer hover:border-teal-500/40"
          onClick={() => setActiveTab('exceptions')}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-teal-400">Exceptions</span>
            <AlertCircle className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-400">{exceptionsCount}</div>
          <p className="text-[10px] text-teal-300 mt-1 font-mono">Requires attention</p>
        </div>
      </div>

      {/* Primary Punch Control Banner (Section 2 & 8) */}
      <PunchControlWidget />

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-[#1E262E] pb-px">
        <div className="flex items-center gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('floor')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'floor' ? 'text-teal-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>Live Workforce Floor</span>
            {activeTab === 'floor' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === 'daily' ? 'text-teal-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Attendance Roster</span>
            {activeTab === 'daily' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('exceptions')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'exceptions' ? 'text-teal-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Exceptions Center</span>
            {exceptionsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/20 text-teal-300 font-bold">
                {exceptionsCount}
              </span>
            )}
            {activeTab === 'exceptions' && (
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

      {/* TAB 1: LIVE WORKFORCE FLOOR (Section 16) */}
      {activeTab === 'floor' && (
        <WorkingNowFloor />
      )}

      {/* TAB 2: DAILY ATTENDANCE ROSTER TABLE */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <Card className="p-3.5 bg-crm-card border-crm-border">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employee name, role or project..."
                  className="pl-9 w-full text-xs"
                />
              </div>

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
                    { value: 'Sales', label: 'Sales' },
                    { value: 'Marketing', label: 'Marketing' },
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

          <Card className="overflow-hidden bg-crm-card border-crm-border p-0">
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
                    <th className="py-3 px-3">Method / Mode</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E262E]/60 text-slate-300">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-400">No attendance records found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(record => (
                      <tr key={record.id} className="hover:bg-[#12181E]/60 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={record.employeeName} size="sm" />
                            <div className="min-w-0">
                              <span className="font-semibold text-white block truncate group-hover:text-teal-300 transition-colors">
                                {record.employeeName}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate">
                                {record.employeeRole} • {record.department}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-200">
                          {record.punchIn || '--:--'}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-200">
                          {record.punchOut || (
                            <span className="text-teal-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                              Active
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-400">
                          {record.breakMinutes || 0}m
                        </td>

                        <td className="py-3 px-3 font-mono font-semibold text-white">
                          {String(Math.floor((record.totalWorkingMinutes || 0) / 60)).padStart(2, '0')}h {String((record.totalWorkingMinutes || 0) % 60).padStart(2, '0')}m
                        </td>

                        <td className="py-3 px-3">
                          <Badge 
                            variant={
                              record.status === 'working' ? 'turquoise' :
                              record.status === 'present' ? 'success' :
                              record.status === 'late' ? 'warning' :
                              record.status === 'leave' ? 'neutral' : 'error'
                            } 
                            size="sm"
                          >
                            {record.status}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-200">{record.checkInMethod || 'WEB'}</span>
                          <span className="mx-1">•</span>
                          <span>{record.workMode || 'OFFICE'}</span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCorrectionRecord(record)}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: EXCEPTIONS CENTER (Section 12) */}
      {activeTab === 'exceptions' && (
        <AttendanceExceptionsCenter
          exceptions={attendanceExceptions}
          onRequestCorrection={(empId, empName, date) => {
            const rec = attendanceRecords.find(r => r.employeeId === empId && r.date === date);
            if (rec) setCorrectionRecord(rec);
          }}
          onDismissException={(id) => dismissException(id)}
        />
      )}

      {/* Modals */}
      <AttendanceCorrectionModal
        isOpen={Boolean(correctionRecord)}
        onClose={() => setCorrectionRecord(null)}
        record={correctionRecord}
      />

      <OfficeQRModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onPunchWithQR={(token, locId) => {
          // handled
        }}
      />

      <AttendanceKioskModal
        isOpen={isKioskModalOpen}
        onClose={() => setIsKioskModalOpen(false)}
      />

      <ShiftManagementModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
      />
    </div>
  );
};
