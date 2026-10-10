import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Eraser, RefreshCw, Settings2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  accountDeterminationApi,
  accountsApi,
  type Account,
  type AccountDetermination,
  type AccountType,
  type DeterminationArea,
} from '../../../api/financials.api';
import { ClassicWindow, ListPlaceholder, StatusNote, ToolBtn, type WindowState } from '../../ui/ClassicWindow';
import { ClassicSel, cn } from '../../ui/ClassicERPUI';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
  /** Area to open on (Payroll's "No G/L account is mapped" error points here). */
  initialArea?: DeterminationArea;
}

interface KeyDef {
  key: string;
  label: string;
  /** The account type a sensible mapping has; used to narrow the picker. */
  type: AccountType;
  usedBy: string;
  /** Resolved by a posting routine that exists today (vs. reserved for a later phase). */
  live: boolean;
}

/**
 * Every key a posting routine resolves (ar-ap.service.ts DETERMINATION,
 * transactions.services.ts PAYROLL_DETERMINATION, period-end closing), plus the
 * PAYROLL keys the HR-Payroll → Financials roadmap (doc §14) reserves for
 * deductions, benefits, employer contributions, overtime and reimbursements.
 * Reserved keys can be mapped now; nothing posts to them yet.
 */
const AREAS: { area: DeterminationArea; label: string; keys: KeyDef[] }[] = [
  {
    area: 'PAYROLL', label: 'Payroll',
    keys: [
      { key: 'salary_expense', label: 'Salary Expense', type: 'EXPENSE', usedBy: 'Payroll Process → Post (debit)', live: true },
      { key: 'salaries_payable', label: 'Salaries Payable', type: 'LIABILITY', usedBy: 'Payroll Process → Post (credit, net pay)', live: true },
      { key: 'tax_payable', label: 'Income Tax Withheld Payable', type: 'LIABILITY', usedBy: 'Payroll Process → Post (credit, tax withheld)', live: true },
      { key: 'loan_receivable', label: 'Employee Loan Receivable', type: 'ASSET', usedBy: 'Payroll Process → Post (credit, loan recovered)', live: true },
      { key: 'advance_receivable', label: 'Salary Advance Receivable', type: 'ASSET', usedBy: 'Payroll Process → Post (credit, advance recovered)', live: true },
      // One per Monthly Adjustment deduction type (PDF §18–19). The defaults group
      // them onto three accounts; the accountant may point any of them elsewhere.
      { key: 'mess_deduction', label: 'Mess Deduction', type: 'EXPENSE', usedBy: 'Payroll Process → Post (credit; default Mess Expense Recovery (contra-expense))', live: true },
      { key: 'car_ins_laptop_deduction', label: 'Car Insurance / Laptop Deduction', type: 'INCOME', usedBy: 'Payroll Process → Post (credit; default Other Income)', live: true },
      { key: 'car_ins_laptop_deduction_2', label: 'Car Insurance / Laptop Deduction 2', type: 'INCOME', usedBy: 'Payroll Process → Post (credit; default Other Income)', live: true },
      { key: 'general_deduction', label: 'General Deduction', type: 'LIABILITY', usedBy: 'Payroll Process → Post (credit; default Other Deductions Payable; also hand-entered "Other Ded.")', live: true },
      { key: 'general_deduction_2', label: 'General Deduction 2', type: 'LIABILITY', usedBy: 'Payroll Process → Post (credit; default Other Deductions Payable)', live: true },
      { key: 'deduction_11', label: 'Deduction 11', type: 'LIABILITY', usedBy: 'Payroll Process → Post (credit; default Other Deductions Payable)', live: true },
      { key: 'deduction_12', label: 'Deduction 12', type: 'LIABILITY', usedBy: 'Payroll Process → Post (credit; default Other Deductions Payable)', live: true },
      { key: 'deduction_13', label: 'Deduction 13', type: 'LIABILITY', usedBy: 'Payroll Process → Post (credit; default Other Deductions Payable)', live: true },
      { key: 'deduction_14', label: 'Deduction 14', type: 'LIABILITY', usedBy: 'Payroll Process → Post (credit; default Other Deductions Payable)', live: true },
      { key: 'deduction_15', label: 'Deduction 15', type: 'LIABILITY', usedBy: 'Payroll Process → Post (credit; default Other Deductions Payable)', live: true },
      { key: 'benefits_payable', label: 'Benefits Payable', type: 'LIABILITY', usedBy: 'Reserved — benefits (Phase 3)', live: false },
      { key: 'employer_contribution_payable', label: 'Employer Contribution Payable', type: 'LIABILITY', usedBy: 'Reserved — EOBI / PF (Phase 3)', live: false },
      { key: 'overtime_expense', label: 'Overtime Expense', type: 'EXPENSE', usedBy: 'Reserved — overtime (Phase 3)', live: false },
      { key: 'reimbursement_payable', label: 'Reimbursement Payable', type: 'LIABILITY', usedBy: 'Reserved — reimbursements (Phase 3)', live: false },
    ],
  },
  {
    area: 'SALES', label: 'Sales (A/R)',
    keys: [
      { key: 'domestic_ar', label: 'Accounts Receivable', type: 'ASSET', usedBy: 'A/R Invoice, Incoming Payment', live: true },
      { key: 'revenue', label: 'Revenue', type: 'INCOME', usedBy: 'A/R Invoice', live: true },
      { key: 'tax_payable', label: 'Output Tax (sales tax)', type: 'LIABILITY', usedBy: 'A/R Invoice with tax', live: true },
    ],
  },
  {
    area: 'PURCHASING', label: 'Purchasing (A/P)',
    keys: [
      { key: 'domestic_ap', label: 'Accounts Payable', type: 'LIABILITY', usedBy: 'A/P Invoice, Outgoing Payment', live: true },
      { key: 'expense', label: 'Default Expense', type: 'EXPENSE', usedBy: 'A/P Invoice', live: true },
      { key: 'tax_receivable', label: 'Input Tax (recoverable)', type: 'ASSET', usedBy: 'A/P Invoice with tax', live: true },
    ],
  },
  {
    area: 'GENERAL', label: 'General',
    keys: [
      { key: 'cash', label: 'Cash', type: 'ASSET', usedBy: 'Incoming / Outgoing Payment (default cash)', live: true },
      { key: 'retained_earnings', label: 'Retained Earnings', type: 'EQUITY', usedBy: 'Period-End Closing', live: true },
    ],
  },
  {
    area: 'INVENTORY', label: 'Inventory',
    keys: [
      { key: 'inventory_asset', label: 'Inventory Asset', type: 'ASSET', usedBy: 'Inventory Receipt / Issue', live: false },
      { key: 'inventory_adjustment_gain', label: 'Inventory Adjustment Gain', type: 'INCOME', usedBy: 'Inventory Adjustment', live: false },
      { key: 'inventory_adjustment_loss', label: 'Inventory Adjustment Loss', type: 'EXPENSE', usedBy: 'Inventory Adjustment', live: false },
      { key: 'cogs', label: 'Cost of Goods Sold (COGS)', type: 'EXPENSE', usedBy: 'Sales Invoice / Inventory Issue', live: false },
    ],
  },
  {
    area: 'PRODUCTION', label: 'Production / MRP',
    keys: [
      { key: 'raw_material_inventory', label: 'Raw Material Inventory', type: 'ASSET', usedBy: 'Production Issue', live: false },
      { key: 'work_in_progress', label: 'Work In Progress (WIP)', type: 'ASSET', usedBy: 'Production Issue / Receipt', live: false },
      { key: 'finished_goods', label: 'Finished Goods', type: 'ASSET', usedBy: 'Production Receipt', live: false },
      { key: 'production_variance', label: 'Production Variance', type: 'EXPENSE', usedBy: 'Production Order Close', live: false },
    ],
  },
  {
    area: 'PROJECTS', label: 'Project Management',
    keys: [
      { key: 'project_revenue', label: 'Project Revenue', type: 'INCOME', usedBy: 'Project Billing', live: false },
      { key: 'project_cost', label: 'Project Cost', type: 'EXPENSE', usedBy: 'Project Timesheets / Expenses', live: false },
      { key: 'project_wip', label: 'Project WIP', type: 'ASSET', usedBy: 'Project Billing', live: false },
    ],
  },
  {
    area: 'SERVICE', label: 'Service',
    keys: [
      { key: 'service_revenue', label: 'Service Revenue', type: 'INCOME', usedBy: 'Service Invoice', live: false },
      { key: 'service_expense', label: 'Service Expense', type: 'EXPENSE', usedBy: 'Service Call Completion', live: false },
    ],
  },
];

export const GLAccountDeterminationWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, setWindowState, onFocus, initialArea = 'PAYROLL',
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const [area, setArea] = useState<DeterminationArea>(initialArea);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const mappings = useQuery({
    queryKey: ['account-determination', activeCompanyId],
    queryFn: () => accountDeterminationApi.list(),
    enabled: !!activeCompanyId,
  });
  // Title accounts are refused as targets by the backend, so they are never offered.
  const accounts = useQuery({
    queryKey: ['accounts-postable', activeCompanyId],
    queryFn: () => accountsApi.getAll({ take: 2000, isActive: true, isTitle: false }),
    enabled: !!activeCompanyId,
  });

  const byKey = useMemo(() => {
    const m = new Map<string, AccountDetermination>();
    for (const d of mappings.data ?? []) m.set(`${d.area}/${d.key}`, d);
    return m;
  }, [mappings.data]);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['account-determination'] });
    void accounts.refetch();
  };

  const onDone = (msg: string) => {
    setError('');
    setStatus(msg);
    void qc.invalidateQueries({ queryKey: ['account-determination'] });
  };
  const onFail = (e: unknown) => {
    setStatus('');
    setError(e instanceof Error ? e.message : 'The server rejected that change.');
  };

  const setMut = useMutation({
    mutationFn: (p: { area: DeterminationArea; key: string; accountId: string }) => accountDeterminationApi.set(p),
    onSuccess: (row) => onDone(`${row.area}/${row.key} → ${row.account?.code ?? ''} ${row.account?.name ?? ''}`),
    onError: onFail,
  });
  const clearMut = useMutation({
    mutationFn: (id: string) => accountDeterminationApi.remove(id),
    onSuccess: () => onDone('Mapping cleared.'),
    onError: onFail,
  });

  const current = AREAS.find((a) => a.area === area)!;
  const loadError = mappings.error instanceof Error
    ? `Could not load the mappings: ${mappings.error.message}`
    : accounts.error instanceof Error ? `Could not load the chart of accounts: ${accounts.error.message}` : '';
  const unmappedLive = (a: typeof AREAS[number]) => a.keys.filter((k) => k.live && !byKey.has(`${a.area}/${k.key}`)).length;
  const options = (def: KeyDef, mappedId?: string): Account[] =>
    (accounts.data ?? []).filter((a) => showAllTypes || a.type === def.type || a.id === mappedId);

  return (
    <ClassicWindow
      title="G/L Account Determination"
      icon={<Settings2 className="w-3.5 h-3.5 text-gray-600" />}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      onUpdateState={onUpdateState}
      setWindowState={setWindowState}
      minWidth={900}
      minHeight={520}
      toolbar={
        <>
          <ToolBtn onClick={refresh} disabled={mappings.isFetching}>
            <RefreshCw className={cn('w-3 h-3', mappings.isFetching && 'animate-spin')} /> Refresh
          </ToolBtn>
          <label className="flex items-center gap-1 text-[10.5px] ml-3">
            <input type="checkbox" checked={showAllTypes} onChange={(e) => setShowAllTypes(e.target.checked)} />
            Offer accounts of every type
          </label>
          <StatusNote error={error || loadError} status={status} />
        </>
      }
      footer={<><span>{(mappings.data ?? []).length} mapping{(mappings.data ?? []).length === 1 ? '' : 's'}</span><span>Administration → Setup → Financials</span></>}
    >
      <div className="flex flex-1 min-h-0">
        <div className="w-[190px] shrink-0 border-r border-[#d4d0c8] bg-white">
          {AREAS.map((a) => {
            const missing = unmappedLive(a);
            return (
              <button
                key={a.area}
                onClick={() => setArea(a.area)}
                className={cn(
                  'w-full text-left px-3 py-2 text-[11px] border-b border-[#f0f0f0] flex items-center justify-between',
                  a.area === area ? 'bg-[#ffed99] font-bold' : 'hover:bg-blue-50/50',
                )}
              >
                {a.label}
                {missing > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-[#8a2b22]" title={`${missing} key(s) used by posting are not mapped`}>
                    <AlertTriangle className="w-3 h-3" /> {missing}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar bg-white">
          <ListPlaceholder noCompany={!activeCompanyId} isLoading={mappings.isLoading || accounts.isLoading} isEmpty={false} />
          {activeCompanyId && !mappings.isLoading && (
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                  <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444] w-[210px]">Determination</th>
                  <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">G/L Account</th>
                  <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444] w-[240px]">Used by</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {current.keys.map((def, i) => {
                  const mapped = byKey.get(`${current.area}/${def.key}`);
                  const opts = options(def, mapped?.accountId);
                  return (
                    <tr key={def.key} className={cn('border-b border-[#f0f0f0]', i % 2 ? 'bg-[#fafafa]' : 'bg-white')}>
                      <td className="py-1 px-2 border-r border-[#f0f0f0]">
                        <div className="font-bold text-[#333]">{def.label}</div>
                        <div className="text-[9.5px] text-gray-500 font-mono">{current.area}/{def.key}</div>
                      </td>
                      <td className="py-1 px-2 border-r border-[#f0f0f0]">
                        <div className="flex items-center gap-2">
                          <ClassicSel
                            value={mapped?.accountId ?? ''}
                            disabled={setMut.isPending || clearMut.isPending}
                            onChange={(e) => e.target.value && setMut.mutate({ area: current.area, key: def.key, accountId: e.target.value })}
                            className="w-full"
                          >
                            <option value="">{mapped ? '—' : '— not mapped —'}</option>
                            {opts.map((a) => (
                              <option key={a.id} value={a.id}>{a.code} — {a.name}{a.type !== def.type ? ` (${a.type.toLowerCase()})` : ''}</option>
                            ))}
                          </ClassicSel>
                          {!mapped && def.live && (
                            <span className="text-[#8a2b22] flex items-center gap-0.5 whitespace-nowrap" title="Posting will fail with 'No G/L account is mapped' until this is set">
                              <AlertTriangle className="w-3 h-3" /> required
                            </span>
                          )}
                        </div>
                        {!opts.length && (
                          <div className="text-[9.5px] text-gray-500 mt-0.5">
                            No postable {def.type.toLowerCase()} account in the chart. Create one under Edit Chart of Accounts, or tick "Offer accounts of every type".
                          </div>
                        )}
                      </td>
                      <td className={cn('py-1 px-2 border-r border-[#f0f0f0]', !def.live && 'text-gray-400 italic')}>{def.usedBy}</td>
                      <td className="text-center">
                        {mapped && (
                          <button onClick={() => window.confirm(`Clear ${current.area}/${def.key}?`) && clearMut.mutate(mapped.id)} title="Clear mapping">
                            <Eraser className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
