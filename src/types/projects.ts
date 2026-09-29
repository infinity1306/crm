// Phase 3 — Projects, Tasks & Work Operations Types
// STAR CHAIN LABS Internal CRM

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectHealth = 'on_track' | 'at_risk' | 'delayed';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ProjectTeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  email?: string;
  department?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  managerId: string;
  managerName: string;
  managerAvatar?: string;
  teamIds: string[];
  teamMembers: ProjectTeamMember[];
  description: string;
  status: ProjectStatus;
  health: ProjectHealth;
  startDate: string;
  deadline: string;
  budget: number; // in INR
  priority: ProjectPriority;
  tags: string[];
  template?: string;
  progress: number; // dynamically derived 0-100%
  lastUpdated: string;
  notes?: string;
  dealId?: string; // Won deal reference if originated from CRM
}

export type MilestoneStatus = 'upcoming' | 'in_progress' | 'completed' | 'delayed';

export interface Milestone {
  id: string;
  projectId: string;
  projectName?: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  startDate: string;
  deadline: string;
  progress: number; // derived %
  status: MilestoneStatus;
  moduleName?: string; // e.g. Frontend, Backend, Auth, Testing, Deployment
  order: number;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url?: string;
  size: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  milestoneId?: string;
  milestoneName?: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  estimatedHours?: number;
  actualHours?: number;
  progress: number; // 0-100
  blockedReason?: string;
  blockedAt?: string;
  dependencies: string[]; // Task IDs that must complete first (blockedBy)
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  lastUpdated: string;
  commentsCount: number;
  attachmentsCount: number;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

export interface DailyWorkUpdate {
  id: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  employeeDesignation?: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskTitle?: string;
  completedItems: string[];
  inProgressItems: string[];
  blockedItems: string[];
  blockedReason?: string;
  nextActionItems: string[];
  hoursSpent?: number;
  createdAt: string;
}

export type InternalTicketStatus = 'open' | 'assigned' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type InternalTicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type InternalTicketType = 'bug' | 'client_issue' | 'technical' | 'operational_query' | 'internal';

export interface OperationalQueryResponse {
  currentProgressPercent: number;
  completedSummary: string;
  remainingSummary: string;
  eta: string;
  additionalNotes?: string;
}

export interface TicketMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isAdminQuery?: boolean;
  queryResponseData?: OperationalQueryResponse;
}

export interface InternalTicket {
  id: string; // e.g. TICK-201
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  milestoneId?: string;
  milestoneName?: string;
  taskId?: string;
  taskTitle?: string;
  createdBy: string;
  createdByName: string;
  createdByAvatar?: string;
  assignedToId: string;
  assignedToName: string;
  assignedToAvatar?: string;
  priority: InternalTicketPriority;
  status: InternalTicketStatus;
  type: InternalTicketType;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: TicketMessage[];
  attachments: TaskAttachment[];
}

export type ProjectFileCategory = 'designs' | 'documents' | 'assets' | 'reports' | 'builds' | 'client_files';

export interface ProjectFile {
  id: string;
  name: string;
  category: ProjectFileCategory;
  size: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  projectId: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
  downloadUrl?: string;
}

export interface ProjectTimelineEvent {
  id: string;
  timestamp: string; // e.g. "09:15", "11:40" or formatted date/time
  timeAgo?: string;
  type: 'task' | 'update' | 'ticket' | 'milestone' | 'comment' | 'file' | 'status_change';
  actorName: string;
  actorAvatar?: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}
