import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { DashboardPersona, WidgetId, ALL_WIDGETS, DEFAULT_LAYOUTS } from '../types';
import { Check, RotateCcw, Sliders, Shield } from 'lucide-react';

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: DashboardPersona;
  enabledWidgets: WidgetId[];
  onToggleWidget: (id: WidgetId) => void;
  onResetDefaults: () => void;
}

export const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({
  isOpen,
  onClose,
  persona,
  enabledWidgets,
  onToggleWidget,
  onResetDefaults
}) => {
  // Only show widgets that this persona is allowed to see (Enforce permissions)
  const availableWidgets = ALL_WIDGETS.filter(w => w.allowedPersonas.includes(persona));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Dashboard Layout"
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-crm-border/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-turquoise" />
            <p className="text-xs text-crm-textMuted">
              Toggle widgets to customize your active dashboard. Unauthorized widgets are strictly locked.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetDefaults}
            className="text-xs text-crm-textMuted hover:text-crm-text gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Default
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
          {availableWidgets.map(widget => {
            const isEnabled = enabledWidgets.includes(widget.id);

            return (
              <div
                key={widget.id}
                onClick={() => onToggleWidget(widget.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer select-none flex items-start justify-between gap-2 ${
                  isEnabled 
                    ? 'border-turquoise/40 bg-turquoise/5' 
                    : 'border-crm-border/60 bg-crm-surface hover:border-crm-borderHover'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-crm-text truncate">
                      {widget.title}
                    </span>
                    <Badge variant="neutral" className="text-[9px] uppercase px-1.5 py-0">
                      {widget.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-crm-textMuted line-clamp-2 mt-1">
                    {widget.description}
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isEnabled
                      ? 'bg-turquoise text-crm-bg border-turquoise'
                      : 'border-crm-border text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-crm-border/60">
          <div className="flex items-center gap-1.5 text-[11px] text-crm-textMuted">
            <Shield className="w-3.5 h-3.5 text-turquoise" />
            <span>Role-Based Access Control enforced</span>
          </div>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
