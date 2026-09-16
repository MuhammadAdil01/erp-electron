import React, { useEffect, useState } from 'react';
import { Percent as PercentIcon, Plus, Trash2 } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import {
  taxFormulasApi,
  employeeCategoriesApi,
  type TaxFormula,
  type TaxFormulaPayload,
  type TaxSlab,
  type EmployeeCategory,
} from '../../../api/payroll-masters.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');
const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  code: '',
  employeeCategoryId: '',
  periodYear: '',
  fromDate: '',
  toDate: '',
  startYear: '',
  noOfMonths: '',
  documentDate: today(),
  remarks: '',
  isActive: true,
};

export const TaxFormulaCalculationWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [slabs, setSlabs] = useState<TaxSlab[]>([]);
  const [categories, setCategories] = useState<EmployeeCategory[]>([]);
  const [savingSlabs, setSavingSlabs] = useState(false);

  const crud = useCrudResource<TaxFormula, TaxFormulaPayload>(
    'tax-formulas',
    taxFormulasApi,
    { label: (t) => t.code },
  );

  useEffect(() => {
    if (show) {
      employeeCategoriesApi.getAll({ isActive: true }).then(setCategories).catch(() => setCategories([]));
    }
  }, [show]);

  useEffect(() => {
    if (crud.mode === 'new') {
      setForm(emptyForm);
      setSlabs([]);
    } else if (crud.mode === 'edit' && crud.selected) {
      const s = crud.selected;
      setForm({
        code: s.code,
        employeeCategoryId: s.employeeCategoryId ?? '',
        periodYear: s.periodYear != null ? String(s.periodYear) : '',
        fromDate: toDateInput(s.fromDate),
        toDate: toDateInput(s.toDate),
        startYear: s.startYear != null ? String(s.startYear) : '',
        noOfMonths: s.noOfMonths != null ? String(s.noOfMonths) : '',
        documentDate: toDateInput(s.documentDate) || today(),
        remarks: s.remarks ?? '',
        isActive: s.isActive,
      });
      setSlabs(s.slabs ?? []);
    }
  }, [crud.mode, crud.selected]);

  const addSlabRow = () => setSlabs((r) => [...r, { lowerAmount: 0, higherAmount: undefined, percentage: 0 }]);
  const removeSlabRow = (idx: number) => setSlabs((r) => r.filter((_, i) => i !== idx));
  const updateSlab = (idx: number, key: keyof TaxSlab, value: string) => {
    setSlabs((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value === '' ? undefined : Number(value) } : row)));
  };

  const saveSlabsFor = async (formulaId: string) => {
    setSavingSlabs(true);
    try {
      const payload = slabs.map((s) => ({
        lowerAmount: Number(s.lowerAmount),
        higherAmount: s.higherAmount === undefined || s.higherAmount === null || s.higherAmount === ('' as any)
          ? undefined : Number(s.higherAmount),
        percentage: Number(s.percentage),
      }));
      const saved = await taxFormulasApi.replaceSlabs(formulaId, payload);
      setSlabs(saved);
    } catch (e) {
      crud.setError(e instanceof Error ? e.message : 'Failed to save slabs.');
    } finally {
      setSavingSlabs(false);
    }
  };

  const handleSave = () => {
    if (!form.code.trim()) {
      crud.setError('Code is required.');
      return;
    }
    crud.save({
      code: form.code.trim(),
      employeeCategoryId: form.employeeCategoryId || undefined,
      periodYear: form.periodYear === '' ? undefined : Number(form.periodYear),
      fromDate: form.fromDate || undefined,
      toDate: form.toDate || undefined,
      startYear: form.startYear === '' ? undefined : Number(form.startYear),
      noOfMonths: form.noOfMonths === '' ? undefined : Number(form.noOfMonths),
      documentDate: form.documentDate || undefined,
      remarks: form.remarks.trim() || undefined,
      isActive: form.isActive,
    });
  };

  // Once a brand-new formula is created (crud.mode flips back to 'view' with
  // the new row selected), flush the pending slab edits against its real id.
  // Always flush on this transition — including down to zero rows — so
  // deliberately clearing every slab during an edit actually persists.
  const prevModeRef = React.useRef(crud.mode);
  useEffect(() => {
    if (prevModeRef.current !== 'view' && crud.mode === 'view' && crud.selected) {
      void saveSlabsFor(crud.selected.id);
    }
    prevModeRef.current = crud.mode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crud.mode, crud.selected]);

  const isForm = crud.mode === 'new' || crud.mode === 'edit';

  return (
    <ClassicWindow
      title="Tax Formula Calculation"
      icon={<PercentIcon className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={880}
      minHeight={560}
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
            isBusy={crud.isBusy || savingSlabs}
          />
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={
        <>
          <span>{crud.rows.length} formula{crud.rows.length === 1 ? '' : 's'}</span>
          <span>Tax Formula Calculation</span>
        </>
      }
    >
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0 flex flex-col">
          <table className="w-full border-collapse text-[10.5px] shrink-0">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Code</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Category</th>
                <th className="text-right py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Period Year</th>
                <th className="text-left py-1 px-2 font-bold text-[#444]">Status</th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((t, i) => (
                <tr
                  key={t.id}
                  onClick={() => crud.select(t)}
                  onDoubleClick={() => crud.openEdit(t)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === t.id
                      ? 'bg-[#ffed99]'
                      : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{t.code}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{t.employeeCategory?.name ?? '—'}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] text-right">{t.periodYear ?? '—'}</td>
                  <td className="py-1 px-2">
                    {t.isActive
                      ? <span className="text-green-700">Active</span>
                      : <span className="text-gray-400">Inactive</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && crud.rows.length === 0}
            emptyText="No tax formulas yet. Click New to add one."
          />

          {crud.selected && !isForm && (
            <div className="p-2 flex-1 flex flex-col min-h-0">
              <div className="text-[10.5px] font-bold text-[#333] mb-1">Slabs — {crud.selected.code}</div>
              <div className="flex-1 border border-[#d4d0c8] overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#f0f0f0]">
                    <tr className="border-b border-[#d4d0c8]">
                      <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1 py-1">#</th>
                      <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1 py-1">Lower Amount</th>
                      <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1 py-1">Higher Amount</th>
                      <th className="text-[10px] font-bold text-left px-1 py-1">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(crud.selected.slabs ?? []).map((s, i) => (
                      <tr key={s.id ?? i} className="border-b border-gray-200 h-6">
                        <td className="border-r border-gray-200 px-1 text-[10.5px]">{i + 1}</td>
                        <td className="border-r border-gray-200 px-1 text-[10.5px]">{Number(s.lowerAmount).toFixed(2)}</td>
                        <td className="border-r border-gray-200 px-1 text-[10.5px]">
                          {s.higherAmount != null ? Number(s.higherAmount).toFixed(2) : '—'}
                        </td>
                        <td className="px-1 text-[10.5px]">{Number(s.percentage).toFixed(2)}%</td>
                      </tr>
                    ))}
                    {!(crud.selected.slabs ?? []).length && (
                      <tr><td colSpan={4} className="text-center text-[10.5px] text-gray-400 py-2">No slabs. Click Edit to add.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="w-[340px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new'
              ? 'New Tax Formula'
              : crud.mode === 'edit'
                ? `Edit — ${crud.selected?.code}`
                : 'Details'}
          </div>

          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">
              Select a formula, or click New.
            </div>
          )}

          {!isForm && crud.selected && (
            <>
              <FieldRow label="Code">{crud.selected.code}</FieldRow>
              <FieldRow label="Category">{crud.selected.employeeCategory?.name ?? '—'}</FieldRow>
              <FieldRow label="Period Year">{crud.selected.periodYear ?? '—'}</FieldRow>
              <FieldRow label="From">{toDateInput(crud.selected.fromDate) || '—'}</FieldRow>
              <FieldRow label="To">{toDateInput(crud.selected.toDate) || '—'}</FieldRow>
              <FieldRow label="Start Year">{crud.selected.startYear ?? '—'}</FieldRow>
              <FieldRow label="No Of Months">{crud.selected.noOfMonths ?? '—'}</FieldRow>
              <FieldRow label="Doc Date">{toDateInput(crud.selected.documentDate)}</FieldRow>
              <div className="mt-3">
                <YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn>
              </div>
            </>
          )}

          {isForm && (
            <>
              <FieldRow label="Code" required>
                <ClassicInput
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full"
                  autoFocus
                  disabled={crud.mode === 'edit'}
                />
              </FieldRow>
              <FieldRow label="Employee Category">
                <ClassicSel
                  value={form.employeeCategoryId}
                  onChange={(e) => setForm((f) => ({ ...f, employeeCategoryId: e.target.value }))}
                  className="w-full"
                >
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Period Year">
                <ClassicInput
                  type="number"
                  value={form.periodYear}
                  onChange={(e) => setForm((f) => ({ ...f, periodYear: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="From Date">
                <ClassicInput
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="To Date">
                <ClassicInput
                  type="date"
                  value={form.toDate}
                  onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Start Year">
                <ClassicInput
                  type="number"
                  value={form.startYear}
                  onChange={(e) => setForm((f) => ({ ...f, startYear: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="No Of Months">
                <ClassicInput
                  type="number" min="0"
                  value={form.noOfMonths}
                  onChange={(e) => setForm((f) => ({ ...f, noOfMonths: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Document Date">
                <ClassicInput
                  type="date"
                  value={form.documentDate}
                  onChange={(e) => setForm((f) => ({ ...f, documentDate: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Active">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
              </FieldRow>

              <div className="mt-2 mb-1 flex items-center justify-between">
                <div className="text-[10.5px] font-bold text-[#333]">Slabs</div>
                <button onClick={addSlabRow} className="text-[10px] flex items-center gap-1 text-blue-700 hover:underline">
                  <Plus className="w-3 h-3" /> Add Row
                </button>
              </div>
              <div className="border border-[#d4d0c8] max-h-[180px] overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#f0f0f0] sticky top-0">
                    <tr className="border-b border-[#d4d0c8]">
                      <th className="border-r border-[#d4d0c8] text-[9.5px] font-bold text-left px-1">Lower</th>
                      <th className="border-r border-[#d4d0c8] text-[9.5px] font-bold text-left px-1">Higher</th>
                      <th className="border-r border-[#d4d0c8] text-[9.5px] font-bold text-left px-1">%</th>
                      <th className="w-5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {slabs.map((s, idx) => (
                      <tr key={idx} className="border-b border-gray-200 h-6">
                        <td className="border-r border-gray-200 px-1">
                          <input
                            type="number" step="0.01"
                            value={s.lowerAmount === undefined ? '' : String(s.lowerAmount)}
                            onChange={(e) => updateSlab(idx, 'lowerAmount', e.target.value)}
                            className="w-full h-[18px] text-[10px] outline-none border-none"
                          />
                        </td>
                        <td className="border-r border-gray-200 px-1">
                          <input
                            type="number" step="0.01"
                            value={s.higherAmount === undefined || s.higherAmount === null ? '' : String(s.higherAmount)}
                            onChange={(e) => updateSlab(idx, 'higherAmount', e.target.value)}
                            className="w-full h-[18px] text-[10px] outline-none border-none"
                          />
                        </td>
                        <td className="border-r border-gray-200 px-1">
                          <input
                            type="number" step="0.01"
                            value={s.percentage === undefined ? '' : String(s.percentage)}
                            onChange={(e) => updateSlab(idx, 'percentage', e.target.value)}
                            className="w-full h-[18px] text-[10px] outline-none border-none"
                          />
                        </td>
                        <td className="text-center">
                          <button onClick={() => removeSlabRow(idx)}>
                            <Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!slabs.length && (
                      <tr><td colSpan={4} className="text-center text-[10px] text-gray-400 py-2">No slab rows yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mb-1 mt-2">
                <div className="text-[10.5px] text-[#333] mb-1">Remarks</div>
                <textarea
                  value={form.remarks}
                  onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                  className="w-full h-12 border border-[#d4d0c8] p-1 text-[10.5px] outline-none focus:border-orange-400 bg-white resize-none"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <YellowBtn
                  onClick={handleSave}
                  disabled={crud.isBusy || savingSlabs}
                >
                  {crud.isBusy || savingSlabs ? 'Saving…' : 'Save'}
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
