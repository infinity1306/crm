import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { AddCompanyModal } from './AddCompanyModal';
import { 
  Building2, 
  Search, 
  Plus, 
  Globe, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  ChevronRight, 
  ExternalLink,
  Users,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const CompaniesList: React.FC = () => {
  const { companies, deals, navigateTo } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Compute live deal metrics per company
  const companyMetrics = useMemo(() => {
    const map: Record<string, { dealCount: number; totalVal: number }> = {};
    deals.forEach(d => {
      if (!map[d.companyId]) {
        map[d.companyId] = { dealCount: 0, totalVal: 0 };
      }
      map[d.companyId].dealCount += 1;
      map[d.companyId].totalVal += d.value;
    });
    return map;
  }, [deals]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.primaryContactName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesIndustry = industryFilter === 'all' || c.industry.includes(industryFilter);

      return matchesSearch && matchesIndustry;
    });
  }, [companies, searchQuery, industryFilter]);

  const totalAccountsValuation = companies.reduce((acc, c) => {
    const m = companyMetrics[c.id] || { totalVal: c.totalRevenue };
    return acc + m.totalVal;
  }, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-crm-text">Client Companies & Accounts</h1>
            <Badge variant="primary">{companies.length} Accounts</Badge>
          </div>
          <p className="text-xs text-crm-textSecondary mt-0.5">
            Enterprise clients, organizational account structures, active contract values, and executive contacts.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Enroll Company
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Enterprise Accounts</div>
            <div className="text-xl font-bold text-crm-text mt-0.5">{companies.length}</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-crm-surface border border-crm-border flex items-center justify-center text-crm-textMuted">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Contracted / Pipeline Volume</div>
            <div className="text-xl font-bold text-turquoise mt-0.5">₹{(totalAccountsValuation / 100000).toFixed(1)}L</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-turquoise/10 border border-turquoise/20 flex items-center justify-center text-turquoise">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-crm-textMuted font-medium">Active Pipeline Deals</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{deals.length}</div>
          </div>
          <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-crm-textMuted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by company, sector, location, contact..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-crm-surface border border-crm-border rounded-md text-crm-text focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-crm-surface border border-crm-border rounded text-xs text-crm-textSecondary focus:outline-none focus:border-turquoise"
          >
            <option value="all">All Sectors</option>
            <option value="Fintech">Fintech</option>
            <option value="Blockchain">Blockchain / Web3</option>
            <option value="Cloud">Cloud / SaaS</option>
            <option value="Digital">Digital / AI</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rounded-lg border border-crm-border bg-crm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-crm-border bg-crm-surface/60 text-crm-textMuted font-medium">
                <th className="py-2.5 px-4 font-semibold">Company Account</th>
                <th className="py-2.5 px-3 font-semibold">Industry</th>
                <th className="py-2.5 px-3 font-semibold">Location</th>
                <th className="py-2.5 px-3 font-semibold">Key Contact</th>
                <th className="py-2.5 px-3 font-semibold">Active Deals</th>
                <th className="py-2.5 px-3 font-semibold">Account Valuation</th>
                <th className="py-2.5 px-3 font-semibold">Account Manager</th>
                <th className="py-2.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-border/40">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-crm-textMuted">
                    No enterprise companies found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map(company => {
                  const metrics = companyMetrics[company.id] || { 
                    dealCount: company.activeDealsCount, 
                    totalVal: company.totalRevenue 
                  };

                  return (
                    <tr 
                      key={company.id} 
                      className="hover:bg-crm-surface/40 transition-colors group cursor-pointer"
                      onClick={() => navigateTo(`/app/crm/companies/${company.id}`)}
                    >
                      {/* Name & Website */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-crm-text group-hover:text-turquoise transition-colors flex items-center gap-1.5">
                          <span>{company.name}</span>
                        </div>
                        <div className="text-[11px] text-crm-textMuted flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3 text-crm-textDim" />
                          <span className="truncate max-w-[160px]">{company.website.replace('https://', '')}</span>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="py-3 px-3">
                        <span className="text-xs text-crm-textSecondary px-2 py-0.5 rounded bg-crm-surface border border-crm-border/60">
                          {company.industry}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3">
                        <div className="text-xs text-crm-textSecondary flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-crm-textMuted" />
                          <span>{company.location}</span>
                        </div>
                      </td>

                      {/* Primary Contact */}
                      <td className="py-3 px-3">
                        <span className="text-xs font-medium text-crm-text">{company.primaryContactName}</span>
                      </td>

                      {/* Active Deals */}
                      <td className="py-3 px-3">
                        <Badge variant={metrics.dealCount > 0 ? 'primary' : 'neutral'}>
                          {metrics.dealCount} {metrics.dealCount === 1 ? 'Deal' : 'Deals'}
                        </Badge>
                      </td>

                      {/* Revenue Valuation */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-crm-text">
                          ₹{metrics.totalVal.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-crm-textMuted font-mono">{(metrics.totalVal / 100000).toFixed(1)}L INR</div>
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={company.ownerName} size="xs" />
                          <span className="text-xs text-crm-textSecondary truncate max-w-[120px]">{company.ownerName}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => navigateTo(`/app/crm/companies/${company.id}`)}
                          title="Open 360° Account Page"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-crm-textMuted group-hover:text-turquoise" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(id) => navigateTo(`/app/crm/companies/${id}`)}
      />
    </div>
  );
};
