import { 
  Employee, 
  Invitation, 
  RolePermissions, 
  ActivityEvent, 
  AuditLog, 
  NotificationItem, 
  OrganizationSettings, 
  EmployeeNote, 
  EmployeeDocument,
  UserSession
} from '../types';

export const INITIAL_CURRENT_USER: Employee = {
  id: 'emp-admin',
  name: 'System Administrator',
  email: 'admin@starchainlabs.com',
  phone: '+91 98765 00000',
  designation: 'System Administrator',
  department: 'Operations',
  role: 'super_admin',
  status: 'active',
  joinedDate: '2026-01-01',
  lastActive: 'Just now',
  bio: 'Lead system administrator for Star Chain Labs internal CRM platform.',
  timezone: 'Asia/Kolkata (IST)',
  location: 'Headquarters',
  directReports: 0,
  skills: ['Administration', 'Security', 'Operations'],
  notesCount: 0,
  documentsCount: 0,
};

export const INITIAL_EMPLOYEES: Employee[] = [
  INITIAL_CURRENT_USER
];

export const INITIAL_INVITATIONS: Invitation[] = [];

export const INITIAL_ROLE_PERMISSIONS: RolePermissions = {
  super_admin: {
    employees: { view: true, create: true, update: true, delete: true, approve: true, export: true, manage: true },
    crm: { view: true, create: true, update: true, delete: true, approve: true, export: true, manage: true },
    sales: { view: true, create: true, update: true, delete: true, approve: true, export: true, manage: true },
    projects: { view: true, create: true, update: true, delete: true, approve: true, export: true, manage: true },
    attendance: { view: true, create: true, update: true, delete: true, approve: true, export: true, manage: true },
    communication: { view: true, create: true, update: true, delete: true, approve: true, export: true, manage: true },
    finance: { view: true, create: true, update: true, delete: true, approve: true, export: true, manage: true },
    settings: { view: true, create: true, update: true, delete: true, approve: true, export: true, manage: true },
  },
  admin: {
    employees: { view: true, create: true, update: true, delete: true, approve: true, export: true, manage: true },
    crm: { view: true, create: true, update: true, delete: false, approve: true, export: true, manage: true },
    sales: { view: true, create: true, update: true, delete: false, approve: true, export: true, manage: true },
    projects: { view: true, create: true, update: true, delete: false, approve: true, export: true, manage: true },
    attendance: { view: true, create: true, update: true, delete: true, approve: true, export: true, manage: true },
    communication: { view: true, create: true, update: true, delete: false, approve: true, export: true, manage: true },
    finance: { view: true, create: false, update: false, delete: false, approve: false, export: true, manage: false },
    settings: { view: true, create: true, update: true, delete: false, approve: true, export: true, manage: true },
  },
  manager: {
    employees: { view: true, create: false, update: true, delete: false, approve: true, export: true, manage: false },
    crm: { view: true, create: true, update: true, delete: false, approve: true, export: true, manage: true },
    sales: { view: true, create: true, update: true, delete: false, approve: true, export: true, manage: true },
    projects: { view: true, create: true, update: true, delete: false, approve: true, export: false, manage: true },
    attendance: { view: true, create: true, update: true, delete: false, approve: true, export: true, manage: false },
    communication: { view: true, create: true, update: true, delete: false, approve: false, export: false, manage: false },
    finance: { view: false, create: false, update: false, delete: false, approve: false, export: false, manage: false },
    settings: { view: false, create: false, update: false, delete: false, approve: false, export: false, manage: false },
  },
  employee: {
    employees: { view: true, create: false, update: false, delete: false, approve: false, export: false, manage: false },
    crm: { view: true, create: true, update: true, delete: false, approve: false, export: false, manage: false },
    sales: { view: true, create: true, update: true, delete: false, approve: false, export: false, manage: false },
    projects: { view: true, create: false, update: true, delete: false, approve: false, export: false, manage: false },
    attendance: { view: true, create: true, update: false, delete: false, approve: false, export: false, manage: false },
    communication: { view: true, create: true, update: false, delete: false, approve: false, export: false, manage: false },
    finance: { view: false, create: false, update: false, delete: false, approve: false, export: false, manage: false },
    settings: { view: false, create: false, update: false, delete: false, approve: false, export: false, manage: false },
  },
  client: {
    employees: { view: false, create: false, update: false, delete: false, approve: false, export: false, manage: false },
    crm: { view: false, create: false, update: false, delete: false, approve: false, export: false, manage: false },
    sales: { view: false, create: false, update: false, delete: false, approve: false, export: false, manage: false },
    projects: { view: true, create: false, update: false, delete: false, approve: false, export: false, manage: false },
    attendance: { view: false, create: false, update: false, delete: false, approve: false, export: false, manage: false },
    communication: { view: true, create: true, update: false, delete: false, approve: false, export: false, manage: false },
    finance: { view: true, create: false, update: false, delete: false, approve: false, export: false, manage: false },
    settings: { view: false, create: false, update: false, delete: false, approve: false, export: false, manage: false },
  }
};

export const INITIAL_ORGANIZATION: OrganizationSettings = {
  name: 'STAR CHAIN LABS',
  logo: '/logo.svg',
  industry: 'Enterprise Software & Distributed Systems',
  companySize: '1-10 Employees',
  website: 'https://starchainlabs.com',
  country: 'India',
  currency: 'INR (₹)',
  timezone: 'Asia/Kolkata (IST - UTC+05:30)',
  primaryContact: 'admin@starchainlabs.com',
  supportEmail: 'ops@starchainlabs.com',
  foundedYear: '2026'
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_ACTIVITY_EVENTS: ActivityEvent[] = [];

export const INITIAL_NOTES: EmployeeNote[] = [];

export const INITIAL_DOCUMENTS: EmployeeDocument[] = [];

export const INITIAL_SESSIONS: UserSession[] = [];
