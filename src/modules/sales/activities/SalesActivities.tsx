import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { CRMActivity, CRMActivityType } from '../../../types/crm';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { LogActivityModal } from './LogActivityModal';
import { 
  History, 
  Phone, 
  Mail, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  ArrowRight,
  TrendingUp,
  UserCheck,
  Building2
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const SalesActivities: React.FC = () => {
  const { employees, leads, deals } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [repFilter, setRepFilter] = useState('all');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Mock comprehensive sales activity stream
  const [activities] = useState<CRMActivity[]>([
    {
      id: 'act-1',
      type: 'call',
      clientId: 'lead-1',
      clientName: 'Vikram Malhotra',
      companyId: 'comp-1',
      employeeId: 'emp-1',
      employeeName: 'Aarav Sharma',
      date: '2026-09-20',
      time: '02:30 PM',
      duration: '22 mins',
      outcome: 'Technical discovery completed; confirmed requirement for L1 validator nodes and multi-sig security.',
      nextAction: 'Send technical architecture proposal & SLA tier breakdown.',
      nextFollowUp: '2026-09-23',
      notes: 'CTO Vikram expressed high interest in Indian data residency compliance.'
    },
    {
      id: 'act-2',
      type: 'meeting',
      clientId: 'lead-2',
      clientName: 'Priya Iyer',
      companyId: 'comp-2',
      employeeId: 'emp-2',
      employeeName: 'Rohan Mehta',
      date: '2026-09-19',
      time: '11:00 AM',
      duration: '45 mins',
      outcome: 'Presented custom distributed ledger capabilities. Executive stakeholders satisfied with throughput benchmarks.',
      nextAction: 'Finalize revised commercial quote for ₹4,80,000.',
      nextFollowUp: '2026-09-22',
      notes: 'Meeting held online via Google Meet. CFO joined for commercial session.'
    },
    {
      id: 'act-3',
      type: 'email',
      clientId: 'lead-3',
      clientName: 'Kabir Sengupta',
      companyId: 'comp-3',
      employeeId: 'emp-4',
      employeeName: 'Neha Patel',
      date: '2026-09-18',
      time: '04:15 PM',
      duration: '10 mins',
      outcome: 'Dispatched Master Services Agreement (MSA) and Statement of Work (SOW).',
      nextAction: 'Follow up regarding legal review and countersignature.',
      nextFollowUp: '2026-09-21',
      notes: 'Legal counsel is reviewing clause 8.4 IP rights.'
    },
    {
      id: 'act-4',
      type: 'call',
      clientId: 'lead-4',
      clientName: 'Ananya Deshmukh',
      companyId: 'comp-4',
      employeeId: 'emp-1',
      employeeName: 'Aarav Sharma',
      date: '2026-09-17',
      time: '10:30 AM',
      duration: '15 mins',
      outcome: 'Discovery checkpoint: Clarified expected monthly active volume for automated smart contract micro-billing.',
      nextAction: 'Schedule live sandbox demo with lead engineering team.',
      nextFollowUp: '2026-09-22',
      notes: 'Client requested API documentation access.'
    },
    {
      id: 'act-5',
      type: 'note',
      clientId: 'lead-5',
      clientName: 'Rajesh Nambiar',
      companyId: 'comp-5',
      employeeId: 'emp-2',
      employeeName: 'Rohan Mehta',
      date: '2026-09-16',
      time: '06:00 PM',
      duration: '5 mins',
      outcome: 'Internal account audit completed. Deal probability adjusted to 75% following board budget sanction.',
      notes: 'CEO approved allocation for Web3 security pilot program.'
    }
  ]);

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const matchesSearch = 
        act.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.outcome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.employeeName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || act.type === typeFilter;
      const matchesRep = repFilter === 'all' || act.employeeId === repFilter;

      return matchesSearch && matchesType && matchesRep;
    });
  }, [activities, searchQuery, typeFilter, repFilter]);

  const getActivityIcon = (type: CRMActivityType) => {
    switch (type) {
      case 'call': return <Phone className="w-3.5 h-3.5 text-blue-400" />;
      case 'email': return <Mail className="w-3.5 h-3.5 text-purple-400" />;
      case 'meeting': return <Calendar className="w-3.5 h-3.5 text-turquoise" />;
      case 'followup': return <CheckSquare className="w-3.5 h-3.5 text-amber-400" />;
      case 'note': return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-crm-text">Sales Activities & Logs</h1>
            <Badge variant="primary">{activities.length} Recorded</Badge>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Omnichannel interaction logs, phone calls, client discovery meetings, and outcome tracking.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsLogModalOpen(true)}
        >
          Log Activity
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Logged Activities</div>
            <div className="text-xl font-bold text-crm-text mt-0.5">38</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-crm-surface border border-crm-border flex items-center justify-center text-crm-textMuted">
            <History className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Calls Completed</div>
            <div className="text-xl font-bold text-blue-400 mt-0.5">24</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Phone className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Syncs & Meetings</div>
            <div className="text-xl font-bold text-turquoise mt-0.5">11</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Follow-ups Scheduled</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">14</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-crm-textMuted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search activities by client, rep, outcome..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-crm-surface border border-crm-border rounded-md text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-crm-surface border border-crm-border rounded text-xs text-crm-textSecondary focus:outline-none focus:border-turquoise"
          >
            <option value="all">All Touchpoints</option>
            <option value="call">Calls</option>
            <option value="email">Emails</option>
            <option value="meeting">Meetings</option>
            <option value="note">Internal Notes</option>
          </select>

          <select
            value={repFilter}
            onChange={e => setRepFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-crm-surface border border-crm-border rounded text-xs text-crm-textSecondary focus:outline-none focus:border-turquoise"
          >
            <option value="all">All Reps</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Timeline Feed */}
      <div className="space-y-3">
        {filteredActivities.map(activity => (
          <div
            key={activity.id}
            className="p-4 rounded-lg bg-crm-card border border-crm-border hover:border-turquoise/40 transition-colors space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-crm-surface border border-crm-border flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <div className="font-semibold text-crm-text flex items-center gap-2">
                    <span className="capitalize">{activity.type}</span>
                    <span className="text-crm-textMuted font-normal">with</span>
                    <span className="text-turquoise">{activity.clientName}</span>
                  </div>
                  <div className="text-[11px] text-crm-textMuted flex items-center gap-2 mt-0.5">
                    <span>{activity.date} at {activity.time}</span>
                    {activity.duration && <span>• {activity.duration}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Avatar name={activity.employeeName} size="xs" />
                <span className="text-xs text-crm-textSecondary">{activity.employeeName}</span>
              </div>
            </div>

            {/* Outcome description */}
            <div className="p-3 rounded-md bg-crm-surface/60 border border-crm-border/60 text-crm-text leading-relaxed">
              <strong className="text-crm-textMuted font-medium mr-1.5">Outcome:</strong>
              {activity.outcome}
            </div>

            {/* Next action & follow-up */}
            {activity.nextAction && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-crm-border/40 text-[11px] text-crm-textSecondary">
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-turquoise" />
                  <span className="text-crm-text font-medium">Next Action:</span>
                  <span>{activity.nextAction}</span>
                </div>
                {activity.nextFollowUp && (
                  <div className="flex items-center gap-1 text-turquoise font-medium">
                    <Clock className="w-3 h-3" />
                    <span>Follow-up: {activity.nextFollowUp}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <LogActivityModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />
    </div>
  );
};
