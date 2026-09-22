import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { 
  UserCheck, 
  ArrowLeft, 
  Search, 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  Coffee, 
  Timer, 
  Eye, 
  ExternalLink,
  ShieldAlert,
  Activity,
  Calendar
} from 'lucide-react';

export const WorkingNowFloor: React.FC = () => {
  const { 
    attendanceRecords, 
    employees, 
    projects, 
    tasks, 
    navigateTo 
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  const todayStr = '2026-09-21';

  // Filter employees currently working or on break today
  const activeWorkingRecords = useMemo(() => {
    return attendanceRecords.filter(r => {
      if (r.date !== todayStr) return false;
      if (r.sessionState !== 'working' && r.sessionState !== 'on_break') return false;

      if (departmentFilter !== 'all' && r.department !== departmentFilter) return false;
      if (projectFilter !== 'all' && r.currentProjectId !== projectFilter) return false;

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
  }, [attendanceRecords, todayStr, departmentFilter, projectFilter, searchQuery]);

  const onBreakCount = activeWorkingRecords.filter(r => r.sessionState === 'on_break').length;
  const onDeskCount = activeWorkingRecords.filter(r => r.sessionState === 'working').length;

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-crm-border">
        <div>
          <button
            onClick={() => navigateTo('/app/attendance')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Attendance Overview</span>
          </button>

          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-400" />
              <span>Active Workforce Floor Radar</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              {activeWorkingRecords.length} Active Now
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry of team members currently clocked in, active Phase 3 projects, and task contexts.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded bg-[#0D1216] border border-[#1E262E] text-xs font-mono">
            <span className="text-slate-500 mr-2">ON DESK:</span>
            <span className="text-teal-400 font-bold">{onDeskCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded bg-[#0D1216] border border-[#1E262E] text-xs font-mono">
            <span className="text-slate-500 mr-2">ON BREAK:</span>
            <span className="text-amber-400 font-bold">{onBreakCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by engineer, project, or task..."
              className="pl-9 w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Departments' },
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Product', label: 'Product' },
                { value: 'Executive', label: 'Executive' },
              ]}
              className="text-xs"
            />

            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Delivery Projects' },
                ...projects.map(p => ({ value: p.id, label: p.name }))
              ]}
              className="text-xs max-w-[200px]"
            />
          </div>
        </div>
      </Card>

      {/* Active Floor Grid */}
      {activeWorkingRecords.length === 0 ? (
        <Card className="p-12 text-center bg-[#0D1216] border-[#1E262E]">
          <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">No active working sessions match filter</p>
          <p className="text-xs text-slate-500 mt-1">Check search terms or select another department.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeWorkingRecords.map(record => {
            const isBreak = record.sessionState === 'on_break';
            return (
              <Card 
                key={record.id}
                className={`p-4 bg-[#0D1216] border transition-all relative overflow-hidden group ${
                  isBreak ? 'border-amber-500/30 hover:border-amber-500/50' : 'border-[#1E262E] hover:border-teal-500/40'
                }`}
              >
                {/* Accent top indicator */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-0.5 ${
                    isBreak ? 'bg-amber-500' : 'bg-teal-500'
                  }`} 
                />

                {/* Header: Avatar, Name, Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={record.employeeName} size="md" />
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                        {record.employeeName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {record.employeeRole}
                      </p>
                      <span className="text-[10px] font-mono text-slate-500">
                        {record.department}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isBreak ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        <Coffee className="w-2.5 h-2.5" />
                        ON BREAK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                        WORKING
                      </span>
                    )}
                  </div>
                </div>

                {/* Time Strip: Punch In & Duration */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-[#12181E] border border-[#1E262E] font-mono text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Clocked In</span>
                    <span className="font-semibold text-slate-200">{record.punchIn} AM</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Live Duration</span>
                    <span className="font-semibold text-teal-400">{formatDuration(record.totalWorkingMinutes)}</span>
                  </div>
                </div>

                {/* Active Delivery Project & Task (Phase 3 Link) */}
                <div className="space-y-2 text-xs pt-1 border-t border-[#1E262E]/60">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-0.5">
                      Current Project
                    </span>
                    {record.currentProjectName ? (
                      <div 
                        onClick={() => record.currentProjectId && navigateTo(`/app/projects/${record.currentProjectId}`)}
                        className="flex items-center gap-1.5 text-slate-200 font-medium hover:text-teal-300 cursor-pointer truncate"
                      >
                        <FolderKanban className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate">{record.currentProjectName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">General Internal Operations</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-0.5">
                      Current Task
                    </span>
                    {record.currentTaskTitle ? (
                      <div className="flex items-center gap-1.5 text-slate-300 text-[11px] truncate">
                        <CheckSquare className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{record.currentTaskTitle}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Architecture / Code Review</span>
                    )}
                  </div>
                </div>

                {/* Card Footer: View Timeline Link */}
                <div className="mt-4 pt-2.5 border-t border-[#1E262E] flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">
                    {record.timeline.length} activities logged today
                  </span>
                  <button
                    onClick={() => navigateTo(`/app/team/${record.employeeId}/attendance`)}
                    className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>View Day Timeline</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
