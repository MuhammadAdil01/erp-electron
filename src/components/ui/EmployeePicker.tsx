import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Loader2, Search, X } from 'lucide-react';
import { employeesApi, type Employee } from '../../api/employees.api';
import { useAuth } from '../../context/AuthContext';
import { cn } from './ClassicERPUI';

const PAGE_SIZE = 25;

/** The full employee record the API returned, so a window can show designation, hire date, phone … */
export type EmployeeOption = Employee;

const labelOf = (e?: EmployeeOption | null) =>
  e ? `${e.employeeNumber ? `${e.employeeNumber} — ` : ''}${e.name}` : '';

/**
 * A searchable, server-paged employee dropdown.
 *
 * The windows used to load `employees?pageSize=200` once and render a plain
 * <select>, which silently dropped employee #201 onward — a company with a
 * real headcount could not pick most of its staff. This asks the server for
 * the text typed (name, employee number or email), one page at a time, and
 * shows how many matched, so nobody is ever missing without the list saying so.
 *
 * A failed request is shown inside the dropdown, never rendered as an empty
 * list.
 */
export const EmployeePicker: React.FC<{
  value: string;
  onChange: (id: string, employee: EmployeeOption | null) => void;
  /** Label for the current value when it is not in the loaded page (e.g. an existing row). */
  selectedLabel?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Compact, borderless variant for grid cells. */
  compact?: boolean;
  /** Employees to leave out (already on the grid). */
  exclude?: string[];
  /** Only offer employees of this category (a category-specific document). */
  employeeCategoryId?: string | null;
}> = ({ value, onChange, selectedLabel, disabled, placeholder = 'Search employee…', className, compact, exclude, employeeCategoryId }) => {
  const { activeCompanyId } = useAuth();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [known, setKnown] = useState<EmployeeOption | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounce typing into a server query.
  useEffect(() => {
    const t = setTimeout(() => { setQ(text.trim()); setPage(1); }, 250);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const query = useQuery({
    queryKey: ['employee-picker', activeCompanyId, q, page, employeeCategoryId ?? null],
    queryFn: () => employeesApi.getAll({ q: q || undefined, page, pageSize: PAGE_SIZE, employeeCategoryId: employeeCategoryId || undefined }),
    enabled: open && !!activeCompanyId,
    staleTime: 30_000,
  });

  // The current value's label, when it is not on screen (existing rows, a
  // selection made on an earlier page).
  const current = useQuery({
    queryKey: ['employee-picker-one', activeCompanyId, value],
    queryFn: () => employeesApi.getOne(value),
    enabled: !!value && !selectedLabel && known?.id !== value && !!activeCompanyId,
    staleTime: 300_000,
  });

  const shown = useMemo(() => {
    const skip = new Set((exclude ?? []).filter((id) => id !== value));
    return (query.data?.items ?? []).filter((e) => !skip.has(e.id));
  }, [query.data, exclude, value]);

  const total = query.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const display = value
    ? selectedLabel || (known?.id === value ? labelOf(known) : labelOf(current.data as EmployeeOption | undefined)) || '…'
    : '';
  const error = query.error instanceof Error ? query.error.message : '';

  const pick = (e: EmployeeOption | null) => {
    setKnown(e);
    onChange(e?.id ?? '', e);
    setOpen(false);
    setText('');
  };

  return (
    <div ref={boxRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center justify-between text-left bg-white disabled:bg-transparent disabled:text-[#555]',
          compact ? 'h-[18px] text-[10px] px-0 border-none outline-none' : 'h-[20px] text-[10.5px] px-1 border border-[#a0a0a0] rounded-[1px]',
        )}
        title={display}
      >
        <span className={cn('truncate', !display && 'text-gray-400')}>{display || (compact ? 'Select…' : '—')}</span>
        {!disabled && <ChevronDown className="w-3 h-3 shrink-0 text-gray-500" />}
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-0.5 left-0 min-w-[260px] w-full bg-white border border-[#a0a0a0] shadow-md text-[10.5px]">
          <div className="flex items-center gap-1 px-1 py-1 border-b border-[#e0e0e0]">
            <Search className="w-3 h-3 text-gray-500" />
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              className="flex-1 outline-none text-[10.5px]"
            />
            {query.isFetching && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
          </div>
          <div className="max-h-[220px] overflow-auto">
            {value && (
              <button type="button" onClick={() => pick(null)} className="w-full text-left px-2 py-1 text-gray-500 hover:bg-[#fff4cc] flex items-center gap-1">
                <X className="w-3 h-3" /> Clear selection
              </button>
            )}
            {error && <div className="px-2 py-2 text-red-700">Could not load employees: {error}</div>}
            {!error && !query.isLoading && shown.length === 0 && (
              <div className="px-2 py-2 text-gray-400">{q ? `No employee matches "${q}".` : 'No employees in this company yet.'}</div>
            )}
            {shown.map((e) => (
              <button
                type="button"
                key={e.id}
                onClick={() => pick(e)}
                className={cn('w-full text-left px-2 py-1 hover:bg-[#fff4cc]', e.id === value && 'bg-[#ffed99] font-bold')}
              >
                {labelOf(e)}
                {e.position ? <span className="text-gray-400"> · {e.position}</span> : null}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between px-2 py-1 border-t border-[#e0e0e0] text-[10px] text-gray-500">
            <span>{total} match{total === 1 ? '' : 'es'}</span>
            <span className="flex items-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-30 hover:underline">‹ Prev</button>
              <span>{page} / {pages}</span>
              <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-30 hover:underline">Next ›</button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
