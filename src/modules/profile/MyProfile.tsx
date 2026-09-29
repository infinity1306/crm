import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  Sliders, 
  Save, 
  X, 
  Check, 
  KeyRound, 
  LogOut,
  AlertTriangle,
  CreditCard,
  Briefcase,
  Layers
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs } from '../../components/ui/Tabs';
import { EmployeeSegmentsView } from './EmployeeSegmentsView';
import { EmployeeProfileRecord } from '../../types/employeeProfile';

export const MyProfile: React.FC = () => {
  const { 
    currentUser, 
    updateCurrentUser, 
    sessions, 
    terminateOtherSessions, 
    addToast 
  } = useCRM();

  const [activeTab, setActiveTab] = useState('segments');

  const tabs = [
    { id: 'segments', label: '3 Segments: Personal, Bank & Job Details' },
    { id: 'preferences', label: 'Interface Preferences' },
    { id: 'security', label: 'Security & 2FA' },
    { id: 'sessions', label: 'Active Sessions', count: sessions.length },
  ];

  // Callback when segments are saved to Supabase
  const handleSegmentsSaved = (record: EmployeeProfileRecord) => {
    updateCurrentUser({
      name: record.personal.name,
      email: record.personal.email,
      phone: record.personal.mobileNumber,
      designation: record.job.designation,
      department: record.job.team as any,
      location: record.personal.currentAddress
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              My Profile & Personnel Segments
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30 uppercase">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Manage your personal data, bank payroll account, and job details. All fields are compulsory and synchronized to Supabase PostgreSQL.
          </p>
        </div>
      </div>

      {/* User Hero Banner */}
      <Card className="p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Avatar 
            name={currentUser.name} 
            size="xl" 
            status={currentUser.status} 
            className="w-18 h-18 text-xl" 
          />
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-lg font-bold text-crm-text">{currentUser.name}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-turquoise/15 text-turquoise border border-turquoise/25">
                ID: {currentUser.id.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-turquoise font-medium">
              {currentUser.designation} • {currentUser.department}
            </p>
            <p className="text-xs text-crm-textMuted max-w-xl leading-relaxed">
              {currentUser.bio || 'Employee at Star Chain Labs enterprise operations.'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-crm-textSecondary font-mono">
              <span>{currentUser.email}</span>
              <span>•</span>
              <span>{currentUser.phone}</span>
              <span>•</span>
              <span>{currentUser.location || 'Headquarters'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab: 3 Segments (Personal, Bank, Job Details) */}
      {activeTab === 'segments' && (
        <EmployeeSegmentsView
          targetEmployeeId={currentUser.id}
          onUpdateSuccess={handleSegmentsSaved}
          showCardHeader={true}
        />
      )}

      {/* Tab: Preferences */}
      {activeTab === 'preferences' && (
        <Card className="p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
            Interface & Notification Preferences
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-crm-border/60">
              <div>
                <span className="font-medium text-crm-text">CRM Theme Foundation</span>
                <p className="text-[11px] text-crm-textMuted">Locked high-contrast near-black palette with muted turquoise.</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-crm-surface text-turquoise font-mono text-[11px] border border-crm-border">
                DARK (LOCKED)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-crm-border/60">
              <div>
                <span className="font-medium text-crm-text">Date & Timestamp Format</span>
                <p className="text-[11px] text-crm-textMuted">Standard operational format (YYYY-MM-DD HH:mm).</p>
              </div>
              <span className="font-mono text-crm-text text-[11px]">ISO 8601</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-medium text-crm-text">Direct Mention Email Forwarding</span>
                <p className="text-[11px] text-crm-textMuted">Forward high-priority mentions and team invites to your inbox.</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded bg-crm-surface border-crm-border text-turquoise focus:ring-0 cursor-pointer" />
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <Card className="p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
            Security & Authentication Baseline
          </h3>
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-300">Account Protected by Enterprise SSO</h4>
                <p className="text-crm-textSecondary text-[11px] mt-0.5 leading-relaxed">
                  Your identity is authenticated against Star Chain Labs primary SAML/OIDC directory. Password rotations and multifactor enforcement are handled at the gateway tier.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-crm-border">
              <div>
                <span className="font-medium text-crm-text">Two-Factor Authentication (2FA)</span>
                <p className="text-[11px] text-crm-textMuted">Hardware security keys & TOTP authenticator app active.</p>
              </div>
              <span className="text-emerald-400 font-mono text-xs">ACTIVE</span>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-crm-border">
              <div>
                <span className="font-medium text-crm-text">Session Timeout Duration</span>
                <p className="text-[11px] text-crm-textMuted">Automatically locks console after idle inactivity.</p>
              </div>
              <span className="font-mono text-crm-text text-xs">12 Hours</span>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Sessions */}
      {activeTab === 'sessions' && (
        <Card className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary">
                Authorized Operating Sessions
              </h3>
              <p className="text-[11px] text-crm-textMuted mt-0.5">
                Devices currently signed in to your Star Chain Labs employee account.
              </p>
            </div>
            <Button
              variant="danger"
              size="xs"
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              onClick={terminateOtherSessions}
            >
              Terminate Other Sessions
            </Button>
          </div>

          <div className="space-y-3">
            {sessions.map(s => (
              <div
                key={s.id}
                className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded bg-crm-card border border-crm-border text-turquoise">
                    {s.device.includes('iPhone') ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Laptop className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-crm-text">{s.device}</span>
                      {s.isCurrent && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                          CURRENT SESSION
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-crm-textMuted font-mono mt-0.5">
                      {s.browser} • {s.os} • {s.ipAddress} ({s.location})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-crm-textSecondary font-mono block">
                    {s.lastActive}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
