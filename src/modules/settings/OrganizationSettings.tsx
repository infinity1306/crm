import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Building2, 
  Save, 
  RotateCcw, 
  Globe, 
  Coins, 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  Sparkles,
  ShieldCheck,
  Upload
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export const OrganizationSettings: React.FC = () => {
  const { organization, updateOrganization } = useCRM();

  const [formData, setFormData] = useState({ ...organization });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateOrganization(formData);
      setIsSaving(false);
    }, 400);
  };

  const handleReset = () => {
    setFormData({ ...organization });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              Organization Profile
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30 uppercase">
              Global Meta
            </span>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Configure legal identity, operational timezones, and corporate workspace preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            Discard
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSaving}
            onClick={handleSubmit}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Identity Card */}
        <Card>
          <div className="flex items-center gap-2 pb-3 border-b border-crm-border mb-4">
            <Building2 className="w-4 h-4 text-turquoise" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
              General Organization Identity
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-lg bg-crm-surface border border-crm-border flex items-center justify-center text-turquoise flex-shrink-0">
                <Sparkles className="w-8 h-8 text-turquoise" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-crm-text">Workspace Logo Emblem</div>
                <div className="text-[11px] text-crm-textMuted">Geometric 4-point SVG Star emblem active.</div>
                <div className="pt-1">
                  <Button variant="secondary" size="xs" leftIcon={<Upload className="w-3 h-3" />}>
                    Upload New Asset
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Organization Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Input
                label="Industry Domain"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Size"
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              />

              <Input
                label="Corporate Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                leftIcon={<Globe className="w-3.5 h-3.5" />}
              />
            </div>
          </div>
        </Card>

        {/* Regional & Financial Preferences */}
        <Card>
          <div className="flex items-center gap-2 pb-3 border-b border-crm-border mb-4">
            <Coins className="w-4 h-4 text-turquoise" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
              Regional & Financial Localization
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Country of Incorporation"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              options={[
                { value: 'India', label: 'India' },
                { value: 'Singapore', label: 'Singapore' },
                { value: 'United States', label: 'United States' },
                { value: 'United Arab Emirates', label: 'United Arab Emirates' },
                { value: 'United Kingdom', label: 'United Kingdom' },
              ]}
            />

            <Select
              label="Operational Currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              options={[
                { value: 'INR (₹)', label: 'INR — Indian Rupee (₹)' },
                { value: 'USD ($)', label: 'USD — US Dollar ($)' },
                { value: 'EUR (€)', label: 'EUR — Euro (€)' },
                { value: 'SGD (S$)', label: 'SGD — Singapore Dollar (S$)' },
                { value: 'AED (د.إ)', label: 'AED — UAE Dirham (د.إ)' },
              ]}
            />

            <Select
              label="Master Timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              options={[
                { value: 'Asia/Kolkata (IST - UTC+05:30)', label: 'Asia/Kolkata (IST)' },
                { value: 'Asia/Singapore (SGT - UTC+08:00)', label: 'Asia/Singapore (SGT)' },
                { value: 'America/New_York (EST - UTC-05:00)', label: 'America/New_York (EST)' },
                { value: 'Europe/London (GMT - UTC+00:00)', label: 'Europe/London (GMT)' },
                { value: 'Asia/Dubai (GST - UTC+04:00)', label: 'Asia/Dubai (GST)' },
              ]}
            />
          </div>
        </Card>

        {/* Corporate Communication */}
        <Card>
          <div className="flex items-center gap-2 pb-3 border-b border-crm-border mb-4">
            <Mail className="w-4 h-4 text-turquoise" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
              Primary Administrative Contacts
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Admin Contact Email"
              type="email"
              value={formData.primaryContact}
              onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
            />

            <Input
              label="Technical Support Email"
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
            />
          </div>
        </Card>

        {/* Danger Zone */}
        <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-red-400">Export All Organizational Records</h4>
              <p className="text-[11px] text-crm-textMuted mt-0.5">
                Generate a cryptographically signed snapshot of all employees, logs, and metadata.
              </p>
            </div>
            <Button variant="danger" size="xs" type="button" onClick={() => alert('Exporting full organizational archive...')}>
              Download Snapshot
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
