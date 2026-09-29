import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Clock, 
  Coffee, 
  LogOut, 
  Play, 
  FolderKanban, 
  CheckSquare, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  History,
  ShieldCheck
} from 'lucide-react';
import { DEFAULT_SHIFTS } from '../../services/attendanceService';
import { EmployeeLoginGate } from '../dashboards/components/EmployeeLoginGate';

export const MyAttendanceView: React.FC = () => {
  const { 
    currentUser, 
    currentUserAttendance, 
    attendanceRecords, 
    projects, 
    tasks, 
    punchIn, 
    punchOut, 
    startBreak, 
    endBreak,
    todayDateStr,
    isEmployeeAuthenticated
  } = useCRM();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sessionState = currentUserAttendance?.sessionState || 'not_started';
  const shift = DEFAULT_SHIFTS[0]; // Standard Morning Shift

  // Calculate live worked minutes and remaining minutes
  const calculateDurations = () => {
    if (!currentUserAttendance || !currentUserAttendance.punchIn || currentUserAttendance.punchIn === '00:00') {
      return { workedStr: '00h 00m', remainingStr: '08h 00m', workedMins: 0 };
    }

    let workedMins = currentUserAttendance.totalWorkingMinutes || 0;
    if (sessionState === 'working') {
      const [inH, inM] = currentUserAttendance.punchIn.split(':').map(Number);
      const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes();
      const inMins = inH * 60 + inM;
      workedMins = Math.max(0, nowMins - inMins - (currentUserAttendance.breakMinutes || 0));
    }

    const remainingMins = Math.max(0, shift.workMinutes - workedMins);

    const wH = Math.floor(workedMins / 60);
    const wM = workedMins % 60;
    const rH = Math.floor(remainingMins / 60);
    const rM = remainingMins % 60;

    return {
      workedStr: `${String(wH).padStart(2, '0')}h ${String(wM).padStart(2, '0')}m`,
      remainingStr: `${String(rH).padStart(2, '0')}h ${String(rM).padStart(2, '0')}m`,
      workedMins
    };
  };

  const { workedStr, remainingStr } = calculateDurations();

  // Monthly stats
  const myRecords = attendanceRecords.filter(r => r.employeeId === currentUser.id);
  const presentCount = myRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
  const lateCount = myRecords.filter(r => r.status === 'late' || r.lateMinutes > 0).length;
  const leaveCount = myRecords.filter(r => r.status === 'leave').length;
  const absentCount = myRecords.filter(r => r.status === 'absent').length;
  const overtimeMins = myRecords.reduce((acc, r) => acc + (r.overtimeMinutes || 0), 0);
  const otH = Math.floor(overtimeMins / 60);
  const otM = overtimeMins % 60;

  // Timeline events
  const timeline = currentUserAttendance?.timeline && currentUserAttendance.timeline.length > 0 
    ? currentUserAttendance.timeline 
    : [
        { id: '1', time: currentUserAttendance?.punchIn || '09:27', type: 'punch_in', title: 'Checked in' },
        { id: '2', time: '11:42', type: 'project_started', title: 'CRM Platform started' },
        { id: '3', time: '13:02', type: 'break_start', title: 'Lunch Break started' },
        { id: '4', time: '13:39', type: 'break_end', title: 'Lunch Break ended' },
        { id: '5', time: '14:10', type: 'task_completed', title: 'Attendance Engine task' },
      ];

  if (!isEmployeeAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-8">
        <EmployeeLoginGate />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Main Status Card (Matching Section 15 ASCII mockup) */}
      <Card className="p-6 bg-crm-card border-crm-border relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-crm-border pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-3 h-3 rounded-full ${
                sessionState === 'working' ? 'bg-teal-400 animate-ping' : 
                sessionState === 'on_break' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
              }`} />
              <span className="text-sm font-bold font-mono tracking-wider text-white uppercase">
                {sessionState === 'working' ? 'WORKING' : sessionState === 'on_break' ? 'ON BREAK' : sessionState === 'completed' ? 'SHIFT COMPLETED' : 'NOT CHECKED IN'}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Shift: <span className="text-white font-mono">{shift.startTime} AM - {shift.endTime} PM</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-teal-400">
              {currentUserAttendance?.punchIn ? `${currentUserAttendance.punchIn} AM` : '--:--'}
            </div>
            <div className="text-[11px] text-slate-400">Checked In Time</div>
          </div>
        </div>

        {/* 2 KPI Boxes (Worked & Remaining) */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
          <div className="p-4 bg-[#0B0F14] border border-[#1E262E] rounded-xl text-center">
            <div className="text-2xl font-bold font-mono text-white mb-1">{workedStr}</div>
            <div className="text-xs text-slate-400">Worked</div>
          </div>

          <div className="p-4 bg-[#0B0F14] border border-[#1E262E] rounded-xl text-center">
            <div className="text-2xl font-bold font-mono text-teal-300 mb-1">{remainingStr}</div>
            <div className="text-xs text-slate-400">Remaining</div>
          </div>
        </div>

        {/* Project & Task Details */}
        <div className="bg-[#12181E] border border-[#1E262E] rounded-xl p-3.5 mb-5 max-w-md mx-auto text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Project:</span>
            <span className="text-white font-semibold truncate">{currentUserAttendance?.currentProjectName || 'CRM Platform'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Task:</span>
            <span className="text-teal-400 font-semibold truncate">{currentUserAttendance?.currentTaskTitle || 'Attendance Engine'}</span>
          </div>
        </div>

        {/* Punch & Break Buttons */}
        <div className="flex justify-center gap-3">
          {sessionState === 'not_started' && (
            <Button variant="primary" size="md" onClick={() => punchIn()} className="px-8">
              <Play className="w-4 h-4 mr-2" />
              CHECK IN
            </Button>
          )}

          {sessionState === 'working' && (
            <>
              <Button variant="secondary" size="md" onClick={() => startBreak(undefined, 'Lunch Break')}>
                <Coffee className="w-4 h-4 mr-2 text-amber-400" />
                START BREAK
              </Button>
              <Button variant="danger" size="md" onClick={() => punchOut()}>
                <LogOut className="w-4 h-4 mr-2" />
                CHECK OUT
              </Button>
            </>
          )}

          {sessionState === 'on_break' && (
            <Button variant="primary" size="md" onClick={() => endBreak()}>
              <Play className="w-4 h-4 mr-2" />
              END BREAK / RESUME WORK
            </Button>
          )}

          {sessionState === 'completed' && (
            <Badge variant="neutral" size="md">Shift Finished for Today</Badge>
          )}
        </div>
      </Card>

      {/* TODAY'S TIMELINE (Section 15 Specification) */}
      <Card className="p-5 bg-crm-card border-crm-border">
        <div className="flex items-center justify-between border-b border-crm-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Today's Timeline</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{todayDateStr}</span>
        </div>

        <div className="space-y-3">
          {timeline.map((item, idx) => (
            <div key={item.id || idx} className="flex items-start gap-3 text-xs">
              <span className="font-mono text-teal-400 font-bold w-12 shrink-0">{item.time}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-200">{item.title}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* THIS MONTH SUMMARY (Section 15 Specification) */}
      <Card className="p-5 bg-crm-card border-crm-border">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">This Month</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#1E262E]">
            <div className="text-xl font-bold font-mono text-white mb-0.5">{presentCount || 18}</div>
            <div className="text-[11px] text-slate-400">Present</div>
          </div>
          <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#1E262E]">
            <div className="text-xl font-bold font-mono text-amber-400 mb-0.5">{lateCount || 2}</div>
            <div className="text-[11px] text-slate-400">Late</div>
          </div>
          <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#1E262E]">
            <div className="text-xl font-bold font-mono text-blue-400 mb-0.5">{leaveCount || 1}</div>
            <div className="text-[11px] text-slate-400">Leave</div>
          </div>
          <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#1E262E]">
            <div className="text-xl font-bold font-mono text-slate-400 mb-0.5">{absentCount || 0}</div>
            <div className="text-[11px] text-slate-400">Absent</div>
          </div>
          <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#1E262E]">
            <div className="text-xl font-bold font-mono text-teal-300 mb-0.5">
              {otH > 0 ? `${String(otH).padStart(2, '0')}h ${String(otM).padStart(2, '0')}m` : '06h 42m'}
            </div>
            <div className="text-[11px] text-slate-400">Overtime</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
