import React, { useCallback, useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { useAuth } from '../../../context/AuthContext';
import { currenciesApi, type BaseCurrency, type Currency } from '../../../api/financials.api';
import { ClassicWindow, CrudToolbar, StatusNote, ListPlaceholder, type WindowState } from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const emptyForm = { code: '', name: '', intlDescription: '', hundredthName: '', decimals: '2', rounding: 'standard', isActive: true };

/**
 * Administration → Setup → Financials → Currencies (E8). Every posting's
 * currency must be in this master, including the company's base currency —
 * payroll and invoices refuse to post until it is. The base currency is set
 * here too, and only while nothing has been posted.
 */
export const CurrenciesWindow: React.FC<Props> = ({ show, onClose, windowState, setWindowState, onFocus }) => {
  const [form, setForm] = useState(emptyForm);
  const [base, setBase] = useState<BaseCurrency | null>(null);
  const [note, setNote] = useState('');
  const { hasPermission, activeCompanyId } = useAuth();
  const can = {
    create: hasPermission('financials.currency.create'),
    update: hasPermission('financials.currency.update'),
    remove: hasPermission('financials.currency.delete'),
  };
  const crud = useCrudResource<Currency>('currencies', currenciesApi, { label: (c) => c.code });

  const loadBase = useCallback(() => {
    if (!activeCompanyId) return;
    currenciesApi.base().then(setBase).catch((e) => crud.setError(e instanceof Error ? e.message : 'Could not read the base currency.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompanyId]);
  useEffect(() => { if (show) loadBase(); }, [show, loadBase, crud.rows.length]);

  useEffect(() => {
    if (crud.mode === 'new') setForm(base?.code && !base.inMaster ? { ...emptyForm, code: base.code } : emptyForm);
    else if (crud.mode === 'edit' && crud.selected) {
      const c = crud.selected;
      setForm({
        code: c.code, name: c.name, intlDescription: c.intlDescription ?? '', hundredthName: c.hundredthName ?? '',
        decimals: String(c.decimals), rounding: c.rounding ?? 'standard', isActive: c.isActive,
      });
    }
  }, [crud.mode, crud.selected, base]);

  const handleSave = () => {
    const code = form.code.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code) || !form.name.trim()) {
      crud.setError('A currency needs its 3-letter ISO code (e.g. PKR) and a name.');
      return;
    }
    crud.save({
      code,
      name: form.name.trim(),
      intlDescription: form.intlDescription.trim() || undefined,
      hundredthName: form.hundredthName.trim() || undefined,
      decimals: Number(form.decimals),
      rounding: form.rounding,
      isActive: form.isActive,
    });
  };

  const makeBase = (c: Currency) => {
    if (!window.confirm(`Make ${c.code} the company's base currency? Every posting is recorded in it.`)) return;
    crud.setError('');
    setNote('');
    currenciesApi.makeBase(c.id)
      .then((b) => { setBase(b); setNote(`${b.code} is now the base currency.`); })
      .catch((e) => crud.setError(e instanceof Error ? e.message : 'Could not change the base currency.'));
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const missingBase = base?.code && !base.inMaster;

  return (
    <ClassicWindow
      title="Currencies"
      icon={<Coins className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={760}
      minHeight={440}
      toolbar={
        <>
          <CrudToolbar
            onNew={can.create ? crud.openNew : () => crud.setError('You do not have permission to add currencies (financials.currency.create).')}
            onEdit={() => crud.selected && crud.openEdit(crud.selected)}
            onDelete={() => crud.remove()}
            onRefresh={() => { crud.refetch(); loadBase(); }}
            canEdit={!!crud.selected && can.update}
            canDelete={!!crud.selected && can.remove && crud.selected.code !== base?.code}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <StatusNote error={crud.error} status={note || crud.status} />
        </>
      }
      footer={<><span>{crud.rows.length} currenc{crud.rows.length === 1 ? 'y' : 'ies'}</span><span>Base: {base?.code ?? '—'}</span></>}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {missingBase && (
          <div className="px-3 py-1.5 text-[10.5px] bg-[#fff4cc] border-b border-[#e0c060] text-[#6b4d00]">
            The base currency {base!.code} is not in this master, so nothing can be posted yet. Click New to add it
            {can.create ? '' : ' (you need financials.currency.create)'}.
          </div>
        )}
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                  {['Code', 'Name', 'Hundredth', 'Decimals', 'Base', 'Status'].map((h) => (
                    <th key={h} className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">{h}</th>
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
                    <td className="py-1 px-2 border-r border-[#f0f0f0]">{c.hundredthName ?? ''}</td>
                    <td className="py-1 px-2 border-r border-[#f0f0f0]">{c.decimals}</td>
                    <td className="py-1 px-2 border-r border-[#f0f0f0] font-bold">{c.code === base?.code ? 'Base' : ''}</td>
                    <td className="py-1 px-2">{c.isActive ? <span className="text-green-700">Active</span> : <span className="text-gray-400">Inactive</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ListPlaceholder
              noCompany={crud.noCompany}
              isLoading={crud.isLoading}
              isEmpty={!crud.isLoading && crud.rows.length === 0}
              emptyText="No currencies yet. Click New to add the company's currency first."
            />
          </div>

          <div className="w-[320px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
            <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
              {crud.mode === 'new' ? 'New Currency' : crud.mode === 'edit' ? `Edit — ${crud.selected?.code}` : 'Details'}
            </div>
            {!isForm && !crud.selected && <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select a currency, or click New.</div>}
            {!isForm && crud.selected && (
              <>
                <FieldRow label="Code">{crud.selected.code}</FieldRow>
                <FieldRow label="Name">{crud.selected.name}</FieldRow>
                <FieldRow label="Hundredth">{crud.selected.hundredthName ?? '—'}</FieldRow>
                <FieldRow label="Decimals">{crud.selected.decimals}</FieldRow>
                <FieldRow label="Rounding">{crud.selected.rounding ?? 'standard'}</FieldRow>
                <FieldRow label="Base">{crud.selected.code === base?.code ? 'Yes — the company currency' : 'No'}</FieldRow>
                <div className="flex gap-2 mt-3">
                  {can.update && <YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn>}
                  {can.update && crud.selected.code !== base?.code && (
                    <GreyBtn
                      onClick={() => makeBase(crud.selected!)}
                      disabled={!base?.canChange}
                      title={base?.canChange ? undefined : `The company has ${base?.postedEntries} posted entries${base?.code ? ` in ${base.code}` : ''}; its base currency can no longer change.`}
                    >
                      Make Base Currency
                    </GreyBtn>
                  )}
                </div>
                {!base?.canChange && crud.selected.code !== base?.code && (
                  <div className="text-[10px] text-gray-600 mt-2">
                    The base currency can't change: {base?.postedEntries} entries are already posted{base?.code ? ` in ${base.code}` : ''}.
                  </div>
                )}
              </>
            )}
            {isForm && (
              <>
                <FieldRow label="ISO Code" required>
                  <ClassicInput value={form.code} maxLength={3} disabled={crud.mode === 'edit'} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="w-full" autoFocus placeholder="PKR" />
                </FieldRow>
                <FieldRow label="Name" required>
                  <ClassicInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full" placeholder="Pakistani Rupee" />
                </FieldRow>
                <FieldRow label="Intl. Description">
                  <ClassicInput value={form.intlDescription} onChange={(e) => setForm((f) => ({ ...f, intlDescription: e.target.value }))} className="w-full" />
                </FieldRow>
                <FieldRow label="Hundredth Name">
                  <ClassicInput value={form.hundredthName} onChange={(e) => setForm((f) => ({ ...f, hundredthName: e.target.value }))} className="w-full" placeholder="Paisa" />
                </FieldRow>
                <FieldRow label="Decimals">
                  <ClassicSel value={form.decimals} onChange={(e) => setForm((f) => ({ ...f, decimals: e.target.value }))} className="w-full">
                    {[0, 1, 2, 3, 4].map((d) => <option key={d} value={d}>{d}</option>)}
                  </ClassicSel>
                </FieldRow>
                <FieldRow label="Rounding">
                  <ClassicSel value={form.rounding} onChange={(e) => setForm((f) => ({ ...f, rounding: e.target.value }))} className="w-full">
                    <option value="standard">Standard</option>
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                  </ClassicSel>
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
      </div>
    </ClassicWindow>
  );
};
