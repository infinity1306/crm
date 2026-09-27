import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Sun,
  Moon
} from 'lucide-react';
import { Shift } from '../../types/attendance';
import { DEFAULT_SHIFTS } from '../../services/attendanceService';

interface ShiftManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftManagementModal: React.FC<ShiftManagementModalProps> = ({ isOpen, onClose }) => {
  const [shifts] = useState<Shift[]>(DEFAULT_SHIFTS);
  const [selectedShiftId, setSelectedShiftId] = useState<string>(DEFAULT_SHIFTS[0].id);

  const currentShift = shifts.find(s => s.id === selectedShiftId) || shifts[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workforce Shift Management"
      description="Configure enterprise shifts, grace periods, overnight rosters and employee assignments."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {shifts.map(shift => (
            <button
              key={shift.id}
              onClick={() => setSelectedShiftId(shift.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedShiftId === shift.id
                  ? 'bg-teal-500/10 border-teal-500 text-white shadow-sm'
                  : 'bg-[#12181E] border-[#1E262E] text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold">{shift.name}</span>
                {shift.overnight ? (
                  <Badge variant="warning" size="sm">
                    <Moon className="w-3 h-3 mr-1" /> Overnight
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">
                    <Sun className="w-3 h-3 mr-1" /> Standard
                  </Badge>
                )}
              </div>
              <div className="text-sm font-mono font-bold text-teal-400">
                {shift.startTime} → {shift.endTime}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                <span>{shift.workMinutes / 60}h Target</span>
                <span>•</span>
                <span>{shift.graceMinutes}m Grace</span>
                <span>•</span>
                <span>{shift.breakMinutes}m Break</span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-[#12181E] border border-[#1E262E] rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E262E] pb-2">
            <div>
              <div className="text-xs font-bold text-white">{currentShift.name} Configuration</div>
              <div className="text-[11px] text-slate-400">Timezone: {currentShift.timezone}</div>
            </div>
            <Badge variant="neutral" size="sm">Active Policy</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 bg-[#0B0F14] rounded-lg border border-[#1E262E]">
              <div className="text-[11px] text-slate-400 mb-0.5">Start Time</div>
              <div className="text-sm font-mono font-bold text-white">{currentShift.startTime}</div>
            </div>
            <div className="p-2.5 bg-[#0B0F14] rounded-lg border border-[#1E262E]">
              <div className="text-[11px] text-slate-400 mb-0.5">End Time</div>
              <div className="text-sm font-mono font-bold text-white">{currentShift.endTime}</div>
            </div>
            <div className="p-2.5 bg-[#0B0F14] rounded-lg border border-[#1E262E]">
              <div className="text-[11px] text-slate-400 mb-0.5">Late Grace Period</div>
              <div className="text-sm font-mono font-bold text-amber-400">+{currentShift.graceMinutes} mins</div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Employees punching in after {currentShift.startTime} + {currentShift.graceMinutes}m grace period are automatically marked as <strong>Late</strong> and generate an audit event in the Exceptions Center.
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
