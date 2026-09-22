import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { InternalTicket, InternalTicketPriority, InternalTicketStatus, InternalTicketType } from '../../types/projects';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { RaiseTicketModal } from './RaiseTicketModal';
import { TicketDetailDrawer } from './TicketDetailDrawer';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FolderKanban, 
  Target, 
  CheckSquare, 
  Sparkles,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export const InternalTicketsDesk: React.FC = () => {
  const { tickets, projects, employees, navigateTo } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isOperationalModalOpen, setIsOperationalModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Filtered dataset
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesId = t.id.toLowerCase().includes(q);
        const matchesProject = t.projectName.toLowerCase().includes(q);
        const matchesAssignee = t.assignedToName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesProject && !matchesAssignee) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, priorityFilter, typeFilter, projectFilter, searchQuery]);

  // Telemetry counts
  const totalTickets = tickets.length;
  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'assigned').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const waitingCount = tickets.filter(t => t.status === 'waiting').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const criticalCount = tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length;

  const getPriorityBadge = (priority: InternalTicketPriority) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="error" className="text-[10px]">Critical</Badge>;
      case 'high':
        return <Badge variant="warning" className="text-[10px]">High</Badge>;
      case 'medium':
        return <Badge variant="primary" className="text-[10px]">Medium</Badge>;
      case 'low':
        return <Badge variant="neutral" className="text-[10px]">Low</Badge>;
    }
  };

  const getStatusBadge = (status: InternalTicketStatus) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <Badge variant="success" className="text-[10px]">Resolved</Badge>;
      case 'in_progress':
        return <Badge variant="primary" className="text-[10px]">In Progress</Badge>;
      case 'waiting':
        return <Badge variant="warning" className="text-[10px]">Waiting</Badge>;
      case 'assigned':
        return <Badge variant="neutral" className="text-[10px]">Assigned</Badge>;
      default:
        return <Badge variant="neutral" className="text-[10px]">Open</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <LifeBuoy className="w-6 h-6 text-teal-400" />
              Internal Support & Escalation Desk
            </h1>
            <Badge variant="neutral" className="bg-[#12181E] border-[#1E262E] text-slate-300">
              {filteredTickets.length} tickets
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Operational triage desk connecting technical blockers, client revisions, and management status queries to actual code delivery.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOperationalModalOpen(true)}
            className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Admin Status Inquiry
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRaiseModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Raise Ticket
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-slate-500">Total Tickets</p>
          <p className="text-lg font-bold text-white mt-0.5">{totalTickets}</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-slate-400">Open & Assigned</p>
          <p className="text-lg font-bold text-white mt-0.5">{openCount}</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-teal-400">In Progress</p>
          <p className="text-lg font-bold text-teal-400 mt-0.5">{inProgressCount}</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-rose-400">Critical Blockers</p>
          <p className="text-lg font-bold text-rose-400 mt-0.5">{criticalCount}</p>
        </Card>

        <Card className="p-3 bg-[#0D1216] border-[#1E262E]">
          <p className="text-[11px] uppercase font-semibold text-emerald-400">Resolved</p>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">{resolvedCount}</p>
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
              placeholder="Search tickets by ID, title, project, assignee..."
              className="pl-9 w-full text-xs"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'open', label: 'Open' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'waiting', label: 'Waiting' },
                { value: 'resolved', label: 'Resolved' },
              ]}
              className="text-xs"
            />

            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              className="text-xs"
            />

            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'technical', label: 'Technical Issue' },
                { value: 'operational_query', label: 'Admin Status Query' },
                { value: 'client_issue', label: 'Client Escalation' },
                { value: 'bug', label: 'Bug' },
              ]}
              className="text-xs"
            />

            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Projects' },
                ...projects.map(p => ({ value: p.id, label: p.name }))
              ]}
              className="text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <Card className="p-12 text-center bg-[#0D1216] border-[#1E262E]">
          <LifeBuoy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-300">No tickets found</p>
          <p className="text-xs text-slate-500 mt-1">
            All delivery workstreams are operating smoothly with zero active escalations.
          </p>
        </Card>
      ) : (
        <div className="border border-[#1E262E] rounded overflow-hidden bg-[#0D1216]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E262E] bg-[#12181E] text-slate-400 font-medium">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-3">Title & Issue</th>
                  <th className="py-3 px-3">Project & Workstream</th>
                  <th className="py-3 px-3">Assigned To</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Last Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E262E] text-slate-300">
                {filteredTickets.map(t => (
                  <tr 
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="hover:bg-[#12181E] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-teal-400">
                      {t.id}
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <p className="font-semibold text-white group-hover:text-teal-400 transition-colors truncate">
                        {t.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {t.description}
                      </p>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <FolderKanban className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[130px]">{t.projectName}</span>
                      </div>
                      {t.taskTitle && (
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Task: {t.taskTitle}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-300">
                          {t.assignedToName.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{t.assignedToName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {getPriorityBadge(t.priority)}
                    </td>

                    <td className="py-3 px-3">
                      {getStatusBadge(t.status)}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-[#12181E] border border-[#1E262E] text-[10px] text-slate-400">
                        {t.type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {t.updatedAt}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-white text-xs p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicketId(t.id);
                        }}
                      >
                        Inspect →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Standard Ticket Raise Modal */}
      <RaiseTicketModal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        isOperationalQuery={false}
      />

      {/* Admin Status Query Modal */}
      <RaiseTicketModal
        isOpen={isOperationalModalOpen}
        onClose={() => setIsOperationalModalOpen(false)}
        isOperationalQuery={true}
      />

      {/* Ticket 360 Detail Drawer */}
      <TicketDetailDrawer
        ticketId={selectedTicketId}
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </div>
  );
};
