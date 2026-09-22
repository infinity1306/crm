// Phase 4 — Attendance & Employee Operations Mock Data
// STAR CHAIN LABS Internal CRM

import { 
  AttendanceRecord, 
  LeaveRequest, 
  LeaveBalance, 
  AttendanceOrgConfig 
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
  'emp-1': { // Siddharth Rao
    employeeId: 'emp-1',
    annual: { total: 18, used: 6, pending: 2, remaining: 10 },
    sick: { total: 10, used: 2, pending: 0, remaining: 8 },
    casual: { total: 7, used: 2, pending: 0, remaining: 5 },
    unpaid: { used: 0 }
  },
  'emp-2': { // Rajesh Verma
    employeeId: 'emp-2',
    annual: { total: 18, used: 2, pending: 0, remaining: 16 },
    sick: { total: 10, used: 1, pending: 0, remaining: 9 },
    casual: { total: 7, used: 1, pending: 0, remaining: 6 },
    unpaid: { used: 0 }
  },
  'emp-3': { // Anita Desai
    employeeId: 'emp-3',
    annual: { total: 18, used: 4, pending: 5, remaining: 9 },
    sick: { total: 10, used: 0, pending: 0, remaining: 10 },
    casual: { total: 7, used: 3, pending: 0, remaining: 4 },
    unpaid: { used: 0 }
  },
  'emp-4': { // Vikash Patel
    employeeId: 'emp-4',
    annual: { total: 18, used: 5, pending: 0, remaining: 13 },
    sick: { total: 10, used: 3, pending: 0, remaining: 7 },
    casual: { total: 7, used: 4, pending: 0, remaining: 3 },
    unpaid: { used: 0 }
  },
  'emp-5': { // Neha Gupta
    employeeId: 'emp-5',
    annual: { total: 18, used: 8, pending: 0, remaining: 10 },
    sick: { total: 10, used: 1, pending: 0, remaining: 9 },
    casual: { total: 7, used: 2, pending: 0, remaining: 5 },
    unpaid: { used: 0 }
  },
  'emp-6': { // Dhruv Sharma
    employeeId: 'emp-6',
    annual: { total: 18, used: 4, pending: 0, remaining: 14 },
    sick: { total: 10, used: 4, pending: 0, remaining: 6 },
    casual: { total: 7, used: 1, pending: 0, remaining: 6 },
    unpaid: { used: 0 }
  },
  'emp-7': { // Rohan Mehta
    employeeId: 'emp-7',
    annual: { total: 18, used: 3, pending: 0, remaining: 15 },
    sick: { total: 10, used: 2, pending: 0, remaining: 8 },
    casual: { total: 7, used: 1, pending: 2, remaining: 4 },
    unpaid: { used: 1 }
  },
  'emp-8': { // Priya Nair
    employeeId: 'emp-8',
    annual: { total: 18, used: 5, pending: 0, remaining: 13 },
    sick: { total: 10, used: 1, pending: 0, remaining: 9 },
    casual: { total: 7, used: 2, pending: 0, remaining: 5 },
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
    startDate: '2026-09-21',
    endDate: '2026-09-21',
    daysCount: 1,
    reason: 'Severe seasonal flu and viral fever. Prescribed 24h rest by physician.',
    attachmentName: 'medical_consultation_prescription.pdf',
    status: 'approved',
    requestedAt: '2026-09-21 07:45',
    reviewedBy: 'emp-2',
    reviewedByName: 'Rajesh Verma',
    reviewedAt: '2026-09-21 08:30',
    reviewNote: 'Approved. Take complete rest Dhruv, team is covering UPI switch items.'
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
    reason: 'Planned family vacation and Diwali festival break. Handoff meeting scheduled with PM team.',
    attachmentName: 'leave_plan_sprint_handoff.pdf',
    status: 'pending',
    requestedAt: '2026-09-20 14:15'
  },
  {
    id: 'LV-103',
    employeeId: 'emp-7',
    employeeName: 'Rohan Mehta',
    employeeRole: 'Frontend Specialist',
    department: 'Engineering',
    leaveType: 'casual',
    startDate: '2026-09-23',
    endDate: '2026-09-24',
    daysCount: 2,
    reason: 'House relocation and utility registration in North Bangalore.',
    status: 'pending',
    requestedAt: '2026-09-21 11:20'
  },
  {
    id: 'LV-104',
    employeeId: 'emp-4',
    employeeName: 'Vikash Patel',
    employeeRole: 'Senior Fullstack Developer',
    department: 'Engineering',
    leaveType: 'casual',
    startDate: '2026-09-10',
    endDate: '2026-09-11',
    daysCount: 2,
    reason: 'Attending India FinTech Builders Summit in Mumbai for API benchmarks.',
    status: 'approved',
    requestedAt: '2026-09-05 10:10',
    reviewedBy: 'emp-3',
    reviewedByName: 'Anita Desai',
    reviewedAt: '2026-09-06 12:00',
    reviewNote: 'Approved. Please share conference insights with backend pod.'
  },
  {
    id: 'LV-105',
    employeeId: 'emp-5',
    employeeName: 'Neha Gupta',
    employeeRole: 'DevOps & Cloud Architect',
    department: 'Engineering',
    leaveType: 'annual',
    startDate: '2026-08-18',
    endDate: '2026-08-21',
    daysCount: 4,
    reason: 'Family wedding ceremony in Jaipur.',
    status: 'approved',
    requestedAt: '2026-08-10 16:30',
    reviewedBy: 'emp-2',
    reviewedByName: 'Rajesh Verma',
    reviewedAt: '2026-08-11 09:15',
    reviewNote: 'Approved. Staging pipelines kept stable.'
  }
];

// Today: 2026-09-21 (Monday)
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // 1. Siddharth Rao (Current User) - Working Now
  {
    id: 'att-20260921-emp-1',
    employeeId: 'emp-1',
    employeeName: 'Siddharth Rao',
    employeeRole: 'Lead Engineer & Architect',
    department: 'Engineering',
    date: '2026-09-21',
    punchIn: '09:14',
    punchOut: null,
    breaks: [
      {
        id: 'brk-1',
        start: '13:05',
        end: '13:42',
        durationMinutes: 37,
        reason: 'Lunch Break'
      }
    ],
    totalWorkingMinutes: 385, // ~6h 25m
    breakMinutes: 37,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'working',
    sessionState: 'working',
    currentProjectId: 'proj-2',
    currentProjectName: 'NextGen Payment Mesh API',
    currentTaskId: 'TASK-101',
    currentTaskTitle: 'Core UPI Router Engine & Idempotency',
    timeline: [
      { id: 'ev-1', time: '09:14', type: 'punch_in', title: 'Punched In', description: 'Office terminal access verified' },
      { id: 'ev-2', time: '09:22', type: 'project_started', title: 'Started NextGen Payment Mesh API', referenceId: 'proj-2' },
      { id: 'ev-3', time: '11:48', type: 'task_completed', title: 'Merged PR #88 for UPI Router Engine', referenceId: 'TASK-101' },
      { id: 'ev-4', time: '13:05', type: 'break_start', title: 'Lunch Break Started' },
      { id: 'ev-5', time: '13:42', type: 'break_end', title: 'Lunch Break Ended (37m)' },
      { id: 'ev-6', time: '14:10', type: 'ticket_updated', title: 'Updated ticket TICK-204 with sandbox logs', referenceId: 'TICK-204' },
      { id: 'ev-7', time: '17:30', type: 'work_update', title: 'Daily Standup Update Submitted', description: '3 tasks completed, NPCI switch blocker noted' }
    ]
  },
  // 2. Vikash Patel - Late Today (09:47 AM, expected 09:30 + 15m grace)
  {
    id: 'att-20260921-emp-4',
    employeeId: 'emp-4',
    employeeName: 'Vikash Patel',
    employeeRole: 'Senior Fullstack Developer',
    department: 'Engineering',
    date: '2026-09-21',
    punchIn: '09:47',
    punchOut: null,
    breaks: [
      {
        id: 'brk-2',
        start: '13:15',
        end: '14:00',
        durationMinutes: 45,
        reason: 'Lunch Break'
      }
    ],
    totalWorkingMinutes: 345, // ~5h 45m
    breakMinutes: 45,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 17, // 09:47 vs 09:30 grace limit
    overtimeMinutes: 0,
    status: 'late',
    sessionState: 'working',
    currentProjectId: 'proj-1',
    currentProjectName: 'Aditya Birla Supply Chain Suite',
    currentTaskId: 'TASK-103',
    currentTaskTitle: 'Dispatch Tracking Map Integration',
    timeline: [
      { id: 'ev-11', time: '09:47', type: 'punch_in', title: 'Punched In (Late by 17m)', description: 'Traffic delay on Outer Ring Road' },
      { id: 'ev-12', time: '10:00', type: 'project_started', title: 'Started Aditya Birla Supply Chain Suite', referenceId: 'proj-1' },
      { id: 'ev-13', time: '13:15', type: 'break_start', title: 'Lunch Break Started' },
      { id: 'ev-14', time: '14:00', type: 'break_end', title: 'Resumed Work' }
    ]
  },
  // 3. Dhruv Sharma - On Approved Sick Leave
  {
    id: 'att-20260921-emp-6',
    employeeId: 'emp-6',
    employeeName: 'Dhruv Sharma',
    employeeRole: 'Lead Backend Architect',
    department: 'Engineering',
    date: '2026-09-21',
    punchIn: '00:00',
    punchOut: '00:00',
    breaks: [],
    totalWorkingMinutes: 0,
    breakMinutes: 0,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'leave',
    sessionState: 'not_started',
    timeline: [
      { id: 'ev-21', time: '08:30', type: 'break_start', title: 'On Approved Sick Leave', description: 'LV-101 approved by Rajesh Verma' }
    ]
  },
  // 4. Anita Desai - Working Now
  {
    id: 'att-20260921-emp-3',
    employeeId: 'emp-3',
    employeeName: 'Anita Desai',
    employeeRole: 'Head of Product & Delivery',
    department: 'Product',
    date: '2026-09-21',
    punchIn: '09:10',
    punchOut: null,
    breaks: [
      { id: 'brk-3', start: '13:00', end: '13:30', durationMinutes: 30, reason: 'Lunch' }
    ],
    totalWorkingMinutes: 395,
    breakMinutes: 30,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'working',
    sessionState: 'working',
    currentProjectId: 'proj-1',
    currentProjectName: 'Aditya Birla Supply Chain Suite',
    timeline: [
      { id: 'ev-31', time: '09:10', type: 'punch_in', title: 'Punched In' },
      { id: 'ev-32', time: '10:30', type: 'project_started', title: 'Sprint Review & Stakeholder Sync' }
    ]
  },
  // 5. Rajesh Verma - Executive Working
  {
    id: 'att-20260921-emp-2',
    employeeId: 'emp-2',
    employeeName: 'Rajesh Verma',
    employeeRole: 'Executive Director & Founder',
    department: 'Executive',
    date: '2026-09-21',
    punchIn: '08:55',
    punchOut: null,
    breaks: [
      { id: 'brk-4', start: '12:45', end: '13:30', durationMinutes: 45, reason: 'Lunch' }
    ],
    totalWorkingMinutes: 410,
    breakMinutes: 45,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'working',
    sessionState: 'working',
    timeline: [
      { id: 'ev-41', time: '08:55', type: 'punch_in', title: 'Punched In' },
      { id: 'ev-42', time: '09:15', type: 'ticket_updated', title: 'Raised Admin Operational Query TICK-205' }
    ]
  },
  // 6. Neha Gupta - Completed Day with Overtime
  {
    id: 'att-20260921-emp-5',
    employeeId: 'emp-5',
    employeeName: 'Neha Gupta',
    employeeRole: 'DevOps & Cloud Architect',
    department: 'Engineering',
    date: '2026-09-21',
    punchIn: '09:05',
    punchOut: '18:15',
    breaks: [
      { id: 'brk-5', start: '13:00', end: '13:45', durationMinutes: 45, reason: 'Lunch' }
    ],
    totalWorkingMinutes: 505, // 8h 25m
    breakMinutes: 45,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 25,
    status: 'present',
    sessionState: 'completed',
    currentProjectId: 'proj-4',
    currentProjectName: 'CloudSync Enterprise Mesh',
    timeline: [
      { id: 'ev-51', time: '09:05', type: 'punch_in', title: 'Punched In' },
      { id: 'ev-52', time: '13:00', type: 'break_start', title: 'Lunch Break' },
      { id: 'ev-53', time: '13:45', type: 'break_end', title: 'Resumed Deployment Cluster' },
      { id: 'ev-54', time: '18:15', type: 'punch_out', title: 'Punched Out (Completed 08h 25m)' }
    ]
  },
  // 7. Rohan Mehta - Absent Today
  {
    id: 'att-20260921-emp-7',
    employeeId: 'emp-7',
    employeeName: 'Rohan Mehta',
    employeeRole: 'Frontend Specialist',
    department: 'Engineering',
    date: '2026-09-21',
    punchIn: '00:00',
    punchOut: null,
    breaks: [],
    totalWorkingMinutes: 0,
    breakMinutes: 0,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'absent',
    sessionState: 'not_started',
    timeline: []
  },
  // 8. Priya Nair - Working Now
  {
    id: 'att-20260921-emp-8',
    employeeId: 'emp-8',
    employeeName: 'Priya Nair',
    employeeRole: 'QA Automation Lead',
    department: 'Engineering',
    date: '2026-09-21',
    punchIn: '09:25',
    punchOut: null,
    breaks: [],
    totalWorkingMinutes: 380,
    breakMinutes: 0,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'working',
    sessionState: 'working',
    currentProjectId: 'proj-2',
    currentProjectName: 'NextGen Payment Mesh API',
    currentTaskId: 'TASK-105',
    currentTaskTitle: 'NPCI Switch UAT & Sandbox Validation',
    timeline: [
      { id: 'ev-81', time: '09:25', type: 'punch_in', title: 'Punched In' },
      { id: 'ev-82', time: '10:15', type: 'task_completed', title: 'Executed Cypress Regression Suite' }
    ]
  },

  // ==========================================
  // HISTORICAL RECORDS (September 2026)
  // For calendar views, monthly grids & analytics
  // ==========================================
  // Friday Sep 18 (Completed Day with Admin Correction)
  {
    id: 'att-20260918-emp-1',
    employeeId: 'emp-1',
    employeeName: 'Siddharth Rao',
    employeeRole: 'Lead Engineer & Architect',
    department: 'Engineering',
    date: '2026-09-18',
    punchIn: '09:14',
    punchOut: '18:28',
    breaks: [
      { id: 'hbrk-1', start: '13:05', end: '13:42', durationMinutes: 37, reason: 'Lunch' }
    ],
    totalWorkingMinutes: 517, // 08h 37m
    breakMinutes: 37,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 37,
    status: 'present',
    sessionState: 'completed',
    timeline: [
      { id: 'hev-1', time: '09:14', type: 'punch_in', title: 'Punched In' },
      { id: 'hev-2', time: '13:05', type: 'break_start', title: 'Break Started' },
      { id: 'hev-3', time: '13:42', type: 'break_end', title: 'Break Ended' },
      { id: 'hev-4', time: '18:28', type: 'punch_out', title: 'Punched Out (Total 08h 37m)' }
    ]
  },
  {
    id: 'att-20260917-emp-1',
    employeeId: 'emp-1',
    employeeName: 'Siddharth Rao',
    employeeRole: 'Lead Engineer & Architect',
    department: 'Engineering',
    date: '2026-09-17',
    punchIn: '09:28',
    punchOut: '18:10',
    breaks: [
      { id: 'hbrk-2', start: '13:00', end: '13:45', durationMinutes: 45, reason: 'Lunch' }
    ],
    totalWorkingMinutes: 477, // ~7h 57m
    breakMinutes: 45,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'present',
    sessionState: 'completed',
    timeline: [
      { id: 'hev-11', time: '09:28', type: 'punch_in', title: 'Punched In' },
      { id: 'hev-12', time: '18:10', type: 'punch_out', title: 'Punched Out' }
    ]
  },
  {
    id: 'att-20260916-emp-1',
    employeeId: 'emp-1',
    employeeName: 'Siddharth Rao',
    employeeRole: 'Lead Engineer & Architect',
    department: 'Engineering',
    date: '2026-09-16',
    punchIn: '09:48',
    punchOut: '19:15',
    breaks: [
      { id: 'hbrk-3', start: '13:30', end: '14:15', durationMinutes: 45, reason: 'Lunch' }
    ],
    totalWorkingMinutes: 522, // 8h 42m
    breakMinutes: 45,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 18,
    overtimeMinutes: 42,
    status: 'late',
    sessionState: 'completed',
    timeline: [
      { id: 'hev-21', time: '09:48', type: 'punch_in', title: 'Late Punch In (18m late)' },
      { id: 'hev-22', time: '19:15', type: 'punch_out', title: 'Punched Out with Overtime' }
    ]
  },
  // Corrected Record Example: Sid forgot to punch out on Sep 15
  {
    id: 'att-20260915-emp-1',
    employeeId: 'emp-1',
    employeeName: 'Siddharth Rao',
    employeeRole: 'Lead Engineer & Architect',
    department: 'Engineering',
    date: '2026-09-15',
    punchIn: '09:14',
    punchOut: '18:27', // Corrected by Admin
    breaks: [
      { id: 'hbrk-4', start: '13:10', end: '13:55', durationMinutes: 45, reason: 'Lunch' }
    ],
    totalWorkingMinutes: 508, // 8h 28m
    breakMinutes: 45,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 28,
    status: 'present',
    sessionState: 'completed',
    correction: {
      isCorrected: true,
      originalPunchIn: '09:14',
      originalPunchOut: null,
      originalStatus: 'present',
      correctedBy: 'emp-2',
      correctedByName: 'Rajesh Verma',
      correctedAt: '2026-09-16 09:30',
      reason: 'Forgot to punch out after late client architectural call'
    },
    timeline: [
      { id: 'hev-31', time: '09:14', type: 'punch_in', title: 'Punched In' },
      { id: 'hev-32', time: '18:27', type: 'correction', title: 'Punch Out Corrected by Admin', description: 'Admin Rajesh Verma set punch out to 18:27 (Reason: Forgot to punch out after late call)' }
    ]
  },
  // Historical entries for other employees across past dates
  {
    id: 'att-20260918-emp-4',
    employeeId: 'emp-4',
    employeeName: 'Vikash Patel',
    employeeRole: 'Senior Fullstack Developer',
    department: 'Engineering',
    date: '2026-09-18',
    punchIn: '09:20',
    punchOut: '18:00',
    breaks: [{ id: 'hbrk-5', start: '13:00', end: '13:45', durationMinutes: 45 }],
    totalWorkingMinutes: 475,
    breakMinutes: 45,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'present',
    sessionState: 'completed',
    timeline: []
  },
  {
    id: 'att-20260917-emp-4',
    employeeId: 'emp-4',
    employeeName: 'Vikash Patel',
    employeeRole: 'Senior Fullstack Developer',
    department: 'Engineering',
    date: '2026-09-17',
    punchIn: '09:52',
    punchOut: '18:30',
    breaks: [{ id: 'hbrk-6', start: '13:00', end: '13:45', durationMinutes: 45 }],
    totalWorkingMinutes: 473,
    breakMinutes: 45,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 22,
    overtimeMinutes: 0,
    status: 'late',
    sessionState: 'completed',
    timeline: []
  },
  {
    id: 'att-20260918-emp-6',
    employeeId: 'emp-6',
    employeeName: 'Dhruv Sharma',
    employeeRole: 'Lead Backend Architect',
    department: 'Engineering',
    date: '2026-09-18',
    punchIn: '09:15',
    punchOut: '18:10',
    breaks: [{ id: 'hbrk-7', start: '13:00', end: '13:30', durationMinutes: 30 }],
    totalWorkingMinutes: 505,
    breakMinutes: 30,
    expectedStart: '09:30',
    expectedWorkMinutes: 480,
    lateMinutes: 0,
    overtimeMinutes: 25,
    status: 'present',
    sessionState: 'completed',
    timeline: []
  }
];
