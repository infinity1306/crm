import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Clock, 
  Play, 
  Square, 
  Coffee, 
  CheckCircle2, 
  AlertCircle, 
  FolderKanban, 
  CheckSquare, 
  ChevronDown,
  Sparkles,
  Timer
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';

interface PunchControlWidgetProps {
  compact?: boolean;
}

export const PunchControlWidget: React.FC<PunchControlWidgetProps> = ({ compact = false }) => {
  const { 
    currentUser, 
    currentUserAttendance, 
    projects, 
    tasks, 
    punchIn, 
    punchOut, 
    startBreak, 
    endBreak,
    attendanceConfig 
  } = useCRM();

  // Current live clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [breakReason, setBreakReason] = useState<string>('Lunch Break');
  const [showProjectPicker, setShowProjectPicker] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set default project & task if user has assigned tasks
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      const userProject = projects.find(p => p.teamIds.includes(currentUser.id)) || projects[0];
      if (userProject) {
        setSelectedProjectId(userProject.id);
        const projectTasks = tasks.filter(t => t.projectId === userProject.id && t.assigneeId === currentUser.id && t.status !== 'done');
        if (projectTasks.length > 0) {
          setSelectedTaskId(projectTasks[0].id);
        }
      }
    }
  }, [projects, tasks, currentUser.id, selectedProjectId]);

  const timeFormatted = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateFormatted = currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Calculate live elapsed working time
  const getElapsedDuration = (): string => {
    if (!currentUserAttendance || !currentUserAttendance.punchIn || currentUserAttendance.punchIn === '00:00') {
      return '00h 00m';
    }
    if (currentUserAttendance.punchOut) {
      const mins = currentUserAttendance.totalWorkingMinutes;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
    }

    const [inH, inM] = currentUserAttendance.punchIn.split(':').map(Number);
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const punchInMinutes = inH * 60 + inM;
    const elapsed = Math.max(0, nowMinutes - punchInMinutes - (currentUserAttendance.breakMinutes || 0));
    const h = Math.floor(elapsed / 60);
    const m = elapsed % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  };

  const getElapsedBreakDuration = (): string => {
    if (!currentUserAttendance || currentUserAttendance.sessionState !== 'on_break') {
      return '00m';
    }
    const currentBreak = currentUserAttendance.breaks[currentUserAttendance.breaks.length - 1];
    if (!currentBreak) return '00m';

    const [bH, bM] = currentBreak.start.split(':').map(Number);
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const breakMinutes = Math.max(0, nowMinutes - (bH * 60 + bM));
    return `${breakMinutes}m`;
  };

  const sessionState = currentUserAttendance ? currentUserAttendance.sessionState : 'not_started';
  const firstName = currentUser.name.split(' ')[0].toUpperCase();

  const handlePunchIn = () => {
    punchIn(currentUser.id, selectedProjectId, selectedTaskId);
  };

  const handlePunchOut = () => {
    if (window.confirm('Are you sure you want to punch out and complete your workday?')) {
      punchOut(currentUser.id);
    }
  };

  const handleStartBreak = () => {
    startBreak(currentUser.id, breakReason);
  };

  const handleEndBreak = () => {
    endBreak(currentUser.id);
  };

  // Filter tasks for selected project
  const availableTasks = tasks.filter(t => t.projectId === selectedProjectId && t.status !== 'done');

  return (
    <div className="bg-[#0D1216] border border-[#1E262E] rounded-lg p-5 shadow-card relative overflow-hidden">
      {/* Top subtle status accent line */}
      <div 
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          sessionState === 'working' ? 'bg-teal-500' :
          sessionState === 'on_break' ? 'bg-amber-500' :
          sessionState === 'completed' ? 'bg-emerald-500' : 'bg-slate-700'
        }`} 
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Salutation, Digital Clock & Date */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-semibold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                sessionState === 'working' ? 'bg-teal-400 animate-pulse' :
                sessionState === 'on_break' ? 'bg-amber-400' :
                sessionState === 'completed' ? 'bg-emerald-400' : 'bg-slate-500'
              }`} />
              {sessionState === 'working' ? 'WORK SESSION ACTIVE' :
               sessionState === 'on_break' ? 'ON BREAK' :
               sessionState === 'completed' ? 'WORKDAY COMPLETE' : 'NOT STARTED'}
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-400">
              Shift Policy: {attendanceConfig.expectedStartTime} AM ({Math.round(attendanceConfig.workdayDurationMinutes / 60)}h)
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-mono">
              {timeFormatted}
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {dateFormatted}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            {sessionState === 'not_started' && (
              <span>Good morning, <strong className="text-slate-200">{currentUser.name}</strong>. Ready to begin your workday?</span>
            )}
            {sessionState === 'working' && (
              <span>Working since <strong className="text-white font-mono">{currentUserAttendance?.punchIn} AM</strong></span>
            )}
            {sessionState === 'on_break' && (
              <span>On break since <strong className="text-amber-300 font-mono">{currentUserAttendance?.breaks[currentUserAttendance.breaks.length - 1]?.start}</strong></span>
            )}
            {sessionState === 'completed' && (
              <span>Logged <strong className="text-white font-mono">{getElapsedDuration()}</strong> total working time today</span>
            )}
          </p>
        </div>

        {/* Center: Live Duration & Connected Project */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-2 px-4 rounded-lg bg-[#12181E] border border-[#1E262E]">
          {/* Work Duration Counter */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {sessionState === 'on_break' ? 'Break Elapsed' : 'Time Worked'}
            </span>
            <div className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
              <Timer className={`w-4 h-4 ${sessionState === 'working' ? 'text-teal-400' : 'text-slate-500'}`} />
              <span>{sessionState === 'on_break' ? getElapsedBreakDuration() : getElapsedDuration()}</span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-[#1E262E]" />

          {/* Active Work Delivery Context */}
          <div className="space-y-0.5 max-w-[240px]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Delivery Context
            </span>
            <div className="text-xs truncate">
              {currentUserAttendance?.currentProjectName ? (
                <div className="flex items-center gap-1.5 text-slate-200 truncate">
                  <FolderKanban className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{currentUserAttendance.currentProjectName}</span>
                </div>
              ) : selectedProjectId ? (
                <div className="flex items-center gap-1.5 text-slate-300 truncate">
                  <FolderKanban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{projects.find(p => p.id === selectedProjectId)?.name || 'Project'}</span>
                </div>
              ) : (
                <span className="text-slate-500 italic">No project linked</span>
              )}
            </div>
            {currentUserAttendance?.currentTaskTitle && (
              <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{currentUserAttendance.currentTaskTitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Primary Punch / Break / Punch Out Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          {sessionState === 'not_started' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {/* Optional Project Assignment Dropdown */}
              <div className="flex items-center gap-1">
                <Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  options={[
                    { value: '', label: 'Select Project (Optional)' },
                    ...projects.map(p => ({ value: p.id, label: p.name }))
                  ]}
                  className="text-xs max-w-[180px]"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                className="bg-teal-600 hover:bg-teal-500 text-white font-mono tracking-wider font-semibold text-xs px-5 shadow-sm"
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                onClick={handlePunchIn}
              >
                PUNCH IN
              </Button>
            </div>
          )}

          {sessionState === 'working' && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs font-mono border-slate-700 text-slate-300 hover:text-white"
                leftIcon={<Coffee className="w-3.5 h-3.5 text-amber-400" />}
                onClick={handleStartBreak}
              >
                START BREAK
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}
                onClick={handlePunchOut}
              >
                PUNCH OUT
              </Button>
            </div>
          )}

          {sessionState === 'on_break' && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono tracking-wider"
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                onClick={handleEndBreak}
              >
                RESUME WORK
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}
                onClick={handlePunchOut}
              >
                PUNCH OUT
              </Button>
            </div>
          )}

          {sessionState === 'completed' && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Shift Completed ({currentUserAttendance?.punchIn} — {currentUserAttendance?.punchOut})</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
