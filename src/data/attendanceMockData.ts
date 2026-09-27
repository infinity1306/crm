import { 
  AttendanceRecord, 
  AttendanceOrgConfig, 
  LeaveBalance, 
  LeaveRequest,
  AttendanceCorrectionRequest,
  AttendanceException 
} from '../types/attendance';

export const DEFAULT_ATTENDANCE_CONFIG: AttendanceOrgConfig = {
  workdayDurationMinutes: 480,
  expectedStartTime: '09:30',
  gracePeriodMinutes: 15,
  breakDurationLimitMinutes: 60,
  overtimeThresholdMinutes: 510,
  annualLeaveQuota: 18,
  sickLeaveQuota: 10,
  casualLeaveQuota: 7,
};

export const INITIAL_LEAVE_BALANCES: Record<string, LeaveBalance> = {
  'emp-admin': {
    employeeId: 'emp-admin',
    annual: { total: 18, used: 0, pending: 0, remaining: 18 },
    sick: { total: 10, used: 0, pending: 0, remaining: 10 },
    casual: { total: 7, used: 0, pending: 0, remaining: 7 },
    unpaid: { used: 0 },
  }
};

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export const INITIAL_CORRECTION_REQUESTS: AttendanceCorrectionRequest[] = [];

export const INITIAL_EXCEPTIONS: AttendanceException[] = [];
