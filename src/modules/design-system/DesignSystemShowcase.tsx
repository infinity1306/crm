import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Layers, 
  Check, 
  AlertCircle, 
  X, 
  Info, 
  Sparkles, 
  Search, 
  Filter, 
  UserPlus, 
  Lock, 
  Eye, 
  ChevronRight,
  Trash2,
  Download,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { Tabs } from '../../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export const DesignSystemShowcase: React.FC = () => {
  const { addToast } = useCRM();

  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('buttons');

  const colorSwatches = [
    { name: 'CRM Bg Base', hex: '#080C0E', class: 'bg-[#080C0E]' },
    { name: 'CRM Card Surface', hex: '#0D1216', class: 'bg-[#0D1216]' },
    { name: 'CRM Elevated Surface', hex: '#12181E', class: 'bg-[#12181E]' },
    { name: 'CRM Surface Hover', hex: '#172027', class: 'bg-[#172027]' },
    { name: 'Subtle Border', hex: '#1E262E', class: 'bg-[#1E262E]' },
    { name: 'Turquoise Accent', hex: '#14B8A6', class: 'bg-[#14B8A6]' },
    { name: 'Turquoise Muted', hex: '#0D9488', class: 'bg-[#0D9488]' },
    { name: 'Status Active', hex: '#10B981', class: 'bg-[#10B981]' },
    { name: 'Status Invited', hex: '#F59E0B', class: 'bg-[#F59E0B]' },
    { name: 'Status Suspended', hex: '#EF4444', class: 'bg-[#EF4444]' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              Star Chain Labs Design System
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30 uppercase">
              Locked Visual Tokens
            </span>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Flat, static, dense, enterprise-grade component architecture for the internal operating system.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDrawerOpen(true)}
          >
            Preview Drawer
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            Preview Modal
          </Button>
        </div>
      </div>

      {/* Palette Swatches */}
      <Card>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-3">
          1. Color Tokens & Foundations
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {colorSwatches.map((c, i) => (
            <div key={i} className="p-2.5 rounded bg-crm-surface border border-crm-border text-xs space-y-2">
              <div className={`h-8 w-full rounded border border-crm-border/40 ${c.class}`} />
              <div>
                <div className="font-semibold text-crm-text text-[11px] truncate">{c.name}</div>
                <div className="text-[10px] font-mono text-crm-textMuted">{c.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Buttons Gallery */}
      <Card>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
          2. Button Primitive Variants & States
        </h3>
        
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-mono text-crm-textMuted block mb-2">Variants (sm size)</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Turquoise</Button>
              <Button variant="secondary">Secondary Charcoal</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger Muted</Button>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono text-crm-textMuted block mb-2">Sizes (xs, sm, md, lg)</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" size="xs">Extra Small (28px)</Button>
              <Button variant="secondary" size="sm">Small (32px)</Button>
              <Button variant="secondary" size="md">Medium (36px)</Button>
              <Button variant="secondary" size="lg">Large (40px)</Button>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono text-crm-textMuted block mb-2">States (Loading, Disabled, Icons)</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" isLoading>Submitting...</Button>
              <Button variant="secondary" disabled>Disabled State</Button>
              <Button variant="secondary" leftIcon={<Search className="w-3.5 h-3.5" />}>Left Icon</Button>
              <Button variant="secondary" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>Right Icon</Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addToast({ type: 'success', title: 'Action Executed', message: 'Design system toast triggered.' })}
              >
                Trigger Success Toast
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Form Controls Gallery */}
      <Card>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
          3. Input, Select & Form Primitives
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Standard Input"
            placeholder="Type value..."
            helperText="Subtle border with turquoise focus ring"
          />
          <Input
            label="With Left Icon"
            placeholder="Search query..."
            leftIcon={<Search className="w-3.5 h-3.5" />}
          />
          <Input
            label="Error State Input"
            value="invalid-format@@"
            error="Must be a valid format"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <Select
            label="Single Select"
            options={[
              { value: '1', label: 'Option 1' },
              { value: '2', label: 'Option 2' },
            ]}
          />
          <Select
            label="Disabled Select"
            disabled
            options={[{ value: '1', label: 'Locked Value' }]}
          />
          <Input
            label="Disabled Input"
            disabled
            value="Read-only system value"
          />
        </div>
      </Card>

      {/* Status Badges & Avatars */}
      <Card>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
          4. Subtle Status Indicators & Avatars
        </h3>

        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-mono text-crm-textMuted block mb-2">Status Badges</span>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="active">Active</Badge>
              <Badge variant="invited">Invited</Badge>
              <Badge variant="suspended">Suspended</Badge>
              <Badge variant="inactive">Inactive</Badge>
              <Badge variant="turquoise">Phase 1 Locked</Badge>
              <Badge variant="role">Admin Role</Badge>
              <Badge variant="neutral">Neutral State</Badge>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono text-crm-textMuted block mb-2">Avatars with Status Indicators</span>
            <div className="flex items-center gap-4">
              <Avatar name="Tanmay Pandey" size="xs" status="active" />
              <Avatar name="Shivanshu Sharma" size="sm" status="active" />
              <Avatar name="Siddharth Rao" size="md" status="invited" />
              <Avatar name="Riya Verma" size="lg" status="active" />
              <Avatar name="Rajesh Gupta" size="xl" status="suspended" />
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs Component */}
      <Card>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-textSecondary mb-4">
          5. Underline & Pill Tab Variants
        </h3>
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-mono text-crm-textMuted block mb-2">Underline Tabs</span>
            <Tabs
              tabs={[
                { id: 'tab1', label: 'All Items', count: 12 },
                { id: 'tab2', label: 'Active Tasks', count: 4 },
                { id: 'tab3', label: 'Archived', disabled: true },
              ]}
              activeTab="tab1"
              onChange={() => {}}
            />
          </div>

          <div>
            <span className="text-[11px] font-mono text-crm-textMuted block mb-2">Pill Tabs</span>
            <Tabs
              variant="pills"
              tabs={[
                { id: 'p1', label: 'Summary', count: 2 },
                { id: 'p2', label: 'Detailed View' },
                { id: 'p3', label: 'Audit Trail' },
              ]}
              activeTab="p1"
              onChange={() => {}}
            />
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirmation Dialog — Star Chain Labs"
        description="Review critical operational payload before proceeding."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              Confirm Action
            </Button>
          </>
        }
      >
        <p className="text-xs text-crm-textSecondary leading-relaxed">
          This modal demonstrates the standard enterprise dialog component with focus trapping, ESC key listener, and locked dark styling.
        </p>
      </Modal>

      {/* Preview Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="System Inspector Panel"
        description="Inspect background execution details."
        footer={
          <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(false)}>
            Close Panel
          </Button>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-crm-textSecondary leading-relaxed">
            Slide-over drawer component for contextual drill-downs, employee metadata editing, or mobile navigation sheets.
          </p>
          <div className="p-3 rounded bg-crm-surface border border-crm-border text-xs font-mono text-turquoise">
            STATUS: 200 OK — OPERATIONAL
          </div>
        </div>
      </Drawer>
    </div>
  );
};
