import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { LeaveType } from '../../types/attendance';
import { calcAccruedCL } from '../../data/attendanceMockData';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Calendar, AlertCircle, FileText, Send } from 'lucide-react';

interface RequestLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestLeaveModal: React.FC<RequestLeaveModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, submitLeaveRequest, leaveBalances } = useCRM();

  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // User's active CL balance (CL-only system: 12/year, 1 per month)
  const accrued = calcAccruedCL();
  const userBalance = leaveBalances[currentUser.id] || {
    employeeId: currentUser.id,
    annual: { total: 0, used: 0, pending: 0, remaining: 0 },
    sick: { total: 0, used: 0, pending: 0, remaining: 0 },
    casual: { total: accrued, used: 0, pending: 0, remaining: accrued },
    unpaid: { used: 0 }
  };
  const clTotal = Math.max(userBalance.casual.total, accrued);
  const activeCategoryBalance = {
    ...userBalance.casual,
    total: clTotal,
    remaining: Math.max(0, clTotal - userBalance.casual.used - userBalance.casual.pending)
  };

  // Calculate days difference
  const daysCount = React.useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Both start and end dates are required.');
      return;
    }
    if (daysCount <= 0) {
      setError('End date cannot be earlier than start date.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a specific rationale for your leave application.');
      return;
    }

    if (activeCategoryBalance && daysCount > activeCategoryBalance.remaining) {
      setError(`Requested duration (${daysCount} days) exceeds available ${leaveType} leave balance (${activeCategoryBalance.remaining} remaining).`);
      return;
    }

    submitLeaveRequest({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeRole: currentUser.designation || currentUser.role,
      department: currentUser.department,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason: reason.trim(),
      attachmentName: attachmentName.trim() || undefined
    });

    onClose();
    // Reset form
    setStartDate('');
    setEndDate('');
    setReason('');
    setAttachmentName('');
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Employee Leave"
      description="Submit a formal leave request to your reporting manager and HR desk."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Quota Indicator */}
        {activeCategoryBalance && (
          <div className="p-3 rounded-lg bg-[#12181E] border border-[#1E262E] flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Available {leaveType.toUpperCase()} Balance:</span>
              <strong className="text-teal-400 ml-1.5 font-mono text-sm">{activeCategoryBalance.remaining} days</strong>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              {activeCategoryBalance.used} used • {activeCategoryBalance.pending} pending approval
            </div>
          </div>
        )}

        {/* Leave Type — CL only */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Leave Category *
          </label>
          <Select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            options={[
              { value: 'casual', label: `Casual Leave / CL (${activeCategoryBalance.remaining} days available)` },
            ]}
            className="w-full text-xs"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Start Date *
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              End Date *
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-mono"
              required
            />
          </div>
        </div>

        {startDate && endDate && daysCount > 0 && (
          <div className="text-xs font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded flex items-center justify-between">
            <span>Duration Requested:</span>
            <strong>{daysCount} Business {daysCount === 1 ? 'Day' : 'Days'}</strong>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Detailed Reason / Handover Plan *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the reason for leave and any sprint handover or coverage plan..."
            className="w-full bg-[#12181E] border border-[#1E262E] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 min-h-[80px]"
            required
          />
        </div>

        {/* Optional Document Note / Attachment */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Supporting Document / Prescription (Optional)
          </label>
          <Input
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
            placeholder="e.g. medical_certificate_dr_sharma.pdf"
            className="text-xs"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E262E]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs"
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};
