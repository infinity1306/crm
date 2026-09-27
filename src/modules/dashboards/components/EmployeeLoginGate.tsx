import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Department } from '../../../types';
import { 
  UserCheck, 
  Lock, 
  Mail, 
  Key, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Fingerprint,
  UserPlus,
  Shield,
  Briefcase,
  Building
} from 'lucide-react';

interface EmployeeLoginGateProps {
  onSuccess?: () => void;
  onSwitchToAdmin?: () => void;
}

export const EmployeeLoginGate: React.FC<EmployeeLoginGateProps> = ({ 
  onSuccess, 
  onSwitchToAdmin 
}) => {
  const { employeeLogin, employeeRegister, employees } = useCRM();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [emailOrId, setEmailOrId] = useState('');
  const [passwordOrPin, setPasswordOrPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDesignation, setRegDesignation] = useState('');
  const [regDepartment, setRegDepartment] = useState<Department>('Engineering');
  const [regPin, setRegPin] = useState('');

  // Handle staff selector change
  const handleSelectExisting = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      setEmailOrId(val);
      setError(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId.trim()) {
      setError('Please provide your work email or employee ID.');
      return;
    }
    if (!passwordOrPin.trim()) {
      setError('Please enter your passcode or 4-digit PIN.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await employeeLogin(emailOrId, passwordOrPin);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication service error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setError('Name and work email are required.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await employeeRegister({
        name: regName,
        email: regEmail,
        designation: regDesignation || 'Team Member',
        department: regDepartment,
        pin: regPin || '1234'
      });

      if (res.success) {
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to register employee profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[540px] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-gradient-to-b from-crm-card to-crm-surface border border-turquoise/30 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-turquoise to-transparent" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-36 bg-turquoise/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon */}
        <div className="text-center space-y-3 mb-6 relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-turquoise/20 to-emerald-600/30 border border-turquoise/40 flex items-center justify-center shadow-lg shadow-turquoise/10">
            <Fingerprint className="w-8 h-8 text-turquoise" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-lg font-bold text-crm-text tracking-tight">
                Staff Sign In & Shift Terminal
              </h2>
              <Badge variant="primary" className="text-[9px] uppercase px-1.5 py-0.5">
                Terminal
              </Badge>
            </div>
            <p className="text-xs text-crm-textMuted mt-1">
              Sign in with your staff credentials to check in/out, view assigned tasks, and access personal attendance.
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-crm-surface/80 border border-crm-border rounded-lg mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-turquoise text-slate-950 shadow-sm'
                : 'text-crm-textMuted hover:text-crm-text'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Staff Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-turquoise text-slate-950 shadow-sm'
                : 'text-crm-textMuted hover:text-crm-text'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Profile</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2 text-xs text-red-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Quick staff select if registered employees exist */}
            {employees.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider mb-1.5">
                  Select Registered Staff (Optional)
                </label>
                <div className="relative">
                  <select
                    onChange={handleSelectExisting}
                    className="w-full text-xs bg-crm-surface/90 border border-crm-border rounded-md px-3 py-2 text-crm-text focus:border-turquoise focus:outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>Choose existing employee profile...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.email}>
                        {emp.name} ({emp.designation} • {emp.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider mb-1.5">
                Staff Work Email or Employee ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-crm-textMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  value={emailOrId}
                  onChange={e => setEmailOrId(e.target.value)}
                  placeholder="e.g. employee@starchainlabs.com or emp-1"
                  required
                  className="pl-9 text-xs bg-crm-surface/90 border-crm-border focus:border-turquoise"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider mb-1.5">
                Staff PIN or Passcode
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-crm-textMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordOrPin}
                  onChange={e => setPasswordOrPin(e.target.value)}
                  placeholder="Enter 4-digit PIN or password"
                  required
                  className="pl-9 pr-9 text-xs bg-crm-surface/90 border-crm-border focus:border-turquoise font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-crm-textMuted hover:text-crm-text transition-colors"
                  title={showPassword ? "Hide PIN" : "Show PIN"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="w-full text-xs py-2.5 bg-gradient-to-r from-turquoise to-emerald-500 hover:from-turquoise hover:to-emerald-400 text-slate-950 font-bold shadow-lg shadow-turquoise/20 gap-2"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isLoading ? "Verifying Staff ID..." : "Sign In & Unlock Terminal"}</span>
            </Button>
          </form>
        )}

        {/* TAB 2: REGISTER NEW EMPLOYEE FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="e.g. Maya Sharma"
                required
                className="text-xs bg-crm-surface/90 border-crm-border focus:border-turquoise"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider mb-1">
                Work Email
              </label>
              <Input
                type="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="e.g. maya.s@starchainlabs.com"
                required
                className="text-xs bg-crm-surface/90 border-crm-border focus:border-turquoise"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={regDepartment}
                  onChange={e => setRegDepartment(e.target.value as Department)}
                  className="w-full text-xs bg-crm-surface/90 border border-crm-border rounded-md px-2.5 py-2 text-crm-text focus:border-turquoise focus:outline-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider mb-1">
                  Designation
                </label>
                <Input
                  type="text"
                  value={regDesignation}
                  onChange={e => setRegDesignation(e.target.value)}
                  placeholder="e.g. Frontend Dev"
                  required
                  className="text-xs bg-crm-surface/90 border-crm-border focus:border-turquoise"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider mb-1">
                4-Digit PIN or Passcode
              </label>
              <Input
                type="password"
                value={regPin}
                onChange={e => setRegPin(e.target.value)}
                placeholder="Create 4-digit PIN (default: 1234)"
                className="text-xs bg-crm-surface/90 border-crm-border focus:border-turquoise font-mono"
              />
            </div>

            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="w-full text-xs py-2.5 bg-gradient-to-r from-turquoise to-emerald-500 hover:from-turquoise hover:to-emerald-400 text-slate-950 font-bold shadow-lg shadow-turquoise/20 gap-2 mt-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isLoading ? "Creating Staff Profile..." : "Register & Sign In"}</span>
            </Button>
          </form>
        )}

        {/* Switch to Admin Control Link */}
        {onSwitchToAdmin && (
          <div className="mt-5 pt-3 border-t border-crm-border/60 text-center">
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="text-xs text-crm-textMuted hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch to Administrator Gateway &rarr;</span>
            </button>
          </div>
        )}

        {/* Security / Verification Badge */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-crm-textMuted flex items-center justify-center gap-1.5">
            <Building className="w-3 h-3 text-turquoise" />
            <span>Staff Attendance Ledger • Cross-Linked Workstreams</span>
          </p>
        </div>
      </div>
    </div>
  );
};
