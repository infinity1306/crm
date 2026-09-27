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

  const [activities, setActivities] = useState<CRMActivity[]>(() => {
    const saved = localStorage.getItem('scl_sales_activities');
    return saved ? JSON.parse(saved) : [];
  });

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
            <div className="text-xl font-bold text-crm-text mt-0.5">{activities.length}</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-crm-surface border border-crm-border flex items-center justify-center text-crm-textMuted">
            <History className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Calls Completed</div>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{activities.filter(a => a.type === "call").length}</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Phone className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Syncs & Meetings</div>
            <div className="text-xl font-bold text-turquoise mt-0.5">{activities.filter(a => a.type === "meeting").length}</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Follow-ups Scheduled</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{activities.filter(a => !!a.nextFollowUp).length}</div>
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
      {filteredActivities.length === 0 ? (
        <div className="p-12 text-center bg-crm-card border border-crm-border rounded-lg">
          <History className="w-10 h-10 text-crm-textMuted mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-crm-text">No Sales Activities Found</h3>
          <p className="text-xs text-crm-textSecondary mt-1 max-w-sm mx-auto">
            Log client calls, discovery sessions, and follow-ups to track sales momentum.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsLogModalOpen(true)}
          >
            Log First Activity
          </Button>
        </div>
      ) : (
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
      )}

      <LogActivityModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />
    </div>
  );
};
