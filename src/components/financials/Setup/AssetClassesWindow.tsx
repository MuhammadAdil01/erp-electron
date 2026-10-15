import React, { useEffect, useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { useAuth } from '../../../context/AuthContext';
import { assetClassesApi, type AssetClass, type AssetClassPayload } from '../../../api/fixed-assets.api';
import type { DepreciationMethod } from '../../../api/financials.api';
import { ClassicWindow, CrudToolbar, StatusNote, ListPlaceholder, type WindowState } from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const emptyForm = {
  code: '', name: '', depreciationMethod: 'STRAIGHT_LINE' as DepreciationMethod, usefulLifeMonths: '60',
  assetAccountId: '', accumulatedDepreciationAccountId: '', depreciationExpenseAccountId: '', clearingAccountId: '',
  isActive: true, remarks: '',
};

/** Which account types each picker offers — the same rule the backend applies. */
// QA FA-D4: the APC account must be an asset account of subtype Fixed Asset;
// the server checks every rule again on save.
const ACCOUNT_FIELDS: { key: keyof typeof emptyForm; label: string; types: string[]; subtype?: string; hint: string }[] = [
  { key: 'assetAccountId', label: 'APC Account', types: ['ASSET'], subtype: 'FIXED_ASSET', hint: 'Acquisition and production cost: an asset account of subtype Fixed Asset (Edit Chart of Accounts)' },
  { key: 'accumulatedDepreciationAccountId', label: 'Accumulated Depreciation', types: ['ASSET'], hint: 'Contra-asset the depreciation run credits' },
  { key: 'depreciationExpenseAccountId', label: 'Depreciation Expense', types: ['EXPENSE'], hint: 'P&L account the depreciation run debits' },
  { key: 'clearingAccountId', label: 'Acquisition Clearing', types: ['LIABILITY', 'ASSET'], hint: 'Manual capitalization credits it; A/P invoices for assets debit it' },
];

/**
 * Administration → Setup → Financials → Fixed Assets → Asset Classes. The
 * class an asset belongs to decides the accounts it posts to and its default
 * depreciation method and useful life. Accounts are locked once the class's
 * assets carry values, so the asset register keeps reconciling to the G/L.
 */
export const AssetClassesWindow: React.FC<Props> = ({ show, onClose, windowState, setWindowState, onFocus }) => {
  const [form, setForm] = useState(emptyForm);
  const { hasPermission, activeCompanyId } = useAuth();
  const can = {
    create: hasPermission('financials.asset_class.create'),
    update: hasPermission('financials.asset_class.update'),
    remove: hasPermission('financials.asset_class.delete'),
  };
  const crud = useCrudResource<AssetClass, AssetClassPayload>('asset-classes', assetClassesApi, {
    label: (c) => `${c.code} ${c.name}`,
  });
  const lookups = useQuery({
    queryKey: ['asset-class-lookups', activeCompanyId],
    queryFn: () => assetClassesApi.lookups(),
    enabled: show && !!activeCompanyId,
    staleTime: 60_000,
  });
  const lookupError = lookups.error instanceof Error ? `Could not load accounts: ${lookups.error.message}` : '';
  const accounts = useMemo(() => lookups.data?.accounts ?? [], [lookups.data]);
  const methods = lookups.data?.depreciationMethods ?? [];
  const methodLabel = (m: DepreciationMethod) => methods.find((x) => x.value === m)?.label ?? m;

  useEffect(() => {
    if (crud.mode === 'new') setForm(emptyForm);
    else if (crud.mode === 'edit' && crud.selected) {
      const c = crud.selected;
      setForm({
        code: c.code, name: c.name, depreciationMethod: c.depreciationMethod, usefulLifeMonths: String(c.usefulLifeMonths),
        assetAccountId: c.assetAccountId, accumulatedDepreciationAccountId: c.accumulatedDepreciationAccountId,
        depreciationExpenseAccountId: c.depreciationExpenseAccountId, clearingAccountId: c.clearingAccountId,
        isActive: c.isActive, remarks: c.remarks ?? '',
      });
    }
  }, [crud.mode, crud.selected]);

  const handleSave = () => {
    const life = Number(form.usefulLifeMonths);
    if (!form.code.trim() || !form.name.trim()) return crud.setError('An asset class needs a code and a name.');
    if (!Number.isInteger(life) || life < 1) return crud.setError('Useful life is a whole number of months, at least 1.');
    const missing = ACCOUNT_FIELDS.find((f) => !form[f.key]);
    if (missing) return crud.setError(`Choose the ${missing.label.toLowerCase()} account.`);
    crud.save({
      code: form.code.trim(),
      name: form.name.trim(),
      depreciationMethod: form.depreciationMethod,
      usefulLifeMonths: life,
      assetAccountId: form.assetAccountId,
      accumulatedDepreciationAccountId: form.accumulatedDepreciationAccountId,
      depreciationExpenseAccountId: form.depreciationExpenseAccountId,
      clearingAccountId: form.clearingAccountId,
      isActive: form.isActive,
      remarks: form.remarks.trim() || undefined,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const acct = (r?: { code: string; name: string }) => (r ? `${r.code} — ${r.name}` : '—');

  return (
    <ClassicWindow
      title="Asset Classes"
      icon={<Layers className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={900}
      minHeight={460}
      toolbar={
        <>
          <CrudToolbar
            onNew={can.create ? crud.openNew : () => crud.setError('You do not have permission to add asset classes (financials.asset_class.create).')}
            onEdit={() => crud.selected && crud.openEdit(crud.selected)}
            onDelete={() => crud.remove()}
            onRefresh={() => { crud.refetch(); void lookups.refetch(); }}
            canEdit={!!crud.selected && can.update}
            canDelete={!!crud.selected && can.remove && !crud.selected._count?.assets}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <StatusNote error={crud.error || lookupError} status={crud.status} />
        </>
      }
      footer={<><span>{crud.rows.length} asset class{crud.rows.length === 1 ? '' : 'es'}</span><span>Fixed Assets setup</span></>}
    >
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                {['Code', 'Name', 'Method', 'Life (months)', 'APC Account', 'Clearing', 'Assets', 'Status'].map((h) => (
                  <th key={h} className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((c, i) => (
                <tr
                  key={c.id}
                  onClick={() => crud.select(c)}
                  onDoubleClick={() => can.update && crud.openEdit(c)}
                  className={cn('border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === c.id ? 'bg-[#ffed99]' : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50')}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{c.code}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{c.name}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{methodLabel(c.depreciationMethod)}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] text-right">{c.usefulLifeMonths}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{c.assetAccount?.code ?? ''}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{c.clearingAccount?.code ?? ''}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] text-right">{c._count?.assets ?? 0}</td>
                  <td className="py-1 px-2">{c.isActive ? <span className="text-green-700">Active</span> : <span className="text-gray-400">Inactive</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && crud.rows.length === 0}
            emptyText="No asset classes yet. Click New to define the first one."
          />
        </div>

        <div className="w-[360px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new' ? 'New Asset Class' : crud.mode === 'edit' ? `Edit — ${crud.selected?.code}` : 'Details'}
          </div>
          {!isForm && !crud.selected && <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select an asset class, or click New.</div>}
          {!isForm && crud.selected && (
            <>
              <FieldRow label="Code">{crud.selected.code}</FieldRow>
              <FieldRow label="Name">{crud.selected.name}</FieldRow>
              <FieldRow label="Method">{methodLabel(crud.selected.depreciationMethod)}</FieldRow>
              <FieldRow label="Useful Life">{crud.selected.usefulLifeMonths} months</FieldRow>
              <FieldRow label="APC Account">{acct(crud.selected.assetAccount)}</FieldRow>
              <FieldRow label="Accum. Depreciation">{acct(crud.selected.accumulatedDepreciationAccount)}</FieldRow>
              <FieldRow label="Depr. Expense">{acct(crud.selected.depreciationExpenseAccount)}</FieldRow>
              <FieldRow label="Acquisition Clearing">{acct(crud.selected.clearingAccount)}</FieldRow>
              <FieldRow label="Assets">{crud.selected._count?.assets ?? 0}</FieldRow>
              <FieldRow label="Remarks">{crud.selected.remarks ?? '—'}</FieldRow>
              {can.update && <div className="mt-3"><YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn></div>}
            </>
          )}
          {isForm && (
            <>
              <FieldRow label="Code" required labelWidth="130px">
                <ClassicInput value={form.code} maxLength={20} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="w-full" autoFocus placeholder="MACH" />
              </FieldRow>
              <FieldRow label="Name" required labelWidth="130px">
                <ClassicInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full" placeholder="Machinery" />
              </FieldRow>
              <FieldRow label="Depreciation Method" labelWidth="130px">
                <ClassicSel value={form.depreciationMethod} onChange={(e) => setForm((f) => ({ ...f, depreciationMethod: e.target.value as DepreciationMethod }))} className="w-full">
                  {methods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Useful Life (months)" required labelWidth="130px">
                <ClassicInput type="number" min={1} step={1} value={form.usefulLifeMonths} onChange={(e) => setForm((f) => ({ ...f, usefulLifeMonths: e.target.value }))} className="w-24 text-right" />
              </FieldRow>
              {ACCOUNT_FIELDS.map((af) => (
                <FieldRow key={af.key} label={af.label} required labelWidth="130px">
                  <ClassicSel
                    value={form[af.key] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [af.key]: e.target.value }))}
                    className="w-full"
                    title={af.hint}
                  >
                    <option value="">—</option>
                    {accounts.filter((a) => a.type && af.types.includes(a.type) && (!af.subtype || a.subtype === af.subtype)).map((a) => (
                      <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                    ))}
                  </ClassicSel>
                </FieldRow>
              ))}
              <FieldRow label="Active" labelWidth="130px">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
              </FieldRow>
              <FieldRow label="Remarks" labelWidth="130px">
                <ClassicInput value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} className="w-full" />
              </FieldRow>
              {crud.mode === 'edit' && !!crud.selected?._count?.assets && (
                <div className="text-[10px] text-gray-600 mt-1">
                  Used by {crud.selected._count.assets} asset(s). Once they are capitalized, the APC and accumulated depreciation
                  accounts can no longer change (that would strand the balance); expense and clearing still can. The default method and
                  life apply to assets created from now on.
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
    </ClassicWindow>
  );
};
