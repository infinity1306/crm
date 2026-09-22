import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { WidgetContainer } from '../components/WidgetContainer';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Clock, Play, Square, Coffee, ChevronRight, CheckCircle2 } from 'lucide-react';

export const PersonalAttendanceWidget: React.FC = () => {
  const { 
    currentUser, 
    attendanceRecords, 
    punchIn, 
    punchOut, 
    startBreak, 
    endBreak,
    navigateTo,
    addToast
  } = useCRM();

  const todayRecord = attendanceRecords.find(r => r.employeeId === currentUser.id && r.date === '2026-09-21');
  const isPunchedIn = todayRecord && (todayRecord.status === 'present' || todayRecord.status === 'working' || todayRecord.sessionState === 'working');
  const isOnBreak = todayRecord?.sessionState === 'on_break';

  const handlePunchToggle = () => {
    if (isPunchedIn) {
      punchOut(currentUser.id);
      addToast({ type: 'info', title: 'Punched Out', message: 'Shift concluded for today.' });
    } else {
      punchIn(currentUser.id);
      addToast({ type: 'success', title: 'Punched In', message: 'Have a productive day!' });
    }
  };

  const handleBreakToggle = () => {
    if (isOnBreak) {
      endBreak(currentUser.id);
      addToast({ type: 'info', title: 'Break Ended', message: 'Welcome back to work.' });
    } else {
      startBreak(currentUser.id);
      addToast({ type: 'info', title: 'Break Started', message: 'Take a healthy pause.' });
    }
  };

  const punchInTime = todayRecord?.punchIn || '09:14 AM';
  const hours = todayRecord ? Math.floor(todayRecord.totalWorkingMinutes / 60) : 6;
  const mins = todayRecord ? todayRecord.totalWorkingMinutes % 60 : 22;

  return (
    <WidgetContainer
      title="Personal Attendance & Clock"
      subtitle="Shift telemetry and working hours tracking"
      badge={isOnBreak ? "On Break" : isPunchedIn ? "Active Shift" : "Punched Out"}
      badgeType={isOnBreak ? "warning" : isPunchedIn ? "success" : "neutral"}
      action={
        <button
          onClick={() => navigateTo('/app/my-attendance')}
          className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
        >
          My Attendance <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-crm-surface border border-crm-border/60 rounded-lg">
        {/* Left: Live Status & Times */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-full bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-crm-text">
                {String(hours).padStart(2, '0')}h {String(mins).padStart(2, '0')}m
              </span>
              <span className="text-[10px] text-crm-textMuted uppercase font-semibold">
                Worked Today
              </span>
            </div>
            <p className="text-[11px] text-crm-textMuted">
              Punched in at <span className="text-crm-text font-medium">{punchInTime}</span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isPunchedIn && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBreakToggle}
              className="text-xs gap-1.5"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>{isOnBreak ? "End Break" : "Take Break"}</span>
            </Button>
          )}

          <Button
            variant={isPunchedIn ? "danger" : "primary"}
            size="sm"
            onClick={handlePunchToggle}
            className="text-xs gap-1.5 shadow-sm"
          >
            {isPunchedIn ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Punch Out</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Punch In</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </WidgetContainer>
  );
};
