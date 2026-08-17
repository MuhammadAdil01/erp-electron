import React, { useEffect, useState } from 'react';
import { Percent } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import {
  commissionGroupsApi,
  type CommissionGroup,
  type CommissionGroupPayload,
} from '../../../api/crm.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const emptyForm = { code: '', name: '', commissionPercent: '0', isActive: true };

export const CommissionGroupsWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [form, setForm] = useState(emptyForm);
  const crud = useCrudResource<CommissionGroup, CommissionGroupPayload>(
    'commission-groups',
    commissionGroupsApi,
    { label: (g) => g.name },
  );

  useEffect(() => {
    if (crud.mode === 'new') setForm(emptyForm);
    else if (crud.mode === 'edit' && crud.selected) {
      setForm({
        code: crud.selected.code,
        name: crud.selected.name,
        commissionPercent: String(crud.selected.commissionPercent ?? '0'),
        isActive: crud.selected.isActive,
      });
    }
  }, [crud.mode, crud.selected]);

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) {
      crud.setError('Code and name are required.');
      return;
    }
    const pct = Number(form.commissionPercent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      crud.setError('Commission % must be a number between 0 and 100.');
      return;
    }
    crud.save({
      code: form.code.trim(),
      name: form.name.trim(),
      commissionPercent: pct,
      isActive: form.isActive,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';

  return (
    <ClassicWindow
      title="Commission Groups - Setup"
      icon={<Percent className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={620}
      minHeight={400}
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
          <span>{crud.rows.length} group{crud.rows.length === 1 ? '' : 's'}</span>
          <span>Commission Groups</span>
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
                <th className="text-right py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Commission %</th>
                <th className="text-right py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Employees</th>
                <th className="text-left py-1 px-2 font-bold text-[#444]">Status</th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((g, i) => (
                <tr
                  key={g.id}
                  onClick={() => crud.select(g)}
                  onDoubleClick={() => crud.openEdit(g)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === g.id
                      ? 'bg-[#ffed99]'
                      : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{g.code}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{g.name}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] text-right">
                    {Number(g.commissionPercent).toFixed(2)}%
                  </td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] text-right text-gray-500">
                    {g._count?.salesEmployees ?? 0}
                  </td>
                  <td className="py-1 px-2">
                    {g.isActive
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
            emptyText="No commission groups yet. Click New to add one."
          />
        </div>

        <div className="w-[280px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new'
              ? 'New Commission Group'
              : crud.mode === 'edit'
                ? `Edit — ${crud.selected?.name}`
                : 'Details'}
          </div>

          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">
              Select a group, or click New.
            </div>
          )}

          {!isForm && crud.selected && (
            <>
              <FieldRow label="Code">{crud.selected.code}</FieldRow>
              <FieldRow label="Name">{crud.selected.name}</FieldRow>
              <FieldRow label="Commission %">
                {Number(crud.selected.commissionPercent).toFixed(2)}%
              </FieldRow>
              <FieldRow label="Status">{crud.selected.isActive ? 'Active' : 'Inactive'}</FieldRow>
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
                />
              </FieldRow>
              <FieldRow label="Name" required>
                <ClassicInput
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Commission %">
                <ClassicInput
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.commissionPercent}
                  onChange={(e) => setForm((f) => ({ ...f, commissionPercent: e.target.value }))}
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
