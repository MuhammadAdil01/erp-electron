import React, { useEffect, useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { firstError, useLookup } from '../../../hooks/useLookup';
import { useAuth } from '../../../context/AuthContext';
import {
  accountsApi, banksApi, currenciesApi, houseBankAccountsApi,
  type Account, type Bank, type Currency, type HouseBankAccount,
} from '../../../api/financials.api';
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
  bankId: '', accountNo: '', accountName: '', branch: '', iban: '', currency: '',
  glAccountId: '', isDefault: false, isActive: true,
};

/**
 * Administration → Setup → Banking → House Bank Accounts: the company's own
 * accounts that salaries, loans, advances and tax are paid from. Each needs
 * its G/L account — the bank account in the chart that such a payment
 * credits. The server refuses a title, inactive or non-asset account.
 */
export const HouseBankAccountsWindow: React.FC<Props> = ({ show, onClose, windowState, setWindowState, onFocus }) => {
  const [form, setForm] = useState(emptyForm);
  const { hasPermission } = useAuth();
  const can = {
    create: hasPermission('financials.house_bank_account.create'),
    update: hasPermission('financials.house_bank_account.update'),
    remove: hasPermission('financials.house_bank_account.delete'),
  };
  const crud = useCrudResource<HouseBankAccount>('house-bank-accounts', houseBankAccountsApi, { label: (a) => a.accountNo });
  const banks = useLookup<Bank>('Banks', () => banksApi.getAll(), { enabled: show });
  const currencies = useLookup<Currency>('Currencies', () => currenciesApi.getAll(), { enabled: show });
  const accounts = useLookup<Account>('G/L accounts', () => accountsApi.getAll({ type: 'ASSET', take: 1000 }), { enabled: show });
  // Only what the server would accept: active, postable asset accounts.
  const glChoices = useMemo(
    () => accounts.items.filter((a) => a.type === 'ASSET' && !a.isTitle && a.isActive),
    [accounts.items],
  );

  useEffect(() => {
    if (crud.mode === 'new') setForm(emptyForm);
    else if (crud.mode === 'edit' && crud.selected) {
      const a = crud.selected;
      setForm({
        bankId: a.bankId, accountNo: a.accountNo, accountName: a.accountName ?? '', branch: a.branch ?? '',
        iban: a.iban ?? '', currency: a.currency, glAccountId: a.glAccountId ?? '', isDefault: a.isDefault, isActive: a.isActive,
      });
    }
  }, [crud.mode, crud.selected]);

  const handleSave = () => {
    if (!form.bankId || !form.accountNo.trim() || !form.glAccountId || !form.currency) {
      crud.setError('Bank, Account No., Currency and G/L Account are required.');
      return;
    }
    crud.save({
      bankId: form.bankId,
      accountNo: form.accountNo.trim(),
      accountName: form.accountName.trim() || undefined,
      branch: form.branch.trim() || undefined,
      iban: form.iban.replace(/\s+/g, '').toUpperCase() || undefined,
      currency: form.currency,
      glAccountId: form.glAccountId,
      isDefault: form.isDefault,
      isActive: form.isActive,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <ClassicWindow
      title="House Bank Accounts"
      icon={<Building2 className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={820}
      minHeight={460}
      toolbar={
        <>
          <CrudToolbar
            onNew={can.create ? crud.openNew : () => crud.setError('You do not have permission to create house bank accounts.')}
            onEdit={() => crud.selected && crud.openEdit(crud.selected)}
            onDelete={() => crud.remove()}
            onRefresh={crud.refetch}
            canEdit={!!crud.selected && can.update}
            canDelete={!!crud.selected && can.remove}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <StatusNote error={firstError(crud.error, banks.error, currencies.error, accounts.error)} status={crud.status} />
        </>
      }
      footer={<><span>{crud.rows.length} account{crud.rows.length === 1 ? '' : 's'}</span><span>House Bank Accounts</span></>}
    >
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                {['Bank', 'Account No.', 'Account Name', 'Currency', 'G/L Account', 'Default', 'Status'].map((h) => (
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
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{a.bank ? `${a.bank.code} — ${a.bank.name}` : ''}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{a.accountNo}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{a.accountName ?? ''}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{a.currency}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">
                    {a.glAccount ? `${a.glAccount.code} ${a.glAccount.name}` : <span className="text-red-700">not set — cannot be paid from</span>}
                  </td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{a.isDefault ? 'Yes' : ''}</td>
                  <td className="py-1 px-2">{a.isActive ? <span className="text-green-700">Active</span> : <span className="text-gray-400">Inactive</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && crud.rows.length === 0}
            emptyText="No house bank accounts yet. Add a bank under Banks first, then click New."
          />
        </div>

        <div className="w-[330px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new' ? 'New House Bank Account' : crud.mode === 'edit' ? `Edit — ${crud.selected?.accountNo}` : 'Details'}
          </div>
          {!isForm && !crud.selected && <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select an account, or click New.</div>}
          {!isForm && crud.selected && (
            <>
              <FieldRow label="Bank">{crud.selected.bank ? `${crud.selected.bank.code} — ${crud.selected.bank.name}` : '—'}</FieldRow>
              <FieldRow label="Account No.">{crud.selected.accountNo}</FieldRow>
              <FieldRow label="Account Name">{crud.selected.accountName ?? '—'}</FieldRow>
              <FieldRow label="Branch">{crud.selected.branch ?? '—'}</FieldRow>
              <FieldRow label="IBAN">{crud.selected.iban ?? '—'}</FieldRow>
              <FieldRow label="Currency">{crud.selected.currency}</FieldRow>
              <FieldRow label="G/L Account">{crud.selected.glAccount ? `${crud.selected.glAccount.code} ${crud.selected.glAccount.name}` : '—'}</FieldRow>
              {can.update && <div className="mt-3"><YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn></div>}
            </>
          )}
          {isForm && (
            <>
              <FieldRow label="Bank" required>
                <ClassicSel value={form.bankId} onChange={set('bankId')} className="w-full">
                  <option value="">Select…</option>
                  {banks.items.filter((b) => b.isActive || b.id === form.bankId).map((b) => <option key={b.id} value={b.id}>{b.code} — {b.name}</option>)}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Account No." required><ClassicInput value={form.accountNo} onChange={set('accountNo')} className="w-full" /></FieldRow>
              <FieldRow label="Account Name"><ClassicInput value={form.accountName} onChange={set('accountName')} className="w-full" /></FieldRow>
              <FieldRow label="Branch"><ClassicInput value={form.branch} onChange={set('branch')} className="w-full" /></FieldRow>
              <FieldRow label="IBAN"><ClassicInput value={form.iban} onChange={set('iban')} className="w-full" /></FieldRow>
              <FieldRow label="Currency" required>
                <ClassicSel value={form.currency} onChange={set('currency')} className="w-full">
                  <option value="">Select…</option>
                  {currencies.items.map((c) => <option key={c.id} value={c.code}>{c.code}</option>)}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="G/L Account" required>
                <ClassicSel value={form.glAccountId} onChange={set('glAccountId')} className="w-full">
                  <option value="">Select…</option>
                  {glChoices.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Default"><input type="checkbox" checked={form.isDefault} onChange={set('isDefault')} /></FieldRow>
              <FieldRow label="Active"><input type="checkbox" checked={form.isActive} onChange={set('isActive')} /></FieldRow>
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
