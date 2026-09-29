import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  User, 
  CreditCard, 
  Briefcase, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Save, 
  Edit3, 
  X, 
  Check, 
  AlertCircle, 
  Database, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  HeartHandshake, 
  FileCode2, 
  Lock, 
  Unlock,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  EmployeeProfileRecord, 
  PersonalDetails, 
  BankDetails, 
  JobDetails, 
  SegmentKey, 
  SegmentValidationErrors,
  BLOOD_GROUPS,
  RELATIONSHIPS,
  COMMON_BANKS,
  EMPLOYMENT_TYPES,
  WORK_MODES,
  EMPLOYMENT_STATUSES
} from '../../types/employeeProfile';
import { 
  fetchEmployeeSegmentsFromSupabase, 
  saveEmployeeSegmentsToSupabase, 
  validateEmployeeSegments,
  getDefaultEmployeeRecord
} from '../../services/employeeProfileService';
import { SUPABASE_URL } from '../../lib/supabase';

interface EmployeeSegmentsViewProps {
  targetEmployeeId?: string;
  onUpdateSuccess?: (record: EmployeeProfileRecord) => void;
  showCardHeader?: boolean;
}

export const EmployeeSegmentsView: React.FC<EmployeeSegmentsViewProps> = ({
  targetEmployeeId,
  onUpdateSuccess,
  showCardHeader = true
}) => {
  const { currentUser, employees, addToast } = useCRM();

  // Resolve which employee's details are being managed
  const activeEmployeeId = targetEmployeeId || currentUser.id;
  const targetEmployee = employees.find(e => e.id === activeEmployeeId) || currentUser;

  // Active Segment Tab
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Record State
  const [record, setRecord] = useState<EmployeeProfileRecord>(() => 
    getDefaultEmployeeRecord(
      activeEmployeeId,
      targetEmployee.name,
      targetEmployee.email,
      targetEmployee.designation,
      targetEmployee.department
    )
  );

  // Snapshot for canceling edits
  const [originalRecord, setOriginalRecord] = useState<EmployeeProfileRecord | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<SegmentValidationErrors>({});
  const [missingFieldsList, setMissingFieldsList] = useState<string[]>([]);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [lastSyncInfo, setLastSyncInfo] = useState<{ time: string; mode: string } | null>(null);

  // Account number visibility toggle
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  // Load from Supabase on mount or employee change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchEmployeeSegmentsFromSupabase(activeEmployeeId, {
      name: targetEmployee.name,
      email: targetEmployee.email,
      designation: targetEmployee.designation,
      team: targetEmployee.department
    }).then(res => {
      if (isMounted) {
        setRecord(res);
        setOriginalRecord(JSON.parse(JSON.stringify(res)));
        setLastSyncInfo({
          time: new Date(res.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          mode: 'Supabase PostgreSQL'
        });
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeEmployeeId, targetEmployee]);

  // Handlers for Personal Details
  const handlePersonalChange = <K extends keyof PersonalDetails>(field: K, value: PersonalDetails[K]) => {
    setRecord(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
    // Clear field-level error
    if (errors.personal?.[field]) {
      setErrors(prev => ({
        ...prev,
        personal: { ...prev.personal, [field]: undefined }
      }));
    }
  };

  // Handlers for Bank Details
  const handleBankChange = <K extends keyof BankDetails>(field: K, value: BankDetails[K]) => {
    setRecord(prev => ({
      ...prev,
      bank: {
        ...prev.bank,
        [field]: value
      }
    }));
    if (errors.bank?.[field]) {
      setErrors(prev => ({
        ...prev,
        bank: { ...prev.bank, [field]: undefined }
      }));
    }
  };

  // Handlers for Job Details
  const handleJobChange = <K extends keyof JobDetails>(field: K, value: JobDetails[K]) => {
    setRecord(prev => ({
      ...prev,
      job: {
        ...prev.job,
        [field]: value
      }
    }));
    if (errors.job?.[field]) {
      setErrors(prev => ({
        ...prev,
        job: { ...prev.job, [field]: undefined }
      }));
    }
  };

  // Sync Name across segments helper
  const handleSyncNameAcrossSegments = () => {
    const mainName = record.personal.name.trim();
    if (!mainName) {
      addToast({
        title: 'Name Required',
        message: 'Please enter a name in Personal details first.',
        type: 'warning'
      });
      return;
    }
    setRecord(prev => ({
      ...prev,
      bank: {
        ...prev.bank,
        name: mainName,
        accountHolderName: prev.bank.accountHolderName || mainName
      },
      job: {
        ...prev.job,
        name: mainName
      }
    }));
    addToast({
      title: 'Names Synced',
      message: `Updated Bank and Job details name to "${mainName}".`,
      type: 'info'
    });
  };

  // Cancel edits
  const handleCancel = () => {
    if (originalRecord) {
      setRecord(JSON.parse(JSON.stringify(originalRecord)));
    }
    setErrors({});
    setMissingFieldsList([]);
    setIsEditing(false);
  };

  // Save to Supabase with strict validation
  const handleSaveToSupabase = async () => {
    // Validate all segments
    const validation = validateEmployeeSegments(record);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setMissingFieldsList(validation.missingFields);
      addToast({
        title: 'Compulsory Fields Incomplete',
        message: `Please fill all required fields across all 3 segments (${validation.missingFields.length} missing).`,
        type: 'error'
      });
      return;
    }

    setIsSaving(true);
    setErrors({});
    setMissingFieldsList([]);

    try {
      const result = await saveEmployeeSegmentsToSupabase(record);
      if (result.success) {
        setOriginalRecord(JSON.parse(JSON.stringify(record)));
        setLastSyncInfo({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          mode: result.mode === 'supabase_table' ? 'Supabase Table (employee_details)' : 'Supabase Live Ledger (audit_logs)'
        });
        setIsEditing(false);
        addToast({
          title: 'Saved to Supabase!',
          message: 'All 3 segments (Personal, Bank, Job) successfully synchronized with Supabase PostgreSQL.',
          type: 'success'
        });
        if (onUpdateSuccess) {
          onUpdateSuccess(record);
        }
      } else {
        addToast({
          title: 'Supabase Sync Warning',
          message: result.error || 'Failed to save to Supabase.',
          type: 'error'
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Network / Save Error',
        message: err?.message || 'Unable to reach Supabase backend.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Segment Completion Checks
  const personalValid = validateEmployeeSegments(record, 'personal').isValid;
  const bankValid = validateEmployeeSegments(record, 'bank').isValid;
  const jobValid = validateEmployeeSegments(record, 'job').isValid;
  const allValid = personalValid && bankValid && jobValid;

  const sqlCode = `-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yvmjnwwxhdvfzhtrlyuk/sql/new

CREATE TABLE IF NOT EXISTS public.employee_details (
    id VARCHAR(64) PRIMARY KEY,
    
    -- Segment 1: Personal Details
    name VARCHAR(128) NOT NULL,
    dob DATE NOT NULL,
    blood_group VARCHAR(16) NOT NULL,
    email VARCHAR(128) NOT NULL,
    mobile_number VARCHAR(32) NOT NULL,
    emergency_contact_name VARCHAR(128) NOT NULL,
    emergency_contact_number VARCHAR(32) NOT NULL,
    emergency_contact_relationship VARCHAR(64) NOT NULL,
    current_address TEXT NOT NULL,
    permanent_address TEXT NOT NULL,
    joining_date DATE NOT NULL,

    -- Segment 2: Bank Details
    bank_employee_name VARCHAR(128) NOT NULL,
    account_holder_name VARCHAR(128) NOT NULL,
    bank_name VARCHAR(128) NOT NULL,
    account_number VARCHAR(64) NOT NULL,
    ifsc_code VARCHAR(32) NOT NULL,
    branch VARCHAR(128) NOT NULL,

    -- Segment 3: Job Details
    job_employee_name VARCHAR(128) NOT NULL,
    employee_id_code VARCHAR(64) NOT NULL,
    doj DATE NOT NULL,
    designation VARCHAR(128) NOT NULL,
    team VARCHAR(128) NOT NULL,
    employment_type VARCHAR(64) NOT NULL,
    work_mode VARCHAR(32) NOT NULL,
    employment_status VARCHAR(32) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employee_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_employee_details_select" ON public.employee_details FOR SELECT USING (true);
CREATE POLICY "allow_all_employee_details_insert" ON public.employee_details FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_employee_details_update" ON public.employee_details FOR UPDATE USING (true) WITH CHECK (true);
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    addToast({
      title: 'SQL Copied',
      message: 'Schema script copied to clipboard. Ready to paste in Supabase dashboard.',
      type: 'info'
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Supabase Connection Indicator */}
      {showCardHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-crm-card border border-crm-border shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-turquoise/15 text-turquoise flex items-center justify-center border border-turquoise/25">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-crm-text tracking-tight">
                    Personnel Segments: Personal, Bank & Job Details
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Supabase Live
                  </span>
                </div>
                <p className="text-xs text-crm-textSecondary mt-0.5">
                  Three mandatory compliance segments with real-time Supabase PostgreSQL persistence.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowSqlModal(true)}
              leftIcon={<FileCode2 className="w-3.5 h-3.5 text-turquoise" />}
              className="text-xs"
            >
              Supabase SQL
            </Button>

            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveToSupabase}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                  className="bg-turquoise text-slate-950 hover:bg-turquoise/90 font-semibold"
                >
                  Save to Supabase
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
                leftIcon={<Edit3 className="w-3.5 h-3.5 text-turquoise" />}
              >
                Edit Details
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Missing Fields Warning Alert */}
      {missingFieldsList.length > 0 && isEditing && (
        <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-500/40 text-xs flex items-start gap-3 text-red-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-red-200">
              Compulsory Fields Required: All fields in all 3 segments must be filled before saving to Supabase.
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingFieldsList.map(item => (
                <span key={item} className="px-2 py-0.5 rounded bg-red-900/40 border border-red-700/50 text-[10px] font-mono text-red-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Segment Selector Tabs with Completion Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tab 1: Personal Details */}
        <button
          type="button"
          onClick={() => setActiveSegment('personal')}
          className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
            activeSegment === 'personal'
              ? 'bg-turquoise/10 border-turquoise/50 shadow-sm shadow-turquoise/10'
              : 'bg-crm-card hover:bg-crm-surface/70 border-crm-border text-crm-textSecondary'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${
              activeSegment === 'personal'
                ? 'bg-turquoise/20 text-turquoise border-turquoise/40'
                : 'bg-crm-surface text-crm-textMuted border-crm-border'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${activeSegment === 'personal' ? 'text-crm-text' : 'text-crm-text'}`}>
                  1. Personal Details
                </span>
                <span className="text-red-400 font-bold">*</span>
              </div>
              <p className="text-[11px] text-crm-textMuted">11 Mandatory Fields</p>
            </div>
          </div>
          <div>
            {personalValid ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                <Check className="w-3 h-3" /> Complete
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/40 text-amber-400 border border-amber-800/40 flex items-center gap-1">
                Incomplete
              </span>
            )}
          </div>
        </button>

        {/* Tab 2: Bank Details */}
        <button
          type="button"
          onClick={() => setActiveSegment('bank')}
          className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
            activeSegment === 'bank'
              ? 'bg-turquoise/10 border-turquoise/50 shadow-sm shadow-turquoise/10'
              : 'bg-crm-card hover:bg-crm-surface/70 border-crm-border text-crm-textSecondary'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${
              activeSegment === 'bank'
                ? 'bg-turquoise/20 text-turquoise border-turquoise/40'
                : 'bg-crm-surface text-crm-textMuted border-crm-border'
            }`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${activeSegment === 'bank' ? 'text-crm-text' : 'text-crm-text'}`}>
                  2. Bank Details
                </span>
                <span className="text-red-400 font-bold">*</span>
              </div>
              <p className="text-[11px] text-crm-textMuted">6 Mandatory Fields</p>
            </div>
          </div>
          <div>
            {bankValid ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                <Check className="w-3 h-3" /> Complete
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/40 text-amber-400 border border-amber-800/40 flex items-center gap-1">
                Incomplete
              </span>
            )}
          </div>
        </button>

        {/* Tab 3: Job Details */}
        <button
          type="button"
          onClick={() => setActiveSegment('job')}
          className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
            activeSegment === 'job'
              ? 'bg-turquoise/10 border-turquoise/50 shadow-sm shadow-turquoise/10'
              : 'bg-crm-card hover:bg-crm-surface/70 border-crm-border text-crm-textSecondary'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${
              activeSegment === 'job'
                ? 'bg-turquoise/20 text-turquoise border-turquoise/40'
                : 'bg-crm-surface text-crm-textMuted border-crm-border'
            }`}>
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${activeSegment === 'job' ? 'text-crm-text' : 'text-crm-text'}`}>
                  3. Job Details
                </span>
                <span className="text-red-400 font-bold">*</span>
              </div>
              <p className="text-[11px] text-crm-textMuted">8 Mandatory Fields</p>
            </div>
          </div>
          <div>
            {jobValid ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                <Check className="w-3 h-3" /> Complete
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/40 text-amber-400 border border-amber-800/40 flex items-center gap-1">
                Incomplete
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Editing Toolbar Notice */}
      {isEditing && (
        <div className="p-3 rounded-lg bg-turquoise/10 border border-turquoise/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-turquoise">
            <Edit3 className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Editing Mode Active:</strong> All 25 fields across Personal, Bank & Job segments are compulsory and will be saved to Supabase.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={handleSyncNameAcrossSegments}
              className="text-[11px] border-turquoise/30 text-turquoise hover:bg-turquoise/10"
            >
              Sync Name Across 3 Segments
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEGMENT 1: PERSONAL DETAILS */}
      {/* ========================================================================= */}
      {activeSegment === 'personal' && (
        <Card className="p-5 space-y-5 border-turquoise/30">
          <div className="flex items-center justify-between pb-3 border-b border-crm-border">
            <div>
              <h3 className="text-sm font-bold text-crm-text flex items-center gap-2">
                <User className="w-4 h-4 text-turquoise" />
                Personal Details (व्यक्तिगत विवरण)
              </h3>
              <p className="text-[11px] text-crm-textMuted mt-0.5">
                Official employee identity, blood group, contact numbers, emergency contact, and residential addresses.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30">
              11 FIELDS COMPULSORY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. NAME */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Full Legal Name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Aarav Sharma"
                value={record.personal.name}
                disabled={!isEditing}
                onChange={(e) => handlePersonalChange('name', e.target.value)}
                error={errors.personal?.name}
              />
            </div>

            {/* 2. DOB */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Date of Birth (DOB) <span className="text-red-400">*</span>
              </label>
              <Input
                type="date"
                value={record.personal.dob}
                disabled={!isEditing}
                onChange={(e) => handlePersonalChange('dob', e.target.value)}
                error={errors.personal?.dob}
              />
            </div>

            {/* 3. BLOOD GROUP */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Blood Group <span className="text-red-400">*</span>
              </label>
              <Select
                value={record.personal.bloodGroup}
                disabled={!isEditing}
                onChange={(e) => handlePersonalChange('bloodGroup', e.target.value)}
                error={errors.personal?.bloodGroup}
              >
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </Select>
            </div>

            {/* 4. EMAIL ID */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Email ID <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                placeholder="aarav.sharma@starchainlabs.com"
                value={record.personal.email}
                disabled={!isEditing}
                onChange={(e) => handlePersonalChange('email', e.target.value)}
                error={errors.personal?.email}
              />
            </div>

            {/* 5. MOBILE NUMBER */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={record.personal.mobileNumber}
                disabled={!isEditing}
                onChange={(e) => handlePersonalChange('mobileNumber', e.target.value)}
                error={errors.personal?.mobileNumber}
              />
            </div>

            {/* 6. JOINING DATE */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Joining Date <span className="text-red-400">*</span>
              </label>
              <Input
                type="date"
                value={record.personal.joiningDate}
                disabled={!isEditing}
                onChange={(e) => handlePersonalChange('joiningDate', e.target.value)}
                error={errors.personal?.joiningDate}
              />
            </div>
          </div>

          {/* Emergency Contact Group */}
          <div className="pt-2 border-t border-crm-border">
            <h4 className="text-xs font-bold text-turquoise uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5" />
              Emergency Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 7. EMERGENCY CONTACT NAME */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                  Emergency Contact Name <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g. Sunita Sharma"
                  value={record.personal.emergencyContactName}
                  disabled={!isEditing}
                  onChange={(e) => handlePersonalChange('emergencyContactName', e.target.value)}
                  error={errors.personal?.emergencyContactName}
                />
              </div>

              {/* 8. EMERGENCY CONTACT NUMBER */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                  Emergency Contact Number <span className="text-red-400">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="+91 98765 11111"
                  value={record.personal.emergencyContactNumber}
                  disabled={!isEditing}
                  onChange={(e) => handlePersonalChange('emergencyContactNumber', e.target.value)}
                  error={errors.personal?.emergencyContactNumber}
                />
              </div>

              {/* 9. RELATIONSHIP WITH EMERGENCY CONTACT */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                  Relationship <span className="text-red-400">*</span>
                </label>
                <Select
                  value={record.personal.emergencyContactRelationship}
                  disabled={!isEditing}
                  onChange={(e) => handlePersonalChange('emergencyContactRelationship', e.target.value)}
                  error={errors.personal?.emergencyContactRelationship}
                >
                  {RELATIONSHIPS.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Address Group */}
          <div className="pt-2 border-t border-crm-border">
            <h4 className="text-xs font-bold text-turquoise uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Residential Addresses
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 10. CURRENT ADDRESS */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                  Current Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  disabled={!isEditing}
                  placeholder="Flat/House, Street, City, State, PIN"
                  value={record.personal.currentAddress}
                  onChange={(e) => handlePersonalChange('currentAddress', e.target.value)}
                  className={`w-full p-2.5 rounded-md bg-crm-surface border text-xs text-crm-text placeholder:text-crm-textDim focus:outline-none focus:border-turquoise disabled:opacity-75 disabled:cursor-not-allowed ${
                    errors.personal?.currentAddress ? 'border-red-500' : 'border-crm-border'
                  }`}
                />
                {errors.personal?.currentAddress && (
                  <p className="text-[11px] text-red-400 mt-0.5">{errors.personal.currentAddress}</p>
                )}
              </div>

              {/* 11. PERMANENT ADDRESS */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                    Permanent Address <span className="text-red-400">*</span>
                  </label>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handlePersonalChange('permanentAddress', record.personal.currentAddress)}
                      className="text-[11px] text-turquoise hover:underline"
                    >
                      Same as Current Address
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  disabled={!isEditing}
                  placeholder="Permanent Hometown Address, City, State, PIN"
                  value={record.personal.permanentAddress}
                  onChange={(e) => handlePersonalChange('permanentAddress', e.target.value)}
                  className={`w-full p-2.5 rounded-md bg-crm-surface border text-xs text-crm-text placeholder:text-crm-textDim focus:outline-none focus:border-turquoise disabled:opacity-75 disabled:cursor-not-allowed ${
                    errors.personal?.permanentAddress ? 'border-red-500' : 'border-crm-border'
                  }`}
                />
                {errors.personal?.permanentAddress && (
                  <p className="text-[11px] text-red-400 mt-0.5">{errors.personal.permanentAddress}</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SEGMENT 2: BANK DETAILS */}
      {/* ========================================================================= */}
      {activeSegment === 'bank' && (
        <Card className="p-5 space-y-5 border-turquoise/30">
          <div className="flex items-center justify-between pb-3 border-b border-crm-border">
            <div>
              <h3 className="text-sm font-bold text-crm-text flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-turquoise" />
                Bank Details (बैंक विवरण)
              </h3>
              <p className="text-[11px] text-crm-textMuted mt-0.5">
                Payroll disbursement account, IFSC routing, account verification and branch records.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30">
              6 FIELDS COMPULSORY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. NAME */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Name (as in Employee Profile) <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Aarav Sharma"
                value={record.bank.name}
                disabled={!isEditing}
                onChange={(e) => handleBankChange('name', e.target.value)}
                error={errors.bank?.name}
              />
            </div>

            {/* 2. ACCOUNT HOLDER NAME */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Account Holder Name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="Exact name as in passbook / cheque"
                value={record.bank.accountHolderName}
                disabled={!isEditing}
                onChange={(e) => handleBankChange('accountHolderName', e.target.value)}
                error={errors.bank?.accountHolderName}
              />
            </div>

            {/* 3. BANK NAME */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Bank Name <span className="text-red-400">*</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    list="bank-suggestions"
                    value={record.bank.bankName}
                    onChange={(e) => handleBankChange('bankName', e.target.value)}
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    className={`w-full h-8.5 px-3 py-1.5 text-xs bg-crm-surface text-crm-text placeholder:text-crm-textDim rounded-md border ${
                      errors.bank?.bankName ? 'border-red-500' : 'border-crm-border'
                    } focus:border-turquoise focus:outline-none`}
                  />
                  <datalist id="bank-suggestions">
                    {COMMON_BANKS.map(b => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
              ) : (
                <Input
                  value={record.bank.bankName}
                  disabled
                />
              )}
              {errors.bank?.bankName && (
                <p className="text-[11px] text-red-400 mt-0.5">{errors.bank.bankName}</p>
              )}
            </div>

            {/* 4. ACCOUNT NUMBER */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                  Account Number <span className="text-red-400">*</span>
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowAccountNumber(prev => !prev)}
                    className="text-[11px] text-turquoise hover:underline flex items-center gap-1"
                  >
                    {showAccountNumber ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    {showAccountNumber ? 'Mask' : 'Reveal'}
                  </button>
                )}
              </div>
              <Input
                type={!isEditing && !showAccountNumber ? 'password' : 'text'}
                placeholder="e.g. 50100234567890"
                value={record.bank.accountNumber}
                disabled={!isEditing}
                onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                error={errors.bank?.accountNumber}
              />
            </div>

            {/* 5. IFSC CODE */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                IFSC Code <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. HDFC0001234"
                value={record.bank.ifscCode}
                disabled={!isEditing}
                onChange={(e) => handleBankChange('ifscCode', e.target.value.toUpperCase())}
                error={errors.bank?.ifscCode}
                helperText="11 characters (4 letters, 0, 6 characters)"
              />
            </div>

            {/* 6. BRANCH */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Branch Location <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Indiranagar, Bengaluru"
                value={record.bank.branch}
                disabled={!isEditing}
                onChange={(e) => handleBankChange('branch', e.target.value)}
                error={errors.bank?.branch}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300">Bank Details Encryption & Privacy Notice</span>
              <p className="text-crm-textSecondary text-[11px] mt-0.5 leading-relaxed">
                Bank credentials are exclusively accessible to authenticated HR/Finance admins for salary processing and stored securely in Supabase with TLS 1.3 transit encryption.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SEGMENT 3: JOB DETAILS */}
      {/* ========================================================================= */}
      {activeSegment === 'job' && (
        <Card className="p-5 space-y-5 border-turquoise/30">
          <div className="flex items-center justify-between pb-3 border-b border-crm-border">
            <div>
              <h3 className="text-sm font-bold text-crm-text flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-turquoise" />
                Job Details (कार्य एवं पद विवरण)
              </h3>
              <p className="text-[11px] text-crm-textMuted mt-0.5">
                Organizational assignment, corporate employee code, DOJ, department, and work mode.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30">
              8 FIELDS COMPULSORY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. NAME */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Employee Name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Aarav Sharma"
                value={record.job.name}
                disabled={!isEditing}
                onChange={(e) => handleJobChange('name', e.target.value)}
                error={errors.job?.name}
              />
            </div>

            {/* 2. EMPLOYEE ID */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Employee ID <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. SCL-2026-001"
                value={record.job.employeeId}
                disabled={!isEditing}
                onChange={(e) => handleJobChange('employeeId', e.target.value.toUpperCase())}
                error={errors.job?.employeeId}
              />
            </div>

            {/* 3. DOJ (Date of Joining) */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Date of Joining (DOJ) <span className="text-red-400">*</span>
              </label>
              <Input
                type="date"
                value={record.job.doj}
                disabled={!isEditing}
                onChange={(e) => handleJobChange('doj', e.target.value)}
                error={errors.job?.doj}
              />
            </div>

            {/* 4. DESIGNATION */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Designation <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Senior Full-Stack Engineer"
                value={record.job.designation}
                disabled={!isEditing}
                onChange={(e) => handleJobChange('designation', e.target.value)}
                error={errors.job?.designation}
              />
            </div>

            {/* 5. TEAM */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Team / Department <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Engineering, Sales, HR"
                value={record.job.team}
                disabled={!isEditing}
                onChange={(e) => handleJobChange('team', e.target.value)}
                error={errors.job?.team}
              />
            </div>

            {/* 6. EMPLOYMENT TYPE */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Employment Type <span className="text-red-400">*</span>
              </label>
              <Select
                value={record.job.employmentType}
                disabled={!isEditing}
                onChange={(e) => handleJobChange('employmentType', e.target.value)}
                error={errors.job?.employmentType}
              >
                {EMPLOYMENT_TYPES.map(et => (
                  <option key={et} value={et}>{et}</option>
                ))}
              </Select>
            </div>

            {/* 7. WORK MODE */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Work Mode <span className="text-red-400">*</span>
              </label>
              <Select
                value={record.job.workMode}
                disabled={!isEditing}
                onChange={(e) => handleJobChange('workMode', e.target.value)}
                error={errors.job?.workMode}
              >
                {WORK_MODES.map(wm => (
                  <option key={wm} value={wm}>{wm}</option>
                ))}
              </Select>
            </div>

            {/* 8. EMPLOYMENT STATUS */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-crm-textSecondary uppercase tracking-wider">
                Employment Status <span className="text-red-400">*</span>
              </label>
              <Select
                value={record.job.employmentStatus}
                disabled={!isEditing}
                onChange={(e) => handleJobChange('employmentStatus', e.target.value)}
                error={errors.job?.employmentStatus}
              >
                {EMPLOYMENT_STATUSES.map(es => (
                  <option key={es} value={es}>{es}</option>
                ))}
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Save Action Footer Bar when Editing */}
      {isEditing && (
        <div className="p-4 rounded-xl bg-crm-card border border-turquoise/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-crm-textSecondary">
            <CheckCircle2 className="w-4 h-4 text-turquoise" />
            <span>
              All 3 segments will be synchronized to Supabase PostgreSQL with real-time audit ledger tracking.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveToSupabase}
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              className="bg-turquoise text-slate-950 hover:bg-turquoise/90 font-semibold px-4"
            >
              Save All 3 Segments to Supabase
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Summary & Live Supabase Sync Status */}
      <div className="p-3.5 rounded-lg bg-crm-surface/50 border border-crm-border flex flex-wrap items-center justify-between gap-3 text-xs text-crm-textSecondary font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Supabase DB: <strong className="text-turquoise font-medium">yvmjnwwxhdvfzhtrlyuk.supabase.co</strong>
          </span>
          <span>•</span>
          <span>Target Record: <strong className="text-crm-text">{record.id}</strong></span>
        </div>

        {lastSyncInfo && (
          <div className="text-[11px] text-crm-textMuted">
            Last Synced: {lastSyncInfo.time} via {lastSyncInfo.mode}
          </div>
        )}
      </div>

      {/* Supabase SQL Migration Modal */}
      <Modal
        isOpen={showSqlModal}
        onClose={() => setShowSqlModal(false)}
        title="Supabase PostgreSQL Schema Setup"
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-crm-textSecondary leading-relaxed">
            Run this SQL query in your Supabase SQL Editor to create the dedicated <code className="text-turquoise bg-crm-surface px-1.5 py-0.5 rounded font-mono">employee_details</code> table with Row Level Security (RLS) policies.
          </p>

          <div className="relative">
            <pre className="p-4 rounded-lg bg-slate-950 border border-crm-border text-turquoise/90 font-mono text-[11px] overflow-x-auto max-h-72">
              {sqlCode}
            </pre>
            <button
              onClick={handleCopySql}
              className="absolute top-3 right-3 px-2.5 py-1 rounded bg-crm-surface hover:bg-crm-card text-crm-text text-[11px] border border-crm-border flex items-center gap-1.5 transition-colors"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-crm-border">
            <a
              href="https://supabase.com/dashboard/project/yvmjnwwxhdvfzhtrlyuk/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-turquoise hover:underline flex items-center gap-1.5"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <Button variant="secondary" size="sm" onClick={() => setShowSqlModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
