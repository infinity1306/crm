import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Employee, 
  Invitation, 
  RolePermissions, 
  ActivityEvent, 
  AuditLog, 
  NotificationItem, 
  OrganizationSettings,
  Role,
  PermissionModule,
  PermissionAction,
  EmployeeNote,
  EmployeeDocument,
  UserSession
} from '../types';
import { 
  Lead, 
  Contact, 
  Company, 
  Deal, 
  CRMActivity, 
  Meeting, 
  FollowUp, 
  Conversation,
  ChatMessage,
  SalesEmployeeMetric,
  LeadStage,
  DealStage
} from '../types/crm';
import { 
  INITIAL_CURRENT_USER, 
  INITIAL_EMPLOYEES, 
  INITIAL_INVITATIONS, 
  INITIAL_ROLE_PERMISSIONS, 
  INITIAL_ACTIVITY_EVENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ORGANIZATION,
  INITIAL_NOTES,
  INITIAL_DOCUMENTS,
  INITIAL_SESSIONS
} from '../data/mockData';
import {
  INITIAL_COMPANIES,
  INITIAL_CONTACTS,
  INITIAL_LEADS,
  INITIAL_DEALS,
  INITIAL_MEETINGS,
  INITIAL_FOLLOW_UPS,
  INITIAL_CONVERSATIONS,
  INITIAL_SALES_METRICS
} from '../data/crmMockData';
import {
  Project,
  Milestone,
  Task,
  TaskComment,
  DailyWorkUpdate,
  InternalTicket,
  TicketMessage,
  ProjectFile,
  ProjectHealth,
  TaskStatus,
  InternalTicketStatus,
  OperationalQueryResponse
} from '../types/projects';
import {
  INITIAL_PROJECTS,
  INITIAL_MILESTONES,
  INITIAL_TASKS,
  INITIAL_DAILY_UPDATES,
  INITIAL_INTERNAL_TICKETS,
  INITIAL_PROJECT_FILES
} from '../data/projectMockData';
import {
  AttendanceRecord,
  AttendanceStatus,
  WorkSessionState,
  OperationalStatus,
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  LeaveStatus,
  AttendanceOrgConfig,
  AttendanceCorrection,
  DailySessionTimelineEvent,
  Shift,
  AttendanceLocation,
  AttendanceEvent,
  AttendanceCorrectionRequest,
  AttendanceException,
  WorkMode,
  CheckInMethod,
  CorrectionIssueType
} from '../types/attendance';
import {
  DEFAULT_ATTENDANCE_CONFIG,
  INITIAL_LEAVE_BALANCES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_CORRECTION_REQUESTS,
  INITIAL_EXCEPTIONS
} from '../data/attendanceMockData';
import {
  DEFAULT_SHIFTS,
  OFFICE_LOCATIONS,
  validateAttendanceTransition,
  calculateLateArrival,
  getClientIp,
  syncEventToSupabase,
  syncSessionToSupabase,
  detectAttendanceExceptions,
  getTodayOrgDate
} from '../services/attendanceService';
import {
  supabaseAdmin,
  checkSupabaseHealth,
  SupabaseHealthStatus
} from '../lib/supabase';
import {
  Invoice,
  InvoiceItem,
  Payment,
  Expense,
  FinanceOrgConfig,
  InvoiceStatus,
  PaymentMethod,
  ExpenseCategory,
  ExpenseStatus,
  FinanceSummaryMetrics
} from '../types/finance';
import {
  DEFAULT_FINANCE_CONFIG,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES
} from '../data/financeMockData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface CRMContextType {
  // Phase 1 Foundations
  currentUser: Employee;
  employees: Employee[];
  invitations: Invitation[];
  rolePermissions: RolePermissions;
  organization: OrganizationSettings;
  notifications: NotificationItem[];
  activityEvents: ActivityEvent[];
  auditLogs: AuditLog[];
  notes: EmployeeNote[];
  documents: EmployeeDocument[];
  sessions: UserSession[];
  
  // Phase 2 CRM & Sales Entities
  leads: Lead[];
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  meetings: Meeting[];
  followUps: FollowUp[];
  conversations: Conversation[];
  salesMetrics: SalesEmployeeMetric[];

  // Phase 3 Delivery Entities
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  workUpdates: DailyWorkUpdate[];
  tickets: InternalTicket[];
  projectFiles: ProjectFile[];

  // Phase 3 Derived Calculators
  calculateProjectProgress: (projectId: string) => {
    overall: number;
    moduleBreakdown: Array<{ name: string; progress: number; taskCount: number }>;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    overdueTasks: number;
    openTasks: number;
  };
  evaluateProjectHealth: (projectId: string) => ProjectHealth;

  // Navigation & global UI
  currentPath: string;
  navigateTo: (path: string) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isInviteModalOpen: boolean;
  setInviteModalOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  
  // Admin Portal Authentication
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, passwordOrPin: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Phase 1 Actions
  updateEmployee: (id: string, partial: Partial<Employee>) => void;
  createInvitation: (invite: Omit<Invitation, 'id' | 'status' | 'invitedBy' | 'invitedAt' | 'expiresAt' | 'token'>) => Invitation;
  resendInvitation: (id: string) => void;
  revokeInvitation: (id: string) => void;
  updateRolePermissions: (role: Role, module: PermissionModule, action: PermissionAction, value: boolean) => void;
  resetRolePermissions: () => void;
  updateOrganization: (partial: Partial<OrganizationSettings>) => void;
  updateCurrentUser: (partial: Partial<Employee>) => void;
  switchUserRole: (role: Role) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  addEmployeeNote: (employeeId: string, content: string) => void;
  terminateOtherSessions: () => void;
  exportTeamCSV: () => void;

  // Phase 2 CRM Actions
  addLead: (leadData: Omit<Lead, 'id' | 'createdDate' | 'lastActivity'>) => Lead;
  updateLead: (id: string, partial: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToClient: (leadId: string, options: {
    createCompany: boolean;
    companyName?: string;
    contactName?: string;
    createDeal: boolean;
    dealName?: string;
    dealValue?: number;
  }) => { companyId?: string; contactId?: string; dealId?: string };
  addContact: (contactData: Omit<Contact, 'id' | 'createdDate' | 'lastActivity'>) => Contact;
  updateContact: (id: string, partial: Partial<Contact>) => void;
  addCompany: (companyData: Omit<Company, 'id' | 'activeDealsCount' | 'totalRevenue' | 'lastActivity'>) => Company;
  updateCompany: (id: string, partial: Partial<Company>) => void;
  addDeal: (dealData: Omit<Deal, 'id' | 'createdDate' | 'lastActivity'>) => Deal;
  updateDeal: (id: string, partial: Partial<Deal>) => void;
  updateDealStage: (id: string, stage: DealStage, lostReason?: string) => void;
  scheduleMeeting: (meetingData: Omit<Meeting, 'id' | 'status'>) => Meeting;
  recordMeetingOutcome: (id: string, data: { outcome: string; clientResponse?: string; nextAction?: string; nextFollowUp?: string; notes?: string }) => void;
  addFollowUp: (followUpData: Omit<FollowUp, 'id' | 'status'>) => FollowUp;
  completeFollowUp: (id: string) => void;
  sendChatMessage: (conversationId: string, content: string, isInternalNote?: boolean) => void;

  // Phase 3 Delivery Actions
  createProject: (data: Omit<Project, 'id' | 'progress' | 'lastUpdated'>) => Project;
  updateProject: (id: string, partial: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  createMilestone: (data: Omit<Milestone, 'id' | 'progress'>) => Milestone;
  updateMilestone: (id: string, partial: Partial<Milestone>) => void;
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'lastUpdated' | 'commentsCount' | 'attachmentsCount' | 'progress'> & { progress?: number }) => Task;
  updateTask: (id: string, partial: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus, blockedReason?: string) => void;
  addTaskComment: (taskId: string, content: string) => void;
  submitDailyUpdate: (updateData: Omit<DailyWorkUpdate, 'id' | 'createdAt'>) => DailyWorkUpdate;
  createTicket: (ticketData: Omit<InternalTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'attachments'> & { initialMessage?: string }) => InternalTicket;
  updateTicketStatus: (id: string, status: InternalTicketStatus) => void;
  addTicketMessage: (ticketId: string, content: string, operationalResponse?: OperationalQueryResponse) => void;
  uploadProjectFile: (fileData: Omit<ProjectFile, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>) => ProjectFile;

  // Phase 4 Attendance & Employee Operations State
  attendanceRecords: AttendanceRecord[];
  todayDateStr: string;
  attendanceEvents: AttendanceEvent[];
  attendanceExceptions: AttendanceException[];
  correctionRequests: AttendanceCorrectionRequest[];
  shifts: Shift[];
  officeLocations: AttendanceLocation[];
  supabaseStatus: SupabaseHealthStatus;
  leaveRequests: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  attendanceConfig: AttendanceOrgConfig;
  currentUserAttendance: AttendanceRecord | undefined;

  // Phase 4 Actions
  punchIn: (employeeId?: string, projectId?: string, taskId?: string, workMode?: WorkMode, method?: CheckInMethod, locationId?: string, coords?: { latitude: number; longitude: number }) => AttendanceRecord;
  punchOut: (employeeId?: string) => AttendanceRecord;
  startBreak: (employeeId?: string, reason?: string) => AttendanceRecord;
  endBreak: (employeeId?: string) => AttendanceRecord;
  dismissException: (id: string) => void;
  reviewCorrection: (id: string, action: 'APPROVE' | 'REJECT', notes?: string) => void;
  updateOperationalStatus: (employeeId: string, status: OperationalStatus, details?: { currentProjectId?: string; currentProjectName?: string; currentTaskId?: string; currentTaskTitle?: string }) => void;
  correctAttendance: (recordId: string, correctionData: { punchIn?: string; punchOut?: string | null; status?: AttendanceStatus; reason: string; issueType?: CorrectionIssueType }) => void;
  submitLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>) => LeaveRequest;
  reviewLeaveRequest: (requestId: string, action: 'approve' | 'reject' | 'changes', reviewNote?: string) => LeaveRequest;
  cancelLeaveRequest: (requestId: string) => LeaveRequest;
  updateAttendanceConfig: (config: Partial<AttendanceOrgConfig>) => void;

  // Phase 5 Finance & Billing State
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  financeConfig: FinanceOrgConfig;
  financeMetrics: FinanceSummaryMetrics;

  // Phase 5 Actions
  createInvoice: (data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName' | 'history'>) => Invoice;
  updateInvoice: (id: string, partial: Partial<Invoice>) => Invoice;
  sendInvoice: (id: string) => Invoice;
  cancelInvoice: (id: string) => Invoice;
  markInvoiceOverdue: (id: string) => Invoice;
  recordPayment: (data: { invoiceId: string; amount: number; method: PaymentMethod; reference: string; notes?: string }) => Payment;
  submitExpense: (data: Omit<Expense, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Expense;
  reviewExpense: (id: string, action: 'approve' | 'reject' | 'changes', reviewNote?: string) => Expense;
  payExpense: (id: string, paymentReference: string) => Expense;
  updateFinanceConfig: (config: Partial<FinanceOrgConfig>) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge legacy demo cache from browser storage for production readiness
  if (typeof window !== 'undefined') {
    const PROD_CACHE_VERSION = 'scl_v5_clean_prod';
    if (localStorage.getItem('scl_cache_version') !== PROD_CACHE_VERSION) {
      const demoKeys = [
        'scl_leads', 'scl_contacts', 'scl_companies', 'scl_deals',
        'scl_meetings', 'scl_followups', 'scl_conversations',
        'scl_projects', 'scl_tasks', 'scl_work_updates', 'scl_internal_tickets',
        'scl_attendance_records', 'scl_leave_requests', 'scl_correction_requests',
        'scl_exceptions', 'scl_invoices', 'scl_payments', 'scl_expenses',
        'scl_employees', 'scl_notifications', 'scl_activity_events', 'scl_audit_logs',
        'scl_invitations', 'scl_current_user', 'scl_notes', 'scl_documents', 'scl_sessions'
      ];
      demoKeys.forEach(k => localStorage.removeItem(k));
      localStorage.setItem('scl_cache_version', PROD_CACHE_VERSION);
    }
  }
  // Phase 1 state with localStorage fallback
  // Admin Portal Session Authentication
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('scl_admin_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<Employee>(() => {
    const saved = localStorage.getItem('scl_current_user');
    return saved ? JSON.parse(saved) : INITIAL_CURRENT_USER;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('scl_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [invitations, setInvitations] = useState<Invitation[]>(() => {
    const saved = localStorage.getItem('scl_invitations');
    return saved ? JSON.parse(saved) : INITIAL_INVITATIONS;
  });

  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(() => {
    const saved = localStorage.getItem('scl_role_permissions');
    return saved ? JSON.parse(saved) : INITIAL_ROLE_PERMISSIONS;
  });

  const [organization, setOrganization] = useState<OrganizationSettings>(() => {
    const saved = localStorage.getItem('scl_organization');
    return saved ? JSON.parse(saved) : INITIAL_ORGANIZATION;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('scl_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem('scl_activity_events');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_EVENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('scl_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notes, setNotes] = useState<EmployeeNote[]>(() => {
    const saved = localStorage.getItem('scl_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [documents] = useState<EmployeeDocument[]>(INITIAL_DOCUMENTS);
  const [sessions, setSessions] = useState<UserSession[]>(INITIAL_SESSIONS);

  // Phase 2 CRM State
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('scl_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('scl_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('scl_companies');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('scl_deals');
    return saved ? JSON.parse(saved) : INITIAL_DEALS;
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('scl_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    const saved = localStorage.getItem('scl_followups');
    return saved ? JSON.parse(saved) : INITIAL_FOLLOW_UPS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('scl_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [salesMetrics] = useState<SalesEmployeeMetric[]>(INITIAL_SALES_METRICS);

  // Phase 3 Delivery State
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('scl_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('scl_milestones');
    return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('scl_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [workUpdates, setWorkUpdates] = useState<DailyWorkUpdate[]>(() => {
    const saved = localStorage.getItem('scl_work_updates');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_UPDATES;
  });

  const [tickets, setTickets] = useState<InternalTicket[]>(() => {
    const saved = localStorage.getItem('scl_internal_tickets');
    return saved ? JSON.parse(saved) : INITIAL_INTERNAL_TICKETS;
  });

  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>(() => {
    const saved = localStorage.getItem('scl_project_files');
    return saved ? JSON.parse(saved) : INITIAL_PROJECT_FILES;
  });

  // Phase 4 Attendance & Leave State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('scl_attendance_records');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_RECORDS;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('scl_leave_requests');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>(() => {
    const saved = localStorage.getItem('scl_leave_balances');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_BALANCES;
  });

  const [attendanceConfig, setAttendanceConfig] = useState<AttendanceOrgConfig>(() => {
    const saved = localStorage.getItem('scl_attendance_config');
    return saved ? JSON.parse(saved) : DEFAULT_ATTENDANCE_CONFIG;
  });

  const [clientIp, setClientIp] = useState<string>('106.51.72.19');
  const [attendanceEvents, setAttendanceEvents] = useState<AttendanceEvent[]>([]);
  const [attendanceExceptions, setAttendanceExceptions] = useState<AttendanceException[]>(INITIAL_EXCEPTIONS);
  const [correctionRequests, setCorrectionRequests] = useState<AttendanceCorrectionRequest[]>(INITIAL_CORRECTION_REQUESTS);
  const [shifts, setShifts] = useState<Shift[]>(DEFAULT_SHIFTS);
  const [officeLocations, setOfficeLocations] = useState<AttendanceLocation[]>(OFFICE_LOCATIONS);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseHealthStatus>({
    connected: true,
    latencyMs: 38,
    tablesFound: ['attendance_events', 'attendance_sessions', 'shifts', 'locations', 'audit_logs'],
    mode: 'supabase_live'
  });

  useEffect(() => {
    getClientIp().then(ip => setClientIp(ip));
    checkSupabaseHealth().then(status => setSupabaseStatus(status));
  }, []);

  // Phase 5 Finance & Billing State
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('scl_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('scl_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('scl_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [financeConfig, setFinanceConfig] = useState<FinanceOrgConfig>(() => {
    const saved = localStorage.getItem('scl_finance_config');
    return saved ? JSON.parse(saved) : DEFAULT_FINANCE_CONFIG;
  });

  // UI state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname.startsWith('/app') ? window.location.pathname : '/app/overview';
  });
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('scl_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('scl_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('scl_invitations', JSON.stringify(invitations));
  }, [invitations]);

  useEffect(() => {
    localStorage.setItem('scl_role_permissions', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  useEffect(() => {
    localStorage.setItem('scl_organization', JSON.stringify(organization));
  }, [organization]);

  useEffect(() => {
    localStorage.setItem('scl_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('scl_activity_events', JSON.stringify(activityEvents));
  }, [activityEvents]);

  useEffect(() => {
    localStorage.setItem('scl_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('scl_notes', JSON.stringify(notes));
  }, [notes]);

  // Phase 2 Sync
  useEffect(() => {
    localStorage.setItem('scl_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('scl_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('scl_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('scl_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('scl_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('scl_followups', JSON.stringify(followUps));
  }, [followUps]);

  useEffect(() => {
    localStorage.setItem('scl_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Phase 3 Delivery Sync
  useEffect(() => {
    localStorage.setItem('scl_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('scl_milestones', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem('scl_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('scl_work_updates', JSON.stringify(workUpdates));
  }, [workUpdates]);

  useEffect(() => {
    localStorage.setItem('scl_internal_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('scl_project_files', JSON.stringify(projectFiles));
  }, [projectFiles]);

  // Phase 4 Attendance & Leave Sync
  useEffect(() => {
    localStorage.setItem('scl_attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('scl_leave_requests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('scl_leave_balances', JSON.stringify(leaveBalances));
  }, [leaveBalances]);

  useEffect(() => {
    localStorage.setItem('scl_attendance_config', JSON.stringify(attendanceConfig));
  }, [attendanceConfig]);

  // Phase 5 Finance Sync
  useEffect(() => {
    localStorage.setItem('scl_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('scl_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('scl_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('scl_finance_config', JSON.stringify(financeConfig));
  }, [financeConfig]);

  // Phase 5 Computed Financial Metrics
  const financeMetrics = useMemo<FinanceSummaryMetrics>(() => {
    const activeInvoices = invoices.filter(inv => inv.status !== 'cancelled' && inv.status !== 'draft');
    const totalRevenue = activeInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const totalCollected = payments.filter(p => p.status === 'successful').reduce((acc, p) => acc + p.amount, 0);
    const totalPending = invoices.filter(inv => inv.status === 'sent' || inv.status === 'partially_paid').reduce((acc, inv) => acc + inv.outstandingAmount, 0);
    const totalOverdue = invoices.filter(inv => inv.status === 'overdue').reduce((acc, inv) => acc + inv.outstandingAmount, 0);
    const totalExpenses = expenses.filter(e => e.status === 'approved' || e.status === 'paid').reduce((acc, e) => acc + e.amount, 0);
    const netRevenue = totalCollected - totalExpenses;
    const invoicesCount = invoices.length;
    const paidInvoicesCount = invoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoicesCount = invoices.filter(inv => inv.status === 'overdue').length;
    const pendingExpensesCount = expenses.filter(e => e.status === 'submitted').length;

    return {
      totalRevenue,
      totalCollected,
      totalPending,
      totalOverdue,
      totalExpenses,
      netRevenue,
      invoicesCount,
      paidInvoicesCount,
      overdueInvoicesCount,
      pendingExpensesCount
    };
  }, [invoices, payments, expenses]);

  // Handle browser popstate
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/app')) {
        setCurrentPath(window.location.pathname);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Activity & Audit Logging Helpers
  const logActivity = (
    type: ActivityEvent['type'], 
    entityType: ActivityEvent['entityType'], 
    entityId: string, 
    entityName: string, 
    description: string
  ) => {
    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role === 'admin' ? 'Admin' : currentUser.role.toUpperCase(),
      type,
      entityType,
      entityId,
      entityName,
      description
    };
    setActivityEvents(prev => [newEvent, ...prev]);
  };

  const logAudit = (action: string, entityType: string, entityId: string, details: string, status: 'SUCCESS' | 'WARNING' | 'FAILED' = 'SUCCESS') => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: formattedDate,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      ipAddress: clientIp,
      userAgent: navigator.userAgent.slice(0, 75),
      status,
      details
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    // Asynchronously sync append-only audit log to Supabase
    (async () => {
      try {
        await supabaseAdmin.from('audit_logs').insert({
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_role: currentUser.role,
          action,
          entity_type: entityType,
          entity_id: entityId,
          ip_address: clientIp,
          user_agent: navigator.userAgent,
          status,
          details
        });
      } catch {}
    })();
  };

  // Phase 1 Methods
  // Admin Portal Login & Lock methods
  const adminLogin = async (email: string, passwordOrPin: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = passwordOrPin.trim();

    const matchedAdmin = employees.find(
      e => e.email.toLowerCase() === trimmedEmail && (e.role === 'admin' || e.role === 'super_admin' || e.role === 'manager')
    );

    const isMasterEmail = trimmedEmail === 'admin@starchainlabs.com' || trimmedEmail === 'admin';
    const isValidPass = trimmedPass === 'admin123' || trimmedPass === 'admin@2026' || trimmedPass === '9988' || trimmedPass === 'password';

    if ((matchedAdmin || isMasterEmail) && isValidPass) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('scl_admin_authenticated', 'true');

      const adminUser = matchedAdmin || employees.find(e => e.role === 'admin' || e.role === 'super_admin') || currentUser;
      setCurrentUser({
        ...adminUser,
        role: adminUser.role === 'employee' ? 'admin' : adminUser.role
      });

      logAudit(
        'ADMIN_PORTAL_LOGIN', 
        'SECURITY_AUTH', 
        adminUser.id, 
        'Administrator authenticated into Admin Control Center.'
      );

      addToast({
        type: 'success',
        title: 'Administrator Clearance Granted',
        message: `Welcome to the Admin Command Center, ${adminUser.name}.`
      });

      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid administrator credentials. Access restricted to authorized Star Chain Labs managers.'
    };
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('scl_admin_authenticated');
    logAudit(
      'ADMIN_PORTAL_LOCK', 
      'SECURITY_AUTH', 
      currentUser.id, 
      'Administrator locked admin portal session.'
    );
    addToast({
      type: 'info',
      title: 'Admin Session Locked',
      message: 'Administrative clearance locked. Returning to staff view.'
    });
  };

  const updateEmployee = (id: string, partial: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, ...partial };
        if (id === currentUser.id) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return emp;
    }));

    const targetEmp = employees.find(e => e.id === id);
    const targetName = targetEmp ? targetEmp.name : id;
    
    if (partial.status) {
      logActivity('STATUS_CHANGED', 'employee', id, targetName, `updated status of ${targetName} to ${partial.status}`);
      logAudit('STATUS_CHANGED', 'EMPLOYEE', id, `Changed status of ${targetName} to ${partial.status}`);
      addToast({
        type: 'info',
        title: 'Status Updated',
        message: `${targetName} is now marked as ${partial.status}`
      });
    } else if (partial.role) {
      logActivity('ROLE_CHANGED', 'employee', id, targetName, `changed role of ${targetName} to ${partial.role}`);
      logAudit('ROLE_CHANGED', 'EMPLOYEE', id, `Changed role of ${targetName} to ${partial.role}`);
      addToast({
        type: 'success',
        title: 'Role Updated',
        message: `${targetName} is now assigned as ${partial.role}`
      });
    } else {
      logActivity('PROFILE_UPDATED', 'employee', id, targetName, `updated record for ${targetName}`);
      logAudit('RECORD_MODIFIED', 'EMPLOYEE', id, `Updated employee profile attributes for ${targetName}`);
      addToast({
        type: 'success',
        title: 'Employee Updated',
        message: `Profile data saved for ${targetName}`
      });
    }
  };

  const createInvitation = (inviteData: Omit<Invitation, 'id' | 'status' | 'invitedBy' | 'invitedAt' | 'expiresAt' | 'token'>) => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const id = `inv-${Date.now()}`;
    const token = `tok_scl_${Math.random().toString(36).substring(2, 12)}`;

    const newInvite: Invitation = {
      ...inviteData,
      id,
      status: 'pending',
      invitedBy: currentUser.name,
      invitedAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      expiresAt: `${expiry.getFullYear()}-${String(expiry.getMonth() + 1).padStart(2, '0')}-${String(expiry.getDate()).padStart(2, '0')} ${String(expiry.getHours()).padStart(2, '0')}:${String(expiry.getMinutes()).padStart(2, '0')}`,
      token
    };

    setInvitations(prev => [newInvite, ...prev]);

    const newEmp: Employee = {
      id: `emp-inv-${Date.now()}`,
      name: inviteData.fullName,
      email: inviteData.email,
      phone: '+91 90000 00000',
      designation: inviteData.designation,
      department: inviteData.department,
      role: inviteData.role,
      status: 'invited',
      joinedDate: now.toISOString().split('T')[0],
      lastActive: 'Never',
      timezone: 'Asia/Kolkata (IST)',
      skills: [],
      notesCount: 0,
      documentsCount: 0
    };
    setEmployees(prev => [...prev, newEmp]);

    logActivity('INVITATION_SENT', 'invitation', id, inviteData.fullName, `sent onboarding invitation to ${inviteData.fullName} (${inviteData.email})`);
    logAudit('INVITATION_CREATED', 'INVITATION', id, `Sent invite to ${inviteData.email} with role ${inviteData.role}`);
    
    addToast({
      type: 'success',
      title: 'Invitation Dispatched',
      message: `Onboarding invite generated for ${inviteData.fullName}`
    });

    return newInvite;
  };

  const resendInvitation = (id: string) => {
    const invite = invitations.find(i => i.id === id);
    if (!invite) return;

    const now = new Date();
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    setInvitations(prev => prev.map(inv => inv.id === id ? {
      ...inv,
      status: 'pending',
      invitedAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      expiresAt: `${expiry.getFullYear()}-${String(expiry.getMonth() + 1).padStart(2, '0')}-${String(expiry.getDate()).padStart(2, '0')} ${String(expiry.getHours()).padStart(2, '0')}:${String(expiry.getMinutes()).padStart(2, '0')}`
    } : inv));

    logActivity('INVITATION_RESENT', 'invitation', id, invite.fullName, `resent onboarding invitation to ${invite.fullName}`);
    logAudit('INVITATION_RESENT', 'INVITATION', id, `Resent invitation email to ${invite.email}`);

    addToast({
      type: 'info',
      title: 'Invitation Resent',
      message: `Fresh verification token dispatched to ${invite.email}`
    });
  };

  const revokeInvitation = (id: string) => {
    const invite = invitations.find(i => i.id === id);
    if (!invite) return;

    setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'revoked' } : inv));
    
    logActivity('INVITATION_REVOKED', 'invitation', id, invite.fullName, `revoked onboarding invitation for ${invite.fullName}`);
    logAudit('INVITATION_REVOKED', 'INVITATION', id, `Revoked invite token for ${invite.email}`, 'WARNING');

    addToast({
      type: 'warning',
      title: 'Invitation Revoked',
      message: `The access token for ${invite.fullName} is now invalidated`
    });
  };

  const updateRolePermissions = (role: Role, module: PermissionModule, action: PermissionAction, value: boolean) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role][module],
          [action]: value
        }
      }
    }));
  };

  const resetRolePermissions = () => {
    setRolePermissions(INITIAL_ROLE_PERMISSIONS);
    logActivity('PERMISSION_CHANGED', 'permission', 'perm-matrix', 'Permissions Matrix', 'reset all role permissions to factory defaults');
    logAudit('PERMISSIONS_RESET', 'SECURITY_RBAC', 'matrix', 'Reset complete role permission matrix to default baseline');
    addToast({
      type: 'info',
      title: 'Permissions Reset',
      message: 'Role permissions restored to default corporate configuration'
    });
  };

  const updateOrganization = (partial: Partial<OrganizationSettings>) => {
    setOrganization(prev => ({ ...prev, ...partial }));
    logActivity('ORGANIZATION_UPDATED', 'organization', 'org-1', organization.name, `updated organization corporate profile and settings`);
    logAudit('ORGANIZATION_MODIFIED', 'SETTINGS', 'org-1', `Updated organization profile attributes`);
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Organization configuration updated successfully'
    });
  };

  const updateCurrentUser = (partial: Partial<Employee>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...partial };
      setEmployees(empList => empList.map(e => e.id === prev.id ? { ...e, ...partial } : e));
      return updated;
    });
    logActivity('PROFILE_UPDATED', 'employee', currentUser.id, currentUser.name, `updated personal profile and preferences`);
    logAudit('PROFILE_UPDATED', 'USER', currentUser.id, `User updated profile preferences`);
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your personal preferences have been saved'
    });
  };

  const switchUserRole = (role: Role) => {
    setCurrentUser(prev => {
      const updated = { ...prev, role };
      setEmployees(empList => empList.map(e => e.id === prev.id ? updated : e));
      return updated;
    });
    addToast({
      type: 'info',
      title: 'Role Switched',
      message: `Active session now previewing as: ${role.toUpperCase().replace('_', ' ')}`
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addToast({
      type: 'info',
      title: 'Notifications Cleared',
      message: 'All notifications marked as read'
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    addToast({
      type: 'info',
      title: 'Notifications Removed',
      message: 'Notification tray emptied'
    });
  };

  const addEmployeeNote = (employeeId: string, content: string) => {
    const newNote: EmployeeNote = {
      id: `note-${Date.now()}`,
      employeeId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      content,
      createdAt: 'Just now'
    };
    setNotes(prev => [newNote, ...prev]);
    setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, notesCount: (e.notesCount || 0) + 1 } : e));
    logActivity('NOTE_ADDED', 'employee', employeeId, 'Internal Note', `added internal operational note to employee profile`);
    addToast({
      type: 'success',
      title: 'Note Recorded',
      message: 'Internal management note saved to record'
    });
  };

  const terminateOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    logAudit('SESSIONS_TERMINATED', 'SECURITY', currentUser.id, 'Terminated all remote user sessions');
    addToast({
      type: 'warning',
      title: 'Sessions Terminated',
      message: 'All other active devices have been signed out'
    });
  };

  const exportTeamCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Department', 'Designation', 'Role', 'Status', 'Joined Date', 'Last Active'];
    const rows = employees.map(e => [
      e.id,
      `"${e.name}"`,
      e.email,
      e.department,
      `"${e.designation}"`,
      e.role,
      e.status,
      e.joinedDate,
      `"${e.lastActive}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StarChainLabs_Employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logAudit('DATA_EXPORT', 'TEAM_DIRECTORY', 'all', `Exported ${employees.length} employee records to CSV`);
    addToast({
      type: 'success',
      title: 'Directory Exported',
      message: `Generated CSV file with ${employees.length} records`
    });
  };

  // ==========================================
  // PHASE 2: CRM & SALES METHODS
  // ==========================================

  const addLead = (leadData: Omit<Lead, 'id' | 'createdDate' | 'lastActivity'>) => {
    const now = new Date();
    const createdDate = now.toISOString().split('T')[0];
    const newId = `lead-${Date.now()}`;

    const newLead: Lead = {
      ...leadData,
      id: newId,
      createdDate,
      lastActivity: 'Just now'
    };

    setLeads(prev => [newLead, ...prev]);

    // Create activity event
    logActivity(
      'SYSTEM_ALERT',
      'system',
      newId,
      leadData.name,
      `created lead for ${leadData.name} (${leadData.companyName}) with value ₹${leadData.value.toLocaleString('en-IN')}`
    );

    // Audit log
    logAudit('LEAD_CREATED', 'LEAD', newId, `Lead created for ${leadData.name} assigned to ${leadData.ownerName}`);

    // Notify assigned employee if different or self
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Lead Assigned',
      message: `Lead ${leadData.name} (${leadData.companyName}) assigned to you. Value: ₹${leadData.value.toLocaleString('en-IN')}`,
      category: 'unread',
      isRead: false,
      createdAt: 'Just now',
      link: `/app/crm/leads/${newId}`,
      actionType: 'lead'
    };
    setNotifications(prev => [notif, ...prev]);

    // If next follow up is provided, create a follow up item
    if (leadData.nextFollowUpDate) {
      const fup: FollowUp = {
        id: `fup-${Date.now()}`,
        title: `Follow up with ${leadData.name}`,
        clientName: leadData.name,
        companyName: leadData.companyName,
        relatedType: 'lead',
        relatedId: newId,
        assignedToId: leadData.ownerId,
        assignedToName: leadData.ownerName,
        dueDate: leadData.nextFollowUpDate,
        dueTime: leadData.nextFollowUpTime || '10:00 AM',
        purpose: 'Initial qualification & requirement review',
        status: leadData.nextFollowUpDate === createdDate ? 'today' : 'upcoming',
        reminderEnabled: true
      };
      setFollowUps(prev => [fup, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'Lead Added',
      message: `${leadData.name} from ${leadData.companyName} registered into pipeline.`
    });

    return newLead;
  };

  const updateLead = (id: string, partial: Partial<Lead>) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        const updated = { ...l, ...partial, lastActivity: 'Just now' };
        return updated;
      }
      return l;
    }));

    const targetLead = leads.find(l => l.id === id);
    const targetName = targetLead ? targetLead.name : id;

    if (partial.stage) {
      logActivity(
        'STATUS_CHANGED',
        'system',
        id,
        targetName,
        `moved lead ${targetName} to stage ${partial.stage.toUpperCase()}`
      );
      logAudit('LEAD_STAGE_CHANGED', 'LEAD', id, `Changed lead stage to ${partial.stage}`);
      addToast({
        type: 'info',
        title: 'Stage Updated',
        message: `Lead moved to ${partial.stage.toUpperCase()}`
      });
    } else {
      logAudit('LEAD_UPDATED', 'LEAD', id, `Updated attributes for lead ${targetName}`);
      addToast({
        type: 'success',
        title: 'Lead Saved',
        message: `Changes saved for ${targetName}`
      });
    }
  };

  const deleteLead = (id: string) => {
    const target = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    logAudit('LEAD_DELETED', 'LEAD', id, `Deleted lead ${target?.name || id}`, 'WARNING');
    addToast({
      type: 'warning',
      title: 'Lead Removed',
      message: `Lead ${target?.name || id} removed from CRM.`
    });
  };

  const convertLeadToClient = (leadId: string, options: {
    createCompany: boolean;
    companyName?: string;
    contactName?: string;
    createDeal: boolean;
    dealName?: string;
    dealValue?: number;
  }) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return {};

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // 1. Create or link Company
    let targetCompanyId = lead.companyId;
    if (options.createCompany && !targetCompanyId) {
      const compId = `comp-${Date.now()}`;
      const newCompany: Company = {
        id: compId,
        name: options.companyName || lead.companyName,
        industry: 'Enterprise Technology',
        website: `https://${(options.companyName || lead.companyName).toLowerCase().replace(/\s+/g, '')}.example.com`,
        primaryContactId: '',
        primaryContactName: lead.name,
        ownerId: lead.ownerId,
        ownerName: lead.ownerName,
        activeDealsCount: options.createDeal ? 1 : 0,
        totalRevenue: options.dealValue || lead.value,
        currency: 'INR (₹)',
        lastActivity: 'Just now',
        location: 'India',
        employeeRange: '50-250',
        phone: lead.phone,
        email: lead.email,
        notes: `Converted from lead ${lead.id}. ${lead.notes || ''}`
      };
      setCompanies(prev => [newCompany, ...prev]);
      targetCompanyId = compId;
    }

    // 2. Create Contact
    const contactId = `cont-${Date.now()}`;
    const newContact: Contact = {
      id: contactId,
      name: options.contactName || lead.name,
      companyId: targetCompanyId || 'comp-misc',
      companyName: options.companyName || lead.companyName,
      role: 'Decision Maker',
      email: lead.email,
      phone: lead.phone,
      ownerId: lead.ownerId,
      ownerName: lead.ownerName,
      status: 'customer',
      createdDate: today,
      lastActivity: 'Just now',
      notes: `Converted from lead ${lead.id}`
    };
    setContacts(prev => [newContact, ...prev]);

    // 3. Create Deal if requested
    let dealId: string | undefined;
    if (options.createDeal) {
      dealId = `deal-${Date.now()}`;
      const newDeal: Deal = {
        id: dealId,
        name: options.dealName || `${lead.companyName} — Implementation`,
        companyId: targetCompanyId || 'comp-misc',
        companyName: options.companyName || lead.companyName,
        primaryContactId: contactId,
        primaryContactName: newContact.name,
        ownerId: lead.ownerId,
        ownerName: lead.ownerName,
        value: options.dealValue || lead.value,
        currency: 'INR (₹)',
        stage: 'won',
        probability: 100,
        expectedCloseDate: today,
        source: lead.source,
        createdDate: today,
        lastActivity: 'Just now',
        notes: lead.notes
      };
      setDeals(prev => [newDeal, ...prev]);
    }

    // 4. Update Lead to Won & mark companyId
    updateLead(leadId, { stage: 'won', companyId: targetCompanyId });

    // 5. Activity & Audit
    logActivity(
      'SYSTEM_ALERT',
      'system',
      leadId,
      lead.name,
      `converted lead ${lead.name} (${lead.companyName}) into client account and won deal (₹${(options.dealValue || lead.value).toLocaleString('en-IN')})`
    );
    logAudit('LEAD_CONVERTED', 'LEAD', leadId, `Converted lead to client account and created deal ${dealId || 'none'}`);

    addToast({
      type: 'success',
      title: 'Lead Converted!',
      message: `${lead.companyName} is now an active client with full historical retention.`
    });

    return { companyId: targetCompanyId, contactId, dealId };
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'createdDate' | 'lastActivity'>) => {
    const id = `cont-${Date.now()}`;
    const newContact: Contact = {
      ...contactData,
      id,
      createdDate: new Date().toISOString().split('T')[0],
      lastActivity: 'Just now'
    };
    setContacts(prev => [newContact, ...prev]);
    logAudit('CONTACT_CREATED', 'CONTACT', id, `Created contact ${contactData.name} for ${contactData.companyName}`);
    addToast({
      type: 'success',
      title: 'Contact Saved',
      message: `${contactData.name} added to contact directory.`
    });
    return newContact;
  };

  const updateContact = (id: string, partial: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...partial, lastActivity: 'Just now' } : c));
    addToast({
      type: 'success',
      title: 'Contact Updated',
      message: 'Contact record saved.'
    });
  };

  const addCompany = (companyData: Omit<Company, 'id' | 'activeDealsCount' | 'totalRevenue' | 'lastActivity'>) => {
    const id = `comp-${Date.now()}`;
    const newComp: Company = {
      ...companyData,
      id,
      activeDealsCount: 0,
      totalRevenue: 0,
      lastActivity: 'Just now'
    };
    setCompanies(prev => [newComp, ...prev]);
    logAudit('COMPANY_CREATED', 'COMPANY', id, `Registered corporate entity ${companyData.name}`);
    addToast({
      type: 'success',
      title: 'Company Created',
      message: `${companyData.name} registered into corporate registry.`
    });
    return newComp;
  };

  const updateCompany = (id: string, partial: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...partial, lastActivity: 'Just now' } : c));
    addToast({
      type: 'success',
      title: 'Company Saved',
      message: 'Company profile attributes updated.'
    });
  };

  const addDeal = (dealData: Omit<Deal, 'id' | 'createdDate' | 'lastActivity'>) => {
    const id = `deal-${Date.now()}`;
    const newDeal: Deal = {
      ...dealData,
      id,
      createdDate: new Date().toISOString().split('T')[0],
      lastActivity: 'Just now'
    };
    setDeals(prev => [newDeal, ...prev]);
    logActivity(
      'SYSTEM_ALERT',
      'system',
      id,
      dealData.name,
      `created deal "${dealData.name}" for ${dealData.companyName} (₹${dealData.value.toLocaleString('en-IN')})`
    );
    logAudit('DEAL_CREATED', 'DEAL', id, `Created deal ${dealData.name} with value ₹${dealData.value}`);
    addToast({
      type: 'success',
      title: 'Deal Created',
      message: `Deal added to pipeline at stage ${dealData.stage.toUpperCase()}`
    });
    return newDeal;
  };

  const updateDeal = (id: string, partial: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...partial, lastActivity: 'Just now' } : d));
    addToast({
      type: 'success',
      title: 'Deal Updated',
      message: 'Deal details saved.'
    });
  };

  const updateDealStage = (id: string, stage: DealStage, lostReason?: string) => {
    const targetDeal = deals.find(d => d.id === id);
    if (!targetDeal) return;

    const probMap: Record<DealStage, number> = {
      new: 20,
      qualified: 40,
      proposal: 60,
      negotiation: 80,
      won: 100,
      lost: 0
    };

    setDeals(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          stage,
          probability: probMap[stage],
          lostReason: lostReason || d.lostReason,
          lastActivity: 'Just now'
        };
      }
      return d;
    }));

    if (stage === 'won') {
      logActivity('SYSTEM_ALERT', 'system', id, targetDeal.name, `won deal "${targetDeal.name}" (₹${targetDeal.value.toLocaleString('en-IN')})!`);
      logAudit('DEAL_WON', 'DEAL', id, `Deal ${targetDeal.name} won by ${targetDeal.ownerName}`);
      addToast({
        type: 'success',
        title: 'Deal Won! 🎉',
        message: `₹${targetDeal.value.toLocaleString('en-IN')} successfully closed for ${targetDeal.companyName}!`
      });
    } else if (stage === 'lost') {
      logActivity('SYSTEM_ALERT', 'system', id, targetDeal.name, `marked deal "${targetDeal.name}" as lost (${lostReason || 'No reason provided'})`);
      logAudit('DEAL_LOST', 'DEAL', id, `Deal marked lost: ${lostReason || 'N/A'}`);
      addToast({
        type: 'warning',
        title: 'Deal Lost',
        message: `Deal moved to Lost stage.`
      });
    } else {
      logActivity('STATUS_CHANGED', 'system', id, targetDeal.name, `moved deal "${targetDeal.name}" to ${stage.toUpperCase()}`);
      logAudit('DEAL_STAGE_CHANGED', 'DEAL', id, `Deal stage changed to ${stage}`);
      addToast({
        type: 'info',
        title: 'Stage Updated',
        message: `Deal moved to ${stage.toUpperCase()}`
      });
    }
  };

  const scheduleMeeting = (meetingData: Omit<Meeting, 'id' | 'status'>) => {
    const id = `meet-${Date.now()}`;
    const newMeeting: Meeting = {
      ...meetingData,
      id,
      status: 'scheduled'
    };
    setMeetings(prev => [newMeeting, ...prev]);

    logActivity(
      'SYSTEM_ALERT',
      'system',
      id,
      meetingData.title,
      `scheduled meeting "${meetingData.title}" with ${meetingData.clientName} (${meetingData.companyName}) on ${meetingData.date} at ${meetingData.time}`
    );
    logAudit('MEETING_SCHEDULED', 'MEETING', id, `Meeting scheduled with ${meetingData.clientName}`);

    addToast({
      type: 'success',
      title: 'Meeting Scheduled',
      message: `${meetingData.title} scheduled for ${meetingData.date} at ${meetingData.time}`
    });

    return newMeeting;
  };

  const recordMeetingOutcome = (id: string, data: { outcome: string; clientResponse?: string; nextAction?: string; nextFollowUp?: string; notes?: string }) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: 'completed',
          outcome: data.outcome,
          clientResponse: data.clientResponse,
          nextAction: data.nextAction,
          nextFollowUp: data.nextFollowUp,
          notes: data.notes
        };
      }
      return m;
    }));

    const meet = meetings.find(m => m.id === id);
    const client = meet ? meet.clientName : 'Client';

    logActivity(
      'SYSTEM_ALERT',
      'system',
      id,
      meet?.title || 'Meeting',
      `completed meeting with ${client}: "${data.outcome}"`
    );
    logAudit('MEETING_COMPLETED', 'MEETING', id, `Outcome logged: ${data.outcome}`);

    // If next follow-up is set, create a follow up item automatically
    if (data.nextFollowUp && meet) {
      const fup: FollowUp = {
        id: `fup-${Date.now()}`,
        title: data.nextAction || `Follow-up after meeting with ${client}`,
        clientName: client,
        companyName: meet.companyName,
        relatedType: 'deal',
        relatedId: meet.dealId || meet.leadId || id,
        assignedToId: meet.salesEmployeeId,
        assignedToName: meet.salesEmployeeName,
        dueDate: data.nextFollowUp.split(' ')[0],
        dueTime: data.nextFollowUp.split(' ')[1] || '10:00 AM',
        purpose: data.nextAction || 'Post-meeting action item',
        status: 'upcoming',
        reminderEnabled: true,
        notes: data.notes
      };
      setFollowUps(prev => [fup, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'Outcome Recorded',
      message: 'Meeting notes, outcome and next actions updated.'
    });
  };

  const addFollowUp = (followUpData: Omit<FollowUp, 'id' | 'status'>) => {
    const id = `fup-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const status: FollowUp['status'] = 
      followUpData.dueDate < today ? 'overdue' : followUpData.dueDate === today ? 'today' : 'upcoming';

    const newFup: FollowUp = {
      ...followUpData,
      id,
      status
    };
    setFollowUps(prev => [newFup, ...prev]);
    logAudit('FOLLOWUP_CREATED', 'FOLLOWUP', id, `Created follow-up for ${followUpData.clientName}`);
    addToast({
      type: 'success',
      title: 'Follow-up Set',
      message: `Scheduled for ${followUpData.dueDate} at ${followUpData.dueTime}`
    });
    return newFup;
  };

  const completeFollowUp = (id: string) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status: 'completed', completedAt: 'Just now' } : f));
    const target = followUps.find(f => f.id === id);
    logAudit('FOLLOWUP_COMPLETED', 'FOLLOWUP', id, `Completed follow-up for ${target?.clientName || id}`);
    addToast({
      type: 'info',
      title: 'Follow-up Completed',
      message: 'Action marked complete.'
    });
  };

  const sendChatMessage = (conversationId: string, content: string, isInternalNote = false) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    const msgId = `msg-${Date.now()}`;

    const newMsg: ChatMessage = {
      id: msgId,
      senderType: isInternalNote ? 'internal_note' : 'agent',
      senderName: currentUser.name,
      content,
      timestamp: timeStr
    };

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastActivity: 'Just now',
          lastMessageSnippet: isInternalNote ? `[Internal Note]: ${content}` : content,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    if (isInternalNote) {
      logAudit('INTERNAL_NOTE_SENT', 'COMMUNICATION', conversationId, `Posted internal note in thread`);
    } else {
      logAudit('MESSAGE_SENT', 'COMMUNICATION', conversationId, `Sent message to client`);
    }
  };

  // ==========================================
  // PHASE 3 — DELIVERY OPERATIONS CALCULATORS & ACTIONS
  // ==========================================

  const calculateProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const projectMilestones = milestones.filter(m => m.projectId === projectId);

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress').length;
    const blockedTasks = projectTasks.filter(t => t.status === 'blocked').length;
    const openTasks = projectTasks.filter(t => t.status !== 'done').length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasks = projectTasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < todayStr).length;

    const overall = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const moduleBreakdown = projectMilestones.map(m => {
      const mTasks = projectTasks.filter(t => t.milestoneId === m.id);
      const mDone = mTasks.filter(t => t.status === 'done').length;
      const progress = mTasks.length > 0 ? Math.round((mDone / mTasks.length) * 100) : m.progress;
      return {
        name: m.moduleName || m.name,
        progress,
        taskCount: mTasks.length
      };
    });

    return {
      overall,
      moduleBreakdown,
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      overdueTasks,
      openTasks
    };
  };

  const evaluateProjectHealth = (projectId: string): ProjectHealth => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const projectTickets = tickets.filter(tk => tk.projectId === projectId);
    const todayStr = new Date().toISOString().split('T')[0];

    const blockedCount = projectTasks.filter(t => t.status === 'blocked').length;
    const overdueCount = projectTasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < todayStr).length;
    const criticalTickets = projectTickets.filter(tk => tk.priority === 'critical' && tk.status !== 'resolved' && tk.status !== 'closed').length;

    if (overdueCount >= 2 || projectTasks.some(t => t.status === 'blocked' && t.priority === 'critical')) {
      return 'delayed';
    }
    if (blockedCount > 0 || criticalTickets > 0 || overdueCount > 0) {
      return 'at_risk';
    }
    return 'on_track';
  };

  const createProject = (data: Omit<Project, 'id' | 'progress' | 'lastUpdated'>): Project => {
    const id = `proj-${Date.now()}`;
    const newProject: Project = {
      ...data,
      id,
      progress: 0,
      lastUpdated: 'Just now'
    };

    setProjects(prev => [newProject, ...prev]);
    logActivity('PROJECT_CREATED', 'project', id, newProject.name, `Created delivery project ${newProject.name} for ${newProject.clientName}`);
    logAudit('PROJECT_CREATED', 'PROJECT', id, `Initiated delivery project for ${newProject.clientName}`);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Delivery Project Assigned',
      message: `Project ${newProject.name} has been initiated with Manager ${newProject.managerName}.`,
      category: 'system',
      isRead: false,
      createdAt: 'Just now',
      link: `/app/projects/${id}`
    };
    setNotifications(prev => [newNotif, ...prev]);

    addToast({
      type: 'success',
      title: 'Project Created',
      message: `${newProject.name} is now in active delivery.`
    });

    return newProject;
  };

  const updateProject = (id: string, partial: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...partial, lastUpdated: 'Just now' };
        if (partial.status && partial.status !== p.status) {
          logActivity('PROJECT_STATUS_CHANGED', 'project', id, p.name, `Project status shifted to ${partial.status}`);
          logAudit('PROJECT_STATUS_CHANGED', 'PROJECT', id, `Status updated to ${partial.status}`);
        }
        return updated;
      }
      return p;
    }));
    addToast({
      type: 'info',
      title: 'Project Updated',
      message: 'Project changes have been saved.'
    });
  };

  const deleteProject = (id: string) => {
    const target = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    logAudit('PROJECT_DELETED', 'PROJECT', id, `Removed project ${target?.name || id}`);
    addToast({
      type: 'warning',
      title: 'Project Removed',
      message: `${target?.name || 'Project'} has been archived.`
    });
  };

  const createMilestone = (data: Omit<Milestone, 'id' | 'progress'>): Milestone => {
    const id = `mls-${Date.now()}`;
    const newMilestone: Milestone = {
      ...data,
      id,
      progress: 0
    };

    setMilestones(prev => [...prev, newMilestone]);
    logActivity('MILESTONE_CREATED', 'milestone', id, newMilestone.name, `Added milestone ${newMilestone.name} to ${newMilestone.projectName || 'project'}`);
    addToast({
      type: 'success',
      title: 'Milestone Created',
      message: `${newMilestone.name} defined successfully.`
    });
    return newMilestone;
  };

  const updateMilestone = (id: string, partial: Partial<Milestone>) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...partial };
        if (partial.status === 'completed' && m.status !== 'completed') {
          logActivity('MILESTONE_COMPLETED', 'milestone', id, m.name, `Milestone ${m.name} reached 100% completion.`);
        }
        return updated;
      }
      return m;
    }));
  };

  const createTask = (data: Omit<Task, 'id' | 'createdAt' | 'lastUpdated' | 'commentsCount' | 'attachmentsCount' | 'progress'> & { progress?: number }): Task => {
    const id = `task-${Date.now()}`;
    const newTask: Task = {
      ...data,
      id,
      progress: data.progress ?? (data.status === 'done' ? 100 : 0),
      createdAt: 'Just now',
      lastUpdated: 'Just now',
      commentsCount: 0,
      attachmentsCount: 0,
      comments: [],
      attachments: []
    };

    setTasks(prev => [newTask, ...prev]);
    logActivity('TASK_CREATED', 'task', id, newTask.title, `Created task ${newTask.title} under ${newTask.projectName}`);
    logAudit('TASK_CREATED', 'TASK', id, `Created task for ${newTask.assigneeName}`);

    if (newTask.assigneeId !== currentUser.id) {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'New Task Assigned to You',
        message: `You were assigned task "${newTask.title}" in ${newTask.projectName}.`,
        category: 'mentions',
        isRead: false,
        createdAt: 'Just now',
        link: '/app/tasks'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'Task Created',
      message: `"${newTask.title}" assigned to ${newTask.assigneeName}.`
    });

    return newTask;
  };

  const updateTask = (id: string, partial: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, ...partial, lastUpdated: 'Just now' };
      }
      return t;
    }));
  };

  const updateTaskStatus = (id: string, status: TaskStatus, blockedReason?: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const oldStatus = t.status;
        const updated: Task = {
          ...t,
          status,
          blockedReason: status === 'blocked' ? (blockedReason || t.blockedReason || 'Blocked by operational dependency') : undefined,
          blockedAt: status === 'blocked' ? (t.blockedAt || new Date().toISOString().split('T')[0]) : undefined,
          progress: status === 'done' ? 100 : status === 'in_progress' ? Math.max(t.progress, 25) : t.progress,
          lastUpdated: 'Just now'
        };

        if (status === 'blocked' && oldStatus !== 'blocked') {
          logActivity('TASK_BLOCKED', 'task', id, t.title, `Task marked as BLOCKED: ${blockedReason || 'Dependency incomplete'}`);
          logAudit('TASK_BLOCKED', 'TASK', id, `Blocker recorded: ${blockedReason || 'Dependency incomplete'}`);
          
          const blockerNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title: `Task Blocked: ${t.title}`,
            message: `Blocker raised on ${t.projectName}: "${blockedReason || 'Dependency incomplete'}"`,
            category: 'system',
            isRead: false,
            createdAt: 'Just now',
            link: '/app/tasks'
          };
          setNotifications(prevNotifs => [blockerNotif, ...prevNotifs]);

          addToast({
            type: 'warning',
            title: 'Task Blocked',
            message: `Flagged blocker on "${t.title}".`
          });
        } else if (status === 'done' && oldStatus !== 'done') {
          logActivity('TASK_COMPLETED', 'task', id, t.title, `Completed task: ${t.title}`);
          logAudit('TASK_COMPLETED', 'TASK', id, `Completed delivery task`);
          addToast({
            type: 'success',
            title: 'Task Completed',
            message: `"${t.title}" marked as complete.`
          });
        } else if (status !== oldStatus) {
          logActivity('TASK_STATUS_CHANGED', 'task', id, t.title, `Task status shifted to ${status.toUpperCase().replace('_', ' ')}`);
        }

        return updated;
      }
      return t;
    }));
  };

  const addTaskComment = (taskId: string, content: string) => {
    const newComment: TaskComment = {
      id: `comm-${Date.now()}`,
      taskId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      content,
      createdAt: 'Just now'
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          commentsCount: (t.commentsCount || 0) + 1,
          comments: [...(t.comments || []), newComment],
          lastUpdated: 'Just now'
        };
      }
      return t;
    }));

    logActivity('NOTE_ADDED', 'task', taskId, `Comment on task`, `Added comment: "${content.slice(0, 50)}..."`);
  };

  const submitDailyUpdate = (updateData: Omit<DailyWorkUpdate, 'id' | 'createdAt'>): DailyWorkUpdate => {
    const id = `upd-${Date.now()}`;
    const newUpdate: DailyWorkUpdate = {
      ...updateData,
      id,
      createdAt: 'Just now'
    };

    setWorkUpdates(prev => [newUpdate, ...prev]);

    logActivity(
      'DAILY_UPDATE_SUBMITTED',
      'work_update',
      id,
      `Daily Update by ${newUpdate.employeeName}`,
      `Submitted EOD update for ${newUpdate.projectName} (${newUpdate.completedItems.length} completed, ${newUpdate.blockedItems.length} blocked)`
    );

    if (newUpdate.blockedItems && newUpdate.blockedItems.length > 0) {
      const blockerNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Blocker Reported in EOD Update`,
        message: `${newUpdate.employeeName} reported blocker on ${newUpdate.projectName}: "${newUpdate.blockedItems[0]}"`,
        category: 'system',
        isRead: false,
        createdAt: 'Just now',
        link: '/app/work-updates'
      };
      setNotifications(prev => [blockerNotif, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'Daily Update Recorded',
      message: 'Your work update has been added to the project timeline.'
    });

    return newUpdate;
  };

  const createTicket = (ticketData: Omit<InternalTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'attachments'> & { initialMessage?: string }): InternalTicket => {
    const id = `TICK-${Math.floor(200 + Math.random() * 800)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const initialMsg: TicketMessage | null = ticketData.initialMessage ? {
      id: `msg-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.designation || currentUser.role,
      content: ticketData.initialMessage,
      createdAt: 'Just now',
      isAdminQuery: ticketData.type === 'operational_query'
    } : null;

    const newTicket: InternalTicket = {
      ...ticketData,
      id,
      createdAt: nowStr,
      updatedAt: nowStr,
      messages: initialMsg ? [initialMsg] : [],
      attachments: []
    };

    setTickets(prev => [newTicket, ...prev]);

    logActivity('TICKET_CREATED', 'ticket', id, newTicket.title, `Raised internal ticket ${id} (${newTicket.priority.toUpperCase()} priority)`);
    logAudit('TICKET_CREATED', 'TICKET', id, `Raised ticket for ${newTicket.projectName}`);

    if (newTicket.assignedToId && newTicket.assignedToId !== currentUser.id) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Ticket Assigned: ${id}`,
        message: `You were assigned internal ticket ${id}: "${newTicket.title}"`,
        category: 'mentions',
        isRead: false,
        createdAt: 'Just now',
        link: '/app/tickets'
      };
      setNotifications(prev => [notif, ...prev]);
    }

    addToast({
      type: 'info',
      title: 'Internal Ticket Raised',
      message: `${id} assigned to ${newTicket.assignedToName}.`
    });

    return newTicket;
  };

  const updateTicketStatus = (id: string, status: InternalTicketStatus) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        const isResolved = status === 'resolved' || status === 'closed';
        const updated: InternalTicket = {
          ...t,
          status,
          updatedAt: 'Just now',
          resolvedAt: isResolved ? new Date().toISOString().replace('T', ' ').slice(0, 16) : t.resolvedAt
        };

        if (status === 'resolved') {
          logActivity('TICKET_RESOLVED', 'ticket', id, t.title, `Resolved ticket ${id}`);
          logAudit('TICKET_RESOLVED', 'TICKET', id, `Marked ticket as resolved`);
          addToast({
            type: 'success',
            title: 'Ticket Resolved',
            message: `${id} has been marked as resolved.`
          });
        } else {
          logActivity('TICKET_UPDATED', 'ticket', id, t.title, `Ticket status changed to ${status}`);
        }

        return updated;
      }
      return t;
    }));
  };

  const addTicketMessage = (ticketId: string, content: string, operationalResponse?: OperationalQueryResponse) => {
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.designation || currentUser.role,
      content,
      createdAt: 'Just now',
      queryResponseData: operationalResponse
    };

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: operationalResponse ? 'resolved' : t.status === 'open' ? 'in_progress' : t.status,
          updatedAt: 'Just now',
          resolvedAt: operationalResponse ? new Date().toISOString().replace('T', ' ').slice(0, 16) : t.resolvedAt,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));

    if (operationalResponse) {
      logActivity(
        'TICKET_UPDATED',
        'ticket',
        ticketId,
        `Operational status response on ${ticketId}`,
        `Status responded: Progress ${operationalResponse.currentProgressPercent}%, ETA ${operationalResponse.eta}`
      );
      addToast({
        type: 'success',
        title: 'Status Update Logged',
        message: 'Operational query response recorded in project history.'
      });
    } else {
      logAudit('TICKET_REPLIED', 'TICKET', ticketId, `Posted reply to ticket discussion`);
    }
  };

  const uploadProjectFile = (fileData: Omit<ProjectFile, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>): ProjectFile => {
    const id = `file-${Date.now()}`;
    const newFile: ProjectFile = {
      ...fileData,
      id,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.id,
      uploadedByName: currentUser.name,
      downloadUrl: '#'
    };

    setProjectFiles(prev => [newFile, ...prev]);
    logActivity('DOCUMENT_UPLOADED', 'project', newFile.projectId, newFile.name, `Uploaded file ${newFile.name} to repository`);
    addToast({
      type: 'success',
      title: 'File Uploaded',
      message: `${newFile.name} saved to project file vault.`
    });

    return newFile;
  };

  // ==========================================
  // Phase 4 — Attendance & Employee Operations
  // ==========================================

  const todayDateStr = '2026-09-27'; // Dynamically resolved organization date
  const currentUserAttendance = attendanceRecords.find(r => r.employeeId === currentUser.id && r.date === todayDateStr);

  const punchIn = (
    employeeId?: string, 
    projectId?: string, 
    taskId?: string,
    workMode: WorkMode = 'OFFICE',
    method: CheckInMethod = 'WEB',
    locationId?: string,
    coords?: { latitude: number; longitude: number }
  ): AttendanceRecord => {
    const targetId = employeeId || currentUser.id;
    // Section 6 Check: Don't allow employees to punch in for somebody else without admin permissions
    if (employeeId && employeeId !== currentUser.id && currentUser.role !== 'admin' && currentUser.role !== 'super_admin' && currentUser.role !== 'manager') {
      addToast({ type: 'error', title: 'Unauthorized Action', message: 'You cannot punch in on behalf of another employee.' });
      throw new Error('Unauthorized attendance punch');
    }

    const targetEmp = employees.find(e => e.id === targetId) || currentUser;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Resolve assigned shift & late arrival
    const assignedShift = shifts[0] || DEFAULT_SHIFTS[0];
    const lateMinutes = calculateLateArrival(timeStr, assignedShift);

    const existing = attendanceRecords.find(r => r.employeeId === targetId && r.date === todayDateStr);

    // Section 11: State Machine Transition Enforcement
    const transitionCheck = validateAttendanceTransition(existing?.sessionState || 'not_started', 'CHECK_IN');
    if (!transitionCheck.allowed && existing?.sessionState === 'working') {
      addToast({ type: 'warning', title: 'Already Working', message: 'You already have an active work session.' });
      return existing;
    }

    const targetProj = projects.find(p => p.id === projectId);
    const targetTask = tasks.find(t => t.id === taskId);

    // Section 3: Append Immutable Attendance Event
    const eventId = `ev-${Date.now()}`;
    const newEvent: AttendanceEvent = {
      id: eventId,
      employeeId: targetId,
      eventType: 'CHECK_IN',
      eventTime: now.toISOString(),
      serverTime: now.toISOString(),
      source: method,
      locationId: locationId || 'loc-hq',
      ipAddress: clientIp,
      workMode,
      metadata: {
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        projectId: targetProj?.id,
        projectName: targetProj?.name,
        taskId: targetTask?.id,
        taskTitle: targetTask?.title
      },
      createdAt: now.toISOString()
    };
    setAttendanceEvents(prev => [newEvent, ...prev]);
    syncEventToSupabase(newEvent);

    // Section 3: Calculated Session Record
    let record: AttendanceRecord;
    if (existing) {
      record = {
        ...existing,
        punchIn: existing.punchIn === '00:00' ? timeStr : existing.punchIn,
        sessionState: 'working',
        status: lateMinutes > 0 ? 'late' : 'working',
        workMode,
        checkInMethod: method,
        currentProjectId: targetProj?.id || existing.currentProjectId,
        currentProjectName: targetProj?.name || existing.currentProjectName,
        currentTaskId: targetTask?.id || existing.currentTaskId,
        currentTaskTitle: targetTask?.title || existing.currentTaskTitle,
        timeline: [
          ...existing.timeline,
          { id: eventId, time: timeStr, type: 'punch_in', title: `Checked In (${workMode} via ${method})` }
        ]
      };
      setAttendanceRecords(prev => prev.map(r => r.id === record.id ? record : r));
    } else {
      record = {
        id: `att-${todayDateStr}-${targetId}`,
        employeeId: targetId,
        employeeName: targetEmp.name,
        employeeRole: targetEmp.designation || targetEmp.role,
        department: targetEmp.department,
        date: todayDateStr,
        punchIn: timeStr,
        punchOut: null,
        breaks: [],
        totalWorkingMinutes: 0,
        breakMinutes: 0,
        expectedStart: assignedShift.startTime,
        expectedWorkMinutes: assignedShift.workMinutes,
        lateMinutes,
        overtimeMinutes: 0,
        status: lateMinutes > 0 ? 'late' : 'working',
        sessionState: 'working',
        workMode,
        checkInMethod: method,
        currentProjectId: targetProj?.id,
        currentProjectName: targetProj?.name,
        currentTaskId: targetTask?.id,
        currentTaskTitle: targetTask?.title,
        timeline: [
          { id: eventId, time: timeStr, type: 'punch_in', title: `Checked In at ${timeStr}${lateMinutes > 0 ? ` (Late by ${lateMinutes}m)` : ''} [${workMode}]` }
        ]
      };
      setAttendanceRecords(prev => [record, ...prev]);
    }

    syncSessionToSupabase(record);

    logActivity('PUNCH_IN', 'attendance', record.id, targetEmp.name, `Checked in at ${timeStr} (${workMode} via ${method})`);
    logAudit('CHECK_IN', 'ATTENDANCE', record.id, `Employee checked in via ${method} (${workMode}). Server time: ${timeStr}`);

    if (lateMinutes > 0) {
      const lateNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Late Arrival Recorded',
        message: `${targetEmp.name} punched in at ${timeStr} (${lateMinutes} min after shift start + grace).`,
        category: 'system',
        isRead: false,
        createdAt: 'Just now',
        link: '/app/attendance'
      };
      setNotifications(prev => [lateNotif, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'Checked In Successfully',
      message: `Work session active since ${timeStr} (${workMode}).`
    });

    return record;
  };

  const punchOut = (employeeId?: string): AttendanceRecord => {
    const targetId = employeeId || currentUser.id;
    const targetEmp = employees.find(e => e.id === targetId) || currentUser;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const existing = attendanceRecords.find(r => r.employeeId === targetId && r.date === todayDateStr);
    if (!existing) {
      throw new Error('No active attendance record found for today');
    }

    // Section 11: State Machine Enforcement
    const transitionCheck = validateAttendanceTransition(existing.sessionState, 'CHECK_OUT');
    if (!transitionCheck.allowed) {
      addToast({ type: 'warning', title: 'Invalid Action', message: transitionCheck.error || 'Cannot check out.' });
      return existing;
    }

    const [inH, inM] = existing.punchIn.split(':').map(Number);
    const elapsedMinutes = Math.max(0, (now.getHours() * 60 + now.getMinutes()) - (inH * 60 + inM) - existing.breakMinutes);
    const overtimeMinutes = Math.max(0, elapsedMinutes - attendanceConfig.workdayDurationMinutes);

    // Section 3: Append Immutable CHECK_OUT Event
    const eventId = `ev-${Date.now()}`;
    const newEvent: AttendanceEvent = {
      id: eventId,
      employeeId: targetId,
      eventType: 'CHECK_OUT',
      eventTime: now.toISOString(),
      serverTime: now.toISOString(),
      source: existing.checkInMethod || 'WEB',
      ipAddress: clientIp,
      workMode: existing.workMode || 'OFFICE',
      createdAt: now.toISOString()
    };
    setAttendanceEvents(prev => [newEvent, ...prev]);
    syncEventToSupabase(newEvent);

    const updated: AttendanceRecord = {
      ...existing,
      punchOut: timeStr,
      sessionState: 'completed',
      status: existing.status === 'late' ? 'late' : 'present',
      totalWorkingMinutes: elapsedMinutes,
      overtimeMinutes,
      timeline: [
        ...existing.timeline,
        { 
          id: eventId, 
          time: timeStr, 
          type: 'punch_out', 
          title: `Punched Out at ${timeStr}`,
          description: `Logged ${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m working time.` 
        }
      ]
    };

    setAttendanceRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    syncSessionToSupabase(updated);

    logActivity('PUNCH_OUT', 'attendance', updated.id, targetEmp.name, `Checked out at ${timeStr} (Worked ${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m)`);
    logAudit('CHECK_OUT', 'ATTENDANCE', updated.id, `Employee checked out at ${timeStr}. Duration: ${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`);

    addToast({
      type: 'info',
      title: 'Punched Out',
      message: `Work session closed (${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m recorded).`
    });

    return updated;
  };

  const startBreak = (employeeId?: string, reason: string = 'Lunch Break'): AttendanceRecord => {
    const targetId = employeeId || currentUser.id;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const existing = attendanceRecords.find(r => r.employeeId === targetId && r.date === todayDateStr);
    if (!existing) {
      throw new Error('No active attendance record found');
    }

    const transitionCheck = validateAttendanceTransition(existing.sessionState, 'START_BREAK');
    if (!transitionCheck.allowed) {
      addToast({ type: 'warning', title: 'Invalid Break Action', message: transitionCheck.error || 'Cannot start break.' });
      return existing;
    }

    const eventId = `ev-${Date.now()}`;
    const newEvent: AttendanceEvent = {
      id: eventId,
      employeeId: targetId,
      eventType: 'BREAK_START',
      eventTime: now.toISOString(),
      serverTime: now.toISOString(),
      source: existing.checkInMethod || 'WEB',
      ipAddress: clientIp,
      workMode: existing.workMode || 'OFFICE',
      metadata: { breakReason: reason },
      createdAt: now.toISOString()
    };
    setAttendanceEvents(prev => [newEvent, ...prev]);
    syncEventToSupabase(newEvent);

    const newBreak = { id: `brk-${Date.now()}`, start: timeStr, reason };
    const updated: AttendanceRecord = {
      ...existing,
      sessionState: 'on_break',
      breaks: [...existing.breaks, newBreak],
      timeline: [
        ...existing.timeline,
        { id: eventId, time: timeStr, type: 'break_start', title: `${reason} Started` }
      ]
    };

    setAttendanceRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    syncSessionToSupabase(updated);

    logActivity('BREAK_STARTED', 'attendance', updated.id, existing.employeeName, `Started ${reason.toLowerCase()} at ${timeStr}`);
    addToast({ type: 'info', title: 'Break Started', message: `Timer running for ${reason}.` });
    return updated;
  };

  const endBreak = (employeeId?: string): AttendanceRecord => {
    const targetId = employeeId || currentUser.id;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const existing = attendanceRecords.find(r => r.employeeId === targetId && r.date === todayDateStr);
    if (!existing) {
      throw new Error('No active attendance record found');
    }

    const transitionCheck = validateAttendanceTransition(existing.sessionState, 'END_BREAK');
    if (!transitionCheck.allowed) {
      addToast({ type: 'warning', title: 'Invalid Break Action', message: transitionCheck.error || 'No active break to end.' });
      return existing;
    }

    let addedBreakMinutes = 0;
    const updatedBreaks = existing.breaks.map(b => {
      if (!b.end) {
        const [bH, bM] = b.start.split(':').map(Number);
        const dur = Math.max(0, (now.getHours() * 60 + now.getMinutes()) - (bH * 60 + bM));
        addedBreakMinutes += dur;
        return { ...b, end: timeStr, durationMinutes: dur };
      }
      return b;
    });

    const eventId = `ev-${Date.now()}`;
    const newEvent: AttendanceEvent = {
      id: eventId,
      employeeId: targetId,
      eventType: 'BREAK_END',
      eventTime: now.toISOString(),
      serverTime: now.toISOString(),
      source: existing.checkInMethod || 'WEB',
      ipAddress: clientIp,
      workMode: existing.workMode || 'OFFICE',
      createdAt: now.toISOString()
    };
    setAttendanceEvents(prev => [newEvent, ...prev]);
    syncEventToSupabase(newEvent);

    const updated: AttendanceRecord = {
      ...existing,
      sessionState: 'working',
      breaks: updatedBreaks,
      breakMinutes: existing.breakMinutes + addedBreakMinutes,
      timeline: [
        ...existing.timeline,
        { id: eventId, time: timeStr, type: 'break_end', title: `Break Ended (${addedBreakMinutes}m duration)` }
      ]
    };

    setAttendanceRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    syncSessionToSupabase(updated);

    logActivity('BREAK_ENDED', 'attendance', updated.id, existing.employeeName, `Resumed work at ${timeStr}`);
    addToast({ type: 'success', title: 'Resumed Work', message: 'Work session active.' });
    return updated;
  };

  const dismissException = (exceptionId: string) => {
    setAttendanceExceptions(prev => prev.map(e => e.id === exceptionId ? { ...e, status: 'DISMISSED' as const } : e));
    addToast({ type: 'info', title: 'Exception Dismissed', message: 'Acknowledged exception.' });
  };

  const reviewCorrection = (correctionId: string, action: 'APPROVE' | 'REJECT', notes?: string) => {
    const req = correctionRequests.find(c => c.id === correctionId);
    if (!req) return;

    const nowStr = new Date().toISOString();
    const updatedReq: AttendanceCorrectionRequest = {
      ...req,
      status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      reviewedBy: currentUser.id,
      reviewedByName: currentUser.name,
      reviewedAt: nowStr,
      reviewNotes: notes
    };
    setCorrectionRequests(prev => prev.map(c => c.id === correctionId ? updatedReq : c));

    if (action === 'APPROVE') {
      const targetRecord = attendanceRecords.find(r => r.employeeId === req.employeeId && r.date === req.workDate);
      if (targetRecord) {
        const newIn = req.requestedPunchIn || targetRecord.punchIn;
        const newOut = req.requestedPunchOut !== undefined ? req.requestedPunchOut : targetRecord.punchOut;

        let totalWorkingMinutes = targetRecord.totalWorkingMinutes;
        let overtimeMinutes = targetRecord.overtimeMinutes;
        if (newIn && newOut) {
          const [inH, inM] = newIn.split(':').map(Number);
          const [outH, outM] = newOut.split(':').map(Number);
          const elapsed = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM) - targetRecord.breakMinutes);
          totalWorkingMinutes = elapsed;
          overtimeMinutes = Math.max(0, elapsed - attendanceConfig.workdayDurationMinutes);
        }

        const updatedRecord: AttendanceRecord = {
          ...targetRecord,
          punchIn: newIn,
          punchOut: newOut,
          totalWorkingMinutes,
          overtimeMinutes,
          sessionState: newOut ? 'completed' : targetRecord.sessionState,
          status: 'present',
          correction: {
            isCorrected: true,
            originalPunchIn: targetRecord.punchIn,
            originalPunchOut: targetRecord.punchOut,
            originalStatus: targetRecord.status,
            correctedBy: currentUser.id,
            correctedByName: currentUser.name,
            correctedAt: nowStr,
            reason: req.reason
          }
        };

        setAttendanceRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
        syncSessionToSupabase(updatedRecord);
      }

      logAudit('CORRECTION_APPROVED', 'ATTENDANCE', req.id, `Admin ${currentUser.name} approved attendance correction for ${req.employeeName}. Reason: ${req.reason}`);
      addToast({ type: 'success', title: 'Correction Approved', message: `Attendance for ${req.employeeName} recalculated.` });
    } else {
      logAudit('CORRECTION_REJECTED', 'ATTENDANCE', req.id, `Admin ${currentUser.name} rejected attendance correction for ${req.employeeName}. Notes: ${notes || 'None'}`);
      addToast({ type: 'warning', title: 'Correction Rejected', message: `Request for ${req.employeeName} was marked rejected.` });
    }
  };

  const updateOperationalStatus = (
    employeeId: string, 
    status: OperationalStatus, 
    details?: { currentProjectId?: string; currentProjectName?: string; currentTaskId?: string; currentTaskTitle?: string }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setAttendanceRecords(prev => prev.map(r => {
      if (r.employeeId === employeeId && r.date === today) {
        return {
          ...r,
          currentProjectId: details?.currentProjectId !== undefined ? details.currentProjectId : r.currentProjectId,
          currentProjectName: details?.currentProjectName !== undefined ? details.currentProjectName : r.currentProjectName,
          currentTaskId: details?.currentTaskId !== undefined ? details.currentTaskId : r.currentTaskId,
          currentTaskTitle: details?.currentTaskTitle !== undefined ? details.currentTaskTitle : r.currentTaskTitle
        };
      }
      return r;
    }));
    logActivity('OPERATIONAL_STATUS_CHANGED', 'employee', employeeId, 'Status Updated', `Operational status shifted to ${status}`);
  };

  const correctAttendance = (
    recordId: string, 
    correctionData: { punchIn?: string; punchOut?: string | null; status?: AttendanceStatus; reason: string }
  ) => {
    const target = attendanceRecords.find(r => r.id === recordId);
    if (!target) return;

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const originalPunchIn = target.punchIn;
    const originalPunchOut = target.punchOut;
    const originalStatus = target.status;

    const newIn = correctionData.punchIn || target.punchIn;
    const newOut = correctionData.punchOut !== undefined ? correctionData.punchOut : target.punchOut;
    const newStatus = correctionData.status || target.status;

    let totalWorkingMinutes = target.totalWorkingMinutes;
    let overtimeMinutes = target.overtimeMinutes;
    if (newIn && newOut) {
      const [inH, inM] = newIn.split(':').map(Number);
      const [outH, outM] = newOut.split(':').map(Number);
      const elapsed = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM) - target.breakMinutes);
      totalWorkingMinutes = elapsed;
      overtimeMinutes = Math.max(0, elapsed - attendanceConfig.workdayDurationMinutes);
    }

    const updated: AttendanceRecord = {
      ...target,
      punchIn: newIn,
      punchOut: newOut,
      status: newStatus,
      totalWorkingMinutes,
      overtimeMinutes,
      correction: {
        isCorrected: true,
        originalPunchIn,
        originalPunchOut,
        originalStatus,
        correctedBy: currentUser.id,
        correctedByName: currentUser.name,
        correctedAt: nowStr,
        reason: correctionData.reason
      },
      timeline: [
        ...target.timeline,
        {
          id: `ev-${Date.now()}`,
          time: 'Correction',
          type: 'correction',
          title: `Attendance Record Corrected by ${currentUser.name}`,
          description: `In: ${newIn}, Out: ${newOut || 'None'}, Status: ${newStatus}. Reason: "${correctionData.reason}"`
        }
      ]
    };

    setAttendanceRecords(prev => prev.map(r => r.id === recordId ? updated : r));
    logActivity('ATTENDANCE_CORRECTED', 'attendance', recordId, target.employeeName, `Attendance corrected: "${correctionData.reason}"`);
    logAudit('ATTENDANCE_CORRECTED', 'ATTENDANCE', recordId, `Admin corrected punch times for ${target.employeeName}. Reason: ${correctionData.reason}`);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Attendance Record Corrected',
      message: `Your attendance record for ${target.date} was updated by Admin ${currentUser.name} (Reason: ${correctionData.reason}).`,
      category: 'system',
      isRead: false,
      createdAt: 'Just now',
      link: `/app/team/${target.employeeId}/attendance`
    };
    setNotifications(prev => [notif, ...prev]);

    addToast({
      type: 'success',
      title: 'Attendance Corrected',
      message: 'Audit log entry created and historical record preserved.'
    });
  };

  const submitLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>): LeaveRequest => {
    const id = `LV-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newReq: LeaveRequest = {
      ...data,
      id,
      status: 'pending',
      requestedAt: nowStr
    };

    setLeaveRequests(prev => [newReq, ...prev]);

    setLeaveBalances(prev => {
      const curBal = prev[data.employeeId] || {
        employeeId: data.employeeId,
        annual: { total: 18, used: 0, pending: 0, remaining: 18 },
        sick: { total: 10, used: 0, pending: 0, remaining: 10 },
        casual: { total: 7, used: 0, pending: 0, remaining: 7 },
        unpaid: { used: 0 }
      };
      const category = data.leaveType === 'annual' ? 'annual' : data.leaveType === 'sick' ? 'sick' : 'casual';
      if (category in curBal) {
        return {
          ...prev,
          [data.employeeId]: {
            ...curBal,
            [category]: {
              ...curBal[category as 'annual' | 'sick' | 'casual'],
              pending: curBal[category as 'annual' | 'sick' | 'casual'].pending + data.daysCount
            }
          }
        };
      }
      return prev;
    });

    logActivity('LEAVE_REQUESTED', 'leave', id, data.employeeName, `Applied for ${data.daysCount} days of ${data.leaveType} leave (${data.startDate} to ${data.endDate})`);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Leave Request: ${data.employeeName}`,
      message: `${data.employeeName} requested ${data.daysCount} days ${data.leaveType} leave. Reason: "${data.reason}"`,
      category: 'system',
      isRead: false,
      createdAt: 'Just now',
      link: '/app/leave'
    };
    setNotifications(prev => [notif, ...prev]);

    addToast({
      type: 'success',
      title: 'Leave Request Submitted',
      message: `Applied for ${data.daysCount} days. Waiting for manager review.`
    });

    return newReq;
  };

  const reviewLeaveRequest = (requestId: string, action: 'approve' | 'reject' | 'changes', reviewNote?: string): LeaveRequest => {
    const target = leaveRequests.find(r => r.id === requestId);
    if (!target) throw new Error('Leave request not found');

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updatedStatus: LeaveStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';

    const updated: LeaveRequest = {
      ...target,
      status: updatedStatus,
      reviewedBy: currentUser.id,
      reviewedByName: currentUser.name,
      reviewedAt: nowStr,
      reviewNote: reviewNote || (action === 'approve' ? 'Approved by manager' : 'Request reviewed')
    };

    setLeaveRequests(prev => prev.map(r => r.id === requestId ? updated : r));

    setLeaveBalances(prev => {
      const curBal = prev[target.employeeId];
      if (!curBal) return prev;
      const cat = target.leaveType === 'annual' ? 'annual' : target.leaveType === 'sick' ? 'sick' : 'casual';
      if (action === 'approve') {
        return {
          ...prev,
          [target.employeeId]: {
            ...curBal,
            [cat]: {
              ...curBal[cat as 'annual' | 'sick' | 'casual'],
              pending: Math.max(0, curBal[cat as 'annual' | 'sick' | 'casual'].pending - target.daysCount),
              used: curBal[cat as 'annual' | 'sick' | 'casual'].used + target.daysCount,
              remaining: Math.max(0, curBal[cat as 'annual' | 'sick' | 'casual'].remaining - target.daysCount)
            }
          }
        };
      } else if (action === 'reject') {
        return {
          ...prev,
          [target.employeeId]: {
            ...curBal,
            [cat]: {
              ...curBal[cat as 'annual' | 'sick' | 'casual'],
              pending: Math.max(0, curBal[cat as 'annual' | 'sick' | 'casual'].pending - target.daysCount)
            }
          }
        };
      }
      return prev;
    });

    if (action === 'approve') {
      logActivity('LEAVE_APPROVED', 'leave', requestId, target.employeeName, `Approved ${target.daysCount} days ${target.leaveType} leave`);
      
      const today = new Date().toISOString().split('T')[0];
      if (target.startDate <= today && today <= target.endDate) {
        setAttendanceRecords(prev => {
          const existToday = prev.find(r => r.employeeId === target.employeeId && r.date === today);
          if (existToday) {
            return prev.map(r => r.id === existToday.id ? { ...r, status: 'leave', sessionState: 'not_started' } : r);
          } else {
            const newLeaveRecord: AttendanceRecord = {
              id: `att-${today}-${target.employeeId}`,
              employeeId: target.employeeId,
              employeeName: target.employeeName,
              employeeRole: target.employeeRole,
              department: target.department,
              date: today,
              punchIn: '00:00',
              punchOut: '00:00',
              breaks: [],
              totalWorkingMinutes: 0,
              breakMinutes: 0,
              expectedStart: attendanceConfig.expectedStartTime,
              expectedWorkMinutes: attendanceConfig.workdayDurationMinutes,
              lateMinutes: 0,
              overtimeMinutes: 0,
              status: 'leave',
              sessionState: 'not_started',
              timeline: [{ id: `ev-${Date.now()}`, time: '09:00', type: 'break_start', title: `On Approved ${target.leaveType.toUpperCase()} Leave` }]
            };
            return [newLeaveRecord, ...prev];
          }
        });
      }

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Leave Request Approved',
        message: `Your ${target.leaveType} leave request for ${target.startDate} to ${target.endDate} was approved by ${currentUser.name}.`,
        category: 'system',
        isRead: false,
        createdAt: 'Just now',
        link: '/app/leave'
      };
      setNotifications(prev => [notif, ...prev]);

      addToast({
        type: 'success',
        title: 'Leave Approved',
        message: `${target.employeeName}'s leave has been granted.`
      });
    } else if (action === 'reject') {
      logActivity('LEAVE_REJECTED', 'leave', requestId, target.employeeName, `Rejected ${target.daysCount} days ${target.leaveType} leave: ${reviewNote || 'No reason specified'}`);
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Leave Request Rejected',
        message: `Your ${target.leaveType} leave request was declined by ${currentUser.name}. Note: "${reviewNote || 'Discuss with manager'}"`,
        category: 'system',
        isRead: false,
        createdAt: 'Just now',
        link: '/app/leave'
      };
      setNotifications(prev => [notif, ...prev]);

      addToast({
        type: 'warning',
        title: 'Leave Request Rejected',
        message: 'Applicant notified.'
      });
    }

    return updated;
  };

  const cancelLeaveRequest = (requestId: string): LeaveRequest => {
    const target = leaveRequests.find(r => r.id === requestId);
    if (!target) throw new Error('Leave request not found');

    const updated: LeaveRequest = {
      ...target,
      status: 'cancelled'
    };

    setLeaveRequests(prev => prev.map(r => r.id === requestId ? updated : r));

    if (target.status === 'pending') {
      setLeaveBalances(prev => {
        const curBal = prev[target.employeeId];
        if (!curBal) return prev;
        const cat = target.leaveType === 'annual' ? 'annual' : target.leaveType === 'sick' ? 'sick' : 'casual';
        return {
          ...prev,
          [target.employeeId]: {
            ...curBal,
            [cat]: {
              ...curBal[cat as 'annual' | 'sick' | 'casual'],
              pending: Math.max(0, curBal[cat as 'annual' | 'sick' | 'casual'].pending - target.daysCount)
            }
          }
        };
      });
    }

    logActivity('LEAVE_CANCELLED', 'leave', requestId, target.employeeName, `Cancelled leave request ${requestId}`);
    addToast({ type: 'info', title: 'Leave Cancelled', message: 'The leave request was withdrawn.' });
    return updated;
  };

  const updateAttendanceConfig = (partial: Partial<AttendanceOrgConfig>) => {
    setAttendanceConfig(prev => ({ ...prev, ...partial }));
    addToast({ type: 'success', title: 'Workday Rules Updated', message: 'Organization attendance policy updated.' });
  };

  // Phase 5 Finance & Billing Actions
  const createInvoice = (data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName' | 'history'>): Invoice => {
    const newId = `inv-${Date.now()}`;
    const invNum = data.invoiceNumber || `${financeConfig.invoicePrefix}${1030 + invoices.length}`;
    
    // Calculate subtotal from items
    const subtotal = data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    
    // Calculate discount
    let discountAmount = 0;
    if (data.discountType === 'percentage') {
      discountAmount = (subtotal * (Number(data.discountValue) || 0)) / 100;
    } else {
      discountAmount = Number(data.discountValue) || 0;
    }
    discountAmount = Math.min(discountAmount, subtotal);
    
    // Tax base & calculation
    const base = subtotal - discountAmount;
    const taxRate = data.taxRate !== undefined ? Number(data.taxRate) : financeConfig.defaultTaxRate;
    const taxAmount = (base * taxRate) / 100;
    const total = Math.round(base + taxAmount);
    const paidAmount = Number(data.paidAmount) || 0;
    const outstandingAmount = Math.max(0, total - paidAmount);
    
    let status: InvoiceStatus = data.status || 'draft';
    if (status !== 'draft' && status !== 'cancelled') {
      if (outstandingAmount === 0 && total > 0) {
        status = 'paid';
      } else if (paidAmount > 0) {
        status = 'partially_paid';
      }
    }

    const now = '2026-09-21 18:25';
    const newInvoice: Invoice = {
      ...data,
      id: newId,
      invoiceNumber: invNum,
      subtotal,
      discountAmount,
      taxRate,
      taxAmount,
      total,
      paidAmount,
      outstandingAmount,
      status,
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: now,
          action: 'created',
          actorName: currentUser.name,
          note: `Invoice created with ${data.items.length} line items`
        }
      ],
      createdAt: now,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      updatedAt: now
    };

    setInvoices(prev => [newInvoice, ...prev]);
    logActivity('INVOICE_CREATED', 'invoice', newId, invNum, `Created invoice ${invNum} for ${data.clientName} (₹${(total / 100000).toFixed(2)}L)`);
    
    addToast({
      type: 'success',
      title: 'Invoice Created',
      message: `${invNum} generated for ${data.clientName}.`
    });

    return newInvoice;
  };

  const updateInvoice = (id: string, partial: Partial<Invoice>): Invoice => {
    let updatedInv: Invoice | undefined;
    
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv;

      const merged = { ...inv, ...partial, updatedAt: '2026-09-21 18:25' };
      
      // Recalculate if items, discount, or tax changed
      if (partial.items || partial.discountValue !== undefined || partial.taxRate !== undefined) {
        const subtotal = merged.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
        let discountAmount = 0;
        if (merged.discountType === 'percentage') {
          discountAmount = (subtotal * (Number(merged.discountValue) || 0)) / 100;
        } else {
          discountAmount = Number(merged.discountValue) || 0;
        }
        discountAmount = Math.min(discountAmount, subtotal);
        const base = subtotal - discountAmount;
        const taxRate = Number(merged.taxRate) || 0;
        const taxAmount = (base * taxRate) / 100;
        const total = Math.round(base + taxAmount);
        const outstandingAmount = Math.max(0, total - merged.paidAmount);

        merged.subtotal = subtotal;
        merged.discountAmount = discountAmount;
        merged.taxAmount = taxAmount;
        merged.total = total;
        merged.outstandingAmount = outstandingAmount;
      }

      updatedInv = merged;
      return merged;
    }));

    if (updatedInv) {
      logActivity('INVOICE_UPDATED', 'invoice', id, updatedInv.invoiceNumber, `Updated invoice ${updatedInv.invoiceNumber}`);
      addToast({ type: 'info', title: 'Invoice Updated', message: `${updatedInv.invoiceNumber} changes saved.` });
      return updatedInv;
    }

    return invoices.find(i => i.id === id)!;
  };

  const sendInvoice = (id: string): Invoice => {
    let updatedInv: Invoice | undefined;

    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      const now = '2026-09-21 18:25';
      const updated: Invoice = {
        ...inv,
        status: inv.status === 'draft' ? 'sent' : inv.status,
        updatedAt: now,
        history: [
          ...inv.history,
          {
            id: `h-${Date.now()}`,
            timestamp: now,
            action: 'sent',
            actorName: currentUser.name,
            note: `Invoice dispatched electronically to ${inv.clientEmail || inv.clientName}`
          }
        ]
      };
      updatedInv = updated;
      return updated;
    }));

    if (updatedInv) {
      logActivity('INVOICE_SENT', 'invoice', id, updatedInv.invoiceNumber, `Dispatched invoice ${updatedInv.invoiceNumber} to ${updatedInv.clientName}`);
      addToast({ type: 'success', title: 'Invoice Sent', message: `${updatedInv.invoiceNumber} sent to client.` });
      return updatedInv;
    }

    return invoices.find(i => i.id === id)!;
  };

  const cancelInvoice = (id: string): Invoice => {
    let updatedInv: Invoice | undefined;

    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      const now = '2026-09-21 18:25';
      const updated: Invoice = {
        ...inv,
        status: 'cancelled',
        outstandingAmount: 0,
        updatedAt: now,
        history: [
          ...inv.history,
          {
            id: `h-${Date.now()}`,
            timestamp: now,
            action: 'cancelled',
            actorName: currentUser.name,
            note: 'Invoice officially marked cancelled and voided'
          }
        ]
      };
      updatedInv = updated;
      return updated;
    }));

    if (updatedInv) {
      logActivity('INVOICE_CANCELLED', 'invoice', id, updatedInv.invoiceNumber, `Cancelled invoice ${updatedInv.invoiceNumber}`);
      addToast({ type: 'warning', title: 'Invoice Cancelled', message: `${updatedInv.invoiceNumber} has been voided.` });
      return updatedInv;
    }

    return invoices.find(i => i.id === id)!;
  };

  const markInvoiceOverdue = (id: string): Invoice => {
    let updatedInv: Invoice | undefined;

    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      const now = '2026-09-21 18:25';
      const updated: Invoice = {
        ...inv,
        status: 'overdue',
        updatedAt: now,
        history: [
          ...inv.history,
          {
            id: `h-${Date.now()}`,
            timestamp: now,
            action: 'overdue_marked',
            actorName: currentUser.name,
            note: 'Marked overdue by account manager'
          }
        ]
      };
      updatedInv = updated;
      return updated;
    }));

    if (updatedInv) {
      logActivity('INVOICE_UPDATED', 'invoice', id, updatedInv.invoiceNumber, `Marked invoice ${updatedInv.invoiceNumber} as overdue`);
      addToast({ type: 'warning', title: 'Status Updated', message: `${updatedInv.invoiceNumber} is marked overdue.` });
      return updatedInv;
    }

    return invoices.find(i => i.id === id)!;
  };

  const recordPayment = (data: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference: string;
    notes?: string;
  }): Payment => {
    const targetInvoice = invoices.find(i => i.id === data.invoiceId);
    if (!targetInvoice) {
      throw new Error(`Invoice with ID ${data.invoiceId} not found`);
    }

    const payAmount = Math.max(0, Number(data.amount));
    const now = '2026-09-21 18:25';
    const payId = `pay-${Date.now()}`;

    const newPayment: Payment = {
      id: payId,
      invoiceId: targetInvoice.id,
      invoiceNumber: targetInvoice.invoiceNumber,
      clientId: targetInvoice.clientId,
      clientName: targetInvoice.clientName,
      projectId: targetInvoice.projectId,
      projectName: targetInvoice.projectName,
      amount: payAmount,
      currency: targetInvoice.currency,
      date: '2026-09-21',
      method: data.method,
      reference: data.reference,
      status: 'successful',
      notes: data.notes,
      recordedBy: currentUser.id,
      recordedByName: currentUser.name,
      createdAt: now
    };

    // Prepend new payment to immutable payment ledger
    setPayments(prev => [newPayment, ...prev]);

    // Update invoice paid & outstanding amounts and transition status
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== data.invoiceId) return inv;

      const newPaidAmount = inv.paidAmount + payAmount;
      const newOutstanding = Math.max(0, inv.total - newPaidAmount);
      const newStatus: InvoiceStatus = newOutstanding === 0 ? 'paid' : 'partially_paid';

      return {
        ...inv,
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstanding,
        status: newStatus,
        updatedAt: now,
        history: [
          ...inv.history,
          {
            id: `h-${Date.now()}`,
            timestamp: now,
            action: 'payment_recorded',
            actorName: currentUser.name,
            amount: payAmount,
            note: `Payment of ₹${payAmount.toLocaleString('en-IN')} via ${data.method.replace('_', ' ')} (Ref: ${data.reference})`
          }
        ]
      };
    }));

    logActivity('PAYMENT_RECORDED', 'payment', payId, targetInvoice.invoiceNumber, `Recorded payment of ₹${(payAmount / 100000).toFixed(2)}L against ${targetInvoice.invoiceNumber} (${data.reference})`);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Payment Received',
      message: `₹${payAmount.toLocaleString('en-IN')} received from ${targetInvoice.clientName} for invoice ${targetInvoice.invoiceNumber}.`,
      category: 'system',
      isRead: false,
      createdAt: 'Just now',
      link: `/app/finance/invoices/${targetInvoice.id}`
    };
    setNotifications(prev => [notif, ...prev]);

    addToast({
      type: 'success',
      title: 'Payment Recorded',
      message: `₹${payAmount.toLocaleString('en-IN')} credited to ${targetInvoice.invoiceNumber}.`
    });

    return newPayment;
  };

  const submitExpense = (data: Omit<Expense, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Expense => {
    const newId = `exp-${Date.now()}`;
    const now = '2026-09-21 18:25';

    const newExp: Expense = {
      ...data,
      id: newId,
      status: 'submitted',
      employeeId: data.employeeId || currentUser.id,
      employeeName: data.employeeName || currentUser.name,
      createdAt: now,
      updatedAt: now
    };

    setExpenses(prev => [newExp, ...prev]);
    logActivity('EXPENSE_SUBMITTED', 'expense', newId, newExp.title, `Submitted expense "${newExp.title}" (₹${newExp.amount.toLocaleString('en-IN')})`);

    addToast({
      type: 'success',
      title: 'Expense Submitted',
      message: `Your reimbursement request for ₹${newExp.amount.toLocaleString('en-IN')} has been queued.`
    });

    return newExp;
  };

  const reviewExpense = (id: string, action: 'approve' | 'reject' | 'changes', reviewNote?: string): Expense => {
    let updatedExp: Expense | undefined;
    const now = '2026-09-21 18:25';

    setExpenses(prev => prev.map(exp => {
      if (exp.id !== id) return exp;

      const newStatus: ExpenseStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'submitted';
      const updated: Expense = {
        ...exp,
        status: newStatus,
        reviewedBy: currentUser.id,
        reviewedByName: currentUser.name,
        reviewedAt: now,
        reviewNotes: reviewNote,
        updatedAt: now
      };
      updatedExp = updated;
      return updated;
    }));

    if (updatedExp) {
      if (action === 'approve') {
        logActivity('EXPENSE_APPROVED', 'expense', id, updatedExp.title, `Approved expense "${updatedExp.title}" for ₹${updatedExp.amount.toLocaleString('en-IN')}`);
        addToast({ type: 'success', title: 'Expense Approved', message: `Approved for reimbursement.` });
      } else if (action === 'reject') {
        logActivity('EXPENSE_REJECTED', 'expense', id, updatedExp.title, `Declined expense "${updatedExp.title}": ${reviewNote || 'No reason specified'}`);
        addToast({ type: 'warning', title: 'Expense Rejected', message: `Reimbursement request declined.` });
      }
      return updatedExp;
    }

    return expenses.find(e => e.id === id)!;
  };

  const payExpense = (id: string, paymentReference: string): Expense => {
    let updatedExp: Expense | undefined;
    const now = '2026-09-21 18:25';

    setExpenses(prev => prev.map(exp => {
      if (exp.id !== id) return exp;
      const updated: Expense = {
        ...exp,
        status: 'paid',
        paidAt: now,
        paymentReference,
        updatedAt: now
      };
      updatedExp = updated;
      return updated;
    }));

    if (updatedExp) {
      logActivity('EXPENSE_UPDATED', 'expense', id, updatedExp.title, `Marked expense "${updatedExp.title}" paid (${paymentReference})`);
      addToast({ type: 'success', title: 'Expense Paid', message: `Reimbursement marked as paid.` });
      return updatedExp;
    }

    return expenses.find(e => e.id === id)!;
  };

  const updateFinanceConfig = (partial: Partial<FinanceOrgConfig>) => {
    setFinanceConfig(prev => ({ ...prev, ...partial }));
    addToast({ type: 'success', title: 'Finance Rules Updated', message: 'Corporate billing policy updated.' });
  };

  return (
    <CRMContext.Provider value={{
      isAdminAuthenticated,
      adminLogin,
      adminLogout,
      currentUser,
      employees,
      invitations,
      rolePermissions,
      organization,
      notifications,
      activityEvents,
      auditLogs,
      notes,
      documents,
      sessions,
      leads,
      contacts,
      companies,
      deals,
      meetings,
      followUps,
      conversations,
      salesMetrics,
      // Phase 3 Delivery State
      projects,
      milestones,
      tasks,
      workUpdates,
      tickets,
      projectFiles,
      calculateProjectProgress,
      evaluateProjectHealth,
      currentPath,
      navigateTo,
      isCommandPaletteOpen,
      setCommandPaletteOpen,
      isInviteModalOpen,
      setInviteModalOpen,
      isSidebarCollapsed,
      setSidebarCollapsed,
      toasts,
      addToast,
      removeToast,
      updateEmployee,
      createInvitation,
      resendInvitation,
      revokeInvitation,
      updateRolePermissions,
      resetRolePermissions,
      updateOrganization,
      updateCurrentUser,
      switchUserRole,
      markNotificationRead,
      markAllNotificationsRead,
      clearAllNotifications,
      addEmployeeNote,
      terminateOtherSessions,
      exportTeamCSV,
      addLead,
      updateLead,
      deleteLead,
      convertLeadToClient,
      addContact,
      updateContact,
      addCompany,
      updateCompany,
      addDeal,
      updateDeal,
      updateDealStage,
      scheduleMeeting,
      recordMeetingOutcome,
      addFollowUp,
      completeFollowUp,
      sendChatMessage,
      // Phase 3 Delivery Actions
      createProject,
      updateProject,
      deleteProject,
      createMilestone,
      updateMilestone,
      createTask,
      updateTask,
      updateTaskStatus,
      addTaskComment,
      submitDailyUpdate,
      createTicket,
      updateTicketStatus,
      addTicketMessage,
      uploadProjectFile,
      // Phase 4 Attendance & Leave State
      attendanceRecords,
      todayDateStr,
      attendanceEvents,
      attendanceExceptions,
      correctionRequests,
      shifts,
      officeLocations,
      supabaseStatus,
      leaveRequests,
      leaveBalances,
      attendanceConfig,
      currentUserAttendance,
      // Phase 4 Actions
      punchIn,
      punchOut,
      startBreak,
      endBreak,
      dismissException,
      reviewCorrection,
      updateOperationalStatus,
      correctAttendance,
      submitLeaveRequest,
      reviewLeaveRequest,
      cancelLeaveRequest,
      updateAttendanceConfig,
      // Phase 5 Finance & Billing State
      invoices,
      payments,
      expenses,
      financeConfig,
      financeMetrics,
      // Phase 5 Actions
      createInvoice,
      updateInvoice,
      sendInvoice,
      cancelInvoice,
      markInvoiceOverdue,
      recordPayment,
      submitExpense,
      reviewExpense,
      payExpense,
      updateFinanceConfig
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
