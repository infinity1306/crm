import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { WidgetContainer } from '../components/WidgetContainer';
import { Badge } from '../../../components/ui/Badge';
import { ProjectHealth } from '../../../types/projects';
import { FolderKanban, ChevronRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface ProjectHealthWidgetProps {
  title?: string;
  scope?: 'all' | 'assigned_to_me';
  maxProjects?: number;
}

export const ProjectHealthWidget: React.FC<ProjectHealthWidgetProps> = ({
  title = "Project Health & Delivery",
  scope = 'all',
  maxProjects = 4
}) => {
  const { 
    projects, 
    tasks, 
    currentUser, 
    calculateProjectProgress, 
    evaluateProjectHealth, 
    navigateTo 
  } = useCRM();

  const getFilteredProjects = () => {
    const active = projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled');
    if (scope === 'assigned_to_me') {
      return active.filter(p => p.managerId === currentUser.id || p.teamIds?.includes(currentUser.id) || p.teamMembers?.some(m => m.id === currentUser.id));
    }
    return active;
  };

  const projectList = getFilteredProjects().slice(0, maxProjects);

  const getHealthBadge = (health: ProjectHealth) => {
    switch (health) {
      case 'on_track':
        return <Badge variant="success">On Track</Badge>;
      case 'at_risk':
        return <Badge variant="warning">At Risk</Badge>;
      case 'delayed':
        return <Badge variant="error">Delayed</Badge>;
      default:
        return <Badge variant="neutral">Active</Badge>;
    }
  };

  return (
    <WidgetContainer
      title={title}
      subtitle="Sprint progress, milestone deadlines, and blockers"
      badge={`${projectList.length} Active`}
      action={
        <button
          onClick={() => navigateTo('/app/projects')}
          className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
        >
          All Projects <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {projectList.length === 0 ? (
        <div className="py-6 text-center text-xs text-crm-textMuted">
          No active projects assigned.
        </div>
      ) : (
        <div className="space-y-3">
          {projectList.map(project => {
            const progress = calculateProjectProgress(project.id).overall;
            const health = evaluateProjectHealth(project.id);
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const blockedCount = projectTasks.filter(t => t.status === 'blocked').length;

            return (
              <div
                key={project.id}
                onClick={() => navigateTo(`/app/projects/${project.id}`)}
                className="p-3 bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/60 hover:border-crm-borderHover rounded-md cursor-pointer transition-colors select-none"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-crm-text truncate">
                        {project.name}
                      </span>
                      {getHealthBadge(health)}
                      {blockedCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-medium">
                          <AlertTriangle className="w-2.5 h-2.5" /> {blockedCount} blocked
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-crm-textMuted mt-0.5">
                      Manager: {project.managerName || 'Unassigned'} · Due: {project.deadline || 'Ongoing'}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-turquoise flex-shrink-0">
                    {progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-crm-card rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      health === 'delayed' ? 'bg-red-500' :
                      health === 'at_risk' ? 'bg-amber-400' : 'bg-turquoise'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetContainer>
  );
};
