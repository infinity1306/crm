import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'right' | 'left';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  subtitle,
  children,
  footer,
  width = 'md',
  size,
  position = 'right',
}) => {
  const effectiveDescription = description || subtitle;
  const effectiveWidth = size || width;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = {
    sm: "max-w-xs",
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 transition-opacity"
        onClick={onClose}
      />

      <div 
        className={cn(
          "relative w-full bg-crm-card border-crm-border shadow-modal h-full z-10 flex flex-col",
          position === 'right' ? "ml-auto border-l" : "mr-auto border-r",
          widths[effectiveWidth]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-crm-border bg-crm-card flex-shrink-0">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-crm-text tracking-wide">
                {title}
              </h3>
            )}
            {effectiveDescription && (
              <p className="text-xs text-crm-textSecondary mt-0.5">
                {effectiveDescription}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-crm-textMuted hover:text-crm-text p-1 rounded hover:bg-crm-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 text-xs text-crm-text">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-crm-border bg-crm-surface/50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
