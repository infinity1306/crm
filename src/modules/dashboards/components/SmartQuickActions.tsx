import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { DashboardPersona } from '../types';
import { Button } from '../../../components/ui/Button';
import { 
  Plus, 
  ChevronDown, 
  UserPlus, 
  FolderPlus, 
  CheckSquare, 
  LifeBuoy, 
  Calendar, 
  FileText, 
  Receipt, 
  DollarSign, 
  MessageSquare,
  Sparkles,
  Send
} from 'lucide-react';

interface SmartQuickActionsProps {
  persona: DashboardPersona;
}

interface ActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}

export const SmartQuickActions: React.FC<SmartQuickActionsProps> = ({ persona }) => {
  const { 
    navigateTo, 
    setInviteModalOpen, 
    addToast 
  } = useCRM();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getActions = (): ActionItem[] => {
    switch (persona) {
      case 'super_admin':
      case 'admin':
        return [
          { id: 'invite-emp', label: 'Invite Employee', icon: UserPlus, onClick: () => setInviteModalOpen(true) },
          { id: 'new-project', label: 'Create Project', icon: FolderPlus, onClick: () => navigateTo('/app/projects') },
          { id: 'create-invoice', label: 'New Invoice', icon: Receipt, onClick: () => navigateTo('/app/finance/invoices') },
          { id: 'new-ticket', label: 'Raise Ticket', icon: LifeBuoy, onClick: () => navigateTo('/app/tickets') }
        ];

      case 'manager':
        return [
          { id: 'assign-task', label: 'Assign Task', icon: CheckSquare, onClick: () => navigateTo('/app/tasks') },
          { id: 'create-proj', label: 'New Project', icon: FolderPlus, onClick: () => navigateTo('/app/projects') },
          { id: 'raise-ticket', label: 'Raise Ticket', icon: LifeBuoy, onClick: () => navigateTo('/app/tickets') },
          { id: 'review-updates', label: 'Review Updates', icon: FileText, onClick: () => navigateTo('/app/work-updates') }
        ];

      case 'sales_exec':
      case 'sales_manager':
        return [
          { id: 'new-lead', label: 'Add Lead', icon: Plus, onClick: () => navigateTo('/app/crm/leads') },
          { id: 'schedule-meeting', label: 'Schedule Meeting', icon: Calendar, onClick: () => navigateTo('/app/sales/meetings') },
          { id: 'add-followup', label: 'Log Activity', icon: FileText, onClick: () => navigateTo('/app/sales/activities') },
          { id: 'new-deal', label: 'Create Deal', icon: DollarSign, onClick: () => navigateTo('/app/sales/pipeline') }
        ];

      case 'developer':
        return [
          { id: 'create-task', label: 'New Task', icon: CheckSquare, onClick: () => navigateTo('/app/tasks') },
          { id: 'submit-update', label: 'Daily Update', icon: Send, onClick: () => navigateTo('/app/work-updates') },
          { id: 'raise-ticket', label: 'Raise Ticket', icon: LifeBuoy, onClick: () => navigateTo('/app/tickets') }
        ];

      case 'finance':
        return [
          { id: 'new-invoice', label: 'Create Invoice', icon: Receipt, onClick: () => navigateTo('/app/finance/invoices') },
          { id: 'record-payment', label: 'Record Inward Payment', icon: DollarSign, onClick: () => navigateTo('/app/finance/payments') },
          { id: 'submit-expense', label: 'Add Expense Claim', icon: FileText, onClick: () => navigateTo('/app/finance/expenses') }
        ];

      case 'hr':
        return [
          { id: 'invite-staff', label: 'Invite Employee', icon: UserPlus, onClick: () => setInviteModalOpen(true) },
          { id: 'review-leaves', label: 'Review Leaves', icon: Calendar, onClick: () => navigateTo('/app/leave') },
          { id: 'attendance-desk', label: 'Live Floor Status', icon: CheckSquare, onClick: () => navigateTo('/app/attendance/working-now') }
        ];

      case 'client':
        return [
          { id: 'raise-client-ticket', label: 'Submit Ticket', icon: LifeBuoy, onClick: () => navigateTo('/app/tickets') },
          { id: 'send-client-msg', label: 'Message Team', icon: MessageSquare, onClick: () => navigateTo('/app/communication/messages') }
        ];

      default:
        return [
          { id: 'default-task', label: 'Create Task', icon: CheckSquare, onClick: () => navigateTo('/app/tasks') }
        ];
    }
  };

  const actions = getActions();

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="primary" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)} 
        className="gap-1.5 shadow-sm text-xs"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Quick Create</span>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 bg-crm-card border border-crm-border rounded-lg shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-crm-border/40">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-crm-textMuted">
              Actions for {persona.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          {actions.map(act => (
            <button
              key={act.id}
              onClick={() => {
                setIsOpen(false);
                act.onClick();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-crm-text hover:bg-crm-surfaceHover text-left transition-colors"
            >
              <act.icon className="w-3.5 h-3.5 text-turquoise" />
              <span>{act.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
