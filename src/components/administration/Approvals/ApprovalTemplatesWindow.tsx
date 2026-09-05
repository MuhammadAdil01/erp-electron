import React, { useEffect, useState } from 'react';
import { ClipboardList, ArrowDown, ArrowUp } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  approvalsApi,
  numberingApi,
  type ApprovalTemplate,
  type CreateApprovalTemplatePayload,
} from '../../../api/administration.api';
import { usersApi } from '../../../api/users.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

const emptyForm = {
  name: '',
  description: '',
  isActive: true,
  documentTypes: [] as string[],
  validFrom: '',
  validTo: '',
  originatorIds: [] as string[],
  /** Ordered — the array position is the stage order, so it is not a set. */
  stageIds: [] as string[],
  minAmount: '',
  maxAmount: '',
};

export const ApprovalTemplatesWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const templatesQuery = useQuery({
    queryKey: ['approval-templates', companyId],
    queryFn: () => approvalsApi.listTemplates(),
    enabled: !!companyId,
  });

  const stagesQuery = useQuery({
    queryKey: ['approval-stages', companyId],
    queryFn: () => approvalsApi.listStages(),
    enabled: !!companyId,
  });

  const usersQuery = useQuery({
    queryKey: ['users', companyId],
    queryFn: () => usersApi.getAll(companyId ?? undefined),
    enabled: !!companyId,
  });

  const docTypesQuery = useQuery({
    queryKey: ['numbering-document-types', companyId],
    queryFn: () => numberingApi.documentTypes(),
    enabled: !!companyId,
  });

  const templates = templatesQuery.data ?? [];
  const stages = stagesQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const docTypes = docTypesQuery.data ?? [];
  const selected = templates.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && !templates.some((t) => t.id === selectedId)) setSelectedId(null);
  }, [templates, selectedId]);

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected that change.');
    setStatus('');
  };
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['approval-templates'] });

  const saveMut = useMutation({
    mutationFn: () => {
      const terms: Record<string, unknown> = {};
      if (form.minAmount.trim()) terms.minAmount = Number(form.minAmount);
      if (form.maxAmount.trim()) terms.maxAmount = Number(form.maxAmount);

      const payload: CreateApprovalTemplatePayload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        isActive: form.isActive,
        documentTypes: form.documentTypes,
        terms,
        validFrom: form.validFrom || undefined,
        validTo: form.validTo || undefined,
        originatorIds: form.originatorIds,
        stageIds: form.stageIds,
      };
      return mode === 'new'
        ? approvalsApi.createTemplate(payload)
        : approvalsApi.updateTemplate(selectedId as string, payload);
    },
    onSuccess: (row) => {
      invalidate();
      setSelectedId(row.id);
      setMode('view');
      setError('');
      setStatus(mode === 'new' ? `Template ${row.name} created.` : `Template ${row.name} saved.`);
    },
    onError: onErr,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => approvalsApi.removeTemplate(id),
    onSuccess: () => {
      invalidate();
      setSelectedId(null);
      setMode('view');
      setError('');
      setStatus('Template deleted.');
    },
    onError: onErr,
  });

  const isBusy = saveMut.isPending || deleteMut.isPending;

  const openNew = () => {
    setForm({ ...emptyForm });
    setMode('new');
    setError(''); setStatus('');
  };

  const openEdit = () => {
    if (!selected) return;
    const terms = (selected.terms ?? {}) as { minAmount?: number; maxAmount?: number };
    setForm({
      name: selected.name,
      description: selected.description ?? '',
      isActive: selected.isActive,
      documentTypes: selected.documentTypes ?? [],
      validFrom: selected.validFrom ? selected.validFrom.slice(0, 10) : '',
      validTo: selected.validTo ? selected.validTo.slice(0, 10) : '',
      originatorIds: selected.originators.map((o) => o.user.id),
      stageIds: [...selected.stages]
        .sort((a, b) => a.ordering - b.ordering)
        .map((s) => s.stageId),
      minAmount: terms.minAmount !== undefined ? String(terms.minAmount) : '',
      maxAmount: terms.maxAmount !== undefined ? String(terms.maxAmount) : '',
    });
    setMode('edit');
    setError(''); setStatus('');
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError('A template name is required.'); return; }
    if (!form.documentTypes.length) {
      setError('Pick at least one document type — a template that matches nothing never runs.');
      return;
    }
    if (!form.stageIds.length) {
      setError('Add at least one stage. A template with no stages would approve instantly.');
      return;
    }
    if (form.validFrom && form.validTo && form.validTo < form.validFrom) {
      setError('The valid-to date is before the valid-from date.');
      return;
    }
    const min = form.minAmount.trim();
    const max = form.maxAmount.trim();
    if (min && Number.isNaN(Number(min))) { setError('Minimum amount must be a number.'); return; }
    if (max && Number.isNaN(Number(max))) { setError('Maximum amount must be a number.'); return; }
    if (min && max && Number(max) < Number(min)) {
      setError('The maximum amount is below the minimum.');
      return;
    }
    setError('');
    saveMut.mutate();
  };

  const toggleDocType = (t: string) =>
    setForm((f) => ({
      ...f,
      documentTypes: f.documentTypes.includes(t)
        ? f.documentTypes.filter((x) => x !== t)
        : [...f.documentTypes, t],
    }));

  const toggleOriginator = (id: string) =>
    setForm((f) => ({
      ...f,
      originatorIds: f.originatorIds.includes(id)
        ? f.originatorIds.filter((x) => x !== id)
        : [...f.originatorIds, id],
    }));

  const addStage = (id: string) =>
    setForm((f) => (f.stageIds.includes(id) ? f : { ...f, stageIds: [...f.stageIds, id] }));

  const removeStage = (id: string) =>
    setForm((f) => ({ ...f, stageIds: f.stageIds.filter((x) => x !== id) }));

  /** Order is the approval sequence, so moving a stage is a real edit. */
  const moveStage = (index: number, delta: number) =>
    setForm((f) => {
      const next = [...f.stageIds];
      const target = index + delta;
      if (target < 0 || target >= next.length) return f;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...f, stageIds: next };
    });

  const stageName = (id: string) => stages.find((s) => s.id === id)?.name ?? id;

  return (
    <ClassicWindow
      title="Approval Templates — Setup"
      icon={<ClipboardList className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={960}
      minHeight={580}
      toolbar={
        <>
          <CrudToolbar
            onNew={openNew}
            onEdit={openEdit}
            onDelete={() => {
              if (!selected) return;
              if ((selected._count?.requests ?? 0) > 0) {
                setError(
                  `${selected.name} has ${selected._count?.requests} request(s) against it. ` +
                  'Deactivate it instead — deleting would orphan their history.',
                );
                return;
              }
              if (!window.confirm(`Delete approval template ${selected.name}?`)) return;
              deleteMut.mutate(selected.id);
            }}
            onRefresh={() => templatesQuery.refetch()}
            canEdit={!!selected}
            canDelete={!!selected}
            isFetching={templatesQuery.isFetching}
            isBusy={isBusy}
          />
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>{templates.length} template(s) · {stages.length} stage(s) available</span>
          <span>Approval Templates</span>
        </>
      }
    >
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="w-[300px] shrink-0 border-r border-[#d4d0c8] overflow-auto bg-white custom-scrollbar">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Template</th>
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Stages</th>
                <th className="px-2 py-1 font-bold text-[#444] text-right">Requests</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t: ApprovalTemplate) => (
                <tr
                  key={t.id}
                  onClick={() => { setSelectedId(t.id); setMode('view'); setError(''); setStatus(''); }}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    selectedId === t.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/50',
                    !t.isActive && 'text-gray-400 italic',
                  )}
                >
                  <td className="px-2 py-1 border-r border-[#f0f0f0]">{t.name}</td>
                  <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">{t.stages.length}</td>
                  <td className="px-2 py-1 text-right">{t._count?.requests ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder
            noCompany={!companyId}
            isLoading={templatesQuery.isLoading}
            isEmpty={!templatesQuery.isLoading && !templates.length}
            emptyText="No approval templates yet. Click New to route a document type through a stage."
          />
        </div>

        <div className="flex-1 min-w-0 overflow-auto bg-white p-3 custom-scrollbar">
          {mode === 'view' ? (
            !selected ? (
              <div className="text-[10.5px] text-gray-400">
                Pick a template to see what it routes and through which stages.
              </div>
            ) : (
              <div className="space-y-2 max-w-[680px]">
                <div className="text-[11px] font-bold">{selected.name}</div>
                <div className="text-[10px] text-gray-600">
                  {selected.description || 'No description.'}
                  {!selected.isActive && <span className="text-red-700"> · inactive</span>}
                </div>

                <div className="text-[10.5px]">
                  <b>Document types:</b> {selected.documentTypes.join(', ') || '—'}
                </div>
                <div className="text-[10.5px]">
                  <b>Valid:</b>{' '}
                  {selected.validFrom ? new Date(selected.validFrom).toLocaleDateString() : 'always'}
                  {' → '}
                  {selected.validTo ? new Date(selected.validTo).toLocaleDateString() : 'no end'}
                </div>
                <div className="text-[10.5px]">
                  <b>Originators:</b>{' '}
                  {selected.originators.length
                    ? selected.originators.map((o) => o.user.name).join(', ')
                    : 'everyone'}
                </div>

                <div>
                  <div className="text-[11px] font-bold mt-2 mb-1">Stages, in order</div>
                  <ol className="text-[10.5px] list-decimal pl-5">
                    {[...selected.stages].sort((a, b) => a.ordering - b.ordering).map((s) => (
                      <li key={s.id}>{s.stage.name}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )
          ) : (
            <div className="max-w-[820px] space-y-1">
              <div className="text-[11px] font-bold mb-1">
                {mode === 'new' ? 'New Approval Template' : `Edit — ${selected?.name}`}
              </div>

              <div className="grid grid-cols-2 gap-x-6">
                <FieldRow label="Name" labelWidth="120px" required>
                  <ClassicInput
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-[#fffbd0]"
                    autoFocus
                  />
                </FieldRow>
                <FieldRow label="Description" labelWidth="120px">
                  <ClassicInput
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full"
                  />
                </FieldRow>
                <FieldRow label="Valid From" labelWidth="120px">
                  <ClassicInput
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                    className="w-full"
                  />
                </FieldRow>
                <FieldRow label="Valid To" labelWidth="120px">
                  <ClassicInput
                    type="date"
                    value={form.validTo}
                    onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))}
                    className="w-full"
                  />
                </FieldRow>
                <FieldRow label="Min. Amount" labelWidth="120px">
                  <ClassicInput
                    inputMode="decimal"
                    value={form.minAmount}
                    onChange={(e) => setForm((f) => ({ ...f, minAmount: e.target.value }))}
                    className="w-full text-right font-mono"
                    placeholder="no lower bound"
                  />
                </FieldRow>
                <FieldRow label="Max. Amount" labelWidth="120px">
                  <ClassicInput
                    inputMode="decimal"
                    value={form.maxAmount}
                    onChange={(e) => setForm((f) => ({ ...f, maxAmount: e.target.value }))}
                    className="w-full text-right font-mono"
                    placeholder="no upper bound"
                  />
                </FieldRow>
              </div>

              <label className="flex items-center gap-2 text-[11px] cursor-pointer py-1">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Active
              </label>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <div className="text-[11px] font-bold mb-1">
                    Document Types ({form.documentTypes.length})
                  </div>
                  <div className="border border-[#d4d0c8] max-h-[200px] overflow-auto custom-scrollbar">
                    {docTypes.map((d) => (
                      <label
                        key={d.documentType}
                        className="flex items-center gap-2 text-[10.5px] px-2 py-0.5 border-b border-[#f0f0f0] cursor-pointer hover:bg-blue-50/50"
                      >
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5"
                          checked={form.documentTypes.includes(d.documentType)}
                          onChange={() => toggleDocType(d.documentType)}
                        />
                        <span className="truncate">{d.documentType}</span>
                      </label>
                    ))}
                    {!docTypes.length && (
                      <div className="p-2 text-[10px] text-gray-400">
                        No document types — define numbering series first.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold mb-1">
                    Originators ({form.originatorIds.length || 'everyone'})
                  </div>
                  <div className="border border-[#d4d0c8] max-h-[200px] overflow-auto custom-scrollbar">
                    {users.map((u) => (
                      <label
                        key={u.id}
                        className="flex items-center gap-2 text-[10.5px] px-2 py-0.5 border-b border-[#f0f0f0] cursor-pointer hover:bg-blue-50/50"
                      >
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5"
                          checked={form.originatorIds.includes(u.id)}
                          onChange={() => toggleOriginator(u.id)}
                        />
                        <span className="truncate">{u.name}</span>
                      </label>
                    ))}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">
                    Leave empty to apply to every originator.
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold mb-1">Stages, in order</div>
                  <div className="border border-[#d4d0c8] min-h-[120px] max-h-[200px] overflow-auto custom-scrollbar">
                    {form.stageIds.map((id, i) => (
                      <div
                        key={id}
                        className="flex items-center gap-1 text-[10.5px] px-2 py-0.5 border-b border-[#f0f0f0]"
                      >
                        <span className="w-4 text-gray-500">{i + 1}.</span>
                        <span className="flex-1 truncate">{stageName(id)}</span>
                        <button
                          className="opacity-60 hover:opacity-100 disabled:opacity-20"
                          disabled={i === 0}
                          onClick={() => moveStage(i, -1)}
                          title="Move earlier"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          className="opacity-60 hover:opacity-100 disabled:opacity-20"
                          disabled={i === form.stageIds.length - 1}
                          onClick={() => moveStage(i, 1)}
                          title="Move later"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          className="opacity-60 hover:opacity-100 hover:text-red-700"
                          onClick={() => removeStage(id)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {!form.stageIds.length && (
                      <div className="p-2 text-[10px] text-gray-400">
                        No stages yet — add one below.
                      </div>
                    )}
                  </div>
                  <select
                    className="w-full h-[18px] border border-gray-400 px-1 text-[11px] mt-1"
                    value=""
                    onChange={(e) => { if (e.target.value) addStage(e.target.value); }}
                  >
                    <option value="">+ add a stage…</option>
                    {stages
                      .filter((s) => !form.stageIds.includes(s.id))
                      .map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <YellowBtn onClick={handleSave} disabled={isBusy}>
                  {saveMut.isPending ? 'Saving…' : mode === 'new' ? 'Add' : 'Update'}
                </YellowBtn>
                <GreyBtn onClick={() => { setMode('view'); setError(''); }}>Cancel</GreyBtn>
                <span className="text-[9.5px] text-gray-500 ml-1">
                  Stages run top to bottom; a request only reaches the next one once the current
                  stage has its required approvals.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
