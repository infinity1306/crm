import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Project, ProjectHealth, ProjectStatus } from '../../types/projects';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { CreateProjectDrawer } from './CreateProjectDrawer';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  Calendar, 
  ArrowUpRight,
  LayoutGrid,
  ListFilter,
  Layers,
  IndianRupee,
  Building2
} from 'lucide-react';

export const ProjectsList: React.FC = () => {
  const { 
    projects, 
    companies, 
    employees, 
    navigateTo, 
    calculateProjectProgress, 
    evaluateProjectHealth 
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Compute live derived metrics per project
  const projectsWithMetrics = useMemo(() => {
    return projects.map(p => {
      const derived = calculateProjectProgress(p.id);
      const computedHealth = evaluateProjectHealth(p.id);
      return {
        ...p,
        derivedProgress: derived.overall,
        totalTasks: derived.totalTasks,
        completedTasks: derived.completedTasks,
        blockedTasks: derived.blockedTasks,
        overdueTasks: derived.overdueTasks,
        computedHealth: p.health === 'delayed' ? 'delayed' : computedHealth
      };
    });
  }, [projects, calculateProjectProgress, evaluateProjectHealth]);

  // Overall KPI ribbon
  const totalProjects = projectsWithMetrics.length;
  const activeProjects = projectsWithMetrics.filter(p => p.status === 'active').length;
  const onTrackCount = projectsWithMetrics.filter(p => p.computedHealth === 'on_track').length;
  const atRiskCount = projectsWithMetrics.filter(p => p.computedHealth === 'at_risk').length;
  const delayedCount = projectsWithMetrics.filter(p => p.computedHealth === 'delayed').length;
  const totalDeliveryBudget = projectsWithMetrics.reduce((acc, p) => acc + (p.budget || 0), 0);

  // Filtered dataset
  const filteredProjects = useMemo(() => {
    return projectsWithMetrics.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (healthFilter !== 'all' && p.computedHealth !== healthFilter) return false;
      if (managerFilter !== 'all' && p.managerId !== managerFilter) return false;
      if (clientFilter !== 'all' && p.clientId !== clientFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesClient = p.clientName.toLowerCase().includes(q);
        const matchesManager = p.managerName.toLowerCase().includes(q);
        const matchesTags = p.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesClient && !matchesManager && !matchesTags) return false;
      }
      return true;
    });
  }, [projectsWithMetrics, statusFilter, healthFilter, managerFilter, clientFilter, searchQuery]);

  const getHealthBadge = (health: ProjectHealth) => {
    switch (health) {
      case 'on_track':
        return <Badge variant="success" className="gap-1.5 font-medium"><CheckCircle2 className="w-3 h-3" /> On Track</Badge>;
      case 'at_risk':
        return <Badge variant="warning" className="gap-1.5 font-medium"><AlertTriangle className="w-3 h-3" /> At Risk</Badge>;
      case 'delayed':
        return <Badge variant="error" className="gap-1.5 font-medium"><AlertTriangle className="w-3 h-3" /> Delayed</Badge>;
      default:
        return <Badge variant="neutral">{health}</Badge>;
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="primary">Active Delivery</Badge>;
      case 'planning':
        return <Badge variant="neutral">Planning</Badge>;
      case 'on_hold':
        return <Badge variant="warning">On Hold</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <FolderKanban className="w-6 h-6 text-teal-400" />
              Delivery Projects
            </h1>
            <Badge variant="neutral" className="bg-[#12181E] border-[#1E262E] text-slate-300">
              {filteredProjects.length} projects
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Star Chain Labs client delivery lifecycle, agile sprint workstreams, derived task progress, and SLA health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('/app/tasks')}
            className="text-xs border-[#1E262E] text-slate-300"
          >
            Tasks Board
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('/app/work-updates')}
            className="text-xs border-[#1E262E] text-slate-300"
          >
            Daily Updates
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Project
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Projects</p>
          <p className="text-xl font-bold text-white mt-1">{totalProjects}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Across all accounts</p>
        </Card>

        <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Active Delivery</p>
          <p className="text-xl font-bold text-teal-400 mt-1">{activeProjects}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">In active sprints</p>
        </Card>

        <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">On Track</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{onTrackCount}</p>
          <p className="text-[10px] text-emerald-500/80 mt-0.5">SLA verified</p>
        </Card>

        <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">At Risk</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{atRiskCount}</p>
          <p className="text-[10px] text-amber-500/80 mt-0.5">Blockers detected</p>
        </Card>

        <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Delayed</p>
          <p className="text-xl font-bold text-rose-400 mt-1">{delayedCount}</p>
          <p className="text-[10px] text-rose-500/80 mt-0.5">Overdue milestones</p>
        </Card>

        <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Delivery Value</p>
          <p className="text-xl font-bold text-white mt-1">{formatCurrency(totalDeliveryBudget)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Total contracted</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-[#0D1216] border-[#1E262E]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, client, tags, or manager..."
              className="pl-9 w-full text-xs"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'planning', label: 'Planning' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'completed', label: 'Completed' },
              ]}
              className="text-xs"
            />

            <Select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Health' },
                { value: 'on_track', label: 'On Track' },
                { value: 'at_risk', label: 'At Risk' },
                { value: 'delayed', label: 'Delayed' },
              ]}
              className="text-xs"
            />

            <Select
              value={managerFilter}
              onChange={(e) => setManagerFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Managers' },
                ...employees.map(e => ({ value: e.id, label: e.name }))
              ]}
              className="text-xs"
            />

            <Select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Clients' },
                ...companies.map(c => ({ value: c.id, label: c.name }))
              ]}
              className="text-xs"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-[#1E262E] rounded p-0.5 bg-[#12181E] shrink-0 self-end lg:self-center">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-teal-500/20 text-teal-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'cards' ? 'bg-teal-500/20 text-teal-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Main Listing View */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center bg-[#0D1216] border-[#1E262E]">
          <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-300">No delivery projects found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters, or initiate a new delivery project.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 text-xs"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setHealthFilter('all');
              setManagerFilter('all');
              setClientFilter('all');
            }}
          >
            Clear All Filters
          </Button>
        </Card>
      ) : viewMode === 'table' ? (
        /* Dense Table View */
        <div className="border border-[#1E262E] rounded overflow-hidden bg-[#0D1216]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E262E] bg-[#12181E] text-slate-400 font-medium">
                  <th className="py-3 px-4">Project & Architecture</th>
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">Manager</th>
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-4">Derived Progress</th>
                  <th className="py-3 px-3">Health</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3 text-right">Budget</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E262E] text-slate-300">
                {filteredProjects.map(project => (
                  <tr 
                    key={project.id}
                    onClick={() => navigateTo(`/app/projects/${project.id}`)}
                    className="hover:bg-[#12181E] transition-colors cursor-pointer group"
                  >
                    {/* Project Title & Template */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                        {project.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-slate-500">{project.template || 'Custom Web App'}</span>
                        {project.blockedTasks > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] text-amber-400">
                            {project.blockedTasks} blocked
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-3 px-3 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[130px] font-medium">{project.clientName}</span>
                      </div>
                    </td>

                    {/* Manager */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300">
                          {project.managerName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-slate-300 truncate max-w-[100px]">{project.managerName}</span>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-3">
                      <div className="flex items-center -space-x-1.5">
                        {project.teamMembers.slice(0, 3).map((m, i) => (
                          <div 
                            key={i} 
                            title={`${m.name} (${m.role})`}
                            className="w-5 h-5 rounded-full bg-[#161F28] border border-[#1E262E] flex items-center justify-center text-[8px] font-semibold text-slate-300"
                          >
                            {m.name.slice(0, 2).toUpperCase()}
                          </div>
                        ))}
                        {project.teamMembers.length > 3 && (
                          <div className="w-5 h-5 rounded-full bg-slate-800 border border-[#1E262E] flex items-center justify-center text-[8px] text-slate-400 font-bold">
                            +{project.teamMembers.length - 3}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Derived Progress */}
                    <td className="py-3 px-4 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-white">{project.derivedProgress}%</span>
                        <span className="text-[10px] text-slate-500">
                          {project.completedTasks}/{project.totalTasks} tasks
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            project.derivedProgress === 100 
                              ? 'bg-emerald-400' 
                              : project.computedHealth === 'delayed'
                              ? 'bg-rose-400'
                              : project.computedHealth === 'at_risk'
                              ? 'bg-amber-400'
                              : 'bg-teal-400'
                          }`}
                          style={{ width: `${project.derivedProgress}%` }}
                        />
                      </div>
                    </td>

                    {/* Health */}
                    <td className="py-3 px-3">
                      {getHealthBadge(project.computedHealth)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {getStatusBadge(project.status)}
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{project.deadline}</span>
                      </div>
                    </td>

                    {/* Budget */}
                    <td className="py-3 px-3 text-right font-medium text-slate-200">
                      {formatCurrency(project.budget)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-teal-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo(`/app/projects/${project.id}`);
                        }}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <Card 
              key={project.id}
              onClick={() => navigateTo(`/app/projects/${project.id}`)}
              className="p-4 bg-[#0D1216] border-[#1E262E] hover:border-teal-500/40 transition-colors cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Card Header: Client & Health */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-400 truncate flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {project.clientName}
                  </span>
                  {getHealthBadge(project.computedHealth)}
                </div>

                {/* Project Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-2">
                  {project.name}
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {project.tags.slice(0, 3).map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-[#12181E] border border-[#1E262E] text-[10px] text-slate-400">
                      {t}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-1 py-0.5 text-[10px] text-slate-500">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E262E] space-y-3">
                {/* Derived Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Derived Progress</span>
                    <span className="font-bold text-white">{project.derivedProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        project.derivedProgress === 100 
                          ? 'bg-emerald-400' 
                          : project.computedHealth === 'delayed'
                          ? 'bg-rose-400'
                          : project.computedHealth === 'at_risk'
                          ? 'bg-amber-400'
                          : 'bg-teal-400'
                      }`}
                      style={{ width: `${project.derivedProgress}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer: Manager, Tasks Count & Deadline */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-300">
                      {project.managerName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[90px]">{project.managerName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500">
                      {project.completedTasks}/{project.totalTasks} Tasks
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatCurrency(project.budget)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Project Creation Drawer */}
      <CreateProjectDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
