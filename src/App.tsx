import React, { useEffect, useState } from 'react';
import { useCRM } from './context/CRMContext';
import { Sidebar } from './components/shell/Sidebar';
import { TopNav } from './components/shell/TopNav';
import { CommandPalette } from './components/shell/CommandPalette';
import { InviteEmployeeModal } from './modules/team/InviteEmployeeModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { OverviewDashboard } from './modules/overview/OverviewDashboard';
import { RoleBasedDashboard } from './modules/dashboards';
import { PortalAuthPage } from './modules/auth/PortalAuthPage';
import { TeamDirectory } from './modules/team/TeamDirectory';
import { EmployeeProfile } from './modules/team/EmployeeProfile';
import { RolesPermissions } from './modules/settings/RolesPermissions';
import { OrganizationSettings } from './modules/settings/OrganizationSettings';
import { MyProfile } from './modules/profile/MyProfile';
import { NotificationCenter } from './modules/notifications/NotificationCenter';
import { ActivityAuditLog } from './modules/activity/ActivityAuditLog';
import { DesignSystemShowcase } from './modules/design-system/DesignSystemShowcase';
import { ComingSoonModule } from './modules/placeholder/ComingSoonModule';

// Phase 2 CRM & Sales Modules
import { LeadsList } from './modules/crm/leads/LeadsList';
import { LeadDetail } from './modules/crm/leads/LeadDetail';
import { ContactsList } from './modules/crm/contacts/ContactsList';
import { CompaniesList } from './modules/crm/companies/CompaniesList';
import { CompanyDetail } from './modules/crm/companies/CompanyDetail';
import { DealsList } from './modules/crm/deals/DealsList';
import { SalesPipelineKanban } from './modules/sales/pipeline/SalesPipelineKanban';
import { SalesActivities } from './modules/sales/activities/SalesActivities';
import { MeetingsManager } from './modules/sales/meetings/MeetingsManager';
import { FollowUpManager } from './modules/sales/followups/FollowUpManager';
import { SalesDashboard } from './modules/sales/overview/SalesDashboard';
import { ClientCommunication } from './modules/communication/ClientCommunication';

// Phase 3 Delivery & Operations Modules
import { ProjectsList } from './modules/projects/ProjectsList';
import { ProjectDetail } from './modules/projects/ProjectDetail';
import { TasksWorkspace } from './modules/tasks/TasksWorkspace';
import { DailyWorkUpdatesFeed } from './modules/work-updates/DailyWorkUpdatesFeed';
import { InternalTicketsDesk } from './modules/tickets/InternalTicketsDesk';

// Phase 4 Attendance & Employee Operations Modules
import { AttendanceDashboard } from './modules/attendance/AttendanceDashboard';
import { WorkingNowFloor } from './modules/attendance/WorkingNowFloor';
import { EmployeeAttendanceProfile } from './modules/attendance/EmployeeAttendanceProfile';
import { MyAttendanceView } from './modules/attendance/MyAttendanceView';
import { LeaveManagementDesk } from './modules/leave/LeaveManagementDesk';

// Phase 5 Finance, Revenue & Billing Modules
import { FinanceOverview } from './modules/finance/FinanceOverview';
import { RevenueAnalytics } from './modules/finance/RevenueAnalytics';
import { InvoicesList } from './modules/finance/invoices/InvoicesList';
import { InvoiceDetailView } from './modules/finance/invoices/InvoiceDetailView';
import { OverdueInvoicesView } from './modules/finance/invoices/OverdueInvoicesView';
import { PaymentsList } from './modules/finance/payments/PaymentsList';
import { ExpensesDesk } from './modules/finance/expenses/ExpensesDesk';
import { FinancialReports } from './modules/finance/reports/FinancialReports';

// Phase 6 Analytics, Performance & Executive Control Modules
import {
  ExecutiveDashboard,
  SalesAnalytics,
  SalesPerformance,
  ProjectAnalytics,
  EmployeeAnalytics,
  EmployeePerformanceDetail,
  AttendanceAnalytics,
  FinanceAnalytics,
  ClientAnalytics,
  DepartmentAnalytics,
  ReportBuilder,
  ActionCenter
} from './modules/analytics';

import { Button } from './components/ui/Button';
import { Menu, X, Sparkles, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const { currentPath, navigateTo, currentUser, isAuthenticated } = useCRM();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  // Route Dispatcher
  const renderContent = () => {
    // Explicit Admin and Employee Dashboard Routes
    if (currentPath === '/app/admin-dashboard') {
      return <RoleBasedDashboard forcedMode="admin" />;
    }

    if (currentPath === '/app/employee-dashboard') {
      return <RoleBasedDashboard forcedMode="employee" />;
    }

    // Role-Based Default Landing
    if (currentPath === '/' || currentPath === '/app' || currentPath === '/app/dashboard' || currentPath === '/app/overview') {
      return <RoleBasedDashboard />;
    }

    if (currentPath === '/app/team') {
      return <TeamDirectory />;
    }

    if (currentPath.startsWith('/app/team/')) {
      const remaining = currentPath.replace('/app/team/', '');
      if (remaining.includes('/performance')) {
        const empId = remaining.replace('/performance', '');
        return <EmployeePerformanceDetail employeeId={empId} />;
      }
      if (remaining.includes('/attendance')) {
        const empId = remaining.replace('/attendance', '');
        return <EmployeeAttendanceProfile employeeId={empId} />;
      }
      return <EmployeeProfile employeeId={remaining} />;
    }

    if (currentPath === '/app/settings/roles') {
      return <RolesPermissions />;
    }

    if (currentPath === '/app/settings/organization') {
      return <OrganizationSettings />;
    }

    if (currentPath === '/app/profile') {
      return <MyProfile />;
    }

    if (currentPath === '/app/notifications') {
      return <NotificationCenter />;
    }

    if (currentPath === '/app/audit' || currentPath === '/app/activity') {
      return <ActivityAuditLog />;
    }

    if (currentPath === '/app/design-system') {
      return <DesignSystemShowcase />;
    }

    // Phase 2 CRM Routes
    if (currentPath === '/app/crm/leads') {
      return <LeadsList />;
    }

    if (currentPath.startsWith('/app/crm/leads/')) {
      const leadId = currentPath.replace('/app/crm/leads/', '');
      return <LeadDetail leadId={leadId} />;
    }

    if (currentPath === '/app/crm/contacts') {
      return <ContactsList />;
    }

    if (currentPath === '/app/crm/companies') {
      return <CompaniesList />;
    }

    if (currentPath.startsWith('/app/crm/companies/')) {
      const companyId = currentPath.replace('/app/crm/companies/', '');
      return <CompanyDetail companyId={companyId} />;
    }

    if (currentPath === '/app/crm/deals') {
      return <DealsList />;
    }

    // Phase 2 Sales Routes
    if (currentPath === '/app/sales/overview') {
      return <SalesDashboard />;
    }

    if (currentPath === '/app/sales/pipeline') {
      return <SalesPipelineKanban />;
    }

    if (currentPath === '/app/sales/activities') {
      return <SalesActivities />;
    }

    if (currentPath === '/app/sales/meetings') {
      return <MeetingsManager />;
    }

    if (currentPath === '/app/sales/followups') {
      return <FollowUpManager />;
    }

    // Phase 2 Communication Routes
    if (currentPath === '/app/communication/messages') {
      return <ClientCommunication />;
    }

    // Phase 3 Delivery & Operations Routes
    if (currentPath === '/app/projects' || currentPath === '/app/projects/all') {
      return <ProjectsList />;
    }

    if (currentPath.startsWith('/app/projects/')) {
      const remaining = currentPath.replace('/app/projects/', '');
      if (remaining === 'tasks') {
        return <TasksWorkspace />;
      }
      if (remaining.includes('/milestones')) {
        const pId = remaining.replace('/milestones', '');
        return <ProjectDetail projectId={pId} initialTab="milestones" />;
      }
      return <ProjectDetail projectId={remaining} />;
    }

    if (currentPath === '/app/tasks') {
      return <TasksWorkspace />;
    }

    if (currentPath === '/app/work-updates') {
      return <DailyWorkUpdatesFeed />;
    }

    if (currentPath === '/app/tickets' || currentPath.startsWith('/app/support/tickets')) {
      return <InternalTicketsDesk />;
    }

    // Phase 4 Attendance & Employee Operations Routes
    // External client stakeholders do not have punch clocks or staff shift tracking
    if (currentUser.role === 'client' && (
      currentPath.startsWith('/app/attendance') || 
      currentPath === '/app/my-attendance' || 
      currentPath === '/app/leave' || 
      currentPath === '/app/people/leave'
    )) {
      return (
        <div className="p-8 text-center max-w-md mx-auto my-16 bg-crm-card border border-crm-border rounded-xl shadow-modal">
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-crm-text mb-1">Access Restricted</h2>
          <p className="text-xs text-crm-textMuted mb-4 leading-relaxed">
            Attendance and internal staff shift tracking is restricted to internal Star Chain Labs employees. External client stakeholders do not have punch clocks.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigateTo('/app/dashboard')}>
            Return to Client Workspace
          </Button>
        </div>
      );
    }

    if (currentPath === '/app/attendance' || currentPath === '/app/people/attendance') {
      if (currentUser.role === 'employee') {
        return <MyAttendanceView />;
      }
      return <AttendanceDashboard />;
    }

    if (currentPath === '/app/attendance/working-now') {
      return <WorkingNowFloor />;
    }

    if (currentPath === '/app/leave' || currentPath === '/app/people/leave') {
      return <LeaveManagementDesk />;
    }

    if (currentPath === '/app/my-attendance') {
      return <MyAttendanceView />;
    }

    // Phase 5 Finance, Revenue & Billing Routes
    if (currentPath === '/app/finance' || currentPath === '/app/finance/overview') {
      return <FinanceOverview />;
    }

    if (currentPath === '/app/finance/revenue') {
      return <RevenueAnalytics />;
    }

    if (currentPath === '/app/finance/invoices') {
      return <InvoicesList />;
    }

    if (currentPath.startsWith('/app/finance/invoices/')) {
      const invoiceId = currentPath.replace('/app/finance/invoices/', '');
      return <InvoiceDetailView invoiceId={invoiceId} />;
    }

    if (currentPath === '/app/finance/payments') {
      return <PaymentsList />;
    }

    if (currentPath === '/app/finance/overdue') {
      return <OverdueInvoicesView />;
    }

    if (currentPath === '/app/finance/expenses') {
      return <ExpensesDesk />;
    }

    if (currentPath === '/app/finance/reports') {
      return <FinancialReports />;
    }

    // Phase 6 Analytics, Performance & Executive Control Routes
    if (currentPath === '/app/analytics' || currentPath === '/app/analytics/dashboard' || currentPath === '/app/analytics/executive') {
      return <ExecutiveDashboard />;
    }

    if (currentPath === '/app/analytics/sales') {
      return <SalesAnalytics />;
    }

    if (currentPath === '/app/analytics/sales-performance') {
      return <SalesPerformance />;
    }

    if (currentPath === '/app/analytics/projects') {
      return <ProjectAnalytics />;
    }

    if (currentPath === '/app/analytics/employees') {
      return <EmployeeAnalytics />;
    }

    if (currentPath === '/app/analytics/attendance') {
      return <AttendanceAnalytics />;
    }

    if (currentPath === '/app/analytics/finance') {
      return <FinanceAnalytics />;
    }

    if (currentPath === '/app/analytics/clients') {
      return <ClientAnalytics />;
    }

    if (currentPath === '/app/analytics/departments') {
      return <DepartmentAnalytics />;
    }

    if (currentPath === '/app/analytics/reports' || currentPath === '/app/reports') {
      return <ReportBuilder />;
    }

    if (currentPath === '/app/action-center') {
      return <ActionCenter />;
    }

    // Default fallback to Role-Based Dashboard
    return <RoleBasedDashboard />;
  };

  // Full-Screen Authentication Gateway for unauthenticated visitors
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-crm-bg text-crm-text flex items-center justify-center">
        <PortalAuthPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-crm-bg text-crm-text">
      {/* Desktop Persistent / Collapsible Sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 h-full bg-crm-card z-10">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Application Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="md:hidden h-14 bg-crm-card border-b border-crm-border flex items-center justify-between px-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded text-crm-textSecondary hover:text-crm-text hover:bg-crm-surface"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal-950/60 border border-turquoise/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-turquoise" />
            </div>
            <span className="text-xs font-bold tracking-widest text-crm-text uppercase">
              STAR CHAIN LABS
            </span>
          </div>
          <div className="w-8" />
        </div>

        {/* Desktop Top Navigation Bar */}
        <TopNav />

        {/* Main Workspace Scrolling Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-crm-bg">
          {renderContent()}
        </main>
      </div>

      {/* Global Command Palette & Modals */}
      <CommandPalette />
      <InviteEmployeeModal />
      <ToastContainer />
    </div>
  );
};
