import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { AttendanceRecord, AttendanceStatus } from '../../types/attendance';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ShieldAlert, Clock, AlertTriangle, History } from 'lucide-react';

interface AttendanceCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

export const AttendanceCorrectionModal: React.FC<AttendanceCorrectionModalProps> = ({
  isOpen,
  onClose,
  record
}) => {
  const { currentUser, correctAttendance } = useCRM();

  const [punchIn, setPunchIn] = useState<string>(record?.punchIn || '09:30');
  const [punchOut, setPunchOut] = useState<string>(record?.punchOut || '18:30');
  const [status, setStatus] = useState<AttendanceStatus>(record?.status || 'present');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync state when record changes
  React.useEffect(() => {
    if (record) {
      setPunchIn(record.punchIn || '09:30');
      setPunchOut(record.punchOut || '18:30');
      setStatus(record.status || 'present');
      setReason('');
      setError(null);
    }
  }, [record]);

  if (!record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A valid administrative reason is strictly mandatory for attendance correction.');
      return;
    }

    correctAttendance(record.id, {
      punchIn,
      punchOut: punchOut || null,
      status,
      reason: reason.trim()
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Administrative Attendance Correction"
      description={`Correcting punch records for ${record.employeeName} on ${record.date}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Audit Safety Warning Notice */}
        <div className="p-3 bg-[#12181E] border border-[#1E262E] rounded-lg text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-teal-400 font-semibold font-mono text-[11px] uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-teal-400" />
            <span>Non-Destructive Audit Protection</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Historical attendance records are never overwritten silently. Your administrator identity (<strong className="text-slate-200">{currentUser.name}</strong>), the previous punch times, and the reason below will be permanently logged in the immutable audit log.
          </p>
        </div>

        {/* Existing Record Dossier */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded bg-slate-900/60 border border-slate-800 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Original In</span>
            <span className="font-mono font-medium text-slate-200">{record.punchIn || 'Missing'}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Original Out</span>
            <span className="font-mono font-medium text-slate-200">{record.punchOut || 'Missing'}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Original Status</span>
            <span className="font-mono uppercase text-slate-200">{record.status}</span>
          </div>
        </div>

        {/* Corrected Times */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Corrected Punch In *
            </label>
            <Input
              type="time"
              value={punchIn}
              onChange={(e) => setPunchIn(e.target.value)}
              className="font-mono text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Corrected Punch Out
            </label>
            <Input
              type="time"
              value={punchOut}
              onChange={(e) => setPunchOut(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>

        {/* Corrected Status */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Attendance Status Classification *
          </label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
            options={[
              { value: 'present', label: 'Present (On Time)' },
              { value: 'late', label: 'Late Arrival' },
              { value: 'half_day', label: 'Half Day' },
              { value: 'working', label: 'Currently Working' },
              { value: 'leave', label: 'Approved Leave' },
              { value: 'absent', label: 'Absent (Unexcused)' },
            ]}
            className="w-full text-xs"
          />
        </div>

        {/* Mandatory Rationale */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Mandatory Correction Reason *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Employee was on a client deployment call until late and forgot to punch out terminal..."
            className="w-full bg-[#12181E] border border-[#1E262E] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 min-h-[80px]"
            required
          />
          <p className="text-[10px] text-slate-500 mt-1">
            This justification will be sent to the employee in an automated notification.
          </p>
        </div>

        {/* Modal Footer */}
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
            leftIcon={<History className="w-3.5 h-3.5" />}
          >
            Apply & Audit Correction
          </Button>
        </div>
      </form>
    </Modal>
  );
};
