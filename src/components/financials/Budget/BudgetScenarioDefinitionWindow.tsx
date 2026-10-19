import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Printer,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  budgetScenariosApi,
  budgetDistributionMethodsApi,
  budgetLinesApi,
  accountsApi,
  coaDrawersApi,
  type BudgetScenario,
  type BudgetDistributionMethod,
  type BudgetLine,
  type Account,
  type AccountType,
} from '../../../api/financials.api';
import { useAuth } from '../../../context/AuthContext';
import { ClassicWindow, type WindowState } from '../../ui/ClassicWindow';
import { YellowBtn, GreyBtn, ClassicInput, cn } from '../../ui/ClassicERPUI';
import { renderDocuments, printHtml } from '../Documents/documentPrintingOutput';
import type { WindowType } from '../../../types/window';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
  onOpenWindow?: (type: WindowType, title?: string) => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface AccountBudgetDraft {
  accountId: string;
  isBudgeted: boolean;
  annualDebit: number;
  annualCredit: number;
  distributionMethodId?: string;
  costCenterId?: string;
}

export const BudgetScenarioDefinitionWindow: React.FC<Props> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
  onOpenWindow,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [activeDrawer, setActiveDrawer] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [defaultMethodId, setDefaultMethodId] = useState<string>('');

  // Local draft of budget lines: Map<accountId, AccountBudgetDraft>
  const [drafts, setDrafts] = useState<Map<string, AccountBudgetDraft>>(new Map());
  const [isDirty, setIsDirty] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Monthly breakdown viewer state
  const [breakdownAccount, setBreakdownAccount] = useState<Account | null>(null);

  // 1. Load Scenarios
  const { data: scenarios = [] } = useQuery({
    queryKey: ['budget-scenarios', activeCompanyId],
    queryFn: () => budgetScenariosApi.getAll(),
    enabled: !!activeCompanyId,
  });

  // Set default scenario
  useEffect(() => {
    if (scenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(scenarios[0].id);
    }
  }, [scenarios, selectedScenarioId]);

  const activeScenario = useMemo(() => {
    return scenarios.find((s) => s.id === selectedScenarioId) ?? scenarios[0] ?? null;
  }, [scenarios, selectedScenarioId]);

  // 2. Load Distribution Methods
  const { data: methods = [] } = useQuery({
    queryKey: ['budget-distribution-methods', activeCompanyId],
    queryFn: () => budgetDistributionMethodsApi.getAll(),
    enabled: !!activeCompanyId,
  });

  useEffect(() => {
    if (methods.length > 0 && !defaultMethodId) {
      setDefaultMethodId(methods[0].id);
    }
  }, [methods, defaultMethodId]);

  // 3. Load COA Drawers
  const { data: drawers = [] } = useQuery({
    queryKey: ['coa-drawers', activeCompanyId],
    queryFn: () => coaDrawersApi.get(),
    enabled: !!activeCompanyId,
  });

  // 4. Load Accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts-all', activeCompanyId],
    queryFn: () => accountsApi.getAll({ take: 3000, isActive: true }),
    enabled: !!activeCompanyId,
  });

  // 5. Load Actual Balances
  const { data: balances = [] } = useQuery({
    queryKey: ['account-balances', activeCompanyId],
    queryFn: () => accountsApi.balances(),
    enabled: !!activeCompanyId,
  });

  const balanceByAccount = useMemo(() => {
    return new Map(balances.map((b) => [b.accountId, b.balance]));
  }, [balances]);

  // 6. Load Saved Budget Lines for current scenario
  const { data: savedLines = [], refetch: refetchLines } = useQuery({
    queryKey: ['budget-lines', activeCompanyId, selectedScenarioId],
    queryFn: () => (selectedScenarioId ? budgetLinesApi.byScenario(selectedScenarioId) : []),
    enabled: !!activeCompanyId && !!selectedScenarioId,
  });

  // Initialize draft lines from saved lines whenever scenario or savedLines change
  useEffect(() => {
    const nextMap = new Map<string, AccountBudgetDraft>();
    for (const l of savedLines) {
      nextMap.set(l.accountId, {
        accountId: l.accountId,
        isBudgeted: true,
        annualDebit: Number(l.annualDebit) || 0,
        annualCredit: Number(l.annualCredit) || 0,
        distributionMethodId: l.distributionMethodId || defaultMethodId,
        costCenterId: l.costCenterId || undefined,
      });
    }
    setDrafts(nextMap);
    setIsDirty(false);
    setStatusMsg('');
    setErrorMsg('');
  }, [savedLines, defaultMethodId]);

  // Bulk save mutation
  const saveMutation = useMutation({
    mutationFn: (payload: { scenarioId: string; lines: any[] }) => budgetLinesApi.bulkSave(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-lines'] });
      setIsDirty(false);
      setStatusMsg('Budget allocations saved successfully.');
      setErrorMsg('');
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || err.message || 'Save failed'),
  });

  // Handlers for grid edits
  const handleToggleBudgeted = (accId: string, currentChecked: boolean) => {
    setDrafts((prev) => {
      const next = new Map(prev);
      const existing = next.get(accId);
      if (!currentChecked) {
        next.set(accId, {
          accountId: accId,
          isBudgeted: true,
          annualDebit: existing?.annualDebit || 0,
          annualCredit: existing?.annualCredit || 0,
          distributionMethodId: existing?.distributionMethodId || defaultMethodId,
        });
      } else {
        if (existing) {
          next.set(accId, {
            ...existing,
            isBudgeted: false,
            annualDebit: 0,
            annualCredit: 0,
          });
        }
      }
      return next;
    });
    setIsDirty(true);
  };

  const handleDebitChange = (accId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setDrafts((prev) => {
      const next = new Map(prev);
      const existing = next.get(accId);
      next.set(accId, {
        accountId: accId,
        isBudgeted: true,
        annualDebit: num,
        annualCredit: existing?.annualCredit || 0,
        distributionMethodId: existing?.distributionMethodId || defaultMethodId,
      });
      return next;
    });
    setIsDirty(true);
  };

  const handleCreditChange = (accId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setDrafts((prev) => {
      const next = new Map(prev);
      const existing = next.get(accId);
      next.set(accId, {
        accountId: accId,
        isBudgeted: true,
        annualDebit: existing?.annualDebit || 0,
        annualCredit: num,
        distributionMethodId: existing?.distributionMethodId || defaultMethodId,
      });
      return next;
    });
    setIsDirty(true);
  };

  const handleMethodChange = (accId: string, methodId: string) => {
    setDrafts((prev) => {
      const next = new Map(prev);
      const existing = next.get(accId);
      next.set(accId, {
        accountId: accId,
        isBudgeted: existing?.isBudgeted ?? true,
        annualDebit: existing?.annualDebit || 0,
        annualCredit: existing?.annualCredit || 0,
        distributionMethodId: methodId,
      });
      return next;
    });
    setIsDirty(true);
  };

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (acc.isTitle) return false; // Budgets allocate to active leaf accounts
      if (activeDrawer !== 'ALL' && acc.type !== activeDrawer) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return acc.code.toLowerCase().includes(q) || acc.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [accounts, activeDrawer, search]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    let count = 0;
    drafts.forEach((d) => {
      if (d.isBudgeted && (d.annualDebit > 0 || d.annualCredit > 0)) {
        totalDebit += d.annualDebit;
        totalCredit += d.annualCredit;
        count++;
      }
    });
    return { totalDebit, totalCredit, count };
  }, [drafts]);

  const handleSave = () => {
    if (!selectedScenarioId) {
      setErrorMsg('Please select a Budget Scenario.');
      return;
    }
    const linesToSave: any[] = [];
    drafts.forEach((d) => {
      if (d.isBudgeted && (d.annualDebit > 0 || d.annualCredit > 0)) {
        linesToSave.push({
          accountId: d.accountId,
          annualDebit: d.annualDebit,
          annualCredit: d.annualCredit,
          distributionMethodId: d.distributionMethodId || defaultMethodId,
        });
      }
    });

    saveMutation.mutate({
      scenarioId: selectedScenarioId,
      lines: linesToSave,
    });
  };

  // Direct print trigger using Document Printing layout
  const handlePrint = () => {
    if (!activeScenario) return;
    const linesList: string[][] = [];
    drafts.forEach((d) => {
      if (d.isBudgeted && (d.annualDebit > 0 || d.annualCredit > 0)) {
        const acc = accounts.find((a) => a.id === d.accountId);
        const m = methods.find((meth) => meth.id === d.distributionMethodId);
        linesList.push([
          acc?.code ?? '',
          acc?.name ?? '',
          d.annualDebit ? d.annualDebit.toFixed(2) : '0.00',
          d.annualCredit ? d.annualCredit.toFixed(2) : '0.00',
          m?.name ?? 'Equal',
        ]);
      }
    });

    const doc = {
      id: activeScenario.id,
      documentType: 'budget_scenario' as const,
      title: `Budget Scenario — ${activeScenario.name}`,
      number: activeScenario.code,
      postingDate: `${activeScenario.fiscalYear}-01-01`,
      dueDate: `${activeScenario.fiscalYear}-12-31`,
      reference: `Fiscal Year: ${activeScenario.fiscalYear}`,
      remarks: activeScenario.name,
      currency: 'USD',
      status: activeScenario.isActive ? 'ACTIVE' : 'INACTIVE',
      isDraft: false,
      isCancelled: false,
      printCount: 0,
      partner: null,
      columns: ['Account Code', 'Account Name', 'Annual Debit', 'Annual Credit', 'Distribution Method'],
      lines: linesList,
      totals: [
        { label: 'Total Budgeted Debit', value: stats.totalDebit.toFixed(2) },
        { label: 'Total Budgeted Credit', value: stats.totalCredit.toFixed(2) },
      ],
    };

    const html = renderDocuments([doc], {
      companyName: activeScenario.name || 'Company Budget',
      copies: 1,
      preferences: {},
      useLayoutSettings: false,
    });
    printHtml(html);
  };

  return (
    <ClassicWindow
      title="Budget - Definition and Allocation"
      accent="#e8a01c"
      windowState={windowState}
      onClose={onClose}
      onFocus={onFocus}
      onUpdateState={onUpdateState}
      minWidth={940}
      minHeight={560}
    >
      <div className="flex flex-col flex-1 bg-[#f0f0f0] select-none text-[11px] overflow-hidden">
        
        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#e0ded8] px-3 pt-1 border-b border-gray-400 shrink-0">
          <button
            className="px-3 py-1 text-[11px] font-bold rounded-t bg-[#f0f0f0] text-gray-900 border-t border-l border-r border-gray-400 -mb-[1px] z-10"
          >
            Budget Allocation
          </button>
          <button
            onClick={() => onOpenWindow?.('budgetScenarios')}
            className="px-3 py-1 text-[11px] font-medium rounded-t bg-gray-200 text-gray-700 hover:bg-gray-100 border-t border-l border-r border-gray-400"
          >
            Budget Scenarios
          </button>
          <button
            onClick={() => onOpenWindow?.('budgetDistributionMethods')}
            className="px-3 py-1 text-[11px] font-medium rounded-t bg-gray-200 text-gray-700 hover:bg-gray-100 border-t border-l border-r border-gray-400"
          >
            Distribution Methods
          </button>
        </div>

        {/* Global Controls & Summary Strip */}
        <div className="p-3 bg-[#fdfdfd] border-b border-gray-300 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-4">
            
            {/* Scenario Picker */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Budget Scenario:</span>
              <select
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                className="h-6 px-2 bg-[#fffde6] border border-gray-400 rounded font-bold text-blue-900 text-[11.5px] outline-none"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name} ({s.fiscalYear})
                  </option>
                ))}
              </select>
              <button
                onClick={() => onOpenWindow?.('budgetScenarios')}
                title="Manage Scenarios"
                className="p-1 hover:bg-gray-200 rounded border border-gray-300 text-gray-600 ml-0.5"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>

            {/* Default Method Picker */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Default Distribution:</span>
              <select
                value={defaultMethodId}
                onChange={(e) => setDefaultMethodId(e.target.value)}
                className="h-5 px-1.5 bg-white border border-gray-300 rounded text-[10.5px] outline-none"
              >
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-2.5 py-0.5 bg-white hover:bg-gray-100 border border-gray-400 rounded text-[11px] font-semibold text-purple-800 flex items-center gap-1 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> Print Preview
              </button>
              <button
                onClick={() => onOpenWindow?.('budgetReport')}
                className="px-2.5 py-0.5 bg-white hover:bg-gray-100 border border-gray-400 rounded text-[11px] font-semibold text-blue-800 flex items-center gap-1 shadow-sm"
              >
                <BarChart3 className="w-3.5 h-3.5" /> Budget Report
              </button>
            </div>
          </div>

          {/* Drawer Filter and Search */}
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-200">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveDrawer('ALL')}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[10.5px] font-medium border transition-colors',
                  activeDrawer === 'ALL'
                    ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                )}
              >
                All Accounts ({accounts.filter((a) => !a.isTitle).length})
              </button>
              {[
                { type: 'EXPENSE', label: 'Expenses' },
                { type: 'INCOME', label: 'Revenue' },
                { type: 'ASSET', label: 'Assets' },
                { type: 'LIABILITY', label: 'Liabilities' },
                { type: 'EQUITY', label: 'Equity' },
              ].map((d) => (
                <button
                  key={d.type}
                  onClick={() => setActiveDrawer(d.type)}
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10.5px] font-medium border transition-colors',
                    activeDrawer === d.type
                      ? 'bg-[#f39c12] text-white border-[#f39c12]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <input
                  type="text"
                  placeholder="Filter by Code or Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-5 pl-6 pr-2 border border-gray-400 rounded text-[10.5px] bg-white outline-none"
                />
                <Search className="w-3 h-3 text-gray-400 absolute left-1.5 top-1" />
              </div>
            </div>
          </div>

          {/* Totals Banner */}
          <div className="flex items-center justify-between px-3 py-1 bg-[#fff8e1] border border-[#ffe082] rounded text-[11px]">
            <div className="flex items-center gap-4">
              <span>
                <strong>Budgeted Accounts:</strong> {stats.count}
              </span>
              <span>
                <strong>Total Annual Debit:</strong> ${stats.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span>
                <strong>Total Annual Credit:</strong> ${stats.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {isDirty && (
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Unsaved changes in budget allocations
              </span>
            )}
          </div>
        </div>

        {statusMsg && (
          <div className="mx-4 mt-1 px-3 py-0.5 bg-green-100 border border-green-400 text-green-800 rounded text-[10.5px] flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-green-600" /> {statusMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mx-4 mt-1 px-3 py-0.5 bg-red-100 border border-red-400 text-red-800 rounded text-[10.5px] flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3 text-red-600" /> {errorMsg}
          </div>
        )}

        {/* Accounts Budget Grid */}
        <div className="flex-1 mx-4 my-2 border border-gray-400 bg-white shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400 text-[10.5px]">
                <tr>
                  <th className="px-2 py-1 border-r border-gray-300 w-8 text-center">Bgt</th>
                  <th className="px-2 py-1 border-r border-gray-300 text-left w-28">Account Code</th>
                  <th className="px-2 py-1 border-r border-gray-300 text-left">Account Name</th>
                  <th className="px-2 py-1 border-r border-gray-300 text-center w-20">Drawer</th>
                  <th className="px-2 py-1 border-r border-gray-300 text-right w-28">Annual Debit ($)</th>
                  <th className="px-2 py-1 border-r border-gray-300 text-right w-28">Annual Credit ($)</th>
                  <th className="px-2 py-1 border-r border-gray-300 text-left w-40">Distribution Method</th>
                  <th className="px-2 py-1 border-r border-gray-300 text-right w-28">Actual Balance</th>
                  <th className="px-2 py-1 text-center w-24">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-gray-500 italic">
                      {accountsLoading ? 'Loading Chart of Accounts...' : 'No accounts matching current filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc) => {
                    const draft = drafts.get(acc.id);
                    const isBudgeted = draft?.isBudgeted ?? false;
                    const balance = balanceByAccount.get(acc.id) ?? '0.00';
                    const methodId = draft?.distributionMethodId || defaultMethodId;

                    return (
                      <tr
                        key={acc.id}
                        className={cn(
                          'border-b border-gray-200 h-6.5 hover:bg-blue-50/40',
                          isBudgeted && 'bg-[#fffde6]/50'
                        )}
                      >
                        <td className="border-r border-gray-200 text-center">
                          <input
                            type="checkbox"
                            checked={isBudgeted}
                            onChange={() => handleToggleBudgeted(acc.id, isBudgeted)}
                            className="w-3.5 h-3.5 cursor-pointer accent-[#f39c12]"
                          />
                        </td>
                        <td className="border-r border-gray-200 px-2 font-mono font-bold text-gray-800 text-[10.5px]">
                          {acc.code}
                        </td>
                        <td className="border-r border-gray-200 px-2 font-medium text-gray-800 truncate">
                          {acc.name}
                        </td>
                        <td className="border-r border-gray-200 px-2 text-center text-[9.5px]">
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded font-bold',
                              acc.type === 'EXPENSE' && 'bg-rose-100 text-rose-700',
                              acc.type === 'INCOME' && 'bg-emerald-100 text-emerald-700',
                              acc.type === 'ASSET' && 'bg-blue-100 text-blue-700',
                              acc.type === 'LIABILITY' && 'bg-amber-100 text-amber-700',
                              acc.type === 'EQUITY' && 'bg-purple-100 text-purple-700'
                            )}
                          >
                            {acc.type}
                          </span>
                        </td>
                        <td className="border-r border-gray-200 px-1 text-right">
                          <input
                            type="number"
                            step="0.01"
                            disabled={!isBudgeted}
                            value={draft?.annualDebit !== undefined ? draft.annualDebit : ''}
                            onChange={(e) => handleDebitChange(acc.id, e.target.value)}
                            placeholder="0.00"
                            className={cn(
                              'w-full h-5 px-1 text-right font-mono text-[10.5px] border border-transparent rounded outline-none focus:border-blue-500 focus:bg-white',
                              isBudgeted ? 'bg-[#fffae6] font-semibold text-gray-900 border-gray-300' : 'bg-transparent text-gray-400 cursor-not-allowed'
                            )}
                          />
                        </td>
                        <td className="border-r border-gray-200 px-1 text-right">
                          <input
                            type="number"
                            step="0.01"
                            disabled={!isBudgeted}
                            value={draft?.annualCredit !== undefined ? draft.annualCredit : ''}
                            onChange={(e) => handleCreditChange(acc.id, e.target.value)}
                            placeholder="0.00"
                            className={cn(
                              'w-full h-5 px-1 text-right font-mono text-[10.5px] border border-transparent rounded outline-none focus:border-blue-500 focus:bg-white',
                              isBudgeted ? 'bg-[#fffae6] font-semibold text-gray-900 border-gray-300' : 'bg-transparent text-gray-400 cursor-not-allowed'
                            )}
                          />
                        </td>
                        <td className="border-r border-gray-200 px-1">
                          <select
                            disabled={!isBudgeted}
                            value={methodId}
                            onChange={(e) => handleMethodChange(acc.id, e.target.value)}
                            className="w-full h-5 bg-white border border-gray-300 rounded text-[10px] outline-none disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            {methods.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.code} - {m.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border-r border-gray-200 px-2 text-right font-mono text-gray-700 text-[10.5px]">
                          ${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-1 text-center">
                          <button
                            disabled={!isBudgeted}
                            onClick={() => setBreakdownAccount(acc)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 border border-gray-300 text-blue-700 disabled:opacity-40 flex items-center justify-center gap-1 mx-auto"
                          >
                            <Eye className="w-3 h-3 text-blue-600" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="h-5 bg-[#e5e5e5] border-t border-gray-400 flex items-center justify-between px-3 text-[10px] text-gray-600 shrink-0">
            <span>Showing {filteredAccounts.length} postable account(s)</span>
            <span>Scenario: {activeScenario?.name ?? 'None'} ({activeScenario?.fiscalYear})</span>
          </div>
        </div>

        {/* Monthly Breakdown Modal */}
        {breakdownAccount && (() => {
          const draft = drafts.get(breakdownAccount.id);
          const method = methods.find((m) => m.id === (draft?.distributionMethodId || defaultMethodId));
          const ratios = Array.isArray(method?.monthlyRatios) && method.monthlyRatios.length === 12
            ? method.monthlyRatios.map(Number)
            : Array(12).fill(100 / 12);

          const debit = draft?.annualDebit || 0;
          const credit = draft?.annualCredit || 0;

          return (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
              <div className="bg-white border-2 border-[#1a3a6b] rounded shadow-2xl w-[520px] p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <span className="font-bold text-[#1a3a6b] text-[13px] block">
                      Monthly Budget Breakdown: {breakdownAccount.code} — {breakdownAccount.name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Method: {method?.name ?? 'Equal'} · Annual Debit: ${debit.toFixed(2)} · Annual Credit: ${credit.toFixed(2)}
                    </span>
                  </div>
                  <button onClick={() => setBreakdownAccount(null)} className="text-gray-400 hover:text-gray-700">✕</button>
                </div>

                <div className="border border-gray-300 rounded overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full border-collapse text-[11px]">
                    <thead className="bg-[#e5e5e5] border-b text-gray-700">
                      <tr>
                        <th className="px-2 py-1 text-center w-10">Month</th>
                        <th className="px-3 py-1 text-left">Period</th>
                        <th className="px-2 py-1 text-right w-20">Factor (%)</th>
                        <th className="px-3 py-1 text-right w-28">Allocated Debit</th>
                        <th className="px-3 py-1 text-right w-28">Allocated Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratios.map((r, i) => {
                        const mDebit = (debit * (r / 100)).toFixed(2);
                        const mCredit = (credit * (r / 100)).toFixed(2);
                        return (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 h-6">
                            <td className="text-center font-mono text-gray-500 text-[10px]">{i + 1}</td>
                            <td className="px-3 text-gray-800 font-medium">{MONTH_NAMES[i]} {activeScenario?.fiscalYear}</td>
                            <td className="px-2 text-right font-mono text-gray-600">{r.toFixed(2)}%</td>
                            <td className="px-3 text-right font-mono font-semibold text-gray-900">${mDebit}</td>
                            <td className="px-3 text-right font-mono font-semibold text-gray-900">${mCredit}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <GreyBtn onClick={() => setBreakdownAccount(null)}>Close</GreyBtn>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-300 bg-[#f0f0f0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <YellowBtn onClick={handleSave}>
              {saveMutation.isPending ? 'Saving...' : 'Save Budget'}
            </YellowBtn>
            <GreyBtn onClick={onClose}>Close</GreyBtn>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenWindow?.('chartOfAccounts')}
              className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-400 rounded text-[11px] font-semibold text-gray-700 shadow-sm"
            >
              Chart of Accounts
            </button>
            <button
              onClick={() => onOpenWindow?.('documentPrinting')}
              className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-400 rounded text-[11px] font-semibold text-gray-700 shadow-sm"
            >
              Document Printing
            </button>
            <button
              onClick={() => onOpenWindow?.('budgetReport')}
              className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-400 rounded text-[11px] font-semibold text-blue-800 shadow-sm"
            >
              View Budget vs Actual
            </button>
          </div>
        </div>

      </div>
    </ClassicWindow>
  );
};
