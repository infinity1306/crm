import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import {
  FileText, Download, Save, Filter, ChevronDown,
  BarChart3, Users, FolderKanban, IndianRupee, Clock,
  LifeBuoy, Building2, Briefcase, Plus, Trash2, Eye
} from 'lucide-react';

type ReportType = 'sales' | 'projects' | 'employees' | 'attendance' | 'finance' | 'clients' | 'tickets';

interface SavedReport {
  id: string;
  name: string;
  type: ReportType;
  createdAt: string;
  filters: Record<string, string>;
}

const REPORT_TYPES: { value: ReportType; label: string; icon: React.ElementType }[] = [
  { value: 'sales', label: 'Sales Report', icon: Briefcase },
  { value: 'projects', label: 'Project Report', icon: FolderKanban },
  { value: 'employees', label: 'Employee Report', icon: Users },
  { value: 'attendance', label: 'Attendance Report', icon: Clock },
  { value: 'finance', label: 'Finance Report', icon: IndianRupee },
  { value: 'clients', label: 'Client Report', icon: Building2 },
  { value: 'tickets', label: 'Ticket Report', icon: LifeBuoy },
];

export const ReportBuilder: React.FC = () => {
  const {
    leads, deals, employees, projects, tasks, tickets,
    attendanceRecords, invoices, payments, expenses,
    companies, navigateTo, addToast
  } = useCRM();

  const [selectedType, setSelectedType] = useState<ReportType>('sales');
  const [dateFrom, setDateFrom] = useState('2026-09-01');
  const [dateTo, setDateTo] = useState('2026-09-21');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [savedReports, setSavedReports] = useState<SavedReport[]>(() => {
    const saved = localStorage.getItem('scl_saved_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // ── Generate Report Data ──
  const reportData = useMemo(() => {
    switch (selectedType) {
      case 'sales':
        return deals.map(d => ({
          id: d.id, name: d.name, client: d.companyName, owner: d.ownerName,
          value: d.value, stage: d.stage, probability: d.probability,
          closeDate: d.expectedCloseDate, source: d.source || '—',
        }));
      case 'projects':
        return projects.map(p => ({
          id: p.id, name: p.name, client: p.clientName, manager: p.managerName,
          status: p.status, priority: p.priority, deadline: p.deadline,
          budget: p.budget, progress: `${p.progress}%`,
        }));
      case 'employees':
        return employees.filter(e => departmentFilter === 'all' || e.department === departmentFilter).map(e => ({
          id: e.id, name: e.name, department: e.department, designation: e.designation,
          role: e.role, status: e.status, joinedDate: e.joinedDate,
        }));
      case 'attendance':
        return attendanceRecords.map(r => ({
          id: r.id, employee: r.employeeName, department: r.department,
          date: r.date, punchIn: r.punchIn, punchOut: r.punchOut || '—',
          status: r.status, workingHours: `${(r.totalWorkingMinutes / 60).toFixed(1)}h`,
          lateMinutes: r.lateMinutes, overtime: `${r.overtimeMinutes}m`,
        }));
      case 'finance':
        return invoices.map(inv => ({
          id: inv.id, number: inv.invoiceNumber, client: inv.clientName,
          project: inv.projectName || '—', total: inv.total, paid: inv.paidAmount,
          outstanding: inv.outstandingAmount, status: inv.status,
          issueDate: inv.issueDate, dueDate: inv.dueDate,
        }));
      case 'clients':
        return companies.map(c => ({
          id: c.id, name: c.name, industry: c.industry, location: c.location,
          activeDeals: c.activeDealsCount, revenue: c.totalRevenue,
          lastActivity: c.lastActivity,
        }));
      case 'tickets':
        return tickets.map(tk => ({
          id: tk.id, title: tk.title, project: tk.projectName,
          assignee: tk.assignedToName || '—', priority: tk.priority,
          status: tk.status, createdAt: tk.createdAt,
        }));
      default:
        return [];
    }
  }, [selectedType, deals, projects, employees, attendanceRecords, invoices, companies, tickets, departmentFilter]);

  // ── Dynamic Columns ──
  const columns = useMemo((): DataTableColumn<any>[] => {
    if (reportData.length === 0) return [];
    const keys = Object.keys(reportData[0]).filter(k => k !== 'id');
    return keys.map(key => ({
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      sortable: true,
      render: (row: any) => {
        const val = row[key];
        if (typeof val === 'number' && key.toLowerCase().includes('value') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('total') || key.toLowerCase().includes('paid') || key.toLowerCase().includes('outstanding') || key.toLowerCase().includes('budget')) {
          return <span className="font-mono">₹{(val / 1000).toFixed(0)}K</span>;
        }
        if (key === 'status' || key === 'stage' || key === 'priority') {
          const v = val === 'won' || val === 'paid' || val === 'active' || val === 'resolved' || val === 'completed' ? 'success'
            : val === 'lost' || val === 'overdue' || val === 'critical' || val === 'delayed' ? 'error'
            : val === 'at_risk' || val === 'high' || val === 'blocked' || val === 'pending' ? 'warning'
            : 'neutral';
          return <Badge variant={v} size="sm">{String(val).replace(/_/g, ' ')}</Badge>;
        }
        return <span className="text-crm-textSecondary">{String(val)}</span>;
      },
    }));
  }, [reportData]);

  // ── Save Report ──
  const saveReport = () => {
    const report: SavedReport = {
      id: `rpt-${Date.now()}`,
      name: `${REPORT_TYPES.find(t => t.value === selectedType)?.label} — ${dateFrom} to ${dateTo}`,
      type: selectedType,
      createdAt: '2026-09-21',
      filters: { dateFrom, dateTo, department: departmentFilter, status: statusFilter },
    };
    const updated = [report, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem('scl_saved_reports', JSON.stringify(updated));
    addToast({ type: 'success', title: 'Report Saved', message: report.name });
  };

  const deleteReport = (id: string) => {
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    localStorage.setItem('scl_saved_reports', JSON.stringify(updated));
    addToast({ type: 'info', title: 'Report Deleted' });
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-lg font-bold text-crm-text tracking-tight">Report Builder</h1>
        <p className="text-xs text-crm-textMuted mt-0.5">Generate, save, and export enterprise reports across all modules</p>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        {REPORT_TYPES.map(rt => (
          <button
            key={rt.value}
            onClick={() => setSelectedType(rt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              selectedType === rt.value
                ? 'bg-turquoise/15 text-turquoise border-turquoise/30'
                : 'bg-crm-surface text-crm-textSecondary border-crm-border hover:text-crm-text hover:border-crm-borderHover'
            }`}
          >
            <rt.icon className="w-3.5 h-3.5" />
            {rt.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-crm-textMuted" />
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-crm-textMuted">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-2 py-1 text-xs bg-crm-surface border border-crm-border rounded text-crm-text"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-crm-textMuted">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-2 py-1 text-xs bg-crm-surface border border-crm-border rounded text-crm-text"
            />
          </div>
          {(selectedType === 'employees' || selectedType === 'attendance') && (
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="px-2 py-1 text-xs bg-crm-surface border border-crm-border rounded text-crm-text"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="HR">HR</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
            </select>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={saveReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-crm-surface border border-crm-border rounded-lg text-crm-textSecondary hover:text-crm-text hover:border-crm-borderHover transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Report
            </button>
          </div>
        </div>
      </Card>

      {/* Report Table */}
      <Card>
        <DataTable
          data={reportData}
          columns={columns}
          keyExtractor={(r: any) => r.id}
          title={REPORT_TYPES.find(t => t.value === selectedType)?.label || 'Report'}
          subtitle={`${reportData.length} records · ${dateFrom} to ${dateTo}`}
          searchPlaceholder="Search report data…"
          exportFilename={`report_${selectedType}`}
          pageSize={15}
        />
      </Card>

      {/* Saved Reports */}
      {savedReports.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Saved Reports</CardTitle></CardHeader>
          <div className="space-y-2">
            {savedReports.map(report => (
              <div key={report.id} className="flex items-center gap-3 px-3 py-2 rounded-md bg-crm-surface/30 hover:bg-crm-surface transition-colors">
                <FileText className="w-4 h-4 text-crm-textMuted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-crm-text truncate">{report.name}</p>
                  <p className="text-[10px] text-crm-textMuted">Created {report.createdAt}</p>
                </div>
                <Badge variant="neutral" size="sm" showDot={false}>{report.type}</Badge>
                <button
                  onClick={() => {
                    setSelectedType(report.type);
                    setDateFrom(report.filters.dateFrom || dateFrom);
                    setDateTo(report.filters.dateTo || dateTo);
                  }}
                  className="p-1 rounded hover:bg-crm-surface text-crm-textMuted hover:text-crm-text transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteReport(report.id)}
                  className="p-1 rounded hover:bg-red-950/30 text-crm-textMuted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
