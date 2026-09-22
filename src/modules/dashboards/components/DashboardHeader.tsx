import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { DashboardPersona, PERSONA_PROFILES, PersonaProfile } from '../types';
import { SmartQuickActions } from './SmartQuickActions';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Sliders, 
  ChevronDown, 
  Check, 
  UserCheck,
  Briefcase,
  Sparkles,
  RefreshCw,
  Play,
  Square
} from 'lucide-react';

interface DashboardHeaderProps {
  persona: DashboardPersona;
  onSelectPersona: (persona: DashboardPersona) => void;
  onOpenCustomizer: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  persona,
  onSelectPersona,
  onOpenCustomizer
}) => {
  const { 
    currentUser, 
    meetings, 
    followUps, 
    leads, 
    attendanceRecords,
    projects,
    punchIn,
    punchOut,
    addToast
  } = useCRM();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const personaRef = useRef<HTMLDivElement>(null);

  // Shift & attendance calculation for header quick punch action
  const myRecord = attendanceRecords.find(r => r.employeeId === currentUser.id && (r.date === '2026-09-21' || r.date === new Date().toISOString().split('T')[0]));
  const isPunchedIn = Boolean(myRecord && (myRecord.status === 'present' || myRecord.status === 'working' || myRecord.sessionState === 'working'));
  const workMins = myRecord?.totalWorkingMinutes || 382;
  const workHoursStr = `${Math.floor(workMins / 60)}h ${workMins % 60}m`;

  const handlePunchToggle = () => {
    if (isPunchedIn) {
      punchOut(currentUser.id);
      addToast({ type: 'info', title: 'Punched Out', message: 'Shift concluded for today.' });
    } else {
      punchIn(currentUser.id);
      addToast({ type: 'success', title: 'Punched In', message: 'Shift started! Have a productive day.' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setIsPersonaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeProfile = PERSONA_PROFILES.find(p => p.id === persona) || PERSONA_PROFILES[0];

  // Dynamic persona-specific sub-status telemetry
  const getSubStatus = () => {
    switch (persona) {
      case 'super_admin':
        return (
          <div className="flex items-center gap-3 text-xs text-crm-textMuted flex-wrap">
            <span className="flex items-center gap-1 text-crm-text">
              <Building2 className="w-3.5 h-3.5 text-turquoise" />
              Star Chain Labs India Pvt Ltd
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-crm-textMuted" />
              Monday, Sep 21, 2026
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        );

      case 'admin':
        return (
          <div className="flex items-center gap-3 text-xs text-crm-textMuted flex-wrap">
            <span className="text-crm-text">Operations & Infrastructure Desk</span>
            <span>·</span>
            <span>Sep 21, 2026</span>
            <span>·</span>
            <span className="text-turquoise">127 Total Employees</span>
          </div>
        );

      case 'manager':
        return (
          <div className="flex items-center gap-3 text-xs text-crm-textMuted flex-wrap">
            <span className="text-crm-text font-medium">Engineering & Product Pod</span>
            <span>·</span>
            <span>{projects.length} Active Workstreams</span>
            <span>·</span>
            <span className="text-emerald-400">Sprint 38 in Progress</span>
          </div>
        );

      case 'sales_exec':
        const todayMeetings = meetings.filter(m => m.date === '2026-09-21').length;
        const todayFollowUps = followUps.filter(f => f.status === 'today' || f.dueDate === '2026-09-21').length;
        const todayLeads = leads.filter(l => l.stage === 'new').length;
        return (
          <div className="flex items-center gap-3 text-xs text-crm-text flex-wrap">
            <span className="text-turquoise font-medium">{todayMeetings} Meetings Today</span>
            <span className="text-crm-border">•</span>
            <span className="text-amber-400 font-medium">{todayFollowUps} Follow-ups Queued</span>
            <span className="text-crm-border">•</span>
            <span className="text-crm-textMuted">{todayLeads} Inbound Leads</span>
          </div>
        );

      case 'sales_manager':
        return (
          <div className="flex items-center gap-3 text-xs text-crm-textMuted flex-wrap">
            <span className="text-crm-text font-medium">B2B Enterprise Sales Division</span>
            <span>·</span>
            <span className="text-turquoise">Target: $400,000</span>
            <span>·</span>
            <span>Q3 Closing Sprint</span>
          </div>
        );

      case 'developer':
        const myRecord = attendanceRecords.find(r => r.employeeId === currentUser.id && r.date === '2026-09-21');
        const isWorking = myRecord ? (myRecord.status === 'present' || myRecord.status === 'working') : true;
        const punchIn = myRecord?.punchIn || '09:14 AM';
        return (
          <div className="flex items-center gap-3 text-xs text-crm-textMuted flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <strong className="text-crm-text">Current Status:</strong> {isWorking ? 'Working' : 'Idle'}
            </span>
            <span>·</span>
            <span><strong className="text-crm-text">Punch In:</strong> {punchIn}</span>
            <span>·</span>
            <span className="text-turquoise"><strong className="text-crm-text">Elapsed:</strong> 06h 22m</span>
          </div>
        );

      case 'finance':
        return (
          <div className="flex items-center gap-3 text-xs text-crm-textMuted flex-wrap">
            <span className="text-crm-text font-medium">Star Chain Treasury & Accounts</span>
            <span>·</span>
            <span>FY 2026-27</span>
            <span>·</span>
            <span className="text-emerald-400">Books Reconciled</span>
          </div>
        );

      case 'hr':
        return (
          <div className="flex items-center gap-3 text-xs text-crm-textMuted flex-wrap">
            <span className="text-crm-text font-medium">People & Culture Operations</span>
            <span>·</span>
            <span>Bengaluru & Remote</span>
            <span>·</span>
            <span className="text-turquoise">Attendance 96%</span>
          </div>
        );

      case 'client':
        return (
          <div className="flex items-center gap-3 text-xs text-crm-textMuted flex-wrap">
            <span className="text-crm-text font-medium">ABC Technologies Client Workspace</span>
            <span>·</span>
            <span className="text-turquoise">Phase 2 Delivery Active</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-6 bg-crm-card border border-crm-border rounded-lg p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Greeting & Role Sub-status */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-crm-text">
              Good Morning, {currentUser.name}
            </h1>
            <Badge variant="primary" className="text-[10px] tracking-wide uppercase px-2 py-0.5">
              {activeProfile.badge}
            </Badge>
          </div>
          {getSubStatus()}
        </div>

        {/* Right: Quick Actions, Customize, & Persona Preview Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <SmartQuickActions persona={persona} />

          {/* Primary Interactive Shift Punch In/Out for Internal Staff */}
          {persona !== 'client' && (
            <button
              onClick={handlePunchToggle}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all border shadow-sm",
                isPunchedIn
                  ? "bg-teal-950/70 text-teal-300 border-teal-500/40 hover:bg-teal-900/80 hover:border-teal-400"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-emerald-500/20 shadow-md font-bold"
              )}
              title={isPunchedIn ? "Click to Clock Out shift" : "Click to Punch In today"}
            >
              {isPunchedIn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Clock Out ({workHoursStr})</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-slate-950" />
                  <span>Punch In Now</span>
                </>
              )}
            </button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCustomizer}
            className="text-xs text-crm-textMuted hover:text-crm-text gap-1.5"
            title="Customize Widgets"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Customize</span>
          </Button>

          {/* Persona Switcher Dropdown */}
          <div className="relative" ref={personaRef}>
            <button
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border hover:border-turquoise/40 rounded-md text-xs transition-colors"
              title="Switch Active Persona"
            >
              <span className="text-crm-textMuted">Role:</span>
              <span className="font-semibold text-turquoise">{activeProfile.label}</span>
              <ChevronDown className="w-3 h-3 text-crm-textMuted" />
            </button>

            {isPersonaMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-crm-card border border-crm-border rounded-lg shadow-2xl py-1 z-30 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-crm-border/60">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-crm-textMuted">
                    Preview Role Dashboard
                  </p>
                  <p className="text-[11px] text-crm-textMuted mt-0.5">
                    Toggle active view to test role-specific dashboards
                  </p>
                </div>

                {PERSONA_PROFILES.map(prof => {
                  const isSelected = prof.id === persona;
                  return (
                    <button
                      key={prof.id}
                      onClick={() => {
                        onSelectPersona(prof.id);
                        setIsPersonaMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-start justify-between gap-2 text-xs transition-colors ${
                        isSelected 
                          ? 'bg-turquoise/10 text-turquoise' 
                          : 'text-crm-text hover:bg-crm-surfaceHover'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{prof.label}</span>
                          <span className="text-[9px] px-1 rounded bg-crm-surface text-crm-textMuted border border-crm-border/50">
                            {prof.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-crm-textMuted line-clamp-1 mt-0.5">
                          {prof.description}
                        </p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-turquoise flex-shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1-Click Role Persona Quick-Selector Bar */}
      <div className="mt-4 pt-3.5 border-t border-crm-border/60">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-crm-textMuted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-turquoise" />
            Switch Role Persona View
          </span>
          <span className="text-[10px] text-turquoise/80 font-mono">
            Active: {activeProfile.label} ({activeProfile.badge})
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {PERSONA_PROFILES.map(prof => {
            const isSelected = prof.id === persona;
            return (
              <button
                key={prof.id}
                onClick={() => onSelectPersona(prof.id)}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-turquoise text-crm-bg font-bold shadow-md shadow-turquoise/20'
                    : 'bg-crm-surface hover:bg-crm-surfaceHover text-crm-textMuted hover:text-crm-text border border-crm-border/60 hover:border-turquoise/40'
                }`}
              >
                <span>{prof.label}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-crm-bg animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
