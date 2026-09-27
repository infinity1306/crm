import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { 
  Search, 
  CheckCircle2, 
  LogOut, 
  LogIn 
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

interface AttendanceKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceKioskModal: React.FC<AttendanceKioskModalProps> = ({ isOpen, onClose }) => {
  const { employees, attendanceRecords, punchIn, punchOut } = useCRM();
  const [search, setSearch] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId);
  const todayRecord = attendanceRecords.find(r => r.employeeId === selectedEmpId && r.date === new Date().toISOString().split('T')[0]);

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyClick = (val: string) => {
    if (val === 'CLEAR') {
      setPin('');
      return;
    }
    if (val === 'BACK') {
      setPin(prev => prev.slice(0, -1));
      return;
    }
    if (pin.length < 4) {
      setPin(prev => prev + val);
    }
  };

  const handleAction = (action: 'in' | 'out') => {
    if (!selectedEmpId) return;

    if (pin !== '1234' && pin !== '0000') {
      setFeedback({ type: 'error', message: 'Invalid 4-digit Kiosk PIN. (Demo PIN: 1234)' });
      setPin('');
      return;
    }

    try {
      if (action === 'in') {
        punchIn(selectedEmpId);
        setFeedback({ type: 'success', message: `${selectedEmployee?.name} punched in successfully!` });
      } else {
        punchOut(selectedEmpId);
        setFeedback({ type: 'success', message: `${selectedEmployee?.name} punched out successfully!` });
      }
      setTimeout(() => {
        setSelectedEmpId(null);
        setPin('');
        setFeedback(null);
      }, 1800);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reception Attendance Kiosk"
      description="Stationary tablet entrance punch terminal for Star Chain Labs offices."
    >
      <div className="space-y-4">
        {feedback && (
          <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-teal-500/10 border border-teal-500 text-teal-300' 
              : 'bg-rose-500/10 border border-rose-500 text-rose-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {!selectedEmployee ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search your name, role or employee ID..."
                className="w-full pl-9 pr-3 py-2 bg-[#12181E] border border-[#1E262E] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {filteredEmployees.map(emp => {
                const rec = attendanceRecords.find(r => r.employeeId === emp.id && r.date === new Date().toISOString().split('T')[0]);
                const isWorking = rec?.sessionState === 'working';
                return (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedEmpId(emp.id); setPin(''); }}
                    className="w-full flex items-center justify-between p-2.5 bg-[#12181E] hover:bg-[#182028] border border-[#1E262E] rounded-lg text-left transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar name={emp.name} src={emp.avatar} size="sm" />
                      <div>
                        <div className="text-xs font-semibold text-white">{emp.name}</div>
                        <div className="text-[11px] text-slate-400">{emp.department} • {emp.designation || emp.role}</div>
                      </div>
                    </div>
                    <Badge variant={isWorking ? 'success' : 'neutral'} size="sm">
                      {isWorking ? '● Working' : 'Not Punched In'}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#12181E] border border-[#1E262E] rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar name={selectedEmployee.name} src={selectedEmployee.avatar} size="md" />
                <div>
                  <div className="text-sm font-bold text-white">{selectedEmployee.name}</div>
                  <div className="text-xs text-slate-400">{selectedEmployee.department} • {selectedEmployee.designation || selectedEmployee.role}</div>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedEmpId(null)}>
                Switch
              </Button>
            </div>

            <div className="text-center space-y-2">
              <div className="text-xs text-slate-400">Enter your 4-digit Kiosk PIN (Demo PIN: 1234)</div>
              <div className="flex justify-center gap-3 py-2">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg font-mono font-bold ${
                      pin.length > i
                        ? 'border-teal-400 bg-teal-500/20 text-teal-300'
                        : 'border-slate-700 bg-slate-900 text-slate-600'
                    }`}
                  >
                    {pin.length > i ? '•' : ''}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeyClick(k)}
                  className="py-2.5 rounded-lg bg-[#182028] hover:bg-[#222C38] active:bg-teal-500/20 text-white font-mono text-sm border border-[#2A3441] transition-colors"
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleAction('in')}
                disabled={pin.length < 4 || todayRecord?.sessionState === 'working'}
                className="justify-center"
              >
                <LogIn className="w-4 h-4 mr-2" />
                CHECK IN
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => handleAction('out')}
                disabled={pin.length < 4 || todayRecord?.sessionState !== 'working'}
                className="justify-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                CHECK OUT
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
