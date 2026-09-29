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
  AlertTriangle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs } from '../../components/ui/Tabs';

export const MyProfile: React.FC = () => {
  const { 
    currentUser, 
    updateCurrentUser, 
    sessions, 
    terminateOtherSessions, 
    addToast 
  } = useCRM();

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    designation: currentUser.designation,
    department: currentUser.department,
    bio: currentUser.bio || '',
    timezone: currentUser.timezone,
    location: currentUser.location || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      updateCurrentUser(formData);
      setIsLoading(false);
      setIsEditing(false);
    }, 400);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      designation: currentUser.designation,
      department: currentUser.department,
      bio: currentUser.bio || '',
      timezone: currentUser.timezone,
      location: currentUser.location || ''
    });
    setIsEditing(false);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'work', label: 'Work Information' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'security', label: 'Security & 2FA' },
    { id: 'sessions', label: 'Active Sessions', count: sessions.length },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              My Profile & Settings
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30 uppercase">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Manage your personal profile, credentials, notifications and active device sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" isLoading={isLoading} onClick={handleSave} leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* User Hero Banner */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Avatar 
            name={currentUser.name} 
            size="xl" 
            status={currentUser.status} 
            className="w-18 h-18 text-xl" 
          />
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <h2 className="text-lg font-bold text-crm-text">{currentUser.name}</h2>
            <p className="text-xs text-turquoise font-medium">
              {currentUser.designation} • {currentUser.department}
            </p>
            <p className="text-xs text-crm-textMuted max-w-xl leading-relaxed">
              {currentUser.bio}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-crm-textSecondary font-mono">
              <span>{currentUser.email}</span>
              <span>•</span>
              <span>{currentUser.phone}</span>
              <span>•</span>
              <span>{currentUser.location}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab: Personal Information */}
      {activeTab === 'personal' && (
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary">
              Personal Information
            </h3>
            {isEditing && <span className="text-[11px] text-turquoise">Editing Mode</span>}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Input
                label="Work Email (SSO Principal)"
                disabled
                value={formData.email}
                helperText="Email is bound to Star Chain Labs Google Workspace"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Phone Number"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="Primary Work Location"
                disabled={!isEditing}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider mb-1">
                Executive Bio / Summary
              </label>
              <textarea
                disabled={!isEditing}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full p-2.5 rounded-md bg-crm-surface border border-crm-border text-xs text-crm-text placeholder:text-crm-textDim focus:outline-none focus:border-turquoise disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-3 border-t border-crm-border">
                <Button variant="ghost" size="sm" type="button" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Card>
      )}

      {/* Tab: Work Information */}
      {activeTab === 'work' && (
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
            Organizational Employment Context
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <span className="text-crm-textMuted block text-[11px]">Assigned Department</span>
              <span className="font-medium text-crm-text">{currentUser.department}</span>
            </div>
            <div>
              <span className="text-crm-textMuted block text-[11px]">Official Designation</span>
              <span className="font-medium text-crm-text">{currentUser.designation}</span>
            </div>
            <div>
              <span className="text-crm-textMuted block text-[11px]">System Role</span>
              <span className="font-mono text-turquoise uppercase">{currentUser.role}</span>
            </div>
            <div>
              <span className="text-crm-textMuted block text-[11px]">Date Joined</span>
              <span className="font-mono text-crm-text">{currentUser.joinedDate}</span>
            </div>
            <div>
              <span className="text-crm-textMuted block text-[11px]">Direct Reports</span>
              <span className="font-medium text-crm-text">{currentUser.directReports} team members</span>
            </div>
            <div>
              <span className="text-crm-textMuted block text-[11px]">Work Arrangement</span>
              <span className="font-medium text-crm-text">Hybrid (Bengaluru HQ)</span>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Preferences */}
      {activeTab === 'preferences' && (
        <Card>
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
        <Card>
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
        <Card>
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
