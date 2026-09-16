import React, { useEffect, useState } from 'react';
import { CalendarRange } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { payPeriodsApi, type PayPeriod, type PayPeriodPayload } from '../../../api/payroll-masters.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { ClassicInput, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');

const emptyForm = {
  status: '',
  code: '',
  name: '',
  fromDate: '',
  toDate: '',
  payMonth: '',
  workingDays: '',
  saturdays: '',
  holidays: '',
  maxNormalOtHoursMonth: '0.00',
  maxWorkingHoursMonth: '0.00',
  remarks: '',
  isActive: true,
};

export const PayPeriodMasterWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [form, setForm] = useState(emptyForm);
  const crud = useCrudResource<PayPeriod, PayPeriodPayload>(
    'pay-periods',
    payPeriodsApi,
    { label: (p) => p.name },
  );

  useEffect(() => {
    if (crud.mode === 'new') setForm(emptyForm);
    else if (crud.mode === 'edit' && crud.selected) {
      const s = crud.selected;
      setForm({
        status: s.status ?? '',
        code: s.code,
        name: s.name,
        fromDate: toDateInput(s.fromDate),
        toDate: toDateInput(s.toDate),
        payMonth: s.payMonth ?? '',
        workingDays: s.workingDays != null ? String(s.workingDays) : '',
        saturdays: s.saturdays != null ? String(s.saturdays) : '',
        holidays: s.holidays != null ? String(s.holidays) : '',
        maxNormalOtHoursMonth: s.maxNormalOtHoursMonth != null ? String(s.maxNormalOtHoursMonth) : '0.00',
        maxWorkingHoursMonth: s.maxWorkingHoursMonth != null ? String(s.maxWorkingHoursMonth) : '0.00',
        remarks: s.remarks ?? '',
        isActive: s.isActive,
      });
    }
  }, [crud.mode, crud.selected]);

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) {
      crud.setError('Pay Period Code/Month and Name are required.');
      return;
    }
    if (!form.fromDate || !form.toDate) {
      crud.setError('From Date and To Date are required.');
      return;
    }
    if (new Date(form.toDate) < new Date(form.fromDate)) {
      crud.setError('To Date must be on or after From Date.');
      return;
    }
    crud.save({
      status: form.status.trim() || undefined,
      code: form.code.trim(),
      name: form.name.trim(),
      fromDate: form.fromDate,
      toDate: form.toDate,
      payMonth: form.payMonth.trim() || undefined,
      workingDays: form.workingDays === '' ? undefined : Number(form.workingDays),
      saturdays: form.saturdays === '' ? undefined : Number(form.saturdays),
      holidays: form.holidays === '' ? undefined : Number(form.holidays),
      maxNormalOtHoursMonth: form.maxNormalOtHoursMonth === '' ? undefined : Number(form.maxNormalOtHoursMonth),
      maxWorkingHoursMonth: form.maxWorkingHoursMonth === '' ? undefined : Number(form.maxWorkingHoursMonth),
      remarks: form.remarks.trim() || undefined,
      isActive: form.isActive,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';

  return (
    <ClassicWindow
      title="Pay Period"
      icon={<CalendarRange className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={780}
      minHeight={520}
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
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={
        <>
          <span>{crud.rows.length} pay period{crud.rows.length === 1 ? '' : 's'}</span>
          <span>Pay Period Master</span>
        </>
      }
    >
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Code</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Name</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">From</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">To</th>
                <th className="text-left py-1 px-2 font-bold text-[#444]">Status</th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((p, i) => (
                <tr
                  key={p.id}
                  onClick={() => crud.select(p)}
                  onDoubleClick={() => crud.openEdit(p)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === p.id
                      ? 'bg-[#ffed99]'
                      : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{p.code}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{p.name}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{toDateInput(p.fromDate)}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{toDateInput(p.toDate)}</td>
                  <td className="py-1 px-2">
                    {p.isActive
                      ? <span className="text-green-700">{p.status || 'Active'}</span>
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
            emptyText="No pay periods yet. Click New to add one."
          />
        </div>

        <div className="w-[320px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new'
              ? 'New Pay Period'
              : crud.mode === 'edit'
                ? `Edit — ${crud.selected?.name}`
                : 'Details'}
          </div>

          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">
              Select a pay period, or click New.
            </div>
          )}

          {!isForm && crud.selected && (
            <>
              <FieldRow label="Code">{crud.selected.code}</FieldRow>
              <FieldRow label="Name">{crud.selected.name}</FieldRow>
              <FieldRow label="Status">{crud.selected.status || '—'}</FieldRow>
              <FieldRow label="From">{toDateInput(crud.selected.fromDate)}</FieldRow>
              <FieldRow label="To">{toDateInput(crud.selected.toDate)}</FieldRow>
              <FieldRow label="Pay Month">{crud.selected.payMonth || '—'}</FieldRow>
              <FieldRow label="Working Days">{crud.selected.workingDays ?? '—'}</FieldRow>
              <FieldRow label="Saturdays">{crud.selected.saturdays ?? '—'}</FieldRow>
              <FieldRow label="Holidays">{crud.selected.holidays ?? '—'}</FieldRow>
              <FieldRow label="Active">{crud.selected.isActive ? 'Yes' : 'No'}</FieldRow>
              {crud.selected.remarks && (
                <div className="mt-2 text-[10px] text-gray-600 whitespace-pre-wrap">{crud.selected.remarks}</div>
              )}
              <div className="mt-3">
                <YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn>
              </div>
            </>
          )}

          {isForm && (
            <>
              <FieldRow label="Status">
                <ClassicInput
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full"
                  placeholder="Open / Closed"
                />
              </FieldRow>
              <FieldRow label="Code / Month" required>
                <ClassicInput
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label="Name" required>
                <ClassicInput
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="From Date" required>
                <ClassicInput
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="To Date" required>
                <ClassicInput
                  type="date"
                  value={form.toDate}
                  onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Pay Month">
                <ClassicInput
                  value={form.payMonth}
                  onChange={(e) => setForm((f) => ({ ...f, payMonth: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Working Days">
                <ClassicInput
                  type="number" min="0"
                  value={form.workingDays}
                  onChange={(e) => setForm((f) => ({ ...f, workingDays: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Saturdays">
                <ClassicInput
                  type="number" min="0"
                  value={form.saturdays}
                  onChange={(e) => setForm((f) => ({ ...f, saturdays: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Holidays">
                <ClassicInput
                  type="number" min="0"
                  value={form.holidays}
                  onChange={(e) => setForm((f) => ({ ...f, holidays: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Max OT Hrs/Month">
                <ClassicInput
                  type="number" step="0.01" min="0"
                  value={form.maxNormalOtHoursMonth}
                  onChange={(e) => setForm((f) => ({ ...f, maxNormalOtHoursMonth: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Max Work Hrs/Month">
                <ClassicInput
                  type="number" step="0.01" min="0"
                  value={form.maxWorkingHoursMonth}
                  onChange={(e) => setForm((f) => ({ ...f, maxWorkingHoursMonth: e.target.value }))}
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
              <div className="mb-1">
                <div className="text-[10.5px] text-[#333] mb-1">Remarks</div>
                <textarea
                  value={form.remarks}
                  onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                  className="w-full h-12 border border-[#d4d0c8] p-1 text-[10.5px] outline-none focus:border-orange-400 bg-white resize-none"
                />
              </div>
              <div className="flex gap-2 mt-4">
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
