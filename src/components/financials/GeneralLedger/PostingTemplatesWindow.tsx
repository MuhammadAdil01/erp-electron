import React, { useEffect, useMemo, useState } from 'react';
import { FileStack, Plus, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useCrudResource } from '../../../hooks/useCrudResource';
import {
  accountsApi,
  postingTemplatesApi,
  type AppliedPostingTemplate,
  type PostingTemplate,
  type PostingTemplatePayload,
} from '../../../api/financials.api';
import { ClassicWindow, CrudToolbar, StatusNote, ListPlaceholder, ToolBtn, type WindowState } from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  onFocus?: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
}

interface DraftLine {
  key: string;
  accountId: string;
  description: string;
  debitPct: string;
  creditPct: string;
}

const blankLine = (): DraftLine => ({
  key: Math.random().toString(36).slice(2),
  accountId: '', description: '', debitPct: '', creditPct: '',
});

const emptyForm = { code: '', description: '', isActive: true };

const num = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

const pct = (n: number) => `${n.toLocaleString('en-US', { maximumFractionDigits: 4 })}%`;

const money = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Financials → Posting Templates. A template holds percentages, not amounts:
 * each side (debit / credit) must total 100%. In Journal Entry the user picks a
 * template, types one amount and the lines are filled in by these percentages.
 * A template that entries were built from can only be deactivated, not deleted.
 */
export const PostingTemplatesWindow: React.FC<Props> = ({
  show = true, onClose, onFocus, windowState, setWindowState, onUpdateState,
}) => {
  const { hasPermission, activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const can = {
    create: hasPermission('financials.posting_template.create'),
    update: hasPermission('financials.posting_template.update'),
    remove: hasPermission('financials.posting_template.delete'),
  };
  const crud = useCrudResource<PostingTemplate, PostingTemplatePayload>(
    'posting-templates', postingTemplatesApi, { label: (t) => t.code },
  );

  const [form, setForm] = useState(emptyForm);
  const [lines, setLines] = useState<DraftLine[]>([blankLine(), blankLine()]);

  const [note, setNote] = useState('');
  const [previewAmount, setPreviewAmount] = useState('');
  const [preview, setPreview] = useState<AppliedPostingTemplate | null>(null);
  const [previewError, setPreviewError] = useState('');

  // Same picker as Journal Entry: Title accounts can never be posted to.
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts-postable', activeCompanyId],
    queryFn: () => accountsApi.getAll({ take: 2000, isActive: true, isTitle: false }),
    enabled: !!activeCompanyId && show,
  });

  useEffect(() => {
    if (crud.mode === 'new') {
      setForm(emptyForm);
      setLines([blankLine(), blankLine()]);
    } else if (crud.mode === 'edit' && crud.selected) {
      const t = crud.selected;
      setForm({ code: t.code, description: t.description, isActive: t.isActive });
      setLines(t.lines.map((l) => ({
        key: Math.random().toString(36).slice(2),
        accountId: l.accountId,
        description: l.description ?? '',
        debitPct: l.side === 'debit' ? String(Number(l.percentage)) : '',
        creditPct: l.side === 'credit' ? String(Number(l.percentage)) : '',
      })));
    }
  }, [crud.mode, crud.selected]);

  // A preview belongs to the template it was run against.
  useEffect(() => { setPreview(null); setPreviewError(''); }, [crud.selected?.id]);
  useEffect(() => { if (crud.mode !== 'view') setNote(''); }, [crud.mode]);

  const totals = useMemo(() => {
    const debit = lines.reduce((s, l) => s + num(l.debitPct), 0);
    const credit = lines.reduce((s, l) => s + num(l.creditPct), 0);
    return { debit, credit, debitOk: Math.abs(debit - 100) < 0.0001, creditOk: Math.abs(credit - 100) < 0.0001 };
  }, [lines]);

  const setLine = (key: string, patch: Partial<DraftLine>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const handleSave = () => {
    if (!form.code.trim() || !form.description.trim()) {
      crud.setError('A posting template needs a code and a description.');
      return;
    }
    const filled = lines.filter((l) => l.accountId || num(l.debitPct) || num(l.creditPct));
    for (const [i, l] of filled.entries()) {
      if (!l.accountId) { crud.setError(`Line ${i + 1}: choose a G/L account.`); return; }
      if (num(l.debitPct) > 0 && num(l.creditPct) > 0) {
        crud.setError(`Line ${i + 1}: enter either a debit % or a credit %, not both.`); return;
      }
      if (!(num(l.debitPct) > 0) && !(num(l.creditPct) > 0)) {
        crud.setError(`Line ${i + 1}: enter a debit % or a credit % above 0.`); return;
      }
    }
    if (!totals.debitOk || !totals.creditOk) {
      crud.setError(`Debit % must total 100 (now ${pct(totals.debit)}) and credit % must total 100 (now ${pct(totals.credit)}).`);
      return;
    }
    crud.save({
      code: form.code.trim(),
      description: form.description.trim(),
      isActive: form.isActive,
      lines: filled.map((l, i) => {
        const debit = num(l.debitPct) > 0;
        return {
          accountId: l.accountId,
          description: l.description.trim() || undefined,
          percentage: debit ? num(l.debitPct) : num(l.creditPct),
          side: debit ? 'debit' : 'credit',
          ordering: i,
        };
      }),
    });
  };

  // Deactivating is how a used template is retired — the backend refuses to
  // delete one that journal entries point at. Only the flag is sent, so the
  // lines are left untouched.
  const toggleActive = (t: PostingTemplate) => {
    setNote('');
    postingTemplatesApi.update(t.id, { isActive: !t.isActive })
      .then((row) => {
        void qc.invalidateQueries({ queryKey: ['posting-templates'] });
        crud.select(row);
        setNote(`${row.code} ${row.isActive ? 'activated' : 'deactivated'}.`);
      })
      .catch((e) => crud.setError(e instanceof Error ? e.message : 'Could not change the template.'));
  };

  const runPreview = () => {
    if (!crud.selected) return;
    const amount = num(previewAmount);
    if (!(amount > 0)) { setPreviewError('Enter an amount above 0.'); return; }
    setPreviewError('');
    postingTemplatesApi.apply(crud.selected.id, amount)
      .then(setPreview)
      .catch((e) => { setPreview(null); setPreviewError(e instanceof Error ? e.message : 'Could not apply the template.'); });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const selected = crud.selected;

  return (
    <ClassicWindow
      title="Posting Templates"
      icon={<FileStack className="w-3.5 h-3.5 text-gray-600" />}
      accent="#e8a01c"
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={900}
      minHeight={520}
      toolbar={
        <>
          <CrudToolbar
            onNew={can.create ? crud.openNew : () => crud.setError('You do not have permission to add posting templates (financials.posting_template.create).')}
            onEdit={() => selected && crud.openEdit(selected)}
            onDelete={() => crud.remove()}
            onRefresh={crud.refetch}
            canEdit={!!selected && can.update}
            canDelete={!!selected && can.remove}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <StatusNote error={crud.error} status={crud.status || note} />
        </>
      }
      footer={<><span>{crud.rows.length} template{crud.rows.length === 1 ? '' : 's'}</span><span>Posting Templates</span></>}
    >
      <div className="flex flex-1 min-h-0">
        {/* Template list */}
        <div className="w-[240px] shrink-0 border-r border-[#d4d0c8] bg-white overflow-auto custom-scrollbar">
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && crud.rows.length === 0}
            emptyText="No posting templates yet. Click New."
          />
          {crud.rows.map((t) => (
            <div
              key={t.id}
              onClick={() => crud.select(t)}
              onDoubleClick={() => can.update && crud.openEdit(t)}
              className={cn(
                'px-2 py-1.5 border-b border-[#f0f0f0] cursor-default',
                selected?.id === t.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/60',
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[10.5px] font-medium">{t.code}</span>
                {!t.isActive && <span className="text-[8.5px] px-1 rounded-[1px] bg-gray-100 text-gray-500">INACTIVE</span>}
              </div>
              <div className="text-[9.5px] text-gray-600 truncate">{t.description}</div>
              <div className="text-[9.5px] text-gray-400">{t.lines.length} line{t.lines.length === 1 ? '' : 's'}</div>
            </div>
          ))}
        </div>

        {/* Viewer / editor */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#f0f0f0]">
          {!isForm && !selected && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400">
              Select a template, or click New to create one.
            </div>
          )}

          {!isForm && selected && (
            <div className="flex-1 overflow-auto p-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[13px] font-bold font-mono">{selected.code}</span>
                <span className="text-[11px]">{selected.description}</span>
                <span className={cn('text-[9px] px-1.5 py-0.5 rounded-[1px]', selected.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>
                  {selected.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <table className="w-full border-collapse text-[10.5px] bg-white border border-[#ccc]">
                <thead>
                  <tr className="bg-[#e4e4e4] border-b border-[#ccc]">
                    <th className="text-left p-1 border-r border-[#ccc]">G/L Account</th>
                    <th className="text-left p-1 border-r border-[#ccc]">Details</th>
                    <th className="text-right p-1 border-r border-[#ccc] w-[90px]">Debit %</th>
                    <th className="text-right p-1 w-[90px]">Credit %</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.lines.map((l, i) => (
                    <tr key={l.id ?? i} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
                      <td className="p-1 border-r border-[#eee] font-mono">{l.account ? `${l.account.code} ${l.account.name}` : '—'}</td>
                      <td className="p-1 border-r border-[#eee]">{l.description ?? ''}</td>
                      <td className="p-1 border-r border-[#eee] text-right font-mono">{l.side === 'debit' ? pct(Number(l.percentage)) : ''}</td>
                      <td className="p-1 text-right font-mono">{l.side === 'credit' ? pct(Number(l.percentage)) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex gap-2 mt-3">
                {can.update && <YellowBtn onClick={() => crud.openEdit(selected)}>Edit</YellowBtn>}
                {can.update && (
                  <GreyBtn onClick={() => toggleActive(selected)} disabled={crud.isBusy}>
                    {selected.isActive ? 'Deactivate' : 'Activate'}
                  </GreyBtn>
                )}
              </div>

              {/* Try the split before using the template in a journal entry. */}
              <div className="mt-4 border-t border-[#ccc] pt-2">
                <div className="text-[11px] font-bold text-[#333] mb-1">Preview split</div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span>Amount</span>
                  <ClassicInput
                    type="number" step="0.01" min="0"
                    value={previewAmount}
                    onChange={(e) => setPreviewAmount(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') runPreview(); }}
                    className="w-32 text-right font-mono"
                  />
                  <ToolBtn onClick={runPreview} disabled={!selected.isActive}>Preview</ToolBtn>
                  {!selected.isActive && <span className="text-[10px] text-gray-500">Activate the template to use it.</span>}
                  {previewError && <span className="text-[10px] text-red-700">{previewError}</span>}
                </div>
                {preview && (
                  <table className="w-full border-collapse text-[10.5px] bg-white border border-[#ccc] mt-2">
                    <thead>
                      <tr className="bg-[#e4e4e4] border-b border-[#ccc]">
                        <th className="text-left p-1 border-r border-[#ccc]">G/L Account</th>
                        <th className="text-right p-1 border-r border-[#ccc] w-[110px]">Debit</th>
                        <th className="text-right p-1 w-[110px]">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.lines.map((l, i) => (
                        <tr key={i} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
                          <td className="p-1 border-r border-[#eee] font-mono">{l.account ? `${l.account.code} ${l.account.name}` : l.accountId}</td>
                          <td className="p-1 border-r border-[#eee] text-right font-mono">{Number(l.debit) ? money(Number(l.debit)) : ''}</td>
                          <td className="p-1 text-right font-mono">{Number(l.credit) ? money(Number(l.credit)) : ''}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#f0f0f0] font-bold border-t border-[#ccc]">
                        <td className="p-1">Totals</td>
                        <td className="p-1 text-right font-mono">{money(Number(preview.amount))}</td>
                        <td className="p-1 text-right font-mono">{money(Number(preview.amount))}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {isForm && (
            <>
              <div className="p-2 shrink-0 border-b border-[#ccc] bg-white">
                <div className="text-[11px] font-bold text-[#333] mb-1">
                  {crud.mode === 'new' ? 'New Posting Template' : `Edit — ${selected?.code}`}
                </div>
                <div className="grid grid-cols-[1fr_2fr] gap-x-4">
                  <FieldRow label="Template Code" labelWidth="100px" required>
                    <ClassicInput value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="w-full bg-[#ffed99]" autoFocus />
                  </FieldRow>
                  <FieldRow label="Description" labelWidth="80px" required>
                    <ClassicInput value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full" />
                  </FieldRow>
                </div>
                <FieldRow label="Active" labelWidth="100px">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                </FieldRow>
              </div>

              <div className="flex-1 overflow-auto bg-white min-h-0">
                <table className="w-full border-collapse text-[10.5px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#e4e4e4] border-b border-[#ccc]">
                      <th className="w-7 p-1 border-r border-[#ccc]">#</th>
                      <th className="text-left p-1 border-r border-[#ccc] w-[260px]">G/L Account</th>
                      <th className="text-left p-1 border-r border-[#ccc]">Details</th>
                      <th className="text-right p-1 border-r border-[#ccc] w-[90px]">Debit %</th>
                      <th className="text-right p-1 border-r border-[#ccc] w-[90px]">Credit %</th>
                      <th className="w-7 p-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => (
                      <tr key={l.key} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
                        <td className="text-center text-gray-400 border-r border-[#eee]">{i + 1}</td>
                        <td className="border-r border-[#eee] p-0.5">
                          <ClassicSel value={l.accountId} onChange={(e) => setLine(l.key, { accountId: e.target.value })} className="w-full">
                            <option value="">— select account —</option>
                            {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                          </ClassicSel>
                        </td>
                        <td className="border-r border-[#eee] p-0.5">
                          <ClassicInput value={l.description} onChange={(e) => setLine(l.key, { description: e.target.value })} className="w-full" />
                        </td>
                        <td className="border-r border-[#eee] p-0.5">
                          <ClassicInput
                            type="number" step="0.0001" min="0" max="100"
                            value={l.debitPct}
                            // A line is a debit or a credit; typing one side clears the other.
                            onChange={(e) => setLine(l.key, { debitPct: e.target.value, creditPct: '' })}
                            className="w-full text-right font-mono"
                          />
                        </td>
                        <td className="border-r border-[#eee] p-0.5">
                          <ClassicInput
                            type="number" step="0.0001" min="0" max="100"
                            value={l.creditPct}
                            onChange={(e) => setLine(l.key, { creditPct: e.target.value, debitPct: '' })}
                            className="w-full text-right font-mono"
                          />
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => setLines((p) => p.filter((x) => x.key !== l.key))}
                            disabled={lines.length <= 2}
                            className="text-gray-400 hover:text-red-600 disabled:opacity-30"
                            title={lines.length <= 2 ? 'A template needs at least a debit and a credit line' : 'Remove line'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="sticky bottom-0">
                    <tr className="bg-[#f0f0f0] border-t border-[#ccc] font-bold">
                      <td colSpan={3} className="p-1 text-right">Totals</td>
                      <td className={cn('p-1 text-right font-mono', !totals.debitOk && 'text-red-700')}>{pct(totals.debit)}</td>
                      <td className={cn('p-1 text-right font-mono', !totals.creditOk && 'text-red-700')}>{pct(totals.credit)}</td>
                      <td />
                    </tr>
                    <tr className={cn('border-t', totals.debitOk && totals.creditOk ? 'bg-green-50' : 'bg-red-50')}>
                      <td colSpan={6} className="p-1 text-center text-[10px]">
                        {totals.debitOk && totals.creditOk
                          ? <span className="text-green-800">Debit and credit each total 100%</span>
                          : <span className="text-red-700">Debit % and credit % must each total 100%</span>}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <div className="p-2">
                  <ToolBtn onClick={() => setLines((p) => [...p, blankLine()])}>
                    <Plus className="w-3 h-3" /> Add line
                  </ToolBtn>
                </div>
              </div>

              <div className="h-10 px-3 bg-[#f0f0f0] border-t border-[#ccc] flex items-center gap-2 shrink-0">
                <YellowBtn onClick={handleSave} disabled={crud.isBusy}>
                  {crud.isBusy ? 'Saving…' : crud.mode === 'new' ? 'Add' : 'Update'}
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
