import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { 
  Users, 
  Search, 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  Coffee, 
  Timer, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';

export const WorkingNowFloor: React.FC = () => {
  const { 
    attendanceRecords, 
    employees, 
    projects, 
    tasks, 
    navigateTo,
    todayDateStr 
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter employees currently working or on break today
  const activeWorkingRecords = useMemo(() => {
    return attendanceRecords.filter(r => {
      if (r.date !== todayDateStr) return false;
      if (r.sessionState !== 'working' && r.sessionState !== 'on_break') return false;

      if (departmentFilter !== 'all' && r.department !== departmentFilter) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'on_break' && r.sessionState !== 'on_break') return false;
        if (statusFilter === 'working' && r.sessionState !== 'working') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.employeeName.toLowerCase().includes(q);
        const matchesRole = r.employeeRole.toLowerCase().includes(q);
        const matchesProj = r.currentProjectName?.toLowerCase().includes(q);
        const matchesTask = r.currentTaskTitle?.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesProj && !matchesTask) return false;
      }

      return true;
    });
  }, [attendanceRecords, todayDateStr, departmentFilter, statusFilter, searchQuery]);

  const onBreakCount = activeWorkingRecords.filter(r => r.sessionState === 'on_break').length;
  const onDeskCount = activeWorkingRecords.filter(r => r.sessionState === 'working').length;

  return (
    <div className="space-y-5">
      {/* Top Floor Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-crm-card border border-crm-border rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Total Live Active</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">{activeWorkingRecords.length}</div>
          </div>
          <Users className="w-6 h-6 text-teal-400" />
        </div>

        <div className="p-4 bg-crm-card border border-crm-border rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">On Desk & Working</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">{onDeskCount}</div>
          </div>
          <Clock className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="p-4 bg-crm-card border border-crm-border rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">On Active Break</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5">{onBreakCount}</div>
          </div>
          <Coffee className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search active team members..."
            className="w-full pl-9 pr-3 py-2 bg-crm-card border border-crm-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="p-2 bg-crm-card border border-crm-border rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 bg-crm-card border border-crm-border rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Live Statuses</option>
            <option value="working">Desk / Working</option>
            <option value="on_break">On Break</option>
          </select>
        </div>
      </div>

      {/* SECTION 16 SPECIFICATION: LIVE WORKFORCE LIST */}
      <div className="space-y-2">
        {activeWorkingRecords.length === 0 ? (
          <Card className="p-8 text-center bg-crm-card border-crm-border">
            <Users className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-60" />
            <h3 className="text-sm font-bold text-white mb-1">No Active Employees on Floor</h3>
            <p className="text-xs text-slate-400">Nobody has currently clocked in or all shifts are finished.</p>
          </Card>
        ) : (
          activeWorkingRecords.map(rec => {
            const isBreak = rec.sessionState === 'on_break';
            const isLate = rec.status === 'late' || (rec.lateMinutes && rec.lateMinutes > 0);

            return (
              <Card 
                key={rec.id} 
                className="p-3.5 bg-crm-card border-crm-border hover:border-slate-700 transition-all cursor-pointer"
                onClick={() => navigateTo(`/app/team/${rec.employeeId}/attendance`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={rec.employeeName} src={rec.employeeAvatar} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{rec.employeeName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({rec.department})</span>
                        {isBreak ? (
                          <Badge variant="warning" size="sm">
                            <Coffee className="w-3 h-3 mr-1" /> Break
                          </Badge>
                        ) : isLate ? (
                          <Badge variant="warning" size="sm">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Late Arrival
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            ● Working
                          </Badge>
                        )}
                        <Badge variant="neutral" size="sm">{rec.workMode || 'OFFICE'}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Punched in: <strong className="text-slate-200 font-mono">{rec.punchIn}</strong></span>
                        {rec.currentProjectName && (
                          <span className="truncate max-w-[180px]">• Proj: <strong className="text-teal-400">{rec.currentProjectName}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <div className="text-right">
                      <div className="text-teal-400 font-bold">
                        {String(Math.floor((rec.totalWorkingMinutes || 0) / 60)).padStart(2, '0')}h {String((rec.totalWorkingMinutes || 0) % 60).padStart(2, '0')}m
                      </div>
                      <div className="text-[10px] text-slate-500">Duration</div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
