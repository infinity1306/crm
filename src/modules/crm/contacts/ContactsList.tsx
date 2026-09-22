import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Contact, ContactStatus } from '../../../types/crm';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { AddContactModal } from './AddContactModal';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Mail, 
  Phone, 
  Building2, 
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const ContactsList: React.FC = () => {
  const { contacts, companies, navigateTo } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCompany = companyFilter === 'all' || c.companyId === companyFilter;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesCompany && matchesStatus;
    });
  }, [contacts, searchQuery, companyFilter, statusFilter]);

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case 'customer':
        return <Badge variant="success">Customer</Badge>;
      case 'active':
        return <Badge variant="primary">Active</Badge>;
      case 'lead':
        return <Badge variant="warning">Lead Contact</Badge>;
      case 'inactive':
        return <Badge variant="neutral">Inactive</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-crm-text">Stakeholder Contacts</h1>
            <Badge variant="primary">{contacts.length} Records</Badge>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Key client representatives, CTOs, technical decision-makers, and organizational points of contact.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Contact
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-crm-textMuted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search contacts by name, company, email, title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-crm-surface border border-crm-border rounded-md text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-crm-surface border border-crm-border rounded text-xs text-crm-textSecondary focus:outline-none focus:border-turquoise"
          >
            <option value="all">All Companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-crm-surface border border-crm-border rounded text-xs text-crm-textSecondary focus:outline-none focus:border-turquoise"
          >
            <option value="all">All Statuses</option>
            <option value="customer">Customer</option>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {(searchQuery || companyFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCompanyFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-turquoise hover:underline ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-crm-border bg-crm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-crm-border bg-crm-surface/60 text-crm-textMuted font-medium">
                <th className="py-2.5 px-4 font-semibold">Contact Person</th>
                <th className="py-2.5 px-3 font-semibold">Company Account</th>
                <th className="py-2.5 px-3 font-semibold">Designation / Role</th>
                <th className="py-2.5 px-3 font-semibold">Email & Phone</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Account Owner</th>
                <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-border/40">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-crm-textMuted">
                    No contacts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-crm-surface/40 transition-colors">
                    {/* Contact Person */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={contact.name} size="sm" />
                        <div>
                          <div className="font-semibold text-crm-text">{contact.name}</div>
                          <div className="text-[11px] text-crm-textMuted font-mono">Added: {contact.createdDate}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company Account */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => navigateTo(`/app/crm/companies/${contact.companyId}`)}
                        className="flex items-center gap-1.5 text-xs text-crm-text hover:text-turquoise font-medium transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-crm-textDim" />
                        <span>{contact.companyName}</span>
                      </button>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-3">
                      <span className="text-crm-textSecondary">{contact.role}</span>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-3 px-3 space-y-0.5">
                      <div className="text-crm-text flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-crm-textMuted" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="text-crm-textMuted text-[11px] flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-crm-textDim" />
                        <span>{contact.phone}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {getStatusBadge(contact.status)}
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={contact.ownerName} size="xs" />
                        <span className="text-xs text-crm-textSecondary">{contact.ownerName}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          title="Open Direct Message"
                          onClick={() => navigateTo('/app/communication/messages')}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-crm-textMuted hover:text-turquoise" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          title="View Company Account"
                          onClick={() => navigateTo(`/app/crm/companies/${contact.companyId}`)}
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-crm-textMuted hover:text-turquoise" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
