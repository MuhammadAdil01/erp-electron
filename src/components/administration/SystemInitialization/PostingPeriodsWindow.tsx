import React, { useMemo, useState } from 'react';
import { CalendarRange, Lock, LockOpen, Plus, RefreshCw, Wand2, Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  postingPeriodsApi,
  type PostingPeriod,
  type PeriodStatus,
  type PostingArea,
  type SubPeriodType,
} from '../../../api/financials.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

const AREAS: { key: PostingArea; label: string; field: keyof PostingPeriod }[] = [
  { key: 'general', label: 'General', field: 'generalStatus' },
  { key: 'sales', label: 'Sales', field: 'salesStatus' },
  { key: 'purchasing', label: 'Purchasing', field: 'purchasingStatus' },
  { key: 'inventory', label: 'Inventory', field: 'inventoryStatus' },
];

const STATUS_STYLE: Record<PeriodStatus, string> = {
  OPEN: 'bg-green-100 text-green-800',
  CLOSING: 'bg-amber-100 text-amber-800',
  CLOSED: 'bg-gray-200 text-gray-700',
  LOCKED: 'bg-red-100 text-red-800',
};

const d = (v?: string | null) => (v ? new Date(v).toLocaleDateString() : '—');

/** Date inputs need `yyyy-mm-dd`; the API returns full ISO timestamps. */
const isoDay = (v?: string | null) => (v ? String(v).slice(0, 10) : '');

const emptyPeriodForm = {
  name: '',
  displayName: '',
  parentId: '',
  startDate: '',
  endDate: '',
  activeFrom: '',
  activeTo: '',
  dueDateFrom: '',
  dueDateTo: '',
};

export const PostingPeriodsWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  // The company the session is acting in. A platform operator's own
  // `user.companyId` is null, so gating on that left this window empty and made
  // Add Period fail — which the old axios 401 handling then turned into a full
  // sign-out. Choose Company supplies this instead.
  const companyId = activeCompanyId;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [showGenerate, setShowGenerate] = useState(false);
  const [gen, setGen] = useState({
    fiscalYear: new Date().getFullYear(),
    subPeriodType: 'MONTHS' as SubPeriodType,
    startMonth: '',
  });

  // Generating a fiscal year covers the common case, but a company still needs
  // to add a one-off period (a 13th adjustment period, a short first year) or
  // correct a period's dates, so the window also carries a real edit form.
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view');
  const [form, setForm] = useState(emptyPeriodForm);

  const { data: periods = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['posting-periods', companyId],
    queryFn: () => postingPeriodsApi.getAll({ take: 500 }),
    enabled: !!companyId,
  });

  // The API returns a flat list; the window shows years with their sub-periods
  // nested underneath, which is how the periods are actually reasoned about.
  const { years, childrenByParent } = useMemo(() => {
    const kids = new Map<string, PostingPeriod[]>();
    const roots: PostingPeriod[] = [];
    for (const p of periods) {
      if (p.parentId) {
        if (!kids.has(p.parentId)) kids.set(p.parentId, []);
        kids.get(p.parentId)!.push(p);
      } else {
        roots.push(p);
      }
    }
    for (const list of kids.values()) {
      list.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }
    roots.sort((a, b) => b.startDate.localeCompare(a.startDate));
    return { years: roots, childrenByParent: kids };
  }, [periods]);

  const selected = periods.find((p) => p.id === selectedId) ?? null;

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected that change.');
    setStatus('');
  };
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['posting-periods'] });

  const generateMut = useMutation({
    mutationFn: () =>
      postingPeriodsApi.generate({
        fiscalYear: Number(gen.fiscalYear),
        subPeriodType: gen.subPeriodType,
        startMonth: gen.startMonth ? Number(gen.startMonth) : undefined,
      }),
    onSuccess: (year) => {
      invalidate();
      setShowGenerate(false);
      setError('');
      setStatus(`Fiscal year ${year?.name} created with its sub-periods.`);
    },
    onError: onErr,
  });

  const statusMut = useMutation({
    mutationFn: ({ id, next, area }: { id: string; next: PeriodStatus; area?: PostingArea }) =>
      postingPeriodsApi.setStatus(id, next, area),
    onSuccess: (p) => {
      invalidate();
      setError('');
      setStatus(`Period ${p.name} updated.`);
    },
    onError: onErr,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => postingPeriodsApi.remove(id),
    onSuccess: () => {
      invalidate();
      setSelectedId(null);
      setError('');
      setStatus('Period deleted.');
    },
    onError: onErr,
  });

  const buildPayload = () => ({
    name: form.name.trim(),
    displayName: form.displayName || undefined,
    parentId: form.parentId || undefined,
    startDate: form.startDate,
    endDate: form.endDate,
    activeFrom: form.activeFrom || undefined,
    activeTo: form.activeTo || undefined,
    dueDateFrom: form.dueDateFrom || undefined,
    dueDateTo: form.dueDateTo || undefined,
  });

  const saveMut = useMutation({
    mutationFn: () =>
      mode === 'new'
        ? postingPeriodsApi.create(buildPayload())
        : postingPeriodsApi.update(selectedId as string, buildPayload()),
    onSuccess: (p) => {
      invalidate();
      setSelectedId(p.id);
      setMode('view');
      setError('');
      setStatus(mode === 'new' ? `Period ${p.name} created.` : `Period ${p.name} saved.`);
    },
    onError: onErr,
  });

  const isBusy =
    generateMut.isPending || statusMut.isPending || deleteMut.isPending || saveMut.isPending;

  const openNew = () => {
    setForm({ ...emptyPeriodForm, parentId: selected?.parentId ?? selected?.id ?? '' });
    setMode('new');
    setError(''); setStatus('');
  };

  const openEdit = () => {
    if (!selected) return;
    setForm({
      name: selected.name,
      displayName: selected.displayName ?? '',
      parentId: selected.parentId ?? '',
      startDate: isoDay(selected.startDate),
      endDate: isoDay(selected.endDate),
      activeFrom: isoDay(selected.activeFrom),
      activeTo: isoDay(selected.activeTo),
      dueDateFrom: isoDay(selected.dueDateFrom),
      dueDateTo: isoDay(selected.dueDateTo),
    });
    setMode('edit');
    setError(''); setStatus('');
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError('Period code is required.'); return; }
    if (!form.startDate || !form.endDate) { setError('Start and end dates are required.'); return; }
    if (form.endDate < form.startDate) { setError('End date must be on or after the start date.'); return; }
    setError('');
    saveMut.mutate();
  };

  const renderRow = (p: PostingPeriod, depth: number) => (
    <tr
      key={p.id}
      onClick={() => { setSelectedId(p.id); setError(''); setStatus(''); }}
      className={cn(
        'border-b border-[#f0f0f0] cursor-default',
        selectedId === p.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/50',
      )}
    >
      <td className="py-1 px-2 border-r border-[#f0f0f0]" style={{ paddingLeft: 8 + depth * 16 }}>
        <span className={cn('font-mono', depth === 0 && 'font-bold')}>{p.name}</span>
      </td>
      <td className="py-1 px-2 border-r border-[#f0f0f0]">{p.displayName ?? ''}</td>
      <td className="py-1 px-2 border-r border-[#f0f0f0]">{d(p.startDate)}</td>
      <td className="py-1 px-2 border-r border-[#f0f0f0]">{d(p.endDate)}</td>
      {AREAS.map((a) => {
        const st = p[a.field] as PeriodStatus;
        return (
          <td key={a.key} className="py-1 px-1 border-r border-[#f0f0f0] text-center">
            <span className={cn('text-[8.5px] px-1 rounded-[1px]', STATUS_STYLE[st])}>{st}</span>
          </td>
        );
      })}
      <td className="py-1 px-2 text-right text-gray-500">{p._count?.journals ?? 0}</td>
    </tr>
  );

  return (
    <ClassicWindow
      title="Posting Periods"
      icon={<CalendarRange className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={960}
      minHeight={480}
      toolbar={
        <>
          <ToolBtn onClick={() => { setShowGenerate(true); setMode('view'); setError(''); setStatus(''); }} disabled={isBusy}>
            <Wand2 className="w-3 h-3" /> New Fiscal Year
          </ToolBtn>
          <ToolBtn onClick={openNew} disabled={isBusy}>
            <Plus className="w-3 h-3" /> New Period
          </ToolBtn>
          <ToolBtn onClick={openEdit} disabled={!selected || isBusy || selected.status === 'LOCKED'}>
            Edit
          </ToolBtn>
          <ToolBtn
            onClick={() => selected && statusMut.mutate({ id: selected.id, next: 'OPEN' })}
            disabled={!selected || isBusy || selected.status === 'LOCKED'}
            title={selected?.status === 'LOCKED' ? 'Locked periods can never be reopened' : 'Reopen period'}
          >
            <LockOpen className="w-3 h-3" /> Open
          </ToolBtn>
          <ToolBtn
            onClick={() => selected && statusMut.mutate({ id: selected.id, next: 'CLOSED' })}
            disabled={!selected || isBusy || selected.status === 'LOCKED'}
          >
            Close
          </ToolBtn>
          <ToolBtn
            danger
            onClick={() => {
              if (!selected) return;
              if (!window.confirm(
                `Lock period ${selected.name}?\n\nLocking is permanent — it can never be reopened.`,
              )) return;
              statusMut.mutate({ id: selected.id, next: 'LOCKED' });
            }}
            disabled={!selected || isBusy || selected.status === 'LOCKED'}
          >
            <Lock className="w-3 h-3" /> Lock
          </ToolBtn>
          <ToolBtn
            danger
            onClick={() => {
              if (!selected) return;
              if (!window.confirm(`Delete period ${selected.name}?`)) return;
              deleteMut.mutate(selected.id);
            }}
            disabled={!selected || isBusy}
          >
            Delete
          </ToolBtn>
          <ToolBtn onClick={() => refetch()} title="Refresh">
            <RefreshCw className={cn('w-3 h-3', isFetching && 'animate-spin')} />
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>{periods.length} period{periods.length === 1 ? '' : 's'} across {years.length} fiscal year(s)</span>
          <span>Posting Periods</span>
        </>
      }
    >
      {showGenerate && (
        <div className="shrink-0 bg-[#fffbe6] border-b border-[#e0d090] p-3">
          <div className="text-[11px] font-bold mb-2">Create a fiscal year and its sub-periods</div>
          <div className="flex items-end gap-3 flex-wrap">
            <label className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-600">Fiscal Year</span>
              <ClassicInput
                type="number"
                value={gen.fiscalYear}
                onChange={(e) => setGen((g) => ({ ...g, fiscalYear: Number(e.target.value) }))}
                className="w-24"
              />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-600">Sub-periods</span>
              <ClassicSel
                value={gen.subPeriodType}
                onChange={(e) => setGen((g) => ({ ...g, subPeriodType: e.target.value as SubPeriodType }))}
                className="w-32"
              >
                <option value="MONTHS">12 months</option>
                <option value="QUARTERS">4 quarters</option>
                <option value="YEAR">Year only</option>
              </ClassicSel>
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-600">Start month</span>
              <ClassicSel
                value={gen.startMonth}
                onChange={(e) => setGen((g) => ({ ...g, startMonth: e.target.value }))}
                className="w-36"
              >
                {/* Blank falls back to the company's configured fiscal year start. */}
                <option value="">Company default</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(Date.UTC(2000, i, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })}
                  </option>
                ))}
              </ClassicSel>
            </label>
            <YellowBtn onClick={() => generateMut.mutate()} disabled={isBusy}>
              {generateMut.isPending ? 'Creating…' : 'Create'}
            </YellowBtn>
            <GreyBtn onClick={() => setShowGenerate(false)}>Cancel</GreyBtn>
          </div>
          <div className="text-[9.5px] text-gray-600 mt-2">
            A fiscal year starting in April runs April → March of the following calendar year.
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto bg-white custom-scrollbar">
        <table className="w-full border-collapse text-[10.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
              <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Period Code</th>
              <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Name</th>
              <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">From</th>
              <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">To</th>
              {AREAS.map((a) => (
                <th key={a.key} className="py-1 px-1 border-r border-[#d4d0c8] font-bold text-[#444] text-center">
                  {a.label}
                </th>
              ))}
              <th className="py-1 px-2 font-bold text-[#444] text-right">Entries</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => (
              <React.Fragment key={y.id}>
                {renderRow(y, 0)}
                {(childrenByParent.get(y.id) ?? []).map((c) => renderRow(c, 1))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <ListPlaceholder
          noCompany={!companyId}
          isLoading={isLoading}
          isEmpty={!isLoading && periods.length === 0}
          emptyText="No posting periods yet. Click New Fiscal Year — journal entries cannot post without one."
        />
      </div>

      {mode !== 'view' && (
        <div className="shrink-0 border-t border-[#d4d0c8] bg-white p-3">
          <div className="text-[11px] font-bold mb-2">
            {mode === 'new' ? 'New Posting Period' : `Edit Period — ${selected?.name}`}
          </div>
          <div className="grid grid-cols-4 gap-x-4 gap-y-1">
            <FieldRow label="Period Code" labelWidth="90px" required>
              <ClassicInput
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full font-mono"
                placeholder="2026-13"
                autoFocus
              />
            </FieldRow>
            <FieldRow label="Period Name" labelWidth="90px">
              <ClassicInput
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className="w-full"
                placeholder="Adjustment Period"
              />
            </FieldRow>
            <FieldRow label="Parent Year" labelWidth="90px">
              <ClassicSel
                value={form.parentId}
                onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                className="w-full"
              >
                <option value="">— standalone —</option>
                {years
                  .filter((y) => y.id !== selectedId)
                  .map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
              </ClassicSel>
            </FieldRow>
            <div />

            <FieldRow label="Start Date" labelWidth="90px" required>
              <ClassicInput type="date" value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="w-full" />
            </FieldRow>
            <FieldRow label="End Date" labelWidth="90px" required>
              <ClassicInput type="date" value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="w-full" />
            </FieldRow>
            <FieldRow label="Active From" labelWidth="90px">
              <ClassicInput type="date" value={form.activeFrom}
                onChange={(e) => setForm((f) => ({ ...f, activeFrom: e.target.value }))} className="w-full" />
            </FieldRow>
            <FieldRow label="Active To" labelWidth="90px">
              <ClassicInput type="date" value={form.activeTo}
                onChange={(e) => setForm((f) => ({ ...f, activeTo: e.target.value }))} className="w-full" />
            </FieldRow>

            <FieldRow label="Due From" labelWidth="90px">
              <ClassicInput type="date" value={form.dueDateFrom}
                onChange={(e) => setForm((f) => ({ ...f, dueDateFrom: e.target.value }))} className="w-full" />
            </FieldRow>
            <FieldRow label="Due To" labelWidth="90px">
              <ClassicInput type="date" value={form.dueDateTo}
                onChange={(e) => setForm((f) => ({ ...f, dueDateTo: e.target.value }))} className="w-full" />
            </FieldRow>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <YellowBtn onClick={handleSave} disabled={isBusy}>
              <span className="inline-flex items-center gap-1">
                <Save className="w-3 h-3" />
                {saveMut.isPending ? 'Saving…' : mode === 'new' ? 'Add Period' : 'Update Period'}
              </span>
            </YellowBtn>
            <GreyBtn onClick={() => { setMode('view'); setError(''); }}>Cancel</GreyBtn>
            <span className="text-[9.5px] text-gray-500 ml-1">
              Sibling periods under the same parent may not overlap.
            </span>
          </div>
        </div>
      )}

      {mode === 'view' && selected && (
        <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f7f7f7] p-2">
          <div className="text-[10.5px] font-bold mb-1">
            {selected.name}
            {selected.displayName ? ` — ${selected.displayName}` : ''}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {AREAS.map((a) => {
              const st = selected[a.field] as PeriodStatus;
              return (
                <label key={a.key} className="flex items-center gap-1 text-[10px]">
                  <span className="text-gray-600 w-[68px]">{a.label}</span>
                  <ClassicSel
                    value={st}
                    disabled={selected.status === 'LOCKED' || isBusy}
                    onChange={(e) =>
                      statusMut.mutate({
                        id: selected.id,
                        next: e.target.value as PeriodStatus,
                        area: a.key,
                      })
                    }
                    className="w-24"
                  >
                    <option value="OPEN">Open</option>
                    <option value="CLOSING">Closing</option>
                    <option value="CLOSED">Closed</option>
                    <option value="LOCKED">Locked</option>
                  </ClassicSel>
                </label>
              );
            })}
          </div>
          <div className="text-[9.5px] text-gray-600 mt-1">
            Each area locks independently — a period can be closed for Sales while still open for General.
            {selected.status === 'LOCKED' && (
              <span className="text-red-700 font-medium"> This period is locked and cannot be changed.</span>
            )}
          </div>
        </div>
      )}
    </ClassicWindow>
  );
};
