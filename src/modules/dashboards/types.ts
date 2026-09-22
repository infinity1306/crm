import { Role, Department } from '../../types';

export type DashboardPersona = 
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'sales_exec'
  | 'sales_manager'
  | 'developer'
  | 'finance'
  | 'hr'
  | 'client';

export type WidgetCategory = 
  | 'metrics' 
  | 'operations' 
  | 'sales' 
  | 'delivery' 
  | 'people' 
  | 'finance' 
  | 'client';

export type WidgetState = 'ready' | 'loading' | 'empty' | 'error' | 'no_access';

export type WidgetId =
  | 'kpi_metrics'
  | 'secondary_metrics'
  | 'company_pulse'
  | 'sales_pulse'
  | 'project_pulse'
  | 'workforce_pulse'
  | 'finance_pulse'
  | 'action_center'
  | 'live_activity'
  | 'team_overview'
  | 'project_overview'
  | 'sales_overview'
  | 'attendance_summary'
  | 'team_workload'
  | 'project_health'
  | 'team_activity'
  | 'manager_action_center'
  | 'sales_metrics'
  | 'today_sales_work'
  | 'my_pipeline'
  | 'sales_activity'
  | 'client_communication'
  | 'my_performance'
  | 'team_sales_table'
  | 'pipeline_health'
  | 'my_work_summary'
  | 'today_tasks'
  | 'assigned_projects_progress'
  | 'daily_work_update'
  | 'my_tickets'
  | 'upcoming_deadlines'
  | 'personal_attendance'
  | 'invoice_overview'
  | 'payment_activity'
  | 'expense_overview'
  | 'finance_action_center'
  | 'hr_metrics'
  | 'employee_overview'
  | 'leave_overview'
  | 'workforce_trends'
  | 'client_projects'
  | 'client_milestones'
  | 'client_invoices'
  | 'client_support'
  | 'client_chat';

export interface WidgetDefinition {
  id: WidgetId;
  title: string;
  category: WidgetCategory;
  description: string;
  allowedPersonas: DashboardPersona[];
}

export interface DashboardLayoutPreference {
  persona: DashboardPersona;
  enabledWidgets: WidgetId[];
}

export interface PersonaProfile {
  id: DashboardPersona;
  label: string;
  badge: string;
  role: Role;
  department: Department;
  sampleEmployeeId: string;
  description: string;
}

export const PERSONA_PROFILES: PersonaProfile[] = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    badge: 'Root Clearance',
    role: 'super_admin',
    department: 'Engineering',
    sampleEmployeeId: 'emp-1',
    description: 'Executive Control Center with full organization, finance, and operational pulses.'
  },
  {
    id: 'admin',
    label: 'Admin (Operations)',
    badge: 'Operations',
    role: 'admin',
    department: 'Operations',
    sampleEmployeeId: 'emp-1',
    description: 'Daily operational command for workforce, project delivery, and triage.'
  },
  {
    id: 'manager',
    label: 'Engineering Manager',
    badge: 'Team Lead',
    role: 'manager',
    department: 'Engineering',
    sampleEmployeeId: 'emp-3',
    description: 'Team workload balance, project blockers, review queues, and sprint health.'
  },
  {
    id: 'sales_exec',
    label: 'Sales Executive',
    badge: 'Revenue Hunter',
    role: 'employee',
    department: 'Sales',
    sampleEmployeeId: 'emp-8',
    description: 'Focused sales cockpit: deals, client follow-ups, meetings, and conversion quota.'
  },
  {
    id: 'sales_manager',
    label: 'Sales Manager',
    badge: 'Sales Lead',
    role: 'manager',
    department: 'Sales',
    sampleEmployeeId: 'emp-2',
    description: 'Sales leaderboard, pipeline health, stagnant deals, and rep performance.'
  },
  {
    id: 'developer',
    label: 'Developer / Engineer',
    badge: 'Builder',
    role: 'employee',
    department: 'Engineering',
    sampleEmployeeId: 'emp-4',
    description: 'Personal tasks, active tickets, daily work update, and attendance clock.'
  },
  {
    id: 'finance',
    label: 'Finance Controller',
    badge: 'Billing & Cashflow',
    role: 'employee',
    department: 'Finance',
    sampleEmployeeId: 'emp-12',
    description: 'Invoices lifecycle, inward collections, overdue recovery, and expense audits.'
  },
  {
    id: 'hr',
    label: 'HR / People Lead',
    badge: 'Talent & Culture',
    role: 'admin',
    department: 'HR',
    sampleEmployeeId: 'emp-6',
    description: 'Live attendance floor, leave approvals, workforce trends, and staff status.'
  },
  {
    id: 'client',
    label: 'Client Stakeholder',
    badge: 'External Partner',
    role: 'client',
    department: 'Operations',
    sampleEmployeeId: 'emp-15',
    description: 'Restricted client portal: deliverables, shared milestones, invoices, and communication.'
  }
];

export const ALL_WIDGETS: WidgetDefinition[] = [
  // Super Admin / Admin Widgets
  { id: 'kpi_metrics', title: 'Executive KPI Metrics', category: 'metrics', description: 'Total Revenue, Active Deals, Active Projects, Employees, Open Tickets, Outstanding', allowedPersonas: ['super_admin', 'admin'] },
  { id: 'secondary_metrics', title: 'Secondary Operational Metrics', category: 'metrics', description: 'Present Today, Working Now, Overdue Tasks, Delayed Projects, Pending Leaves', allowedPersonas: ['super_admin', 'admin'] },
  { id: 'company_pulse', title: 'Company Pulse', category: 'operations', description: 'Organization-wide directory, departments and headcounts', allowedPersonas: ['super_admin', 'admin'] },
  { id: 'sales_pulse', title: 'Sales Pulse', category: 'sales', description: 'Leads, proposals, pipeline funnel, and recent deals', allowedPersonas: ['super_admin', 'admin', 'sales_manager'] },
  { id: 'project_pulse', title: 'Project Delivery Pulse', category: 'delivery', description: 'Active project health, progress bars, and blocker count', allowedPersonas: ['super_admin', 'admin', 'manager'] },
  { id: 'workforce_pulse', title: 'Workforce Telemetry Pulse', category: 'people', description: 'Live attendance states (Working, Break, Present, Leave)', allowedPersonas: ['super_admin', 'admin', 'hr'] },
  { id: 'finance_pulse', title: 'Finance & Revenue Pulse', category: 'finance', description: 'Revenue collected, outstanding, and cash burn rate', allowedPersonas: ['super_admin', 'admin', 'finance'] },
  { id: 'action_center', title: 'Operational Action Center', category: 'operations', description: 'Overdue invoices, delayed projects, and critical triage items', allowedPersonas: ['super_admin', 'admin'] },
  { id: 'live_activity', title: 'Live Activity Stream', category: 'operations', description: 'Unified chronological organization timeline', allowedPersonas: ['super_admin', 'admin'] },

  // Admin / Manager Widgets
  { id: 'team_overview', title: 'Team Operational Status', category: 'people', description: 'Employee status, current task, and last active ping', allowedPersonas: ['admin', 'manager', 'hr'] },
  { id: 'project_overview', title: 'Project Health Overview', category: 'delivery', description: 'Deadlines, managers, and delivery bottlenecks', allowedPersonas: ['admin', 'manager'] },
  { id: 'sales_overview', title: 'Sales Summary', category: 'sales', description: 'Meetings, follow-ups, and pipeline velocity', allowedPersonas: ['admin'] },
  { id: 'attendance_summary', title: 'Today\'s Attendance', category: 'people', description: 'Present, absent, late, and working headcounts', allowedPersonas: ['admin', 'hr'] },
  { id: 'team_workload', title: 'Team Workload & Capacity', category: 'delivery', description: 'Tasks assigned, completed, in-progress, and blocked per member', allowedPersonas: ['manager'] },
  { id: 'project_health', title: 'Assigned Project Health', category: 'delivery', description: 'Delivery risk, blockers, and milestone schedules', allowedPersonas: ['manager'] },
  { id: 'team_activity', title: 'Team Activity Feed', category: 'operations', description: 'Updates, completed tasks, and ticket resolutions by team', allowedPersonas: ['manager'] },
  { id: 'manager_action_center', title: 'Manager Action Center', category: 'operations', description: 'Blocked tasks, pending updates, and urgent team blockers', allowedPersonas: ['manager'] },

  // Sales Widgets
  { id: 'sales_metrics', title: 'Sales Performance Metrics', category: 'sales', description: 'Leads, meetings, proposals, conversions, pipeline value, revenue', allowedPersonas: ['sales_exec', 'sales_manager'] },
  { id: 'today_sales_work', title: 'Today\'s Sales Work', category: 'sales', description: 'Upcoming meetings, overdue follow-ups, calls, and sales tasks', allowedPersonas: ['sales_exec'] },
  { id: 'my_pipeline', title: 'My Active Deals Pipeline', category: 'sales', description: 'Deals grouped by sales stage with values and close dates', allowedPersonas: ['sales_exec'] },
  { id: 'sales_activity', title: 'Sales Activity Timeline', category: 'sales', description: 'Calls, demos, emails, and follow-up history', allowedPersonas: ['sales_exec', 'sales_manager'] },
  { id: 'client_communication', title: 'Client Communication & Chats', category: 'sales', description: 'Recent messages from prospective clients and next actions', allowedPersonas: ['sales_exec', 'sales_manager'] },
  { id: 'my_performance', title: 'Quota vs Actual Performance', category: 'sales', description: 'Target, actual, and remaining gap comparison', allowedPersonas: ['sales_exec'] },
  { id: 'team_sales_table', title: 'Sales Team Leaderboard', category: 'sales', description: 'Rep by rep meetings, follow-ups, proposals, and won revenue', allowedPersonas: ['sales_manager'] },
  { id: 'pipeline_health', title: 'Pipeline Health & Forecast', category: 'sales', description: 'Stage velocity, stagnant deals, and projected closures', allowedPersonas: ['sales_manager'] },

  // Developer / Employee Widgets
  { id: 'my_work_summary', title: 'My Work Summary', category: 'delivery', description: 'My projects, active tasks, tasks due today, and blocked items', allowedPersonas: ['developer'] },
  { id: 'today_tasks', title: 'Today\'s Assigned Tasks', category: 'delivery', description: 'Prioritized checklist of tasks due today or in-progress', allowedPersonas: ['developer'] },
  { id: 'assigned_projects_progress', title: 'Assigned Projects Progress', category: 'delivery', description: 'Completion percentage and deliverables for my projects', allowedPersonas: ['developer'] },
  { id: 'daily_work_update', title: 'Daily Work Update', category: 'delivery', description: 'Embedded form to submit daily work update (Done, Next, Blockers)', allowedPersonas: ['developer'] },
  { id: 'my_tickets', title: 'My Assigned Tickets', category: 'delivery', description: 'Open, in-progress, waiting, and resolved support issues', allowedPersonas: ['developer'] },
  { id: 'upcoming_deadlines', title: 'Upcoming Deadlines', category: 'delivery', description: 'Tasks due today, tomorrow, and overdue items', allowedPersonas: ['developer'] },
  { id: 'personal_attendance', title: 'Personal Attendance & Clock', category: 'people', description: 'Punch in/out controls, active working time, and breaks', allowedPersonas: ['super_admin', 'admin', 'manager', 'sales_exec', 'sales_manager', 'developer', 'finance', 'hr'] },

  // Finance Widgets
  { id: 'invoice_overview', title: 'Invoice Lifecycle Overview', category: 'finance', description: 'Draft, Sent, Partially Paid, Paid, and Overdue breakdowns', allowedPersonas: ['finance'] },
  { id: 'payment_activity', title: 'Recent Payment Inflows', category: 'finance', description: 'Latest client payments, transaction modes, and receipts', allowedPersonas: ['finance'] },
  { id: 'expense_overview', title: 'Department Expenses Desk', category: 'finance', description: 'Submitted, pending approval, and approved expense claims', allowedPersonas: ['finance'] },
  { id: 'finance_action_center', title: 'Finance Action Center', category: 'finance', description: 'Overdue recovery list, pending approvals, and payment alerts', allowedPersonas: ['finance'] },

  // HR Widgets
  { id: 'hr_metrics', title: 'Workforce Metrics', category: 'people', description: 'Headcount, attendance rate, working now, and leaves', allowedPersonas: ['hr'] },
  { id: 'employee_overview', title: 'Employee Directory Status', category: 'people', description: 'Department, status, today\'s punch-in, and last active', allowedPersonas: ['hr'] },
  { id: 'leave_overview', title: 'Leave Management Queue', category: 'people', description: 'Pending leave requests, approvals, and upcoming holiday roster', allowedPersonas: ['hr'] },
  { id: 'workforce_trends', title: 'Workforce Trends', category: 'people', description: 'Average hours, punctuality rates, and absenteeism', allowedPersonas: ['hr'] },

  // Client Widgets
  { id: 'client_projects', title: 'Active Project Portals', category: 'client', description: 'Client project progress, current phase, and completion date', allowedPersonas: ['client'] },
  { id: 'client_milestones', title: 'Project Milestones Timeline', category: 'client', description: 'Upcoming deliverable checkpoints and approval status', allowedPersonas: ['client'] },
  { id: 'client_invoices', title: 'Billing & Invoices', category: 'client', description: 'View and download invoices, payment receipts', allowedPersonas: ['client'] },
  { id: 'client_support', title: 'Support Tickets', category: 'client', description: 'Submit tickets and track resolution progress', allowedPersonas: ['client'] },
  { id: 'client_chat', title: 'Direct Communications', category: 'client', description: 'Direct messaging and file sharing with project team', allowedPersonas: ['client'] }
];

export const DEFAULT_LAYOUTS: Record<DashboardPersona, WidgetId[]> = {
  super_admin: [
    'personal_attendance',
    'kpi_metrics',
    'secondary_metrics',
    'action_center',
    'company_pulse',
    'sales_pulse',
    'project_pulse',
    'workforce_pulse',
    'finance_pulse',
    'live_activity'
  ],
  admin: [
    'personal_attendance',
    'kpi_metrics',
    'action_center',
    'team_overview',
    'project_overview',
    'sales_overview',
    'attendance_summary',
    'live_activity'
  ],
  manager: [
    'personal_attendance',
    'manager_action_center',
    'team_workload',
    'project_health',
    'team_activity'
  ],
  sales_exec: [
    'personal_attendance',
    'sales_metrics',
    'today_sales_work',
    'my_pipeline',
    'client_communication',
    'sales_activity',
    'my_performance'
  ],
  sales_manager: [
    'personal_attendance',
    'sales_metrics',
    'team_sales_table',
    'pipeline_health',
    'sales_activity'
  ],
  developer: [
    'personal_attendance',
    'today_tasks',
    'my_work_summary',
    'daily_work_update',
    'assigned_projects_progress',
    'my_tickets',
    'upcoming_deadlines'
  ],
  finance: [
    'personal_attendance',
    'finance_pulse',
    'finance_action_center',
    'invoice_overview',
    'payment_activity',
    'expense_overview'
  ],
  hr: [
    'personal_attendance',
    'hr_metrics',
    'leave_overview',
    'employee_overview',
    'workforce_trends'
  ],
  client: [
    'client_projects',
    'client_milestones',
    'client_invoices',
    'client_support',
    'client_chat'
  ]
};
