import React, { useEffect, useState } from 'react';
import { Landmark } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { useAuth } from '../../../context/AuthContext';
import { banksApi, type Bank } from '../../../api/financials.api';
import { ClassicWindow, CrudToolbar, StatusNote, ListPlaceholder, type WindowState } from '../../ui/ClassicWindow';
import { ClassicInput, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const emptyForm = { code: '', name: '', swift: '', country: '', isActive: true };

/** Administration → Setup → Banking → Banks: the banks house accounts and employee accounts are held at. */
export const BanksWindow: React.FC<Props> = ({ show, onClose, windowState, setWindowState, onFocus }) => {
  const [form, setForm] = useState(emptyForm);
  const { hasPermission } = useAuth();
  const can = { create: hasPermission('financials.bank.create'), update: hasPermission('financials.bank.update'), remove: hasPermission('financials.bank.delete') };
  const crud = useCrudResource<Bank>('banks', banksApi, { label: (b) => b.name });

  useEffect(() => {
    if (crud.mode === 'new') setForm(emptyForm);
    else if (crud.mode === 'edit' && crud.selected) {
      const b = crud.selected;
      setForm({ code: b.code, name: b.name, swift: b.swift ?? '', country: b.country ?? '', isActive: b.isActive });
    }
  }, [crud.mode, crud.selected]);

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) {
      crud.setError('Bank Code and Name are required.');
      return;
    }
    crud.save({
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      swift: form.swift.trim().toUpperCase() || undefined,
      country: form.country.trim().toUpperCase() || undefined,
      isActive: form.isActive,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';

  return (
    <ClassicWindow
      title="Banks"
      icon={<Landmark className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={680}
      minHeight={420}
      toolbar={
        <>
          <CrudToolbar
            onNew={can.create ? crud.openNew : () => crud.setError('You do not have permission to create banks (financials.bank.create).')}
            onEdit={() => crud.selected && crud.openEdit(crud.selected)}
            onDelete={() => crud.remove()}
            onRefresh={crud.refetch}
            canEdit={!!crud.selected && can.update}
            canDelete={!!crud.selected && can.remove}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={<><span>{crud.rows.length} bank{crud.rows.length === 1 ? '' : 's'}</span><span>Banks</span></>}
    >
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                {['Code', 'Name', 'SWIFT / BIC', 'Country', 'Status'].map((h) => (
                  <th key={h} className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((b, i) => (
                <tr
                  key={b.id}
                  onClick={() => crud.select(b)}
                  onDoubleClick={() => can.update && crud.openEdit(b)}
                  className={cn('border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === b.id ? 'bg-[#ffed99]' : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50')}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{b.code}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{b.name}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{b.swift ?? ''}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{b.country ?? ''}</td>
                  <td className="py-1 px-2">{b.isActive ? <span className="text-green-700">Active</span> : <span className="text-gray-400">Inactive</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && crud.rows.length === 0}
            emptyText="No banks yet. Click New to add the banks your company and employees hold accounts at."
          />
        </div>

        <div className="w-[300px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new' ? 'New Bank' : crud.mode === 'edit' ? `Edit — ${crud.selected?.name}` : 'Details'}
          </div>
          {!isForm && !crud.selected && <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select a bank, or click New.</div>}
          {!isForm && crud.selected && (
            <>
              <FieldRow label="Code">{crud.selected.code}</FieldRow>
              <FieldRow label="Name">{crud.selected.name}</FieldRow>
              <FieldRow label="SWIFT / BIC">{crud.selected.swift ?? '—'}</FieldRow>
              <FieldRow label="Country">{crud.selected.country ?? '—'}</FieldRow>
              <FieldRow label="Status">{crud.selected.isActive ? 'Active' : 'Inactive'}</FieldRow>
              {can.update && <div className="mt-3"><YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn></div>}
            </>
          )}
          {isForm && (
            <>
              <FieldRow label="Bank Code" required>
                <ClassicInput value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="w-full" autoFocus />
              </FieldRow>
              <FieldRow label="Bank Name" required>
                <ClassicInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full" />
              </FieldRow>
              <FieldRow label="SWIFT / BIC">
                <ClassicInput value={form.swift} onChange={(e) => setForm((f) => ({ ...f, swift: e.target.value }))} className="w-full" />
              </FieldRow>
              <FieldRow label="Country (ISO)">
                <ClassicInput value={form.country} maxLength={2} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="w-full" placeholder="PK" />
              </FieldRow>
              <FieldRow label="Active">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
              </FieldRow>
              <div className="flex gap-2 mt-4">
                <YellowBtn onClick={handleSave} disabled={crud.isBusy}>{crud.isBusy ? 'Saving…' : 'Save'}</YellowBtn>
                <GreyBtn onClick={crud.cancel}>Cancel</GreyBtn>
              </div>
            </>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
