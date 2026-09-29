import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { Input } from '../../../components/ui/Input';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  FolderKanban, 
  CheckSquare, 
  TrendingUp, 
  Send, 
  Plus, 
  MapPin, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  History,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { PunchControlWidget } from '../../attendance/PunchControlWidget';
import { AttendanceCorrectionModal } from '../../attendance/AttendanceCorrectionModal';
import { DEFAULT_SHIFTS } from '../../../services/attendanceService';
import { AttendanceRecord } from '../../../types/attendance';
import { Task, TaskStatus } from '../../../types/projects';

interface EmployeeDashboardProps {
  onSwitchToAdmin?: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onSwitchToAdmin }) => {
  const { 
    currentUser, 
    attendanceRecords, 
    currentUserAttendance, 
    tasks, 
    projects, 
    updateTaskStatus,
    correctionRequests, 
    workUpdates, 
    submitDailyUpdate, 
    leaveBalances,
    navigateTo, 
    addToast,
    todayDateStr,
    employeeLogout
  } = useCRM();

  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [selectedRecordForCorrection, setSelectedRecordForCorrection] = useState<AttendanceRecord | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'due_today' | 'in_progress' | 'done'>('all');

  // Daily Standup Form state
  const [completedWork, setCompletedWork] = useState('');
  const [inProgressWork, setInProgressWork] = useState('');
  const [blockers, setBlockers] = useState('');
  const [nextWork, setNextWork] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [isStandupSubmitted, setIsStandupSubmitted] = useState(false);

  // Today's record for current user
  const todayRecord = attendanceRecords.find(
    r => r.employeeId === currentUser.id && (r.date === todayDateStr || r.date === '2026-09-27' || r.date === '2026-09-21')
  );

  // My shift details
  const myShift = DEFAULT_SHIFTS.find(s => s.id === currentUserAttendance?.shiftId) || DEFAULT_SHIFTS[0];

  // My tasks
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const filteredTasks = myTasks.filter(t => {
    if (taskFilter === 'due_today') return t.deadline === todayDateStr || t.deadline === '2026-09-27' || t.deadline === '2026-09-21';
    if (taskFilter === 'in_progress') return t.status === 'in_progress';
    if (taskFilter === 'done') return t.status === 'done';
    return true;
  });

  // My projects
  const myProjects = projects.filter(p => p.teamIds?.includes(currentUser.id) || p.managerId === currentUser.id).slice(0, 3);

  // My recent punch history (last 5 records)
  const myHistory = attendanceRecords
    .filter(r => r.employeeId === currentUser.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // My pending correction requests
  const myPendingCorrections = correctionRequests.filter(c => c.employeeId === currentUser.id);

  // Check if today's standup update is already submitted
  const todayUpdate = workUpdates.find(
    u => u.employeeId === currentUser.id && (u.date === todayDateStr || u.date === '2026-09-27' || u.date === '2026-09-21')
  );

  const handleTaskToggle = (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'done' ? 'in_progress' : 'done';
    updateTaskStatus(taskId, nextStatus);
    addToast({
      type: 'info',
      title: 'Task Updated',
      message: `Task status changed to ${nextStatus.replace('_', ' ')}`
    });
  };

  const handleOpenCorrection = (rec?: AttendanceRecord) => {
    setSelectedRecordForCorrection(rec || todayRecord || myHistory[0] || null);
    setIsCorrectionModalOpen(true);
  };

  const handleStandupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedWork.trim() && !inProgressWork.trim()) {
      addToast({
        type: 'warning',
        title: 'Empty Standup',
        message: 'Please mention completed or ongoing work items.'
      });
      return;
    }

    const proj = projects.find(p => p.id === selectedProjectId) || projects[0];

    submitDailyUpdate({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeAvatar: currentUser.avatar,
      employeeDesignation: currentUser.designation || currentUser.role,
      projectId: proj?.id || 'p-1',
      projectName: proj?.name || 'Star Chain CRM',
      completedItems: completedWork ? [completedWork] : ['Completed assigned sprint deliverables'],
      inProgressItems: inProgressWork ? [inProgressWork] : ['Active feature branch development'],
      blockedItems: blockers ? [blockers] : [],
      nextActionItems: nextWork ? [nextWork] : ['Continue sprint tasks'],
      hoursSpent: 8.0,
      date: todayDateStr || '2026-09-27'
    });

    setIsStandupSubmitted(true);
    addToast({
      type: 'success',
      title: 'Standup Submitted',
      message: 'Your daily update has been logged for your team and manager.'
    });
  };

  // Leave balance for current user
  const userBalance = leaveBalances[currentUser.id];
  const casualRemaining = userBalance?.casual?.remaining ?? 5;
  const sickRemaining = userBalance?.sick?.remaining ?? 4;
  const annualRemaining = userBalance?.annual?.remaining ?? 12;
  const totalRemaining = casualRemaining + sickRemaining + annualRemaining;

  // Calculate shift progress percentage
  const totalShiftMins = 8.5 * 60;
  const currentWorkingMins = todayRecord?.totalWorkingMinutes || (currentUserAttendance?.sessionState === 'working' ? 320 : 0);
  const shiftProgressPercent = Math.min(100, Math.round((currentWorkingMins / totalShiftMins) * 100));

  const canSwitchToAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'manager';

  return (
    <div className="space-y-6">
      {/* 1. EMPLOYEE HERO BANNER — FIGMA GLASS */}
      <div className="relative overflow-hidden figma-glass border border-turquoise/30 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-turquoise/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={currentUser.name} size="lg" className="border-2 border-turquoise shadow-md ring-2 ring-turquoise/20" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-crm-text tracking-tight">
                  Good Day, {currentUser.name}
                </h1>
                <Badge variant="primary" className="bg-turquoise/15 text-turquoise border-turquoise/30 text-xs px-2.5 py-0.5 font-medium">
                  Employee Workspace
                </Badge>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {currentUserAttendance?.sessionState === 'working' ? 'Actively Working' : currentUserAttendance?.sessionState === 'on_break' ? 'On Break' : 'Ready to Punch In'}
                </span>
              </div>
              <p className="text-xs text-crm-textMuted mt-1 flex items-center gap-2 flex-wrap">
                <span>{currentUser.designation || 'Staff Member'}</span>
                <span>•</span>
                <span>{currentUser.department} Department</span>
                <span>•</span>
                <span className="font-mono text-[11px] text-turquoise/90">Emp ID: {currentUser.id}</span>
              </p>
            </div>
          </div>

          {/* Quick Date, Time & Admin View Switcher */}
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="text-right hidden sm:block bg-crm-surface/80 border border-crm-border/60 px-3.5 py-1.5 rounded-lg shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-crm-text font-mono">
                <Calendar className="w-3.5 h-3.5 text-turquoise" />
                <span>Sunday, 27 Sep 2026</span>
              </div>
              <p className="text-[10px] text-crm-textMuted font-mono">HQ Time: 09:30 AM IST</p>
            </div>

            {canSwitchToAdmin && onSwitchToAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSwitchToAdmin}
                className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10 gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch to Admin Command</span>
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('/app/my-attendance')}
              className="text-xs gap-1.5 bg-turquoise hover:bg-turquoise-hover text-slate-950 font-bold shadow-md shadow-turquoise/10"
            >
              <History className="w-3.5 h-3.5 text-slate-950" />
              <span>Full Attendance Log</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={employeeLogout}
              className="text-xs border-crm-border text-crm-textMuted hover:text-red-400 hover:border-red-500/40 gap-1.5"
              title="Lock terminal and sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock / Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. TOP ROW: LIVE SHIFT COCKPIT & PUNCH CLOCK (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Punch Control Widget (7 cols) */}
        <div className="lg:col-span-7">
          <div className="figma-card p-6 rounded-2xl h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-crm-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-turquoise/10 border border-turquoise/30 flex items-center justify-center text-turquoise">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-crm-text">Attendance & Shift Clock</h2>
                  <p className="text-[11px] text-crm-textMuted">Punch in/out, register breaks, and select your active work mode</p>
                </div>
              </div>
              <Badge variant="neutral" className="text-[10px] font-mono border-crm-border text-crm-textMuted">
                Server Validated
              </Badge>
            </div>

            <PunchControlWidget compact={false} />
          </div>
        </div>

        {/* Right Column: Shift Details & Location Schedule (5 cols) */}
        <div className="lg:col-span-5">
          <div className="figma-card p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-crm-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-crm-text">Today's Shift & Schedule</h2>
                    <p className="text-[11px] text-crm-textMuted">Rostered shift rules and grace period tracking</p>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Assigned
                </Badge>
              </div>

              {/* Shift Details Box */}
              <div className="p-3.5 bg-crm-surface/80 rounded-lg border border-crm-border/70 space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-crm-text">{myShift.name}</span>
                  <span className="text-xs font-mono font-bold text-turquoise">{myShift.startTime} - {myShift.endTime}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-crm-border/40">
                  <div>
                    <span className="text-[10px] text-crm-textMuted uppercase font-medium">Grace Window</span>
                    <p className="font-medium text-crm-text mt-0.5">{myShift.graceMinutes} Minutes</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-crm-textMuted uppercase font-medium">Break Quota</span>
                    <p className="font-medium text-crm-text mt-0.5">{myShift.breakMinutes} Minutes allowed</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-crm-textMuted uppercase font-medium">Geofence HQ</span>
                    <p className="font-medium text-emerald-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> 150m Radius
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-crm-textMuted uppercase font-medium">Punctuality</span>
                    <p className="font-medium text-emerald-400 mt-0.5">On Time (09:14 AM)</p>
                  </div>
                </div>

                {/* Shift Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
                    <span className="text-crm-textMuted">Shift Progress</span>
                    <span className="text-turquoise font-mono font-bold">{shiftProgressPercent}% ({Math.floor(currentWorkingMins / 60)}h {currentWorkingMins % 60}m logged)</span>
                  </div>
                  <div className="w-full h-2 bg-crm-surface rounded-full overflow-hidden border border-crm-border/60">
                    <div 
                      className="h-full bg-gradient-to-r from-turquoise to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${shiftProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Correction Request Trigger */}
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-300">Missed punch or incorrect time?</p>
                  <p className="text-[10px] text-crm-textMuted">Submit an audit-backed correction request for manager approval</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenCorrection()}
                className="text-xs text-amber-300 border-amber-500/30 hover:bg-amber-500/10 flex-shrink-0 py-1"
              >
                Request Correction
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECOND ROW: MONTHLY ATTENDANCE & LEAVE METRICS (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-crm-card border border-crm-border rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted">Days Present</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-crm-text mt-2">24 / 25</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>96% Monthly Present Rate</span>
          </div>
        </div>

        <div className="p-4 bg-crm-card border border-crm-border rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted">Punctuality Score</span>
            <div className="w-7 h-7 rounded-lg bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-turquoise mt-2">94.2%</p>
          <p className="text-[11px] text-crm-textMuted mt-1">1 Grace punch • 0 Unauthorized</p>
        </div>

        <div className="p-4 bg-crm-card border border-crm-border rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted">Overtime Logged</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-crm-text mt-2">+5h 30m</p>
          <p className="text-[11px] text-blue-400 mt-1">Eligible for comp-off leave</p>
        </div>

        <div className="p-4 bg-crm-card border border-crm-border rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted">Available Leaves</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold font-mono text-crm-text">
              {totalRemaining} <span className="text-xs font-normal text-crm-textMuted">Days</span>
            </p>
            <button
              onClick={() => navigateTo('/app/leave')}
              className="text-[11px] text-turquoise hover:underline font-semibold flex items-center gap-0.5"
            >
              Apply <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-crm-textMuted mt-1">
            CL: {casualRemaining} • SL: {sickRemaining} • EL: {annualRemaining}
          </p>
        </div>
      </div>

      {/* 4. THIRD ROW: MY TASKS & MY PROJECTS (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Today's Assigned Tasks Checklist */}
        <div className="figma-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-crm-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-crm-text">Today's Priority Tasks</h2>
                <p className="text-[11px] text-crm-textMuted">Assigned deliverables and sprint subtasks</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-crm-surface p-1 rounded-lg border border-crm-border/60 text-[10px]">
              {(['all', 'due_today', 'in_progress', 'done'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTaskFilter(tab)}
                  className={`px-2 py-0.5 rounded capitalize font-medium transition-colors ${
                    taskFilter === tab ? 'bg-turquoise text-slate-950 font-bold' : 'text-crm-textMuted hover:text-crm-text'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-crm-textMuted text-xs bg-crm-surface/40 rounded-lg border border-dashed border-crm-border">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400/60 mb-2" />
              <p className="font-medium text-crm-text">No tasks in this filter</p>
              <p className="text-[11px] mt-0.5">You are all caught up on deliverables!</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {filteredTasks.slice(0, 5).map(task => {
                const isDone = task.status === 'done';
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border transition-all flex items-start gap-3 ${
                      isDone 
                        ? 'bg-crm-surface/40 border-crm-border/40 opacity-70' 
                        : 'bg-crm-surface border-crm-border/80 hover:border-turquoise/40 shadow-sm'
                    }`}
                  >
                    <button
                      onClick={() => handleTaskToggle(task.id, task.status)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                        isDone ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-crm-border hover:border-turquoise'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3 h-3 fill-current" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-semibold truncate ${isDone ? 'line-through text-crm-textMuted' : 'text-crm-text'}`}>
                          {task.title}
                        </h4>
                        <Badge 
                          variant={task.priority === 'critical' ? 'error' : task.priority === 'high' ? 'warning' : 'primary'}
                          className="text-[9px] uppercase px-1.5 py-0 flex-shrink-0"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-crm-textMuted mt-1">
                        <span className="flex items-center gap-1 text-turquoise font-medium">
                          <FolderKanban className="w-3 h-3" />
                          {task.projectName || 'Internal Sprint'}
                        </span>
                        <span>•</span>
                        <span>Due: {task.deadline || 'Today'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: My Active Projects */}
        <div className="figma-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-crm-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FolderKanban className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-crm-text">My Assigned Projects</h2>
                <p className="text-[11px] text-crm-textMuted">Active codebases and client milestones</p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('/app/projects')}
              className="text-xs text-turquoise hover:underline font-medium flex items-center gap-1"
            >
              All Projects <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {myProjects.length === 0 ? (
              <div className="p-8 text-center text-crm-textMuted text-xs bg-crm-surface/40 rounded-lg border border-dashed border-crm-border">
                <p>No projects currently assigned.</p>
              </div>
            ) : (
              myProjects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => navigateTo(`/app/projects/${proj.id}`)}
                  className="p-3.5 bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/70 hover:border-turquoise/30 rounded-lg cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-crm-text">{proj.name}</h4>
                    <Badge variant={proj.status === 'active' ? 'success' : 'neutral'} className="text-[10px] capitalize">
                      {proj.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-crm-textMuted mt-0.5 line-clamp-1">{proj.description}</p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-crm-textMuted mb-1 font-mono">
                      <span>Progress</span>
                      <span className="text-turquoise font-bold">{proj.progress || 65}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-crm-card rounded-full overflow-hidden border border-crm-border/40">
                      <div 
                        className="h-full bg-turquoise rounded-full"
                        style={{ width: `${proj.progress || 65}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. FOURTH ROW: DAILY STANDUP & RECENT PUNCHES (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Daily Standup Work Update Form */}
        <div className="figma-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-crm-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-crm-text">Daily Standup Update</h2>
                <p className="text-[11px] text-crm-textMuted">Sync your completed work and blockers with manager</p>
              </div>
            </div>

            <Badge variant={todayUpdate || isStandupSubmitted ? 'success' : 'warning'} className="text-[10px]">
              {todayUpdate || isStandupSubmitted ? 'Submitted Today' : 'Pending Today'}
            </Badge>
          </div>

          {todayUpdate || isStandupSubmitted ? (
            <div className="p-4 bg-crm-surface/80 border border-crm-border/70 rounded-lg space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Today's Standup Logged Successfully</span>
              </div>
              <div className="space-y-1.5 pl-6 text-[11px] text-crm-textMuted pt-1">
                <p><strong className="text-crm-text">Project:</strong> {todayUpdate?.projectName || 'Star Chain CRM'}</p>
                <p><strong className="text-crm-text">Accomplished:</strong> {todayUpdate?.completedItems?.join(', ') || completedWork || 'Completed sprint tasks'}</p>
                {todayUpdate?.blockedItems?.length ? (
                  <p className="text-amber-400"><strong>Blockers:</strong> {todayUpdate.blockedItems.join(', ')}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <form onSubmit={handleStandupSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-crm-textMuted mb-1">
                  What did you complete today?
                </label>
                <Input
                  placeholder="e.g. Fixed attendance state machine and added GPS geofence"
                  value={completedWork}
                  onChange={e => setCompletedWork(e.target.value)}
                  className="text-xs py-1.5"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-crm-textMuted mb-1">
                  What are you working on next?
                </label>
                <Input
                  placeholder="e.g. Unit tests for punch corrections and shift grace window"
                  value={inProgressWork}
                  onChange={e => setInProgressWork(e.target.value)}
                  className="text-xs py-1.5"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-crm-textMuted mb-1">
                  Any blockers or dependencies? (optional)
                </label>
                <Input
                  placeholder="e.g. Awaiting Supabase service role key credentials"
                  value={blockers}
                  onChange={e => setBlockers(e.target.value)}
                  className="text-xs py-1.5"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-crm-textMuted">Project:</span>
                  <select
                    value={selectedProjectId}
                    onChange={e => setSelectedProjectId(e.target.value)}
                    className="bg-crm-surface border border-crm-border text-crm-text text-xs rounded px-2 py-1"
                  >
                    {projects.length > 0 ? (
                      projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                    ) : (
                      <option value="">General Workstream</option>
                    )}
                  </select>
                </div>

                <Button variant="primary" size="sm" type="submit" className="gap-1.5 text-xs bg-turquoise hover:bg-turquoise-hover text-slate-950 font-bold">
                  <Send className="w-3 h-3" /> Submit Standup
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Recent Punch History & Correction Status */}
        <div className="figma-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-crm-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-crm-text">Recent Punch History</h2>
                <p className="text-[11px] text-crm-textMuted">Audit-verified timestamps and correction status</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenCorrection()}
              className="text-xs gap-1 text-turquoise border-turquoise/30 hover:bg-turquoise/10"
            >
              <Plus className="w-3 h-3" /> Correction
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-crm-border/60 text-[10px] uppercase font-bold text-crm-textMuted tracking-wider">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">In</th>
                  <th className="pb-2">Out</th>
                  <th className="pb-2">Hours</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crm-border/30">
                {myHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-crm-textMuted text-xs">
                      No punch records found. Clock in to record your shift.
                    </td>
                  </tr>
                ) : (
                  myHistory.map(rec => {
                  const hrs = Math.floor(rec.totalWorkingMinutes / 60);
                  const mins = rec.totalWorkingMinutes % 60;
                  return (
                    <tr key={rec.id} className="hover:bg-crm-surfaceHover/50 transition-colors">
                      <td className="py-2.5 font-mono text-[11px] text-crm-text font-medium">
                        {rec.date}
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-emerald-400">
                        {rec.punchIn || '--:--'}
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-crm-textMuted">
                        {rec.punchOut || '--:--'}
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-turquoise font-medium">
                        {hrs}h {mins}m
                      </td>
                      <td className="py-2.5 text-right">
                        <Badge 
                          variant={rec.status === 'present' ? 'success' : rec.status === 'late' ? 'warning' : 'neutral'}
                          className="text-[9px] uppercase px-1.5 py-0"
                        >
                          {rec.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>

          {/* Pending Correction Alert if any */}
          {myPendingCorrections.length > 0 && (
            <div className="mt-3 p-2.5 bg-crm-surface rounded-lg border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-amber-300 font-medium">
                  {myPendingCorrections.length} correction request awaiting manager review
                </span>
              </div>
              <Badge variant="warning" className="text-[9px]">
                Pending
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Correction Modal */}
      {isCorrectionModalOpen && (
        <AttendanceCorrectionModal
          isOpen={isCorrectionModalOpen}
          onClose={() => setIsCorrectionModalOpen(false)}
          record={selectedRecordForCorrection}
        />
      )}
    </div>
  );
};
