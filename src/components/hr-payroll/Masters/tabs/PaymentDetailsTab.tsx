import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import {
  paymentDetailsApi, type EmployeePaymentDetails, type PaymentDetailChange, type PaymentDetailOptions,
} from '../../../../api/payment-details.api';
import { StatusNote } from '../../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn } from '../../../ui/ClassicERPUI';

const FIELD_LABEL: Record<PaymentDetailChange['field'], string> = {
  paymentMethod: 'Payment method', bank: 'Bank', accountTitle: 'Account title', accountNo: 'Account no.', iban: 'IBAN',
};

/** What an employee's default method must have (the server enforces the same). */
const needs = (means?: string | null) =>
  means === 'ibft' ? "the employee's IBAN"
    : means === 'online' ? 'the bank and an account no. or IBAN'
      : null;

const emptyForm = { paymentMethodId: '', bankId: '', accountTitle: '', accountNo: '', iban: '' };

/**
 * Employee Current Information → Payment Details. Its own permissions and its
 * own Save, apart from the employee record: redirecting someone's pay is the
 * classic payroll fraud, so it is never a side effect of editing the record.
 * Without hr.employee_bank.view the numbers are never fetched at all.
 */
export const PaymentDetailsTab: React.FC<{ employeeId: string }> = ({ employeeId }) => {
  const { hasPermission } = useAuth();
  const canView = hasPermission('hr.employee_bank.view');
  const canUpdate = hasPermission('hr.employee_bank.update');

  const [details, setDetails] = useState<EmployeePaymentDetails | null>(null);
  const [history, setHistory] = useState<PaymentDetailChange[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const [options, setOptions] = useState<PaymentDetailOptions>({ methods: [], banks: [] });
  // Served by the payment-details endpoint (active outgoing methods except
  // LOAN/ADV, active banks), so this tab needs no Financials permissions.
  const methodChoices = options.methods;

  const load = useCallback(() => {
    if (!canView) return;
    setError('');
    Promise.all([paymentDetailsApi.get(employeeId), paymentDetailsApi.history(employeeId)])
      .then(([d, h]) => { setDetails(d); setHistory(h); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load payment details.'));
  }, [employeeId, canView]);

  useEffect(() => { setDetails(null); setHistory([]); setEditing(false); setStatus(''); load(); }, [load]);

  const startEdit = () => {
    paymentDetailsApi.options(employeeId)
      .then(setOptions)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the payment methods and banks.'));
    setForm(details ? {
      paymentMethodId: details.paymentMethod?.id ?? '',
      bankId: details.bank?.id ?? '',
      accountTitle: details.accountTitle ?? '',
      // Someone who may change but not view starts from blank fields: the
      // current numbers are exactly what they are not allowed to see.
      accountNo: canView ? details.accountNo ?? '' : '',
      iban: canView ? details.iban ?? '' : '',
    } : emptyForm);
    setError('');
    setStatus('');
    setEditing(true);
  };

  const save = () => {
    const method = methodChoices.find((m) => m.id === form.paymentMethodId);
    const need = needs(method?.paymentMeans);
    if (need && method?.paymentMeans === 'ibft' && !form.iban.trim()) { setError(`${method.code} needs ${need}.`); return; }
    if (need && method?.paymentMeans === 'online' && (!form.bankId || (!form.accountNo.trim() && !form.iban.trim()))) { setError(`${method.code} needs ${need}.`); return; }
    setBusy(true);
    setError('');
    paymentDetailsApi.put(employeeId, {
      paymentMethodId: form.paymentMethodId || null,
      bankId: form.bankId || null,
      accountTitle: form.accountTitle.trim() || null,
      accountNo: form.accountNo.trim() || null,
      iban: form.iban.trim() || null,
    })
      .then((saved) => {
        setEditing(false);
        setStatus(`Saved. Paid by ${saved.paymentMethod?.code ?? 'CASH'}${saved.iban ? `, IBAN ${saved.iban}` : saved.accountNo ? `, account ${saved.accountNo}` : ''}.`);
        if (canView) load(); else setDetails(saved);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'The server rejected these details.'))
      .finally(() => setBusy(false));
  };

  if (!canView && !canUpdate) {
    return (
      <div className="p-4 text-[10.5px] text-gray-600">
        Bank details are restricted. Viewing them needs the permission <b>hr.employee_bank.view</b>, changing them <b>hr.employee_bank.update</b>.
      </div>
    );
  }

  const shown = details;
  return (
    <div className="p-4 flex gap-8">
      <div className="w-[360px] shrink-0">
        <StatusNote error={error} status={status} />
        {!editing && (
          <>
            {!canView && <div className="text-[10.5px] text-gray-600 mb-2">You may change these details but not view the current ones.</div>}
            <FieldRow label="Payment Method">{shown?.paymentMethod ? `${shown.paymentMethod.code} — ${shown.paymentMethod.description}` : (canView ? 'Not set (paid in cash)' : '—')}</FieldRow>
            <FieldRow label="Bank">{shown?.bank ? `${shown.bank.code} — ${shown.bank.name}` : '—'}</FieldRow>
            <FieldRow label="Account Title">{shown?.accountTitle ?? '—'}</FieldRow>
            <FieldRow label="Account No.">{shown?.accountNo ?? '—'}</FieldRow>
            <FieldRow label="IBAN">{shown?.iban ?? '—'}</FieldRow>
            <FieldRow label="Last Changed">{shown?.bankDetailsChangedAt ? new Date(shown.bankDetailsChangedAt).toLocaleString() : '—'}</FieldRow>
            {canUpdate && <div className="mt-3"><YellowBtn onClick={startEdit}>Change</YellowBtn></div>}
          </>
        )}
        {editing && (
          <>
            <FieldRow label="Payment Method">
              <ClassicSel value={form.paymentMethodId} onChange={(e) => setForm((f) => ({ ...f, paymentMethodId: e.target.value }))} className="w-full">
                <option value="">Not set (paid in cash)</option>
                {methodChoices.map((m) => <option key={m.id} value={m.id}>{m.code} — {m.description}</option>)}
              </ClassicSel>
            </FieldRow>
            <FieldRow label="Bank">
              <ClassicSel value={form.bankId} onChange={(e) => setForm((f) => ({ ...f, bankId: e.target.value }))} className="w-full">
                <option value="">None</option>
                {options.banks.map((b) => <option key={b.id} value={b.id}>{b.code} — {b.name}</option>)}
                {details?.bank && !options.banks.some((b) => b.id === details.bank!.id) && (
                  <option value={details.bank.id}>{details.bank.code} — {details.bank.name} (inactive)</option>
                )}
              </ClassicSel>
            </FieldRow>
            <FieldRow label="Account Title"><ClassicInput value={form.accountTitle} onChange={(e) => setForm((f) => ({ ...f, accountTitle: e.target.value }))} className="w-full" /></FieldRow>
            <FieldRow label="Account No."><ClassicInput value={form.accountNo} onChange={(e) => setForm((f) => ({ ...f, accountNo: e.target.value }))} className="w-full" /></FieldRow>
            <FieldRow label="IBAN"><ClassicInput value={form.iban} onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))} className="w-full" placeholder="PK36 SCBL 0000 0011 2345 6702" /></FieldRow>
            <div className="text-[10px] text-gray-600 mt-1">Every change is recorded (who, when, old → new, masked).</div>
            <div className="flex gap-2 mt-3">
              <YellowBtn onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</YellowBtn>
              <GreyBtn onClick={() => { setEditing(false); setError(''); }}>Cancel</GreyBtn>
            </div>
          </>
        )}
      </div>

      {canView && (
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-[#333] mb-1">Change history</div>
          <table className="w-full border-collapse text-[10.5px] border border-[#d4d0c8]">
            <thead>
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                {['When', 'Field', 'Old', 'New'].map((h) => <th key={h} className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-[#f0f0f0]">
                  <td className="py-1 px-2 border-r border-[#f0f0f0] whitespace-nowrap">{new Date(h.changedAt).toLocaleString()}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{FIELD_LABEL[h.field] ?? h.field}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{h.oldValue ?? '—'}</td>
                  <td className="py-1 px-2 font-mono">{h.newValue ?? '—'}</td>
                </tr>
              ))}
              {!history.length && <tr><td colSpan={4} className="text-center text-gray-400 py-3">No changes recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
