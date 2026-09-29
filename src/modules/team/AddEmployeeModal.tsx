import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { 
  User, 
  CreditCard, 
  Briefcase, 
  KeyRound, 
  Check, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Printer, 
  AlertCircle,
  Database,
  Building2,
  Phone,
  Mail,
  HeartHandshake,
  MapPin
} from 'lucide-react';
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
  validateEmployeeSegments, 
  saveEmployeeSegmentsToSupabase 
} from '../../services/employeeProfileService';
import { Employee, Department, Role } from '../../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (employee: Employee) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { employees, updateEmployee, addToast } = useCRM();

  // Active step / segment
  const [activeStep, setActiveStep] = useState<SegmentKey>('personal');

  // Generate unique employee ID helper
  const generateNewEmpId = () => {
    const nextNum = employees.length + 1;
    return `SCL-2026-${String(nextNum).padStart(3, '0')}`;
  };

  // Generate strong temporary password helper
  const generateStrongPassword = () => {
    const specials = ['@', '!', '#', '$', '%'];
    const randSpecial = specials[Math.floor(Math.random() * specials.length)];
    const randNum = Math.floor(10 + Math.random() * 90);
    return `Scl@2026${randSpecial}${randNum}`;
  };

  // Credentials State
  const [employeeIdCode, setEmployeeIdCode] = useState(() => generateNewEmpId());
  const [password, setPassword] = useState(() => generateStrongPassword());
  const [showPassword, setShowPassword] = useState(true);
  const [role, setRole] = useState<Role>('employee');

  // Segment 1: Personal Details
  const [personal, setPersonal] = useState<PersonalDetails>({
    name: '',
    dob: '1998-06-15',
    bloodGroup: 'O+',
    email: '',
    mobileNumber: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    emergencyContactRelationship: 'Father',
    currentAddress: '',
    permanentAddress: '',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  // Segment 2: Bank Details
  const [bank, setBank] = useState<BankDetails>({
    name: '',
    accountHolderName: '',
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: 'HDFC0001234',
    branch: ''
  });

  // Segment 3: Job Details
  const [job, setJob] = useState<JobDetails>({
    name: '',
    employeeId: employeeIdCode,
    doj: new Date().toISOString().split('T')[0],
    designation: '',
    team: 'Engineering',
    employmentType: 'Full-Time',
    workMode: 'Hybrid',
    employmentStatus: 'Active'
  });

  // Validation & Loading
  const [errors, setErrors] = useState<SegmentValidationErrors>({});
  const [missingList, setMissingList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState<{
    employee: Employee;
    password: string;
    portalUrl: string;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Sync Names Across Segments
  const handleSyncName = (nameVal: string) => {
    setPersonal(prev => ({ ...prev, name: nameVal }));
    setBank(prev => ({ ...prev, name: nameVal, accountHolderName: prev.accountHolderName || nameVal }));
    setJob(prev => ({ ...prev, name: nameVal }));
  };

  const handleResetForm = () => {
    setCreatedResult(null);
    setActiveStep('personal');
    setEmployeeIdCode(generateNewEmpId());
    setPassword(generateStrongPassword());
    setPersonal({
      name: '',
      dob: '1998-06-15',
      bloodGroup: 'O+',
      email: '',
      mobileNumber: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      emergencyContactRelationship: 'Father',
      currentAddress: '',
      permanentAddress: '',
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setBank({
      name: '',
      accountHolderName: '',
      bankName: 'HDFC Bank',
      accountNumber: '',
      ifscCode: 'HDFC0001234',
      branch: ''
    });
    setJob({
      name: '',
      employeeId: generateNewEmpId(),
      doj: new Date().toISOString().split('T')[0],
      designation: '',
      team: 'Engineering',
      employmentType: 'Full-Time',
      workMode: 'Hybrid',
      employmentStatus: 'Active'
    });
    setErrors({});
    setMissingList([]);
    onClose();
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare full record
    const fullRecord: EmployeeProfileRecord = {
      id: employeeIdCode.trim().toLowerCase(),
      personal: {
        ...personal,
        name: personal.name.trim(),
        email: personal.email.trim().toLowerCase(),
        mobileNumber: personal.mobileNumber.trim()
      },
      bank: {
        ...bank,
        name: (bank.name || personal.name).trim(),
        accountHolderName: (bank.accountHolderName || personal.name).trim(),
        ifscCode: bank.ifscCode.trim().toUpperCase()
      },
      job: {
        ...job,
        name: (job.name || personal.name).trim(),
        employeeId: employeeIdCode.trim().toUpperCase(),
        designation: job.designation.trim()
      },
      updatedAt: new Date().toISOString(),
      syncedToSupabase: true
    };

    // Strict compulsory validation
    const validation = validateEmployeeSegments(fullRecord);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setMissingList(validation.missingFields);
      addToast({
        title: 'Compulsory Fields Incomplete',
        message: `Please complete all mandatory fields in all 3 segments (${validation.missingFields.length} missing).`,
        type: 'error'
      });
      return;
    }

    if (!password.trim()) {
      addToast({ title: 'Password Required', message: 'Please set a login password for the employee account.', type: 'warning' });
      return;
    }

    setIsLoading(true);
    setErrors({});
    setMissingList([]);

    try {
      const newEmpId = employeeIdCode.trim().toLowerCase();
      const newEmployee: Employee = {
        id: newEmpId,
        name: personal.name.trim(),
        email: personal.email.trim().toLowerCase(),
        phone: personal.mobileNumber.trim(),
        designation: job.designation.trim(),
        department: job.team as Department,
        role,
        status: 'active',
        joinedDate: personal.joiningDate,
        lastActive: 'Newly provisioned',
        timezone: 'Asia/Kolkata (IST)',
        location: personal.currentAddress.split(',')[0] || 'Headquarters',
        directReports: 0,
        skills: ['Operations'],
        notesCount: 0,
        documentsCount: 0,
      };

      // 1. Save to CRM LocalStorage employees list
      const savedEmployees = JSON.parse(localStorage.getItem('scl_employees') || '[]');
      const updatedEmployees = [...savedEmployees.filter((e: any) => e.id !== newEmpId), newEmployee];
      localStorage.setItem('scl_employees', JSON.stringify(updatedEmployees));

      // 2. Save Password / PIN into staffPins
      const savedPins = JSON.parse(localStorage.getItem('scl_staff_pins') || '{}');
      savedPins[newEmpId] = password.trim();
      // Also register with email for flexible login
      savedPins[personal.email.trim().toLowerCase()] = password.trim();
      localStorage.setItem('scl_staff_pins', JSON.stringify(savedPins));

      // 3. Save all 3 segments into Supabase PostgreSQL
      await saveEmployeeSegmentsToSupabase(fullRecord);

      const portalUrl = window.location.origin;

      setCreatedResult({
        employee: newEmployee,
        password: password.trim(),
        portalUrl
      });

      addToast({
        title: 'Employee Account Provisioned!',
        message: `${newEmployee.name} added. All 3 segments saved to Supabase and login ID/Password generated.`,
        type: 'success'
      });

      if (onSuccess) {
        onSuccess(newEmployee);
      }
    } catch (err: any) {
      console.error(err);
      addToast({ title: 'Onboarding Error', message: err?.message || 'Failed to provision account.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const text = `STAR CHAIN LABS — EMPLOYEE PORTAL CREDENTIALS\n\nEmployee Name: ${createdResult.employee.name}\nDesignation: ${createdResult.employee.designation} (${createdResult.employee.department})\n\nLOGIN DETAILS:\n• Portal URL: ${createdResult.portalUrl}\n• Employee ID: ${createdResult.employee.id.toUpperCase()}\n• Login Email: ${createdResult.employee.email}\n• Login Password / PIN: ${createdResult.password}\n\nPlease keep these credentials secure and sign in to access your shift attendance, tasks, and profile.`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2000);
    addToast({ title: 'Credentials Copied', message: 'Ready to share on WhatsApp or Email.', type: 'info' });
  };

  const handleShareWhatsApp = () => {
    if (!createdResult) return;
    const text = `Hello ${createdResult.employee.name},\n\nWelcome to Star Chain Labs! Your official employee account has been provisioned.\n\n*Login URL:* ${createdResult.portalUrl}\n*Employee ID:* ${createdResult.employee.id.toUpperCase()}\n*Login Email:* ${createdResult.employee.email}\n*Password:* ${createdResult.password}\n\nPlease sign in to complete your shift attendance and view your workspace.`;
    const cleanPhone = personal.mobileNumber.replace(/\D/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetForm}
      title={createdResult ? "Account Provisioned & Credentials Generated" : "Add New Employee (HR Onboarding Console)"}
      size="lg"
    >
      {createdResult ? (
        <div className="space-y-4 py-2 text-xs">
          {/* Success Banner */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Employee Account Active & Saved to Supabase</span>
            </div>
            <p className="text-crm-textSecondary leading-relaxed">
              All 3 segments (Personal, Bank, and Job details) have been committed to Supabase PostgreSQL. Share the credentials below with <strong className="text-crm-text">{createdResult.employee.name}</strong>.
            </p>
          </div>

          {/* Credentials Slip Card */}
          <div className="p-5 rounded-xl bg-crm-card border border-turquoise/40 shadow-lg space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-crm-border">
              <span className="text-[11px] font-bold text-turquoise uppercase tracking-wider">
                Corporate Credentials Slip
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-bold">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-crm-textMuted text-[10px] block">EMPLOYEE NAME</span>
                <span className="text-crm-text font-bold">{createdResult.employee.name}</span>
              </div>

              <div>
                <span className="text-crm-textMuted text-[10px] block">OFFICIAL EMPLOYEE ID</span>
                <span className="text-turquoise font-bold text-sm">{createdResult.employee.id.toUpperCase()}</span>
              </div>

              <div>
                <span className="text-crm-textMuted text-[10px] block">LOGIN EMAIL ID</span>
                <span className="text-crm-text">{createdResult.employee.email}</span>
              </div>

              <div>
                <span className="text-crm-textMuted text-[10px] block">TEMPORARY PASSWORD / PIN</span>
                <span className="text-amber-400 font-bold text-sm bg-crm-surface px-2 py-0.5 rounded border border-crm-border">
                  {createdResult.password}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-crm-textMuted text-[10px] block">PORTAL LOGIN URL</span>
                <span className="text-turquoise underline break-all">{createdResult.portalUrl}</span>
              </div>
            </div>
          </div>

          {/* Share Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-crm-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCredentials}
              leftIcon={copiedCredentials ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-turquoise" />}
              className="w-full"
            >
              {copiedCredentials ? 'Copied to Clipboard!' : 'Copy ID & Password'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleShareWhatsApp}
              leftIcon={<MessageCircle className="w-3.5 h-3.5 text-slate-950" />}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
            >
              Share via WhatsApp
            </Button>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={handleResetForm}>
              Done / Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[78vh] overflow-y-auto pr-1">
          {/* Missing Fields Warning */}
          {missingList.length > 0 && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/40 text-red-300 space-y-1">
              <span className="font-semibold flex items-center gap-1.5 text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400" />
                All 3 segments are compulsory. Please fill remaining fields:
              </span>
              <div className="flex flex-wrap gap-1 pt-1">
                {missingList.map(item => (
                  <span key={item} className="px-2 py-0.5 rounded bg-red-900/40 border border-red-700/50 text-[10px] font-mono">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActiveStep('personal')}
              className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                activeStep === 'personal'
                  ? 'bg-turquoise/15 border-turquoise/60 text-turquoise font-bold'
                  : 'bg-crm-surface border-crm-border text-crm-textMuted hover:text-crm-text'
              }`}
            >
              <User className="w-4 h-4" />
              <div className="min-w-0">
                <span className="block text-[11px] truncate">1. Personal</span>
                <span className="block text-[9px] opacity-75">11 Fields</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('bank')}
              className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                activeStep === 'bank'
                  ? 'bg-turquoise/15 border-turquoise/60 text-turquoise font-bold'
                  : 'bg-crm-surface border-crm-border text-crm-textMuted hover:text-crm-text'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <div className="min-w-0">
                <span className="block text-[11px] truncate">2. Bank</span>
                <span className="block text-[9px] opacity-75">6 Fields</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('job')}
              className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                activeStep === 'job'
                  ? 'bg-turquoise/15 border-turquoise/60 text-turquoise font-bold'
                  : 'bg-crm-surface border-crm-border text-crm-textMuted hover:text-crm-text'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <div className="min-w-0">
                <span className="block text-[11px] truncate">3. Job & Login</span>
                <span className="block text-[9px] opacity-75">8 Fields + Password</span>
              </div>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* STEP 1: PERSONAL DETAILS */}
          {/* ========================================================================= */}
          {activeStep === 'personal' && (
            <div className="space-y-3.5 p-4 rounded-xl bg-crm-surface/50 border border-crm-border">
              <div className="flex items-center justify-between pb-2 border-b border-crm-border">
                <h4 className="font-bold text-turquoise uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Segment 1: Personal Details
                </h4>
                <span className="text-[10px] font-mono text-crm-textMuted">11 Compulsory Fields</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Legal Name *"
                  placeholder="e.g. Aarav Sharma"
                  value={personal.name}
                  onChange={(e) => handleSyncName(e.target.value)}
                  error={errors.personal?.name}
                  required
                />
                <Input
                  type="date"
                  label="Date of Birth (DOB) *"
                  value={personal.dob}
                  onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
                  error={errors.personal?.dob}
                  required
                />
                <Select
                  label="Blood Group *"
                  value={personal.bloodGroup}
                  onChange={(e) => setPersonal({ ...personal, bloodGroup: e.target.value })}
                  error={errors.personal?.bloodGroup}
                >
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </Select>
                <Input
                  type="email"
                  label="Official Email ID *"
                  placeholder="aarav.sharma@starchainlabs.com"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  error={errors.personal?.email}
                  required
                />
                <Input
                  type="tel"
                  label="Mobile Contact Number *"
                  placeholder="+91 98765 43210"
                  value={personal.mobileNumber}
                  onChange={(e) => setPersonal({ ...personal, mobileNumber: e.target.value })}
                  error={errors.personal?.mobileNumber}
                  required
                />
                <Input
                  type="date"
                  label="Joining Date *"
                  value={personal.joiningDate}
                  onChange={(e) => setPersonal({ ...personal, joiningDate: e.target.value })}
                  error={errors.personal?.joiningDate}
                  required
                />
              </div>

              {/* Emergency Contact */}
              <div className="pt-2 border-t border-crm-border space-y-2">
                <h5 className="font-bold text-crm-textSecondary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-turquoise" /> Emergency Contact
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Contact Name *"
                    placeholder="Sunita Sharma"
                    value={personal.emergencyContactName}
                    onChange={(e) => setPersonal({ ...personal, emergencyContactName: e.target.value })}
                    error={errors.personal?.emergencyContactName}
                    required
                  />
                  <Input
                    type="tel"
                    label="Emergency Number *"
                    placeholder="+91 98765 11111"
                    value={personal.emergencyContactNumber}
                    onChange={(e) => setPersonal({ ...personal, emergencyContactNumber: e.target.value })}
                    error={errors.personal?.emergencyContactNumber}
                    required
                  />
                  <Select
                    label="Relationship *"
                    value={personal.emergencyContactRelationship}
                    onChange={(e) => setPersonal({ ...personal, emergencyContactRelationship: e.target.value })}
                    error={errors.personal?.emergencyContactRelationship}
                  >
                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </div>
              </div>

              {/* Addresses */}
              <div className="pt-2 border-t border-crm-border space-y-2">
                <h5 className="font-bold text-crm-textSecondary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-turquoise" /> Residential Addresses
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-crm-textSecondary uppercase tracking-wider block">
                      Current Address *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Flat, Street, City, State, PIN"
                      value={personal.currentAddress}
                      onChange={(e) => setPersonal({ ...personal, currentAddress: e.target.value })}
                      className="w-full p-2 text-xs bg-crm-surface border border-crm-border rounded focus:border-turquoise focus:outline-none text-crm-text"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-crm-textSecondary uppercase tracking-wider block">
                        Permanent Address *
                      </label>
                      <button
                        type="button"
                        onClick={() => setPersonal({ ...personal, permanentAddress: personal.currentAddress })}
                        className="text-[10px] text-turquoise hover:underline"
                      >
                        Copy Current
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Permanent Hometown Address, PIN"
                      value={personal.permanentAddress}
                      onChange={(e) => setPersonal({ ...personal, permanentAddress: e.target.value })}
                      className="w-full p-2 text-xs bg-crm-surface border border-crm-border rounded focus:border-turquoise focus:outline-none text-crm-text"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  onClick={() => setActiveStep('bank')}
                >
                  Proceed to Bank Details &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: BANK DETAILS */}
          {/* ========================================================================= */}
          {activeStep === 'bank' && (
            <div className="space-y-3.5 p-4 rounded-xl bg-crm-surface/50 border border-crm-border">
              <div className="flex items-center justify-between pb-2 border-b border-crm-border">
                <h4 className="font-bold text-turquoise uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Segment 2: Bank Details
                </h4>
                <span className="text-[10px] font-mono text-crm-textMuted">6 Compulsory Fields</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Name (as in Employee Profile) *"
                  placeholder="e.g. Aarav Sharma"
                  value={bank.name || personal.name}
                  onChange={(e) => setBank({ ...bank, name: e.target.value })}
                  error={errors.bank?.name}
                  required
                />
                <Input
                  label="Account Holder Name *"
                  placeholder="Exact Name in Bank Passbook"
                  value={bank.accountHolderName || personal.name}
                  onChange={(e) => setBank({ ...bank, accountHolderName: e.target.value })}
                  error={errors.bank?.accountHolderName}
                  required
                />
                <div>
                  <label className="text-xs font-medium text-crm-textSecondary uppercase tracking-wider block mb-1">
                    Bank Name *
                  </label>
                  <input
                    list="hr-bank-suggestions"
                    value={bank.bankName}
                    onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                    className="w-full h-8.5 px-3 text-xs bg-crm-surface text-crm-text rounded border border-crm-border focus:border-turquoise focus:outline-none"
                    placeholder="HDFC Bank, SBI, ICICI..."
                    required
                  />
                  <datalist id="hr-bank-suggestions">
                    {COMMON_BANKS.map(b => <option key={b} value={b} />)}
                  </datalist>
                </div>
                <Input
                  label="Account Number *"
                  placeholder="e.g. 50100234567890"
                  value={bank.accountNumber}
                  onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                  error={errors.bank?.accountNumber}
                  required
                />
                <Input
                  label="IFSC Code *"
                  placeholder="e.g. HDFC0001234"
                  value={bank.ifscCode}
                  onChange={(e) => setBank({ ...bank, ifscCode: e.target.value.toUpperCase() })}
                  error={errors.bank?.ifscCode}
                  required
                />
                <Input
                  label="Bank Branch Location *"
                  placeholder="e.g. Indiranagar, Bengaluru"
                  value={bank.branch}
                  onChange={(e) => setBank({ ...bank, branch: e.target.value })}
                  error={errors.bank?.branch}
                  required
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setActiveStep('personal')}
                >
                  &larr; Back to Personal
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  onClick={() => setActiveStep('job')}
                >
                  Proceed to Job & Login &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: JOB DETAILS & LOGIN SETUP */}
          {/* ========================================================================= */}
          {activeStep === 'job' && (
            <div className="space-y-3.5 p-4 rounded-xl bg-crm-surface/50 border border-crm-border">
              <div className="flex items-center justify-between pb-2 border-b border-crm-border">
                <h4 className="font-bold text-turquoise uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Segment 3: Job Details & Account Credentials
                </h4>
                <span className="text-[10px] font-mono text-crm-textMuted">8 Compulsory Fields + Password</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Employee Name *"
                  placeholder="e.g. Aarav Sharma"
                  value={job.name || personal.name}
                  onChange={(e) => setJob({ ...job, name: e.target.value })}
                  error={errors.job?.name}
                  required
                />
                <Input
                  label="Designation / Job Title *"
                  placeholder="e.g. Senior Software Engineer"
                  value={job.designation}
                  onChange={(e) => setJob({ ...job, designation: e.target.value })}
                  error={errors.job?.designation}
                  required
                />
                <Select
                  label="Department / Team *"
                  value={job.team}
                  onChange={(e) => setJob({ ...job, team: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                </Select>
                <Select
                  label="Role Access Clearance *"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <option value="employee">Staff / Standard Employee</option>
                  <option value="manager">Department Manager</option>
                  <option value="admin">Operations Admin</option>
                </Select>
                <Select
                  label="Employment Type *"
                  value={job.employmentType}
                  onChange={(e) => setJob({ ...job, employmentType: e.target.value })}
                >
                  {EMPLOYMENT_TYPES.map(et => <option key={et} value={et}>{et}</option>)}
                </Select>
                <Select
                  label="Work Arrangement *"
                  value={job.workMode}
                  onChange={(e) => setJob({ ...job, workMode: e.target.value })}
                >
                  {WORK_MODES.map(wm => <option key={wm} value={wm}>{wm}</option>)}
                </Select>
                <Select
                  label="Employment Status *"
                  value={job.employmentStatus}
                  onChange={(e) => setJob({ ...job, employmentStatus: e.target.value })}
                >
                  {EMPLOYMENT_STATUSES.map(es => <option key={es} value={es}>{es}</option>)}
                </Select>
                <Input
                  type="date"
                  label="Official DOJ *"
                  value={job.doj}
                  onChange={(e) => setJob({ ...job, doj: e.target.value })}
                  error={errors.job?.doj}
                  required
                />
              </div>

              {/* Corporate Login ID & Password Creation Box */}
              <div className="p-4 rounded-xl bg-crm-card border-2 border-turquoise/40 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-turquoise font-bold text-xs">
                    <KeyRound className="w-4 h-4" />
                    <span>Login Identity & Password Setup (No Token Invite)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPassword(generateStrongPassword())}
                    className="text-[10px] text-turquoise hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-crm-textSecondary uppercase tracking-wider block mb-1">
                      Official Employee ID (Login Username) *
                    </label>
                    <input
                      type="text"
                      value={employeeIdCode}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setEmployeeIdCode(val);
                        setJob(prev => ({ ...prev, employeeId: val }));
                      }}
                      className="w-full h-8.5 px-3 text-xs bg-crm-surface text-turquoise font-mono font-bold rounded border border-crm-border focus:border-turquoise focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-crm-textSecondary uppercase tracking-wider block mb-1">
                      Initial Temporary Password / PIN *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-8.5 px-3 pr-8 text-xs bg-crm-surface text-amber-300 font-mono font-bold rounded border border-crm-border focus:border-turquoise focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-2 text-crm-textMuted hover:text-crm-text"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-crm-textMuted">
                  HR will share this ID and Password directly with the employee via WhatsApp or Email after creation.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setActiveStep('bank')}
                >
                  &larr; Back to Bank
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isLoading}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-slate-950" />}
                  className="bg-turquoise text-slate-950 font-bold hover:bg-turquoise/90"
                >
                  Provision Account & Save to Supabase
                </Button>
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
};
