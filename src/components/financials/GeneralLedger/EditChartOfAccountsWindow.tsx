import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  FolderTree,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Check,
  AlertCircle,
  Edit2,
  Landmark,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';
import { ConfigureCoaDrawersModal } from './ConfigureCoaDrawersModal';
import { WindowManagerReturn } from '../../../hooks/useWindowManager';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (patch: Partial<WindowState>) => void;
  onFocus: () => void;
  wm?: WindowManagerReturn;
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

const emptyCreateForm = {
  parentId: '',
  name: '',
  isTitle: true,
  subtype: '',
  description: '',
};

export const EditChartOfAccountsWindow: React.FC<Props> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
  wm,
}) => {
  const { activeCompanyId } = useAuth();
  const queryClient = useQueryClient();

  // Active drawer tab
  const [drawer, setDrawer] = useState<AccountType>('ASSET');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Modals & Panels
  const [showDrawersConfig, setShowDrawersConfig] = useState(false);
  const [panelMode, setPanelMode] = useState<'view' | 'edit' | 'create'>('view');

  // Edit State (Name editable, code locked)
  const [editName, setEditName] = useState('');
  const [editIsTitle, setEditIsTitle] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editDescription, setEditDescription] = useState('');

  // Create State (2-digit code segment + name)
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [segmentInput, setSegmentInput] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);

  // Status/Error notification
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Fetch Company Drawers
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

  useEffect(() => {
    if (visibleDrawers.length > 0 && !visibleDrawers.some((d) => d.type === drawer)) {
      setDrawer(visibleDrawers[0].type);
    }
  }, [visibleDrawers, drawer]);

  const activeDrawerConfig = useMemo(
    () => drawers.find((d) => d.type === drawer) || DEFAULT_DRAWERS.find((d) => d.type === drawer),
    [drawers, drawer],
  );
  const activeDrawerCode = activeDrawerConfig?.code || '10';

  // 2. Fetch Accounts Tree for Active Drawer
  const {
    data: tree = [],
    isLoading: treeLoading,
    refetch: refetchTree,
  } = useQuery({
    queryKey: ['accounts-tree', activeCompanyId, drawer],
    queryFn: () => accountsApi.tree({ type: drawer }),
    enabled: !!activeCompanyId,
  });

  // 3. Flat accounts list for lookups and parent selection
  const { data: flatAccounts = [], refetch: refetchAccounts } = useQuery<Account[]>({
    queryKey: ['accounts-flat', activeCompanyId],
    queryFn: () => accountsApi.getAll({ take: 2000 }),
    enabled: !!activeCompanyId,
  });

  const accountMap = useMemo(() => {
    return new Map<string, Account>((flatAccounts as Account[]).map((a: Account) => [a.id, a]));
  }, [flatAccounts]);

  const selectedAccount = useMemo(() => {
    if (!selectedNodeId) return null;
    return accountMap.get(selectedNodeId) || null;
  }, [selectedNodeId, accountMap]);

  // When selected account changes, seed edit state
  useEffect(() => {
    if (selectedAccount && panelMode !== 'create') {
      setEditName(selectedAccount.name);
      setEditIsTitle(selectedAccount.isTitle);
      setEditIsActive(selectedAccount.isActive);
      setEditDescription(selectedAccount.description || '');
    }
  }, [selectedAccount, panelMode]);

  // Tree Expand / Collapse Helpers
  const collectIds = useCallback((nodes: AccountNode[]): string[] => {
    const ids: string[] = [];
    const walk = (list: AccountNode[]) => {
      for (const n of list) {
        ids.push(n.id);
        if (n.children && n.children.length > 0) walk(n.children);
      }
    };
    walk(nodes);
    return ids;
  }, []);

  const expandAll = () => setExpanded(new Set(collectIds(tree)));
  const collapseAll = () => setExpanded(new Set());
  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter search
  const matchesSearch = useCallback(
    (n: AccountNode): boolean => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      if (n.code.toLowerCase().includes(q) || n.name.toLowerCase().includes(q)) return true;
      return n.children.some(matchesSearch);
    },
    [search],
  );

  // Dynamic prefix for new category / subcategory
  const createParentAccount = createForm.parentId ? accountMap.get(createForm.parentId) : undefined;
  const createParentPrefix = createParentAccount ? createParentAccount.code : activeDrawerCode;
  const createFullCode = createParentPrefix + segmentInput.trim();

  // Suggest next code for creation
  const suggestCodeForParent = (parentId: string) => {
    setLoadingCode(true);
    accountsApi
      .getNextCode({ parentId: parentId || undefined, type: drawer })
      .then((res) => {
        const seg = res.parentCode ? res.code.slice(res.parentCode.length) : res.code.slice(-2);
        setSegmentInput(seg || '01');
      })
      .catch(() => {
        setSegmentInput('01');
      })
      .finally(() => setLoadingCode(false));
  };

  const handleStartCreate = (parentId = '') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setCreateForm({
      ...emptyCreateForm,
      parentId,
      isTitle: !parentId, // Top level under drawer defaults to Category (Title)
    });
    setPanelMode('create');
    suggestCodeForParent(parentId);
  };

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Account> }) =>
      accountsApi.update(id, patch),
    onSuccess: (updated) => {
      setSuccessMsg(`Account "${updated.name}" updated successfully.`);
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['accounts-tree', activeCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['accounts-flat', activeCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to update account');
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => accountsApi.create(payload),
    onSuccess: (created) => {
      setSuccessMsg(`Created ${created.isTitle ? 'category' : 'subcategory'} "${created.code} — ${created.name}". Code is now locked.`);
      setErrorMsg(null);
      setPanelMode('view');
      setSelectedNodeId(created.id);
      queryClient.invalidateQueries({ queryKey: ['accounts-tree', activeCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['accounts-flat', activeCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to create category');
    },
  });

  const handleSaveEdit = () => {
    if (!selectedAccount) return;
    if (!editName.trim()) {
      setErrorMsg('Account / Category name cannot be empty.');
      return;
    }
    updateMutation.mutate({
      id: selectedAccount.id,
      patch: {
        name: editName.trim(),
        isTitle: editIsTitle,
        isActive: editIsActive,
        description: editDescription.trim() || null,
      },
    });
  };

  const handleSaveCreate = () => {
    setErrorMsg(null);
    if (!createForm.name.trim()) {
      setErrorMsg('Category / Subcategory name is required.');
      return;
    }
    const seg = segmentInput.trim();
    if (!/^\d{2}$/.test(seg)) {
      setErrorMsg('Account code segment must be exactly 2 numeric digits (01–99).');
      return;
    }

    const finalCode = createParentPrefix + seg;
    if (!/^(\d{2}){1,7}$/.test(finalCode)) {
      setErrorMsg('Account code must follow 2-digit pure numeric format (e.g. 3010, 301001).');
      return;
    }

    if (finalCode.length / 2 > 7) {
      setErrorMsg('Maximum hierarchy depth of 7 levels reached.');
      return;
    }

    const duplicate = (flatAccounts as Account[]).find((a: Account) => a.code === finalCode);
    if (duplicate) {
      setErrorMsg(`Code "${finalCode}" already exists (${duplicate.name}). Choose another code.`);
      return;
    }

    createMutation.mutate({
      code: finalCode,
      name: createForm.name.trim(),
      type: drawer,
      subtype: createForm.subtype || undefined,
      parentId: createForm.parentId || undefined,
      currency: 'USD',
      isTitle: createForm.isTitle,
      isControl: false,
      isActive: true,
      description: createForm.description.trim() || undefined,
    });
  };

  // Render tree node recursively
  const renderTreeNode = (node: AccountNode, depth = 0) => {
    if (!matchesSearch(node)) return null;
    const hasChildren = node.children && node.children.length > 0;
    const isOpen = search.trim() ? true : expanded.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const level = Math.floor(node.code.length / 2);

    return (
      <div key={node.id}>
        <div
          onClick={() => {
            setSelectedNodeId(node.id);
            setPanelMode('view');
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          style={{ paddingLeft: 8 + depth * 18 }}
          className={cn(
            'flex items-center gap-2 py-1 px-2 border-b border-[#f0f0f0] cursor-pointer text-[11px] select-none group transition-colors',
            isSelected ? 'bg-[#ffed99] font-medium' : 'hover:bg-blue-50/70',
          )}
        >
          {/* Toggle */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="p-0.5 text-gray-500 hover:text-black shrink-0"
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          {/* Locked Code Badge */}
          <div
            className="flex items-center gap-1 font-mono font-bold text-gray-800 bg-white border border-[#ccc] px-1.5 py-0.2 rounded-[2px] shrink-0 text-[10.5px]"
            title="Code is strictly immutable and permanently locked"
          >
            <Lock className="w-2.5 h-2.5 text-amber-700" />
            <span>{node.code}</span>
          </div>

          {/* Name */}
          <span
            className={cn(
              'flex-1 truncate',
              node.isTitle ? 'font-bold text-[#1a3a6b]' : 'text-gray-800',
              !node.isActive && 'text-gray-400 italic line-through',
            )}
          >
            {node.name}
          </span>

          {/* Level Badge */}
          <span className="text-[9px] text-gray-500 bg-gray-100 border border-gray-300 px-1 py-0.2 rounded shrink-0">
            Lvl {level}
          </span>

          {/* Title vs Active Badge */}
          {node.isTitle ? (
            <span className="text-[8.5px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.2 rounded shrink-0">
              CATEGORY
            </span>
          ) : (
            <span className="text-[8.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shrink-0">
              ACCOUNT
            </span>
          )}

          {/* Quick Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
                setPanelMode('edit');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              title="Edit Name"
              className="p-1 hover:bg-white border border-gray-300 rounded-[2px] text-gray-600 hover:text-blue-700"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            {level < 7 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartCreate(node.id);
                }}
                title="Add Subcategory under this account"
                className="p-1 hover:bg-white border border-gray-300 rounded-[2px] text-gray-600 hover:text-green-700"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isOpen && (
          <div>{node.children.map((child) => renderTreeNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <ClassicWindow
      title="Edit Chart of Accounts — Categories & Subcategories"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      toolbar={
        <>
          <YellowBtn onClick={() => handleStartCreate(selectedNodeId || '')} className="flex items-center gap-1">
            <Plus className="w-3 h-3" />
            New Category / Subcategory
          </YellowBtn>

          <div className="flex items-center gap-1 ml-2">
            <Search className="w-3 h-3 text-gray-500" />
            <ClassicInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find category or code…"
              className="w-48"
            />
          </div>

          {!search.trim() && (
            <div className="flex items-center gap-1 ml-2 border-l border-[#ccc] pl-2">
              <button
                onClick={expandAll}
                title="Expand all"
                className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-400 rounded-[2px] shadow-sm hover:brightness-95 active:shadow-inner"
              >
                <ChevronsDown className="w-3 h-3" />
                Expand All
              </button>
              <button
                onClick={collapseAll}
                title="Collapse all"
                className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-400 rounded-[2px] shadow-sm hover:brightness-95 active:shadow-inner"
              >
                <ChevronsUp className="w-3 h-3" />
                Collapse All
              </button>
            </div>
          )}

          <button
            onClick={() => {
              refetchTree();
              refetchAccounts();
            }}
            title="Refresh tree"
            className="flex items-center gap-1 ml-2 px-2 py-0.5 text-[10px] bg-[#f8f8f8] hover:bg-white border border-gray-400 rounded-[2px]"
          >
            <RefreshCw className="w-3 h-3 text-gray-600" />
          </button>
        </>
      }
      footer={
        <div className="flex items-center justify-between w-full text-[10.5px] text-gray-600 px-1">
          <div>
            <span>
              Drawer: <strong>{activeDrawerConfig?.label}</strong> (Code: <code>{activeDrawerCode}</code>) ·{' '}
              {(flatAccounts as Account[]).filter((a: Account) => a.type === drawer).length} items
            </span>
          </div>
          <div className="flex items-center gap-2">
            {wm && (
              <button
                onClick={() => {
                  wm.openWindow('chartOfAccounts');
                  onClose();
                }}
                className="flex items-center gap-1 text-blue-700 hover:underline"
              >
                <Landmark className="w-3 h-3" />
                <span>Open G/L View</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Drawer tabs across the top */}
      <div className="flex items-center justify-between px-2 pt-1 bg-[#ececec] shrink-0 border-b border-[#999]">
        <div className="flex gap-[2px]">
          {visibleDrawers.map((d) => (
            <button
              key={d.type}
              onClick={() => {
                setDrawer(d.type);
                setSelectedNodeId(null);
                setPanelMode('view');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={cn(
                'px-3.5 py-0.5 text-[10.5px] border border-[#999] border-b-0 rounded-t-[3px] flex items-center gap-1.5',
                drawer === d.type
                  ? 'bg-white font-bold -mb-[1px] z-10 relative'
                  : 'bg-[#e1e1e1] hover:bg-gray-200',
              )}
            >
              <span>{d.label}</span>
              <span className="font-mono text-[9px] text-gray-600 font-semibold bg-gray-200/90 px-1 rounded-[2px]">
                {d.code}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowDrawersConfig(true)}
          title="Configure Chart of Accounts drawers (Labels, 2-digit codes, visibility, order)"
          className="flex items-center gap-1 px-2 py-0.5 mb-1 text-[10px] text-gray-700 bg-[#f4f4f4] hover:bg-white hover:text-blue-700 border border-gray-400 rounded-[2px] shadow-xs cursor-pointer transition-colors"
        >
          <Settings className="w-3 h-3 text-gray-600" />
          <span>Configure Drawers</span>
        </button>
      </div>

      {/* Main split: Tree on left, Edit / Create Panel on right */}
      <div className="flex flex-1 min-h-0 border-t border-[#999]">
        {/* Left Pane: Hierarchy Tree */}
        <div className="flex-1 bg-white overflow-auto custom-scrollbar border-r border-[#d4d0c8] flex flex-col">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#f5f5f5] border-b border-[#e0e0e0] text-[10.5px] font-bold text-gray-700 sticky top-0 z-10">
            <div className="flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-[#1a3a6b]" />
              <span>Category & Subcategory Hierarchy ({activeDrawerConfig?.label})</span>
            </div>
            <div className="text-[9.5px] text-gray-500 font-normal">
              Click node to view/edit · 🔒 Codes are locked
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ListPlaceholder
              isLoading={treeLoading}
              isEmpty={!treeLoading && tree.length === 0}
              emptyText={`No accounts in ${activeDrawerConfig?.label} drawer yet. Click "New Category / Subcategory" above.`}
            />
            {tree.map((node) => renderTreeNode(node))}
          </div>
        </div>

        {/* Right Pane: Edit or Create Form */}
        <div className="w-[380px] shrink-0 bg-[#fafafa] flex flex-col overflow-y-auto custom-scrollbar p-4">
          {/* Messages */}
          {errorMsg && (
            <div className="mb-3 p-2 bg-[#ffebeb] border border-red-300 text-red-700 rounded-[2px] flex items-center gap-1.5 text-[10.5px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-3 p-2 bg-[#eefaf0] border border-green-300 text-green-800 rounded-[2px] flex items-center gap-1.5 text-[10.5px]">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* PANEL MODE: CREATE */}
          {panelMode === 'create' ? (
            <div>
              <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-2 mb-3">
                <div className="text-[12px] font-bold text-[#1a3a6b]">
                  {createForm.isTitle ? 'New Category (Title)' : 'New Subcategory (Account)'}
                </div>
                <button
                  onClick={() => setPanelMode('view')}
                  className="text-[10px] text-gray-500 hover:text-black"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3">
                <FieldRow label="Parent">
                  <ClassicSel
                    value={createForm.parentId}
                    onChange={(e) => {
                      const newP = e.target.value;
                      setCreateForm((f) => ({ ...f, parentId: newP }));
                      suggestCodeForParent(newP);
                    }}
                    className="w-full"
                  >
                    <option value="">
                      — Drawer Root: {activeDrawerConfig?.label} ({activeDrawerCode}) —
                    </option>
                    {(flatAccounts as Account[])
                      .filter((a: Account) => a.type === drawer && Math.floor(a.code.length / 2) < 7)
                      .map((a: Account) => (
                        <option key={a.id} value={a.id}>
                          {a.code} — {a.name} (Lvl {Math.floor(a.code.length / 2)})
                        </option>
                      ))}
                  </ClassicSel>
                </FieldRow>

                <FieldRow label="Code (2D)" required>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 border border-gray-300 rounded-[2px] shrink-0">
                      {createParentPrefix}
                    </span>
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
                    {loadingCode && <span className="text-[9.5px] text-gray-400 italic">Suggesting…</span>}
                  </div>
                  <div className="text-[9.5px] text-amber-700 mt-1">
                    🔒 This 2-digit code will be permanently locked once saved.
                  </div>
                </FieldRow>

                <FieldRow label="Full Code">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[12px] text-blue-900 bg-blue-50 border border-blue-300 px-2.5 py-0.5 rounded-[2px]">
                      {createFullCode || '—'}
                    </span>
                    <span className="text-[9.5px] text-gray-500 font-medium">
                      Level {createFullCode ? Math.floor(createFullCode.length / 2) : 2} of 7
                    </span>
                  </div>
                </FieldRow>

                <FieldRow label="Name" required>
                  <ClassicInput
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full"
                    placeholder="e.g. Current Assets or Meezan Bank"
                  />
                </FieldRow>

                <FieldRow label="Kind">
                  <div className="flex items-center gap-4 text-[10.5px]">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="kind"
                        checked={createForm.isTitle}
                        onChange={() => setCreateForm((f) => ({ ...f, isTitle: true }))}
                      />
                      <span className="font-bold text-[#1a3a6b]">Category (Grouping)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="kind"
                        checked={!createForm.isTitle}
                        onChange={() => setCreateForm((f) => ({ ...f, isTitle: false }))}
                      />
                      <span>Subcategory (Ledger)</span>
                    </label>
                  </div>
                </FieldRow>

                {!createForm.isTitle && (
                  <FieldRow label="Subtype">
                    <ClassicSel
                      value={createForm.subtype}
                      onChange={(e) => setCreateForm((f) => ({ ...f, subtype: e.target.value }))}
                      className="w-full"
                    >
                      <option value="">— Select Subtype —</option>
                      {SUBTYPES.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </ClassicSel>
                  </FieldRow>
                )}

                <FieldRow label="Description">
                  <ClassicInput
                    value={createForm.description}
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full"
                    placeholder="Optional notes…"
                  />
                </FieldRow>

                <div className="flex gap-2 pt-3 border-t border-[#e0e0e0]">
                  <YellowBtn
                    onClick={handleSaveCreate}
                    disabled={createMutation.isPending}
                    className="flex-1 justify-center"
                  >
                    {createMutation.isPending ? 'Saving…' : 'Save & Lock Code'}
                  </YellowBtn>
                  <GreyBtn onClick={() => setPanelMode('view')}>Cancel</GreyBtn>
                </div>
              </div>
            </div>
          ) : selectedAccount ? (
            /* PANEL MODE: VIEW / EDIT SELECTED ACCOUNT */
            <div>
              <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-2 mb-3">
                <div className="text-[12px] font-bold text-[#1a3a6b]">
                  {panelMode === 'edit' ? 'Edit Category / Subcategory' : 'Category Details'}
                </div>
                <div className="flex items-center gap-1">
                  {panelMode === 'view' ? (
                    <button
                      onClick={() => setPanelMode('edit')}
                      className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-white border border-gray-400 rounded hover:bg-gray-50"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>Edit Name</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setPanelMode('view')}
                      className="text-[10px] text-gray-500 hover:text-black"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Code — Always Locked */}
                <FieldRow label="Account Code">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[12px] bg-[#f0f0f0] border border-[#ccc] px-2 py-0.5 rounded-[2px] text-gray-900 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-red-600" />
                      {selectedAccount.code}
                    </span>
                    <span className="text-[9.5px] text-gray-500">
                      Level {Math.floor(selectedAccount.code.length / 2)} · Permanent
                    </span>
                  </div>
                </FieldRow>

                <FieldRow label="Parent">
                  <div className="text-[10.5px] text-gray-700 py-0.5">
                    {selectedAccount.parent
                      ? `${selectedAccount.parent.code} — ${selectedAccount.parent.name}`
                      : `— Drawer Root (${activeDrawerConfig?.label} ${activeDrawerCode}) —`}
                  </div>
                </FieldRow>

                {/* Name — Editable! */}
                <FieldRow label="Name" required>
                  {panelMode === 'edit' ? (
                    <ClassicInput
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full font-medium"
                      autoFocus
                    />
                  ) : (
                    <div className="text-[11px] font-bold text-gray-900 py-0.5 flex items-center justify-between">
                      <span>{selectedAccount.name}</span>
                      <button
                        onClick={() => setPanelMode('edit')}
                        className="text-[10px] text-blue-700 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </FieldRow>

                <FieldRow label="Kind">
                  {panelMode === 'edit' ? (
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px]">
                      <input
                        type="checkbox"
                        checked={editIsTitle}
                        onChange={(e) => setEditIsTitle(e.target.checked)}
                      />
                      <span className="font-medium text-gray-800">Title / Category (Grouping Node)</span>
                    </label>
                  ) : (
                    <div className="text-[10.5px] text-gray-700 py-0.5">
                      {selectedAccount.isTitle ? 'Category (Title)' : 'Subcategory (Active Account)'}
                    </div>
                  )}
                </FieldRow>

                <FieldRow label="Status">
                  {panelMode === 'edit' ? (
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px]">
                      <input
                        type="checkbox"
                        checked={editIsActive}
                        onChange={(e) => setEditIsActive(e.target.checked)}
                      />
                      <span>Active</span>
                    </label>
                  ) : (
                    <div className="text-[10.5px] py-0.5">
                      {selectedAccount.isActive ? (
                        <span className="text-green-700 font-medium">Active</span>
                      ) : (
                        <span className="text-gray-400 italic">Inactive</span>
                      )}
                    </div>
                  )}
                </FieldRow>

                <FieldRow label="Description">
                  {panelMode === 'edit' ? (
                    <ClassicInput
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <div className="text-[10.5px] text-gray-600 py-0.5 italic">
                      {selectedAccount.description || '— None —'}
                    </div>
                  )}
                </FieldRow>

                {panelMode === 'edit' && (
                  <div className="flex gap-2 pt-3 border-t border-[#e0e0e0]">
                    <YellowBtn
                      onClick={handleSaveEdit}
                      disabled={updateMutation.isPending}
                      className="flex-1 justify-center"
                    >
                      {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                    </YellowBtn>
                    <GreyBtn onClick={() => setPanelMode('view')}>Cancel</GreyBtn>
                  </div>
                )}

                {panelMode === 'view' && Math.floor(selectedAccount.code.length / 2) < 7 && (
                  <div className="pt-3 border-t border-[#e0e0e0]">
                    <button
                      onClick={() => handleStartCreate(selectedAccount.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-bold bg-[#f0f4ff] hover:bg-[#e0ecff] text-[#1a3a6b] border border-[#b8ccee] rounded-[2px]"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Subcategory under {selectedAccount.code}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* NO NODE SELECTED */
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
              <FolderTree className="w-8 h-8 text-gray-300 mb-2" />
              <div className="text-[11px] font-medium text-gray-700 mb-1">
                Select a category or subcategory from the tree
              </div>
              <div className="text-[10px] text-gray-400 max-w-[240px] mb-4">
                You can edit category names directly or add new subcategories with 2-digit codes.
              </div>
              <YellowBtn onClick={() => handleStartCreate('')} className="flex items-center gap-1">
                <Plus className="w-3 h-3" />
                New Category / Subcategory
              </YellowBtn>
            </div>
          )}
        </div>
      </div>

      {/* Drawer Configuration Modal */}
      <ConfigureCoaDrawersModal
        isOpen={showDrawersConfig}
        onClose={() => setShowDrawersConfig(false)}
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
