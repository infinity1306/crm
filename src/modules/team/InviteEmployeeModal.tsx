import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Department, Role, Invitation } from '../../types';
import { Mail, Check, Copy, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

export const InviteEmployeeModal: React.FC = () => {
  const { isInviteModalOpen, setInviteModalOpen, createInvitation } = useCRM();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<Department>('Engineering');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<Role>('employee');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setInviteModalOpen(false);
    setCreatedInvite(null);
    setFullName('');
    setEmail('');
    setDepartment('Engineering');
    setDesignation('');
    setRole('employee');
    setErrors({});
    setCopied(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Valid corporate email address required';
    }
    if (!designation.trim()) newErrors.designation = 'Designation/Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      const invite = createInvitation({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        department,
        designation: designation.trim(),
        role
      });
      setIsLoading(false);
      setCreatedInvite(invite);
    }, 450);
  };

  const handleCopyLink = () => {
    if (!createdInvite) return;
    const inviteUrl = `${window.location.origin}/auth/accept-invite?token=${createdInvite.token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isInviteModalOpen}
      onClose={handleClose}
      title={createdInvite ? "Invitation Generated Successfully" : "Invite New Team Member"}
      description={
        createdInvite 
          ? "The onboarding credentials and verification token have been provisioned." 
          : "Send an official Star Chain Labs onboarding invitation to a new employee."
      }
      size="md"
    >
      {createdInvite ? (
        <div className="space-y-4 py-1">
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <UserCheck className="w-4 h-4" />
              <span>Invitation Dispatched to Corporate Mail Queue</span>
            </div>
            <p className="text-crm-textSecondary leading-relaxed">
              An invitation email has been queued for <strong className="text-white">{createdInvite.email}</strong> with role <strong className="text-white">{createdInvite.role.toUpperCase()}</strong>.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-crm-textSecondary uppercase tracking-wider block">
              Shareable Direct Invitation Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded bg-crm-surface border border-crm-border text-[11px] font-mono text-crm-text truncate">
                {`${window.location.origin}/auth/accept-invite?token=${createdInvite.token}`}
              </div>
              <Button
                variant={copied ? "primary" : "secondary"}
                size="sm"
                onClick={handleCopyLink}
                leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-[10px] text-crm-textMuted">
              Link will automatically expire on {createdInvite.expiresAt}.
            </p>
          </div>

          <div className="border-t border-crm-border pt-4 flex justify-end">
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Full Name *"
            placeholder="e.g. Meera Nambiar"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
          />

          <Input
            label="Work Email *"
            type="email"
            placeholder="name@starchainlabs.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="w-3.5 h-3.5" />}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department *"
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
              options={[
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Product', label: 'Product' },
                { value: 'Design', label: 'Design' },
                { value: 'Sales', label: 'Sales' },
                { value: 'HR', label: 'HR' },
                { value: 'Operations', label: 'Operations' },
                { value: 'Finance', label: 'Finance' },
              ]}
            />

            <Select
              label="System Role *"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              options={[
                { value: 'employee', label: 'Employee (Standard)' },
                { value: 'manager', label: 'Manager (Team Admin)' },
                { value: 'admin', label: 'Admin (Operations)' },
                { value: 'super_admin', label: 'Super Admin' },
                { value: 'client', label: 'Client (Read-only)' },
              ]}
            />
          </div>

          <Input
            label="Designation / Title *"
            placeholder="e.g. Senior Mobile Architect"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            error={errors.designation}
          />

          <div className="p-3 rounded bg-crm-surface/40 border border-crm-border text-[11px] text-crm-textMuted flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-turquoise flex-shrink-0 mt-0.5" />
            <p>
              Invited user will receive instructions to set up their password and 2FA credentials. Role permissions are governed by the Star Chain Labs RBAC policy.
            </p>
          </div>

          <div className="border-t border-crm-border pt-4 flex items-center justify-end gap-2">
            <Button variant="ghost" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Send Invitation
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
