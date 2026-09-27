import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Play, 
  Coffee, 
  LogOut, 
  MapPin, 
  QrCode, 
  Navigation, 
  Tablet, 
  CheckCircle2, 
  FolderKanban, 
  CheckSquare, 
  Timer,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { WorkMode, CheckInMethod } from '../../types/attendance';
import { OfficeQRModal } from './OfficeQRModal';
import { GPSCheckInModal } from './GPSCheckInModal';
import { AttendanceKioskModal } from './AttendanceKioskModal';
import { DEFAULT_SHIFTS } from '../../services/attendanceService';

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
    todayDateStr
  } = useCRM();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [workMode, setWorkMode] = useState<WorkMode>('OFFICE');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  
  // Modals state
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isGpsOpen, setIsGpsOpen] = useState(false);
  const [isKioskOpen, setIsKioskOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const shift = DEFAULT_SHIFTS[0];
  const sessionState = currentUserAttendance?.sessionState || 'not_started';

  // Live elapsed time
  const getElapsedDuration = (): string => {
    if (!currentUserAttendance || !currentUserAttendance.punchIn || currentUserAttendance.punchIn === '00:00') {
      return '00h 00m';
    }
    if (currentUserAttendance.punchOut) {
      const mins = currentUserAttendance.totalWorkingMinutes || 0;
      return `${String(Math.floor(mins / 60)).padStart(2, '0')}h ${String(mins % 60).padStart(2, '0')}m`;
    }

    const [inH, inM] = currentUserAttendance.punchIn.split(':').map(Number);
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const elapsed = Math.max(0, nowMinutes - (inH * 60 + inM) - (currentUserAttendance.breakMinutes || 0));
    return `${String(Math.floor(elapsed / 60)).padStart(2, '0')}h ${String(elapsed % 60).padStart(2, '0')}m`;
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={`bg-crm-card border border-crm-border rounded-xl ${compact ? 'p-4' : 'p-6'} shadow-sm relative`}>
      {sessionState === 'not_started' ? (
        /* SECTION 2 SPECIFICATION: NOT CHECKED IN WORKSPACE */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-crm-border pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Good Morning, {currentUser.name.split(' ')[0]}</h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{formattedDate}</div>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <span className="text-xs font-mono text-teal-400 font-semibold">Shift: {shift.startTime} AM - {shift.endTime} PM</span>
              <div className="text-[11px] text-slate-400">Today's target: 8h</div>
            </div>
          </div>

          <div className="text-center py-2">
            <Badge variant="neutral" size="md" className="font-mono">
              NOT CHECKED IN
            </Badge>
          </div>

          {/* SECTION 8 SPECIFICATION: WORK MODE PICKER */}
          <div className="p-3 bg-[#12181E] border border-[#1E262E] rounded-lg">
            <label className="text-xs text-slate-400 font-medium block mb-2">Work Location Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['OFFICE', 'REMOTE', 'FIELD'] as WorkMode[]).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWorkMode(mode)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    workMode === mode
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-[#0B0F14] border-[#1E262E] text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'OFFICE' ? '○ Office' : mode === 'REMOTE' ? '○ Remote' : '○ Field'}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2 & 7: CHECK IN ACTIONS (4 METHODS) */}
          <div className="space-y-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center text-sm font-bold shadow-md"
              onClick={() => punchIn(undefined, selectedProjectId, selectedTaskId, workMode, 'WEB')}
            >
              <Play className="w-4 h-4 mr-2" />
              CHECK IN
            </Button>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsQrOpen(true)}
                className="justify-center text-xs"
              >
                <QrCode className="w-3.5 h-3.5 mr-1 text-teal-400" />
                Office QR
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsGpsOpen(true)}
                className="justify-center text-xs"
              >
                <Navigation className="w-3.5 h-3.5 mr-1 text-teal-400" />
                GPS Punch
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsKioskOpen(true)}
                className="justify-center text-xs"
              >
                <Tablet className="w-3.5 h-3.5 mr-1 text-teal-400" />
                Kiosk Mode
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* SECTION 2 SPECIFICATION: ACTIVE SESSION (WORKING / BREAK / COMPLETED) */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-crm-border pb-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                sessionState === 'working' ? 'bg-teal-400 animate-ping' : 
                sessionState === 'on_break' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
              }`} />
              <span className="text-xs font-bold font-mono tracking-wider text-white uppercase">
                {sessionState === 'working' ? '● WORKING' : sessionState === 'on_break' ? '☕ ON BREAK' : 'SHIFT COMPLETED'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="turquoise" size="sm">{currentUserAttendance?.workMode || workMode}</Badge>
              <Badge variant="neutral" size="sm">{currentUserAttendance?.checkInMethod || 'WEB'}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className="p-2.5 bg-[#0B0F14] rounded-lg border border-[#1E262E]">
              <div className="text-[11px] text-slate-400">Checked in</div>
              <div className="text-sm font-mono font-bold text-white mt-0.5">{currentUserAttendance?.punchIn || '--:--'}</div>
            </div>
            <div className="p-2.5 bg-[#0B0F14] rounded-lg border border-[#1E262E]">
              <div className="text-[11px] text-slate-400">Time worked</div>
              <div className="text-sm font-mono font-bold text-teal-300 mt-0.5">{getElapsedDuration()}</div>
            </div>
            <div className="p-2.5 bg-[#0B0F14] rounded-lg border border-[#1E262E]">
              <div className="text-[11px] text-slate-400">Shift</div>
              <div className="text-sm font-mono font-bold text-white mt-0.5">{shift.startTime} - {shift.endTime}</div>
            </div>
          </div>

          {/* Project & Task Section */}
          <div className="p-3 bg-[#12181E] border border-[#1E262E] rounded-lg text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-teal-400" /> Project
              </span>
              <span className="text-white font-semibold">{currentUserAttendance?.currentProjectName || 'CRM Platform'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-teal-400" /> Task
              </span>
              <span className="text-teal-300 font-semibold">{currentUserAttendance?.currentTaskTitle || 'Attendance Engine'}</span>
            </div>
          </div>

          {/* Session Action Buttons */}
          <div className="flex gap-3 pt-1">
            {sessionState === 'working' && (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => startBreak(undefined, 'Lunch Break')}
                  className="flex-1 justify-center"
                >
                  <Coffee className="w-4 h-4 mr-2 text-amber-400" />
                  START BREAK
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => punchOut()}
                  className="flex-1 justify-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  CHECK OUT
                </Button>
              </>
            )}

            {sessionState === 'on_break' && (
              <Button
                variant="primary"
                size="md"
                onClick={() => endBreak()}
                className="w-full justify-center"
              >
                <Play className="w-4 h-4 mr-2" />
                END BREAK / RESUME WORK
              </Button>
            )}

            {sessionState === 'completed' && (
              <div className="w-full text-center text-xs text-slate-400 p-2 bg-[#12181E] rounded-lg">
                Today's session finished ({currentUserAttendance?.punchIn} — {currentUserAttendance?.punchOut})
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals for 4 Check-In Methods */}
      <OfficeQRModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        onPunchWithQR={(token, locId) => {
          punchIn(undefined, selectedProjectId, selectedTaskId, 'OFFICE', 'QR', locId);
        }}
      />

      <GPSCheckInModal
        isOpen={isGpsOpen}
        onClose={() => setIsGpsOpen(false)}
        onPunchWithGPS={(coords, inGeofence, locName) => {
          punchIn(
            undefined, 
            selectedProjectId, 
            selectedTaskId, 
            inGeofence ? 'OFFICE' : 'REMOTE', 
            'GPS', 
            undefined, 
            coords
          );
        }}
      />

      <AttendanceKioskModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
      />
    </div>
  );
};
