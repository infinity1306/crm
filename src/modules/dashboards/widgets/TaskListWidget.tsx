import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { WidgetContainer } from '../components/WidgetContainer';
import { Badge } from '../../../components/ui/Badge';
import { TaskStatus, TaskPriority } from '../../../types/projects';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  CheckCircle2,
  Circle
} from 'lucide-react';

interface TaskListWidgetProps {
  title?: string;
  subtitle?: string;
  scope?: 'assigned_to_me' | 'today_due' | 'blocked' | 'team_all';
  maxTasks?: number;
}

export const TaskListWidget: React.FC<TaskListWidgetProps> = ({
  title = "Today's Tasks",
  subtitle = "Immediate tasks requiring execution",
  scope = 'assigned_to_me',
  maxTasks = 5
}) => {
  const { tasks, currentUser, updateTaskStatus, navigateTo } = useCRM();

  const todayStr = '2026-09-21';

  const getFilteredTasks = () => {
    switch (scope) {
      case 'assigned_to_me':
        return tasks.filter(t => t.assigneeId === currentUser.id);
      case 'today_due':
        return tasks.filter(t => (t.assigneeId === currentUser.id || !t.assigneeId) && t.deadline && t.deadline <= todayStr && t.status !== 'done');
      case 'blocked':
        return tasks.filter(t => t.status === 'blocked');
      case 'team_all':
      default:
        return tasks;
    }
  };

  const taskList = getFilteredTasks().slice(0, maxTasks);

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="error">Critical</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="neutral">Medium</Badge>;
      case 'low':
      default:
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return <span className="text-[10px] text-emerald-400 font-medium">Completed</span>;
      case 'in_progress':
        return <span className="text-[10px] text-turquoise font-medium">In Progress</span>;
      case 'blocked':
        return <span className="text-[10px] text-red-400 font-medium">Blocked</span>;
      case 'in_review':
        return <span className="text-[10px] text-amber-400 font-medium">In Review</span>;
      default:
        return <span className="text-[10px] text-crm-textMuted">Todo</span>;
    }
  };

  return (
    <WidgetContainer
      title={title}
      subtitle={subtitle}
      badge={`${taskList.length} Active`}
      action={
        <button
          onClick={() => navigateTo('/app/tasks')}
          className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
        >
          View Workspace <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {taskList.length === 0 ? (
        <div className="py-6 text-center text-xs text-crm-textMuted">
          No tasks matching this filter. Good job!
        </div>
      ) : (
        <div className="space-y-2">
          {taskList.map(task => {
            const isDone = task.status === 'done';
            const isOverdue = task.deadline && task.deadline < todayStr && !isDone;

            return (
              <div
                key={task.id}
                className="p-3 bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/60 hover:border-crm-borderHover rounded-md flex items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => updateTaskStatus(task.id, isDone ? 'in_progress' : 'done')}
                    className="text-crm-textMuted hover:text-turquoise transition-colors flex-shrink-0"
                    title={isDone ? "Mark in-progress" : "Mark completed"}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p className={`font-medium truncate ${isDone ? 'line-through text-crm-textMuted' : 'text-crm-text'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-crm-textMuted mt-0.5">
                      <span>{task.projectName}</span>
                      <span>•</span>
                      {task.deadline && (
                        <span className={isOverdue ? 'text-red-400 font-medium' : ''}>
                          Due: {task.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetContainer>
  );
};
