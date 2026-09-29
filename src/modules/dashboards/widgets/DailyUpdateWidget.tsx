import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { WidgetContainer } from '../components/WidgetContainer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Send, CheckCircle2, AlertTriangle, Clock, ChevronRight } from 'lucide-react';

export const DailyUpdateWidget: React.FC = () => {
  const { 
    currentUser, 
    projects, 
    submitDailyUpdate, 
    workUpdates, 
    navigateTo,
    addToast 
  } = useCRM();

  const [completed, setCompleted] = useState('');
  const [inProgress, setInProgress] = useState('');
  const [blockers, setBlockers] = useState('');
  const [next, setNext] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if today's update is already submitted
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayUpdate = workUpdates.find(u => u.employeeId === currentUser.id && (u.date === todayDateStr || u.date === '2026-09-27'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completed.trim() && !inProgress.trim()) {
      addToast({ type: 'warning', title: 'Empty Update', message: 'Please describe completed or in-progress work.' });
      return;
    }

    const proj = projects.find(p => p.id === selectedProjectId) || projects[0];

    submitDailyUpdate({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeAvatar: currentUser.avatar,
      employeeDesignation: currentUser.designation || currentUser.role,
      projectId: proj?.id || '',
      projectName: proj?.name || 'General Operations',
      completedItems: completed ? [completed] : ['Completed assigned subtasks'],
      inProgressItems: inProgress ? [inProgress] : ['Ongoing sprint task'],
      blockedItems: blockers ? [blockers] : [],
      nextActionItems: next ? [next] : ['Continue sprint pipeline'],
      hoursSpent: 7.5,
      date: todayDateStr
    });

    setIsSubmitted(true);
    addToast({ type: 'success', title: 'Daily Update Submitted', message: 'Your manager and team feed have been notified.' });
  };

  return (
    <WidgetContainer
      title="Daily Work Update"
      subtitle="Share today's progress, next steps, and blockers with the pod"
      badge={todayUpdate || isSubmitted ? "Submitted Today" : "Pending Today"}
      badgeType={todayUpdate || isSubmitted ? "success" : "warning"}
      action={
        <button
          onClick={() => navigateTo('/app/work-updates')}
          className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
        >
          View Feed <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {todayUpdate || isSubmitted ? (
        <div className="p-4 bg-crm-surface border border-crm-border/60 rounded-lg text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>You have already submitted your daily update for today!</span>
          </div>
          <div className="text-[11px] text-crm-textMuted pl-6 space-y-1">
            <p><strong>Project:</strong> {todayUpdate?.projectName || 'General Operations'}</p>
            <p><strong>Completed:</strong> {todayUpdate?.completedItems?.join(', ') || completed || 'Daily milestones'}</p>
            {todayUpdate?.blockedItems?.length ? (
              <p className="text-amber-400"><strong>Blockers:</strong> {todayUpdate.blockedItems.join(', ')}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-crm-textMuted mb-1">
                Completed Today
              </label>
              <Input
                placeholder="e.g. Implemented payment webhook handler"
                value={completed}
                onChange={e => setCompleted(e.target.value)}
                className="text-xs py-1.5"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-crm-textMuted mb-1">
                Currently In Progress
              </label>
              <Input
                placeholder="e.g. Writing unit test suite for billing"
                value={inProgress}
                onChange={e => setInProgress(e.target.value)}
                className="text-xs py-1.5"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-crm-textMuted mb-1">
                Blockers (if any)
              </label>
              <Input
                placeholder="e.g. Awaiting AWS staging credentials"
                value={blockers}
                onChange={e => setBlockers(e.target.value)}
                className="text-xs py-1.5"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-crm-textMuted mb-1">
                Next Priorities
              </label>
              <Input
                placeholder="e.g. Deploy PR to staging"
                value={next}
                onChange={e => setNext(e.target.value)}
                className="text-xs py-1.5"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-crm-textMuted">Project:</span>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="bg-crm-surface border border-crm-border text-crm-text text-xs rounded px-2 py-1"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <Button variant="primary" size="sm" type="submit" className="gap-1.5 text-xs">
              <Send className="w-3 h-3" /> Submit Update
            </Button>
          </div>
        </form>
      )}
    </WidgetContainer>
  );
};
