import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../types/attendance';
import { calcAccruedCL } from '../../data/attendanceMockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { RequestLeaveModal } from './RequestLeaveModal';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Check, 
  X, 
  MessageSquare, 
  UserCheck, 
  ShieldCheck, 
  History,
  TrendingDown
} from 'lucide-react';

export const LeaveManagementDesk: React.FC = () => {
  const { 
    currentUser, 
    leaveRequests, 
    leaveBalances, 
    reviewLeaveRequest, 
    cancelLeaveRequest,
    navigateTo 
  } = useCRM();

  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'approvals' | 'history' | 'balances'>('approvals');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [reviewNoteModal, setReviewNoteModal] = useState<{ id: string; action: 'approve' | 'reject' | 'changes'; name: string } | null>(null);
  const [reviewNoteText, setReviewNoteText] = useState('');

  // User's own balance — CL-only system (12 CL/year, 1 per month)
  const accrued = calcAccruedCL();
  const userBalance = leaveBalances[currentUser.id] || {
    employeeId: currentUser.id,
    annual: { total: 0, used: 0, pending: 0, remaining: 0 },
    sick: { total: 0, used: 0, pending: 0, remaining: 0 },
    casual: { total: accrued, used: 0, pending: 0, remaining: accrued },
    unpaid: { used: 0 }
  };
  // Ensure legacy balances get the correct CL total (in case stored before migration)
  const clTotal = Math.max(userBalance.casual.total, accrued);
  const clBalance = {
    ...userBalance.casual,
    total: clTotal,
    remaining: Math.max(0, clTotal - userBalance.casual.used - userBalance.casual.pending)
  };

  const pendingRequests = useMemo(() => {
    return leaveRequests.filter(r => r.status === 'pending');
  }, [leaveRequests]);

  const filteredHistory = useMemo(() => {
    return leaveRequests.filter(req => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (typeFilter !== 'all' && req.leaveType !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = req.employeeName.toLowerCase().includes(q);
        const matchesReason = req.reason.toLowerCase().includes(q);
        const matchesRole = req.employeeRole.toLowerCase().includes(q);
        if (!matchesName && !matchesReason && !matchesRole) return false;
      }

      return true;
    });
  }, [leaveRequests, statusFilter, typeFilter, searchQuery]);

  const handleExecuteReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNoteModal) return;

    reviewLeaveRequest(reviewNoteModal.id, reviewNoteModal.action, reviewNoteText.trim());
    setReviewNoteModal(null);
    setReviewNoteText('');
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
            <CheckCircle2 className="w-2.5 h-2.5" />
            APPROVED
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Clock className="w-2.5 h-2.5" />
            PENDING REVIEW
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
            <XCircle className="w-2.5 h-2.5" />
            REJECTED
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            CANCELLED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-400" />
              <span>Leave Management & Approvals</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 uppercase">
              Phase 4 Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage personal leave balances, submit PTO applications, and review workforce absence requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            leftIcon={<Clock className="w-3.5 h-3.5 text-teal-400" />}
            onClick={() => navigateTo('/app/attendance')}
          >
            Attendance Dashboard
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setRequestModalOpen(true)}
          >
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Leave Balance — Casual Leave (CL) Card */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="p-4 bg-[#0D1216] border-[#1E262E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Casual Leave (CL)
            </span>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              12 CL / Year &nbsp;•&nbsp; 1 CL / Month
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">
              {clBalance.remaining}
            </span>
            <span className="text-xs text-slate-500 font-mono">Days Remaining</span>
            <span className="ml-auto text-[11px] font-mono text-slate-400">
              {clTotal} accrued so far this year
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(clBalance.used / Math.max(1, clTotal)) * 100}%` }}
              className="bg-slate-600 h-full"
              title={`${clBalance.used} used`}
            />
            <div
              style={{ width: `${(clBalance.pending / Math.max(1, clTotal)) * 100}%` }}
              className="bg-amber-500 h-full"
              title={`${clBalance.pending} pending`}
            />
            <div
              style={{ width: `${(clBalance.remaining / Math.max(1, clTotal)) * 100}%` }}
              className="bg-teal-500 h-full"
              title={`${clBalance.remaining} remaining`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>Used: <strong className="text-slate-300 font-normal">{clBalance.used}</strong></span>
            <span>Pending: <strong className="text-amber-400 font-normal">{clBalance.pending}</strong></span>
            <span>Remaining: <strong className="text-teal-400 font-normal">{clBalance.remaining}</strong></span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono pt-0.5">
            Apr – Mar leave year &nbsp;•&nbsp; Unused CL accumulates within the year &nbsp;•&nbsp; Balance resets every April
          </p>
        </Card>
      </div>

      {/* Tabs: Approvals Queue (Admin/Manager) | Full History | Organization Balances */}
      <div className="flex items-center justify-between border-b border-[#1E262E] pb-px">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative flex items-center gap-2 ${
              activeTab === 'approvals' ? 'text-teal-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Manager Approval Queue</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingRequests.length}
              </span>
            )}
            {activeTab === 'approvals' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === 'history' ? 'text-teal-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All Leave Applications & History</span>
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: MANAGER APPROVAL QUEUE */}
      {activeTab === 'approvals' && (
        <div className="space-y-3">
          {pendingRequests.length === 0 ? (
            <Card className="p-12 text-center bg-[#0D1216] border-[#1E262E]">
              <CheckCircle2 className="w-10 h-10 text-teal-500/60 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">Approval Queue is Clear</p>
              <p className="text-xs text-slate-500 mt-1">There are no pending leave requests awaiting your review.</p>
            </Card>
          ) : (
            pendingRequests.map(req => (
              <Card 
                key={req.id} 
                className="p-4 bg-[#0D1216] border-[#1E262E] hover:border-teal-500/30 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={req.employeeName} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          {req.employeeName}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                          {req.employeeRole}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        Requested: {req.requestedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="secondary"
                      size="xs"
                      className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs font-medium"
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => setReviewNoteModal({ id: req.id, action: 'approve', name: req.employeeName })}
                    >
                      Approve
                    </Button>

                    <Button
                      variant="secondary"
                      size="xs"
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs font-medium"
                      leftIcon={<X className="w-3.5 h-3.5" />}
                      onClick={() => setReviewNoteModal({ id: req.id, action: 'reject', name: req.employeeName })}
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                {/* Details Strip: Dates, Category, Duration */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 rounded bg-[#12181E] border border-[#1E262E] text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Category</span>
                    <span className="font-semibold text-teal-400 uppercase">{req.leaveType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Start Date</span>
                    <span className="font-semibold text-slate-200">{req.startDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">End Date</span>
                    <span className="font-semibold text-slate-200">{req.endDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Duration</span>
                    <span className="font-semibold text-white">{req.daysCount} Business Days</span>
                  </div>
                </div>

                {/* Reason & Optional Attachment */}
                <div className="text-xs bg-slate-900/40 p-3 rounded border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">
                    Employee Reason & Coverage
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    "{req.reason}"
                  </p>
                  {req.attachmentName && (
                    <div className="pt-1 text-[11px] font-mono text-teal-400 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>Attachment: {req.attachmentName}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 2: FULL LEAVE HISTORY TABLE */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <Card className="p-3.5 bg-[#0D1216] border-[#1E262E]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applicant name, reason, or role..."
                  className="pl-9 w-full text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'pending', label: 'Pending Review' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                  className="text-xs"
                />

                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Leave Types' },
                    { value: 'casual', label: 'Casual Leave (CL)' },
                  ]}
                  className="text-xs"
                />
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden bg-[#0D1216] border-[#1E262E] p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E262E] bg-[#12181E] text-slate-400 font-mono text-[11px] uppercase">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Dates</th>
                    <th className="py-3 px-3">Days</th>
                    <th className="py-3 px-3">Reason</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Reviewer Audit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E262E]/60 text-slate-300">
                  {filteredHistory.map(req => (
                    <tr key={req.id} className="hover:bg-[#12181E]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={req.employeeName} size="sm" />
                          <div>
                            <span className="font-semibold text-white block">
                              {req.employeeName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {req.employeeRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-teal-400 uppercase text-[11px]">
                        {req.leaveType}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                        {req.startDate} → {req.endDate}
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-white">
                        {req.daysCount}d
                      </td>

                      <td className="py-3 px-3 max-w-[240px] truncate text-slate-400" title={req.reason}>
                        {req.reason}
                      </td>

                      <td className="py-3 px-3">
                        {getStatusBadge(req.status)}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-400">
                        {req.reviewedByName ? (
                          <div>
                            <span className="font-semibold text-slate-200">{req.reviewedByName}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">{req.reviewedAt}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono italic">Awaiting</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {req.status === 'pending' && req.employeeId === currentUser.id && (
                          <Button
                            variant="secondary"
                            size="xs"
                            className="text-[10px] font-mono text-slate-400 hover:text-rose-400"
                            onClick={() => cancelLeaveRequest(req.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Review Modal */}
      {reviewNoteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0D1216] border border-[#1E262E] rounded-lg p-5 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              {reviewNoteModal.action === 'approve' ? 'Confirm Leave Approval' : 'Decline Leave Application'}
            </h3>
            <p className="text-xs text-slate-400">
              {reviewNoteModal.action === 'approve' ? (
                <span>Granting {reviewNoteModal.name}'s leave request. This will update their leave quota and mark their attendance calendar as approved leave.</span>
              ) : (
                <span>Please provide feedback to {reviewNoteModal.name} explaining why this request cannot be granted at this time.</span>
              )}
            </p>

            <form onSubmit={handleExecuteReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Manager Review Note / Condition (Optional)
                </label>
                <textarea
                  value={reviewNoteText}
                  onChange={(e) => setReviewNoteText(e.target.value)}
                  placeholder="e.g. Approved. Sprint handoff is verified with backend pod..."
                  className="w-full bg-[#12181E] border border-[#1E262E] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 min-h-[70px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E262E]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setReviewNoteModal(null)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className={reviewNoteModal.action === 'approve' ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'}
                >
                  Confirm {reviewNoteModal.action === 'approve' ? 'Approval' : 'Rejection'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      <RequestLeaveModal
        isOpen={isRequestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />
    </div>
  );
};
