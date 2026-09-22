export type Role = 'super_admin' | 'admin' | 'manager' | 'employee' | 'client';

export type Department = 
  | 'Engineering' 
  | 'Product' 
  | 'Design' 
  | 'Sales' 
  | 'HR' 
  | 'Operations' 
  | 'Finance';

export type EmployeeStatus = 'active' | 'invited' | 'suspended' | 'inactive';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: Department;
  role: Role;
  status: EmployeeStatus;
  joinedDate: string;
  lastActive: string;
  avatar?: string;
  bio?: string;
  timezone: string;
  location?: string;
  manager?: {
    id: string;
    name: string;
    designation: string;
  };
  directReports?: number;
  skills: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  notesCount: number;
  documentsCount: number;
}

export interface EmployeeNote {
  id: string;
  employeeId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isPrivate?: boolean;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  title: string;
  type: 'contract' | 'nda' | 'tax' | 'identity' | 'certification' | 'other';
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  verified: boolean;
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Invitation {
  id: string;
  fullName: string;
  email: string;
  department: Department;
  designation: string;
  role: Role;
  status: InvitationStatus;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  token: string;
}

export type PermissionModule = 
  | 'employees' 
  | 'crm' 
  | 'sales' 
  | 'projects' 
  | 'attendance' 
  | 'communication' 
  | 'finance' 
  | 'settings';

export type PermissionAction = 
  | 'view' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'export' 
  | 'manage';

export type RolePermissions = Record<Role, Record<PermissionModule, Record<PermissionAction, boolean>>>;

export type ActivityEventType =
  | 'USER_CREATED'
  | 'INVITATION_SENT'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_RESENT'
  | 'INVITATION_REVOKED'
  | 'ROLE_CHANGED'
  | 'STATUS_CHANGED'
  | 'PROFILE_UPDATED'
  | 'ORGANIZATION_UPDATED'
  | 'PERMISSION_CHANGED'
  | 'NOTE_ADDED'
  | 'DOCUMENT_UPLOADED'
  | 'SYSTEM_ALERT'
  // Phase 3 Delivery Activity Events
  | 'PROJECT_CREATED'
  | 'PROJECT_ASSIGNED'
  | 'TEAM_MEMBER_ADDED'
  | 'MILESTONE_CREATED'
  | 'MILESTONE_COMPLETED'
  | 'TASK_CREATED'
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_COMPLETED'
  | 'TASK_BLOCKED'
  | 'DAILY_UPDATE_SUBMITTED'
  | 'TICKET_CREATED'
  | 'TICKET_ASSIGNED'
  | 'TICKET_UPDATED'
  | 'TICKET_RESOLVED'
  | 'DEADLINE_MISSED'
  | 'PROJECT_STATUS_CHANGED'
  // Phase 4 Attendance & Leave Events
  | 'PUNCH_IN'
  | 'PUNCH_OUT'
  | 'BREAK_STARTED'
  | 'BREAK_ENDED'
  | 'LEAVE_REQUESTED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'LEAVE_CANCELLED'
  | 'ATTENDANCE_CORRECTED'
  | 'OPERATIONAL_STATUS_CHANGED'
  // Phase 5 Finance & Billing Events
  | 'INVOICE_CREATED'
  | 'INVOICE_SENT'
  | 'INVOICE_UPDATED'
  | 'INVOICE_CANCELLED'
  | 'PAYMENT_RECORDED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'EXPENSE_SUBMITTED'
  | 'EXPENSE_APPROVED'
  | 'EXPENSE_REJECTED'
  | 'EXPENSE_UPDATED';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actorAvatar?: string;
  type: ActivityEventType;
  entityType: 'employee' | 'invitation' | 'organization' | 'role' | 'permission' | 'system' | 'lead' | 'deal' | 'project' | 'task' | 'milestone' | 'ticket' | 'work_update' | 'attendance' | 'leave' | 'invoice' | 'payment' | 'expense';
  entityId: string;
  entityName: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'all' | 'unread' | 'mentions' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
  actionType?: string;
}

export interface OrganizationSettings {
  name: string;
  logo: string;
  industry: string;
  companySize: string;
  website: string;
  country: string;
  currency: string;
  timezone: string;
  primaryContact: string;
  supportEmail: string;
  foundedYear: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}
