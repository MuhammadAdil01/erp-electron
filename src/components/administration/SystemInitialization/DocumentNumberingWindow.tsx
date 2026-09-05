import React, { useEffect, useMemo, useState } from 'react';
import { Hash, CheckCircle2, AlertTriangle, Star, RefreshCw } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { numberingApi, type NumberingSeries } from '../../../api/administration.api';
import {
  ClassicWindow,
  CrudToolbar,
  ToolBtn,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { cn, ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

const emptyForm = {
  documentType: 'journal_entry',
  name: '',
  prefix: '',
  suffix: '',
  firstNumber: '1',
  nextNumber: '',
  lastNumber: '',
  digits: '0',
  isDefault: false,
  isLocked: false,
  remarks: '',
};

const pretty = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Mirrors the server's formatting so the preview matches what will be issued. */
const preview = (f: typeof emptyForm) => {
  const n = Number(f.nextNumber || f.firstNumber || 1);
  const digits = Number(f.digits || 0);
  const body = digits > 0 ? String(n).padStart(digits, '0') : String(n);
  return `${f.prefix}${body}${f.suffix}`;
};

export const DocumentNumberingWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [form, setForm] = useState(emptyForm);
  const [typeFilter, setTypeFilter] = useState('');
  const [showCheck, setShowCheck] = useState(false);

  const crud = useCrudResource<NumberingSeries>('numbering-series', numberingApi, {
    label: (s) => `${pretty(s.documentType)} / ${s.name}`,
  });

  const { data: docTypes = [] } = useQuery({
    queryKey: ['numbering-doc-types', companyId],
    queryFn: () => numberingApi.documentTypes(),
    enabled: !!companyId,
  });

  const { data: check, refetch: refetchCheck, isFetching: checking } = useQuery({
    queryKey: ['numbering-check', companyId],
    queryFn: () => numberingApi.check(),
    enabled: !!companyId && showCheck,
  });

  const setDefaultMut = useMutation({
    mutationFn: (id: string) => numberingApi.setDefault(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['numbering-series'] });
      void qc.invalidateQueries({ queryKey: ['numbering-doc-types'] });
      crud.setError('');
    },
    onError: (e: unknown) =>
      crud.setError(e instanceof Error ? e.message : 'Could not set the default series.'),
  });

  useEffect(() => {
    if (crud.mode === 'new') {
      setForm({ ...emptyForm, documentType: typeFilter || 'journal_entry' });
    } else if (crud.mode === 'edit' && crud.selected) {
      const s = crud.selected;
      setForm({
        documentType: s.documentType,
        name: s.name,
        prefix: s.prefix ?? '',
        suffix: s.suffix ?? '',
        firstNumber: String(s.firstNumber),
        nextNumber: String(s.nextNumber),
        lastNumber: s.lastNumber !== null && s.lastNumber !== undefined ? String(s.lastNumber) : '',
        digits: String(s.digits),
        isDefault: s.isDefault,
        isLocked: s.isLocked,
        remarks: s.remarks ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crud.mode, crud.selected]);

  const rows = useMemo(
    () => (typeFilter ? crud.rows.filter((r) => r.documentType === typeFilter) : crud.rows),
    [crud.rows, typeFilter],
  );

  // Document types with no series at all: these will hard-fail on save, so they
  // are worth surfacing rather than leaving to a runtime error.
  const unconfigured = docTypes.filter((t) => t.seriesCount === 0);

  const handleSave = () => {
    if (!form.name.trim()) {
      crud.setError('Series name is required.');
      return;
    }
    const first = Number(form.firstNumber || 1);
    const next = form.nextNumber ? Number(form.nextNumber) : first;
    const last = form.lastNumber ? Number(form.lastNumber) : undefined;

    if (last !== undefined && last < first) {
      crud.setError('Last number cannot be below the first number.');
      return;
    }
    if (crud.mode === 'edit' && crud.selected && next < crud.selected.nextNumber) {
      crud.setError(
        `Next number cannot move backwards (from ${crud.selected.nextNumber} to ${next}) — ` +
          `those numbers may already be issued. Create a new series instead.`,
      );
      return;
    }

    crud.save({
      documentType: form.documentType,
      name: form.name.trim(),
      prefix: form.prefix || undefined,
      suffix: form.suffix || undefined,
      firstNumber: first,
      nextNumber: next,
      lastNumber: last,
      digits: Number(form.digits || 0),
      isDefault: form.isDefault,
      isLocked: form.isLocked,
      remarks: form.remarks || undefined,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';

  return (
    <ClassicWindow
      title="Document Numbering"
      icon={<Hash className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={940}
      minHeight={500}
      toolbar={
        <>
          <CrudToolbar
            onNew={crud.openNew}
            onEdit={() => crud.selected && crud.openEdit(crud.selected)}
            onDelete={() => crud.remove()}
            onRefresh={crud.refetch}
            canEdit={!!crud.selected}
            canDelete={!!crud.selected}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <ToolBtn
            onClick={() => crud.selected && setDefaultMut.mutate(crud.selected.id)}
            disabled={!crud.selected || crud.selected.isDefault || crud.isBusy}
            title="Make this the default series for its document type"
          >
            <Star className="w-3 h-3" /> Set Default
          </ToolBtn>
          <ToolBtn
            onClick={() => { setShowCheck((v) => !v); if (!showCheck) void refetchCheck(); }}
          >
            <CheckCircle2 className="w-3 h-3" /> Check Numbering
          </ToolBtn>
          <ClassicSel
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="ml-2 w-44"
          >
            <option value="">All document types</option>
            {docTypes.map((t) => (
              <option key={t.documentType} value={t.documentType}>
                {pretty(t.documentType)} ({t.seriesCount})
              </option>
            ))}
          </ClassicSel>
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={
        <>
          <span>{rows.length} series shown · {unconfigured.length} document type(s) with none</span>
          <span>Document Numbering</span>
        </>
      }
    >
      {showCheck && (
        <div className="shrink-0 border-b border-[#d4d0c8] bg-[#fffbe6] p-2 max-h-[160px] overflow-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10.5px] font-bold">Check Document Numbering</span>
            <ToolBtn onClick={() => void refetchCheck()}>
              <RefreshCw className={cn('w-3 h-3', checking && 'animate-spin')} />
            </ToolBtn>
          </div>
          {!check && <div className="text-[10px] text-gray-500">Running…</div>}
          {check && check.issueCount === 0 && (
            <div className="text-[10.5px] text-green-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {check.checked} series checked — no problems found.
            </div>
          )}
          {check && check.issueCount > 0 && (
            <ul className="space-y-0.5">
              {check.issues.map((i, idx) => (
                <li key={idx} className="text-[10px] text-red-800 flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0 mt-px" />
                  <span>
                    <b>{pretty(i.documentType)}</b>
                    {i.name !== '—' && <> / {i.name}</>} — {i.issue}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {unconfigured.length > 0 && !isForm && (
        <div className="shrink-0 border-b border-[#e0d090] bg-[#fff8e1] px-2 py-1 text-[10px] text-amber-900">
          No series configured for: {unconfigured.map((u) => pretty(u.documentType)).join(', ')}.
          Saving those documents will fail until a series exists.
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 bg-white overflow-auto custom-scrollbar">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                {['Document Type', 'Series', 'Prefix', 'First', 'Next', 'Last', 'Preview', 'Flags'].map((h) => (
                  <th key={h} className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => (
                <tr
                  key={s.id}
                  onClick={() => crud.select(s)}
                  onDoubleClick={() => crud.openEdit(s)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === s.id
                      ? 'bg-[#ffed99]'
                      : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{pretty(s.documentType)}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-medium">{s.name}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{s.prefix ?? ''}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] text-right font-mono">{s.firstNumber}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] text-right font-mono font-bold">{s.nextNumber}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] text-right font-mono">{s.lastNumber ?? '∞'}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono text-blue-800">
                    {`${s.prefix ?? ''}${s.digits > 0 ? String(s.nextNumber).padStart(s.digits, '0') : s.nextNumber}${s.suffix ?? ''}`}
                  </td>
                  <td className="py-1 px-2">
                    {s.isDefault && (
                      <span className="text-[8.5px] bg-blue-100 text-blue-700 px-1 rounded-[1px] mr-1">DEFAULT</span>
                    )}
                    {s.isLocked && (
                      <span className="text-[8.5px] bg-red-100 text-red-700 px-1 rounded-[1px]">LOCKED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && rows.length === 0}
            emptyText="No numbering series yet. Journal entries and other documents cannot save without one."
          />
        </div>

        <div className="w-[300px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new'
              ? 'New Series'
              : crud.mode === 'edit'
                ? `Edit — ${crud.selected?.name}`
                : 'Series Details'}
          </div>

          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">
              Select a series, or click New.
            </div>
          )}

          {!isForm && crud.selected && (
            <>
              <FieldRow label="Document Type">{pretty(crud.selected.documentType)}</FieldRow>
              <FieldRow label="Series">{crud.selected.name}</FieldRow>
              <FieldRow label="Next number">
                <span className="font-mono font-bold">{crud.selected.nextNumber}</span>
              </FieldRow>
              <FieldRow label="Range">
                {crud.selected.firstNumber} → {crud.selected.lastNumber ?? '∞'}
              </FieldRow>
              <FieldRow label="Default">{crud.selected.isDefault ? 'Yes' : 'No'}</FieldRow>
              <FieldRow label="Locked">{crud.selected.isLocked ? 'Yes' : 'No'}</FieldRow>
              {crud.selected.remarks && <FieldRow label="Remarks">{crud.selected.remarks}</FieldRow>}
              <div className="mt-3">
                <YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn>
              </div>
            </>
          )}

          {isForm && (
            <>
              <FieldRow label="Document Type" required>
                <ClassicSel
                  value={form.documentType}
                  onChange={(e) => setForm((f) => ({ ...f, documentType: e.target.value }))}
                  className="w-full"
                >
                  {docTypes.map((t) => (
                    <option key={t.documentType} value={t.documentType}>{pretty(t.documentType)}</option>
                  ))}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Series Name" required>
                <ClassicInput
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full"
                  placeholder="Primary"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label="Prefix">
                <ClassicInput
                  value={form.prefix}
                  onChange={(e) => setForm((f) => ({ ...f, prefix: e.target.value }))}
                  className="w-full font-mono"
                  placeholder="JE-"
                />
              </FieldRow>
              <FieldRow label="Suffix">
                <ClassicInput
                  value={form.suffix}
                  onChange={(e) => setForm((f) => ({ ...f, suffix: e.target.value }))}
                  className="w-full font-mono"
                />
              </FieldRow>
              <FieldRow label="First No.">
                <ClassicInput
                  type="number" min="0"
                  value={form.firstNumber}
                  onChange={(e) => setForm((f) => ({ ...f, firstNumber: e.target.value }))}
                  className="w-full font-mono"
                />
              </FieldRow>
              <FieldRow label="Next No.">
                <ClassicInput
                  type="number" min="0"
                  value={form.nextNumber}
                  onChange={(e) => setForm((f) => ({ ...f, nextNumber: e.target.value }))}
                  className="w-full font-mono"
                  placeholder={form.firstNumber}
                />
              </FieldRow>
              <FieldRow label="Last No.">
                <ClassicInput
                  type="number" min="0"
                  value={form.lastNumber}
                  onChange={(e) => setForm((f) => ({ ...f, lastNumber: e.target.value }))}
                  className="w-full font-mono"
                  placeholder="unlimited"
                />
              </FieldRow>
              <FieldRow label="Zero-pad width">
                <ClassicInput
                  type="number" min="0" max="12"
                  value={form.digits}
                  onChange={(e) => setForm((f) => ({ ...f, digits: e.target.value }))}
                  className="w-full font-mono"
                />
              </FieldRow>

              <div className="my-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded-[1px]">
                <div className="text-[9px] text-gray-600">Next document will be numbered</div>
                <div className="text-[13px] font-mono font-bold text-blue-800">{preview(form)}</div>
              </div>

              <label className="flex items-center gap-2 mb-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                />
                <span className="text-[10px] text-gray-700">
                  Default for this document type
                </span>
              </label>
              <label className="flex items-center gap-2 mb-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isLocked}
                  onChange={(e) => setForm((f) => ({ ...f, isLocked: e.target.checked }))}
                />
                <span className="text-[10px] text-gray-700">Locked (issues no new numbers)</span>
              </label>

              <FieldRow label="Remarks">
                <ClassicInput
                  value={form.remarks}
                  onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>

              <div className="flex gap-2 mt-3">
                <YellowBtn onClick={handleSave} disabled={crud.isBusy}>
                  {crud.isBusy ? 'Saving…' : 'Save'}
                </YellowBtn>
                <GreyBtn onClick={crud.cancel}>Cancel</GreyBtn>
              </div>
            </>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
