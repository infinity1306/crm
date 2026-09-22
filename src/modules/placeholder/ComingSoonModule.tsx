import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Database, 
  Lock, 
  FolderKanban, 
  Target, 
  Receipt, 
  CalendarClock, 
  LifeBuoy, 
  BarChart3, 
  MessageSquare,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface ComingSoonModuleProps {
  title: string;
  category: string;
  phase: string;
  description: string;
  plannedFeatures: string[];
  schemaEntities: string[];
}

export const ComingSoonModule: React.FC<ComingSoonModuleProps> = ({
  title,
  category,
  phase = 'Phase 2',
  description,
  plannedFeatures,
  schemaEntities
}) => {
  const { navigateTo } = useCRM();

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-crm-border">
        <button
          onClick={() => navigateTo('/app/overview')}
          className="flex items-center gap-1.5 text-xs text-crm-textSecondary hover:text-turquoise transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Overview Dashboard</span>
        </button>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30 uppercase">
          {phase} Roadmap Architecture
        </span>
      </div>

      <Card className="p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-crm-surface border border-crm-border flex items-center justify-center text-turquoise mx-auto">
          <Database className="w-7 h-7" />
        </div>

        <div className="space-y-1 max-w-lg mx-auto">
          <span className="text-[11px] font-mono text-crm-textMuted uppercase tracking-wider">
            {category} Module
          </span>
          <h1 className="text-xl font-bold tracking-tight text-crm-text">
            {title}
          </h1>
          <p className="text-xs text-crm-textSecondary leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-teal-950/20 border border-teal-800/40 text-xs text-left max-w-xl mx-auto flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-turquoise flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-emerald-300">Phase 1 Foundation Locked</span>
            <p className="text-crm-textSecondary text-[11px] leading-relaxed">
              Navigation routes, granular RBAC permissions, audit log channels, and data structures for this module are pre-wired into the Star Chain Labs internal OS foundation.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto pt-4">
          <div className="p-4 rounded-lg bg-crm-surface/60 border border-crm-border space-y-2">
            <h4 className="text-xs font-semibold text-crm-text uppercase tracking-wider">
              Planned Capabilities
            </h4>
            <ul className="space-y-1.5 text-xs text-crm-textSecondary">
              {plannedFeatures.map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-turquoise flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-crm-surface/60 border border-crm-border space-y-2">
            <h4 className="text-xs font-semibold text-crm-text uppercase tracking-wider">
              Relational Schema Mapping
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {schemaEntities.map((entity, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-crm-card border border-crm-border font-mono text-[11px] text-crm-textMuted"
                >
                  {entity}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-crm-textDim pt-2 leading-relaxed">
              PostgreSQL foreign keys and index strategies registered in system architecture.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Button variant="secondary" size="sm" onClick={() => navigateTo('/app/team')}>
            Inspect Team Management
          </Button>
        </div>
      </Card>
    </div>
  );
};
