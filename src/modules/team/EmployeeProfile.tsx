import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Clock, 
  Shield, 
  CheckCircle2, 
  FileText, 
  Lock, 
  UserX, 
  Edit3, 
  Plus, 
  Download, 
  ExternalLink,
  Sparkles,
  Layers,
  History,
  FolderKanban, 
  CheckSquare, 
  CalendarClock,
  Coffee,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Department, Role, EmployeeStatus } from '../../types';
import { EmployeeAttendanceProfile } from '../attendance/EmployeeAttendanceProfile';

interface EmployeeProfileProps {
  employeeId: string;
}

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employeeId }) => {
  const { 
    employees, 
    activityEvents, 
    notes, 
    documents, 
    projects,
    tasks,
    attendanceRecords,
    updateEmployee, 
    addEmployeeNote, 
    navigateTo 
  } = useCRM();

  const employee = employees.find(e => e.id === employeeId) || employees[0];

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: employee.name,
    designation: employee.designation,
    department: employee.department,
    role: employee.role,
    status: employee.status,
    phone: employee.phone,
    email: employee.email,
    location: employee.location || '',
    bio: employee.bio || ''
  });

  const employeeNotes = notes.filter(n => n.employeeId === employee.id);
  const employeeDocs = documents.filter(d => d.employeeId === employee.id || d.employeeId === 'emp-1');
  const employeeActivities = activityEvents.filter(a => a.actorId === employee.id || a.entityId === employee.id);
  const employeeProjects = projects.filter(p => p.managerId === employee.id || (p.teamIds && p.teamIds.includes(employee.id)));
  const employeeTasks = tasks.filter(t => t.assigneeId === employee.id);

  // Today's attendance record (Sep 21, 2026)
  const todayRecord = attendanceRecords.find(r => r.employeeId === employee.id && (r.date === '2026-09-27' || r.date === '2026-09-21'));
  const employeeAttendanceRecords = attendanceRecords.filter(r => r.employeeId === employee.id);

  // Monthly summary
  const monthlyAttendanceSummary = useMemo(() => {
    const present = employeeAttendanceRecords.filter(r => r.status === 'present' || r.status === 'working' || r.status === 'late').length;
    const absent = employeeAttendanceRecords.filter(r => r.status === 'absent').length;
    const leave = employeeAttendanceRecords.filter(r => r.status === 'leave').length;
    const late = employeeAttendanceRecords.filter(r => r.status === 'late' || r.lateMinutes > 0).length;
    const totalWorkingMins = employeeAttendanceRecords.reduce((acc, r) => acc + (r.totalWorkingMinutes || 0), 0);
    const totalHours = (totalWorkingMins / 60).toFixed(1);
    return { present, absent, leave, late, totalHours };
  }, [employeeAttendanceRecords]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    addEmployeeNote(employee.id, newNoteContent.trim());
    setNewNoteContent('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployee(employee.id, editFormData);
    setEditModalOpen(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'attendance', label: 'Attendance & Operations' },
    { id: 'projects', label: 'Projects', count: employeeProjects.length },
    { id: 'tasks', label: 'Tasks', count: employeeTasks.length },
    { id: 'activity', label: 'Activity Log', count: employeeActivities.length },
    { id: 'notes', label: 'Internal Notes', count: employeeNotes.length },
    { id: 'documents', label: 'Documents', count: employeeDocs.length },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={() => navigateTo('/app/team')}
          className="flex items-center gap-1.5 text-xs text-crm-textSecondary hover:text-turquoise transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Team Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            onClick={() => {
              setEditFormData({
                name: employee.name,
                designation: employee.designation,
                department: employee.department,
                role: employee.role,
                status: employee.status,
                phone: employee.phone,
                email: employee.email,
                location: employee.location || '',
                bio: employee.bio || ''
              });
              setEditModalOpen(true);
            }}
          >
            Edit Profile
          </Button>

          {employee.status === 'active' ? (
            <Button
              variant="outline"
              size="xs"
              className="text-red-400 hover:text-red-300"
              leftIcon={<UserX className="w-3.5 h-3.5" />}
              onClick={() => updateEmployee(employee.id, { status: 'suspended' })}
            >
              Suspend Account
            </Button>
          ) : (
            <Button
              variant="outline"
              size="xs"
              className="text-emerald-400 hover:text-emerald-300"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => updateEmployee(employee.id, { status: 'active' })}
            >
              Reactivate Account
            </Button>
          )}
        </div>
      </div>

      {/* 360° Header Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar 
            name={employee.name} 
            size="xl" 
            status={employee.status} 
            className="w-20 h-20 text-2xl" 
          />

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-crm-text">
                {employee.name}
              </h1>
              <Badge variant={employee.status} size="sm">
                {employee.status}
              </Badge>
              <Badge variant="role" size="sm">
                {employee.role.replace('_', ' ')}
              </Badge>
            </div>

            <p className="text-xs text-turquoise font-medium tracking-wide">
              {employee.designation} • {employee.department} Department
            </p>

            {employee.bio && (
              <p className="text-xs text-crm-textSecondary max-w-2xl leading-relaxed pt-1">
                {employee.bio}
              </p>
            )}

            {/* Meta Attributes Strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-crm-textMuted">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-crm-textDim" />
                <span className="text-crm-textSecondary">{employee.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-crm-textDim" />
                <span className="text-crm-textSecondary">{employee.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-crm-textDim" />
                <span>{employee.location || 'India'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-crm-textDim" />
                <span>Joined {employee.joinedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-crm-textDim" />
                <span>Active {employee.lastActive}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Work & Reporting Structure */}
          <div className="md:col-span-2 space-y-6">
            {/* Section 22: Attendance & Today's Operational Status */}
            <Card className="border-teal-900/40">
              <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-turquoise" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
                    Today's Operational & Attendance Status
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="text-xs text-turquoise hover:underline flex items-center gap-1 font-medium"
                >
                  <span>View Full Attendance Log</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-2.5 rounded bg-crm-surface/60 border border-crm-border">
                  <span className="text-[10px] text-crm-textMuted uppercase font-mono block">Status Today</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {todayRecord ? (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                        todayRecord.sessionState === 'working' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                        todayRecord.sessionState === 'on_break' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        todayRecord.status === 'leave' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        todayRecord.status === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        todayRecord.status === 'absent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {todayRecord.sessionState === 'working' ? 'WORKING NOW' :
                         todayRecord.sessionState === 'on_break' ? 'ON BREAK' :
                         todayRecord.status.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-xs text-crm-textMuted">Not Clocked In</span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-crm-surface/60 border border-crm-border">
                  <span className="text-[10px] text-crm-textMuted uppercase font-mono block">Punch In</span>
                  <span className="text-xs font-mono text-crm-text font-medium mt-1 block">
                    {todayRecord?.punchIn ? todayRecord.punchIn.split(' ')[1] || todayRecord.punchIn : '—'}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-crm-surface/60 border border-crm-border">
                  <span className="text-[10px] text-crm-textMuted uppercase font-mono block">Duration Worked</span>
                  <span className="text-xs font-mono text-teal-400 font-medium mt-1 block">
                    {todayRecord?.totalWorkingMinutes ? `${Math.floor(todayRecord.totalWorkingMinutes / 60)}h ${todayRecord.totalWorkingMinutes % 60}m` : '0h 0m'}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-crm-surface/60 border border-crm-border">
                  <span className="text-[10px] text-crm-textMuted uppercase font-mono block">Breaks Taken</span>
                  <span className="text-xs font-mono text-crm-text font-medium mt-1 block">
                    {todayRecord?.breaks ? `${todayRecord.breaks.length} (${todayRecord.breakMinutes || 0}m)` : '0m'}
                  </span>
                </div>
              </div>

              {todayRecord?.sessionState === 'working' && todayRecord.currentProjectName && (
                <div className="p-2.5 rounded bg-teal-950/20 border border-teal-800/30 flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-3.5 h-3.5 text-turquoise" />
                    <span className="text-crm-textSecondary">Active Context:</span>
                    <span className="font-medium text-crm-text">{todayRecord.currentProjectName}</span>
                    {todayRecord.currentTaskTitle && (
                      <span className="text-crm-textMuted">/ {todayRecord.currentTaskTitle}</span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-950/60 text-teal-300 border border-teal-800/40">ACTIVE CONTEXT</span>
                </div>
              )}

              {/* Monthly stats snapshot */}
              <div className="pt-3 border-t border-crm-border/60">
                <span className="text-[11px] text-crm-textMuted uppercase font-mono block mb-2">September 2026 Monthly Summary</span>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="p-2 rounded bg-crm-surface border border-crm-border/60">
                    <span className="text-xs font-mono text-teal-400 font-bold block">{monthlyAttendanceSummary.present}</span>
                    <span className="text-[10px] text-crm-textMuted">Present</span>
                  </div>
                  <div className="p-2 rounded bg-crm-surface border border-crm-border/60">
                    <span className="text-xs font-mono text-rose-400 font-bold block">{monthlyAttendanceSummary.absent}</span>
                    <span className="text-[10px] text-crm-textMuted">Absent</span>
                  </div>
                  <div className="p-2 rounded bg-crm-surface border border-crm-border/60">
                    <span className="text-xs font-mono text-amber-400 font-bold block">{monthlyAttendanceSummary.late}</span>
                    <span className="text-[10px] text-crm-textMuted">Late</span>
                  </div>
                  <div className="p-2 rounded bg-crm-surface border border-crm-border/60">
                    <span className="text-xs font-mono text-purple-400 font-bold block">{monthlyAttendanceSummary.leave}</span>
                    <span className="text-[10px] text-crm-textMuted">Leave</span>
                  </div>
                  <div className="p-2 rounded bg-crm-surface border border-crm-border/60">
                    <span className="text-xs font-mono text-slate-200 font-bold block">{monthlyAttendanceSummary.totalHours}h</span>
                    <span className="text-[10px] text-crm-textMuted">Hours</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
                Corporate Employment Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-crm-textMuted block text-[11px]">Department</span>
                  <span className="font-medium text-crm-text">{employee.department}</span>
                </div>
                <div>
                  <span className="text-crm-textMuted block text-[11px]">Designation</span>
                  <span className="font-medium text-crm-text">{employee.designation}</span>
                </div>
                <div>
                  <span className="text-crm-textMuted block text-[11px]">System Role (RBAC)</span>
                  <span className="font-mono text-turquoise uppercase">{employee.role}</span>
                </div>
                <div>
                  <span className="text-crm-textMuted block text-[11px]">Primary Timezone</span>
                  <span className="font-medium text-crm-text">{employee.timezone}</span>
                </div>
                <div>
                  <span className="text-crm-textMuted block text-[11px]">Direct Reports</span>
                  <span className="font-medium text-crm-text">{employee.directReports ?? 0} team members</span>
                </div>
                <div>
                  <span className="text-crm-textMuted block text-[11px]">Reporting Manager</span>
                  <span className="font-medium text-crm-text">
                    {employee.manager ? `${employee.manager.name} (${employee.manager.designation})` : 'Executive Board'}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
                Skills & Technical Competencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {employee.skills && employee.skills.length > 0 ? (
                  employee.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-crm-surface border border-crm-border text-xs text-crm-text font-mono"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-crm-textMuted italic">No skills registered yet.</span>
                )}
              </div>
            </Card>
          </div>

          {/* Right 1 Col: Emergency & Compliance */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
                Emergency Contact
              </h3>
              {employee.emergencyContact ? (
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-crm-textMuted block text-[11px]">Contact Name</span>
                    <span className="font-medium text-crm-text">{employee.emergencyContact.name}</span>
                  </div>
                  <div>
                    <span className="text-crm-textMuted block text-[11px]">Relationship</span>
                    <span className="text-crm-textSecondary">{employee.emergencyContact.relationship}</span>
                  </div>
                  <div>
                    <span className="text-crm-textMuted block text-[11px]">Phone Number</span>
                    <span className="font-mono text-crm-text">{employee.emergencyContact.phone}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-crm-textMuted italic">No emergency contact registered.</p>
              )}
            </Card>

            <Card>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
                Security & Credential Health
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-crm-textSecondary">Two-Factor Auth (2FA)</span>
                  <span className="text-emerald-400 font-mono text-[11px]">ENFORCED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-crm-textSecondary">Corporate SSO</span>
                  <span className="text-emerald-400 font-mono text-[11px]">LINKED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-crm-textSecondary">Hardware Security Key</span>
                  <span className="text-crm-textMuted font-mono text-[11px]">OPTIONAL</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Activity Log */}
      {activeTab === 'activity' && (
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
            Audit & System Event Trail for {employee.name}
          </h3>
          {employeeActivities.length === 0 ? (
            <p className="text-xs text-crm-textMuted py-8 text-center">
              No recent activity recorded for this employee.
            </p>
          ) : (
            <div className="divide-y divide-crm-border/60">
              {employeeActivities.map(act => (
                <div key={act.id} className="py-3 flex items-start gap-3 text-xs">
                  <Avatar name={act.actorName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-crm-text">
                      <strong className="font-semibold text-white">{act.actorName}</strong>{' '}
                      <span className="text-crm-textSecondary">{act.description}</span>
                    </p>
                    <span className="text-[10px] text-crm-textMuted font-mono mt-1 block">
                      {act.timestamp} • {act.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Internal Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-3">
              Add Operational Note
            </h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Record internal appraisal, compensation memo, or operational updates (visible only to managers and admins)..."
                rows={3}
                className="w-full p-3 rounded-md bg-crm-surface border border-crm-border text-xs text-crm-text placeholder:text-crm-textDim focus:outline-none focus:border-turquoise"
              />
              <div className="flex justify-end">
                <Button variant="primary" size="sm" type="submit">
                  Save Internal Note
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
              Historical Management Notes ({employeeNotes.length})
            </h3>
            {employeeNotes.length === 0 ? (
              <p className="text-xs text-crm-textMuted py-6 text-center">
                No notes logged for this profile yet.
              </p>
            ) : (
              <div className="space-y-3">
                {employeeNotes.map(n => (
                  <div key={n.id} className="p-3 rounded bg-crm-surface/60 border border-crm-border text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-crm-border/60 mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={n.authorName} size="xs" />
                        <span className="font-semibold text-crm-text">{n.authorName}</span>
                      </div>
                      <span className="text-[10px] text-crm-textMuted font-mono">{n.createdAt}</span>
                    </div>
                    <p className="text-crm-textSecondary leading-relaxed whitespace-pre-wrap">
                      {n.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'documents' && (
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-crm-border mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary">
              Official Compliance & Employment Documents
            </h3>
            <span className="text-xs text-crm-textMuted font-mono">
              {employeeDocs.length} Verified Files
            </span>
          </div>

          <div className="divide-y divide-crm-border/60">
            {employeeDocs.map(doc => (
              <div key={doc.id} className="py-3 flex items-center justify-between text-xs hover:bg-crm-surface/40 px-2 rounded -mx-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-crm-surface text-turquoise border border-crm-border">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-crm-text">{doc.title}</h4>
                    <p className="text-[11px] text-crm-textMuted font-mono">
                      {doc.fileName} • {doc.fileSize} • Uploaded {doc.uploadedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                    VERIFIED
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => alert(`Downloading verified document: ${doc.fileName}`)}
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5 text-crm-textSecondary" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Attendance & Operations */}
      {activeTab === 'attendance' && (
        <div>
          <EmployeeAttendanceProfile employeeId={employee.id} />
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-crm-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary">
              Assigned Delivery Projects ({employeeProjects.length})
            </h3>
            <Button
              variant="outline"
              size="xs"
              leftIcon={<FolderKanban className="w-3.5 h-3.5" />}
              onClick={() => navigateTo('/app/projects')}
            >
              Open Projects Desk
            </Button>
          </div>

          {employeeProjects.length === 0 ? (
            <Card className="py-10 text-center">
              <FolderKanban className="w-8 h-8 text-crm-textMuted mx-auto mb-2" />
              <p className="text-xs text-crm-textMuted">No active projects assigned to {employee.name}.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employeeProjects.map(proj => (
                <Card 
                  key={proj.id} 
                  className="p-4 hover:border-turquoise/50 cursor-pointer transition-all"
                  onClick={() => navigateTo(`/app/projects/${proj.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-crm-textMuted uppercase">{proj.id.toUpperCase()}</span>
                      <h4 className="text-sm font-semibold text-crm-text hover:text-turquoise transition-colors">
                        {proj.name}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {proj.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-crm-textSecondary line-clamp-2 mb-3">
                    {proj.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-crm-border/60 text-[11px] text-crm-textMuted font-mono">
                    <span>{proj.managerId === employee.id ? 'PROJECT MANAGER' : 'TEAM MEMBER'}</span>
                    <span>TARGET: {proj.deadline}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-crm-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary">
              Assigned Operational Tasks ({employeeTasks.length})
            </h3>
            <Button
              variant="outline"
              size="xs"
              leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
              onClick={() => navigateTo('/app/tasks')}
            >
              Open Delivery Board
            </Button>
          </div>

          {employeeTasks.length === 0 ? (
            <Card className="py-10 text-center">
              <CheckSquare className="w-8 h-8 text-crm-textMuted mx-auto mb-2" />
              <p className="text-xs text-crm-textMuted">No operational tasks assigned to {employee.name}.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {employeeTasks.map(task => (
                <div
                  key={task.id}
                  className="p-3 rounded bg-crm-surface/70 border border-crm-border hover:border-turquoise/40 flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono text-crm-textMuted">{task.id.toUpperCase()}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-crm-text truncate">{task.title}</p>
                      <p className="text-[11px] text-crm-textMuted">Due: {task.deadline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      task.priority === 'critical' ? 'bg-rose-950/50 text-rose-300 border border-rose-800/40' :
                      task.priority === 'high' ? 'bg-amber-950/50 text-amber-300 border border-amber-800/40' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Profile — ${employee.name}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-3.5">
            <Input
              label="Full Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Designation / Title"
                value={editFormData.designation}
                onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
              />
              <Select
                label="Department"
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value as Department })}
                options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Product', label: 'Product' },
                  { value: 'Design', label: 'Design' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'HR', label: 'HR' },
                  { value: 'Operations', label: 'Operations' },
                  { value: 'Finance', label: 'Finance' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Role"
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as Role })}
                options={[
                  { value: 'super_admin', label: 'Super Admin' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'employee', label: 'Employee' },
                  { value: 'client', label: 'Client' },
                ]}
              />
              <Select
                label="Status"
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as EmployeeStatus })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'invited', label: 'Invited' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
              <Input
                label="Phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <Input
              label="Location"
              value={editFormData.location}
              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
            />
            <div>
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider mb-1">
                Bio / Summary
              </label>
              <textarea
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                rows={3}
                className="w-full p-2.5 rounded-md bg-crm-surface border border-crm-border text-xs text-crm-text placeholder:text-crm-textDim focus:outline-none focus:border-turquoise"
              />
            </div>

            <div className="border-t border-crm-border pt-4 flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
