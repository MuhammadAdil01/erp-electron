import React, { useEffect, useState } from 'react';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import {
  leaveTypesApi,
  leaveDateRangesApi,
  type LeaveType,
  type LeaveTypePayload,
  type LeaveTypeDateRange,
} from '../../../api/hr.api';
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
const numStr = (v: string | number | null | undefined) => (v === null || v === undefined ? '' : String(v));

const emptyForm = {
  code: '',
  name: '',
  description: '',
  totalLeavesInYear: '',
  totalLeavesInYearForTrainer: '',
  leaveCategory: 'Others',
  applicableDuringProbation: false,
  encashable: false,
  minBalanceForEncash: '',
  maxLeaveToEncash: '',
  payableLeave: false,
  // Drives the payroll LOP deduction. Defaults to paid, so a newly created
  // leave type never silently starts docking salaries.
  paid: true,
  maxMonthlyApplications: '',
  minContinuousDays: '',
  maxContinuousDays: '',
  minContinuousDurationProb: '',
  maxContinuousDurationProb: '',
  effectiveFrom: '',
  carryForwardToNextYear: false,
  maxLeaveCarryForward: '',
  isClosed: false,
  remarks: '',
  isActive: true,
};

export const LeaveMasterWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [ranges, setRanges] = useState<LeaveTypeDateRange[]>([]);
  const [savingRanges, setSavingRanges] = useState(false);

  const crud = useCrudResource<LeaveType, LeaveTypePayload>(
    'leave-types',
    leaveTypesApi,
    { label: (l) => l.name },
  );

  useEffect(() => {
    if (crud.mode === 'new') {
      setForm(emptyForm);
      setRanges([]);
    } else if (crud.mode === 'edit' && crud.selected) {
      const s = crud.selected;
      setForm({
        code: s.code,
        name: s.name,
        description: s.description ?? '',
        totalLeavesInYear: numStr(s.totalLeavesInYear),
        totalLeavesInYearForTrainer: numStr(s.totalLeavesInYearForTrainer),
        leaveCategory: s.leaveCategory ?? 'Others',
        applicableDuringProbation: s.applicableDuringProbation,
        encashable: s.encashable,
        minBalanceForEncash: numStr(s.minBalanceForEncash),
        maxLeaveToEncash: numStr(s.maxLeaveToEncash),
        payableLeave: s.payableLeave,
        paid: s.paid ?? true,
        maxMonthlyApplications: numStr(s.maxMonthlyApplications),
        minContinuousDays: numStr(s.minContinuousDays),
        maxContinuousDays: numStr(s.maxContinuousDays),
        minContinuousDurationProb: numStr(s.minContinuousDurationProb),
        maxContinuousDurationProb: numStr(s.maxContinuousDurationProb),
        effectiveFrom: toDateInput(s.effectiveFrom),
        carryForwardToNextYear: s.carryForwardToNextYear,
        maxLeaveCarryForward: numStr(s.maxLeaveCarryForward),
        isClosed: s.isClosed,
        remarks: s.remarks ?? '',
        isActive: s.isActive,
      });
      setRanges(s.dateRanges ?? []);
    }
  }, [crud.mode, crud.selected]);

  const num = (v: string) => (v === '' ? undefined : Number(v));

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) {
      crud.setError('Leave Code and Name are required.');
      return;
    }
    crud.save({
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      totalLeavesInYear: num(form.totalLeavesInYear),
      totalLeavesInYearForTrainer: num(form.totalLeavesInYearForTrainer),
      leaveCategory: form.leaveCategory,
      applicableDuringProbation: form.applicableDuringProbation,
      encashable: form.encashable,
      minBalanceForEncash: num(form.minBalanceForEncash),
      maxLeaveToEncash: num(form.maxLeaveToEncash),
      payableLeave: form.payableLeave,
      paid: form.paid,
      maxMonthlyApplications: num(form.maxMonthlyApplications),
      minContinuousDays: num(form.minContinuousDays),
      maxContinuousDays: num(form.maxContinuousDays),
      minContinuousDurationProb: num(form.minContinuousDurationProb),
      maxContinuousDurationProb: num(form.maxContinuousDurationProb),
      effectiveFrom: form.effectiveFrom || undefined,
      carryForwardToNextYear: form.carryForwardToNextYear,
      maxLeaveCarryForward: num(form.maxLeaveCarryForward),
      isClosed: form.isClosed,
      remarks: form.remarks.trim() || undefined,
      isActive: form.isActive,
    });
  };

  // After a create/update transitions mode back to 'view' with the row
  // selected, flush the date-range table against its real id. This runs even
  // when ranges is empty, so deliberately clearing every row during an edit
  // actually persists instead of silently leaving the old rows in place.
  const prevModeRef = React.useRef(crud.mode);
  useEffect(() => {
    if (prevModeRef.current !== 'view' && crud.mode === 'view' && crud.selected) {
      setSavingRanges(true);
      leaveDateRangesApi.replace(crud.selected.id, ranges)
        .then(setRanges)
        .catch((e) => crud.setError(e instanceof Error ? e.message : 'Failed to save date ranges.'))
        .finally(() => setSavingRanges(false));
    }
    prevModeRef.current = crud.mode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crud.mode, crud.selected]);

  const addRange = () => setRanges((r) => [...r, { fromDate: '', toDate: '', isLocked: false }]);
  const removeRange = (idx: number) => setRanges((r) => r.filter((_, i) => i !== idx));
  const updateRange = (idx: number, patch: Partial<LeaveTypeDateRange>) =>
    setRanges((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const cb = "text-[10.5px] flex items-center gap-1";

  return (
    <ClassicWindow
      title="Leave Master"
      icon={<CalendarDays className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={920}
      minHeight={620}
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
            isBusy={crud.isBusy || savingRanges}
          />
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={
        <>
          <span>{crud.rows.length} leave type{crud.rows.length === 1 ? '' : 's'}</span>
          <span>Leave Master</span>
        </>
      }
    >
      <div className="flex flex-1 min-h-0">
        <div className="w-[260px] shrink-0 bg-white overflow-auto custom-scrollbar border-r border-[#d4d0c8]">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Code</th>
                <th className="text-left py-1 px-2 font-bold text-[#444]">Name</th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((l, i) => (
                <tr
                  key={l.id}
                  onClick={() => crud.select(l)}
                  onDoubleClick={() => crud.openEdit(l)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === l.id
                      ? 'bg-[#ffed99]'
                      : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{l.code}</td>
                  <td className="py-1 px-2 truncate">{l.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && crud.rows.length === 0}
            emptyText="No leave types yet. Click New to add one."
          />
        </div>

        <div className="flex-1 bg-white p-3 overflow-auto custom-scrollbar">
          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select a leave type, or click New.</div>
          )}

          {!isForm && crud.selected && (
            <div className="text-[10.5px] text-[#333] space-y-1">
              <div className="font-bold text-[11px] mb-2">{crud.selected.code} — {crud.selected.name}</div>
              <FieldRow label="Total Leaves/Yr" labelWidth="180px">{numStr(crud.selected.totalLeavesInYear) || '—'}</FieldRow>
              <FieldRow label="Leave Category" labelWidth="180px">{crud.selected.leaveCategory}</FieldRow>
              <FieldRow label="Probation Applicable" labelWidth="180px">{crud.selected.applicableDuringProbation ? 'Yes' : 'No'}</FieldRow>
              <FieldRow label="Encashable" labelWidth="180px">{crud.selected.encashable ? 'Yes' : 'No'}</FieldRow>
              <FieldRow label="Payable" labelWidth="180px">{crud.selected.payableLeave ? 'Yes' : 'No'}</FieldRow>
              <FieldRow label="Salary Treatment" labelWidth="180px">
                {crud.selected.paid === false ? 'Unpaid — deducted' : 'Paid in full'}
              </FieldRow>
              <FieldRow label="Carry Forward" labelWidth="180px">{crud.selected.carryForwardToNextYear ? 'Yes' : 'No'}</FieldRow>
              <FieldRow label="Closed" labelWidth="180px">{crud.selected.isClosed ? 'Yes' : 'No'}</FieldRow>
              <FieldRow label="Date Ranges" labelWidth="180px">{(crud.selected.dateRanges ?? []).length}</FieldRow>
              {crud.selected.remarks && <div className="mt-2 text-[10px] text-gray-600 whitespace-pre-wrap">{crud.selected.remarks}</div>}
              <div className="mt-3">
                <YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn>
              </div>
            </div>
          )}

          {isForm && (
            <>
              <div className="flex gap-8 mb-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <FieldRow label="Leave Code" required labelWidth="180px">
                    <ClassicInput value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="w-full" autoFocus />
                  </FieldRow>
                  <FieldRow label="Name" required labelWidth="180px">
                    <ClassicInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Description" labelWidth="180px">
                    <ClassicInput value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Total Leaves in Year" labelWidth="180px">
                    <ClassicInput type="number" step="0.5" value={form.totalLeavesInYear} onChange={(e) => setForm((f) => ({ ...f, totalLeavesInYear: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Total Leaves (Trainer)" labelWidth="180px">
                    <ClassicInput type="number" step="0.5" value={form.totalLeavesInYearForTrainer} onChange={(e) => setForm((f) => ({ ...f, totalLeavesInYearForTrainer: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Leave Type" labelWidth="180px">
                    <ClassicSel value={form.leaveCategory} onChange={(e) => setForm((f) => ({ ...f, leaveCategory: e.target.value }))} className="w-full">
                      <option value="Others">Others</option>
                      <option value="Annual">Annual</option>
                      <option value="Sick">Sick</option>
                      <option value="Casual">Casual</option>
                      <option value="Maternity">Maternity</option>
                      <option value="Paternity">Paternity</option>
                    </ClassicSel>
                  </FieldRow>
                  <label className={cb}><input type="checkbox" checked={form.applicableDuringProbation} onChange={(e) => setForm((f) => ({ ...f, applicableDuringProbation: e.target.checked }))} /> Applicable During Probation</label>
                  <label className={cb}><input type="checkbox" checked={form.encashable} onChange={(e) => setForm((f) => ({ ...f, encashable: e.target.checked }))} /> Encashable</label>
                  <FieldRow label="Min Balance for Encash" labelWidth="180px">
                    <ClassicInput type="number" step="0.5" value={form.minBalanceForEncash} onChange={(e) => setForm((f) => ({ ...f, minBalanceForEncash: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Max Leave to Encash" labelWidth="180px">
                    <ClassicInput type="number" step="0.5" value={form.maxLeaveToEncash} onChange={(e) => setForm((f) => ({ ...f, maxLeaveToEncash: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <label className={cb}><input type="checkbox" checked={form.payableLeave} onChange={(e) => setForm((f) => ({ ...f, payableLeave: e.target.checked }))} /> Payable Leave</label>
                  <label className={cb}>
                    <input
                      type="checkbox"
                      checked={!form.paid}
                      onChange={(e) => setForm((f) => ({ ...f, paid: !e.target.checked }))}
                    />{' '}
                    Unpaid — deduct from salary
                  </label>
                  <div className="text-[9.5px] text-gray-500 italic pl-4 -mt-1">
                    {form.paid
                      ? 'Approved leave of this type is paid in full.'
                      : 'Each approved day is docked at gross ÷ working days in Payroll Process.'}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <FieldRow label="Max Monthly Appli." labelWidth="180px">
                    <ClassicInput type="number" step="0.5" value={form.maxMonthlyApplications} onChange={(e) => setForm((f) => ({ ...f, maxMonthlyApplications: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Min Continuous" labelWidth="180px">
                    <ClassicInput type="number" step="0.5" value={form.minContinuousDays} onChange={(e) => setForm((f) => ({ ...f, minContinuousDays: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Max Continuous" labelWidth="180px">
                    <ClassicInput type="number" step="0.5" value={form.maxContinuousDays} onChange={(e) => setForm((f) => ({ ...f, maxContinuousDays: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Min Conti. Dur. Prob." labelWidth="180px">
                    <ClassicInput type="number" step="0.5" value={form.minContinuousDurationProb} onChange={(e) => setForm((f) => ({ ...f, minContinuousDurationProb: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Max Conti. Dur. Prob." labelWidth="180px">
                    <ClassicInput type="number" step="0.5" value={form.maxContinuousDurationProb} onChange={(e) => setForm((f) => ({ ...f, maxContinuousDurationProb: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Effective From" labelWidth="180px">
                    <ClassicInput type="date" value={form.effectiveFrom} onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <label className={cb}><input type="checkbox" checked={form.carryForwardToNextYear} onChange={(e) => setForm((f) => ({ ...f, carryForwardToNextYear: e.target.checked }))} /> Carry Forward to Next Year</label>
                  <FieldRow label="Max Leave Carry Fwd." labelWidth="180px">
                    <ClassicInput type="number" step="0.5" value={form.maxLeaveCarryForward} onChange={(e) => setForm((f) => ({ ...f, maxLeaveCarryForward: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <label className={cb}><input type="checkbox" checked={form.isClosed} onChange={(e) => setForm((f) => ({ ...f, isClosed: e.target.checked }))} /> Close</label>
                  <label className={cb}><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active</label>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[10.5px] font-bold text-[#333]">Effective / Blackout Date Ranges</div>
                  <button onClick={addRange} className="text-[10px] flex items-center gap-1 text-blue-700 hover:underline">
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                </div>
                <div className="border border-[#d4d0c8] max-h-[140px] overflow-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-[#f0f0f0] sticky top-0">
                      <tr className="border-b border-[#d4d0c8]">
                        <th className="w-8 border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1">#</th>
                        <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1">From Date</th>
                        <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1">To Date</th>
                        <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1 w-16">Lock</th>
                        <th className="w-6"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranges.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-200 h-6">
                          <td className="border-r border-gray-200 px-1 text-[10.5px]">{idx + 1}</td>
                          <td className="border-r border-gray-200 px-1">
                            <input type="date" value={toDateInput(row.fromDate)} onChange={(e) => updateRange(idx, { fromDate: e.target.value })} className="w-full h-[18px] text-[10px] outline-none border-none" />
                          </td>
                          <td className="border-r border-gray-200 px-1">
                            <input type="date" value={toDateInput(row.toDate)} onChange={(e) => updateRange(idx, { toDate: e.target.value })} className="w-full h-[18px] text-[10px] outline-none border-none" />
                          </td>
                          <td className="border-r border-gray-200 px-1 text-center">
                            <input type="checkbox" checked={!!row.isLocked} onChange={(e) => updateRange(idx, { isLocked: e.target.checked })} />
                          </td>
                          <td className="text-center">
                            <button onClick={() => removeRange(idx)}><Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" /></button>
                          </td>
                        </tr>
                      ))}
                      {!ranges.length && (
                        <tr><td colSpan={5} className="text-center text-[10px] text-gray-400 py-2">No date ranges.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-[10.5px] text-[#333] mb-1">Remarks</div>
                <textarea value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} className="w-full h-16 border border-[#d4d0c8] p-1 text-[10.5px] outline-none focus:border-orange-400 bg-white resize-none" />
              </div>

              <div className="flex gap-2">
                <YellowBtn onClick={handleSave} disabled={crud.isBusy || savingRanges}>
                  {crud.isBusy || savingRanges ? 'Saving…' : 'Save'}
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
