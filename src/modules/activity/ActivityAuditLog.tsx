import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  History, 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Sparkles,
  Activity,
  Server
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../components/ui/Table';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { AuditLog } from '../../types';

export const ActivityAuditLog: React.FC = () => {
  const { auditLogs, activityEvents, addToast } = useCRM();

  const [activeTab, setActiveTab] = useState<'audit' | 'activity'>('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;

    return matchesSearch && matchesStatus && matchesEntity;
  });

  const exportAuditCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Status', 'Details'];
    const rows = filteredAuditLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      l.userRole,
      l.action,
      l.entityType,
      l.entityId,
      l.ipAddress,
      l.status,
      `"${l.details}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `StarChainLabs_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Audit Log Exported',
      message: `Downloaded ${filteredAuditLogs.length} audit entries`
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              System Audit & Activity Engine
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-crm-surface text-turquoise border border-turquoise/30 uppercase">
              Compliance Layer
            </span>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Immutable system-wide event stream tracking all operational and administrative actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5 text-crm-textMuted" />}
            onClick={exportAuditCSV}
          >
            Export Audit Trail (CSV)
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'audit', label: 'Compliance Audit Logs', count: auditLogs.length },
          { id: 'activity', label: 'Internal Activity Stream', count: activityEvents.length },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Audit Logs Tab */}
      {activeTab === 'audit' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-crm-card rounded-lg border border-crm-border">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search audit action, user, or IP address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-3.5 h-3.5" />}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-36">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Statuses' },
                    { value: 'SUCCESS', label: 'Success' },
                    { value: 'WARNING', label: 'Warning' },
                    { value: 'FAILED', label: 'Failed' },
                  ]}
                />
              </div>

              <div className="w-40">
                <Select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Entities' },
                    { value: 'AUTH', label: 'Authentication' },
                    { value: 'EMPLOYEE', label: 'Employee' },
                    { value: 'INVITATION', label: 'Invitation' },
                    { value: 'ROLE_PERMISSIONS', label: 'Permissions' },
                    { value: 'ORGANIZATION', label: 'Organization' },
                    { value: 'TEAM_DIRECTORY', label: 'Directory' },
                  ]}
                />
              </div>

              {(statusFilter !== 'ALL' || entityFilter !== 'ALL' || searchQuery) && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setEntityFilter('ALL');
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Audit Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp (UTC)</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuditLogs.length === 0 ? (
                <TableEmpty message="No audit records match your query." />
              ) : (
                filteredAuditLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-crm-textSecondary text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-crm-text">{log.userName}</div>
                      <div className="text-[10px] font-mono text-crm-textMuted uppercase">{log.userRole}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-semibold text-turquoise text-[11px]">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-crm-surface text-crm-textSecondary border border-crm-border">
                        {log.entityType}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-crm-textMuted text-xs">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                        log.status === 'SUCCESS' ? 'text-emerald-400' : log.status === 'WARNING' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          log.status === 'SUCCESS' ? 'bg-emerald-400' : log.status === 'WARNING' ? 'bg-amber-400' : 'bg-red-400'
                        }`} />
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedAuditLog(log)}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Activity Stream Tab */
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-crm-border bg-crm-surface/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-crm-text">
              Unified Star Chain Labs Activity Feed
            </h3>
            <p className="text-[11px] text-crm-textMuted mt-0.5">
              Live events generated by employee onboarding, role modifications, and system alerts.
            </p>
          </div>

          <div className="divide-y divide-crm-border/60">
            {activityEvents.map(act => (
              <div key={act.id} className="p-4 flex items-start gap-4 hover:bg-crm-surface/40 transition-colors">
                <div className="p-2 rounded bg-crm-surface text-turquoise border border-crm-border mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-crm-text">
                      <strong className="font-semibold text-white mr-1.5">{act.actorName}</strong>
                      <span className="text-crm-textSecondary">{act.description}</span>
                    </span>
                    <span className="text-[10px] font-mono text-crm-textMuted whitespace-nowrap">
                      {act.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-crm-surface text-crm-textDim border border-crm-border">
                      {act.type}
                    </span>
                    <span className="text-[10px] font-mono text-crm-textDim">
                      Entity ID: {act.entityId}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Audit Log Inspection Modal */}
      {selectedAuditLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAuditLog(null)}
          title={`Audit Record — ${selectedAuditLog.id}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-crm-textMuted block text-[11px]">Timestamp</span>
                <span className="font-mono text-crm-text">{selectedAuditLog.timestamp}</span>
              </div>
              <div>
                <span className="text-crm-textMuted block text-[11px]">Action</span>
                <span className="font-mono text-turquoise font-semibold">{selectedAuditLog.action}</span>
              </div>
              <div>
                <span className="text-crm-textMuted block text-[11px]">Actor Identity</span>
                <span className="font-medium text-crm-text">{selectedAuditLog.userName} ({selectedAuditLog.userRole})</span>
              </div>
              <div>
                <span className="text-crm-textMuted block text-[11px]">IP Address</span>
                <span className="font-mono text-crm-text">{selectedAuditLog.ipAddress}</span>
              </div>
            </div>

            <div>
              <span className="text-crm-textMuted block text-[11px] mb-1">Audit Details</span>
              <div className="p-3 rounded bg-crm-surface border border-crm-border text-xs text-crm-textSecondary leading-relaxed">
                {selectedAuditLog.details}
              </div>
            </div>

            <div>
              <span className="text-crm-textMuted block text-[11px] mb-1">User Agent Header</span>
              <div className="p-2 rounded bg-crm-surface border border-crm-border font-mono text-[10px] text-crm-textDim truncate">
                {selectedAuditLog.userAgent}
              </div>
            </div>

            <div className="border-t border-crm-border pt-4 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setSelectedAuditLog(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
