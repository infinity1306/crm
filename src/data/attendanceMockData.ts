import { 
  AttendanceRecord, 
  AttendanceOrgConfig, 
  LeaveBalance, 
  LeaveRequest,
  AttendanceCorrectionRequest,
  AttendanceException 
} from '../types/attendance';

export const DEFAULT_ATTENDANCE_CONFIG: AttendanceOrgConfig = {
  workdayDurationMinutes: 540,       // 10:00 AM – 7:00 PM = 9 hours total
  expectedStartTime: '10:00',        // Office opens / punch-in window starts 10:00 AM
  gracePeriodMinutes: 15,            // Punch-in window: 10:00–10:15 AM
  breakDurationLimitMinutes: 40,     // Official lunch break: 40 minutes
  overtimeThresholdMinutes: 570,     // Beyond 9.5 hours
  annualLeaveQuota: 0,               // Not used — CL-only system
  sickLeaveQuota: 0,                 // Not used — CL-only system
  casualLeaveQuota: 12,              // 12 CL/year (1 per month, Apr–Mar cycle)
};

/**
 * Calculates how many CL credits an employee has accrued so far in the current
 * April–March leave year, based on completed months (1 CL per month).
 */
export function calcAccruedCL(joinedDate?: string): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed (0=Jan … 11=Dec)

  // April = month 3. Determine current leave-year start.
  const leaveYearStartYear = month >= 3 ? year : year - 1;
  const leaveYearStart = new Date(leaveYearStartYear, 3, 1); // April 1

  // Count full calendar months elapsed since leave-year start (capped at 12)
  const msElapsed = now.getTime() - leaveYearStart.getTime();
  const monthsElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24 * 30.4375));
  return Math.min(12, Math.max(1, monthsElapsed + 1)); // at least 1 on the first month
}

export const INITIAL_LEAVE_BALANCES: Record<string, LeaveBalance> = {
  'emp-admin': ((): LeaveBalance => {
    const accrued = calcAccruedCL();
    return {
      employeeId: 'emp-admin',
      annual: { total: 0, used: 0, pending: 0, remaining: 0 },
      sick: { total: 0, used: 0, pending: 0, remaining: 0 },
      casual: { total: accrued, used: 0, pending: 0, remaining: accrued },
      unpaid: { used: 0 },
    };
  })()
};

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export const INITIAL_CORRECTION_REQUESTS: AttendanceCorrectionRequest[] = [];

export const INITIAL_EXCEPTIONS: AttendanceException[] = [];
