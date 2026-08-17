import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Landmark, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { useAuth } from '../../../context/AuthContext';
import {
  accountsApi,
  type Account,
  type AccountNode,
  type AccountType,
  type AccountSubtype,
} from '../../../api/financials.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  /** WorkspaceWindows gates this window with `{wm.showChartOfAccounts && …}`. */
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

/** The five drawers across the top of the SAP Chart of Accounts window. */
const DRAWERS: { type: AccountType; label: string }[] = [
  { type: 'ASSET', label: 'Assets' },
  { type: 'LIABILITY', label: 'Liabilities' },
  { type: 'EQUITY', label: 'Equity' },
  { type: 'INCOME', label: 'Turnover' },
  { type: 'EXPENSE', label: 'Cost of Sales' },
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
  const { user } = useAuth();
  const [drawer, setDrawer] = useState<AccountType>('ASSET');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [form, setForm] = useState(emptyForm);

  const crud = useCrudResource<Account>('accounts', accountsApi, {
    params: { take: 2000 },
    label: (a) => `${a.code} — ${a.name}`,
  });

  // The tree endpoint drives the left pane. Keying on the row count and the
  // last write keeps it in step with the flat list after every save.
  const { data: tree = [], isLoading: treeLoading } = useQuery({
    queryKey: ['accounts-tree', user?.companyId, drawer, showInactive, crud.rows.length, crud.status],
    queryFn: () => accountsApi.tree({ type: drawer, includeInactive: showInactive }),
    enabled: !!user?.companyId,
  });

  const { data: balances = [] } = useQuery({
    queryKey: ['account-balances', user?.companyId, crud.status],
    queryFn: () => accountsApi.balances(),
    enabled: !!user?.companyId,
  });

  const balanceByAccount = useMemo(
    () => new Map(balances.map((b) => [b.accountId, b.balance])),
    [balances],
  );
  const byId = useMemo(() => new Map(crud.rows.map((a) => [a.id, a])), [crud.rows]);

  useEffect(() => {
    if (crud.mode === 'new') {
      setForm({ ...emptyForm, type: drawer, parentId: crud.selected?.id ?? '' });
    } else if (crud.mode === 'edit' && crud.selected) {
      const a = crud.selected;
      setForm({
        code: a.code, name: a.name, type: a.type, subtype: a.subtype ?? '',
        parentId: a.parentId ?? '', currency: a.currency,
        isTitle: a.isTitle, isControl: a.isControl,
        isActive: a.isActive, description: a.description ?? '',
      });
    }
    // `drawer` is intentionally excluded: switching drawers mid-edit must not
    // silently rewrite the account type the user is editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crud.mode, crud.selected]);

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) {
      crud.setError('Account code and name are required.');
      return;
    }
    crud.save({
      code: form.code.trim(),
      name: form.name.trim(),
      type: form.type,
      // '' means "no subtype"; anything else is one of the enum members the
      // select is populated from.
      subtype: (form.subtype || undefined) as AccountSubtype | undefined,
      parentId: form.parentId || undefined,
      currency: form.currency || 'USD',
      isTitle: form.isTitle,
      isControl: form.isControl,
      isActive: form.isActive,
      description: form.description || undefined,
    });
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
          <span className="font-mono text-[10.5px] text-gray-600 w-[90px] shrink-0 truncate">
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
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={
        <>
          <span>
            {crud.rows.length} account{crud.rows.length === 1 ? '' : 's'} ·{' '}
            {DRAWERS.find((d) => d.type === drawer)?.label}
          </span>
          <span>Chart of Accounts</span>
        </>
      }
    >
      {/* Drawer tabs */}
      <div className="flex gap-[2px] px-2 pt-1 bg-[#ececec] shrink-0">
        {DRAWERS.map((d) => (
          <button
            key={d.type}
            onClick={() => setDrawer(d.type)}
            className={cn(
              'px-4 py-0.5 text-[10.5px] border border-[#999] border-b-0 rounded-t-[3px]',
              drawer === d.type
                ? 'bg-white font-bold -mb-[1px] z-10 relative'
                : 'bg-[#e1e1e1] hover:bg-gray-200',
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0 border-t border-[#999]">
        {/* Tree */}
        <div className="flex-1 bg-white overflow-auto custom-scrollbar min-w-0">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] border-b border-[#d4d0c8] sticky top-0 z-10 text-[10px] font-bold text-[#444]">
            <span className="w-3.5" />
            <span className="w-[90px]">G/L Acct</span>
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
              <FieldRow label="G/L Account">{selected.code}</FieldRow>
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
              <div className="mt-3 flex gap-2">
                <YellowBtn onClick={() => crud.openEdit(selected)}>Edit</YellowBtn>
                <GreyBtn onClick={crud.openNew}>Add child</GreyBtn>
              </div>
            </>
          )}

          {isForm && (
            <>
              <FieldRow label="G/L Account" required>
                <ClassicInput
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full font-mono"
                  placeholder="1100"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label="Name" required>
                <ClassicInput
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="Type" required>
                <ClassicSel
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AccountType }))}
                  className="w-full"
                >
                  {DRAWERS.map((d) => (
                    <option key={d.type} value={d.type}>{pretty(d.type)}</option>
                  ))}
                </ClassicSel>
              </FieldRow>
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
              <FieldRow label="Parent account">
                <ClassicSel
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="w-full"
                >
                  <option value="">— top level —</option>
                  {crud.rows
                    .filter((a) => a.type === form.type && a.id !== selected?.id)
                    .map((a) => (
                      <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
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
