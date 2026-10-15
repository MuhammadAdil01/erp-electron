import React, { useEffect, useState } from 'react';
import { BookCopy } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { useAuth } from '../../../context/AuthContext';
import { depreciationAreasApi, type DepreciationArea, type DepreciationAreaPayload } from '../../../api/fixed-assets.api';
import { ClassicWindow, CrudToolbar, StatusNote, ListPlaceholder, type WindowState } from '../../ui/ClassicWindow';
import { ClassicInput, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const emptyForm = { code: '', name: '', postsToGl: false, ordering: '0', isActive: true };

/**
 * Administration → Setup → Financials → Fixed Assets → Depreciation Areas.
 * Each asset is valued in every active area (e.g. Book and Tax). Exactly one
 * area posts to the G/L; the others are statistical. Once an area holds
 * values, whether it posts and whether it is active can no longer change.
 */
export const DepreciationAreasWindow: React.FC<Props> = ({ show, onClose, windowState, setWindowState, onFocus }) => {
  const [form, setForm] = useState(emptyForm);
  const { hasPermission } = useAuth();
  const can = {
    create: hasPermission('financials.depreciation_area.create'),
    update: hasPermission('financials.depreciation_area.update'),
    remove: hasPermission('financials.depreciation_area.delete'),
  };
  const crud = useCrudResource<DepreciationArea, DepreciationAreaPayload>('depreciation-areas', depreciationAreasApi, {
    label: (a) => `${a.code} ${a.name}`,
  });
  const postingArea = crud.rows.find((a) => a.postsToGl && a.isActive);

  useEffect(() => {
    if (crud.mode === 'new') setForm({ ...emptyForm, ordering: String(crud.rows.length + 1) });
    else if (crud.mode === 'edit' && crud.selected) {
      const a = crud.selected;
      setForm({ code: a.code, name: a.name, postsToGl: a.postsToGl, ordering: String(a.ordering), isActive: a.isActive });
    }
  }, [crud.mode, crud.selected, crud.rows.length]);

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) return crud.setError('A depreciation area needs a code and a name.');
    const ordering = Number(form.ordering);
    if (!Number.isInteger(ordering) || ordering < 0) return crud.setError('Order is a whole number, 0 or more.');
    crud.save({ code: form.code.trim(), name: form.name.trim(), postsToGl: form.postsToGl, ordering, isActive: form.isActive });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const otherPosting = postingArea && postingArea.id !== crud.selected?.id;

  return (
    <ClassicWindow
      title="Depreciation Areas"
      icon={<BookCopy className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={720}
      minHeight={380}
      toolbar={
        <>
          <CrudToolbar
            onNew={can.create ? crud.openNew : () => crud.setError('You do not have permission to add depreciation areas (financials.depreciation_area.create).')}
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
      footer={<><span>{crud.rows.length} area{crud.rows.length === 1 ? '' : 's'}</span><span>Posts to G/L: {postingArea?.code ?? 'none'}</span></>}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {!crud.isLoading && crud.rows.length > 0 && !postingArea && (
          <div className="px-3 py-1.5 text-[10.5px] bg-[#fff4cc] border-b border-[#e0c060] text-[#6b4d00]">
            No active area posts to the G/L, so capitalizations and depreciation will not reach the ledger. Mark one area "Posts to G/L".
          </div>
        )}
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                  {['Order', 'Code', 'Name', 'Posts to G/L', 'Assets valued', 'Status'].map((h) => (
                    <th key={h} className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crud.rows.map((a, i) => (
                  <tr
                    key={a.id}
                    onClick={() => crud.select(a)}
                    onDoubleClick={() => can.update && crud.openEdit(a)}
                    className={cn('border-b border-[#f0f0f0] cursor-default',
                      crud.selected?.id === a.id ? 'bg-[#ffed99]' : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50')}
                  >
                    <td className="py-1 px-2 border-r border-[#f0f0f0] text-right w-12">{a.ordering}</td>
                    <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{a.code}</td>
                    <td className="py-1 px-2 border-r border-[#f0f0f0]">{a.name}</td>
                    <td className="py-1 px-2 border-r border-[#f0f0f0] font-bold">{a.postsToGl ? 'Yes' : 'Statistical'}</td>
                    <td className="py-1 px-2 border-r border-[#f0f0f0] text-right">{a._count?.values ?? 0}</td>
                    <td className="py-1 px-2">{a.isActive ? <span className="text-green-700">Active</span> : <span className="text-gray-400">Inactive</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ListPlaceholder
              noCompany={crud.noCompany}
              isLoading={crud.isLoading}
              isEmpty={!crud.isLoading && crud.rows.length === 0}
              emptyText="No depreciation areas yet. Click New and add one that posts to the G/L."
            />
          </div>

          <div className="w-[300px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
            <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
              {crud.mode === 'new' ? 'New Depreciation Area' : crud.mode === 'edit' ? `Edit — ${crud.selected?.code}` : 'Details'}
            </div>
            {!isForm && !crud.selected && <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select an area, or click New.</div>}
            {!isForm && crud.selected && (
              <>
                <FieldRow label="Code">{crud.selected.code}</FieldRow>
                <FieldRow label="Name">{crud.selected.name}</FieldRow>
                <FieldRow label="Posts to G/L">{crud.selected.postsToGl ? 'Yes — book depreciation' : 'No — statistical'}</FieldRow>
                <FieldRow label="Order">{crud.selected.ordering}</FieldRow>
                <FieldRow label="Assets valued">{crud.selected._count?.values ?? 0}</FieldRow>
                {can.update && <div className="mt-3"><YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn></div>}
              </>
            )}
            {isForm && (
              <>
                <FieldRow label="Code" required>
                  <ClassicInput value={form.code} maxLength={20} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="w-full" autoFocus placeholder="IFRS" />
                </FieldRow>
                <FieldRow label="Name" required>
                  <ClassicInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full" />
                </FieldRow>
                <FieldRow label="Posts to G/L">
                  <input
                    type="checkbox"
                    checked={form.postsToGl}
                    disabled={!form.postsToGl && !!otherPosting}
                    onChange={(e) => setForm((f) => ({ ...f, postsToGl: e.target.checked }))}
                  />
                </FieldRow>
                {!form.postsToGl && otherPosting && (
                  <div className="text-[10px] text-gray-600 mb-1">{postingArea!.code} already posts to the G/L; only one area may.</div>
                )}
                <FieldRow label="Order">
                  <ClassicInput type="number" min={0} step={1} value={form.ordering} onChange={(e) => setForm((f) => ({ ...f, ordering: e.target.value }))} className="w-20 text-right" />
                </FieldRow>
                <FieldRow label="Active">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                </FieldRow>
                {crud.mode === 'edit' && (
                  <div className="text-[10px] text-gray-600 mt-1">
                    Once assets are capitalized in this area, whether it posts to the G/L and whether it is active can no longer change.
                  </div>
                )}
                {crud.mode === 'new' && (
                  <div className="text-[10px] text-gray-600 mt-1">
                    A new area is added to assets that are not capitalized yet; capitalized assets keep the areas they were valued in.
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <YellowBtn onClick={handleSave} disabled={crud.isBusy}>{crud.isBusy ? 'Saving…' : crud.mode === 'new' ? 'Add' : 'Update'}</YellowBtn>
                  <GreyBtn onClick={crud.cancel}>Cancel</GreyBtn>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ClassicWindow>
  );
};
