import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCRM();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-turquoise flex-shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
  };

  const borders = {
    success: "border-emerald-800/40",
    info: "border-teal-800/40",
    warning: "border-amber-800/40",
    error: "border-red-800/40",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-3.5 bg-crm-card/95 backdrop-blur-md rounded-lg border shadow-modal text-xs transition-all animate-in fade-in slide-in-from-bottom-2",
            borders[toast.type]
          )}
        >
          <div className="mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-crm-text">{toast.title}</h4>
            {toast.message && (
              <p className="text-crm-textSecondary text-[11px] mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-crm-textMuted hover:text-crm-text p-0.5 -mr-1 rounded hover:bg-crm-surface"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
