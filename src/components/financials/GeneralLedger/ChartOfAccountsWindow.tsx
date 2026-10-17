import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronsDown, ChevronsUp, Landmark, Search, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { useAuth } from '../../../context/AuthContext';
import {
  accountsApi,
  coaDrawersApi,
  type Account,
  type AccountNode,
  type AccountType,
  type AccountSubtype,
  type CoaDrawerConfig,
} from '../../../api/financials.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';
import { ConfigureCoaDrawersModal } from './ConfigureCoaDrawersModal';

interface Props {
  /** WorkspaceWindows gates this window with `{wm.showChartOfAccounts && …}`. */
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

const DEFAULT_DRAWERS: CoaDrawerConfig[] = [
  { type: 'ASSET', code: '10', label: 'Assets', visible: true, order: 0 },
  { type: 'LIABILITY', code: '20', label: 'Liabilities', visible: true, order: 1 },
  { type: 'EQUITY', code: '30', label: 'Equity', visible: true, order: 2 },
  { type: 'INCOME', code: '40', label: 'Turnover', visible: true, order: 3 },
  { type: 'EXPENSE', code: '50', label: 'Cost of Sales', visible: true, order: 4 },
];

const SUBTYPES: AccountSubtype[] = [
  'CASH', 'BANK', 'ACCOUNTS_RECEIVABLE', 'ACCOUNTS_PAYABLE', 'INVENTORY',
  'FIXED_ASSET', 'CURRENT_LIABILITY', 'LONG_TERM_LIABILITY', 'TAX_PAYABLE',
  'TAX_RECOVERABLE', 'SHARE_CAPITAL', 'RETAINED_EARNINGS', 'REVENUE',
  'COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE', 'OTHER_INCOME', 'OTHER_EXPENSE',
];

const emptyForm = {
  code: '', name: '', type: 'ASSET' as AccountType, subtype: '',
  parentId: '', currency: 'USD', isTitle: false, isControl: false,
  isActive: true, description: '',
};

const pretty = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());

export const ChartOfAccountsWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const [drawer, setDrawer] = useState<AccountType>('ASSET');
  const [showDrawerConfig, setShowDrawerConfig] = useState(false);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [form, setForm] = useState(emptyForm);
  const [loadingCode, setLoadingCode] = useState(false);
  const [segmentInput, setSegmentInput] = useState('');

  // Fetch per-company drawer labels, visibility & ordering
  const { data: drawerConfigs = [] } = useQuery({
    queryKey: ['coa-drawers', activeCompanyId],
    queryFn: () => coaDrawersApi.get(),
    enabled: !!activeCompanyId,
  });

  const drawers = useMemo(() => {
    if (!drawerConfigs || drawerConfigs.length === 0) return DEFAULT_DRAWERS;
    return drawerConfigs;
  }, [drawerConfigs]);

  const visibleDrawers = useMemo(() => {
    const list = drawers.filter((d) => d.visible);
    return list.length > 0 ? list : DEFAULT_DRAWERS;
  }, [drawers]);

  // Ensure active drawer tab stays on a visible drawer
  useEffect(() => {
    if (visibleDrawers.length > 0 && !visibleDrawers.some((d) => d.type === drawer)) {
      setDrawer(visibleDrawers[0].type);
    }
  }, [visibleDrawers, drawer]);

  const crud = useCrudResource<Account>('accounts', accountsApi, {
    params: { take: 2000 },
    label: (a) => `${a.code} — ${a.name}`,
  });

  // The tree endpoint drives the left pane. Keying on the row count and the
  // last write keeps it in step with the flat list after every save.
  const { data: tree = [], isLoading: treeLoading } = useQuery({
    queryKey: ['accounts-tree', activeCompanyId, drawer, showInactive, crud.rows.length, crud.status],
    queryFn: () => accountsApi.tree({ type: drawer, includeInactive: showInactive }),
    enabled: !!activeCompanyId,
  });

  const { data: balances = [] } = useQuery({
    queryKey: ['account-balances', activeCompanyId, crud.status],
    queryFn: () => accountsApi.balances(),
    enabled: !!activeCompanyId,
  });

  const balanceByAccount = useMemo(
    () => new Map(balances.map((b) => [b.accountId, b.balance])),
    [balances],
  );
  const byId = useMemo(() => new Map(crud.rows.map((a) => [a.id, a])), [crud.rows]);

  useEffect(() => {
    if (crud.mode === 'new') {
      const parentId = crud.selected?.id ?? '';
      setForm({ ...emptyForm, type: drawer, parentId });
      setLoadingCode(true);
      accountsApi
        .getNextCode({ parentId: parentId || undefined, type: drawer })
        .then((res) => {
          const seg = res.parentCode ? res.code.slice(res.parentCode.length) : res.code.slice(-2);
          setSegmentInput(seg || '01');
          setForm((f) => ({ ...f, code: res.code }));
        })
        .catch(() => {
          setSegmentInput('01');
        })
        .finally(() => setLoadingCode(false));
    } else if (crud.mode === 'edit' && crud.selected) {
      const a = crud.selected;
      setForm({
        code: a.code, name: a.name, type: a.type, subtype: a.subtype ?? '',
        parentId: a.parentId ?? '', currency: a.currency,
        isTitle: a.isTitle, isControl: a.isControl,
        isActive: a.isActive, description: a.description ?? '',
      });
      setSegmentInput('');
    }
    // `drawer` is intentionally excluded: switching drawers mid-edit must not
    // silently rewrite the account type the user is editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crud.mode, crud.selected]);

  const handleParentChange = (newParentId: string) => {
    setForm((f) => ({ ...f, parentId: newParentId }));
    setLoadingCode(true);
    accountsApi
      .getNextCode({ parentId: newParentId || undefined, type: form.type })
      .then((res) => {
        const seg = res.parentCode ? res.code.slice(res.parentCode.length) : res.code.slice(-2);
        setSegmentInput(seg || '01');
        setForm((f) => ({ ...f, code: res.code }));
      })
      .catch(() => {
        setSegmentInput('01');
      })
      .finally(() => setLoadingCode(false));
  };

  const handleTypeChange = (newType: AccountType) => {
    setForm((f) => ({ ...f, type: newType, parentId: '' }));
    setLoadingCode(true);
    accountsApi
      .getNextCode({ type: newType })
      .then((res) => {
        const seg = res.parentCode ? res.code.slice(res.parentCode.length) : res.code.slice(-2);
        setSegmentInput(seg || '01');
        setForm((f) => ({ ...f, code: res.code }));
      })
      .catch(() => {
        setSegmentInput('01');
      })
      .finally(() => setLoadingCode(false));
  };

  const activeDrawerConfig =
    drawers.find((d) => d.type === form.type) ||
    DEFAULT_DRAWERS.find((d) => d.type === form.type);
  const activeDrawerCode = activeDrawerConfig?.code || '10';

  const selectedParent = form.parentId ? byId.get(form.parentId) : undefined;
  // If parent account is chosen, use its code. If no parent, use the active drawer's 2-digit code!
  const parentPrefix = selectedParent ? selectedParent.code : activeDrawerCode;
  const fullAccountCode = parentPrefix + segmentInput.trim();

  const handleSave = () => {
    if (!form.name.trim()) {
      crud.setError('Account name is required.');
      return;
    }

    if (crud.mode === 'new') {
      const trimmedSeg = segmentInput.trim();
      if (!trimmedSeg) {
        crud.setError('Account code segment is required.');
        return;
      }
      if (!/^\d{2}$/.test(trimmedSeg)) {
        crud.setError('Account code segment must be exactly two numeric digits (01-99).');
        return;
      }
      const finalCode = parentPrefix + trimmedSeg;
      const codeRegex = /^(\d{2}){1,7}$/;
      if (!codeRegex.test(finalCode)) {
        crud.setError(
          'Account code must follow 2-digit pure numeric format (e.g. 3010, 301001), up to maximum 7 levels (14 digits).',
        );
        return;
      }
      const depth = finalCode.length / 2;
      if (depth > 7) {
        crud.setError('Maximum allowed hierarchy depth is 7 levels (14 digits max). Level 8 is strictly prohibited.');
        return;
      }

      if (!finalCode.startsWith(parentPrefix)) {
        crud.setError(`Child account code must strictly begin with prefix "${parentPrefix}".`);
        return;
      }

      const duplicate = crud.rows.find((a) => a.code === finalCode);
      if (duplicate) {
        crud.setError(`Code "${finalCode}" already exists in this company (${duplicate.name}). Please choose another code.`);
        return;
      }

      crud.save({
        code: finalCode,
        name: form.name.trim(),
        type: form.type,
        subtype: (form.subtype || undefined) as AccountSubtype | undefined,
        parentId: form.parentId || undefined,
        currency: form.currency || 'USD',
        isTitle: form.isTitle,
        isControl: form.isControl,
        isActive: form.isActive,
        description: form.description || undefined,
      });
    } else {
      // In edit mode, code is strictly IMMUTABLE and cannot be altered
      crud.save({
        name: form.name.trim(),
        type: form.type,
        subtype: (form.subtype || undefined) as AccountSubtype | undefined,
        currency: form.currency || 'USD',
        isTitle: form.isTitle,
        isControl: form.isControl,
        isActive: form.isActive,
        description: form.description || undefined,
      });
    }
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Collect every node id in the visible tree recursively
  const collectAllIds = useCallback((nodes: typeof tree): string[] => {
    const ids: string[] = [];
    const walk = (list: typeof tree) => {
      for (const n of list) {
        ids.push(n.id);
        if (n.children.length) walk(n.children);
      }
    };
    walk(nodes);
    return ids;
  }, []);

  const expandAll = () => setExpanded(new Set(collectAllIds(tree)));
  const collapseAll = () => setExpanded(new Set());

  const matches = (n: AccountNode): boolean => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (n.code.toLowerCase().includes(q) || n.name.toLowerCase().includes(q)) return true;
    // Keep a branch visible when any descendant matches, so filtering never
    // hides the path to a hit.
    return n.children.some(matches);
  };

  const renderNode = (node: AccountNode, depth = 0): React.ReactNode => {
    if (!matches(node)) return null;
    const hasChildren = node.children.length > 0;
    // A search expands the tree automatically; otherwise honour the toggles.
    const isOpen = search.trim() ? true : expanded.has(node.id);
    const row = byId.get(node.id);
    const balance = balanceByAccount.get(node.id);

    return (
      <div key={node.id}>
        <div
          onClick={() => row && crud.select(row)}
          onDoubleClick={() => row && crud.openEdit(row)}
          style={{ paddingLeft: 6 + depth * 14 }}
          className={cn(
            'flex items-center gap-1 py-[3px] pr-2 cursor-default border-b border-[#f7f7f7]',
            crud.selected?.id === node.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/60',
          )}
        >
          {hasChildren ? (
            <span onClick={(e) => { e.stopPropagation(); toggle(node.id); }} className="shrink-0">
              {isOpen
                ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
            </span>
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <span className="font-mono text-[10.5px] text-gray-600 w-[115px] shrink-0 truncate">
            {node.code}
          </span>
          <span
            className={cn(
              'text-[10.5px] truncate flex-1',
              node.isTitle ? 'font-bold text-[#1a3a6b]' : 'text-gray-800',
              !node.isActive && 'text-gray-400 italic',
            )}
          >
            {node.name}
          </span>
          {node.isControl && (
            <span className="text-[8.5px] bg-purple-100 text-purple-700 px-1 rounded-[1px] shrink-0">CTRL</span>
          )}
          {node.isTitle && (
            <span className="text-[8.5px] bg-blue-100 text-blue-700 px-1 rounded-[1px] shrink-0">TITLE</span>
          )}
          {!node.isTitle && balance !== undefined && (
            <span
              className={cn(
                'text-[10px] font-mono w-[100px] text-right shrink-0',
                Number(balance) < 0 ? 'text-red-700' : 'text-gray-700',
              )}
            >
              {balance}
            </span>
          )}
        </div>
        {hasChildren && isOpen && node.children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const selected = crud.selected;
  const postedLines = selected?._count?.lines ?? 0;

  return (
    <ClassicWindow
      title="Chart of Accounts"
      icon={<Landmark className="w-3.5 h-3.5 text-gray-600" />}
      accent="#e8a01c"
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={900}
      minHeight={520}
      toolbar={
        <>
          <CrudToolbar
            onNew={crud.openNew}
            onEdit={() => selected && crud.openEdit(selected)}
            onDelete={() => crud.remove()}
            onRefresh={crud.refetch}
            canEdit={!!selected}
            canDelete={!!selected}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <div className="flex items-center gap-1 ml-2">
            <Search className="w-3 h-3 text-gray-500" />
            <ClassicInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find code or name…"
              className="w-44"
            />
          </div>
          <label className="flex items-center gap-1 ml-2 text-[10.5px] text-gray-700">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive
          </label>
          {/* Expand / Collapse All — only meaningful when not searching (search auto-expands) */}
          {!search.trim() && (
            <div className="flex items-center gap-1 ml-2 border-l border-[#ccc] pl-2">
              <button
                onClick={expandAll}
                title="Expand all"
                className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-400 rounded-[2px] shadow-sm hover:brightness-95 active:shadow-inner"
              >
                <ChevronsDown className="w-3 h-3" />
                Expand All
              </button>
              <button
                onClick={collapseAll}
                title="Collapse all"
                className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-400 rounded-[2px] shadow-sm hover:brightness-95 active:shadow-inner"
              >
                <ChevronsUp className="w-3 h-3" />
                Collapse All
              </button>
            </div>
          )}
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={
        <>
          <span>
            {crud.rows.length} account{crud.rows.length === 1 ? '' : 's'} ·{' '}
            {drawers.find((d) => d.type === drawer)?.label || drawer}
          </span>
          <span>Chart of Accounts</span>
        </>
      }
    >
      {/* Drawer tabs */}
      <div className="flex items-center justify-between px-2 pt-1 bg-[#ececec] shrink-0 border-b border-[#999]">
        <div className="flex gap-[2px]">
          {visibleDrawers.map((d) => (
            <button
              key={d.type}
              onClick={() => setDrawer(d.type)}
              className={cn(
                'px-3.5 py-0.5 text-[10.5px] border border-[#999] border-b-0 rounded-t-[3px] flex items-center gap-1.5',
                drawer === d.type
                  ? 'bg-white font-bold -mb-[1px] z-10 relative'
                  : 'bg-[#e1e1e1] hover:bg-gray-200',
              )}
            >
              <span>{d.label}</span>
              <span className="font-mono text-[9px] text-gray-500 font-semibold bg-gray-200/90 px-1 rounded-[2px]">
                {d.code}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowDrawerConfig(true)}
          title="Configure Chart of Accounts drawers (Labels, visibility, order)"
          className="flex items-center gap-1 px-2 py-0.5 mb-1 text-[10px] text-gray-700 bg-[#f4f4f4] hover:bg-white hover:text-blue-700 border border-gray-400 rounded-[2px] shadow-xs cursor-pointer transition-colors"
        >
          <Settings className="w-3 h-3 text-gray-600" />
          <span>Configure Drawers</span>
        </button>
      </div>

      <div className="flex flex-1 min-h-0 border-t border-[#999]">
        {/* Tree */}
        <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] border-b border-[#d4d0c8] sticky top-0 z-10 text-[10px] font-bold text-[#444]">
            <span className="w-3.5" />
            <span className="w-[115px]">G/L Acct</span>
            <span className="flex-1">Name</span>
            <span className="w-[100px] text-right">Balance</span>
          </div>
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={treeLoading}
            isEmpty={!treeLoading && tree.length === 0}
            emptyText="No accounts in this drawer yet. Click New to add one."
          />
          {tree.map((n) => renderNode(n))}
        </div>

        {/* Detail / form */}
        <div className="w-[320px] shrink-0 border-l border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new'
              ? 'New G/L Account'
              : crud.mode === 'edit'
                ? `Edit — ${selected?.code}`
                : 'Account Details'}
          </div>

          {!isForm && !selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">
              Select an account, or click New.
            </div>
          )}

          {!isForm && selected && (
            <>
              <FieldRow label="G/L Account">
                <span className="font-mono font-bold text-gray-800">{selected.code}</span>
                <span className="text-[9.5px] text-gray-500 font-normal ml-2">
                  (Level {selected.level ?? selected.code.split('-').length})
                </span>
              </FieldRow>
              <FieldRow label="Name">{selected.name}</FieldRow>
              <FieldRow label="Type">{pretty(selected.type)}</FieldRow>
              <FieldRow label="Subtype">{selected.subtype ? pretty(selected.subtype) : '—'}</FieldRow>
              <FieldRow label="Parent">{selected.parent ? `${selected.parent.code} ${selected.parent.name}` : '— top level —'}</FieldRow>
              <FieldRow label="Currency">{selected.currency}</FieldRow>
              <FieldRow label="Account kind">
                {selected.isTitle ? 'Title (grouping)' : 'Active (postable)'}
                {selected.isControl && ' · Control'}
              </FieldRow>
              <FieldRow label="Balance">
                <span className="font-mono">{balanceByAccount.get(selected.id) ?? '0.00'}</span>
              </FieldRow>
              <FieldRow label="Journal lines">{postedLines}</FieldRow>
              <FieldRow label="Status">{selected.isActive ? 'Active' : 'Inactive'}</FieldRow>
              {selected.description && (
                <FieldRow label="Description">{selected.description}</FieldRow>
              )}
              {postedLines > 0 && (
                <div className="mt-2 text-[9.5px] text-amber-700 bg-amber-50 border border-amber-200 p-1.5 rounded-[1px]">
                  This account carries posted history, so it can be deactivated but not deleted.
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <YellowBtn onClick={() => crud.openEdit(selected)}>Edit</YellowBtn>
                {(selected.level ?? Math.floor(selected.code.length / 2)) < 7 ? (
                  <GreyBtn
                    onClick={() => {
                      crud.openNew();
                      setForm({
                        ...emptyForm,
                        type: selected.type,
                        parentId: selected.id,
                      });
                      handleParentChange(selected.id);
                    }}
                  >
                    Add child
                  </GreyBtn>
                ) : (
                  <span className="text-[9px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Max 7 levels reached
                  </span>
                )}
              </div>
            </>
          )}

          {isForm && (
            <>
              {crud.mode === 'edit' ? (
                <>
                  <FieldRow label="Account Code">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] bg-[#f0f0f0] border border-[#ccc] px-2.5 py-0.5 rounded-[2px] text-gray-800">
                        {form.code}
                      </span>
                      <span className="text-[9.5px] text-gray-500 font-medium">
                        Level {form.code ? Math.floor(form.code.length / 2) : 2} · Immutable
                      </span>
                    </div>
                  </FieldRow>
                  <FieldRow label="Parent account">
                    <div className="text-[10.5px] text-gray-700 py-0.5">
                      {selected?.parent ? `${selected.parent.code} — ${selected.parent.name}` : '— top level —'}
                      <span className="text-[9px] text-gray-400 ml-1.5">(Lineage locked)</span>
                    </div>
                  </FieldRow>
                  <FieldRow label="Type">
                    <div className="text-[10.5px] text-gray-700 py-0.5 font-medium">
                      {pretty(form.type)}
                      <span className="text-[9px] text-gray-400 ml-1.5">(Locked)</span>
                    </div>
                  </FieldRow>
                  <FieldRow label="Account Name" required>
                    <ClassicInput
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full"
                      autoFocus
                    />
                  </FieldRow>
                </>
              ) : (
                <>
                  <FieldRow label="Parent account">
                    <ClassicSel
                      value={form.parentId}
                      onChange={(e) => handleParentChange(e.target.value)}
                      className="w-full"
                    >
                      <option value="">
                        — Top Level under {activeDrawerConfig?.label} ({activeDrawerCode}) —
                      </option>
                      {crud.rows
                        .filter((a) => a.type === form.type && (a.level ?? Math.floor(a.code.length / 2)) < 7)
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.code} — {a.name} (Level {a.level ?? Math.floor(a.code.length / 2)})
                          </option>
                        ))}
                    </ClassicSel>
                  </FieldRow>

                  <FieldRow label="Account Code" required>
                    <div className="flex items-center gap-1.5">
                      {parentPrefix && (
                        <span className="font-mono text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 border border-gray-300 rounded-[2px] shrink-0">
                          {parentPrefix}
                        </span>
                      )}
                      <ClassicInput
                        value={segmentInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d]/g, '').slice(0, 2);
                          setSegmentInput(val);
                        }}
                        className="w-16 font-mono text-center font-bold"
                        placeholder="01"
                        maxLength={2}
                        disabled={loadingCode}
                        autoFocus
                      />
                      {loadingCode && (
                        <span className="text-[9.5px] text-gray-400 italic shrink-0">Suggesting…</span>
                      )}
                    </div>
                    <div className="text-[9px] text-gray-500 mt-0.5">
                      Two-digit segment (01–99).
                    </div>
                  </FieldRow>

                  <FieldRow label="Full Account Code">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[12px] text-blue-900 bg-blue-50 border border-blue-300 px-2.5 py-0.5 rounded-[2px]">
                        {fullAccountCode || '—'}
                      </span>
                      <span className="text-[9.5px] text-gray-500 font-medium">
                        Level {fullAccountCode ? Math.floor(fullAccountCode.length / 2) : 2} of 7 (Pure numeric)
                      </span>
                    </div>
                  </FieldRow>

                  <FieldRow label="Account Name" required>
                    <ClassicInput
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full"
                      placeholder="e.g. Cash or Current Assets"
                    />
                  </FieldRow>

                  <FieldRow label="Type" required>
                    <ClassicSel
                      value={form.type}
                      onChange={(e) => handleTypeChange(e.target.value as AccountType)}
                      className="w-full"
                    >
                      {drawers.map((d) => (
                        <option key={d.type} value={d.type}>
                          {pretty(d.type)} ({d.label})
                        </option>
                      ))}
                    </ClassicSel>
                  </FieldRow>
                </>
              )}

              <FieldRow label="Subtype">
                <ClassicSel
                  value={form.subtype}
                  onChange={(e) => setForm((f) => ({ ...f, subtype: e.target.value }))}
                  className="w-full"
                >
                  <option value="">— none —</option>
                  {SUBTYPES.map((s) => (
                    <option key={s} value={s}>{pretty(s)}</option>
                  ))}
                </ClassicSel>
              </FieldRow>

              <FieldRow label="Currency">
                <ClassicInput
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
                  className="w-20"
                  maxLength={3}
                />
              </FieldRow>

              <div className="mt-2 mb-1 text-[10.5px] font-bold text-[#444]">Account kind</div>
              <label className="flex items-start gap-2 mb-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isTitle}
                  disabled={postedLines > 0}
                  onChange={(e) => setForm((f) => ({ ...f, isTitle: e.target.checked }))}
                  className="mt-0.5"
                />
                <span className="text-[10px] text-gray-700">
                  <b>Title account</b> — groups other accounts and cannot be posted to.
                  {postedLines > 0 && (
                    <em className="block text-amber-700">
                      Locked: this account already has {postedLines} journal line(s).
                    </em>
                  )}
                </span>
              </label>
              <label className="flex items-start gap-2 mb-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isControl}
                  onChange={(e) => setForm((f) => ({ ...f, isControl: e.target.checked }))}
                  className="mt-0.5"
                />
                <span className="text-[10px] text-gray-700">
                  <b>Control account</b> — only accepts postings that name a business partner.
                </span>
              </label>
              <label className="flex items-center gap-2 mb-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                <span className="text-[10px] text-gray-700">Active</span>
              </label>

              <FieldRow label="Description">
                <ClassicInput
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>

              <div className="flex gap-2 mt-4">
                <YellowBtn onClick={handleSave} disabled={crud.isBusy}>
                  {crud.isBusy
                    ? 'Saving…'
                    : crud.mode === 'edit'
                      ? 'Save Changes'
                      : `Create Account ${fullAccountCode ? `(${fullAccountCode})` : ''}`}
                </YellowBtn>
                <GreyBtn onClick={crud.cancel}>Cancel</GreyBtn>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfigureCoaDrawersModal
        isOpen={showDrawerConfig}
        onClose={() => setShowDrawerConfig(false)}
        currentDrawers={drawers}
        onSaved={(newDrawers) => {
          const visible = newDrawers.filter((d) => d.visible);
          if (visible.length > 0 && !visible.some((d) => d.type === drawer)) {
            setDrawer(visible[0].type);
          }
        }}
      />
    </ClassicWindow>
  );
};
