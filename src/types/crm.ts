export type LeadSource = 
  | 'Website' 
  | 'Referral' 
  | 'LinkedIn' 
  | 'Instagram' 
  | 'Email' 
  | 'Cold Call' 
  | 'Advertisement' 
  | 'Other';

export type LeadStage = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'proposal' 
  | 'negotiation' 
  | 'won' 
  | 'lost';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  name: string;
  companyName: string;
  companyId?: string;
  email: string;
  phone: string;
  source: LeadSource;
  requirement: string;
  budget: number;
  currency: string;
  ownerId: string;
  ownerName: string;
  priority: LeadPriority;
  stage: LeadStage;
  value: number;
  expectedCloseDate: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  tags: string[];
  notes?: string;
  createdDate: string;
  lastActivity: string;
}

export type ContactStatus = 'active' | 'lead' | 'customer' | 'inactive';

export interface Contact {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  role: string;
  email: string;
  phone: string;
  ownerId: string;
  ownerName: string;
  status: ContactStatus;
  createdDate: string;
  lastActivity: string;
  avatar?: string;
  notes?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  primaryContactId: string;
  primaryContactName: string;
  ownerId: string;
  ownerName: string;
  activeDealsCount: number;
  totalRevenue: number;
  currency: string;
  lastActivity: string;
  location: string;
  employeeRange: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export type DealStage = 
  | 'new' 
  | 'qualified' 
  | 'proposal' 
  | 'negotiation' 
  | 'won' 
  | 'lost';

export interface Deal {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  primaryContactId: string;
  primaryContactName: string;
  ownerId: string;
  ownerName: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number; // 0 to 100
  expectedCloseDate: string;
  source: LeadSource;
  createdDate: string;
  lastActivity: string;
  lostReason?: string;
  notes?: string;
}

export type CRMActivityType = 'call' | 'email' | 'meeting' | 'followup' | 'note';

export interface CRMActivity {
  id: string;
  type: CRMActivityType;
  clientId: string;
  clientName: string;
  leadId?: string;
  dealId?: string;
  companyId?: string;
  employeeId: string;
  employeeName: string;
  date: string;
  time: string;
  duration?: string; // e.g. "18 mins"
  outcome: string;
  nextAction?: string;
  nextFollowUp?: string;
  notes: string;
}

export type MeetingType = 'online' | 'phone' | 'offline';
export type MeetingStatus = 'scheduled' | 'completed' | 'rescheduled' | 'cancelled' | 'no_show';

export interface Meeting {
  id: string;
  title: string;
  clientName: string;
  companyName?: string;
  leadId?: string;
  dealId?: string;
  companyId?: string;
  salesEmployeeId?: string;
  salesEmployeeName?: string;
  hostEmployeeId?: string;
  hostEmployeeName?: string;
  date: string;
  time: string;
  duration: number | string; // in minutes or formatted string e.g. "45 mins"
  meetingType?: MeetingType;
  type?: MeetingType;
  locationOrLink?: string;
  meetingUrl?: string;
  location?: string;
  purpose?: string;
  agenda?: string;
  status: MeetingStatus;
  outcome?: string;
  clientResponse?: string;
  nextAction?: string;
  nextFollowUp?: string;
  notes?: string;
}

export type FollowUpStatus = 'today' | 'upcoming' | 'overdue' | 'completed';

export interface FollowUp {
  id: string;
  title?: string;
  taskDescription?: string;
  clientName: string;
  companyName?: string;
  leadId?: string;
  relatedType?: 'lead' | 'deal' | 'company';
  relatedId?: string;
  assignedToId?: string;
  assignedToName?: string;
  employeeId?: string;
  employeeName?: string;
  dueDate: string;
  dueTime: string;
  purpose?: string;
  status: FollowUpStatus;
  reminderEnabled?: boolean;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderType?: 'client' | 'agent' | 'internal_note';
  senderRole?: 'client' | 'rep';
  isInternalNote?: boolean;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[];
}

export interface Conversation {
  id: string;
  contactId?: string;
  contactName?: string;
  clientName?: string;
  contactEmail?: string;
  clientEmail?: string;
  clientPhone?: string;
  companyName: string;
  companyId?: string;
  dealId?: string;
  dealName?: string;
  dealValue?: number;
  dealStage?: DealStage;
  ownerId?: string;
  ownerName?: string;
  unreadCount: number;
  lastActivity?: string;
  lastMessageTime?: string;
  lastMessageSnippet?: string;
  lastMessagePreview?: string;
  messages: ChatMessage[];
}

export interface SalesEmployeeMetric {
  employeeId: string;
  employeeName: string;
  role: string;
  meetings: { actual: number; target: number };
  calls: { actual: number; target: number };
  followups: { actual: number; target: number };
  qualifiedLeads: { actual: number; target: number };
  proposals: { actual: number; target: number };
  conversions: { actual: number; target: number };
  revenue: { actual: number; target: number };
  wonRevenue?: number;
  targetQuota?: number;
  dealsClosed?: number;
  callsCompleted?: number;
  meetingsHeld?: number;
}
