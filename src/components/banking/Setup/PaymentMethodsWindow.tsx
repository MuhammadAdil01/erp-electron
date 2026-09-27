import React, { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { firstError, useLookup } from '../../../hooks/useLookup';
import { useAuth } from '../../../context/AuthContext';
import {
  houseBankAccountsApi, paymentMethodsApi, type HouseBankAccount, type PaymentMethod,
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

/**
 * What a payment made with each means must carry. Outgoing payroll methods
 * (Phase 2) first; the incoming ones A/R uses after.
 */
export const PAYMENT_MEANS: { value: string; label: string; direction: 'OUTGOING' | 'INCOMING'; needs: string }[] = [
  { value: 'cash', label: 'Cash', direction: 'OUTGOING', needs: 'Nothing extra; credits Cash in Hand' },
  { value: 'check', label: 'Cheque', direction: 'OUTGOING', needs: 'Cheque no. and date, and the house bank account it is drawn on' },
  { value: 'online', label: 'Online transfer', direction: 'OUTGOING', needs: 'House bank account, transfer reference; employee bank and account no. or IBAN' },
  { value: 'ibft', label: 'Inter-bank funds transfer', direction: 'OUTGOING', needs: "House bank account, IBFT reference and the employee's IBAN" },
  { value: 'loan', label: 'Settle against loan', direction: 'OUTGOING', needs: 'Nothing extra; applies the salary to the oldest loan installment' },
  { value: 'advance', label: 'Settle against advance', direction: 'OUTGOING', needs: 'Nothing extra; applies the salary to the open advance' },
  { value: 'bank_transfer', label: 'Bank transfer', direction: 'INCOMING', needs: 'Incoming payments (A/R)' },
  { value: 'credit_card', label: 'Credit card', direction: 'INCOMING', needs: 'Incoming payments (A/R)' },
];
const meansOf = (v?: string | null) => PAYMENT_MEANS.find((m) => m.value === v);

const emptyForm = { code: '', description: '', direction: 'OUTGOING' as 'OUTGOING' | 'INCOMING', paymentMeans: 'cash', houseBankAccountId: '', isActive: true };

/** Administration → Setup → Banking → Payment Methods. */
export const PaymentMethodsWindow: React.FC<Props> = ({ show, onClose, windowState, setWindowState, onFocus }) => {
  const [form, setForm] = useState(emptyForm);
  const { hasPermission } = useAuth();
  const can = {
    create: hasPermission('financials.payment_method.create'),
    update: hasPermission('financials.payment_method.update'),
    remove: hasPermission('financials.payment_method.delete'),
  };
  const crud = useCrudResource<PaymentMethod>('payment-methods', paymentMethodsApi, { label: (m) => m.code });
  const houseBanks = useLookup<HouseBankAccount>('House bank accounts', () => houseBankAccountsApi.getAll(), { enabled: show });

  useEffect(() => {
    if (crud.mode === 'new') setForm(emptyForm);
    else if (crud.mode === 'edit' && crud.selected) {
      const m = crud.selected;
      setForm({
        code: m.code, description: m.description, direction: m.direction, paymentMeans: m.paymentMeans ?? '',
        houseBankAccountId: m.houseBankAccountId ?? '', isActive: m.isActive,
      });
    }
  }, [crud.mode, crud.selected]);

  const handleSave = () => {
    if (!form.code.trim() || !form.description.trim()) {
      crud.setError('Code and Description are required.');
      return;
    }
    crud.save({
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      direction: form.direction,
      paymentMeans: form.paymentMeans || undefined,
      houseBankAccountId: form.houseBankAccountId || null,
      isActive: form.isActive,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const meansChoices = PAYMENT_MEANS.filter((m) => m.direction === form.direction);
  const houseBankLabel = (id?: string | null) => {
    const hb = houseBanks.items.find((h) => h.id === id);
    return hb ? `${hb.bank?.code ?? ''} ${hb.accountNo}`.trim() : '';
  };

  return (
    <ClassicWindow
      title="Payment Methods"
      icon={<CreditCard className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={820}
      minHeight={440}
      toolbar={
        <>
          <CrudToolbar
            onNew={can.create ? crud.openNew : () => crud.setError('You do not have permission to create payment methods.')}
            onEdit={() => crud.selected && crud.openEdit(crud.selected)}
            onDelete={() => crud.remove()}
            onRefresh={crud.refetch}
            canEdit={!!crud.selected && can.update}
            canDelete={!!crud.selected && can.remove}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <StatusNote error={firstError(crud.error, houseBanks.error)} status={crud.status} />
        </>
      }
      footer={<><span>{crud.rows.length} method{crud.rows.length === 1 ? '' : 's'}</span><span>Payment Methods</span></>}
    >
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                {['Code', 'Description', 'Direction', 'Means', 'Default House Bank', 'Status'].map((h) => (
                  <th key={h} className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((m, i) => (
                <tr
                  key={m.id}
                  onClick={() => crud.select(m)}
                  onDoubleClick={() => can.update && crud.openEdit(m)}
                  className={cn('border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === m.id ? 'bg-[#ffed99]' : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50')}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{m.code}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{m.description}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{m.direction === 'OUTGOING' ? 'Outgoing' : 'Incoming'}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{meansOf(m.paymentMeans)?.label ?? m.paymentMeans ?? ''}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{houseBankLabel(m.houseBankAccountId)}</td>
                  <td className="py-1 px-2">{m.isActive ? <span className="text-green-700">Active</span> : <span className="text-gray-400">Inactive</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && crud.rows.length === 0}
            emptyText="No payment methods yet. Click New to add one."
          />
        </div>

        <div className="w-[330px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new' ? 'New Payment Method' : crud.mode === 'edit' ? `Edit — ${crud.selected?.code}` : 'Details'}
          </div>
          {!isForm && !crud.selected && <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select a method, or click New.</div>}
          {!isForm && crud.selected && (
            <>
              <FieldRow label="Code">{crud.selected.code}</FieldRow>
              <FieldRow label="Description">{crud.selected.description}</FieldRow>
              <FieldRow label="Direction">{crud.selected.direction === 'OUTGOING' ? 'Outgoing' : 'Incoming'}</FieldRow>
              <FieldRow label="Means">{meansOf(crud.selected.paymentMeans)?.label ?? '—'}</FieldRow>
              <div className="text-[10px] text-gray-600 mt-1 mb-2">
                A payment with this method needs: {meansOf(crud.selected.paymentMeans)?.needs ?? '—'}
              </div>
              <FieldRow label="Default House Bank">{houseBankLabel(crud.selected.houseBankAccountId) || '—'}</FieldRow>
              {can.update && <div className="mt-3"><YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn></div>}
            </>
          )}
          {isForm && (
            <>
              <FieldRow label="Code" required>
                <ClassicInput value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="w-full" autoFocus />
              </FieldRow>
              <FieldRow label="Description" required>
                <ClassicInput value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full" />
              </FieldRow>
              <FieldRow label="Direction">
                <ClassicSel
                  value={form.direction}
                  onChange={(e) => {
                    const direction = e.target.value as 'OUTGOING' | 'INCOMING';
                    setForm((f) => ({ ...f, direction, paymentMeans: PAYMENT_MEANS.find((m) => m.direction === direction)!.value }));
                  }}
                  className="w-full"
                >
                  <option value="OUTGOING">Outgoing</option>
                  <option value="INCOMING">Incoming</option>
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Means">
                <ClassicSel value={form.paymentMeans} onChange={(e) => setForm((f) => ({ ...f, paymentMeans: e.target.value }))} className="w-full">
                  {meansChoices.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </ClassicSel>
              </FieldRow>
              <div className="text-[10px] text-gray-600 mb-2">Needs: {meansOf(form.paymentMeans)?.needs ?? '—'}</div>
              <FieldRow label="Default House Bank">
                <ClassicSel value={form.houseBankAccountId} onChange={(e) => setForm((f) => ({ ...f, houseBankAccountId: e.target.value }))} className="w-full">
                  <option value="">None</option>
                  {houseBanks.items.filter((h) => h.isActive || h.id === form.houseBankAccountId).map((h) => (
                    <option key={h.id} value={h.id}>{h.bank?.code ?? ''} {h.accountNo}</option>
                  ))}
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
    </ClassicWindow>
  );
};
