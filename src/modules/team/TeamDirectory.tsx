import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Download, 
  ArrowUpDown, 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  ShieldAlert, 
  RefreshCw, 
  Trash2, 
  CheckCircle,
  Ban,
  Mail,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Department, Role, EmployeeStatus, Employee } from '../../types';

export const TeamDirectory: React.FC = () => {
  const { 
    employees, 
    invitations, 
    navigateTo, 
    setInviteModalOpen, 
    updateEmployee, 
    resendInvitation, 
    revokeInvitation, 
    exportTeamCSV 
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'employees' | 'invitations'>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Action Menu State
  const [activeMenuEmployeeId, setActiveMenuEmployeeId] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [roleChangeEmployee, setRoleChangeEmployee] = useState<Employee | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
      const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
    }).sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [employees, searchQuery, departmentFilter, roleFilter, statusFilter, sortField, sortAsc]);

  const filteredInvitations = useMemo(() => {
    return invitations.filter(inv => {
      return (
        inv.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.designation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [invitations, searchQuery]);

  const handleCopyInviteLink = (token: string) => {
    const url = `${window.location.origin}/auth/accept-invite?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-crm-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-crm-text">
              Team Directory
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-crm-surface text-crm-textSecondary border border-crm-border">
              {employees.length} records
            </span>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            HR Onboarding Console: Direct account provisioning with 3 compulsory segments & credential generation (No token invitations required).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5 text-crm-textMuted" />}
            onClick={exportTeamCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setInviteModalOpen(true)}
            className="bg-turquoise text-slate-950 font-bold hover:bg-turquoise/90"
          >
            + Add Employee (HR Onboarding)
          </Button>
        </div>
      </div>

      {/* Tabs: Active Directory vs Invitations */}
      <div className="flex items-center justify-between border-b border-crm-border">
        <Tabs
          tabs={[
            { id: 'employees', label: 'All Employees', count: employees.length },
            { id: 'invitations', label: 'Invitations', count: invitations.length },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-crm-card rounded-lg border border-crm-border">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search by name, email, or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
          />
        </div>

        {activeTab === 'employees' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-36">
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Depts' },
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Product', label: 'Product' },
                  { value: 'Design', label: 'Design' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'HR', label: 'HR' },
                  { value: 'Operations', label: 'Operations' },
                  { value: 'Finance', label: 'Finance' },
                ]}
              />
            </div>

            <div className="w-32">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Roles' },
                  { value: 'super_admin', label: 'Super Admin' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'employee', label: 'Employee' },
                  { value: 'client', label: 'Client' },
                ]}
              />
            </div>

            <div className="w-32">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'invited', label: 'Invited' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>

            {(departmentFilter !== 'ALL' || roleFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setSearchQuery('');
                  setDepartmentFilter('ALL');
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                }}
              >
                Reset
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Table Content */}
      {activeTab === 'employees' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Employee</span>
                  <ArrowUpDown className="w-3 h-3 text-crm-textMuted" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('department')}>
                <div className="flex items-center gap-1">
                  <span>Department</span>
                  <ArrowUpDown className="w-3 h-3 text-crm-textMuted" />
                </div>
              </TableHead>
              <TableHead>Designation</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('role')}>
                <div className="flex items-center gap-1">
                  <span>Role</span>
                  <ArrowUpDown className="w-3 h-3 text-crm-textMuted" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-crm-textMuted" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('joinedDate')}>
                <div className="flex items-center gap-1">
                  <span>Joined</span>
                  <ArrowUpDown className="w-3 h-3 text-crm-textMuted" />
                </div>
              </TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableEmpty
                message="No employees match your search or filter criteria."
                action={
                  <Button variant="secondary" size="xs" onClick={() => {
                    setSearchQuery('');
                    setDepartmentFilter('ALL');
                    setRoleFilter('ALL');
                    setStatusFilter('ALL');
                  }}>
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              filteredEmployees.map(emp => (
                <TableRow key={emp.id} className="cursor-pointer">
                  <TableCell onClick={() => navigateTo(`/app/team/${emp.id}`)}>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={emp.name} size="sm" status={emp.status} />
                      <div className="min-w-0">
                        <div className="font-semibold text-crm-text group-hover:text-turquoise transition-colors truncate">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-crm-textMuted truncate">
                          {emp.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => navigateTo(`/app/team/${emp.id}`)}>
                    <span className="text-xs text-crm-textSecondary">{emp.department}</span>
                  </TableCell>
                  <TableCell onClick={() => navigateTo(`/app/team/${emp.id}`)}>
                    <span className="text-xs text-crm-text">{emp.designation}</span>
                  </TableCell>
                  <TableCell onClick={() => navigateTo(`/app/team/${emp.id}`)}>
                    <Badge variant="role" size="sm">
                      {emp.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => navigateTo(`/app/team/${emp.id}`)}>
                    <Badge variant={emp.status} size="sm">
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => navigateTo(`/app/team/${emp.id}`)}>
                    <span className="text-xs font-mono text-crm-textSecondary">{emp.joinedDate}</span>
                  </TableCell>
                  <TableCell onClick={() => navigateTo(`/app/team/${emp.id}`)}>
                    <span className="text-xs text-crm-textMuted">{emp.lastActive}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => navigateTo(`/app/team/${emp.id}`)}
                        title="View Profile"
                      >
                        <Eye className="w-3.5 h-3.5 text-crm-textSecondary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setEditingEmployee(emp)}
                        title="Quick Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-crm-textSecondary" />
                      </Button>
                      {emp.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => updateEmployee(emp.id, { status: 'suspended' })}
                          title="Suspend Employee"
                        >
                          <Ban className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      ) : emp.status === 'suspended' ? (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => updateEmployee(emp.id, { status: 'active' })}
                          title="Reactivate Employee"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      ) : (
        /* Invitations Management Tab */
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Expires On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvitations.length === 0 ? (
              <TableEmpty message="No active onboarding invitations found." />
            ) : (
              filteredInvitations.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-crm-surface border border-crm-border flex items-center justify-center text-xs text-turquoise">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-crm-text">{inv.fullName}</div>
                        <div className="text-[11px] text-crm-textMuted">{inv.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{inv.department}</TableCell>
                  <TableCell>{inv.designation}</TableCell>
                  <TableCell>
                    <Badge variant="role" size="sm">{inv.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={inv.status === 'pending' ? 'invited' : inv.status === 'accepted' ? 'active' : 'suspended'} size="sm">
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-crm-textSecondary text-xs">{inv.invitedBy}</TableCell>
                  <TableCell className="text-crm-textMuted font-mono text-xs">{inv.expiresAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleCopyInviteLink(inv.token)}
                        leftIcon={copiedToken === inv.token ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      >
                        {copiedToken === inv.token ? "Copied" : "Copy Link"}
                      </Button>
                      {inv.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => resendInvitation(inv.id)}
                            title="Resend Invite"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-turquoise" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => revokeInvitation(inv.id)}
                            title="Revoke Token"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Quick Edit Modal */}
      {editingEmployee && (
        <Modal
          isOpen={true}
          onClose={() => setEditingEmployee(null)}
          title={`Edit Employee Record — ${editingEmployee.name}`}
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateEmployee(editingEmployee.id, {
                designation: editingEmployee.designation,
                department: editingEmployee.department,
                phone: editingEmployee.phone,
                role: editingEmployee.role,
                status: editingEmployee.status
              });
              setEditingEmployee(null);
            }}
            className="space-y-4"
          >
            <Input
              label="Designation / Title"
              value={editingEmployee.designation}
              onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Department"
                value={editingEmployee.department}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value as Department })}
                options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Product', label: 'Product' },
                  { value: 'Design', label: 'Design' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'HR', label: 'HR' },
                  { value: 'Operations', label: 'Operations' },
                  { value: 'Finance', label: 'Finance' },
                ]}
              />
              <Select
                label="Role"
                value={editingEmployee.role}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value as Role })}
                options={[
                  { value: 'super_admin', label: 'Super Admin' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'employee', label: 'Employee' },
                  { value: 'client', label: 'Client' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                value={editingEmployee.phone}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
              />
              <Select
                label="Status"
                value={editingEmployee.status}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value as EmployeeStatus })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'invited', label: 'Invited' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>

            <div className="border-t border-crm-border pt-4 flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setEditingEmployee(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
