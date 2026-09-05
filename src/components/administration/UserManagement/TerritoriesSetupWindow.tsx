import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { territoriesApi, type Territory, type TerritoryNode } from '../../../api/crm.api';
import { useAuth } from '../../../context/AuthContext';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const emptyForm = { name: '', parentId: '', isActive: true };

export const TerritoriesSetupWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [showInactive, setShowInactive] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const crud = useCrudResource<Territory>('territories', territoriesApi, {
    label: (t) => t.name,
  });

  // The tree is a separate endpoint; it re-fetches whenever the flat list does
  // so the two panes never disagree after a save.
  const { data: tree = [] } = useQuery({
    queryKey: ['territories-tree', activeCompanyId, crud.rows.length, crud.status],
    queryFn: () => territoriesApi.tree(),
    enabled: !!activeCompanyId,
  });

  useEffect(() => {
    if (crud.mode === 'new') setForm(emptyForm);
    else if (crud.mode === 'edit' && crud.selected) {
      setForm({
        name: crud.selected.name,
        parentId: crud.selected.parentId ?? '',
        isActive: crud.selected.isActive,
      });
    }
  }, [crud.mode, crud.selected]);

  const byId = useMemo(
    () => new Map(crud.rows.map((t) => [t.id, t])),
    [crud.rows],
  );

  const handleSave = () => {
    if (!form.name.trim()) {
      crud.setError('Territory name is required.');
      return;
    }
    crud.save({
      name: form.name.trim(),
      parentId: form.parentId || undefined,
      isActive: form.isActive,
    });
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNode = (node: TerritoryNode, depth = 0): React.ReactNode => {
    if (!node.isActive && !showInactive) return null;
    const hasChildren = node.children.length > 0;
    const isOpen = expanded.has(node.id);
    const row = byId.get(node.id);

    return (
      <div key={node.id}>
        <div
          onClick={() => row && crud.select(row)}
          onDoubleClick={() => row && crud.openEdit(row)}
          style={{ paddingLeft: 6 + depth * 14 }}
          className={cn(
            'flex items-center gap-1 py-[3px] pr-2 cursor-default hover:bg-blue-50 group',
            crud.selected?.id === node.id && 'bg-[#ffed99] hover:bg-[#ffed99]',
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
          <span className={cn('text-[11px]', node.isActive ? 'text-blue-900' : 'text-gray-400 italic')}>
            {node.name}
          </span>
          {!node.isActive && <span className="text-[9px] text-gray-400">(inactive)</span>}
        </div>
        {hasChildren && isOpen && node.children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';

  return (
    <ClassicWindow
      title="Territories - Setup"
      icon={<Globe className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={620}
      minHeight={420}
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
          <label className="flex items-center gap-1 ml-2 text-[10.5px] text-gray-700">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show Inactive
          </label>
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={
        <>
          <span>{crud.rows.length} territor{crud.rows.length === 1 ? 'y' : 'ies'}</span>
          <span>Territories Setup</span>
        </>
      }
    >
      <div className="flex flex-1 min-h-0">
        {/* Detail / form */}
        <div className="w-[300px] shrink-0 border-r border-[#d4d0c8] bg-white p-3 overflow-auto">
          <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
            {crud.mode === 'new'
              ? 'New Territory'
              : crud.mode === 'edit'
                ? `Edit — ${crud.selected?.name}`
                : 'Territory Details'}
          </div>

          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">
              Select a territory, or click New.
            </div>
          )}

          {!isForm && crud.selected && (
            <>
              <FieldRow label="Name">{crud.selected.name}</FieldRow>
              <FieldRow label="Parent Territory">
                {crud.selected.parent?.name ?? '— none —'}
              </FieldRow>
              <FieldRow label="Status">
                {crud.selected.isActive ? 'Active' : 'Inactive'}
              </FieldRow>
              <FieldRow label="Sub-territories">
                {crud.selected._count?.children ?? 0}
              </FieldRow>
              <FieldRow label="Business partners">
                {crud.selected._count?.partners ?? 0}
              </FieldRow>
              <FieldRow label="Sales employees">
                {crud.selected._count?.salesEmployees ?? 0}
              </FieldRow>
              <div className="mt-3">
                <YellowBtn onClick={() => crud.openEdit(crud.selected!)}>Edit</YellowBtn>
              </div>
            </>
          )}

          {isForm && (
            <>
              <FieldRow label="Name" required>
                <ClassicInput
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label="Parent Territory">
                <ClassicSel
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="w-full"
                >
                  <option value="">— none (top level) —</option>
                  {crud.rows
                    // A territory cannot be its own parent; the backend also
                    // rejects deeper cycles.
                    .filter((t) => t.id !== crud.selected?.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </ClassicSel>
              </FieldRow>
              <FieldRow label="Active">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
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

        {/* Tree */}
        <div className="flex-1 bg-white overflow-auto custom-scrollbar py-1">
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && tree.length === 0}
            emptyText="No territories defined. Click New to create the first one."
          />
          {tree.map((n) => renderNode(n))}
        </div>
      </div>
    </ClassicWindow>
  );
};
