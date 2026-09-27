import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Search, 
  Bell, 
  Calendar, 
  Plus, 
  User, 
  Sliders, 
  LogOut, 
  Shield, 
  Check, 
  Building, 
  ChevronDown,
  UserPlus,
  FileText,
  Sparkles,
  ExternalLink,
  Clock,
  Play,
  Square
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Avatar } from '../ui/Avatar';
import { Role } from '../../types';
import { PERSONA_PROFILES } from '../../modules/dashboards/types';

export const TopNav: React.FC = () => {
  const { 
    currentUser, 
    employees,
    attendanceRecords,
    punchIn,
    punchOut,
    addToast,
    updateCurrentUser,
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    navigateTo, 
    setCommandPaletteOpen,
    setInviteModalOpen,
    switchUserRole
  } = useCRM();

  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isQuickCreateOpen, setQuickCreateOpen] = useState(false);
  const [isRoleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickCreateRef = useRef<HTMLDivElement>(null);

  // Today's attendance calculation for quick clock in/out
  const todayAttendance = attendanceRecords.find(r => r.employeeId === currentUser.id && r.date === '2026-09-21');
  const isPunchedIn = Boolean(todayAttendance && (todayAttendance.status === 'present' || todayAttendance.status === 'working' || todayAttendance.sessionState === 'working'));
  const workMins = todayAttendance?.totalWorkingMinutes || 382;
  const workHoursStr = `${Math.floor(workMins / 60)}h ${workMins % 60}m`;

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
        setRoleSwitcherOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (quickCreateRef.current && !quickCreateRef.current.contains(e.target as Node)) {
        setQuickCreateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const roles: { role: Role; label: string; desc: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Full root clearance' },
    { role: 'admin', label: 'Admin', desc: 'People, settings & audit operations' },
    { role: 'manager', label: 'Manager', desc: 'Team & department management' },
    { role: 'employee', label: 'Employee', desc: 'Standard staff workspace' },
    { role: 'client', label: 'Client', desc: 'Restricted external view' },
  ];

  return (
    <header className="h-14 figma-glass border-b border-white/10 flex items-center justify-between px-5 sticky top-0 z-20 select-none backdrop-blur-xl shadow-sm">
      {/* Left: Global Search Command Palette Button */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-crm-surface/70 hover:bg-crm-surface border border-white/5 hover:border-turquoise/40 rounded-lg text-xs text-crm-textMuted group transition-all shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-crm-textMuted group-hover:text-crm-text" />
            <span className="text-crm-textMuted group-hover:text-crm-textSecondary truncate">
              Search employees, clients, projects, tasks...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-crm-card border border-crm-border rounded text-crm-textMuted shadow-sm">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-4">
        {/* Date Display (matching user reference screenshot: Sun, 21 Sep 2026) */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-crm-surface/60 border border-crm-border/60 text-xs text-crm-textSecondary font-medium">
          <Calendar className="w-3.5 h-3.5 text-turquoise" />
          <span>Sun, 21 Sep 2026</span>
        </div>

        {/* Universal Quick Attendance Punch In/Out Pill (For all internal roles) */}
        {currentUser.role !== 'client' && (
          <button
            onClick={() => {
              if (isPunchedIn) {
                punchOut(currentUser.id);
                addToast({ type: 'info', title: 'Punched Out', message: 'Shift concluded for today.' });
              } else {
                punchIn(currentUser.id);
                addToast({ type: 'success', title: 'Punched In', message: 'Shift started! Have a productive day.' });
              }
            }}
            className={cn(
              "flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-mono transition-all border shadow-sm",
              isPunchedIn 
                ? "bg-teal-950/60 text-teal-300 border-teal-500/40 hover:bg-teal-900/60" 
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 font-bold shadow-emerald-500/20 shadow-sm animate-pulse"
            )}
            title={isPunchedIn ? "Click to Clock Out shift" : "Click to Punch In today"}
          >
            {isPunchedIn ? (
              <>
                <Square className="w-3 h-3 fill-current text-teal-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="font-semibold">{workHoursStr} · Clock Out</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current text-slate-950" />
                <span className="font-bold">Punch In</span>
              </>
            )}
          </button>
        )}

        {/* Quick Create Dropdown */}
        <div className="relative" ref={quickCreateRef}>
          <button
            onClick={() => setQuickCreateOpen(prev => !prev)}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border hover:border-crm-borderHover text-xs font-medium text-crm-text transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-turquoise" />
            <span className="hidden sm:inline">Quick Create</span>
            <ChevronDown className="w-3 h-3 text-crm-textMuted" />
          </button>

          {isQuickCreateOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-crm-card border border-crm-border rounded-md shadow-modal py-1 z-50 text-xs animate-in fade-in">
              <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-crm-textDim border-b border-crm-border mb-1">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  setInviteModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-crm-text hover:bg-crm-surface hover:text-turquoise transition-colors text-left"
              >
                <UserPlus className="w-4 h-4 text-turquoise" />
                <div>
                  <div className="font-medium">Invite Employee</div>
                  <div className="text-[10px] text-crm-textMuted">Send onboarding invitation</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  navigateTo('/app/team/emp-1');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-crm-text hover:bg-crm-surface hover:text-turquoise transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-turquoise" />
                <div>
                  <div className="font-medium">Add Internal Note</div>
                  <div className="text-[10px] text-crm-textMuted">Record operational memo</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  navigateTo('/app/settings/roles');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-crm-text hover:bg-crm-surface hover:text-turquoise transition-colors text-left"
              >
                <Shield className="w-4 h-4 text-turquoise" />
                <div>
                  <div className="font-medium">Security Matrix</div>
                  <div className="text-[10px] text-crm-textMuted">Audit roles & access</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(prev => !prev)}
            className="relative p-2 rounded text-crm-textSecondary hover:text-crm-text hover:bg-crm-surface border border-crm-border hover:border-crm-borderHover transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-turquoise ring-2 ring-crm-card" />
            )}
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-crm-card border border-crm-border rounded-lg shadow-modal overflow-hidden z-50 text-xs animate-in fade-in">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-crm-border bg-crm-surface/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-crm-text">Notifications</span>
                  {unreadNotifs.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-turquoise/20 text-turquoise">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-turquoise hover:text-turquoise-hover font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-crm-border/60">
                {notifications.slice(0, 5).map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      if (notif.link) {
                        setNotifDropdownOpen(false);
                        navigateTo(notif.link);
                      }
                    }}
                    className={`p-3.5 hover:bg-crm-surface/60 cursor-pointer transition-colors ${
                      !notif.isRead ? 'bg-turquoise/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-medium text-crm-text text-[11px]">{notif.title}</h5>
                      <span className="text-[10px] text-crm-textMuted font-mono whitespace-nowrap">
                        {notif.createdAt}
                      </span>
                    </div>
                    <p className="text-crm-textSecondary text-[11px] mt-1 line-clamp-2 leading-normal">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-crm-border bg-crm-surface/40 text-center">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(false);
                    navigateTo('/app/notifications');
                  }}
                  className="text-xs font-medium text-turquoise hover:text-turquoise-hover transition-colors"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(prev => !prev)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-md hover:bg-crm-surface border border-transparent hover:border-crm-border transition-colors group"
          >
            <Avatar name={currentUser.name} size="sm" status={currentUser.status} />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-crm-text group-hover:text-white truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-mono text-crm-textMuted capitalize">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-crm-textMuted group-hover:text-crm-text ml-0.5" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-crm-card border border-crm-border rounded-lg shadow-modal py-1.5 z-50 text-xs animate-in fade-in">
              <div className="px-4 py-2 border-b border-crm-border mb-1">
                <div className="font-semibold text-crm-text">{currentUser.name}</div>
                <div className="text-crm-textMuted text-[11px] truncate">{currentUser.email}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-turquoise/15 text-turquoise border border-turquoise/25">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-crm-textDim font-mono">ID: {currentUser.id}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigateTo('/app/profile');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-crm-text hover:bg-crm-surface hover:text-turquoise transition-colors text-left"
              >
                <User className="w-3.5 h-3.5 text-crm-textMuted" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigateTo('/app/profile');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-crm-text hover:bg-crm-surface hover:text-turquoise transition-colors text-left"
              >
                <Sliders className="w-3.5 h-3.5 text-crm-textMuted" />
                <span>Preferences</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigateTo('/app/settings/organization');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-crm-text hover:bg-crm-surface hover:text-turquoise transition-colors text-left"
              >
                <Building className="w-3.5 h-3.5 text-crm-textMuted" />
                <span>Organization Settings</span>
              </button>

              {/* Quick RBAC Role Tester */}
              <div className="my-1 border-t border-crm-border" />
              <button
                onClick={() => setRoleSwitcherOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-4 py-2 text-crm-text hover:bg-crm-surface text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-3.5 h-3.5 text-turquoise" />
                  <span>Preview as Role</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-crm-textMuted transition-transform ${isRoleSwitcherOpen ? 'rotate-180' : ''}`} />
              </button>

              {isRoleSwitcherOpen && (
                <div className="bg-crm-surface/70 border-y border-crm-border/60 py-1 px-1 my-1 space-y-0.5 max-h-60 overflow-y-auto">
                  {PERSONA_PROFILES.map(prof => {
                    const isCurrent = currentUser.role === prof.role && (prof.role !== 'admin' || currentUser.department === prof.department);
                    return (
                      <button
                        key={prof.id}
                        onClick={() => {
                          const matchedEmp = employees.find(e => e.id === prof.sampleEmployeeId);
                          if (matchedEmp) {
                            updateCurrentUser({
                              name: matchedEmp.name,
                              role: prof.role,
                              department: prof.department,
                              designation: matchedEmp.designation,
                              avatar: matchedEmp.avatar
                            });
                          } else {
                            switchUserRole(prof.role);
                            updateCurrentUser({
                              department: prof.department
                            });
                          }
                          setUserMenuOpen(false);
                          navigateTo('/app/dashboard');
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded hover:bg-crm-surface text-[11px] transition-colors text-left"
                      >
                        <div className="text-left min-w-0 pr-2">
                          <div className={isCurrent ? 'text-turquoise font-medium' : 'text-crm-text'}>
                            {prof.label}
                          </div>
                          <div className="text-[9px] text-crm-textMuted truncate">{prof.badge} · {prof.description}</div>
                        </div>
                        {isCurrent && (
                          <Check className="w-3.5 h-3.5 text-turquoise flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="my-1 border-t border-crm-border" />
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigateTo('/app/profile');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-red-950/30 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
