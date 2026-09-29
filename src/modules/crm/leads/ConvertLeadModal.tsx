import React, { useState } from 'react';
import { Lead } from '../../../types/crm';
import { useCRM } from '../../../context/CRMContext';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Building2, UserCheck, Briefcase, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess?: (companyId?: string) => void;
}

export const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const { convertLeadToClient, addToast } = useCRM();

  const [createCompany, setCreateCompany] = useState(true);
  const [companyName, setCompanyName] = useState(lead.companyName || lead.name + ' Enterprise');
  const [contactName, setContactName] = useState(lead.name);
  const [createDeal, setCreateDeal] = useState(true);
  const [dealName, setDealName] = useState(`${lead.companyName || lead.name} — ${lead.requirement || 'Core Engagement'}`);
  const [dealValue, setDealValue] = useState<number>(lead.value || lead.budget || 250000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = convertLeadToClient(lead.id, {
        createCompany,
        companyName: createCompany ? companyName : undefined,
        contactName,
        createDeal,
        dealName: createDeal ? dealName : undefined,
        dealValue: createDeal ? Number(dealValue) : undefined,
      });

      addToast({
        type: 'success',
        title: 'Lead Converted Successfully',
        message: `${lead.name} has been converted into an active client account with linked records.`
      });

      onClose();
      if (onSuccess) {
        onSuccess(res.companyId);
      }
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        title: 'Conversion Failed',
        message: 'An error occurred while converting lead to client.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Lead to Active Client"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-crm-textMuted flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-turquoise" />
            <span>Lead will be marked Won with full history preserved</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={handleConvert}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Converting...' : 'Complete Conversion'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleConvert} className="space-y-4 text-xs">
        <div className="p-3 rounded-md bg-crm-surface border border-crm-border/60 text-crm-textSecondary leading-relaxed">
          Converting <strong className="text-crm-text">{lead.name}</strong> will create an official Organization Client entity, an authorized stakeholder contact, and an active Sales Pipeline Deal.
        </div>

        {/* Company Account Card */}
        <div className="p-3.5 rounded-lg bg-crm-surface/50 border border-crm-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-crm-text text-xs">Company Entity</div>
                <div className="text-[11px] text-crm-textMuted">Enterprise profile & organization registry</div>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-crm-textSecondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={createCompany}
                onChange={e => setCreateCompany(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-crm-border bg-crm-bg text-turquoise focus:ring-0 focus:ring-offset-0"
              />
              <span>Create / Link Company</span>
            </label>
          </div>

          {createCompany && (
            <div className="pt-2 border-t border-crm-border/40">
              <Input
                label="Company Legal / Trading Name"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                required={createCompany}
                placeholder="e.g. Acme FinTech Corp"
              />
            </div>
          )}
        </div>

        {/* Contact Stakeholder Card */}
        <div className="p-3.5 rounded-lg bg-crm-surface/50 border border-crm-border space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-medium text-crm-text text-xs">Primary Contact</div>
              <div className="text-[11px] text-crm-textMuted">{lead.email} • {lead.phone}</div>
            </div>
          </div>
          <div className="pt-2 border-t border-crm-border/40">
            <Input
              label="Contact Full Name"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              required
              placeholder="e.g. Rahul Sharma"
            />
          </div>
        </div>

        {/* Sales Deal Card */}
        <div className="p-3.5 rounded-lg bg-crm-surface/50 border border-crm-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-crm-text text-xs">Sales Opportunity Deal</div>
                <div className="text-[11px] text-crm-textMuted">Moves to pipeline proposal/negotiation stage</div>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-crm-textSecondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={createDeal}
                onChange={e => setCreateDeal(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-crm-border bg-crm-bg text-turquoise focus:ring-0 focus:ring-offset-0"
              />
              <span>Create Deal</span>
            </label>
          </div>

          {createDeal && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-crm-border/40">
              <Input
                label="Deal Title"
                value={dealName}
                onChange={e => setDealName(e.target.value)}
                required={createDeal}
                placeholder="e.g. Custom Infrastructure"
              />
              <Input
                label="Contract / Deal Value (₹ INR)"
                type="number"
                value={dealValue}
                onChange={e => setDealValue(Number(e.target.value))}
                required={createDeal}
                placeholder="250000"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
