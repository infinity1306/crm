import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { AdminLoginGate } from '../dashboards/components/AdminLoginGate';
import { EmployeeLoginGate } from '../dashboards/components/EmployeeLoginGate';
import { Sparkles, ShieldCheck, UserCheck, Lock } from 'lucide-react';

export const PortalAuthPage: React.FC = () => {
  const { navigateTo } = useCRM();
  const [authMode, setAuthMode] = useState<'employee' | 'admin'>('admin');

  return (
    <div className="min-h-screen w-full bg-crm-bg flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambient Mesh Lights */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-turquoise/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Branding Header */}
      <div className="mb-6 text-center z-10">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-crm-surface/80 border border-white/10 shadow-lg mb-3 backdrop-blur-md">
          <div className="w-5 h-5 rounded-md bg-turquoise/20 border border-turquoise/40 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-turquoise" />
          </div>
          <span className="text-xs font-bold tracking-widest text-crm-text uppercase">
            STAR CHAIN LABS
          </span>
          <span className="text-[10px] font-mono text-turquoise/90 uppercase px-1.5 py-0.5 rounded bg-turquoise/10 border border-turquoise/20">
            Enterprise OS
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Internal CRM & Workforce Portal
        </h1>
        <p className="text-xs text-crm-textMuted mt-1 max-w-sm mx-auto">
          Secure identity verification required to access organizational controls, sales pipelines, and shift attendance.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="w-full max-w-md mb-4 z-10">
        <div className="figma-segmented-control grid grid-cols-2 p-1 gap-1">
          <button
            type="button"
            onClick={() => setAuthMode('admin')}
            className={`py-2 px-3 text-xs font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 ${
              authMode === 'admin'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 figma-glow-amber scale-[1.01]'
                : 'text-crm-textMuted hover:text-crm-text hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Command</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('employee')}
            className={`py-2 px-3 text-xs font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 ${
              authMode === 'employee'
                ? 'bg-gradient-to-r from-turquoise to-emerald-400 text-slate-950 font-bold shadow-md shadow-turquoise/20 figma-glow-turquoise scale-[1.01]'
                : 'text-crm-textMuted hover:text-crm-text hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Staff Workspace</span>
          </button>
        </div>
      </div>

      {/* Dynamic Login Gate Container */}
      <div className="w-full max-w-md z-10">
        {authMode === 'admin' ? (
          <AdminLoginGate
            onSuccess={() => {
              navigateTo('/app/admin-dashboard');
            }}
            onCancel={() => {
              setAuthMode('employee');
            }}
          />
        ) : (
          <EmployeeLoginGate
            onSuccess={() => {
              navigateTo('/app/employee-dashboard');
            }}
            onSwitchToAdmin={() => {
              setAuthMode('admin');
            }}
          />
        )}
      </div>

      {/* Bottom Footer Notice */}
      <div className="mt-8 text-center text-[10px] text-crm-textMuted z-10">
        <p>Star Chain Labs Technologies • Enterprise Access Control System</p>
      </div>
    </div>
  );
};
