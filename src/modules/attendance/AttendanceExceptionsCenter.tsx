import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { 
  AlertTriangle, 
  Clock, 
  LogOut, 
  Coffee, 
  HelpCircle, 
  CheckCircle2, 
  FileEdit,
  Search
} from 'lucide-react';
import { AttendanceException } from '../../types/attendance';

interface AttendanceExceptionsCenterProps {
  exceptions: AttendanceException[];
  onRequestCorrection: (employeeId: string, employeeName: string, date: string, type: string) => void;
  onDismissException: (id: string) => void;
}

export const AttendanceExceptionsCenter: React.FC<AttendanceExceptionsCenterProps> = ({
  exceptions,
  onRequestCorrection,
  onDismissException
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const counts = {
    missingCheckout: exceptions.filter(e => e.type === 'MISSING_CHECKOUT').length,
    lateArrival: exceptions.filter(e => e.type === 'LATE_ARRIVAL').length,
    missingCheckin: exceptions.filter(e => e.type === 'MISSING_CHECKIN').length,
    longBreak: exceptions.filter(e => e.type === 'LONG_BREAK').length,
    correctionPending: exceptions.filter(e => e.type === 'CORRECTION_PENDING').length,
  };

  const filtered = exceptions.filter(e => {
    if (filterType !== 'all' && e.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return e.employeeName.toLowerCase().includes(q) || e.department.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Exception Metric Pills (Matching Section 12 Specification) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setFilterType(filterType === 'MISSING_CHECKOUT' ? 'all' : 'MISSING_CHECKOUT')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'MISSING_CHECKOUT' 
              ? 'bg-rose-500/15 border-rose-500' 
              : 'bg-crm-card border-crm-border hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Missing Check-outs</span>
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{counts.missingCheckout}</div>
        </button>

        <button
          onClick={() => setFilterType(filterType === 'LATE_ARRIVAL' ? 'all' : 'LATE_ARRIVAL')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'LATE_ARRIVAL' 
              ? 'bg-amber-500/15 border-amber-500' 
              : 'bg-crm-card border-crm-border hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Late Arrivals</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{counts.lateArrival}</div>
        </button>

        <button
          onClick={() => setFilterType(filterType === 'MISSING_CHECKIN' ? 'all' : 'MISSING_CHECKIN')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'MISSING_CHECKIN' 
              ? 'bg-blue-500/15 border-blue-500' 
              : 'bg-crm-card border-crm-border hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Missing Check-ins</span>
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{counts.missingCheckin}</div>
        </button>

        <button
          onClick={() => setFilterType(filterType === 'LONG_BREAK' ? 'all' : 'LONG_BREAK')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'LONG_BREAK' 
              ? 'bg-orange-500/15 border-orange-500' 
              : 'bg-crm-card border-crm-border hover:border-orange-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Long Breaks</span>
            <Coffee className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{counts.longBreak}</div>
        </button>

        <button
          onClick={() => setFilterType(filterType === 'CORRECTION_PENDING' ? 'all' : 'CORRECTION_PENDING')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'CORRECTION_PENDING' 
              ? 'bg-teal-500/15 border-teal-500' 
              : 'bg-crm-card border-crm-border hover:border-teal-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Corrections Pending</span>
            <FileEdit className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{counts.correctionPending}</div>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exceptions by employee or department..."
            className="w-full pl-9 pr-3 py-2 bg-crm-card border border-crm-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {filterType !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setFilterType('all')}>
            Clear Filter ({filterType})
          </Button>
        )}
      </div>

      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center bg-crm-card border-crm-border">
            <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-white mb-1">No Active Exceptions</h3>
            <p className="text-xs text-slate-400">All employee punches and shift schedules are strictly in compliance.</p>
          </Card>
        ) : (
          filtered.map(exc => (
            <Card key={exc.id} className="p-4 bg-crm-card border-crm-border hover:border-slate-700 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar name={exc.employeeName} src={exc.employeeAvatar} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{exc.employeeName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({exc.department})</span>
                      <Badge variant={exc.severity === 'high' ? 'error' : 'warning'} size="sm">
                        {exc.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{exc.details}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                      {exc.checkInTime && <span>Check-in: <strong>{exc.checkInTime}</strong></span>}
                      {exc.expectedCheckOutTime && <span>Expected Checkout: <strong>{exc.expectedCheckOutTime}</strong></span>}
                      <span>Status: <strong className="text-amber-300">{exc.currentStatus}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onRequestCorrection(exc.employeeId, exc.employeeName, exc.workDate, exc.type)}
                  >
                    <FileEdit className="w-3.5 h-3.5 mr-1.5" />
                    Request Correction
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onDismissException(exc.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
