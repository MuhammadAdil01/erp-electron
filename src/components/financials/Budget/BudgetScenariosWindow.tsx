import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, Plus, Trash2, Edit2, RefreshCw, Printer, ArrowRight } from 'lucide-react';
import { budgetScenariosApi, type BudgetScenario } from '../../../api/financials.api';
import { useAuth } from '../../../context/AuthContext';
import { ClassicWindow, type WindowState } from '../../ui/ClassicWindow';
import { YellowBtn, GreyBtn, ClassicInput, ClassicSel, cn } from '../../ui/ClassicERPUI';
import type { WindowType } from '../../../types/window';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
  onOpenWindow?: (type: WindowType, title?: string) => void;
}

export const BudgetScenariosWindow: React.FC<Props> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
  onOpenWindow,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form mode: 'view' | 'new' | 'edit'
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view');
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formFiscalYear, setFormFiscalYear] = useState(currentYear);
  const [formBasedOnId, setFormBasedOnId] = useState<string>('');
  const [formInitialRatio, setFormInitialRatio] = useState<number>(100);
  const [formIsActive, setFormIsActive] = useState(true);
  const [error, setError] = useState<string>('');

  // Copy modal
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceId, setCopySourceId] = useState('');
  const [copyCode, setCopyCode] = useState('');
  const [copyName, setCopyName] = useState('');
  const [copyYear, setCopyYear] = useState(currentYear + 1);
  const [copyRatio, setCopyRatio] = useState(100);

  const { data: scenarios = [], isLoading, refetch } = useQuery({
    queryKey: ['budget-scenarios', activeCompanyId],
    queryFn: () => budgetScenariosApi.getAll(),
    enabled: !!activeCompanyId,
  });

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((s) => s.fiscalYear === selectedYear);
  }, [scenarios, selectedYear]);

  const selectedScenario = useMemo(() => {
    return scenarios.find((s) => s.id === selectedId) ?? filteredScenarios[0] ?? null;
  }, [scenarios, selectedId, filteredScenarios]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => budgetScenariosApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-scenarios'] });
      setMode('view');
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || err.message || 'Creation failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      budgetScenariosApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-scenarios'] });
      setMode('view');
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetScenariosApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-scenarios'] });
      setSelectedId(null);
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || err.message || 'Delete failed'),
  });

  const copyMutation = useMutation({
    mutationFn: (dto: { sourceScenarioId: string; code: string; name: string; fiscalYear: number; initialRatio: number }) =>
      budgetScenariosApi.copy(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-scenarios'] });
      qc.invalidateQueries({ queryKey: ['budget-lines'] });
      setShowCopyModal(false);
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || err.message || 'Copy failed'),
  });

  const handleOpenNew = () => {
    setFormCode('');
    setFormName('');
    setFormFiscalYear(selectedYear);
    setFormBasedOnId('');
    setFormInitialRatio(100);
    setFormIsActive(true);
    setMode('new');
    setError('');
  };

  const handleOpenEdit = (sc: BudgetScenario) => {
    setSelectedId(sc.id);
    setFormCode(sc.code);
    setFormName(sc.name);
    setFormFiscalYear(sc.fiscalYear);
    setFormBasedOnId(sc.basedOnScenarioId ?? '');
    setFormInitialRatio(Number(sc.initialRatio) || 100);
    setFormIsActive(sc.isActive);
    setMode('edit');
    setError('');
  };

  const handleSave = () => {
    if (!formCode.trim() || !formName.trim()) {
      setError('Scenario code and name are required.');
      return;
    }
    if (mode === 'new') {
      createMutation.mutate({
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        fiscalYear: Number(formFiscalYear),
        basedOnScenarioId: formBasedOnId || undefined,
        initialRatio: Number(formInitialRatio),
        isActive: formIsActive,
      });
    } else if (mode === 'edit' && selectedScenario) {
      updateMutation.mutate({
        id: selectedScenario.id,
        data: {
          name: formName.trim(),
          fiscalYear: Number(formFiscalYear),
          basedOnScenarioId: formBasedOnId || undefined,
          initialRatio: Number(formInitialRatio),
          isActive: formIsActive,
        },
      });
    }
  };

  const handleOpenCopy = (source?: BudgetScenario) => {
    const src = source || selectedScenario;
    if (!src) return;
    setCopySourceId(src.id);
    setCopyCode(`${src.code}_COPY`);
    setCopyName(`${src.name} (Copy)`);
    setCopyYear(src.fiscalYear + 1);
    setCopyRatio(100);
    setShowCopyModal(true);
    setError('');
  };

  return (
    <ClassicWindow
      title="Budget Scenarios - Setup"
      accent="#f39c12"
      windowState={windowState}
      onClose={onClose}
      onFocus={onFocus}
      onUpdateState={onUpdateState}
      minWidth={780}
      minHeight={450}
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
            className="px-3 py-1 text-[11px] font-bold rounded-t bg-[#f0f0f0] text-gray-900 border-t border-l border-r border-gray-400 -mb-[1px] z-10"
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

        {/* Toolbar & Filters */}
        <div className="px-4 py-2 flex items-center justify-between gap-3 border-b border-gray-300 bg-[#f9f9f9] shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Fiscal Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-5 px-2 bg-[#fffde6] border border-gray-400 rounded-[2px] font-semibold text-gray-800 text-[11px] outline-none"
            >
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <button
              onClick={() => refetch()}
              title="Refresh"
              className="p-1 hover:bg-gray-200 rounded border border-gray-300 text-gray-600 ml-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNew}
              className="px-2.5 py-0.5 bg-gradient-to-b from-white to-gray-200 border border-gray-400 rounded-[2px] font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3 h-3 text-green-600" /> New Scenario
            </button>
            <button
              disabled={!selectedScenario}
              onClick={() => handleOpenCopy()}
              className="px-2.5 py-0.5 bg-gradient-to-b from-white to-gray-200 border border-gray-400 rounded-[2px] font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1 disabled:opacity-50 shadow-sm"
            >
              <Copy className="w-3 h-3 text-blue-600" /> Copy Scenario
            </button>
            <button
              onClick={() => onOpenWindow?.('documentPrintingSelection')}
              className="px-2.5 py-0.5 bg-gradient-to-b from-white to-gray-200 border border-gray-400 rounded-[2px] font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1 shadow-sm"
            >
              <Printer className="w-3 h-3 text-purple-600" /> Document Printing
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-2 px-3 py-1 bg-red-100 border border-red-400 text-red-700 rounded text-[11px] shrink-0">
            {error}
          </div>
        )}

        {/* Form panel if in 'new' or 'edit' mode */}
        {mode !== 'view' && (
          <div className="mx-4 mt-2 p-3 bg-white border border-gray-400 shadow-sm rounded flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between border-b pb-1">
              <span className="font-bold text-[#1a3a6b]">
                {mode === 'new' ? 'New Budget Scenario' : `Edit Scenario: ${formCode}`}
              </span>
              <button onClick={() => setMode('view')} className="text-gray-400 hover:text-gray-700 text-xs">
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[10.5px] text-gray-600 block mb-0.5">Code *</label>
                <ClassicInput
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  disabled={mode === 'edit'}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-[10.5px] text-gray-600 block mb-0.5">Name *</label>
                <ClassicInput
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-[10.5px] text-gray-600 block mb-0.5">Fiscal Year</label>
                <ClassicInput
                  type="number"
                  value={formFiscalYear}
                  onChange={(e) => setFormFiscalYear(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-[10.5px] text-gray-600 block mb-0.5">Based On Scenario</label>
                <select
                  value={formBasedOnId}
                  onChange={(e) => setFormBasedOnId(e.target.value)}
                  className="w-full h-5 px-1 border border-gray-400 bg-white text-[11px]"
                >
                  <option value="">(None - Independent)</option>
                  {scenarios
                    .filter((s) => s.id !== selectedId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} ({s.fiscalYear})
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-[10.5px] text-gray-600">Initial Ratio (%):</span>
                  <ClassicInput
                    type="number"
                    value={formInitialRatio}
                    onChange={(e) => setFormInitialRatio(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                <label className="flex items-center gap-1 text-[10.5px] text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-3.5 h-3.5"
                  />
                  Active Scenario
                </label>
              </div>
              <div className="flex gap-2">
                <YellowBtn onClick={handleSave}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </YellowBtn>
                <GreyBtn onClick={() => setMode('view')}>Cancel</GreyBtn>
              </div>
            </div>
          </div>
        )}

        {/* Table of Scenarios */}
        <div className="flex-1 mx-4 my-2 border border-gray-400 bg-white shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
                <tr>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-10 text-center">#</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-left w-24">Code</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-left">Budget Name</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-center w-24">Fiscal Year</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-left w-40">Based On</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-right w-28">Ratio (%)</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-center w-20">Status</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScenarios.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-gray-500 italic">
                      No budget scenarios defined for {selectedYear}. Click "New Scenario" above.
                    </td>
                  </tr>
                ) : (
                  filteredScenarios.map((sc, i) => {
                    const isSelected = selectedId === sc.id;
                    return (
                      <tr
                        key={sc.id}
                        onClick={() => setSelectedId(sc.id)}
                        className={cn(
                          'border-b border-gray-200 h-6 cursor-pointer',
                          isSelected ? 'bg-[#fffae6]' : 'hover:bg-blue-50/50'
                        )}
                      >
                        <td className="border-r border-gray-200 bg-gray-50 text-center font-mono text-[10px] text-gray-600">
                          {i + 1}
                        </td>
                        <td className="border-r border-gray-200 px-2 font-mono font-bold text-gray-800">
                          {sc.code}
                        </td>
                        <td className="border-r border-gray-200 px-2 font-semibold text-gray-800">
                          {sc.name}
                        </td>
                        <td className="border-r border-gray-200 px-2 text-center text-gray-700 font-mono">
                          {sc.fiscalYear}
                        </td>
                        <td className="border-r border-gray-200 px-2 text-gray-600">
                          {sc.basedOn ? `${sc.basedOn.code} - ${sc.basedOn.name}` : '—'}
                        </td>
                        <td className="border-r border-gray-200 px-2 text-right font-mono text-gray-700">
                          {Number(sc.initialRatio || 100).toFixed(2)}%
                        </td>
                        <td className="border-r border-gray-200 px-2 text-center">
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[9px] font-bold',
                              sc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                            )}
                          >
                            {sc.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-2 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEdit(sc)}
                              title="Edit"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete scenario "${sc.name}"?`)) {
                                  deleteMutation.mutate(sc.id);
                                }
                              }}
                              title="Delete"
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onOpenWindow?.('budget')}
                              title="Allocate Budget"
                              className="text-amber-600 hover:text-amber-800 ml-1"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="h-5 bg-[#e5e5e5] border-t border-gray-400 flex items-center justify-between px-3 text-[10px] text-gray-600 shrink-0">
            <span>{filteredScenarios.length} scenario(s) found for {selectedYear}</span>
            <span>Total Across All Years: {scenarios.length}</span>
          </div>
        </div>

        {/* Copy Scenario Modal */}
        {showCopyModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-[#1a3a6b] rounded shadow-2xl w-[420px] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-[#1a3a6b] text-[13px] flex items-center gap-1.5">
                  <Copy className="w-4 h-4 text-blue-600" /> Copy Budget Scenario
                </span>
                <button onClick={() => setShowCopyModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <label className="text-[11px] text-gray-600 block mb-0.5 font-medium">Source Scenario</label>
                  <select
                    value={copySourceId}
                    onChange={(e) => setCopySourceId(e.target.value)}
                    className="w-full h-6 px-2 border border-gray-400 bg-gray-50 text-[11px] font-semibold"
                  >
                    {scenarios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} ({s.fiscalYear})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">New Code *</label>
                    <ClassicInput
                      value={copyCode}
                      onChange={(e) => setCopyCode(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">Target Year</label>
                    <ClassicInput
                      type="number"
                      value={copyYear}
                      onChange={(e) => setCopyYear(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-gray-600 block mb-0.5">New Scenario Name *</label>
                  <ClassicInput
                    value={copyName}
                    onChange={(e) => setCopyName(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-600 block mb-0.5">
                    Percentage Ratio (%) <span className="text-gray-400 font-normal">(100 = identical, 110 = +10%)</span>
                  </label>
                  <ClassicInput
                    type="number"
                    value={copyRatio}
                    onChange={(e) => setCopyRatio(Number(e.target.value))}
                    className="w-28"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t mt-1">
                <YellowBtn
                  onClick={() => {
                    if (!copyCode.trim() || !copyName.trim() || !copySourceId) {
                      setError('Code, name, and source are required to copy.');
                      return;
                    }
                    copyMutation.mutate({
                      sourceScenarioId: copySourceId,
                      code: copyCode.trim().toUpperCase(),
                      name: copyName.trim(),
                      fiscalYear: Number(copyYear),
                      initialRatio: Number(copyRatio),
                    });
                  }}
                  disabled={copyMutation.isPending}
                >
                  {copyMutation.isPending ? 'Copying...' : 'Execute Copy'}
                </YellowBtn>
                <GreyBtn onClick={() => setShowCopyModal(false)}>Cancel</GreyBtn>
              </div>
            </div>
          </div>
        )}

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
