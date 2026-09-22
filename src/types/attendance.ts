// Phase 4 — Attendance, Work Hours, Leave & Operational Status Types
// STAR CHAIN LABS Internal CRM

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'half_day' | 'working';

export type WorkSessionState = 'not_started' | 'working' | 'on_break' | 'completed';

export type OperationalStatus = 'offline' | 'working' | 'on_break' | 'in_meeting' | 'on_leave' | 'away';

export type LeaveType = 'annual' | 'sick' | 'casual' | 'unpaid' | 'paternity_maternity';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

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
  
  // Phase 3 Cross-Linkage
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
  reviewedBy?: string; // Admin/Manager ID
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
