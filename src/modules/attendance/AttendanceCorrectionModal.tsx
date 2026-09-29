import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { AttendanceRecord, AttendanceStatus, CorrectionIssueType } from '../../types/attendance';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ShieldAlert, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface AttendanceCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  pendingCorrectionId?: string;
}

export const AttendanceCorrectionModal: React.FC<AttendanceCorrectionModalProps> = ({
  isOpen,
  onClose,
  record,
  pendingCorrectionId
}) => {
  const { currentUser, correctAttendance, reviewCorrection, correctionRequests } = useCRM();

  const [issueType, setIssueType] = useState<CorrectionIssueType>('FORGOT_CHECKOUT');
  const [punchIn, setPunchIn] = useState<string>(record?.punchIn || '10:00');
  const [punchOut, setPunchOut] = useState<string>(record?.punchOut || '19:00');
  const [status, setStatus] = useState<AttendanceStatus>(record?.status || 'present');
  const [reason, setReason] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const pendingRequest = pendingCorrectionId 
    ? correctionRequests.find(c => c.id === pendingCorrectionId)
    : correctionRequests.find(c => c.employeeId === record?.employeeId && c.workDate === record?.date && c.status === 'PENDING');

  const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'manager';

  React.useEffect(() => {
    if (record) {
      setPunchIn(record.punchIn || '10:00');
      setPunchOut(record.punchOut || '19:00');
      setStatus(record.status || 'present');
      setReason('');
      setError(null);
    }
  }, [record]);

  if (!record && !pendingRequest) return null;

  const targetName = record?.employeeName || pendingRequest?.employeeName;
  const targetDate = record?.date || pendingRequest?.workDate;

  const handleSubmitEmployeeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A comprehensive reason is required for managerial audit review.');
      return;
    }

    if (record) {
      correctAttendance(record.id, {
        punchIn,
        punchOut: punchOut || null,
        status,
        reason: reason.trim(),
        issueType
      });
    }

    onClose();
  };

  const handleReview = (action: 'APPROVE' | 'REJECT') => {
    if (!pendingRequest) return;
    reviewCorrection(pendingRequest.id, action, reviewNotes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAdminOrManager && pendingRequest ? "Review Attendance Correction" : "Request Attendance Correction"}
      description={`Audited workflow for ${targetName} on ${targetDate}.`}
    >
      <div className="space-y-4">
        {/* If pending request exists for manager review */}
        {isAdminOrManager && pendingRequest && pendingRequest.status === 'PENDING' ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">Pending Employee Request</span>
                <Badge variant="warning" size="sm">{pendingRequest.issueType.replace('_', ' ')}</Badge>
              </div>
              <div className="text-slate-300">
                <strong>Reason:</strong> "{pendingRequest.reason}"
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-amber-500/20 font-mono">
                <div>Original: {pendingRequest.originalPunchIn || '--'} → {pendingRequest.originalPunchOut || '--'}</div>
                <div className="text-teal-300 font-bold">Requested: {pendingRequest.requestedPunchIn || '--'} → {pendingRequest.requestedPunchOut || '--'}</div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Review Notes / Administrative Memo</label>
              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Add audit justification for approval or rejection..."
                rows={2}
                className="w-full p-2.5 bg-[#12181E] border border-[#1E262E] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="danger" size="sm" onClick={() => handleReview('REJECT')}>
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject Request
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleReview('APPROVE')}>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Approve & Recalculate
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitEmployeeRequest} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 bg-[#12181E] border border-[#1E262E] rounded-lg text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-teal-400 font-semibold font-mono text-[11px] uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-teal-400" />
                <span>Immutable Event-Sourced Audit</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All corrections are recorded as append-only <code>CORRECTION</code> events in Supabase with manager authorization, client IP and device signature.
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Issue Category</label>
              <select
                value={issueType}
                onChange={e => setIssueType(e.target.value as CorrectionIssueType)}
                className="w-full p-2 bg-[#12181E] border border-[#1E262E] rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="FORGOT_CHECKOUT">Forgot Check-Out at End of Shift</option>
                <option value="FORGOT_CHECKIN">Forgot Check-In upon Arrival</option>
                <option value="INCORRECT_TIME">Time Clock Mismatch / Network Outage</option>
                <option value="WRONG_STATUS">Incorrect Absence / On Duty Outside Office</option>
                <option value="OTHER">Other Administrative Reason</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Corrected Punch In</label>
                <input
                  type="time"
                  value={punchIn}
                  onChange={e => setPunchIn(e.target.value)}
                  className="w-full p-2 bg-[#12181E] border border-[#1E262E] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Corrected Punch Out</label>
                <input
                  type="time"
                  value={punchOut}
                  onChange={e => setPunchOut(e.target.value)}
                  className="w-full p-2 bg-[#12181E] border border-[#1E262E] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Detailed Reason (Mandatory)</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Explain the circumstances (e.g. Office work completed, forgot to punch out before leaving premises)..."
                rows={3}
                className="w-full p-2.5 bg-[#12181E] border border-[#1E262E] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Correction Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
