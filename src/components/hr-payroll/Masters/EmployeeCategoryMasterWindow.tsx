import React, { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { employeeCategoriesApi, type EmployeeCategory, type EmployeeCategoryPayload } from '../../../api/payroll-masters.api';
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

const emptyForm = { code: '', name: '', remarks: '', isActive: true };

export const EmployeeCategoryMasterWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [form, setForm] = useState(emptyForm);
  const crud = useCrudResource<EmployeeCategory, EmployeeCategoryPayload>(
    'employee-categories',
    employeeCategoriesApi,
    { label: (c) => c.name },
  );

  useEffect(() => {
    if (crud.mode === 'new') setForm(emptyForm);
    else if (crud.mode === 'edit' && crud.selected) {
      setForm({
        code: crud.selected.code,
        name: crud.selected.name,
        remarks: crud.selected.remarks ?? '',
        isActive: crud.selected.isActive,
      });
    }
  }, [crud.mode, crud.selected]);

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) {
      crud.setError('Employee Category Code and Name are required.');
      return;
    }
    crud.save({
      code: form.code.trim(),
      name: form.name.trim(),
      remarks: form.remarks.trim() || undefined,
      isActive: form.isActive,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';

  return (
    <ClassicWindow
      title="Employee Category Master"
      icon={<Tag className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={680}
      minHeight={440}
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
          <span>{crud.rows.length} categor{crud.rows.length === 1 ? 'y' : 'ies'}</span>
          <span>Employee Category Master</span>
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
                <th className="text-left py-1 px-2 font-bold text-[#444]">Status</th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((c, i) => (
                <tr
                  key={c.id}
                  onClick={() => crud.select(c)}
                  onDoubleClick={() => crud.openEdit(c)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === c.id
                      ? 'bg-[#ffed99]'
                      : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{c.code}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{c.name}</td>
                  <td className="py-1 px-2">
                    {c.isActive
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
            emptyText="No employee categories yet. Click New to add one."
          />
        </div>

        <div className="w-[300px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new'
              ? 'New Employee Category'
              : crud.mode === 'edit'
                ? `Edit — ${crud.selected?.name}`
                : 'Details'}
          </div>

          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">
              Select a category, or click New.
            </div>
          )}

          {!isForm && crud.selected && (
            <>
              <FieldRow label="Code">{crud.selected.code}</FieldRow>
              <FieldRow label="Name">{crud.selected.name}</FieldRow>
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
              <FieldRow label="Category Code" required>
                <ClassicInput
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label="Category Name" required>
                <ClassicInput
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
