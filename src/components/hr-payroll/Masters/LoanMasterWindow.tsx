import React, { useEffect, useState } from 'react';
import { Banknote } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { loanTypesApi, type LoanType, type LoanTypePayload } from '../../../api/payroll-masters.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const emptyForm = {
  code: '',
  description: '',
  loanType: 'Personal',
  maxAmount: '',
  rateOfInterest: '',
  minRepaymentAmount: '',
  maxInstallments: '',
  remarks: '',
  isActive: true,
};

export const LoanMasterWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [form, setForm] = useState(emptyForm);
  const crud = useCrudResource<LoanType, LoanTypePayload>(
    'loan-types',
    loanTypesApi,
    { label: (l) => l.description },
  );

  useEffect(() => {
    if (crud.mode === 'new') setForm(emptyForm);
    else if (crud.mode === 'edit' && crud.selected) {
      const s = crud.selected;
      setForm({
        code: s.code,
        description: s.description,
        loanType: s.loanType,
        maxAmount: s.maxAmount != null ? String(s.maxAmount) : '',
        rateOfInterest: s.rateOfInterest != null ? String(s.rateOfInterest) : '',
        minRepaymentAmount: s.minRepaymentAmount != null ? String(s.minRepaymentAmount) : '',
        maxInstallments: s.maxInstallments != null ? String(s.maxInstallments) : '',
        remarks: s.remarks ?? '',
        isActive: s.isActive,
      });
    }
  }, [crud.mode, crud.selected]);

  const handleSave = () => {
    if (!form.code.trim() || !form.description.trim()) {
      crud.setError('Code and Description are required.');
      return;
    }
    crud.save({
      code: form.code.trim(),
      description: form.description.trim(),
      loanType: form.loanType,
      maxAmount: form.maxAmount === '' ? undefined : Number(form.maxAmount),
      rateOfInterest: form.rateOfInterest === '' ? undefined : Number(form.rateOfInterest),
      minRepaymentAmount: form.minRepaymentAmount === '' ? undefined : Number(form.minRepaymentAmount),
      maxInstallments: form.maxInstallments === '' ? undefined : Number(form.maxInstallments),
      remarks: form.remarks.trim() || undefined,
      isActive: form.isActive,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';

  return (
    <ClassicWindow
      title="Loan Master"
      icon={<Banknote className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={760}
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
          <span>{crud.rows.length} loan type{crud.rows.length === 1 ? '' : 's'}</span>
          <span>Loan Master</span>
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
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Type</th>
                <th className="text-right py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Max Amount</th>
                <th className="text-left py-1 px-2 font-bold text-[#444]">Status</th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((l, i) => (
                <tr
                  key={l.id}
                  onClick={() => crud.select(l)}
                  onDoubleClick={() => crud.openEdit(l)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === l.id
                      ? 'bg-[#ffed99]'
                      : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{l.code}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{l.description}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{l.loanType}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0] text-right">
                    {l.maxAmount != null ? Number(l.maxAmount).toFixed(2) : '—'}
                  </td>
                  <td className="py-1 px-2">
                    {l.isActive
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
            emptyText="No loan types yet. Click New to add one."
          />
        </div>

        <div className="w-[300px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new'
              ? 'New Loan Type'
              : crud.mode === 'edit'
                ? `Edit — ${crud.selected?.description}`
                : 'Details'}
          </div>

          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">
              Select a loan type, or click New.
            </div>
          )}

          {!isForm && crud.selected && (
            <>
              <FieldRow label="Code">{crud.selected.code}</FieldRow>
              <FieldRow label="Description">{crud.selected.description}</FieldRow>
              <FieldRow label="Loan Type">{crud.selected.loanType}</FieldRow>
              <FieldRow label="Max Amount">
                {crud.selected.maxAmount != null ? Number(crud.selected.maxAmount).toFixed(2) : '—'}
              </FieldRow>
              <FieldRow label="Rate of Interest">
                {crud.selected.rateOfInterest != null ? `${Number(crud.selected.rateOfInterest).toFixed(2)}%` : '—'}
              </FieldRow>
              <FieldRow label="Min Repayment">
                {crud.selected.minRepaymentAmount != null ? Number(crud.selected.minRepaymentAmount).toFixed(2) : '—'}
              </FieldRow>
              <FieldRow label="Max Installments">{crud.selected.maxInstallments ?? '—'}</FieldRow>
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
              <FieldRow label="Code" required>
                <ClassicInput
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label="Description" required>
                <ClassicInput
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Loan Type">
                <ClassicSel
                  value={form.loanType}
                  onChange={(e) => setForm((f) => ({ ...f, loanType: e.target.value }))}
                  className="w-full"
                >
                  <option value="Personal">Personal</option>
                  <option value="Advance">Advance</option>
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Max Amount">
                <ClassicInput
                  type="number" step="0.01" min="0"
                  value={form.maxAmount}
                  onChange={(e) => setForm((f) => ({ ...f, maxAmount: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Rate Of Interest">
                <ClassicInput
                  type="number" step="0.01" min="0"
                  value={form.rateOfInterest}
                  onChange={(e) => setForm((f) => ({ ...f, rateOfInterest: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Min Repayment">
                <ClassicInput
                  type="number" step="0.01" min="0"
                  value={form.minRepaymentAmount}
                  onChange={(e) => setForm((f) => ({ ...f, minRepaymentAmount: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Max Installments">
                <ClassicInput
                  type="number" step="1" min="0"
                  value={form.maxInstallments}
                  onChange={(e) => setForm((f) => ({ ...f, maxInstallments: e.target.value }))}
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
