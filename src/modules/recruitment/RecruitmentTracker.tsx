import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Candidate, 
  TelephonicInterviewStatus, 
  RoundStatus, 
  CommunicationLevel, 
  RelocateOption 
} from '../../types/recruitment';
import { 
  getRecruitmentCandidates, 
  saveRecruitmentCandidate, 
  deleteRecruitmentCandidate, 
  exportCandidatesToCSV 
} from '../../services/recruitmentService';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  ShieldAlert, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock3, 
  Edit3, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Share2, 
  Plus, 
  X, 
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../utils/cn';

// Status badge configurations
const TELEPHONIC_STATUS_MAP: Record<TelephonicInterviewStatus, { label: string; badge: string; icon: React.ElementType }> = {
  interview_scheduled: { label: 'Interview Scheduled', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Clock3 },
  selected: { label: 'Selected', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
  on_hold: { label: 'On Hold', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: AlertCircle },
  reject: { label: 'Reject', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: XCircle },
  pending: { label: 'Pending', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Clock }
};

const ROUND_STATUS_MAP: Record<RoundStatus, { label: string; badge: string; icon: React.ElementType }> = {
  scheduled: { label: 'Scheduled', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Clock3 },
  selected: { label: 'Selected', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
  on_hold: { label: 'On Hold', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: AlertCircle },
  reject: { label: 'Reject', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: XCircle },
  pending: { label: 'Pending', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Clock }
};

const COMMUNICATION_MAP: Record<CommunicationLevel, { badge: string }> = {
  Excellent: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  Good: { badge: 'bg-turquoise/15 text-turquoise border-turquoise/30' },
  Average: { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  Poor: { badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' }
};

export const RecruitmentTracker: React.FC = () => {
  const { currentUser, navigateTo, addToast } = useCRM();

  // ACCESS CONTROL ENFORCEMENT: Strictly HR & Super Admin
  const hasAccess = useMemo(() => {
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.department === 'HR') return true;
    return false;
  }, [currentUser]);

  // Candidate Data State
  const [candidates, setCandidates] = useState<Candidate[]>(() => getRecruitmentCandidates());
  const [revision, setRevision] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [telephonicFilter, setTelephonicFilter] = useState('all');
  const [hrFilter, setHrFilter] = useState('all');
  const [managerialFilter, setManagerialFilter] = useState('all');
  const [relocateFilter, setRelocateFilter] = useState('all');
  const [selectedQuickTab, setSelectedQuickTab] = useState<'all' | 'selected' | 'on_hold' | 'reject'>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<Candidate>>({
    date: '2026-09-29',
    name: '',
    mobileNumber: '',
    email: '',
    positionAppliedFor: 'Software Engineer',
    currentLocation: '',
    homeTown: '',
    relocate: 'yes',
    highestQualification: 'B.Tech',
    experience: '',
    currentCompany: '',
    designation: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '30 Days',
    communication: 'Good',
    telephonicInterview: 'interview_scheduled',
    hrRound: 'pending',
    managerialRound: 'pending',
    remarks: ''
  });

  // Reload candidates upon revision
  const refreshCandidates = () => {
    setCandidates(getRecruitmentCandidates());
    setRevision(r => r + 1);
  };

  // Distinct position list for filter
  const positionsList = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach(c => {
      if (c.positionAppliedFor) set.add(c.positionAppliedFor);
    });
    return Array.from(set);
  }, [candidates]);

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      // Search matching name, email, phone, company, designation, location
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.mobileNumber.toLowerCase().includes(q) ||
          c.currentCompany.toLowerCase().includes(q) ||
          c.designation.toLowerCase().includes(q) ||
          c.positionAppliedFor.toLowerCase().includes(q) ||
          c.currentLocation.toLowerCase().includes(q) ||
          c.homeTown.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (positionFilter !== 'all' && c.positionAppliedFor !== positionFilter) {
        return false;
      }

      if (telephonicFilter !== 'all' && c.telephonicInterview !== telephonicFilter) {
        return false;
      }

      if (hrFilter !== 'all' && c.hrRound !== hrFilter) {
        return false;
      }

      if (managerialFilter !== 'all' && c.managerialRound !== managerialFilter) {
        return false;
      }

      if (relocateFilter !== 'all' && c.relocate !== relocateFilter) {
        return false;
      }

      // Quick tab filter
      if (selectedQuickTab === 'selected') {
        if (c.telephonicInterview !== 'selected' && c.hrRound !== 'selected' && c.managerialRound !== 'selected') return false;
      } else if (selectedQuickTab === 'on_hold') {
        if (c.telephonicInterview !== 'on_hold' && c.hrRound !== 'on_hold' && c.managerialRound !== 'on_hold') return false;
      } else if (selectedQuickTab === 'reject') {
        if (c.telephonicInterview !== 'reject' && c.hrRound !== 'reject' && c.managerialRound !== 'reject') return false;
      }

      return true;
    });
  }, [candidates, searchQuery, positionFilter, telephonicFilter, hrFilter, managerialFilter, relocateFilter, selectedQuickTab]);

  // Overall Recruitment Funnel Metrics
  const metrics = useMemo(() => {
    const total = candidates.length;
    const telephonicSelected = candidates.filter(c => c.telephonicInterview === 'selected').length;
    const hrSelected = candidates.filter(c => c.hrRound === 'selected').length;
    const managerialSelected = candidates.filter(c => c.managerialRound === 'selected').length;
    const onHold = candidates.filter(c => c.telephonicInterview === 'on_hold' || c.hrRound === 'on_hold' || c.managerialRound === 'on_hold').length;
    const rejected = candidates.filter(c => c.telephonicInterview === 'reject' || c.hrRound === 'reject' || c.managerialRound === 'reject').length;

    return {
      total,
      telephonicSelected,
      hrSelected,
      managerialSelected,
      onHold,
      rejected
    };
  }, [candidates]);

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      date: '2026-09-29',
      name: '',
      mobileNumber: '',
      email: '',
      positionAppliedFor: 'Senior Frontend Engineer',
      currentLocation: 'Bangalore',
      homeTown: '',
      relocate: 'yes',
      highestQualification: 'B.Tech',
      experience: '3 Years',
      currentCompany: '',
      designation: '',
      currentSalary: '₹8,00,000 LPA',
      expectedSalary: '₹12,00,000 LPA',
      noticePeriod: '30 Days',
      communication: 'Good',
      telephonicInterview: 'interview_scheduled',
      hrRound: 'pending',
      managerialRound: 'pending',
      remarks: ''
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (c: Candidate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCandidate(c);
    setFormData({ ...c });
    setIsEditModalOpen(true);
  };

  // Open View Dossier Modal
  const openViewModal = (c: Candidate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCandidate(c);
    setIsViewModalOpen(true);
  };

  // Save Candidate Submit
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.mobileNumber?.trim() || !formData.email?.trim()) {
      addToast({
        title: 'Compulsory Fields Required',
        message: 'Candidate Name, Mobile No. and Email ID are mandatory.',
        type: 'error'
      });
      return;
    }

    const newCandidate: Candidate = {
      id: formData.id || `cand-${Date.now()}`,
      date: formData.date || '2026-09-29',
      name: formData.name.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      email: formData.email.trim(),
      positionAppliedFor: formData.positionAppliedFor || 'Candidate',
      currentLocation: formData.currentLocation || '',
      homeTown: formData.homeTown || '',
      relocate: formData.relocate || 'yes',
      highestQualification: formData.highestQualification || '',
      experience: formData.experience || '',
      currentCompany: formData.currentCompany || '',
      designation: formData.designation || '',
      currentSalary: formData.currentSalary || '',
      expectedSalary: formData.expectedSalary || '',
      noticePeriod: formData.noticePeriod || '30 Days',
      communication: formData.communication || 'Good',
      telephonicInterview: formData.telephonicInterview || 'pending',
      hrRound: formData.hrRound || 'pending',
      managerialRound: formData.managerialRound || 'pending',
      remarks: formData.remarks || ''
    };

    saveRecruitmentCandidate(newCandidate);
    refreshCandidates();
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    addToast({
      title: 'Candidate Profile Saved',
      message: `${newCandidate.name} recorded in Recruitment Tracker successfully.`,
      type: 'success'
    });
  };

  // Delete Candidate
  const handleDeleteCandidate = (id: string, name: string) => {
    deleteRecruitmentCandidate(id);
    refreshCandidates();
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    addToast({
      title: 'Candidate Record Removed',
      message: `${name} has been deleted from tracker.`,
      type: 'info'
    });
  };

  // Quick Update for a round
  const handleQuickRoundUpdate = (
    candidate: Candidate, 
    roundKey: 'telephonicInterview' | 'hrRound' | 'managerialRound', 
    newStatus: string
  ) => {
    const updated = { ...candidate, [roundKey]: newStatus };
    saveRecruitmentCandidate(updated);
    refreshCandidates();
    addToast({
      title: 'Round Status Updated',
      message: `${candidate.name}: ${roundKey} set to ${newStatus}.`,
      type: 'success'
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    exportCandidatesToCSV(filteredCandidates);
    addToast({
      title: 'Spreadsheet Exported',
      message: `Exported ${filteredCandidates.length} candidate record(s) to CSV.`,
      type: 'success'
    });
  };

  // If user does not have permission, show restricted access banner
  if (!hasAccess) {
    return (
      <div className="p-8 max-w-lg mx-auto my-16 bg-crm-card border border-rose-500/30 rounded-2xl shadow-modal text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-crm-text">Recruitment Tracker — Restricted Access</h2>
          <p className="text-xs text-crm-textMuted mt-1 leading-relaxed">
            The candidate recruitment tracker contains sensitive applicant dossiers, compensation benchmarks, and evaluation notes. Access is strictly restricted to <span className="text-rose-400 font-semibold">HR Operations</span> and <span className="text-rose-400 font-semibold">Super Admin</span>.
          </p>
        </div>
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={() => navigateTo('/app/dashboard')}>
            Return to Authorized Workspace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-crm-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-turquoise/10 border border-turquoise/20 text-turquoise">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-crm-text tracking-tight">
                HR Recruitment Tracker
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                HR & Super Admin Only
              </span>
            </div>
            <p className="text-xs text-crm-textMuted mt-0.5">
              End-to-end applicant screening pipeline: Telephonic, HR & Managerial Rounds with salary benchmarks
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Export to CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5 text-turquoise" />}
          >
            Export to CSV
          </Button>

          {/* Add Candidate Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            + Add Candidate
          </Button>
        </div>
      </div>

      {/* 2. Recruitment Funnel Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border/60">
          <div className="text-[10px] font-semibold uppercase text-crm-textMuted mb-1">Total Inflow</div>
          <div className="text-2xl font-bold font-mono text-crm-text">{metrics.total}</div>
          <div className="text-[10px] text-crm-textMuted">Applicants Tracked</div>
        </div>

        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border/60">
          <div className="text-[10px] font-semibold uppercase text-blue-400 mb-1">Telephonic Pass</div>
          <div className="text-2xl font-bold font-mono text-blue-400">{metrics.telephonicSelected}</div>
          <div className="text-[10px] text-crm-textMuted">Screening Cleared</div>
        </div>

        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border/60">
          <div className="text-[10px] font-semibold uppercase text-turquoise mb-1">HR Round Pass</div>
          <div className="text-2xl font-bold font-mono text-turquoise">{metrics.hrSelected}</div>
          <div className="text-[10px] text-crm-textMuted">Culture & Fit Cleared</div>
        </div>

        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border/60">
          <div className="text-[10px] font-semibold uppercase text-emerald-400 mb-1">Managerial Pass</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{metrics.managerialSelected}</div>
          <div className="text-[10px] text-crm-textMuted">Ready for Offer</div>
        </div>

        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border/60">
          <div className="text-[10px] font-semibold uppercase text-amber-400 mb-1">On Hold</div>
          <div className="text-2xl font-bold font-mono text-amber-400">{metrics.onHold}</div>
          <div className="text-[10px] text-crm-textMuted">Under Review</div>
        </div>

        <div className="p-3.5 rounded-xl bg-crm-card border border-crm-border/60">
          <div className="text-[10px] font-semibold uppercase text-rose-400 mb-1">Rejected</div>
          <div className="text-2xl font-bold font-mono text-rose-400">{metrics.rejected}</div>
          <div className="text-[10px] text-crm-textMuted">Archived Candidates</div>
        </div>
      </div>

      {/* 3. Search & Multi-Round Filter Toolbar */}
      <div className="p-4 rounded-xl bg-crm-card/70 border border-crm-border/70 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-crm-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, mobile, email, position, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-crm-surface border border-crm-border text-crm-text placeholder-crm-textMuted focus:outline-none focus:border-turquoise text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-crm-textMuted hover:text-crm-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Round Filter Tabs */}
          <div className="flex items-center gap-1 bg-crm-surface p-1 rounded-lg border border-crm-border text-xs">
            <button
              onClick={() => setSelectedQuickTab('all')}
              className={cn(
                "px-2.5 py-1 rounded font-medium transition-colors",
                selectedQuickTab === 'all' ? "bg-turquoise text-crm-bg font-bold shadow-xs" : "text-crm-textMuted hover:text-crm-text"
              )}
            >
              All Applicants ({candidates.length})
            </button>
            <button
              onClick={() => setSelectedQuickTab('selected')}
              className={cn(
                "px-2.5 py-1 rounded font-medium transition-colors",
                selectedQuickTab === 'selected' ? "bg-emerald-500 text-white font-bold" : "text-crm-textMuted hover:text-emerald-400"
              )}
            >
              Selected
            </button>
            <button
              onClick={() => setSelectedQuickTab('on_hold')}
              className={cn(
                "px-2.5 py-1 rounded font-medium transition-colors",
                selectedQuickTab === 'on_hold' ? "bg-amber-500 text-crm-bg font-bold" : "text-crm-textMuted hover:text-amber-400"
              )}
            >
              On Hold
            </button>
            <button
              onClick={() => setSelectedQuickTab('reject')}
              className={cn(
                "px-2.5 py-1 rounded font-medium transition-colors",
                selectedQuickTab === 'reject' ? "bg-rose-500 text-white font-bold" : "text-crm-textMuted hover:text-rose-400"
              )}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-crm-border/40 text-xs">
          {/* Position */}
          <div>
            <label className="block text-[10px] text-crm-textMuted mb-1 font-semibold uppercase">Position</label>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
            >
              <option value="all">All Positions</option>
              {positionsList.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          {/* Telephonic Status */}
          <div>
            <label className="block text-[10px] text-crm-textMuted mb-1 font-semibold uppercase">Telephonic</label>
            <select
              value={telephonicFilter}
              onChange={(e) => setTelephonicFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
            >
              <option value="all">All Telephonic</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="selected">Selected</option>
              <option value="on_hold">On Hold</option>
              <option value="reject">Reject</option>
            </select>
          </div>

          {/* HR Round */}
          <div>
            <label className="block text-[10px] text-crm-textMuted mb-1 font-semibold uppercase">HR Round</label>
            <select
              value={hrFilter}
              onChange={(e) => setHrFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
            >
              <option value="all">All HR Round</option>
              <option value="selected">Selected</option>
              <option value="on_hold">On Hold</option>
              <option value="reject">Reject</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Managerial Round */}
          <div>
            <label className="block text-[10px] text-crm-textMuted mb-1 font-semibold uppercase">Managerial</label>
            <select
              value={managerialFilter}
              onChange={(e) => setManagerialFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
            >
              <option value="all">All Managerial</option>
              <option value="selected">Selected</option>
              <option value="on_hold">On Hold</option>
              <option value="reject">Reject</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Relocate */}
          <div>
            <label className="block text-[10px] text-crm-textMuted mb-1 font-semibold uppercase">Relocate</label>
            <select
              value={relocateFilter}
              onChange={(e) => setRelocateFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
            >
              <option value="all">All</option>
              <option value="yes">Relocate: Yes</option>
              <option value="no">Relocate: No</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Complete 20-Column Data Table */}
      <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1700px]">
            <thead>
              <tr className="bg-crm-surface/80 border-b border-crm-border text-crm-textMuted font-semibold select-none">
                <th className="py-3 px-3.5 sticky left-0 bg-crm-surface/95 z-10 w-28">DATE</th>
                <th className="py-3 px-3.5 sticky left-28 bg-crm-surface/95 z-10 w-52">NAME & CONTACT</th>
                <th className="py-3 px-3.5 w-56">POSITION APPLIED FOR</th>
                <th className="py-3 px-3 w-40">LOCATION & HOMETOWN</th>
                <th className="py-3 px-3 w-28 text-center">RELOCATE</th>
                <th className="py-3 px-3 w-44">QUALIFICATION & EXP</th>
                <th className="py-3 px-3.5 w-56">CURRENT COMPANY & ROLE</th>
                <th className="py-3 px-3.5 w-48">SALARY (CURRENT / EXP)</th>
                <th className="py-3 px-3 w-32">NOTICE PERIOD</th>
                <th className="py-3 px-3 w-32 text-center">COMMUNICATION</th>
                <th className="py-3 px-3.5 w-48">TELEPHONIC ROUND</th>
                <th className="py-3 px-3.5 w-40">HR ROUND</th>
                <th className="py-3 px-3.5 w-44">MANAGERIAL ROUND</th>
                <th className="py-3 px-3.5 w-72">REMARKS</th>
                <th className="py-3 px-3 sticky right-0 bg-crm-surface/95 z-10 text-right w-24">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-crm-border/40">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-crm-textMuted">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-crm-textMuted" />
                    <p className="font-semibold text-crm-text">No candidate records found</p>
                    <p className="text-xs text-crm-textMuted mt-0.5">Try adjusting your search criteria or add a new candidate.</p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map(c => {
                  const teleCfg = TELEPHONIC_STATUS_MAP[c.telephonicInterview] || TELEPHONIC_STATUS_MAP.pending;
                  const hrCfg = ROUND_STATUS_MAP[c.hrRound] || ROUND_STATUS_MAP.pending;
                  const manCfg = ROUND_STATUS_MAP[c.managerialRound] || ROUND_STATUS_MAP.pending;
                  const commCfg = COMMUNICATION_MAP[c.communication] || COMMUNICATION_MAP.Good;

                  return (
                    <tr 
                      key={c.id} 
                      className="hover:bg-crm-surface/40 transition-colors group cursor-pointer"
                      onClick={() => openViewModal(c)}
                    >
                      {/* DATE */}
                      <td className="py-3 px-3.5 font-mono text-crm-textSecondary sticky left-0 bg-crm-card group-hover:bg-crm-surface/40 z-10">
                        {c.date}
                      </td>

                      {/* NAME & CONTACT */}
                      <td className="py-3 px-3.5 sticky left-28 bg-crm-card group-hover:bg-crm-surface/40 z-10">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.name} size="xs" />
                          <div>
                            <div className="font-bold text-crm-text flex items-center gap-1.5">
                              {c.name}
                            </div>
                            <div className="text-[11px] text-crm-textMuted flex items-center gap-2 mt-0.5 font-mono">
                              <span className="flex items-center gap-0.5">
                                <Phone className="w-3 h-3 text-turquoise" />
                                {c.mobileNumber}
                              </span>
                            </div>
                            <div className="text-[10px] text-crm-textMuted truncate max-w-[180px]">
                              {c.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* POSITION APPLIED FOR */}
                      <td className="py-3 px-3.5">
                        <span className="font-semibold text-turquoise">
                          {c.positionAppliedFor}
                        </span>
                      </td>

                      {/* LOCATION & HOMETOWN */}
                      <td className="py-3 px-3">
                        <div className="text-crm-text font-medium">{c.currentLocation || '—'}</div>
                        <div className="text-[10px] text-crm-textMuted">Hometown: {c.homeTown || '—'}</div>
                      </td>

                      {/* RELOCATE */}
                      <td className="py-3 px-3 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                          c.relocate === 'yes' ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        )}>
                          {c.relocate}
                        </span>
                      </td>

                      {/* QUALIFICATION & EXP */}
                      <td className="py-3 px-3">
                        <div className="text-crm-text font-medium">{c.highestQualification}</div>
                        <div className="text-[11px] text-turquoise font-mono">{c.experience} Exp</div>
                      </td>

                      {/* CURRENT COMPANY & ROLE */}
                      <td className="py-3 px-3.5">
                        <div className="text-crm-text font-semibold">{c.currentCompany || '—'}</div>
                        <div className="text-[10px] text-crm-textMuted">{c.designation || '—'}</div>
                      </td>

                      {/* SALARY (CURRENT / EXP) */}
                      <td className="py-3 px-3.5 font-mono">
                        <div className="text-crm-text font-medium">Curr: {c.currentSalary || '—'}</div>
                        <div className="text-emerald-400 font-bold">Exp: {c.expectedSalary || '—'}</div>
                      </td>

                      {/* NOTICE PERIOD */}
                      <td className="py-3 px-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-medium font-mono",
                          c.noticePeriod?.toLowerCase().includes('immediate')
                            ? "bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30"
                            : "bg-crm-surface text-crm-textSecondary"
                        )}>
                          {c.noticePeriod}
                        </span>
                      </td>

                      {/* COMMUNICATION */}
                      <td className="py-3 px-3 text-center">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border", commCfg.badge)}>
                          {c.communication}
                        </span>
                      </td>

                      {/* TELEPHONIC INTERVIEW ROUND */}
                      <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.telephonicInterview}
                          onChange={(e) => handleQuickRoundUpdate(c, 'telephonicInterview', e.target.value)}
                          className={cn(
                            "px-2 py-1 rounded text-xs border font-semibold focus:outline-none cursor-pointer bg-crm-surface",
                            teleCfg.badge
                          )}
                        >
                          <option value="interview_scheduled">Interview Scheduled</option>
                          <option value="selected">Selected</option>
                          <option value="on_hold">On Hold</option>
                          <option value="reject">Reject</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>

                      {/* HR ROUND */}
                      <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.hrRound}
                          onChange={(e) => handleQuickRoundUpdate(c, 'hrRound', e.target.value)}
                          className={cn(
                            "px-2 py-1 rounded text-xs border font-semibold focus:outline-none cursor-pointer bg-crm-surface",
                            hrCfg.badge
                          )}
                        >
                          <option value="selected">Selected</option>
                          <option value="on_hold">On Hold</option>
                          <option value="reject">Reject</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>

                      {/* MANAGERIAL ROUND */}
                      <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.managerialRound}
                          onChange={(e) => handleQuickRoundUpdate(c, 'managerialRound', e.target.value)}
                          className={cn(
                            "px-2 py-1 rounded text-xs border font-semibold focus:outline-none cursor-pointer bg-crm-surface",
                            manCfg.badge
                          )}
                        >
                          <option value="selected">Selected</option>
                          <option value="on_hold">On Hold</option>
                          <option value="reject">Reject</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>

                      {/* REMARKS */}
                      <td className="py-3 px-3.5 text-crm-textMuted text-[11px] max-w-xs truncate" title={c.remarks}>
                        {c.remarks || 'No remarks recorded.'}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-3 sticky right-0 bg-crm-card group-hover:bg-crm-surface/40 z-10 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => openViewModal(c, e)}
                            title="View Candidate Dossier"
                            className="p-1.5 rounded hover:bg-crm-surface text-crm-textMuted hover:text-turquoise transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => openEditModal(c, e)}
                            title="Edit Candidate"
                            className="p-1.5 rounded hover:bg-crm-surface text-crm-textMuted hover:text-crm-text transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://wa.me/${c.mobileNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${c.name}, greeting from Star Chain Labs HR regarding your application for ${c.positionAppliedFor}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp Candidate"
                            className="p-1.5 rounded hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: ADD CANDIDATE ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-crm-bg/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-crm-card border border-crm-border rounded-xl shadow-modal max-w-2xl w-full p-5 space-y-4 my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-crm-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-turquoise/15 text-turquoise">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-crm-text">Add Candidate to Recruitment Tracker</h2>
                  <p className="text-[11px] text-crm-textMuted">All 20 candidate profiling and round assessment fields</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-crm-textMuted hover:text-crm-text p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              {/* Segment 1: Basic & Contact */}
              <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border/60 space-y-3">
                <div className="font-semibold text-turquoise flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Avatar name={formData.name || 'C'} size="xs" />
                  <span>1. Candidate Identification & Position</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Application Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Candidate Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs font-mono focus:outline-none focus:border-turquoise"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Email ID *</label>
                    <input
                      type="email"
                      required
                      placeholder="candidate@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Position Applied For *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Frontend Engineer"
                      value={formData.positionAppliedFor}
                      onChange={(e) => setFormData({ ...formData, positionAppliedFor: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                </div>
              </div>

              {/* Segment 2: Location, Hometown & Relocate */}
              <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border/60 space-y-3">
                <div className="font-semibold text-turquoise flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-turquoise" />
                  <span>2. Location & Relocation Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Current Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore"
                      value={formData.currentLocation}
                      onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Home Town</label>
                    <input
                      type="text"
                      placeholder="e.g. Lucknow"
                      value={formData.homeTown}
                      onChange={(e) => setFormData({ ...formData, homeTown: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Relocate (Yes/No)</label>
                    <select
                      value={formData.relocate}
                      onChange={(e) => setFormData({ ...formData, relocate: e.target.value as RelocateOption })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    >
                      <option value="yes">Yes (Ready to Relocate)</option>
                      <option value="no">No (Local / Remote only)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Segment 3: Qualifications, Company, Designation */}
              <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border/60 space-y-3">
                <div className="font-semibold text-turquoise flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5 text-turquoise" />
                  <span>3. Qualifications & Professional Background</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Highest Qualification</label>
                    <input
                      type="text"
                      placeholder="B.Tech, MBA, MCA..."
                      value={formData.highestQualification}
                      onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Total Experience</label>
                    <input
                      type="text"
                      placeholder="e.g. 3.5 Years"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Current/Last Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Infosys, TCS, Startup..."
                      value={formData.currentCompany}
                      onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Current Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                </div>
              </div>

              {/* Segment 4: Salary & Notice Period */}
              <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border/60 space-y-3">
                <div className="font-semibold text-turquoise flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <IndianRupee className="w-3.5 h-3.5 text-turquoise" />
                  <span>4. Compensation & Availability</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Current/Last Drawn Salary</label>
                    <input
                      type="text"
                      placeholder="₹8,00,000 LPA"
                      value={formData.currentSalary}
                      onChange={(e) => setFormData({ ...formData, currentSalary: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Expected Salary</label>
                    <input
                      type="text"
                      placeholder="₹12,00,000 LPA"
                      value={formData.expectedSalary}
                      onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Notice Period</label>
                    <input
                      type="text"
                      placeholder="Immediate, 30 Days, 60 Days..."
                      value={formData.noticePeriod}
                      onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                </div>
              </div>

              {/* Segment 5: Rounds & Remarks */}
              <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border/60 space-y-3">
                <div className="font-semibold text-turquoise flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-turquoise" />
                  <span>5. Interview Rounds & Communication</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Communication</label>
                    <select
                      value={formData.communication}
                      onChange={(e) => setFormData({ ...formData, communication: e.target.value as CommunicationLevel })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    >
                      <option value="Excellent">⭐ Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Telephonic Round</label>
                    <select
                      value={formData.telephonicInterview}
                      onChange={(e) => setFormData({ ...formData, telephonicInterview: e.target.value as TelephonicInterviewStatus })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    >
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="selected">Selected</option>
                      <option value="on_hold">On Hold</option>
                      <option value="reject">Reject</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-crm-text mb-1 font-medium">HR Round</label>
                    <select
                      value={formData.hrRound}
                      onChange={(e) => setFormData({ ...formData, hrRound: e.target.value as RoundStatus })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    >
                      <option value="selected">Selected</option>
                      <option value="on_hold">On Hold</option>
                      <option value="reject">Reject</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Managerial Round</label>
                    <select
                      value={formData.managerialRound}
                      onChange={(e) => setFormData({ ...formData, managerialRound: e.target.value as RoundStatus })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    >
                      <option value="selected">Selected</option>
                      <option value="on_hold">On Hold</option>
                      <option value="reject">Reject</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-crm-text mb-1 font-medium">Remarks / Evaluation Feedback</label>
                  <textarea
                    rows={2}
                    placeholder="Technical assessment, cultural fit, salary negotiation notes, interviewer debrief..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs placeholder-crm-textMuted focus:outline-none focus:border-turquoise"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-crm-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Save Candidate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CANDIDATE ================= */}
      {isEditModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-crm-bg/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-crm-card border border-crm-border rounded-xl shadow-modal max-w-2xl w-full p-5 space-y-4 my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-crm-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-turquoise/15 text-turquoise">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-crm-text">Edit Candidate: {selectedCandidate.name}</h2>
                  <p className="text-[11px] text-crm-textMuted">{selectedCandidate.positionAppliedFor} • Application ID: {selectedCandidate.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-crm-textMuted hover:text-crm-text p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              {/* Segment 1 */}
              <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border/60 space-y-3">
                <div className="font-semibold text-turquoise flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Avatar name={formData.name || 'C'} size="xs" />
                  <span>1. Candidate Identification & Position</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Application Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Candidate Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs font-mono focus:outline-none focus:border-turquoise"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Email ID *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Position Applied For *</label>
                    <input
                      type="text"
                      required
                      value={formData.positionAppliedFor}
                      onChange={(e) => setFormData({ ...formData, positionAppliedFor: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                </div>
              </div>

              {/* Segment 2 */}
              <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border/60 space-y-3">
                <div className="font-semibold text-turquoise flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-turquoise" />
                  <span>2. Location & Relocation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Current Location</label>
                    <input
                      type="text"
                      value={formData.currentLocation}
                      onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Home Town</label>
                    <input
                      type="text"
                      value={formData.homeTown}
                      onChange={(e) => setFormData({ ...formData, homeTown: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Relocate (Yes/No)</label>
                    <select
                      value={formData.relocate}
                      onChange={(e) => setFormData({ ...formData, relocate: e.target.value as RelocateOption })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Segment 3 */}
              <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border/60 space-y-3">
                <div className="font-semibold text-turquoise flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5 text-turquoise" />
                  <span>3. Experience & Credentials</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Highest Qualification</label>
                    <input
                      type="text"
                      value={formData.highestQualification}
                      onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Experience</label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Current/Last Company</label>
                    <input
                      type="text"
                      value={formData.currentCompany}
                      onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                </div>
              </div>

              {/* Segment 4 */}
              <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border/60 space-y-3">
                <div className="font-semibold text-turquoise flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <IndianRupee className="w-3.5 h-3.5 text-turquoise" />
                  <span>4. Salary & Notice Period</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Current/Last Drawn Salary</label>
                    <input
                      type="text"
                      value={formData.currentSalary}
                      onChange={(e) => setFormData({ ...formData, currentSalary: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Expected Salary</label>
                    <input
                      type="text"
                      value={formData.expectedSalary}
                      onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text font-mono text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Notice Period</label>
                    <input
                      type="text"
                      value={formData.noticePeriod}
                      onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    />
                  </div>
                </div>
              </div>

              {/* Segment 5 */}
              <div className="p-3.5 rounded-lg bg-crm-surface/60 border border-crm-border/60 space-y-3">
                <div className="font-semibold text-turquoise flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-turquoise" />
                  <span>5. Round Decisions & Remarks</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Communication</label>
                    <select
                      value={formData.communication}
                      onChange={(e) => setFormData({ ...formData, communication: e.target.value as CommunicationLevel })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    >
                      <option value="Excellent">⭐ Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Telephonic Round</label>
                    <select
                      value={formData.telephonicInterview}
                      onChange={(e) => setFormData({ ...formData, telephonicInterview: e.target.value as TelephonicInterviewStatus })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    >
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="selected">Selected</option>
                      <option value="on_hold">On Hold</option>
                      <option value="reject">Reject</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-crm-text mb-1 font-medium">HR Round</label>
                    <select
                      value={formData.hrRound}
                      onChange={(e) => setFormData({ ...formData, hrRound: e.target.value as RoundStatus })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    >
                      <option value="selected">Selected</option>
                      <option value="on_hold">On Hold</option>
                      <option value="reject">Reject</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-crm-text mb-1 font-medium">Managerial Round</label>
                    <select
                      value={formData.managerialRound}
                      onChange={(e) => setFormData({ ...formData, managerialRound: e.target.value as RoundStatus })}
                      className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                    >
                      <option value="selected">Selected</option>
                      <option value="on_hold">On Hold</option>
                      <option value="reject">Reject</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-crm-text mb-1 font-medium">Remarks / Evaluation Notes</label>
                  <textarea
                    rows={2}
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded bg-crm-surface border border-crm-border text-crm-text text-xs focus:outline-none focus:border-turquoise"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-crm-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCandidate(selectedCandidate.id, selectedCandidate.name)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                  className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                >
                  Delete Candidate
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Update Candidate
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW CANDIDATE DOSSIER ================= */}
      {isViewModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-crm-bg/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-crm-card border border-crm-border rounded-xl shadow-modal max-w-xl w-full p-5 space-y-4 my-8 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-crm-border pb-3">
              <div className="flex items-center gap-3">
                <Avatar name={selectedCandidate.name} size="md" />
                <div>
                  <h2 className="text-lg font-bold text-crm-text flex items-center gap-2">
                    {selectedCandidate.name}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-turquoise/15 text-turquoise border border-turquoise/30 font-medium">
                      {selectedCandidate.experience} Exp
                    </span>
                  </h2>
                  <p className="text-xs text-turquoise font-medium">{selectedCandidate.positionAppliedFor}</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-crm-textMuted hover:text-crm-text p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Contact & Location Ribbon */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-crm-surface/70 p-3 rounded-lg border border-crm-border/60">
              <div className="space-y-1">
                <div className="text-crm-textMuted text-[10px] uppercase font-semibold">Contact</div>
                <div className="font-mono text-crm-text">{selectedCandidate.mobileNumber}</div>
                <div className="text-crm-textSecondary truncate">{selectedCandidate.email}</div>
              </div>
              <div className="space-y-1">
                <div className="text-crm-textMuted text-[10px] uppercase font-semibold">Location</div>
                <div className="text-crm-text">Current: <span className="font-semibold">{selectedCandidate.currentLocation || '—'}</span></div>
                <div className="text-crm-textMuted text-[11px]">Home: {selectedCandidate.homeTown || '—'} • Ready to Relocate: <span className="font-bold text-crm-text uppercase">{selectedCandidate.relocate}</span></div>
              </div>
            </div>

            {/* Career & Compensation */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-crm-surface/40 rounded-lg border border-crm-border/40 space-y-1">
                <div className="text-[10px] text-crm-textMuted uppercase font-semibold">Background</div>
                <div>Company: <span className="font-semibold text-crm-text">{selectedCandidate.currentCompany || '—'}</span></div>
                <div>Role: <span className="text-crm-textSecondary">{selectedCandidate.designation || '—'}</span></div>
                <div>Degree: <span className="text-crm-textSecondary">{selectedCandidate.highestQualification}</span></div>
              </div>

              <div className="p-3 bg-crm-surface/40 rounded-lg border border-crm-border/40 space-y-1">
                <div className="text-[10px] text-crm-textMuted uppercase font-semibold">Compensation & Notice</div>
                <div>Drawn: <span className="font-mono font-semibold text-crm-text">{selectedCandidate.currentSalary || '—'}</span></div>
                <div>Expected: <span className="font-mono font-bold text-emerald-400">{selectedCandidate.expectedSalary || '—'}</span></div>
                <div>Notice: <span className="font-mono text-turquoise">{selectedCandidate.noticePeriod}</span></div>
              </div>
            </div>

            {/* Round Decision Matrix */}
            <div className="p-3 bg-crm-surface/50 rounded-lg border border-crm-border/50 space-y-2">
              <div className="text-[10px] text-crm-textMuted uppercase font-semibold tracking-wider">Evaluation Rounds Matrix</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-crm-card border border-crm-border">
                  <div className="text-[10px] text-crm-textMuted mb-1 font-semibold">Telephonic</div>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", TELEPHONIC_STATUS_MAP[selectedCandidate.telephonicInterview]?.badge)}>
                    {selectedCandidate.telephonicInterview}
                  </span>
                </div>
                <div className="p-2 rounded bg-crm-card border border-crm-border">
                  <div className="text-[10px] text-crm-textMuted mb-1 font-semibold">HR Round</div>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", ROUND_STATUS_MAP[selectedCandidate.hrRound]?.badge)}>
                    {selectedCandidate.hrRound}
                  </span>
                </div>
                <div className="p-2 rounded bg-crm-card border border-crm-border">
                  <div className="text-[10px] text-crm-textMuted mb-1 font-semibold">Managerial</div>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", ROUND_STATUS_MAP[selectedCandidate.managerialRound]?.badge)}>
                    {selectedCandidate.managerialRound}
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="p-3 rounded-lg bg-crm-surface/30 border border-crm-border/30 text-xs">
              <div className="text-[10px] text-crm-textMuted uppercase font-semibold mb-1">Remarks & Interview Notes</div>
              <p className="text-crm-textSecondary leading-relaxed whitespace-pre-wrap">
                {selectedCandidate.remarks || 'No remarks recorded.'}
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-crm-border">
              <a
                href={`https://wa.me/${selectedCandidate.mobileNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${selectedCandidate.name}, greeting from Star Chain Labs HR regarding your interview for ${selectedCandidate.positionAppliedFor}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs transition-colors shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                Message Candidate on WhatsApp
              </a>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedCandidate);
                  }}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Edit Candidate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
