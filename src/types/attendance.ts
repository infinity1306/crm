// Phase 4 — Attendance, Work Hours, Leave & Operational Status Types
// STAR CHAIN LABS Internal CRM — Real Event-Driven Attendance Engine

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'half_day' | 'working';

export type WorkSessionState = 'not_started' | 'working' | 'on_break' | 'completed';

export type OperationalStatus = 'offline' | 'working' | 'on_break' | 'in_meeting' | 'on_leave' | 'away';

export type LeaveType = 'annual' | 'sick' | 'casual' | 'unpaid' | 'paternity_maternity';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// Event Sourcing Ledger Types
export type AttendanceEventType = 
  | 'CHECK_IN' 
  | 'CHECK_OUT' 
  | 'BREAK_START' 
  | 'BREAK_END' 
  | 'CORRECTION' 
  | 'REMOTE_START' 
  | 'REMOTE_END';

export type CheckInMethod = 'WEB' | 'QR' | 'GPS' | 'KIOSK' | 'BIOMETRIC';

export type WorkMode = 'OFFICE' | 'REMOTE' | 'HYBRID' | 'FIELD' | 'BUSINESS_TRAVEL';

export interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:mm (e.g. "09:30")
  endTime: string;   // HH:mm (e.g. "18:30")
  workMinutes: number; // e.g. 480 (8 hours)
  graceMinutes: number; // e.g. 15 mins
  breakMinutes: number; // e.g. 60 mins
  timezone: string; // "Asia/Kolkata"
  overnight: boolean;
}

export interface AttendanceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string;
}

export interface AttendanceEvent {
  id: string;
  employeeId: string;
  eventType: AttendanceEventType;
  eventTime: string; // ISO
  serverTime: string; // ISO
  source: CheckInMethod;
  locationId?: string;
  deviceId?: string;
  ipAddress: string;
  workMode: WorkMode;
  metadata?: {
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number;
    distanceFromOfficeMeters?: number;
    qrToken?: string;
    kioskPinVerified?: boolean;
    projectId?: string;
    projectName?: string;
    taskId?: string;
    taskTitle?: string;
    notes?: string;
    breakReason?: string;
  };
  createdAt: string;
}

export interface BreakRecord {
  id: string;
  start: string; // HH:mm
  end?: string; // HH:mm
  durationMinutes?: number;
  reason?: string;
}

export interface AttendanceCorrection {
  isCorrected: boolean;
  originalPunchIn?: string;
  originalPunchOut?: string | null;
  originalStatus?: AttendanceStatus;
  correctedBy: string; // Admin employee ID
  correctedByName: string;
  correctedAt: string; // ISO / formatted
  reason: string;
}

export type CorrectionIssueType = 
  | 'FORGOT_CHECKOUT' 
  | 'FORGOT_CHECKIN' 
  | 'INCORRECT_TIME' 
  | 'WRONG_STATUS' 
  | 'NETWORK_OUTAGE'
  | 'OTHER';

export interface AttendanceCorrectionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  workDate: string; // YYYY-MM-DD
  issueType: CorrectionIssueType;
  originalPunchIn?: string;
  originalPunchOut?: string | null;
  requestedPunchIn?: string;
  requestedPunchOut?: string | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export type AttendanceExceptionType = 
  | 'MISSING_CHECKOUT' 
  | 'LATE_ARRIVAL' 
  | 'MISSING_CHECKIN' 
  | 'LONG_BREAK' 
  | 'CORRECTION_PENDING';

export interface AttendanceException {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  workDate: string;
  type: AttendanceExceptionType;
  severity: 'low' | 'medium' | 'high';
  details: string;
  currentStatus: string;
  checkInTime?: string;
  expectedCheckOutTime?: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  detectedAt: string;
}

export type DayTimelineEventType = 
  | 'punch_in' 
  | 'punch_out' 
  | 'break_start' 
  | 'break_end' 
  | 'project_started' 
  | 'task_completed' 
  | 'ticket_updated' 
  | 'work_update' 
  | 'correction';

export interface DailySessionTimelineEvent {
  id: string;
  time: string; // HH:mm
  type: DayTimelineEventType;
  title: string;
  description?: string;
  referenceId?: string; // task ID, project ID, ticket ID, etc.
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  employeeRole: string;
  department: string;
  date: string; // YYYY-MM-DD
  punchIn: string; // HH:mm, e.g. "09:14"
  punchOut: string | null; // HH:mm, e.g. "18:28" or null if still working
  breaks: BreakRecord[];
  totalWorkingMinutes: number; // calculated working time excluding breaks
  breakMinutes: number;
  expectedStart: string; // default "09:30"
  expectedWorkMinutes: number; // default 480 (8h)
  lateMinutes: number; // late duration in minutes
  overtimeMinutes: number; // minutes worked beyond expectedWorkMinutes
  status: AttendanceStatus;
  sessionState: WorkSessionState;
  
  // Real Attendance Engine Fields
  shiftId?: string;
  workMode?: WorkMode;
  checkInMethod?: CheckInMethod;
  locationId?: string;
  verifiedLocation?: string;

  // Cross-Linkage
  currentProjectId?: string;
  currentProjectName?: string;
  currentTaskId?: string;
  currentTaskTitle?: string;
  
  // Correction Audit Trail
  correction?: AttendanceCorrection;
  
  // Daily connected timeline
  timeline: DailySessionTimelineEvent[];
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  employeeRole: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  reason: string;
  attachmentName?: string;
  status: LeaveStatus;
  requestedAt: string; // YYYY-MM-DD HH:mm
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface LeaveQuotaCategory {
  total: number;
  used: number;
  pending: number;
  remaining: number;
}

export interface LeaveBalance {
  employeeId: string;
  annual: LeaveQuotaCategory;
  sick: LeaveQuotaCategory;
  casual: LeaveQuotaCategory;
  unpaid: { used: number };
}

export interface AttendanceOrgConfig {
  workdayDurationMinutes: number; // default 480 (8 hours)
  expectedStartTime: string; // default "09:30"
  gracePeriodMinutes: number; // default 15 minutes
  breakDurationLimitMinutes: number; // default 60 minutes
  overtimeThresholdMinutes: number; // default 510 (8.5 hours)
  annualLeaveQuota: number; // default 18 days
  sickLeaveQuota: number; // default 10 days
  casualLeaveQuota: number; // default 7 days
}

export interface EmployeeOperationalStatusInfo {
  employeeId: string;
  employeeName: string;
  status: OperationalStatus;
  punchIn?: string;
  workingMinutes?: number;
  currentProjectName?: string;
  currentTaskTitle?: string;
  lastActivityTime?: string;
  lastActivityDescription?: string;
}
