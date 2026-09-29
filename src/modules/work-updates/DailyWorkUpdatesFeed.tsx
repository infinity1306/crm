import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { DailyWorkUpdate } from '../../types/projects';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SubmitWorkUpdateModal } from './SubmitWorkUpdateModal';
import { 
  History, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  Filter, 
  User, 
  FolderKanban,
  Search,
  CheckSquare
} from 'lucide-react';

export const DailyWorkUpdatesFeed: React.FC = () => {
  const { workUpdates, projects, employees, navigateTo } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [blockersOnly, setBlockersOnly] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Filtered dataset
  const filteredUpdates = useMemo(() => {
    return workUpdates.filter(u => {
      if (blockersOnly && (!u.blockedItems || u.blockedItems.length === 0)) return false;
      if (projectFilter !== 'all' && u.projectId !== projectFilter) return false;
      if (employeeFilter !== 'all' && u.employeeId !== employeeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesEmployee = u.employeeName.toLowerCase().includes(q);
        const matchesProject = u.projectName.toLowerCase().includes(q);
        const matchesTask = u.taskTitle?.toLowerCase().includes(q) || false;
        const matchesContent = 
          u.completedItems.some(i => i.toLowerCase().includes(q)) ||
          u.inProgressItems.some(i => i.toLowerCase().includes(q)) ||
          u.blockedItems.some(i => i.toLowerCase().includes(q));
        if (!matchesEmployee && !matchesProject && !matchesTask && !matchesContent) return false;
      }
      return true;
    });
  }, [workUpdates, blockersOnly, projectFilter, employeeFilter, searchQuery]);

  // Telemetry metrics
  const totalUpdates = workUpdates.length;
  const totalBlockers = workUpdates.filter(u => u.blockedItems && u.blockedItems.length > 0).length;
  const totalHoursLogged = workUpdates.reduce((sum, u) => sum + (u.hoursSpent || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <History className="w-6 h-6 text-teal-400" />
              Daily Work Updates (EOD)
            </h1>
            <Badge variant="neutral" className="bg-[#12181E] border-[#1E262E] text-slate-300">
              {filteredUpdates.length} updates logged
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Engineers' daily standup telemetry: Completed tasks, active workstreams, blockers, and next priorities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={blockersOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setBlockersOnly(!blockersOnly)}
            className="text-xs"
          >
            {blockersOnly ? 'Showing: With Blockers' : 'Filter: Blockers Only'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSubmitOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Submit Daily Update
          </Button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-slate-500">Total Updates</p>
          <p className="text-lg font-bold text-white mt-0.5">{totalUpdates}</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-rose-400">Blockers Reported</p>
          <p className="text-lg font-bold text-rose-400 mt-0.5">{totalBlockers}</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-teal-400">Total Hours Tracked</p>
          <p className="text-lg font-bold text-teal-400 mt-0.5">{totalHoursLogged} hrs</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-emerald-400">Active Workstreams</p>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">{projects.length}</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search updates by employee, project, task, or content..."
              className="pl-9 w-full text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Projects' },
                ...projects.map(p => ({ value: p.id, label: p.name }))
              ]}
              className="text-xs"
            />

            <Select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Engineers' },
                ...employees.map(e => ({ value: e.id, label: e.name }))
              ]}
              className="text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Feed Stream */}
      {filteredUpdates.length === 0 ? (
        <Card className="p-12 text-center bg-[#0D1216] border-[#1E262E]">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-300">No daily updates found</p>
          <p className="text-xs text-slate-500 mt-1">
            Submit your daily EOD report to keep project timelines accurate and unblock dependencies.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4 text-xs"
            onClick={() => setIsSubmitOpen(true)}
          >
            Submit EOD Update
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUpdates.map(update => {
            const hasBlockers = update.blockedItems && update.blockedItems.length > 0;

            return (
              <Card 
                key={update.id}
                className={`p-4 bg-[#0D1216] border transition-all ${
                  hasBlockers 
                    ? 'border-rose-500/40 bg-rose-950/10' 
                    : 'border-[#1E262E] hover:border-teal-500/30'
                }`}
              >
                {/* Header: Author & Project Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#1E262E] gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                      {update.employeeName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{update.employeeName}</span>
                        <span className="text-[10px] text-slate-500">• {update.employeeDesignation}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{update.date}</span>
                        <span className="text-slate-600">•</span>
                        <span>{update.createdAt}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => navigateTo(`/app/projects/${update.projectId}`)}
                      className="px-2 py-0.5 rounded bg-[#12181E] border border-[#1E262E] text-[11px] text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
                    >
                      <FolderKanban className="w-3 h-3" />
                      {update.projectName}
                    </button>

                    {update.hoursSpent && (
                      <Badge variant="neutral" className="text-[10px]">
                        {update.hoursSpent} hrs
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Linked Task Chip */}
                {update.taskTitle && (
                  <div className="mb-3 px-2.5 py-1.5 rounded bg-[#12181E] border border-[#1E262E] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300 truncate">
                      <CheckSquare className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="text-[11px] text-slate-400">Linked Task:</span>
                      <span className="font-medium text-white truncate">{update.taskTitle}</span>
                    </div>
                    <button
                      onClick={() => navigateTo('/app/tasks')}
                      className="text-[11px] text-teal-400 hover:underline shrink-0 ml-2"
                    >
                      View Board →
                    </button>
                  </div>
                )}

                {/* 4 Quadrants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* COMPLETED */}
                  <div className="p-3 bg-[#0B0F13] border border-[#1E262E] rounded-lg">
                    <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Completed Today
                    </p>
                    {update.completedItems.length === 0 ? (
                      <p className="text-[11px] text-slate-600 italic">None logged</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {update.completedItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* IN PROGRESS */}
                  <div className="p-3 bg-[#0B0F13] border border-[#1E262E] rounded-lg">
                    <p className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      In Progress
                    </p>
                    {update.inProgressItems.length === 0 ? (
                      <p className="text-[11px] text-slate-600 italic">None logged</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {update.inProgressItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                            <span className="text-teal-500 font-bold">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* BLOCKED / IMPEDIMENTS */}
                  <div className={`p-3 rounded-lg border ${
                    hasBlockers 
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-300' 
                      : 'bg-[#0B0F13] border-[#1E262E] text-slate-400'
                  }`}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <ShieldAlert className={`w-3.5 h-3.5 ${hasBlockers ? 'text-rose-400' : 'text-slate-500'}`} />
                      Blocked Items / Roadblocks
                    </p>
                    {!hasBlockers ? (
                      <p className="text-[11px] text-slate-600 italic">Zero impediments reported</p>
                    ) : (
                      <div className="space-y-2">
                        <ul className="space-y-1.5">
                          {update.blockedItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-rose-200">
                              <span className="text-rose-400 font-bold">•</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                        {update.blockedReason && (
                          <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-[11px] text-rose-300">
                            <span className="font-semibold">Root Cause:</span> {update.blockedReason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* NEXT ACTIONS */}
                  <div className="p-3 bg-[#0B0F13] border border-[#1E262E] rounded-lg">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      Planned for Tomorrow
                    </p>
                    {(!update.nextActionItems || update.nextActionItems.length === 0) ? (
                      <p className="text-[11px] text-slate-600 italic">None logged</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {update.nextActionItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                            <span className="text-slate-500 font-bold">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Work Update Modal */}
      <SubmitWorkUpdateModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />
    </div>
  );
};
