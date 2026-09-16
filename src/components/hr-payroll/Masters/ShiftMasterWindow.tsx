import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { shiftsApi, type Shift, type ShiftPayload } from '../../../api/hr.api';
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

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const emptyForm = {
  code: '',
  name: '',
  startTime: '09:00',
  endTime: '17:00',
  breakMinutes: '0',
  remarks: '',
  workDays: [0, 1, 2, 3, 4, 5, 6] as number[],
  isActive: true,
};

export const ShiftMasterWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [form, setForm] = useState(emptyForm);
  const crud = useCrudResource<Shift, ShiftPayload>(
    'shifts',
    shiftsApi,
    { label: (s) => s.name },
  );

  useEffect(() => {
    if (crud.mode === 'new') setForm(emptyForm);
    else if (crud.mode === 'edit' && crud.selected) {
      setForm({
        code: crud.selected.code,
        name: crud.selected.name,
        startTime: crud.selected.startTime,
        endTime: crud.selected.endTime,
        breakMinutes: String(crud.selected.breakMinutes ?? 0),
        remarks: crud.selected.remarks ?? '',
        workDays: crud.selected.workDays?.length ? crud.selected.workDays : [0, 1, 2, 3, 4, 5, 6],
        isActive: crud.selected.isActive,
      });
    }
  }, [crud.mode, crud.selected]);

  const toggleDay = (d: number) => {
    setForm((f) => ({
      ...f,
      workDays: f.workDays.includes(d) ? f.workDays.filter((x) => x !== d) : [...f.workDays, d].sort(),
    }));
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) {
      crud.setError('Shift Code and Shift Description are required.');
      return;
    }
    if (!form.startTime || !form.endTime) {
      crud.setError('Shift Start Time and End Time are required.');
      return;
    }
    if (!form.workDays.length) {
      crud.setError('Select at least one working day.');
      return;
    }
    const breakMinutes = Number(form.breakMinutes);
    if (!Number.isFinite(breakMinutes) || breakMinutes < 0 || breakMinutes > 240) {
      crud.setError('Lunch Break must be between 0 and 240 minutes.');
      return;
    }
    crud.save({
      code: form.code.trim(),
      name: form.name.trim(),
      startTime: form.startTime,
      endTime: form.endTime,
      breakMinutes,
      workDays: form.workDays,
      remarks: form.remarks.trim() || undefined,
      isActive: form.isActive,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';

  return (
    <ClassicWindow
      title="Shift Master"
      icon={<Clock className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={720}
      minHeight={480}
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
          <span>{crud.rows.length} shift{crud.rows.length === 1 ? '' : 's'}</span>
          <span>Shift Master</span>
        </>
      }
    >
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Code</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Description</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Start</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">End</th>
                <th className="text-left py-1 px-2 font-bold text-[#444]">Status</th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((s, i) => (
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
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{s.code}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{s.name}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{s.startTime}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{s.endTime}</td>
                  <td className="py-1 px-2">
                    {s.isActive
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
            emptyText="No shifts yet. Click New to add one."
          />
        </div>

        <div className="w-[320px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new'
              ? 'New Shift'
              : crud.mode === 'edit'
                ? `Edit — ${crud.selected?.name}`
                : 'Details'}
          </div>

          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">
              Select a shift, or click New.
            </div>
          )}

          {!isForm && crud.selected && (
            <>
              <FieldRow label="Code">{crud.selected.code}</FieldRow>
              <FieldRow label="Description">{crud.selected.name}</FieldRow>
              <FieldRow label="Start Time">{crud.selected.startTime}</FieldRow>
              <FieldRow label="End Time">{crud.selected.endTime}</FieldRow>
              <FieldRow label="Lunch Break">{crud.selected.breakMinutes} min</FieldRow>
              <FieldRow label="Work Days">
                {crud.selected.workDays.map((d) => DAY_LABELS[d]).join(', ')}
              </FieldRow>
              <FieldRow label="Status">{crud.selected.isActive ? 'Active' : 'Inactive'}</FieldRow>
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
              <FieldRow label="Shift Code" required>
                <ClassicInput
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label="Description" required>
                <ClassicInput
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Start Time" required>
                <ClassicInput
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="End Time" required>
                <ClassicInput
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Lunch Break (min)">
                <ClassicInput
                  type="number"
                  min="0"
                  max="240"
                  value={form.breakMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, breakMinutes: e.target.value }))}
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

              <div className="mb-2 mt-1">
                <div className="text-[10.5px] text-[#333] mb-1">Working Days</div>
                <div className="flex flex-wrap gap-2">
                  {DAY_LABELS.map((label, d) => (
                    <label key={d} className="flex items-center gap-1 text-[10.5px]">
                      <input
                        type="checkbox"
                        checked={form.workDays.includes(d)}
                        onChange={() => toggleDay(d)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-1">
                <div className="text-[10.5px] text-[#333] mb-1">Remarks</div>
                <textarea
                  value={form.remarks}
                  onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                  className="w-full h-16 border border-[#d4d0c8] p-1 text-[10.5px] outline-none focus:border-orange-400 bg-white resize-none"
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
