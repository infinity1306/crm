import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Briefcase, 
  Target, 
  FolderKanban, 
  CheckSquare, 
  CalendarClock, 
  MessageSquare, 
  Bell, 
  LifeBuoy, 
  Receipt, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Lock,
  Building2, 
  History, 
  Layers,
  ChevronDown, 
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Clock,
  Calendar,
  DollarSign,
  CreditCard,
  FileSpreadsheet,
  AlertTriangle,
  Zap,
  FileText,
  Activity
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { DashboardPersona, PERSONA_PROFILES } from '../../modules/dashboards/types';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeType?: 'primary' | 'neutral' | 'warning';
  isImplemented?: boolean;
  isPhase1?: boolean;
  allowedPersonas?: DashboardPersona[];
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  isImplemented?: boolean;
  isPhase1?: boolean;
  allowedPersonas?: DashboardPersona[];
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { 
    currentUser,
    isAdminAuthenticated,
    currentPath, 
    navigateTo, 
    isSidebarCollapsed, 
    setSidebarCollapsed,
    notifications,
    invitations,
    leads,
    deals,
    followUps,
    projects,
    tasks,
    tickets,
    attendanceRecords,
    leaveRequests,
    financeMetrics
  } = useCRM();

  // Resolve current active persona based on role and department
  const persona: DashboardPersona = React.useMemo(() => {
    if (currentUser.role === 'super_admin') return 'super_admin';
    if (currentUser.role === 'client') return 'client';

    if (currentUser.role === 'admin') {
      if (currentUser.department === 'HR') return 'hr';
      return 'admin';
    }

    if (currentUser.role === 'manager') {
      if (currentUser.department === 'Sales') return 'sales_manager';
      return 'manager';
    }

    // Standard employee
    if (currentUser.department === 'Sales') return 'sales_exec';
    if (currentUser.department === 'Finance') return 'finance';
    if (currentUser.department === 'HR') return 'hr';
    return 'developer';
  }, [currentUser.role, currentUser.department]);

  const activeProfile = PERSONA_PROFILES.find(p => p.id === persona) || PERSONA_PROFILES[0];

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'attendance-group': true,
    crm: true,
    sales: true,
    projects: true,
    people: true,
    communication: false,
    support: true,
    finance: true,
    analytics: true,
    settings: false,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const pendingInvitesCount = invitations.filter(i => i.status === 'pending').length;
  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;
  const activeLeadsCount = leads.filter(l => l.stage !== 'won' && l.stage !== 'lost').length;
  const activeDealsCount = deals.filter(d => d.stage !== 'lost').length;
  const pendingFollowUpsCount = followUps.filter(f => f.status !== 'completed').length;
  const activeProjectsCount = projects.filter(p => p.status === 'active').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'done').length;
  const openTicketsCount = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
  const workingNowCount = attendanceRecords.filter(r => r.date === '2026-09-21' && (r.sessionState === 'working' || r.sessionState === 'on_break')).length;
  const pendingLeaveCount = leaveRequests.filter(l => l.status === 'pending').length;
  const overdueTasksCount = tasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < '2026-09-21').length;
  const overdueInvoicesCount = financeMetrics.overdueInvoicesCount;
  const criticalTicketsCount = tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length;
  const overdueFollowUpsCount = followUps.filter(f => f.status === 'overdue').length;
  const urgentItemsCount = overdueTasksCount + overdueInvoicesCount + criticalTicketsCount + overdueFollowUpsCount + pendingLeaveCount;

  const groups: NavGroup[] = [
    {
      id: 'attendance-group',
      label: 'Attendance & Shifts',
      icon: Clock,
      isImplemented: true,
      allowedPersonas: ['super_admin', 'admin', 'hr', 'manager', 'developer', 'sales_exec', 'sales_manager', 'finance'],
      items: [
        { id: 'my-attendance', label: 'My Attendance & Clock', path: '/app/my-attendance', icon: Clock, isImplemented: true },
        { id: 'attendance-desk', label: 'Attendance Dashboard', path: '/app/attendance', icon: CalendarClock, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'hr', 'manager'] },
        { id: 'working-now', label: 'Working Now (Live Floor)', path: '/app/attendance/working-now', icon: UserCheck, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'hr', 'manager'], badge: workingNowCount > 0 ? workingNowCount : undefined, badgeType: 'primary' },
        { id: 'leave', label: 'Leave Desk', path: '/app/leave', icon: Calendar, isImplemented: true, badge: pendingLeaveCount > 0 ? pendingLeaveCount : undefined, badgeType: 'warning' },
      ]
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Users,
      isImplemented: true,
      allowedPersonas: ['super_admin', 'admin', 'sales_exec', 'sales_manager', 'finance'],
      items: [
        { id: 'leads', label: 'Leads', path: '/app/crm/leads', icon: Target, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'sales_exec', 'sales_manager'], badge: activeLeadsCount > 0 ? activeLeadsCount : undefined, badgeType: 'primary' },
        { id: 'contacts', label: 'Contacts', path: '/app/crm/contacts', icon: Users, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'sales_exec', 'sales_manager'] },
        { id: 'companies', label: 'Companies', path: '/app/crm/companies', icon: Building2, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'sales_exec', 'sales_manager', 'finance'] },
        { id: 'deals', label: 'Deals', path: '/app/crm/deals', icon: Briefcase, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'sales_exec', 'sales_manager', 'finance'], badge: activeDealsCount > 0 ? activeDealsCount : undefined, badgeType: 'neutral' },
      ]
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: Target,
      isImplemented: true,
      allowedPersonas: ['super_admin', 'sales_exec', 'sales_manager'],
      items: [
        { id: 'sales-overview', label: 'Overview', path: '/app/sales/overview', icon: BarChart3, isImplemented: true },
        { id: 'pipeline', label: 'Pipeline Board', path: '/app/sales/pipeline', icon: Briefcase, isImplemented: true },
        { id: 'activities', label: 'Activities', path: '/app/sales/activities', icon: History, isImplemented: true },
        { id: 'meetings', label: 'Meetings', path: '/app/sales/meetings', icon: CalendarClock, isImplemented: true },
        { id: 'followups', label: 'Follow-ups', path: '/app/sales/followups', icon: CheckSquare, isImplemented: true, badge: pendingFollowUpsCount > 0 ? pendingFollowUpsCount : undefined, badgeType: 'warning' },
      ]
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: MessageSquare,
      isImplemented: true,
      allowedPersonas: ['super_admin', 'admin', 'manager', 'sales_exec', 'sales_manager', 'client', 'developer', 'finance', 'hr'],
      items: [
        { id: 'messages', label: persona === 'client' ? 'Direct Messages' : 'Client Messages', path: '/app/communication/messages', icon: MessageSquare, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'sales_exec', 'sales_manager', 'client'] },
        { id: 'notifications', label: 'Notifications', path: '/app/notifications', icon: Bell, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'manager', 'sales_exec', 'sales_manager', 'developer', 'finance', 'hr'], badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined, badgeType: 'primary' },
      ]
    },
    {
      id: 'projects',
      label: 'Projects & Delivery',
      icon: FolderKanban,
      isImplemented: true,
      allowedPersonas: ['super_admin', 'admin', 'manager', 'developer', 'client'],
      items: [
        { id: 'projects-list', label: persona === 'client' ? 'Active Projects' : 'Projects', path: '/app/projects', icon: FolderKanban, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'manager', 'developer', 'client'], badge: activeProjectsCount > 0 ? activeProjectsCount : undefined, badgeType: 'primary' },
        { id: 'tasks', label: 'Tasks', path: '/app/tasks', icon: CheckSquare, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'manager', 'developer'], badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, badgeType: 'neutral' },
        { id: 'work-updates', label: 'Daily Updates', path: '/app/work-updates', icon: History, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'manager', 'developer'] },
      ]
    },
    {
      id: 'support',
      label: persona === 'client' ? 'Client Support' : 'Operations & Support',
      icon: LifeBuoy,
      isImplemented: true,
      allowedPersonas: ['super_admin', 'admin', 'manager', 'developer', 'client'],
      items: [
        { id: 'tickets', label: persona === 'client' ? 'Support Tickets' : 'Internal Tickets', path: '/app/tickets', icon: LifeBuoy, isImplemented: true, badge: openTicketsCount > 0 ? openTicketsCount : undefined, badgeType: 'warning' },
      ]
    },
    {
      id: 'people',
      label: 'People & Organization',
      icon: UserCheck,
      isImplemented: true,
      allowedPersonas: ['super_admin', 'admin', 'hr', 'manager', 'developer', 'sales_exec', 'sales_manager', 'finance'],
      items: [
        { id: 'employees', label: 'Employees Directory', path: '/app/team', icon: Users, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'hr', 'manager', 'developer', 'sales_exec', 'sales_manager', 'finance'], badge: pendingInvitesCount > 0 ? pendingInvitesCount : undefined, badgeType: 'neutral' },
      ]
    },
    {
      id: 'finance',
      label: persona === 'client' ? 'Billing & Invoices' : 'Finance & Billing',
      icon: DollarSign,
      isImplemented: true,
      allowedPersonas: ['super_admin', 'admin', 'finance', 'client'],
      items: [
        { id: 'finance-overview', label: 'Overview', path: '/app/finance', icon: DollarSign, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'finance'] },
        { id: 'revenue', label: 'Revenue Analytics', path: '/app/finance/revenue', icon: BarChart3, isImplemented: true, allowedPersonas: ['super_admin', 'finance'] },
        { id: 'invoices', label: persona === 'client' ? 'My Invoices' : 'Invoices', path: '/app/finance/invoices', icon: Receipt, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'finance', 'client'], badge: financeMetrics.invoicesCount > 0 ? financeMetrics.invoicesCount : undefined, badgeType: 'neutral' },
        { id: 'payments', label: 'Inward Payments', path: '/app/finance/payments', icon: CreditCard, isImplemented: true, allowedPersonas: ['super_admin', 'finance'] },
        { id: 'overdue', label: 'Overdue Recovery', path: '/app/finance/overdue', icon: AlertTriangle, isImplemented: true, allowedPersonas: ['super_admin', 'finance'], badge: financeMetrics.overdueInvoicesCount > 0 ? financeMetrics.overdueInvoicesCount : undefined, badgeType: 'warning' },
        { id: 'expenses', label: 'Expenses Desk', path: '/app/finance/expenses', icon: Receipt, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'finance', 'hr'], badge: financeMetrics.pendingExpensesCount > 0 ? financeMetrics.pendingExpensesCount : undefined, badgeType: 'primary' },
        { id: 'reports', label: 'Financial Reports', path: '/app/finance/reports', icon: FileSpreadsheet, isImplemented: true, allowedPersonas: ['super_admin', 'finance'] },
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Control',
      icon: BarChart3,
      isImplemented: true,
      allowedPersonas: ['super_admin', 'admin', 'manager', 'sales_manager', 'finance', 'hr'],
      items: [
        { id: 'exec-dashboard', label: 'Executive Dashboard', path: '/app/analytics/dashboard', icon: LayoutDashboard, isImplemented: true, allowedPersonas: ['super_admin', 'admin'] },
        { id: 'action-center', label: 'Action Center', path: '/app/action-center', icon: Zap, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'manager'], badge: urgentItemsCount > 0 ? urgentItemsCount : undefined, badgeType: 'warning' },
        { id: 'sales-analytics', label: 'Sales Analytics', path: '/app/analytics/sales', icon: Target, isImplemented: true, allowedPersonas: ['super_admin', 'sales_manager'] },
        { id: 'project-analytics', label: 'Project Analytics', path: '/app/analytics/projects', icon: FolderKanban, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'manager'] },
        { id: 'employee-analytics', label: 'Employee Performance', path: '/app/analytics/employees', icon: Users, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'hr', 'manager'] },
        { id: 'attendance-analytics', label: 'Attendance Analytics', path: '/app/analytics/attendance', icon: Clock, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'hr'] },
        { id: 'finance-analytics', label: 'Financial Analytics', path: '/app/analytics/finance', icon: DollarSign, isImplemented: true, allowedPersonas: ['super_admin', 'finance'] },
        { id: 'client-analytics', label: 'Client Analytics', path: '/app/analytics/clients', icon: Building2, isImplemented: true, allowedPersonas: ['super_admin', 'admin'] },
        { id: 'dept-analytics', label: 'Department Analytics', path: '/app/analytics/departments', icon: Activity, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'hr'] },
        { id: 'report-builder', label: 'Report Builder', path: '/app/analytics/reports', icon: FileText, isImplemented: true, allowedPersonas: ['super_admin', 'admin', 'sales_manager', 'finance', 'hr'] },
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      isPhase1: true,
      allowedPersonas: ['super_admin', 'admin', 'hr'],
      items: [
        { id: 'org-settings', label: 'Organization', path: '/app/settings/organization', icon: Building2, isPhase1: true, allowedPersonas: ['super_admin', 'admin', 'hr'] },
        { id: 'roles-permissions', label: 'Roles & Permissions', path: '/app/settings/roles', icon: ShieldCheck, isPhase1: true, allowedPersonas: ['super_admin', 'admin'] },
        { id: 'audit-log', label: 'Audit Log', path: '/app/audit', icon: History, isPhase1: true, allowedPersonas: ['super_admin', 'admin', 'hr'] },
        { id: 'design-system', label: 'Design System', path: '/app/design-system', icon: Layers, isPhase1: true, allowedPersonas: ['super_admin', 'admin'] },
      ]
    }
  ];

  const visibleGroups = React.useMemo(() => {
    return groups
      .filter(g => !g.allowedPersonas || g.allowedPersonas.includes(persona))
      .map(g => ({
        ...g,
        items: g.items.filter(i => !i.allowedPersonas || i.allowedPersonas.includes(persona))
      }))
      .filter(g => g.items.length > 0);
  }, [groups, persona]);

  const handleNavClick = (path: string) => {
    navigateTo(path);
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-crm-card border-r border-crm-border flex flex-col transition-all duration-200 z-30 select-none flex-shrink-0 sticky top-0",
        isSidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-crm-border flex-shrink-0">
        <div 
          onClick={() => navigateTo('/app/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
        >
          <div className="w-7 h-7 rounded bg-teal-950/60 border border-turquoise/40 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-turquoise" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-widest text-crm-text uppercase truncate">
                STAR CHAIN LABS
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-mono text-crm-textMuted tracking-wider truncate">
                  OS v1.0
                </span>
                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-turquoise/15 text-turquoise border border-turquoise/30 truncate max-w-[100px]">
                  {activeProfile.badge}
                </span>
              </div>
            </div>
          )}
        </div>

        {!isSidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            title="Collapse Sidebar"
            className="p-1 rounded text-crm-textMuted hover:text-crm-text hover:bg-crm-surface transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation Tree */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 no-scrollbar text-xs">
        {/* Top-Level Dashboard Links - Separate Admin & Employee */}
        <div className="mb-2 space-y-1">
          {/* Admin Dashboard button for managers and administrators */}
          {(currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'manager') && (
            <button
              onClick={() => handleNavClick('/app/admin-dashboard')}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-all group relative text-xs",
                (currentPath === '/app/admin-dashboard' || (currentPath === '/app/dashboard' && localStorage.getItem('scl_dashboard_view_mode') !== 'employee'))
                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold"
                  : "text-crm-textSecondary hover:text-crm-text hover:bg-crm-surface"
              )}
              title={isSidebarCollapsed ? "Admin Dashboard" : undefined}
            >
              <ShieldCheck className={cn(
                "w-4 h-4 flex-shrink-0",
                (currentPath === '/app/admin-dashboard' || (currentPath === '/app/dashboard' && localStorage.getItem('scl_dashboard_view_mode') !== 'employee'))
                  ? "text-amber-400"
                  : "text-crm-textMuted group-hover:text-crm-text"
              )} />
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">Admin Dashboard</span>
                  <span className={cn(
                    "text-[9px] uppercase px-1 py-0.2 rounded font-mono",
                    isAdminAuthenticated ? "bg-amber-500/20 text-amber-300" : "bg-red-500/20 text-red-300"
                  )}>
                    {isAdminAuthenticated ? 'Ops' : 'Lock'}
                  </span>
                </div>
              )}
              {(currentPath === '/app/admin-dashboard' || (currentPath === '/app/dashboard' && localStorage.getItem('scl_dashboard_view_mode') !== 'employee')) && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-amber-400 rounded-r" />
              )}
            </button>
          )}

          {/* Employee Workspace button for staff & self-service */}
          <button
            onClick={() => handleNavClick('/app/employee-dashboard')}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-all group relative text-xs",
              (currentPath === '/app/employee-dashboard' || (currentPath === '/app/dashboard' && localStorage.getItem('scl_dashboard_view_mode') === 'employee') || (currentUser.role === 'employee' && (currentPath === '/app' || currentPath === '/')))
                ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder font-semibold"
                : "text-crm-textSecondary hover:text-crm-text hover:bg-crm-surface"
            )}
            title={isSidebarCollapsed ? "Employee Workspace" : undefined}
          >
            <UserCheck className={cn(
              "w-4 h-4 flex-shrink-0",
              (currentPath === '/app/employee-dashboard' || (currentPath === '/app/dashboard' && localStorage.getItem('scl_dashboard_view_mode') === 'employee') || (currentUser.role === 'employee' && (currentPath === '/app' || currentPath === '/')))
                ? "text-turquoise"
                : "text-crm-textMuted group-hover:text-crm-text"
            )} />
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="truncate">Employee Workspace</span>
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-turquoise/20 text-turquoise font-mono">Self</span>
              </div>
            )}
            {(currentPath === '/app/employee-dashboard' || (currentPath === '/app/dashboard' && localStorage.getItem('scl_dashboard_view_mode') === 'employee') || (currentUser.role === 'employee' && (currentPath === '/app' || currentPath === '/'))) && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-turquoise rounded-r" />
            )}
          </button>
        </div>

        {/* Grouped Modules (Filtered dynamically by Active Role) */}
        {visibleGroups.map(group => {
          const isExpanded = expandedGroups[group.id] ?? true;
          const hasActiveChild = group.items.some(item => currentPath === item.path);

          if (isSidebarCollapsed) {
            // In collapsed mode, render primary icon trigger with tooltip
            const primaryItem = group.items[0];
            const isActive = hasActiveChild;
            return (
              <button
                key={group.id}
                onClick={() => handleNavClick(primaryItem.path)}
                className={cn(
                  "w-full flex items-center justify-center py-2.5 rounded-md transition-colors relative group",
                  isActive 
                    ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder" 
                    : "text-crm-textSecondary hover:text-crm-text hover:bg-crm-surface"
                )}
                title={group.label}
              >
                <group.icon className={cn("w-4 h-4", isActive ? "text-turquoise" : "text-crm-textMuted")} />
                {group.items.some(i => i.badge) && (
                  <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            );
          }

          return (
            <div key={group.id} className="pt-1.5">
              {/* Group Header Button */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded text-[11px] font-medium text-crm-textMuted hover:text-crm-textSecondary uppercase tracking-wider group transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <group.icon className="w-3.5 h-3.5 text-crm-textDim group-hover:text-crm-textMuted" />
                  <span className="truncate">{group.label}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-crm-textDim group-hover:text-crm-textMuted" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-crm-textDim group-hover:text-crm-textMuted" />
                )}
              </button>

              {/* Sub-Items */}
              {isExpanded && (
                <div className="mt-0.5 ml-2.5 pl-2 border-l border-crm-border/60 space-y-0.5">
                  {group.items.map(item => {
                    const isActive = currentPath === item.path || (item.path === '/app/team' && currentPath.startsWith('/app/team/'));
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.path)}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-normal transition-all group relative",
                          isActive
                            ? "bg-turquoise-subtle text-turquoise border border-turquoise-subtleBorder font-medium"
                            : "text-crm-textSecondary hover:text-crm-text hover:bg-crm-surface"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          <item.icon className={cn(
                            "w-3.5 h-3.5 flex-shrink-0",
                            isActive ? "text-turquoise" : "text-crm-textDim group-hover:text-crm-textMuted"
                          )} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {!item.isImplemented && (
                            <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-crm-surface text-crm-textDim border border-crm-border/50">
                              Phase 3
                            </span>
                          )}
                          {item.badge && (
                            <span className={cn(
                              "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                              item.badgeType === 'primary' && "bg-turquoise/20 text-turquoise font-medium",
                              item.badgeType === 'warning' && "bg-amber-950/50 text-amber-400 font-medium border border-amber-800/40",
                              !item.badgeType && "bg-crm-surface text-crm-textMuted"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-crm-border flex-shrink-0 bg-crm-card">
        {isSidebarCollapsed ? (
          <button
            onClick={() => setSidebarCollapsed(false)}
            title="Expand Sidebar"
            className="w-full flex items-center justify-center p-2 rounded text-crm-textMuted hover:text-crm-text hover:bg-crm-surface transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="px-2 py-1.5 rounded bg-crm-surface/50 border border-crm-border/60 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] text-crm-textSecondary font-medium tracking-tight truncate">
                Build Better Together.
              </p>
              <p className="text-[9px] font-mono text-crm-textMuted uppercase tracking-wider mt-0.5 truncate">
                STAR CHAIN LABS
              </p>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-turquoise/10 text-turquoise border border-turquoise/25 flex-shrink-0 ml-1">
              {activeProfile.badge}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
