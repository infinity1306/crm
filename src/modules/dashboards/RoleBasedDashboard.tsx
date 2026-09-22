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

// 9 Role Dashboard Views
import { SuperAdminDashboard } from './roles/SuperAdminDashboard';
import { AdminDashboard } from './roles/AdminDashboard';
import { ManagerDashboard } from './roles/ManagerDashboard';
import { SalesExecutiveDashboard } from './roles/SalesExecutiveDashboard';
import { SalesManagerDashboard } from './roles/SalesManagerDashboard';
import { DeveloperDashboard } from './roles/DeveloperDashboard';
import { FinanceDashboard } from './roles/FinanceDashboard';
import { HRDashboard } from './roles/HRDashboard';
import { ClientDashboard } from './roles/ClientDashboard';

export const RoleBasedDashboard: React.FC = () => {
  const { currentUser, employees, updateCurrentUser, switchUserRole, addToast } = useCRM();

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

  // Automatically synchronize active persona whenever currentUser role or department changes
  useEffect(() => {
    setActivePersona(initialPersona);
  }, [initialPersona]);

  const [isCustomizing, setIsCustomizing] = useState(false);

  // Per-persona layout preferences with localStorage caching & schema migration
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

  // Render role-specific dashboard content
  const renderDashboardView = () => {
    switch (activePersona) {
      case 'super_admin':
        return <SuperAdminDashboard enabledWidgets={enabledWidgets} />;
      case 'admin':
        return <AdminDashboard enabledWidgets={enabledWidgets} />;
      case 'manager':
        return <ManagerDashboard enabledWidgets={enabledWidgets} />;
      case 'sales_exec':
        return <SalesExecutiveDashboard enabledWidgets={enabledWidgets} />;
      case 'sales_manager':
        return <SalesManagerDashboard enabledWidgets={enabledWidgets} />;
      case 'developer':
        return <DeveloperDashboard enabledWidgets={enabledWidgets} />;
      case 'finance':
        return <FinanceDashboard enabledWidgets={enabledWidgets} />;
      case 'hr':
        return <HRDashboard enabledWidgets={enabledWidgets} />;
      case 'client':
        return <ClientDashboard enabledWidgets={enabledWidgets} />;
      default:
        return <DeveloperDashboard enabledWidgets={enabledWidgets} />;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
      {/* Role-Specific Header with Greeting, Telemetry & Persona Switcher */}
      <DashboardHeader
        persona={activePersona}
        onSelectPersona={handleSelectPersona}
        onOpenCustomizer={() => setIsCustomizing(true)}
      />

      {/* Role-Specific Priority Contextual Alerts */}
      <RoleAlertsBanner persona={activePersona} />

      {/* Dynamic Role Dashboard Layout */}
      {renderDashboardView()}

      {/* Dashboard Layout Customizer Modal */}
      <CustomizeDashboardModal
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        persona={activePersona}
        enabledWidgets={enabledWidgets}
        onToggleWidget={handleToggleWidget}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
};
