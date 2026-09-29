import React, { useState, useEffect, useRef } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Search, 
  Users, 
  Settings, 
  ShieldCheck, 
  Building2, 
  LayoutDashboard, 
  Bell, 
  UserPlus, 
  History, 
  Layers, 
  ArrowRight,
  Sparkles,
  Target,
  Briefcase,
  CalendarClock,
  Calendar,
  Clock,
  CheckSquare,
  MessageSquare,
  BarChart3,
  FolderKanban,
  LifeBuoy,
  IndianRupee,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface PaletteItem {
  id: string;
  category: 'Pages' | 'Employees' | 'Leads' | 'Companies' | 'Deals' | 'Projects' | 'Tasks' | 'Tickets' | 'Finance' | 'Actions' | 'Settings';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  onSelect: () => void;
  badge?: string;
}

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    navigateTo, 
    employees, 
    leads,
    companies,
    deals,
    projects,
    tasks,
    tickets,
    setInviteModalOpen 
  } = useCRM();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Build searchable items
  const baseItems: PaletteItem[] = [
    {
      id: 'page-overview',
      category: 'Pages',
      title: 'Overview Dashboard',
      subtitle: 'Foundation metrics, company pulse & activity',
      icon: LayoutDashboard,
      onSelect: () => navigateTo('/app/overview')
    },
    {
      id: 'page-leads',
      category: 'Pages',
      title: 'CRM Leads & Inbound Prospects',
      subtitle: 'Discovery inquiries, qualification, and conversions',
      icon: Target,
      onSelect: () => navigateTo('/app/crm/leads')
    },
    {
      id: 'page-companies',
      category: 'Pages',
      title: 'Client Companies & Accounts',
      subtitle: 'Enterprise client profiles, 360° dossiers & contracts',
      icon: Building2,
      onSelect: () => navigateTo('/app/crm/companies')
    },
    {
      id: 'page-contacts',
      category: 'Pages',
      title: 'Stakeholder Contacts',
      subtitle: 'Client decision-makers, CTOs, and representatives',
      icon: Users,
      onSelect: () => navigateTo('/app/crm/contacts')
    },
    {
      id: 'page-deals',
      category: 'Pages',
      title: 'Deals & Pipeline Directory',
      subtitle: 'Active opportunities, contract values & close forecasts',
      icon: Briefcase,
      onSelect: () => navigateTo('/app/crm/deals')
    },
    {
      id: 'page-pipeline',
      category: 'Pages',
      title: 'Sales Pipeline Kanban',
      subtitle: 'Visual 6-stage deal board with drag/advance controls',
      icon: Briefcase,
      onSelect: () => navigateTo('/app/sales/pipeline')
    },
    {
      id: 'page-sales-overview',
      category: 'Pages',
      title: 'Sales Overview & Revenue Analytics',
      subtitle: 'Quarterly quotas, funnel conversion & rep scoreboard',
      icon: BarChart3,
      onSelect: () => navigateTo('/app/sales/overview')
    },
    {
      id: 'page-activities',
      category: 'Pages',
      title: 'Sales Activities & Touchpoints',
      subtitle: 'Omnichannel calls, emails, meeting debriefs & notes',
      icon: History,
      onSelect: () => navigateTo('/app/sales/activities')
    },
    {
      id: 'page-meetings',
      category: 'Pages',
      title: 'Meetings & Product Demos',
      subtitle: 'Video syncs, architecture walkthroughs & outcomes',
      icon: CalendarClock,
      onSelect: () => navigateTo('/app/sales/meetings')
    },
    {
      id: 'page-followups',
      category: 'Pages',
      title: 'Follow-up Queue',
      subtitle: 'SLA-driven outreach checkpoints & action tasks',
      icon: CheckSquare,
      onSelect: () => navigateTo('/app/sales/followups')
    },
    {
      id: 'page-messages',
      category: 'Pages',
      title: 'Client Communication Workspace',
      subtitle: '3-panel unified chat with internal team memos 🔒',
      icon: MessageSquare,
      onSelect: () => navigateTo('/app/communication/messages')
    },
    {
      id: 'page-team',
      category: 'Pages',
      title: 'Team Directory',
      subtitle: 'Manage employees, invitations, roles & statuses',
      icon: Users,
      onSelect: () => navigateTo('/app/team')
    },
    {
      id: 'page-recruitment',
      category: 'Pages',
      title: 'Recruitment Tracker (HR & Super Admin)',
      subtitle: 'Applicant screening pipeline, telephonic, HR & managerial rounds with salary benchmarks',
      icon: UserPlus,
      onSelect: () => navigateTo('/app/recruitment')
    },
    {
      id: 'page-payroll',
      category: 'Pages',
      title: 'Payroll Sheet & Payslip Generator (HR & Super Admin)',
      subtitle: 'Monthly salary matrix, statutory deductions, bank routing & printable payslips',
      icon: FileSpreadsheet,
      onSelect: () => navigateTo('/app/payroll')
    },
    {
      id: 'page-notifs',
      category: 'Pages',
      title: 'Notifications',
      subtitle: 'System alerts, team mentions, and operational notices',
      icon: Bell,
      onSelect: () => navigateTo('/app/notifications')
    },
    {
      id: 'page-projects',
      category: 'Pages',
      title: 'Projects & Delivery Hub',
      subtitle: 'Client delivery lifecycle, milestones, derived progress & health',
      icon: FolderKanban,
      onSelect: () => navigateTo('/app/projects')
    },
    {
      id: 'page-tasks',
      category: 'Pages',
      title: 'Engineering Tasks & Kanban Workspace',
      subtitle: '6-column task board, dependencies, and blocker alerts',
      icon: CheckSquare,
      onSelect: () => navigateTo('/app/tasks')
    },
    {
      id: 'page-updates',
      category: 'Pages',
      title: 'Daily Work Updates (EOD)',
      subtitle: 'Standup telemetry, completed tasks, roadblocks & next priorities',
      icon: History,
      onSelect: () => navigateTo('/app/work-updates')
    },
    {
      id: 'page-tickets',
      category: 'Pages',
      title: 'Internal Tickets & Escalations Desk',
      subtitle: 'SLA-driven issue tracking and admin operational status inquiries',
      icon: LifeBuoy,
      onSelect: () => navigateTo('/app/tickets')
    },
    {
      id: 'page-attendance',
      category: 'Pages',
      title: 'Attendance Operations Dashboard',
      subtitle: 'Live presence, punch logs, monthly matrix, analytics & non-destructive correction',
      icon: CalendarClock,
      onSelect: () => navigateTo('/app/attendance')
    },
    {
      id: 'page-working-now',
      category: 'Pages',
      title: 'Working Now — Live Floor Radar',
      subtitle: 'Active clocked-in employees, elapsed session durations & project tasks',
      icon: Clock,
      onSelect: () => navigateTo('/app/attendance/working-now')
    },
    {
      id: 'page-leave',
      category: 'Pages',
      title: 'Leave & Absence Management Desk',
      subtitle: 'Leave quota balances, pending manager approvals & leave records',
      icon: Calendar,
      onSelect: () => navigateTo('/app/leave')
    },
    {
      id: 'page-calendar',
      category: 'Pages',
      title: 'Company Calendar — Offs & Celebrations',
      subtitle: 'Official company offs, team birthdays, work anniversaries, events & 10 to 7 shift',
      icon: Calendar,
      onSelect: () => navigateTo('/app/calendar')
    },
    {
      id: 'page-my-attendance',
      category: 'Pages',
      title: 'My Attendance & Punch Control',
      subtitle: 'Personal punch in/out, break tracker, and session history',
      icon: Clock,
      onSelect: () => navigateTo('/app/my-attendance')
    },
    {
      id: 'page-audit',
      category: 'Pages',
      title: 'Audit Log',
      subtitle: 'Chronological compliance trail and security events',
      icon: History,
      onSelect: () => navigateTo('/app/audit')
    },
    {
      id: 'page-design',
      category: 'Pages',
      title: 'Design System Gallery',
      subtitle: 'Visual tokens, primitives, states & buttons',
      icon: Layers,
      onSelect: () => navigateTo('/app/design-system')
    },
    {
      id: 'page-finance-overview',
      category: 'Pages',
      title: 'Finance & Revenue Overview',
      subtitle: 'Total billed, collections, overdue, net margin & trajectory',
      icon: IndianRupee,
      onSelect: () => navigateTo('/app/finance')
    },
    {
      id: 'page-finance-revenue',
      category: 'Pages',
      title: 'Revenue Analytics & Margins',
      subtitle: 'Client leaderboard, project gross margins & expense breakdown',
      icon: BarChart3,
      onSelect: () => navigateTo('/app/finance/revenue')
    },
    {
      id: 'page-finance-invoices',
      category: 'Pages',
      title: 'Commercial Invoices Desk',
      subtitle: 'Tax invoices, line items, status workflows & PDF print view',
      icon: Receipt,
      onSelect: () => navigateTo('/app/finance/invoices')
    },
    {
      id: 'page-finance-payments',
      category: 'Pages',
      title: 'Inward Settlement Ledger',
      subtitle: 'Immutable UTR transaction register, wire receipts & channels',
      icon: CreditCard,
      onSelect: () => navigateTo('/app/finance/payments')
    },
    {
      id: 'page-finance-overdue',
      category: 'Pages',
      title: 'Overdue Receivables & Recovery Desk',
      subtitle: 'Aging analysis (1-15, 16-30, 31-60, 60+ days) and recovery reminders',
      icon: AlertTriangle,
      onSelect: () => navigateTo('/app/finance/overdue')
    },
    {
      id: 'page-finance-expenses',
      category: 'Pages',
      title: 'Operational Expenses Desk',
      subtitle: 'Employee reimbursement claims & manager approval queue',
      icon: Receipt,
      onSelect: () => navigateTo('/app/finance/expenses')
    },
    {
      id: 'page-finance-reports',
      category: 'Pages',
      title: 'Financial Reports & Tax Registers',
      subtitle: 'Monthly statements, client billing ledgers & GSTR-1 register',
      icon: FileSpreadsheet,
      onSelect: () => navigateTo('/app/finance/reports')
    },
    {
      id: 'action-create-invoice',
      category: 'Actions',
      title: 'Create Commercial Invoice',
      subtitle: 'Issue GST-compliant commercial tax invoice for client',
      icon: Receipt,
      onSelect: () => navigateTo('/app/finance/invoices')
    },
    {
      id: 'action-record-payment',
      category: 'Actions',
      title: 'Record Inward Payment',
      subtitle: 'Log client remittance UTR with immutable audit ledger',
      icon: CreditCard,
      onSelect: () => navigateTo('/app/finance/payments')
    },
    {
      id: 'action-claim-expense',
      category: 'Actions',
      title: 'Claim Operational Expense',
      subtitle: 'Submit company expense or reimbursement claim',
      icon: Receipt,
      onSelect: () => navigateTo('/app/finance/expenses')
    },
    {
      id: 'action-punch',
      category: 'Actions',
      title: 'Punch In / Out (Work Session)',
      subtitle: 'Manage active work session and clock status',
      icon: Clock,
      onSelect: () => navigateTo('/app/my-attendance')
    },
    {
      id: 'action-leave',
      category: 'Actions',
      title: 'Apply for Leave',
      subtitle: 'Submit leave request with quota verification',
      icon: Calendar,
      onSelect: () => navigateTo('/app/leave')
    },
    {
      id: 'action-invite',
      category: 'Actions',
      title: 'Invite New Employee',
      subtitle: 'Send onboarding email and generate security token',
      icon: UserPlus,
      onSelect: () => setInviteModalOpen(true)
    },
    {
      id: 'settings-org',
      category: 'Settings',
      title: 'Organization Settings',
      subtitle: 'Corporate profile, timezones, currency & legal identity',
      icon: Building2,
      onSelect: () => navigateTo('/app/settings/organization')
    },
    {
      id: 'settings-roles',
      category: 'Settings',
      title: 'Roles & Permissions Matrix',
      subtitle: 'Configure granular RBAC permissions across all modules',
      icon: ShieldCheck,
      onSelect: () => navigateTo('/app/settings/roles')
    },
  ];

  // Map employees into palette items
  const employeeItems: PaletteItem[] = employees.map(emp => ({
    id: `emp-${emp.id}`,
    category: 'Employees',
    title: emp.name,
    subtitle: `${emp.designation} • ${emp.department}`,
    icon: Users,
    badge: emp.status,
    onSelect: () => navigateTo(`/app/team/${emp.id}`)
  }));

  // Map projects into palette items
  const projectItems: PaletteItem[] = projects.map(p => ({
    id: `proj-${p.id}`,
    category: 'Projects',
    title: p.name,
    subtitle: `${p.clientName} • PM: ${p.managerName} • ${p.progress}% progress`,
    icon: FolderKanban,
    badge: p.health.replace('_', ' '),
    onSelect: () => navigateTo(`/app/projects/${p.id}`)
  }));

  // Map tasks into palette items
  const taskItems: PaletteItem[] = tasks.map(t => ({
    id: `task-${t.id}`,
    category: 'Tasks',
    title: t.title,
    subtitle: `${t.projectName} • Assigned: ${t.assigneeName} • ${t.status}`,
    icon: CheckSquare,
    badge: t.priority,
    onSelect: () => navigateTo('/app/tasks')
  }));

  // Map tickets into palette items
  const ticketItems: PaletteItem[] = tickets.map(tk => ({
    id: `tick-${tk.id}`,
    category: 'Tickets',
    title: `${tk.id}: ${tk.title}`,
    subtitle: `${tk.projectName} • ${tk.assignedToName} • ${tk.status}`,
    icon: LifeBuoy,
    badge: tk.priority,
    onSelect: () => navigateTo('/app/tickets')
  }));

  // Map leads into palette items
  const leadItems: PaletteItem[] = leads.map(l => ({
    id: `lead-${l.id}`,
    category: 'Leads',
    title: l.name,
    subtitle: `${l.companyName} • ₹${((l.value || l.budget || 0)).toLocaleString('en-IN')} (${l.stage})`,
    icon: Target,
    badge: l.stage,
    onSelect: () => navigateTo(`/app/crm/leads/${l.id}`)
  }));

  // Map companies into palette items
  const companyItems: PaletteItem[] = companies.map(c => ({
    id: `comp-${c.id}`,
    category: 'Companies',
    title: c.name,
    subtitle: `${c.industry} • ${c.location}`,
    icon: Building2,
    badge: c.ownerName,
    onSelect: () => navigateTo(`/app/crm/companies/${c.id}`)
  }));

  // Map deals into palette items
  const dealItems: PaletteItem[] = deals.map(d => ({
    id: `deal-${d.id}`,
    category: 'Deals',
    title: d.name,
    subtitle: `${d.companyName} • ₹${d.value.toLocaleString('en-IN')} (${d.probability}% prob)`,
    icon: Briefcase,
    badge: d.stage,
    onSelect: () => navigateTo('/app/sales/pipeline')
  }));

  const allItems = [
    ...baseItems,
    ...projectItems,
    ...taskItems,
    ...ticketItems,
    ...leadItems,
    ...companyItems,
    ...dealItems,
    ...employeeItems
  ];

  const filteredItems = query.trim() === ''
    ? allItems.slice(0, 10)
    : allItems.filter(item => {
        const text = `${item.title} ${item.subtitle || ''} ${item.category}`.toLowerCase();
        return text.includes(query.toLowerCase());
      }).slice(0, 15);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
        setCommandPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Static dark backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-[2px]"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-crm-card border border-crm-border rounded-lg shadow-modal overflow-hidden z-10 animate-in fade-in">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-crm-border bg-crm-surface/40">
          <Search className="w-4 h-4 text-turquoise flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-xs text-crm-text placeholder:text-crm-textDim focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-crm-surface text-crm-textMuted border border-crm-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-transparent">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-crm-textMuted">
              No matching commands or employees found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.onSelect();
                    setCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-xs transition-colors ${
                    isSelected 
                      ? 'bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder' 
                      : 'text-crm-textSecondary hover:bg-crm-surface hover:text-crm-text'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded ${isSelected ? 'bg-turquoise/15 text-turquoise' : 'bg-crm-surface text-crm-textMuted'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className={`font-medium truncate ${isSelected ? 'text-turquoise font-semibold' : 'text-crm-text'}`}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[10px] text-crm-textMuted truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {item.badge && (
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-crm-surface text-crm-textMuted border border-crm-border">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[10px] font-mono uppercase text-crm-textDim">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3 h-3 text-turquoise ml-1" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-crm-border bg-crm-surface/30 text-[10px] font-mono text-crm-textMuted">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-crm-card px-1 rounded border border-crm-border">↑</kbd> <kbd className="bg-crm-card px-1 rounded border border-crm-border">↓</kbd> Navigate</span>
            <span><kbd className="bg-crm-card px-1 rounded border border-crm-border">↵</kbd> Select</span>
          </div>
          <span>STAR CHAIN LABS OS</span>
        </div>
      </div>
    </div>
  );
};
