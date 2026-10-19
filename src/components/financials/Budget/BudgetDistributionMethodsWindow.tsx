import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { budgetDistributionMethodsApi, type BudgetDistributionMethod } from '../../../api/financials.api';
import { useAuth } from '../../../context/AuthContext';
import { ClassicWindow, type WindowState } from '../../ui/ClassicWindow';
import { YellowBtn, GreyBtn, ClassicInput, cn } from '../../ui/ClassicERPUI';
import type { WindowType } from '../../../types/window';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
  onOpenWindow?: (type: WindowType, title?: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EQUAL_RATIOS = [8.33, 8.33, 8.34, 8.33, 8.33, 8.34, 8.33, 8.33, 8.34, 8.33, 8.33, 8.34];

export const BudgetDistributionMethodsWindow: React.FC<Props> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
  onOpenWindow,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Form states
  const [code, setCode] = useState('EQUAL');
  const [name, setName] = useState('Equal Distribution');
  const [isActive, setIsActive] = useState(true);
  const [ratios, setRatios] = useState<number[]>(EQUAL_RATIOS);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const { data: methods = [], isLoading, refetch } = useQuery({
    queryKey: ['budget-distribution-methods', activeCompanyId],
    queryFn: () => budgetDistributionMethodsApi.getAll(),
    enabled: !!activeCompanyId,
  });

  const selectedMethod = useMemo(() => {
    return methods.find((m) => m.id === selectedId) ?? methods[0] ?? null;
  }, [methods, selectedId]);

  // Sync selection with form
  useEffect(() => {
    if (selectedMethod && !isNew) {
      setSelectedId(selectedMethod.id);
      setCode(selectedMethod.code);
      setName(selectedMethod.name);
      setIsActive(selectedMethod.isActive);
      const parsedRatios = Array.isArray(selectedMethod.monthlyRatios) && selectedMethod.monthlyRatios.length === 12
        ? selectedMethod.monthlyRatios.map(Number)
        : EQUAL_RATIOS;
      setRatios(parsedRatios);
      setError('');
      setStatusMsg('');
    } else if (methods.length === 0 && !isNew) {
      handleOpenNew();
    }
  }, [selectedMethod, isNew, methods.length]);

  const totalRatio = useMemo(() => {
    return ratios.reduce((sum, r) => sum + (Number(r) || 0), 0);
  }, [ratios]);

  const isTotalValid = Math.abs(totalRatio - 100) < 0.05;

  const handleRatioChange = (index: number, val: string) => {
    const numVal = parseFloat(val) || 0;
    const next = [...ratios];
    next[index] = numVal;
    setRatios(next);
  };

  const handleEqualize = () => {
    setRatios([...EQUAL_RATIOS]);
    setStatusMsg('Ratios equalized across 12 periods (100.00%).');
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => budgetDistributionMethodsApi.create(data),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['budget-distribution-methods'] });
      setIsNew(false);
      setSelectedId(res?.id || null);
      setStatusMsg('Method created successfully.');
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || err.message || 'Creation failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      budgetDistributionMethodsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-distribution-methods'] });
      setStatusMsg('Method saved successfully.');
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetDistributionMethodsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-distribution-methods'] });
      setIsNew(false);
      setSelectedId(null);
      setStatusMsg('Method removed.');
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || err.message || 'Delete failed'),
  });

  const handleOpenNew = () => {
    setIsNew(true);
    setSelectedId(null);
    setCode('');
    setName('');
    setIsActive(true);
    setRatios([...EQUAL_RATIOS]);
    setError('');
    setStatusMsg('');
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      setError('Method code and name are required.');
      return;
    }
    if (!isTotalValid) {
      setError(`Monthly ratios total ${totalRatio.toFixed(2)}%, but must equal exactly 100.00%.`);
      return;
    }

    if (isNew) {
      createMutation.mutate({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        monthlyRatios: ratios,
        isActive,
      });
    } else if (selectedMethod) {
      updateMutation.mutate({
        id: selectedMethod.id,
        data: {
          name: name.trim(),
          monthlyRatios: ratios,
          isActive,
        },
      });
    }
  };

  return (
    <ClassicWindow
      title="Budget Distribution Methods - Setup"
      accent="#f39c12"
      windowState={windowState}
      onClose={onClose}
      onFocus={onFocus}
      onUpdateState={onUpdateState}
      minWidth={680}
      minHeight={480}
    >
      <div className="flex flex-col flex-1 bg-[#f0f0f0] select-none text-[11px] overflow-hidden">
        
        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#e0ded8] px-3 pt-1 border-b border-gray-400 shrink-0">
          <button
            onClick={() => onOpenWindow?.('budget')}
            className="px-3 py-1 text-[11px] font-medium rounded-t bg-gray-200 text-gray-700 hover:bg-gray-100 border-t border-l border-r border-gray-400"
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
            className="px-3 py-1 text-[11px] font-bold rounded-t bg-[#f0f0f0] text-gray-900 border-t border-l border-r border-gray-400 -mb-[1px] z-10"
          >
            Distribution Methods
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-gray-300 bg-[#f9f9f9] shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNew}
              className="px-2.5 py-0.5 bg-gradient-to-b from-white to-gray-200 border border-gray-400 rounded-[2px] font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3 h-3 text-green-600" /> New Method
            </button>
            <button
              onClick={() => refetch()}
              title="Refresh"
              className="p-1 hover:bg-gray-200 rounded border border-gray-300 text-gray-600"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-2 py-0.5 rounded font-mono font-bold text-[11px] flex items-center gap-1 border',
                isTotalValid
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              )}
            >
              {isTotalValid ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
              Total: {totalRatio.toFixed(2)}% {isTotalValid ? '(Valid)' : '(Must be 100%)'}
            </span>
            <button
              onClick={handleEqualize}
              className="px-2.5 py-0.5 bg-gradient-to-b from-white to-gray-200 border border-gray-400 rounded-[2px] font-semibold text-gray-700 hover:bg-gray-100 text-[10.5px] shadow-sm"
            >
              Equalize (8.33%)
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-2 px-3 py-1 bg-red-100 border border-red-400 text-red-700 rounded text-[11px] shrink-0">
            {error}
          </div>
        )}
        {statusMsg && !error && (
          <div className="mx-4 mt-2 px-3 py-1 bg-green-100 border border-green-400 text-green-700 rounded text-[11px] shrink-0">
            {statusMsg}
          </div>
        )}

        {/* Master / Detail Split Body */}
        <div className="flex flex-1 mx-4 my-2 gap-3 overflow-hidden" style={{ minHeight: 0 }}>
          
          {/* Left: Methods List */}
          <div className="w-56 border border-gray-400 bg-white shadow-sm flex flex-col shrink-0">
            <div className="bg-[#e5e5e5] px-2 py-1 font-bold text-gray-700 border-b border-gray-400 text-[10.5px]">
              Distribution Methods ({methods.length})
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              {methods.map((m) => {
                const isSel = !isNew && selectedId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setIsNew(false);
                      setSelectedId(m.id);
                    }}
                    className={cn(
                      'px-2.5 py-1.5 border-b border-gray-100 cursor-pointer flex flex-col gap-0.5',
                      isSel ? 'bg-[#fffae6] font-bold text-blue-900 border-l-4 border-l-[#f39c12]' : 'hover:bg-blue-50/50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-gray-800">{m.code}</span>
                      <span className="text-[9px] text-gray-400">{m.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <span className="text-[10px] text-gray-600 truncate">{m.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Method Definition & Monthly Ratios */}
          <div className="flex-1 border border-gray-400 bg-white shadow-sm flex flex-col p-3 gap-3 overflow-auto custom-scrollbar">
            
            {/* Header Inputs */}
            <div className="grid grid-cols-3 gap-3 pb-2 border-b border-gray-200">
              <div>
                <label className="text-[10.5px] text-gray-600 block mb-0.5 font-medium">Method Code *</label>
                <ClassicInput
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={!isNew}
                  className="w-full uppercase font-mono"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10.5px] text-gray-600 block mb-0.5 font-medium">Method Name *</label>
                <ClassicInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Monthly Ratio Table */}
            <div className="flex-1 flex flex-col">
              <span className="font-bold text-gray-700 mb-1 text-[11px]">Monthly Factor Breakdown</span>
              <div className="border border-gray-300 rounded overflow-hidden flex-1 flex flex-col">
                <table className="w-full border-collapse">
                  <thead className="bg-[#e5e5e5] border-b border-gray-300 text-gray-700 text-[10px]">
                    <tr>
                      <th className="px-2 py-1 border-r border-gray-300 text-center w-12">#</th>
                      <th className="px-3 py-1 border-r border-gray-300 text-left">Period / Month</th>
                      <th className="px-3 py-1 text-right w-32">Percentage Factor (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratios.map((r, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 h-6">
                        <td className="border-r border-gray-200 bg-gray-50 text-center font-mono text-gray-500 text-[10px]">
                          {i + 1}
                        </td>
                        <td className="border-r border-gray-200 px-3 text-gray-800 font-medium">
                          {MONTH_NAMES[i]}
                        </td>
                        <td className="px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={r}
                            onChange={(e) => handleRatioChange(i, e.target.value)}
                            className="w-24 h-5 px-1 border border-gray-300 rounded text-right font-mono text-[10.5px] bg-[#fffde6] outline-none focus:border-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <YellowBtn onClick={handleSave}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Method'}
                </YellowBtn>
                {selectedMethod && !isNew && (
                  <GreyBtn
                    onClick={() => {
                      if (window.confirm(`Delete distribution method "${selectedMethod.name}"?`)) {
                        deleteMutation.mutate(selectedMethod.id);
                      }
                    }}
                    className="text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </GreyBtn>
                )}
              </div>
              <span className="text-[10px] text-gray-500 italic">
                Ratios are automatically applied to calculate the monthly budget breakdown.
              </span>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-300 bg-[#f0f0f0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <YellowBtn onClick={onClose}>OK</YellowBtn>
            <GreyBtn onClick={onClose}>Cancel</GreyBtn>
          </div>
          <button
            onClick={() => onOpenWindow?.('budget')}
            className="px-3 py-1 bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded text-[11px] font-bold text-gray-800 shadow hover:opacity-90 flex items-center gap-1.5"
          >
            Open Budget Allocation <ArrowRight className="w-3.5 h-3.5 text-gray-800" />
          </button>
        </div>

      </div>
    </ClassicWindow>
  );
};
