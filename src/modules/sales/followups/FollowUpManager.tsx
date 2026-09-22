import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { FollowUp } from '../../../types/crm';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Avatar } from '../../../components/ui/Avatar';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  UserCheck, 
  Search,
  Filter,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const FollowUpManager: React.FC = () => {
  const { 
    followUps, 
    completeFollowUp, 
    addFollowUp, 
    navigateTo, 
    currentUser, 
    addToast 
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick form
  const [taskDescription, setTaskDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('11:00 AM');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');

  const todayStr = new Date().toISOString().split('T')[0];

  // Categorize follow-ups
  const categorized = useMemo(() => {
    const today: FollowUp[] = [];
    const upcoming: FollowUp[] = [];
    const overdue: FollowUp[] = [];
    const completed: FollowUp[] = [];

    followUps.forEach(f => {
      if (f.status === 'completed') {
        completed.push(f);
      } else if (f.dueDate < todayStr) {
        overdue.push(f);
      } else if (f.dueDate === todayStr) {
        today.push(f);
      } else {
        upcoming.push(f);
      }
    });

    return { today, upcoming, overdue, completed };
  }, [followUps, todayStr]);

  const currentList = categorized[activeTab].filter(f => {
    return (
      (f.taskDescription || f.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.companyName && f.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDescription.trim() || !clientName.trim()) return;

    addFollowUp({
      clientName: clientName.trim(),
      companyName: companyName.trim() || 'Enterprise Client',
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      dueDate,
      dueTime,
      priority,
      taskDescription: taskDescription.trim()
    });

    setTaskDescription('');
    setClientName('');
    setCompanyName('');
    addToast({
      type: 'success',
      title: 'Follow-up Scheduled',
      message: 'New action item saved to your active queue.'
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-crm-text">Sales Follow-up Queue</h1>
            {categorized.overdue.length > 0 && (
              <Badge variant="warning">{categorized.overdue.length} Overdue</Badge>
            )}
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            SLA-driven outreach queue, contract checkpoints, meeting reminders, and prospect touches.
          </p>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('today')}
          className={cn(
            "p-3.5 rounded-lg border text-left transition-all",
            activeTab === 'today' ? "bg-turquoise/10 border-turquoise" : "bg-crm-card border-crm-border hover:border-turquoise/30"
          )}
        >
          <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Due Today</div>
          <div className="text-xl font-bold text-crm-text mt-0.5">{categorized.today.length}</div>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={cn(
            "p-3.5 rounded-lg border text-left transition-all",
            activeTab === 'overdue' ? "bg-amber-950/30 border-amber-500/50" : "bg-crm-card border-crm-border hover:border-amber-500/30"
          )}
        >
          <div className="text-[11px] uppercase tracking-wider text-amber-400 font-medium">Overdue Queue</div>
          <div className="text-xl font-bold text-amber-400 mt-0.5">{categorized.overdue.length}</div>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            "p-3.5 rounded-lg border text-left transition-all",
            activeTab === 'upcoming' ? "bg-turquoise/10 border-turquoise" : "bg-crm-card border-crm-border hover:border-turquoise/30"
          )}
        >
          <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Upcoming Tasks</div>
          <div className="text-xl font-bold text-turquoise mt-0.5">{categorized.upcoming.length}</div>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={cn(
            "p-3.5 rounded-lg border text-left transition-all",
            activeTab === 'completed' ? "bg-emerald-950/30 border-emerald-500/50" : "bg-crm-card border-crm-border hover:border-emerald-500/30"
          )}
        >
          <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Completed Archive</div>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">{categorized.completed.length}</div>
        </button>
      </div>

      {/* Quick Add Form Box */}
      <div className="p-4 rounded-lg bg-crm-card border border-crm-border space-y-3">
        <div className="text-xs font-semibold text-crm-text uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-turquoise" />
          <span>Quick Schedule Outreach Follow-up</span>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="lg:col-span-2">
            <input
              type="text"
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              placeholder="Action (e.g. Call CFO to confirm SOW sign-off)"
              className="w-full px-3 py-1.5 bg-crm-surface border border-crm-border rounded text-crm-text focus:outline-none focus:border-turquoise"
              required
            />
          </div>

          <div>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Client Name *"
              className="w-full px-3 py-1.5 bg-crm-surface border border-crm-border rounded text-crm-text focus:outline-none focus:border-turquoise"
              required
            />
          </div>

          <div>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Company"
              className="w-full px-3 py-1.5 bg-crm-surface border border-crm-border rounded text-crm-text focus:outline-none focus:border-turquoise"
            />
          </div>

          <div>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-2 py-1.5 bg-crm-surface border border-crm-border rounded text-crm-textSecondary focus:outline-none focus:border-turquoise"
              required
            />
          </div>

          <div>
            <Button variant="primary" size="sm" className="w-full" type="submit">
              Add Task
            </Button>
          </div>
        </form>
      </div>

      {/* Active Tasks Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-crm-border text-xs">
          <span className="font-semibold text-crm-text capitalize">
            {activeTab} Follow-ups ({currentList.length})
          </span>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-crm-textMuted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-crm-surface border border-crm-border rounded text-crm-text focus:outline-none focus:border-turquoise"
            />
          </div>
        </div>

        {currentList.length === 0 ? (
          <div className="text-center py-12 bg-crm-card border border-crm-border rounded-lg text-crm-textMuted text-xs">
            No follow-ups in the {activeTab} queue.
          </div>
        ) : (
          currentList.map(item => (
            <div
              key={item.id}
              className={cn(
                "p-3.5 rounded-lg border flex items-center justify-between gap-4 transition-colors text-xs",
                item.status === 'completed'
                  ? "bg-crm-card/50 border-crm-border/40 opacity-75"
                  : activeTab === 'overdue'
                  ? "bg-crm-card border-amber-900/40 hover:border-amber-500/40"
                  : "bg-crm-card border-crm-border hover:border-turquoise/40"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => {
                    completeFollowUp(item.id);
                    addToast({
                      type: 'success',
                      title: 'Task Done',
                      message: 'Marked follow-up as completed.'
                    });
                  }}
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                    item.status === 'completed'
                      ? "bg-turquoise border-turquoise text-crm-bg"
                      : "border-crm-border hover:border-turquoise"
                  )}
                >
                  {item.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                </button>

                <div className="min-w-0">
                  <div className={cn("font-medium text-crm-text", item.status === 'completed' && "line-through text-crm-textMuted")}>
                    {item.taskDescription || item.title || 'Follow-up Task'}
                  </div>
                  <div className="text-[11px] text-crm-textMuted flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-crm-text">{item.clientName}</span>
                    {item.companyName && (
                      <>
                        <span>•</span>
                        <span>{item.companyName}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1 text-turquoise">
                      <Clock className="w-3 h-3" />
                      <span>{item.dueDate} at {item.dueTime}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge variant={item.priority === 'high' ? 'warning' : 'neutral'}>
                  {item.priority}
                </Badge>
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-crm-textMuted">
                  <Avatar name={item.employeeName || item.assignedToName || 'Rep'} size="xs" />
                  <span className="truncate max-w-[100px]">{item.employeeName || item.assignedToName || 'Rep'}</span>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => navigateTo('/app/communication/messages')}
                  title="Direct Message Client"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-crm-textMuted hover:text-turquoise" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
