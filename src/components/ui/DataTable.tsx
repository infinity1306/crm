import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Download, Columns3, Filter } from 'lucide-react';

// ─── Column Definition ───
export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
  getValue?: (row: T) => string | number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: T) => void;
  exportFilename?: string;
  emptyMessage?: string;
  emptyIcon?: React.ElementType;
  actions?: React.ReactNode;
  compact?: boolean;
  stickyHeader?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({
  data,
  columns: initialColumns,
  keyExtractor,
  title,
  subtitle,
  searchPlaceholder = 'Search…',
  pageSize: initialPageSize = 15,
  pageSizeOptions = [10, 15, 25, 50],
  onRowClick,
  exportFilename = 'export',
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon,
  actions,
  compact = false,
  stickyHeader = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialColumns.forEach(c => { map[c.key] = c.visible !== false; });
    return map;
  });
  const [showColPicker, setShowColPicker] = useState(false);

  const columns = useMemo(() => initialColumns.filter(c => visibleCols[c.key] !== false), [initialColumns, visibleCols]);

  // ─── Search ───
  const searched = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      initialColumns.some(col => {
        const val = col.getValue ? col.getValue(row) : (row as any)[col.key];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, initialColumns]);

  // ─── Sort ───
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return searched;
    const col = initialColumns.find(c => c.key === sortKey);
    return [...searched].sort((a, b) => {
      const aVal = col?.getValue ? col.getValue(a) : (a as any)[sortKey];
      const bVal = col?.getValue ? col.getValue(b) : (b as any)[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [searched, sortKey, sortDir, initialColumns]);

  // ─── Paginate ───
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
      else setSortDir('asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  // ─── CSV Export ───
  const exportCSV = () => {
    const visibleColumns = initialColumns.filter(c => visibleCols[c.key] !== false);
    const header = visibleColumns.map(c => `"${c.label}"`).join(',');
    const rows = sorted.map(row =>
      visibleColumns.map(col => {
        const val = col.getValue ? col.getValue(row) : (row as any)[col.key];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleColumn = (key: string) => {
    setVisibleCols(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-3">
      {/* ─── Header ─── */}
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            {title && <h3 className="text-sm font-semibold text-crm-text">{title}</h3>}
            {subtitle && <p className="text-[11px] text-crm-textMuted mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>
      )}

      {/* ─── Toolbar ─── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-crm-textMuted" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-crm-surface border border-crm-border rounded text-crm-text placeholder:text-crm-textMuted focus:outline-none focus:border-turquoise/50"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowColPicker(!showColPicker)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] bg-crm-surface border border-crm-border rounded text-crm-textSecondary hover:text-crm-text hover:border-crm-borderHover transition-colors"
          >
            <Columns3 className="w-3.5 h-3.5" />
            Columns
          </button>
          {showColPicker && (
            <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-crm-card border border-crm-border rounded-lg shadow-xl p-2 space-y-0.5">
              {initialColumns.map(col => (
                <label key={col.key} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-crm-surface cursor-pointer text-[11px] text-crm-textSecondary">
                  <input
                    type="checkbox"
                    checked={visibleCols[col.key] !== false}
                    onChange={() => toggleColumn(col.key)}
                    className="accent-turquoise w-3 h-3"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] bg-crm-surface border border-crm-border rounded text-crm-textSecondary hover:text-crm-text hover:border-crm-borderHover transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* ─── Table ─── */}
      <div className="overflow-x-auto rounded-lg border border-crm-border">
        <table className="w-full text-xs">
          <thead className={cn("bg-crm-surface", stickyHeader && "sticky top-0 z-10")}>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    "px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted border-b border-crm-border whitespace-nowrap select-none",
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.sortable !== false && 'cursor-pointer hover:text-crm-textSecondary'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      sortKey === col.key
                        ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-turquoise" /> : <ChevronDown className="w-3 h-3 text-turquoise" />
                        : <ChevronsUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-12 text-center text-crm-textMuted">
                  <div className="flex flex-col items-center gap-2">
                    {EmptyIcon && <EmptyIcon className="w-8 h-8 opacity-30" />}
                    <span className="text-xs">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-crm-border/50 last:border-0 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-crm-surface/60",
                    !onRowClick && "hover:bg-crm-surface/30"
                  )}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn(
                        compact ? "px-3 py-1.5" : "px-3 py-2.5",
                        "text-crm-text whitespace-nowrap",
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center'
                      )}
                    >
                      {col.render
                        ? col.render(row, safePage * pageSize + i)
                        : String((row as any)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination ─── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[11px] text-crm-textMuted">
          <span>{sorted.length} record{sorted.length !== 1 ? 's' : ''}</span>
          <span className="text-crm-border">·</span>
          <span>Page {safePage + 1} of {totalPages}</span>
          <span className="text-crm-border">·</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
            className="bg-crm-surface border border-crm-border rounded px-1.5 py-0.5 text-crm-text text-[11px]"
          >
            {pageSizeOptions.map(s => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            className="p-1 rounded text-crm-textMuted hover:text-crm-text hover:bg-crm-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) pageNum = i;
            else if (safePage < 3) pageNum = i;
            else if (safePage > totalPages - 4) pageNum = totalPages - 5 + i;
            else pageNum = safePage - 2 + i;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={cn(
                  "w-6 h-6 rounded text-[11px] transition-colors",
                  pageNum === safePage
                    ? "bg-turquoise/20 text-turquoise border border-turquoise/30"
                    : "text-crm-textMuted hover:text-crm-text hover:bg-crm-surface"
                )}
              >
                {pageNum + 1}
              </button>
            );
          })}
          <button
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(safePage + 1)}
            className="p-1 rounded text-crm-textMuted hover:text-crm-text hover:bg-crm-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Click-outside handler for col picker */}
      {showColPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowColPicker(false)} />
      )}
    </div>
  );
}
