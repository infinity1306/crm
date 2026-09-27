import React, { useState, useEffect, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  DashboardPersona, 
  WidgetId, 
  DEFAULT_LAYOUTS, 
  PERSONA_PROFILES, 
  PersonaProfile 
} from './types';
import { DashboardHeader } from './components/DashboardHeader';
import { RoleAlertsBanner } from './components/RoleAlertsBanner';
import { CustomizeDashboardModal } from './components/CustomizeDashboardModal';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, UserCheck, Sparkles, SlidersHorizontal, Lock, Unlock } from 'lucide-react';
import { AdminLoginGate } from './components/AdminLoginGate';
import { EmployeeLoginGate } from './components/EmployeeLoginGate';
import { cn } from '../../utils/cn';

// Dedicated Dashboards
import { AdminDashboard } from './roles/AdminDashboard';
import { EmployeeDashboard } from './roles/EmployeeDashboard';

// Role-Specific Views
import { SuperAdminDashboard } from './roles/SuperAdminDashboard';
import { ManagerDashboard } from './roles/ManagerDashboard';
import { SalesExecutiveDashboard } from './roles/SalesExecutiveDashboard';
import { SalesManagerDashboard } from './roles/SalesManagerDashboard';
import { DeveloperDashboard } from './roles/DeveloperDashboard';
import { FinanceDashboard } from './roles/FinanceDashboard';
import { HRDashboard } from './roles/HRDashboard';
import { ClientDashboard } from './roles/ClientDashboard';

interface RoleBasedDashboardProps {
  forcedMode?: 'admin' | 'employee';
}

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ forcedMode }) => {
  const { currentUser, employees, updateCurrentUser, switchUserRole, addToast, isAdminAuthenticated, adminLogout, isEmployeeAuthenticated } = useCRM();

  // Resolve native initial persona from current user attributes
  const initialPersona = useMemo<DashboardPersona>(() => {
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

  const [activePersona, setActivePersona] = useState<DashboardPersona>(() => {
    const saved = localStorage.getItem('scl_active_persona');
    return (saved as DashboardPersona) || initialPersona;
  });

  // Top-level Dashboard Mode: 'admin' vs 'employee'
  const [dashboardMode, setDashboardMode] = useState<'admin' | 'employee'>(() => {
    if (forcedMode) return forcedMode;
    const saved = localStorage.getItem('scl_dashboard_view_mode');
    if (saved === 'admin' || saved === 'employee') return saved;
    if (currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'manager') {
      return 'admin';
    }
    return 'employee';
  });

  // Keep in sync with forced mode or role changes
  useEffect(() => {
    if (forcedMode) {
      setDashboardMode(forcedMode);
    }
  }, [forcedMode]);

  useEffect(() => {
    localStorage.setItem('scl_dashboard_view_mode', dashboardMode);
  }, [dashboardMode]);

  // Automatically synchronize active persona whenever currentUser role or department changes
  useEffect(() => {
    setActivePersona(initialPersona);
  }, [initialPersona]);

  const [isCustomizing, setIsCustomizing] = useState(false);

  // Per-persona layout preferences
  const [layouts, setLayouts] = useState<Record<DashboardPersona, WidgetId[]>>(() => {
    const saved = localStorage.getItem('scl_dashboard_layouts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const internalPersonas: DashboardPersona[] = [
          'super_admin', 'admin', 'manager', 'sales_exec', 'sales_manager', 'developer', 'finance', 'hr'
        ];
        internalPersonas.forEach(p => {
          if (parsed[p] && !parsed[p].includes('personal_attendance')) {
            parsed[p] = ['personal_attendance', ...parsed[p]];
          } else if (!parsed[p]) {
            parsed[p] = DEFAULT_LAYOUTS[p];
          }
        });
        if (parsed.client) {
          parsed.client = parsed.client.filter((w: string) => w !== 'personal_attendance');
        } else {
          parsed.client = DEFAULT_LAYOUTS.client;
        }
        return parsed;
      } catch (e) {
        return DEFAULT_LAYOUTS;
      }
    }
    return DEFAULT_LAYOUTS;
  });

  useEffect(() => {
    localStorage.setItem('scl_active_persona', activePersona);
  }, [activePersona]);

  useEffect(() => {
    localStorage.setItem('scl_dashboard_layouts', JSON.stringify(layouts));
  }, [layouts]);

  // When persona is changed, update active user identity to the sample employee for that persona
  const handleSelectPersona = (newPersona: DashboardPersona) => {
    setActivePersona(newPersona);
    const targetProfile = PERSONA_PROFILES.find(p => p.id === newPersona);

    if (targetProfile) {
      const matchedEmp = employees.find(e => e.id === targetProfile.sampleEmployeeId);
      if (matchedEmp) {
        updateCurrentUser({
          name: matchedEmp.name,
          role: targetProfile.role,
          department: targetProfile.department,
          designation: matchedEmp.designation,
          avatar: matchedEmp.avatar
        });
      } else {
        switchUserRole(targetProfile.role);
        updateCurrentUser({
          department: targetProfile.department
        });
      }

      addToast({
        type: 'info',
        title: 'Persona Activated',
        message: `Now viewing workspace as ${targetProfile.label}`
      });
    }
  };

  const handleToggleWidget = (widgetId: WidgetId) => {
    setLayouts(prev => {
      const currentWidgets = prev[activePersona] || DEFAULT_LAYOUTS[activePersona];
      const nextWidgets = currentWidgets.includes(widgetId)
        ? currentWidgets.filter(id => id !== widgetId)
        : [...currentWidgets, widgetId];

      return {
        ...prev,
        [activePersona]: nextWidgets
      };
    });
  };

  const handleResetDefaults = () => {
    setLayouts(prev => ({
      ...prev,
      [activePersona]: DEFAULT_LAYOUTS[activePersona]
    }));
    addToast({
      type: 'info',
      title: 'Layout Reset',
      message: `Default layout restored for ${activePersona.replace('_', ' ')}.`
    });
  };

  const enabledWidgets = layouts[activePersona] || DEFAULT_LAYOUTS[activePersona];

  // Render role-specific admin dashboard content
  const renderAdminRoleView = () => {
    switch (activePersona) {
      case 'super_admin':
        return <SuperAdminDashboard enabledWidgets={enabledWidgets} />;
      case 'admin':
        return (
          <AdminDashboard 
            enabledWidgets={enabledWidgets} 
            onSwitchToEmployee={() => setDashboardMode('employee')} 
            onLockSession={adminLogout}
          />
        );
      case 'manager':
        return <ManagerDashboard enabledWidgets={enabledWidgets} />;
      case 'sales_manager':
        return <SalesManagerDashboard enabledWidgets={enabledWidgets} />;
      case 'hr':
        return <HRDashboard enabledWidgets={enabledWidgets} />;
      default:
        return (
          <AdminDashboard 
            enabledWidgets={enabledWidgets} 
            onSwitchToEmployee={() => setDashboardMode('employee')} 
            onLockSession={adminLogout}
          />
        );
    }
  };

  if (currentUser.role === 'client') {
    return (
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
        <ClientDashboard enabledWidgets={enabledWidgets} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)] space-y-6">
      {/* SEPARATE DASHBOARD SELECTOR BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-crm-card border border-crm-border p-2.5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          {/* Segmented Control */}
          <div className="inline-flex p-1 bg-crm-surface rounded-lg border border-crm-border/80 shadow-inner">
            <button
              onClick={() => {
                setDashboardMode('admin');
                addToast({
                  type: 'info',
                  title: 'Admin Dashboard Activated',
                  message: 'Viewing organization-wide telemetry, live workforce floor & approvals desk.'
                });
              }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                dashboardMode === 'admin'
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "text-crm-textMuted hover:text-crm-text hover:bg-crm-surfaceHover"
              )}
            >
              {isAdminAuthenticated ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isAdminAuthenticated ? '👑 Admin Dashboard' : '🔒 Admin Portal (Login)'}</span>
            </button>

            <button
              onClick={() => {
                setDashboardMode('employee');
                addToast({
                  type: 'info',
                  title: 'Employee Dashboard Activated',
                  message: 'Viewing your personal shift clock, tasks, deliverables & leave quota.'
                });
              }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                dashboardMode === 'employee'
                  ? "bg-turquoise text-slate-950 font-bold shadow-md shadow-turquoise/20"
                  : "text-crm-textMuted hover:text-crm-text hover:bg-crm-surfaceHover"
              )}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>👤 Employee Dashboard</span>
            </button>
          </div>

          <Badge 
            variant={
              dashboardMode === 'admin' 
                ? (isAdminAuthenticated ? "warning" : "error") 
                : (isEmployeeAuthenticated ? "primary" : "warning")
            }
            className="text-[10px] hidden sm:inline-flex uppercase font-mono px-2 py-0.5"
          >
            {dashboardMode === 'admin' 
              ? (isAdminAuthenticated ? 'Admin Clearance Active' : 'Access Locked • Login Required') 
              : (isEmployeeAuthenticated ? `Staff Active: ${currentUser.name}` : 'Staff Terminal Locked • Sign In Required')}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-crm-textMuted justify-between sm:justify-end">
          <span className="hidden md:inline">Current View:</span>
          <span className="font-semibold text-crm-text bg-crm-surface px-2.5 py-1 rounded border border-crm-border/60">
            {dashboardMode === 'admin' ? 'Executive Operations & Attendance Approvals' : 'Personal Attendance, Tasks & Daily Standup'}
          </span>
        </div>
      </div>

      {/* DASHBOARD CONTENT DISPATCHER */}
      {dashboardMode === 'employee' ? (
        !isEmployeeAuthenticated ? (
          /* EMPLOYEE SIGN IN GATEWAY */
          <EmployeeLoginGate 
            onSuccess={() => {
              setDashboardMode('employee');
            }}
            onSwitchToAdmin={() => {
              setDashboardMode('admin');
            }}
          />
        ) : (
          /* DEDICATED EMPLOYEE DASHBOARD */
          <EmployeeDashboard onSwitchToAdmin={() => setDashboardMode('admin')} />
        )
      ) : !isAdminAuthenticated ? (
        /* ADMIN LOGIN GATEWAY FOR ACCESS CONTROL */
        <AdminLoginGate 
          onSuccess={() => {
            setDashboardMode('admin');
          }}
          onCancel={() => {
            setDashboardMode('employee');
          }}
        />
      ) : (
        /* DEDICATED ADMIN DASHBOARD */
        <div>
          {/* Admin Header with Persona Telemetry & Customizer */}
          <DashboardHeader
            persona={activePersona}
            onSelectPersona={handleSelectPersona}
            onOpenCustomizer={() => setIsCustomizing(true)}
          />

          {/* Contextual Alerts */}
          <RoleAlertsBanner persona={activePersona} />

          {/* Admin Role View */}
          {renderAdminRoleView()}

          {/* Layout Customizer */}
          <CustomizeDashboardModal
            isOpen={isCustomizing}
            onClose={() => setIsCustomizing(false)}
            persona={activePersona}
            enabledWidgets={enabledWidgets}
            onToggleWidget={handleToggleWidget}
            onResetDefaults={handleResetDefaults}
          />
        </div>
      )}
    </div>
  );
};
