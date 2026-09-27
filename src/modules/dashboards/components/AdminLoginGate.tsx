import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  ArrowLeft, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Building2
} from 'lucide-react';

interface AdminLoginGateProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ onSuccess, onCancel }) => {
  const { adminLogin } = useCRM();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both administrator email and passcode.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Invalid administrator credentials. Access denied.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication service error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[520px] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-gradient-to-b from-crm-card to-crm-surface border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header / Shield Icon */}
        <div className="text-center space-y-3 mb-6 relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-lg font-bold text-crm-text tracking-tight">
                Admin Access Gateway
              </h2>
              <Badge variant="warning" className="text-[9px] uppercase px-1.5 py-0.5">
                Restricted
              </Badge>
            </div>
            <p className="text-xs text-crm-textMuted mt-1">
              Level 4 clearance required for administrative command, workforce telemetry & financial controls.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2 text-xs text-red-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider mb-1.5">
              Admin Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-crm-textMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@company.com"
                required
                className="pl-9 text-xs bg-crm-surface/90 border-crm-border focus:border-amber-500/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-crm-textMuted uppercase tracking-wider mb-1.5">
              Admin Passcode / PIN
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-crm-textMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password or PIN"
                required
                className="pl-9 pr-9 text-xs bg-crm-surface/90 border-crm-border focus:border-amber-500/60 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-crm-textMuted hover:text-crm-text transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
            className="w-full text-xs py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isLoading ? "Verifying Credentials..." : "Authenticate & Unlock Portal"}</span>
          </Button>

          {/* Return to Employee Workspace */}
          {onCancel && (
            <div className="pt-2 text-center border-t border-crm-border/60">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-crm-textMuted hover:text-turquoise transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Employee Workspace</span>
              </button>
            </div>
          )}
        </form>

        {/* Security Audit Badge */}
        <div className="mt-6 pt-4 border-t border-crm-border/60 text-center">
          <p className="text-[10px] text-crm-textMuted flex items-center justify-center gap-1.5">
            <Building2 className="w-3 h-3 text-amber-400" />
            <span>Enterprise Access Control • 256-Bit Cryptographic Ledger</span>
          </p>
        </div>
      </div>
    </div>
  );
};
