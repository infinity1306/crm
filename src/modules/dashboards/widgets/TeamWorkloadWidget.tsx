import React from 'react';
import { useCRM } from '../../../context/CRMContext';
import { WidgetContainer } from '../components/WidgetContainer';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { CheckSquare, AlertTriangle, ChevronRight } from 'lucide-react';

export const TeamWorkloadWidget: React.FC = () => {
  const { employees, tasks, navigateTo } = useCRM();

  const activeEmployees = employees.filter(e => e.status === 'active').slice(0, 6);

  return (
    <WidgetContainer
      title="Team Workload & Capacity"
      subtitle="Task distribution, completion rates, and sprint bottlenecks per engineer"
      badge={`${activeEmployees.length} Pod Members`}
      action={
        <button
          onClick={() => navigateTo('/app/team')}
          className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
        >
          Team Directory <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-crm-border/60 text-[10px] uppercase font-bold text-crm-textMuted tracking-wider">
              <th className="pb-2.5 font-semibold">Team Member</th>
              <th className="pb-2.5 font-semibold text-center">Assigned</th>
              <th className="pb-2.5 font-semibold text-center">Done</th>
              <th className="pb-2.5 font-semibold text-center">In Progress</th>
              <th className="pb-2.5 font-semibold text-center">Blocked</th>
              <th className="pb-2.5 font-semibold text-right">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-crm-border/30">
            {activeEmployees.map(emp => {
              const empTasks = tasks.filter(t => t.assigneeId === emp.id);
              const done = empTasks.filter(t => t.status === 'done').length;
              const inProgress = empTasks.filter(t => t.status === 'in_progress').length;
              const blocked = empTasks.filter(t => t.status === 'blocked').length;
              const total = empTasks.length;

              // Capacity estimation
              const capacityPercent = Math.min(100, Math.round((total / 8) * 100));

              return (
                <tr 
                  key={emp.id}
                  onClick={() => navigateTo(`/app/team/${emp.id}`)}
                  className="hover:bg-crm-surfaceHover/60 cursor-pointer transition-colors"
                >
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={emp.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-crm-text truncate">{emp.name}</p>
                        <p className="text-[10px] text-crm-textMuted truncate">{emp.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-center font-mono font-medium text-crm-text">
                    {total}
                  </td>
                  <td className="py-2.5 text-center font-mono text-emerald-400">
                    {done}
                  </td>
                  <td className="py-2.5 text-center font-mono text-turquoise">
                    {inProgress}
                  </td>
                  <td className="py-2.5 text-center font-mono">
                    {blocked > 0 ? (
                      <span className="text-red-400 font-bold">{blocked}</span>
                    ) : (
                      <span className="text-crm-textMuted">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <span className="text-[10px] font-mono text-crm-textMuted">
                        {capacityPercent}%
                      </span>
                      <div className="w-12 h-1.5 bg-crm-surface rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            capacityPercent > 85 ? 'bg-red-500' :
                            capacityPercent > 60 ? 'bg-amber-400' : 'bg-turquoise'
                          }`}
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </WidgetContainer>
  );
};
