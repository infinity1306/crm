import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { MetricCardWidget, MetricItem } from '../widgets/MetricCardWidget';
import { ActionCenterWidget } from '../widgets/ActionCenterWidget';
import { ActivityFeedWidget } from '../widgets/ActivityFeedWidget';
import { ProjectHealthWidget } from '../widgets/ProjectHealthWidget';
import { PersonalAttendanceWidget } from '../widgets/PersonalAttendanceWidget';
import { WidgetContainer } from '../components/WidgetContainer';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { WidgetId } from '../types';
import { 
  Users, 
  UserCheck, 
  FolderKanban, 
  IndianRupee, 
  ChevronRight,
  Clock,
  AlertTriangle,
  QrCode,
  Tablet,
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  MapPin,
  Laptop,
  Building2,
  TrendingUp,
  FileCheck,
  Lock
} from 'lucide-react';
import { OfficeQRModal } from '../../attendance/OfficeQRModal';
import { AttendanceKioskModal } from '../../attendance/AttendanceKioskModal';
import { AttendanceExceptionsCenter } from '../../attendance/AttendanceExceptionsCenter';
import { ShiftManagementModal } from '../../attendance/ShiftManagementModal';

interface AdminDashboardProps {
  enabledWidgets?: WidgetId[];
  onSwitchToEmployee?: () => void;
  onLockSession?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  enabledWidgets,
  onSwitchToEmployee,
  onLockSession 
}) => {
  const { 
    currentUser,
    employees, 
    projects, 
    tasks, 
    financeMetrics, 
    attendanceRecords, 
    correctionRequests,
    reviewCorrection,
    leaveRequests,
    reviewLeaveRequest,
    deals,
    todayDateStr,
    punchIn,
    attendanceExceptions,
    dismissException,
    navigateTo,
    addToast
  } = useCRM();

  // Modals state
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isKioskModalOpen, setIsKioskModalOpen] = useState(false);
  const [isExceptionsOpen, setIsExceptionsOpen] = useState(false);
  const [isShiftsOpen, setIsShiftsOpen] = useState(false);

  // Widget helper
  const isEnabled = (id: WidgetId) => !enabledWidgets || enabledWidgets.includes(id);

  // Attendance metrics calculation
  const todayRecords = attendanceRecords.filter(r => (r.date === todayDateStr || r.date === '2026-09-27' || r.date === '2026-09-21'));
  const presentCount = todayRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
  const workingNowCount = todayRecords.filter(r => r.sessionState === 'working').length;
  const onBreakCount = todayRecords.filter(r => r.sessionState === 'on_break').length;
  const lateCount = todayRecords.filter(r => r.status === 'late').length;

  // Pending queues
  const pendingCorrections = correctionRequests.filter(c => c.status === 'PENDING');
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const totalPendingApprovals = pendingCorrections.length + pendingLeaves.length;

  // Active workforce floor list
  const activeFloorStaff = todayRecords
    .filter(r => r.sessionState === 'working' || r.sessionState === 'on_break')
    .slice(0, 6);

  const handleApproveCorrection = (id: string) => {
    reviewCorrection(id, 'APPROVE', 'Approved by administrator');
    addToast({
      type: 'success',
      title: 'Correction Approved',
      message: 'Employee attendance record updated and logged in audit trail.'
    });
  };

  const handleRejectCorrection = (id: string) => {
    reviewCorrection(id, 'REJECT', 'Rejected by administrator');
    addToast({
      type: 'info',
      title: 'Correction Rejected',
      message: 'Employee has been notified.'
    });
  };

  const handleApproveLeave = (id: string) => {
    reviewLeaveRequest(id, 'approve', 'Approved by administrator');
    addToast({
      type: 'success',
      title: 'Leave Approved',
      message: 'Leave quota deducted and employee notified.'
    });
  };

  const handleRejectLeave = (id: string) => {
    reviewLeaveRequest(id, 'reject', 'Rejected by administrator');
    addToast({
      type: 'info',
      title: 'Leave Request Rejected',
      message: 'Status updated to rejected.'
    });
  };

  // High-level operational KPI cards
  const adminOperationalMetrics: MetricItem[] = [
    { 
      id: 'adm-staff', 
      label: 'Total Workforce', 
      value: `${employees.length} Staff`, 
      context: '100% Onboarded', 
      icon: Users, 
      onClick: () => navigateTo('/app/team') 
    },
    { 
      id: 'adm-pres', 
      label: "Today's Attendance", 
      value: `${presentCount} / ${employees.length}`, 
      context: `${Math.round((presentCount / (employees.length || 1)) * 100)}% Present Today`, 
      icon: UserCheck, 
      onClick: () => navigateTo('/app/attendance') 
    },
    { 
      id: 'adm-work', 
      label: 'Working On Floor', 
      value: `${workingNowCount} Active`, 
      context: `${onBreakCount} on break`, 
      icon: Clock, 
      onClick: () => navigateTo('/app/attendance/working-now') 
    },
    { 
      id: 'adm-excep', 
      label: 'Late / Exceptions', 
      value: `${lateCount} Detected`, 
      context: 'Grace window evaluated', 
      icon: AlertTriangle, 
      onClick: () => setIsExceptionsOpen(true) 
    },
    { 
      id: 'adm-appr', 
      label: 'Pending Approvals', 
      value: `${totalPendingApprovals} Waiting`, 
      context: `${pendingLeaves.length} leaves, ${pendingCorrections.length} fixes`, 
      icon: FileCheck, 
      onClick: () => navigateTo('/app/leave') 
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. ADMIN COMMAND HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-crm-card via-crm-surface to-crm-card border border-amber-500/30 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-crm-text tracking-tight">
                  Admin Command & Control Center
                </h1>
                <Badge variant="primary" className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-xs px-2.5 py-0.5 font-medium">
                  Administrative Clearance
                </Badge>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live System Authority
                </span>
              </div>
              <p className="text-xs text-crm-textMuted mt-1 flex items-center gap-2 flex-wrap">
                <span>Executive Telemetry</span>
                <span>•</span>
                <span>Company-wide Attendance & Approvals</span>
                <span>•</span>
                <span className="font-mono text-[11px] text-amber-300/90">Star Chain Labs HQ</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Employee View Switcher */}
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {onLockSession && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLockSession}
                className="text-xs border-red-500/30 text-red-300 hover:bg-red-500/10 gap-1.5 shadow-sm"
                title="Lock Admin Session"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>Lock Portal</span>
              </Button>
            )}

            {onSwitchToEmployee && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSwitchToEmployee}
                className="text-xs border-turquoise/40 text-turquoise hover:bg-turquoise/10 gap-1.5 shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5 text-turquoise" />
                <span>Switch to Employee View</span>
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('/app/attendance')}
              className="text-xs gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
            >
              <Clock className="w-3.5 h-3.5 text-slate-950" />
              <span>Full Attendance Desk</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. ADMIN OPERATIONAL KPI CARDS */}
      <MetricCardWidget metrics={adminOperationalMetrics} />

      {/* 3. ADMIN QUICK ACTION TOOLBAR */}
      <div className="p-4 bg-crm-card border border-crm-border rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-crm-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-crm-text uppercase tracking-wider">
              Workforce Operations Quick Actions
            </h3>
          </div>
          <span className="text-[11px] text-crm-textMuted font-mono">1-Click Admin Terminals</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setIsKioskModalOpen(true)}
            className="p-3 rounded-lg bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/80 hover:border-turquoise/40 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Tablet className="w-4 h-4 text-turquoise group-hover:scale-110 transition-transform" />
              <Badge variant="primary" className="text-[9px]">Launch</Badge>
            </div>
            <p className="text-xs font-bold text-crm-text">Office Kiosk</p>
            <p className="text-[10px] text-crm-textMuted">PIN / Badge terminal</p>
          </button>

          <button
            onClick={() => setIsQRModalOpen(true)}
            className="p-3 rounded-lg bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/80 hover:border-turquoise/40 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <QrCode className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <Badge variant="success" className="text-[9px]">Live 30s</Badge>
            </div>
            <p className="text-xs font-bold text-crm-text">Office Dynamic QR</p>
            <p className="text-[10px] text-crm-textMuted">Rotating check-in code</p>
          </button>

          <button
            onClick={() => setIsExceptionsOpen(true)}
            className="p-3 rounded-lg bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/80 hover:border-amber-500/40 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <Badge variant="warning" className="text-[9px]">{lateCount} Issues</Badge>
            </div>
            <p className="text-xs font-bold text-crm-text">Exceptions Desk</p>
            <p className="text-[10px] text-crm-textMuted">Lates & missed punches</p>
          </button>

          <button
            onClick={() => setIsShiftsOpen(true)}
            className="p-3 rounded-lg bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/80 hover:border-turquoise/40 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Settings className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <Badge variant="neutral" className="text-[9px]">Config</Badge>
            </div>
            <p className="text-xs font-bold text-crm-text">Shift Settings</p>
            <p className="text-[10px] text-crm-textMuted">Grace & break rules</p>
          </button>

          <button
            onClick={() => navigateTo('/app/attendance/working-now')}
            className="p-3 rounded-lg bg-crm-surface hover:bg-crm-surfaceHover border border-crm-border/80 hover:border-turquoise/40 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <UserCheck className="w-4 h-4 text-turquoise group-hover:scale-110 transition-transform" />
              <Badge variant="primary" className="text-[9px]">{workingNowCount} Live</Badge>
            </div>
            <p className="text-xs font-bold text-crm-text">Live Workforce Floor</p>
            <p className="text-[10px] text-crm-textMuted">Real-time floor map</p>
          </button>
        </div>
      </div>

      {/* 4. APPROVALS DESK: PENDING CORRECTIONS & LEAVES (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Attendance Corrections */}
        <div className="figma-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-crm-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-crm-text">Attendance Corrections Queue</h2>
                <p className="text-[11px] text-crm-textMuted">Employee missed punch requests requiring managerial approval</p>
              </div>
            </div>

            <Badge variant={pendingCorrections.length > 0 ? "warning" : "success"} className="text-[10px]">
              {pendingCorrections.length} Pending
            </Badge>
          </div>

          {pendingCorrections.length === 0 ? (
            <div className="p-8 text-center text-crm-textMuted text-xs bg-crm-surface/40 rounded-lg border border-dashed border-crm-border">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <p className="font-semibold text-crm-text">All Attendance Corrections Resolved</p>
              <p className="text-[11px] mt-0.5">No employee corrections waiting in the managerial queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCorrections.map(req => (
                <div key={req.id} className="p-3.5 bg-crm-surface rounded-lg border border-crm-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={req.employeeName} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-crm-text">{req.employeeName}</p>
                        <p className="text-[10px] text-crm-textMuted">Date: {req.workDate}</p>
                      </div>
                    </div>
                    <Badge variant="warning" className="text-[9px] uppercase">
                      {req.issueType}
                    </Badge>
                  </div>

                  <div className="text-[11px] bg-crm-card/60 p-2 rounded border border-crm-border/40 text-crm-textMuted space-y-0.5">
                    <p><strong className="text-crm-text">Requested Punch:</strong> {req.requestedPunchIn || '--:--'} to {req.requestedPunchOut || '--:--'}</p>
                    <p><strong className="text-crm-text">Reason:</strong> {req.reason}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectCorrection(req.id)}
                      className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 py-1"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApproveCorrection(req.id)}
                      className="text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Pending Leave Requests */}
        <div className="figma-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-crm-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-crm-text">Pending Leave Requests</h2>
                <p className="text-[11px] text-crm-textMuted">Time-off and holiday applications awaiting approval</p>
              </div>
            </div>

            <Badge variant={pendingLeaves.length > 0 ? "warning" : "success"} className="text-[10px]">
              {pendingLeaves.length} Pending
            </Badge>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="p-8 text-center text-crm-textMuted text-xs bg-crm-surface/40 rounded-lg border border-dashed border-crm-border">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <p className="font-semibold text-crm-text">No Pending Leave Requests</p>
              <p className="text-[11px] mt-0.5">Workforce leave roster is up to date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.slice(0, 3).map(req => (
                <div key={req.id} className="p-3.5 bg-crm-surface rounded-lg border border-crm-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={req.employeeName} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-crm-text">{req.employeeName}</p>
                        <p className="text-[10px] text-crm-textMuted">Type: {req.leaveType.toUpperCase()} ({req.daysCount} Days)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-crm-textMuted">
                      {req.startDate} to {req.endDate}
                    </span>
                  </div>

                  <p className="text-[11px] bg-crm-card/60 p-2 rounded border border-crm-border/40 text-crm-textMuted">
                    <strong className="text-crm-text">Reason:</strong> {req.reason}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectLeave(req.id)}
                      className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 py-1"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApproveLeave(req.id)}
                      className="text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. LIVE WORKFORCE FLOOR PREVIEW & TEAM TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Workforce Active Floor */}
        <WidgetContainer
          title="Active Workforce Floor"
          subtitle="Staff currently on shift or on break"
          badge={`${workingNowCount} Working`}
          badgeType="success"
          action={
            <button
              onClick={() => navigateTo('/app/attendance/working-now')}
              className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
            >
              Floor Map <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-crm-border/60 text-[10px] uppercase font-bold text-crm-textMuted tracking-wider">
                  <th className="pb-2 font-semibold">Staff Member</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">In Time</th>
                  <th className="pb-2 font-semibold text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crm-border/30">
                {activeFloorStaff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-crm-textMuted">
                      No active workers on shift right now.
                    </td>
                  </tr>
                ) : (
                  activeFloorStaff.map(member => {
                    const hrs = Math.floor(member.totalWorkingMinutes / 60);
                    const mins = member.totalWorkingMinutes % 60;
                    return (
                      <tr 
                        key={member.id}
                        onClick={() => navigateTo(`/app/team/${member.employeeId}`)}
                        className="hover:bg-crm-surfaceHover/60 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <Avatar name={member.employeeName} size="sm" />
                            <div>
                              <p className="font-semibold text-crm-text truncate">{member.employeeName}</p>
                              <p className="text-[10px] text-crm-textMuted flex items-center gap-1">
                                {member.workMode === 'REMOTE' ? (
                                  <><Laptop className="w-2.5 h-2.5 text-blue-400" /> Remote WFH</>
                                ) : (
                                  <><Building2 className="w-2.5 h-2.5 text-emerald-400" /> Office HQ</>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            member.sessionState === 'working' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              member.sessionState === 'working' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                            }`} />
                            {member.sessionState === 'working' ? 'Working' : 'On Break'}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-[11px] text-crm-text">
                          {member.punchIn || '--:--'}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[11px] text-turquoise font-medium">
                          {hrs}h {mins}m
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </WidgetContainer>

        {/* Project Delivery Health */}
        <ProjectHealthWidget title="Project Delivery Health" scope="all" maxProjects={4} />
      </div>

      {/* 6. OPERATIONS & RECENT AUDIT TIMELINE */}
      {isEnabled('live_activity') && (
        <ActivityFeedWidget title="Operations & Security Audit Log" filterScope="all" maxEvents={6} />
      )}

      {/* Modals */}
      {isQRModalOpen && (
        <OfficeQRModal 
          isOpen={isQRModalOpen} 
          onClose={() => setIsQRModalOpen(false)}
          onPunchWithQR={(token, locId) => {
            punchIn(currentUser.id, undefined, undefined, 'OFFICE', 'QR', locId);
            addToast({ type: 'success', title: 'QR Check-in Verified', message: 'Office attendance recorded.' });
            setIsQRModalOpen(false);
          }}
        />
      )}

      {isKioskModalOpen && (
        <AttendanceKioskModal isOpen={isKioskModalOpen} onClose={() => setIsKioskModalOpen(false)} />
      )}

      {isExceptionsOpen && (
        <Modal 
          isOpen={isExceptionsOpen} 
          onClose={() => setIsExceptionsOpen(false)} 
          title="Attendance Exceptions & Policy Center"
          size="xl"
        >
          <AttendanceExceptionsCenter 
            exceptions={attendanceExceptions}
            onRequestCorrection={(empId, empName, date, type) => {
              setIsExceptionsOpen(false);
              navigateTo('/app/attendance');
            }}
            onDismissException={(id) => {
              dismissException(id);
              addToast({ type: 'info', title: 'Exception Dismissed', message: 'Policy flag cleared.' });
            }}
          />
        </Modal>
      )}

      {isShiftsOpen && (
        <ShiftManagementModal isOpen={isShiftsOpen} onClose={() => setIsShiftsOpen(false)} />
      )}
    </div>
  );
};
