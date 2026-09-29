import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  ShieldCheck, 
  Check, 
  X, 
  RotateCcw, 
  Save, 
  AlertCircle, 
  Info,
  Users,
  Target,
  FolderKanban,
  CalendarClock,
  MessageSquare,
  Receipt,
  Settings,
  Shield
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Role, PermissionModule, PermissionAction } from '../../types';

export const RolesPermissions: React.FC = () => {
  const { 
    rolePermissions, 
    updateRolePermissions, 
    resetRolePermissions, 
    addToast 
  } = useCRM();

  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const roles: { id: Role; label: string; description: string; count: number }[] = [
    { 
      id: 'super_admin', 
      label: 'Super Admin', 
      description: 'Unrestricted system-wide access to every module, API, and credential configuration.',
      count: 2
    },
    { 
      id: 'admin', 
      label: 'Admin', 
      description: 'Full organizational authority over team directory, audit logs, and settings.',
      count: 4
    },
    { 
      id: 'manager', 
      label: 'Manager', 
      description: 'Departmental authority to review tasks, manage leads, and approve workflows.',
      count: 8
    },
    { 
      id: 'employee', 
      label: 'Employee', 
      description: 'Standard access to assigned operational work, personal profile, and team directory.',
      count: 108
    },
    { 
      id: 'client', 
      label: 'Client', 
      description: 'Restricted external view for project milestones, deliverables, and billing.',
      count: 5
    },
  ];

  const modules: { id: PermissionModule; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'employees', label: 'Employees & People', icon: Users, description: 'Directory, onboarding, profiles, and reporting structure' },
    { id: 'crm', label: 'CRM & Leads', icon: Target, description: 'Inbound leads, client contacts, companies, and deals' },
    { id: 'sales', label: 'Sales & Pipeline', icon: Target, description: 'Sales pipeline stages, activities, calls, and performance' },
    { id: 'projects', label: 'Projects & Tasks', icon: FolderKanban, description: 'Project workspaces, task assignments, and milestones' },
    { id: 'attendance', label: 'Attendance & Time', icon: CalendarClock, description: 'Punch logs, timesheets, and leave approvals' },
    { id: 'communication', label: 'Communication', icon: MessageSquare, description: 'Internal messages, announcements, and notification center' },
    { id: 'finance', label: 'Finance & Invoices', icon: Receipt, description: 'Client invoices, payment status, and runway telemetry' },
    { id: 'settings', label: 'Settings & Audit', icon: Settings, description: 'Organization configuration, role matrix, and compliance logs' },
  ];

  const actions: { id: PermissionAction; label: string }[] = [
    { id: 'view', label: 'View' },
    { id: 'create', label: 'Create' },
    { id: 'update', label: 'Update' },
    { id: 'delete', label: 'Delete' },
    { id: 'approve', label: 'Approve' },
    { id: 'export', label: 'Export' },
    { id: 'manage', label: 'Manage' },
  ];

  const handleToggle = (module: PermissionModule, action: PermissionAction) => {
    const currentValue = rolePermissions[selectedRole]?.[module]?.[action] ?? false;
    updateRolePermissions(selectedRole, module, action, !currentValue);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    setHasUnsavedChanges(false);
    addToast({
      type: 'success',
      title: 'Permissions Saved',
      message: `Granular access matrix updated for role: ${selectedRole.toUpperCase().replace('_', ' ')}`
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              Roles & Permissions Matrix
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30 uppercase">
              RBAC Engine
            </span>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Configure granular resource access across every CRM module for Star Chain Labs roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => {
              resetRolePermissions();
              setHasUnsavedChanges(false);
            }}
          >
            Reset Defaults
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            {hasUnsavedChanges ? 'Save Changes *' : 'Saved'}
          </Button>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {roles.map(r => {
          const isSelected = r.id === selectedRole;
          return (
            <div
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-crm-surface border-turquoise/50 shadow-card'
                  : 'bg-crm-card border-crm-border hover:border-crm-borderHover hover:bg-crm-surface/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  isSelected ? 'text-turquoise' : 'text-crm-text'
                }`}>
                  {r.label}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-crm-card border border-crm-border text-crm-textMuted">
                  {r.count} users
                </span>
              </div>
              <p className="text-[11px] text-crm-textSecondary line-clamp-2 leading-relaxed">
                {r.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Permission Matrix Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-crm-border bg-crm-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-turquoise" />
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                Matrix Policy for: <span className="text-turquoise capitalize">{selectedRole.replace('_', ' ')}</span>
              </h2>
              <p className="text-[11px] text-crm-textMuted">
                Click any cell to toggle capability. Changes apply in real time across the session.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <Check className="w-2.5 h-2.5" />
              </span>
              <span className="text-crm-textSecondary text-[11px]">Permitted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-crm-surface border border-crm-border flex items-center justify-center text-crm-textDim">
                <X className="w-2.5 h-2.5" />
              </span>
              <span className="text-crm-textSecondary text-[11px]">Denied</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-crm-surface/80 border-b border-crm-border text-crm-textSecondary uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3 font-semibold w-72">Module / Resource</th>
                {actions.map(act => (
                  <th key={act.id} className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                    {act.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-border/60 bg-crm-card">
              {modules.map(mod => {
                const Icon = mod.icon;
                const permissions = rolePermissions[selectedRole]?.[mod.id] || {};

                return (
                  <tr key={mod.id} className="hover:bg-crm-surface/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded bg-crm-surface text-crm-textMuted mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-turquoise" />
                        </div>
                        <div>
                          <div className="font-semibold text-crm-text">{mod.label}</div>
                          <div className="text-[10px] text-crm-textMuted leading-tight">{mod.description}</div>
                        </div>
                      </div>
                    </td>

                    {actions.map(act => {
                      const isAllowed = permissions[act.id] ?? false;
                      const isSuperAdmin = selectedRole === 'super_admin';

                      return (
                        <td key={act.id} className="px-4 py-3.5 text-center">
                          <button
                            disabled={isSuperAdmin}
                            onClick={() => handleToggle(mod.id, act.id)}
                            title={`${isAllowed ? 'Revoke' : 'Grant'} ${act.label} on ${mod.label}`}
                            className={`w-7 h-7 mx-auto rounded flex items-center justify-center transition-all ${
                              isAllowed
                                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/40'
                                : 'bg-crm-surface text-crm-textDim border border-crm-border hover:border-crm-borderHover hover:text-crm-textMuted'
                            } ${isSuperAdmin ? 'cursor-not-allowed opacity-90' : 'cursor-pointer active:scale-95'}`}
                          >
                            {isAllowed ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-crm-border bg-crm-surface/30 flex items-center gap-2 text-xs text-crm-textMuted">
          <Info className="w-4 h-4 text-turquoise flex-shrink-0" />
          <span>
            Security Policy: Frontend permission checks govern UI element visibility. The backend API enforces authorization tokens on every mutation.
          </span>
        </div>
      </Card>
    </div>
  );
};
