// Phase 4 — Attendance & Employee Operations Mock Data
// STAR CHAIN LABS Internal CRM — Real Event-Driven Attendance Engine

import { 
  AttendanceRecord, 
  LeaveRequest, 
  LeaveBalance, 
  AttendanceOrgConfig,
  AttendanceCorrectionRequest,
  AttendanceException
} from '../types/attendance';

export const DEFAULT_ATTENDANCE_CONFIG: AttendanceOrgConfig = {
  workdayDurationMinutes: 480, // 8 Hours
  expectedStartTime: '09:30',
  gracePeriodMinutes: 15, // Up to 09:45 is not marked late
  breakDurationLimitMinutes: 60,
  overtimeThresholdMinutes: 510, // Beyond 8.5 Hours counts as overtime
  annualLeaveQuota: 18,
  sickLeaveQuota: 10,
  casualLeaveQuota: 7
};

export const INITIAL_LEAVE_BALANCES: Record<string, LeaveBalance> = {
  'emp-1': {
    employeeId: 'emp-1',
    annual: { total: 18, used: 6, pending: 2, remaining: 10 },
    sick: { total: 10, used: 2, pending: 0, remaining: 8 },
    casual: { total: 7, used: 2, pending: 0, remaining: 5 },
    unpaid: { used: 0 }
  },
  'emp-2': {
    employeeId: 'emp-2',
    annual: { total: 18, used: 2, pending: 0, remaining: 16 },
    sick: { total: 10, used: 1, pending: 0, remaining: 9 },
    casual: { total: 7, used: 1, pending: 0, remaining: 6 },
    unpaid: { used: 0 }
  },
  'emp-3': {
    employeeId: 'emp-3',
    annual: { total: 18, used: 4, pending: 5, remaining: 9 },
    sick: { total: 10, used: 0, pending: 0, remaining: 10 },
    casual: { total: 7, used: 3, pending: 0, remaining: 4 },
    unpaid: { used: 0 }
  },
  'emp-4': {
    employeeId: 'emp-4',
    annual: { total: 18, used: 5, pending: 0, remaining: 13 },
    sick: { total: 10, used: 3, pending: 0, remaining: 7 },
    casual: { total: 7, used: 4, pending: 0, remaining: 3 },
    unpaid: { used: 0 }
  }
};

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LV-101',
    employeeId: 'emp-6',
    employeeName: 'Dhruv Sharma',
    employeeRole: 'Lead Backend Architect',
    department: 'Engineering',
    leaveType: 'sick',
    startDate: '2026-09-27',
    endDate: '2026-09-27',
    daysCount: 1,
    reason: 'Severe seasonal flu and viral fever.',
    status: 'approved',
    requestedAt: '2026-09-27 07:45',
    reviewedBy: 'emp-2',
    reviewedByName: 'Rajesh Verma',
    reviewedAt: '2026-09-27 08:30',
    reviewNote: 'Approved. Take complete rest Dhruv.'
  },
  {
    id: 'LV-102',
    employeeId: 'emp-3',
    employeeName: 'Anita Desai',
    employeeRole: 'Head of Product & Delivery',
    department: 'Product',
    leaveType: 'annual',
    startDate: '2026-09-28',
    endDate: '2026-10-02',
    daysCount: 5,
    reason: 'Planned family vacation and festival break.',
    status: 'pending',
    requestedAt: '2026-09-26 14:15'
  }
];

// SECTION 13: INITIAL CORRECTION REQUESTS (Audited Workflow)
export const INITIAL_CORRECTION_REQUESTS: AttendanceCorrectionRequest[] = [
  {
    id: 'corr-101',
    employeeId: 'emp-10',
    employeeName: 'Siddhant Giri',
    workDate: '2026-09-26',
    issueType: 'FORGOT_CHECKOUT',
    originalPunchIn: '09:25',
    originalPunchOut: null,
    requestedPunchIn: '09:25',
    requestedPunchOut: '18:42',
    reason: 'Office work completed, forgot to punch out before leaving campus.',
    status: 'PENDING',
    submittedAt: '2026-09-27 08:30'
  },
  {
    id: 'corr-102',
    employeeId: 'emp-4',
    employeeName: 'Vikash Patel',
    workDate: '2026-09-25',
    issueType: 'INCORRECT_TIME',
    originalPunchIn: '10:05',
    originalPunchOut: '18:30',
    requestedPunchIn: '09:30',
    requestedPunchOut: '18:30',
    reason: 'Reception kiosk biometric reader error upon entrance at 09:30 AM.',
    status: 'PENDING',
    submittedAt: '2026-09-26 10:15'
  }
];

// SECTION 12: INITIAL EXCEPTIONS (Exceptions Center)
export const INITIAL_EXCEPTIONS: AttendanceException[] = [
  {
    id: 'exc-1',
    employeeId: 'emp-rahul',
    employeeName: 'Rahul Sharma',
    department: 'Engineering',
    workDate: '2026-09-27',
    type: 'MISSING_CHECKOUT',
    severity: 'high',
    details: 'Check-in: 09:17, Expected checkout: 18:30. Current status: Working past shift.',
    currentStatus: 'Working Past Shift',
    checkInTime: '09:17',
    expectedCheckOutTime: '18:30',
    status: 'OPEN',
    detectedAt: '2026-09-27T19:00:00Z'
  },
  {
    id: 'exc-2',
    employeeId: 'emp-rohan',
    employeeName: 'Rohan Mehta',
    department: 'Engineering',
    workDate: '2026-09-27',
    type: 'LATE_ARRIVAL',
    severity: 'medium',
    details: 'Arrived at 09:53 (Shift: 09:30, grace: 15m). Late by 23 minutes.',
    currentStatus: 'Late Arrival',
    checkInTime: '09:53',
    expectedCheckOutTime: '18:30',
    status: 'OPEN',
    detectedAt: '2026-09-27T09:53:00Z'
  },
  {
    id: 'exc-3',
    employeeId: 'emp-anita',
    employeeName: 'Anita Desai',
    department: 'Product',
    workDate: '2026-09-27',
    type: 'MISSING_CHECKIN',
    severity: 'medium',
    details: 'Scheduled to work today (General Shift 09:30). No punch recorded yet.',
    currentStatus: 'Missing Punch',
    status: 'OPEN',
    detectedAt: '2026-09-27T10:00:00Z'
  },
  {
    id: 'exc-4',
    employeeId: 'emp-ankit',
    employeeName: 'Ankit Roy',
    department: 'Sales',
    workDate: '2026-09-27',
    type: 'LONG_BREAK',
    severity: 'medium',
    details: 'Active lunch break duration is 75 minutes (Shift limit: 60m).',
    currentStatus: 'Long Break',
    status: 'OPEN',
    detectedAt: '2026-09-27T14:15:00Z'
  },
  {
    id: 'exc-5',
    employeeId: 'emp-10',
    employeeName: 'Siddhant Giri',
    department: 'Engineering',
    workDate: '2026-09-26',
    type: 'CORRECTION_PENDING',
    severity: 'low',
    details: 'Correction request submitted for forgot checkout at 18:42.',
    currentStatus: 'Correction Pending',
    status: 'OPEN',
    detectedAt: '2026-09-27T08:30:00Z'
  }
];

// SECTION 16: TODAY'S LIVE WORKFORCE AND ATTENDANCE RECORDS (2026-09-27 & 2026-09-21)
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // 1. Current User (Tanmay Pandey / Siddharth Rao) - Working Now
  {
    id: 'att-20260927-emp-1',
    employeeId: 'emp-1',
    employeeName: 'Tanmay Pandey',
    employeeRole: 'VP of Engineering & Operations',
    department: 'Engineering',
    date: '2026-09-27',
    punchIn: '09:27',
    punchOut: null,
    breaks: [
      { id: 'brk-1', start: '13:02', end: '13:39', durationMinutes: 37, reason: 'Lunch Break' }
    ],
    totalWorkingMinutes: 161, // ~2h 41m live
    breakMinutes: 37,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'working',
    sessionState: 'working',
    workMode: 'OFFICE',
    checkInMethod: 'QR',
    currentProjectId: 'proj-2',
    currentProjectName: 'CRM Platform',
    currentTaskId: 'TASK-101',
    currentTaskTitle: 'Attendance Engine',
    timeline: [
      { id: 'ev-1', time: '09:27', type: 'punch_in', title: 'Checked in via Office QR' },
      { id: 'ev-2', time: '11:42', type: 'project_started', title: 'CRM Platform task started' },
      { id: 'ev-3', time: '13:02', type: 'break_start', title: 'Lunch started' },
      { id: 'ev-4', time: '13:39', type: 'break_end', title: 'Lunch ended' },
      { id: 'ev-5', time: '14:10', type: 'task_completed', title: 'Attendance Engine optimization' }
    ]
  },
  // 2. Rahul - Engineering, Working, 09:12 (Section 16 Specification)
  {
    id: 'att-20260927-emp-rahul',
    employeeId: 'emp-rahul',
    employeeName: 'Rahul Sharma',
    employeeRole: 'Senior Backend Engineer',
    department: 'Engineering',
    date: '2026-09-27',
    punchIn: '09:12',
    punchOut: null,
    breaks: [],
    totalWorkingMinutes: 268,
    breakMinutes: 0,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'working',
    sessionState: 'working',
    workMode: 'OFFICE',
    checkInMethod: 'WEB',
    currentProjectId: 'proj-2',
    currentProjectName: 'Payment Switch Integration',
    currentTaskId: 'TASK-102',
    currentTaskTitle: 'Idempotency Layer',
    timeline: [
      { id: 'ev-r1', time: '09:12', type: 'punch_in', title: 'Checked in' }
    ]
  },
  // 3. Priya - Engineering, Working, 09:28 (Section 16 Specification)
  {
    id: 'att-20260927-emp-priya',
    employeeId: 'emp-priya',
    employeeName: 'Priya Iyer',
    employeeRole: 'Frontend Architect',
    department: 'Engineering',
    date: '2026-09-27',
    punchIn: '09:28',
    punchOut: null,
    breaks: [],
    totalWorkingMinutes: 252,
    breakMinutes: 0,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'working',
    sessionState: 'working',
    workMode: 'REMOTE',
    checkInMethod: 'GPS',
    currentProjectId: 'proj-2',
    currentProjectName: 'CRM Platform',
    currentTaskId: 'TASK-105',
    currentTaskTitle: 'Real-time WebSocket Sync',
    timeline: [
      { id: 'ev-p1', time: '09:28', type: 'punch_in', title: 'Checked in (Remote GPS Verified)' }
    ]
  },
  // 4. Ankit - Sales, Break, 13:04 (Section 16 Specification)
  {
    id: 'att-20260927-emp-ankit',
    employeeId: 'emp-ankit',
    employeeName: 'Ankit Roy',
    employeeRole: 'Account Executive',
    department: 'Sales',
    date: '2026-09-27',
    punchIn: '09:05',
    punchOut: null,
    breaks: [
      { id: 'brk-ankit-1', start: '13:04', reason: 'Lunch Break' }
    ],
    totalWorkingMinutes: 239,
    breakMinutes: 35,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'working',
    sessionState: 'on_break',
    workMode: 'OFFICE',
    checkInMethod: 'KIOSK',
    currentProjectId: 'proj-1',
    currentProjectName: 'Aditya Birla Account',
    currentTaskId: 'TASK-201',
    currentTaskTitle: 'Contract Finalization',
    timeline: [
      { id: 'ev-a1', time: '09:05', type: 'punch_in', title: 'Checked in via Reception Kiosk' },
      { id: 'ev-a2', time: '13:04', type: 'break_start', title: 'Lunch Break started' }
    ]
  },
  // 5. Neha - Product, Meeting, 10:15 (Section 16 Specification)
  {
    id: 'att-20260927-emp-neha',
    employeeId: 'emp-neha',
    employeeName: 'Neha Gupta',
    employeeRole: 'Senior Product Manager',
    department: 'Product',
    date: '2026-09-27',
    punchIn: '09:15',
    punchOut: null,
    breaks: [],
    totalWorkingMinutes: 265,
    breakMinutes: 0,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'working',
    sessionState: 'working',
    workMode: 'OFFICE',
    checkInMethod: 'QR',
    currentProjectId: 'proj-1',
    currentProjectName: 'Quarterly Roadmap Review',
    currentTaskId: 'TASK-301',
    currentTaskTitle: 'Executive Product Sync',
    timeline: [
      { id: 'ev-n1', time: '09:15', type: 'punch_in', title: 'Checked in via Office QR' },
      { id: 'ev-n2', time: '10:15', type: 'project_started', title: 'Product Review Meeting' }
    ]
  },
  // 6. Rohan - Engineering, Late, 09:53 (Section 16 Specification)
  {
    id: 'att-20260927-emp-rohan',
    employeeId: 'emp-rohan',
    employeeName: 'Rohan Mehta',
    employeeRole: 'Frontend Specialist',
    department: 'Engineering',
    date: '2026-09-27',
    punchIn: '09:53',
    punchOut: null,
    breaks: [],
    totalWorkingMinutes: 227,
    breakMinutes: 0,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 23,
    overtimeMinutes: 0,
    status: 'late',
    sessionState: 'working',
    workMode: 'FIELD',
    checkInMethod: 'GPS',
    currentProjectId: 'proj-2',
    currentProjectName: 'CRM Platform',
    currentTaskId: 'TASK-108',
    currentTaskTitle: 'Component Library Migration',
    timeline: [
      { id: 'ev-ro1', time: '09:53', type: 'punch_in', title: 'Checked in (Late by 23m)' }
    ]
  },
  // 7. Siddhant Giri - Engineering, Completed Shift
  {
    id: 'att-20260927-emp-10',
    employeeId: 'emp-10',
    employeeName: 'Siddhant Giri',
    employeeRole: 'Full Stack Engineer',
    department: 'Engineering',
    date: '2026-09-27',
    punchIn: '09:30',
    punchOut: '18:30',
    breaks: [{ id: 'brk-s1', start: '13:00', end: '14:00', durationMinutes: 60, reason: 'Lunch' }],
    totalWorkingMinutes: 480,
    breakMinutes: 60,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'present',
    sessionState: 'completed',
    workMode: 'OFFICE',
    checkInMethod: 'WEB',
    currentProjectId: 'proj-2',
    currentProjectName: 'CRM Platform',
    timeline: [
      { id: 'ev-sg1', time: '09:30', type: 'punch_in', title: 'Checked in' },
      { id: 'ev-sg2', time: '18:30', type: 'punch_out', title: 'Checked out' }
    ]
  },
  // Previous records for 2026-09-21 backward compatibility
  {
    id: 'att-20260921-emp-1',
    employeeId: 'emp-1',
    employeeName: 'Tanmay Pandey',
    employeeRole: 'VP of Engineering & Operations',
    department: 'Engineering',
    date: '2026-09-21',
    punchIn: '09:14',
    punchOut: '18:28',
    breaks: [{ id: 'brk-p1', start: '13:05', end: '13:42', durationMinutes: 37, reason: 'Lunch Break' }],
    totalWorkingMinutes: 517,
    breakMinutes: 37,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 37,
    status: 'present',
    sessionState: 'completed',
    timeline: []
  }
];
