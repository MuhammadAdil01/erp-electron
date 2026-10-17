import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, Check, RotateCcw, Settings, X, AlertCircle, Lock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { coaDrawersApi, type AccountType, type CoaDrawerConfig } from '../../../api/financials.api';
import { ClassicInput } from '../../ui/ClassicERPUI';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentDrawers: CoaDrawerConfig[];
  onSaved?: (newDrawers: CoaDrawerConfig[]) => void;
}

const DEFAULT_DRAWERS: CoaDrawerConfig[] = [
  { type: 'ASSET', code: '10', label: 'Assets', visible: true, order: 0 },
  { type: 'LIABILITY', code: '20', label: 'Liabilities', visible: true, order: 1 },
  { type: 'EQUITY', code: '30', label: 'Equity', visible: true, order: 2 },
  { type: 'INCOME', code: '40', label: 'Turnover', visible: true, order: 3 },
  { type: 'EXPENSE', code: '50', label: 'Cost of Sales', visible: true, order: 4 },
];

const TYPE_DESCRIPTIONS: Record<AccountType, string> = {
  ASSET: 'Assets & Resources',
  LIABILITY: 'Liabilities & Obligations',
  EQUITY: 'Capital & Retained Earnings',
  INCOME: 'Revenues & Operating Turnover',
  EXPENSE: 'Cost of Sales & Operating Expenses',
};

export const ConfigureCoaDrawersModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentDrawers,
  onSaved,
}) => {
  const { activeCompanyId } = useAuth();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CoaDrawerConfig[]>([]);
  const [lockedCodes, setLockedCodes] = useState<Set<AccountType>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      const locked = new Set<AccountType>();
      const map = new Map(currentDrawers.map((d) => [d.type, d]));

      const fullList = DEFAULT_DRAWERS.map((def, idx) => {
        const found = map.get(def.type);
        if (found?.code && /^\d{2}$/.test(found.code)) {
          locked.add(def.type);
        }
        return {
          type: def.type,
          code: (found?.code || def.code).trim(),
          label: (found?.label || def.label).trim(),
          visible: found ? found.visible : true,
          order: found ? found.order : idx,
        };
      });

      fullList.sort((a, b) => a.order - b.order);
      setItems(fullList);
      setLockedCodes(locked);
    }
  }, [isOpen, currentDrawers]);

  const saveMutation = useMutation({
    mutationFn: (drawers: CoaDrawerConfig[]) => coaDrawersApi.set(drawers),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['coa-drawers', activeCompanyId] });
      if (onSaved) onSaved(saved);
      onClose();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || err.message || 'Failed to save drawer settings');
    },
  });

  if (!isOpen) return null;

  const handleCodeChange = (index: number, newCode: string) => {
    setError(null);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], code: newCode };
      return copy;
    });
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    setError(null);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], label: newLabel };
      return copy;
    });
  };

  const handleVisibleToggle = (index: number) => {
    setError(null);
    setItems((prev) => {
      const copy = [...prev];
      const willBeVisible = !copy[index].visible;
      if (!willBeVisible) {
        const remainingVisible = copy.filter((c, i) => i !== index && c.visible).length;
        if (remainingVisible === 0) {
          setError('At least one drawer must remain visible.');
          return prev;
        }
      }
      copy[index] = { ...copy[index], visible: willBeVisible };
      return copy;
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    setError(null);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((item, idx) => ({ ...item, order: idx }));
    });
  };

  const handleResetDefaults = () => {
    setError(null);
    setItems((prev) =>
      DEFAULT_DRAWERS.map((d, idx) => {
        const existing = prev.find((p) => p.type === d.type);
        const isLocked = lockedCodes.has(d.type);
        return {
          ...d,
          code: isLocked && existing ? existing.code : d.code,
          order: idx,
        };
      }),
    );
  };

  const handleSave = () => {
    // 1. Validate codes
    const seenCodes = new Set<string>();
    for (const item of items) {
      const code = item.code.trim();
      if (!/^\d{2}$/.test(code)) {
        setError(`Drawer code for "${item.type}" must be exactly two digits (01-99).`);
        return;
      }
      if (seenCodes.has(code)) {
        setError(`Duplicate drawer code "${code}". Every drawer must have a unique 2-digit code.`);
        return;
      }
      seenCodes.add(code);
    }

    // 2. Validate labels
    const empty = items.find((i) => !i.label.trim());
    if (empty) {
      setError(`Drawer label for ${empty.type} cannot be blank.`);
      return;
    }
    const tooLong = items.find((i) => i.label.trim().length > 40);
    if (tooLong) {
      setError(`Drawer label for ${tooLong.type} exceeds 40 characters.`);
      return;
    }

    // 3. Validate at least one visible
    const visibleCount = items.filter((i) => i.visible).length;
    if (visibleCount === 0) {
      setError('At least one drawer must remain visible.');
      return;
    }

    const payload = items.map((item, idx) => ({
      type: item.type,
      code: item.code.trim(),
      label: item.label.trim(),
      visible: item.visible,
      order: idx,
    }));

    saveMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs select-none">
      <div className="w-[620px] bg-[#ececec] border-2 border-[#0055ea] shadow-2xl rounded-[3px] flex flex-col overflow-hidden text-[11px] font-sans">
        {/* Title Bar */}
        <div className="h-[26px] bg-gradient-to-r from-[#0055ea] to-[#4080ff] px-2 flex items-center justify-between text-white font-bold shrink-0">
          <div className="flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            <span>Customize Chart of Accounts Drawers</span>
          </div>
          <button
            onClick={onClose}
            className="w-4 h-4 rounded-[2px] bg-red-600 hover:bg-red-700 flex items-center justify-center text-white text-[10px]"
          >
            ✕
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-3 py-2 bg-[#f4f7fb] border-b border-[#c5d5e5] text-gray-700 text-[10.5px] leading-relaxed">
          Assign each drawer a <strong>2-digit root code</strong> (e.g. 10 for Assets, 30 for Equity).
          Once saved, drawer codes become <strong>permanently locked</strong> and immutable.
          Tab names can be customized at any time.
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-3 mt-2 p-2 bg-[#ffebeb] border border-red-300 text-red-700 rounded-[2px] flex items-center gap-1.5 text-[10.5px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table Body */}
        <div className="p-3 overflow-y-auto max-h-[380px]">
          <table className="w-full border-collapse border border-[#b4b4b4] bg-white text-[10.5px]">
            <thead>
              <tr className="bg-[#e4e4e4] border-b border-[#b4b4b4] text-[#333] font-semibold text-left">
                <th className="p-1.5 w-10 text-center border-r border-[#ccc]">#</th>
                <th className="p-1.5 w-24 border-r border-[#ccc]">System Type</th>
                <th className="p-1.5 w-20 text-center border-r border-[#ccc]">Code (2D)</th>
                <th className="p-1.5 border-r border-[#ccc]">Company Tab Label</th>
                <th className="p-1.5 w-14 text-center border-r border-[#ccc]">Visible</th>
                <th className="p-1.5 w-16 text-center">Move</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => {
                const isLocked = lockedCodes.has(row.type);
                return (
                  <tr
                    key={row.type}
                    className={`border-b border-[#e0e0e0] hover:bg-[#f9f9f9] ${
                      !row.visible ? 'opacity-60 bg-[#f5f5f5]' : ''
                    }`}
                  >
                    {/* Order */}
                    <td className="p-1.5 text-center font-bold text-gray-500 border-r border-[#e0e0e0]">
                      {idx + 1}
                    </td>

                    {/* System Type */}
                    <td className="p-1.5 border-r border-[#e0e0e0]">
                      <div className="font-bold text-[#1a3a6b]">{row.type}</div>
                      <div className="text-[9px] text-gray-400 truncate" title={TYPE_DESCRIPTIONS[row.type]}>
                        {TYPE_DESCRIPTIONS[row.type]}
                      </div>
                    </td>

                    {/* Drawer Code (2 digits) */}
                    <td className="p-1.5 text-center border-r border-[#e0e0e0]">
                      {isLocked ? (
                        <div
                          className="inline-flex items-center justify-center gap-1 font-mono font-bold text-[#1a3a6b] bg-[#eef3fc] border border-[#b8ccee] px-2 py-0.5 rounded-[2px]"
                          title="Drawer code is permanently locked for this company"
                        >
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span>{row.code}</span>
                        </div>
                      ) : (
                        <ClassicInput
                          value={row.code}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^\d]/g, '').slice(0, 2);
                            handleCodeChange(idx, val);
                          }}
                          placeholder="10"
                          maxLength={2}
                          className="w-14 font-mono font-bold text-center mx-auto"
                          title="Enter 2-digit code for this drawer"
                        />
                      )}
                    </td>

                    {/* Label Input */}
                    <td className="p-1.5 border-r border-[#e0e0e0]">
                      <ClassicInput
                        value={row.label}
                        onChange={(e) => handleLabelChange(idx, e.target.value)}
                        maxLength={40}
                        className="w-full font-medium"
                        placeholder={DEFAULT_DRAWERS.find((d) => d.type === row.type)?.label}
                      />
                    </td>

                    {/* Visible Checkbox */}
                    <td className="p-1.5 text-center border-r border-[#e0e0e0]">
                      <input
                        type="checkbox"
                        checked={row.visible}
                        onChange={() => handleVisibleToggle(idx)}
                        className="cursor-pointer w-4 h-4 accent-[#0055ea]"
                        title="Show or hide this drawer tab"
                      />
                    </td>

                    {/* Move Up / Down Buttons */}
                    <td className="p-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => moveItem(idx, 'up')}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1 bg-[#f0f0f0] hover:bg-[#e0e0e0] disabled:opacity-30 border border-gray-400 rounded-[2px]"
                        >
                          <ArrowUp className="w-3 h-3 text-gray-700" />
                        </button>
                        <button
                          onClick={() => moveItem(idx, 'down')}
                          disabled={idx === items.length - 1}
                          title="Move Down"
                          className="p-1 bg-[#f0f0f0] hover:bg-[#e0e0e0] disabled:opacity-30 border border-gray-400 rounded-[2px]"
                        >
                          <ArrowDown className="w-3 h-3 text-gray-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-3 p-2 bg-[#f8f9fa] border border-[#d8d8d8] rounded-[2px] text-[10px] text-gray-600 space-y-1">
            <div className="font-semibold text-gray-700">Drawer Architecture & Code Rules:</div>
            <div>• <strong>Level 1 Roots:</strong> The 2-digit drawer code (e.g. <code>30</code>) serves as the top-level parent prefix for all accounts created under that drawer.</div>
            <div>• <strong>Child Account Flow:</strong> Level 2 accounts become <code>3010</code>, Level 3 become <code>301001</code>, Level 4 become <code>30100101</code>.</div>
            <div>• <strong>Permanent Immutability:</strong> Once saved, drawer codes cannot be renumbered or changed.</div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="h-[42px] px-3 bg-[#e4e4e4] border-t border-[#b4b4b4] flex items-center justify-between shrink-0">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 px-2.5 py-1 text-[10.5px] bg-white hover:bg-gray-100 border border-gray-400 rounded-[2px] shadow-xs text-gray-700"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restore Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1 px-4 py-1 text-[11px] font-bold bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner text-gray-900 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saveMutation.isPending ? 'Saving…' : 'Save Changes'}</span>
            </button>
            <button
              onClick={onClose}
              disabled={saveMutation.isPending}
              className="px-3 py-1 text-[10.5px] bg-[#f8f8f8] hover:bg-[#ececec] border border-gray-400 rounded-[2px] shadow-xs text-gray-700 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
