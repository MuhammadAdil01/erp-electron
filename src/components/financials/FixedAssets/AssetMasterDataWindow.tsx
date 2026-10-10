import React, { useEffect, useMemo, useState } from 'react';
import { Landmark, PlusSquare, MinusSquare, Search, Ban, CheckCircle2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { useAuth } from '../../../context/AuthContext';
import {
  fixedAssetsApi,
  type FixedAsset,
  type FixedAssetPayload,
  type FixedAssetStatus,
  type AssetAreaParams,
  type CapitalizationKind,
} from '../../../api/fixed-assets.api';
import type { DepreciationMethod } from '../../../api/financials.api';
import { confirmDiscardUnsaved, useUnsavedChangesGuard } from '../../../lib/unsavedChanges';
import { ClassicWindow, CrudToolbar, StatusNote, ListPlaceholder, ToolBtn, type WindowState } from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (patch: Partial<WindowState>) => void;
  onFocus: () => void;
  /** Opens Capitalization / Capitalization Credit Memo with this asset on line 1. */
  onCapitalize?: (assetId: string, kind: CapitalizationKind) => void;
  onOpenJournalEntry?: (id: string) => void;
  onOpenDocument?: (id: string, kind: CapitalizationKind) => void;
  /** Another window asked to show this asset. */
  focusAsset?: { id: string; nonce: number } | null;
}

const TABS = ['General', 'Purchasing Data', 'Fixed Assets', 'History', 'Remarks'] as const;
type Tab = (typeof TABS)[number];
const FA_TABS = ['Overview', 'Values', 'Depreciation', 'Cost Accounting', 'Accounts'] as const;
type FaTab = (typeof FA_TABS)[number];

// QA FA-D12: the enum stays; the window says New / Active / Retired / Sold.
const STATUS_LABEL: Record<FixedAssetStatus, string> = { NEW: 'New', CAPITALIZED: 'Active', RETIRED: 'Retired', SOLD: 'Sold' };
const STATUS_STYLE: Record<FixedAssetStatus, string> = {
  NEW: 'bg-gray-100 text-gray-700',
  CAPITALIZED: 'bg-green-100 text-green-800',
  RETIRED: 'bg-amber-100 text-amber-800',
  SOLD: 'bg-amber-100 text-amber-800',
};
const TX_LABEL: Record<string, string> = {
  CAPITALIZATION: 'Capitalization',
  CAPITALIZATION_CREDIT_MEMO: 'Capitalization credit memo',
  DEPRECIATION: 'Ordinary depreciation',
  MANUAL_DEPRECIATION: 'Unplanned depreciation',
  REVALUATION: 'Revaluation',
  TRANSFER: 'Transfer',
  RETIREMENT: 'Retirement',
};

const money = (v: string | number | null | undefined) =>
  v === null || v === undefined || v === ''
    ? '—'
    : Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const day = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : '');
/** dd.mm.yyyy, as SAP shows dates. */
const shown = (iso: string | null | undefined) => (iso ? iso.slice(0, 10).split('-').reverse().join('.') : '');
// 999,999,999,999,999.99 (QA FA-D13), as close as a double gets.
const MAX_AMOUNT = 1e15 - 0.01;
const twoDecimals = (s: string) => /^\d+(\.\d{1,2})?$/.test(s.trim());

/** The last day of a life of `months` from `start` (the server's rule, for a draft row). */
const lifeEnd = (start: string, months: number) => {
  if (!start || !Number.isInteger(months) || months < 1) return '';
  const [y, m, d] = start.split('-').map(Number);
  const end = new Date(Date.UTC(y, m - 1 + months, d));
  end.setUTCDate(end.getUTCDate() - 1);
  return end.toISOString().slice(0, 10);
};

interface AreaForm {
  areaId: string;
  code: string;
  name: string;
  postsToGl: boolean;
  depreciationMethod: DepreciationMethod;
  usefulLifeMonths: string;
  depreciationStartDate: string;
  salvageValue: string;
  endDate: string;
  remainingLifeMonths: number | null;
}

const emptyForm = {
  seriesId: '', code: '', name: '', foreignName: '', barCode: '', assetClassId: '', isActive: true,
  manufacturer: '', additionalIdentifier: '',
  serialNumber: '', inventoryNo: '', branchId: '', employeeId: '', technicianId: '',
  vendorId: '', mfrCatalogNo: '', purchaseDate: '', purchaseCost: '',
  costCenterId: '', projectId: '', distributionRuleId: '', remarks: '',
};
type Form = typeof emptyForm;

/**
 * Financials → Fixed Assets → Asset Master Data: the register of individual
 * fixed assets. The asset class decides the G/L accounts and the default
 * depreciation rules; each depreciation area carries its own parameters and
 * values. Values change only through documents — Capitalization,
 * Capitalization Credit Memo and the Depreciation Run — never by typing over
 * them here. Every field either saves and reloads, is computed, or is not
 * shown (QA FA-D8).
 */
export const AssetMasterDataWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, onFocus, onCapitalize, onOpenJournalEntry, onOpenDocument, focusAsset,
}) => {
  const { hasPermission, activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const can = {
    create: hasPermission('financials.fixed_asset.create'),
    update: hasPermission('financials.fixed_asset.update'),
    remove: hasPermission('financials.fixed_asset.delete'),
    post: hasPermission('financials.fixed_asset_document.create'),
  };

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | FixedAssetStatus>('');
  const params = useMemo(
    () => ({ ...(search.trim() ? { search: search.trim() } : {}), ...(statusFilter ? { status: statusFilter } : {}) }),
    [search, statusFilter],
  );
  const crud = useCrudResource<FixedAsset, FixedAssetPayload>('fixed-assets', fixedAssetsApi, {
    params,
    label: (a) => `${a.code} ${a.name}`,
  });

  const lookupsQuery = useQuery({
    queryKey: ['fixed-assets', 'lookups', activeCompanyId],
    queryFn: () => fixedAssetsApi.lookups(),
    enabled: !!activeCompanyId,
    staleTime: 60_000,
  });
  const lk = lookupsQuery.data;
  const lookupError = lookupsQuery.error instanceof Error ? `Could not load the dropdowns: ${lookupsQuery.error.message}` : '';

  const selectedId = crud.selected?.id ?? null;
  const detailQuery = useQuery({
    queryKey: ['fixed-assets', 'detail', activeCompanyId, selectedId],
    queryFn: () => fixedAssetsApi.getOne(selectedId as string),
    enabled: !!selectedId,
  });
  const asset = detailQuery.data && detailQuery.data.id === selectedId ? detailQuery.data : crud.selected;
  const locked = !!asset?.locked && crud.mode !== 'new';

  const [tab, setTab] = useState<Tab>('General');
  const [faTab, setFaTab] = useState<FaTab>('Overview');
  const [areaView, setAreaView] = useState('');
  const [fiscalYear, setFiscalYear] = useState<number | null>(null);
  useEffect(() => {
    if (lk && fiscalYear === null) setFiscalYear(lk.currentFiscalYear);
  }, [lk, fiscalYear]);

  const needsValues = !!selectedId && tab === 'Fixed Assets' && (faTab === 'Overview' || faTab === 'Values');
  const valuesQuery = useQuery({
    queryKey: ['fixed-assets', 'values', activeCompanyId, selectedId],
    queryFn: () => fixedAssetsApi.values(selectedId as string),
    enabled: needsValues,
  });
  const viewAreaId = areaView || asset?.areaValues.find((v) => v.area.postsToGl)?.areaId || asset?.areaValues[0]?.areaId || '';
  const forecastQuery = useQuery({
    queryKey: ['fixed-assets', 'forecast', activeCompanyId, selectedId, viewAreaId],
    queryFn: () => fixedAssetsApi.forecast(selectedId as string, 12, viewAreaId || undefined),
    enabled: !!selectedId && tab === 'Fixed Assets' && faTab === 'Depreciation',
  });

  const [form, setForm] = useState<Form>(emptyForm);
  const [areas, setAreas] = useState<AreaForm[]>([]);
  const [baseline, setBaseline] = useState('');
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const dirty = isForm && baseline !== '' && JSON.stringify({ form, areas }) !== baseline;
  useUnsavedChangesGuard('Asset Master Data', dirty);
  const discardOk = (action: string) => !dirty || window.confirm(`Asset Master Data has unsaved changes. ${action} will discard them. Continue?`);

  useEffect(() => {
    if (!focusAsset) return;
    if (!discardOk('Opening another asset')) return;
    void fixedAssetsApi.getOne(focusAsset.id).then((a) => crud.select(a)).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusAsset]);

  // A new asset starts from its class's defaults in every active area.
  const defaultAreas = (classId: string): AreaForm[] => {
    const cls = lk?.assetClasses.find((c) => c.id === classId);
    return (lk?.depreciationAreas ?? []).map((a) => ({
      areaId: a.id, code: a.code, name: a.name, postsToGl: a.postsToGl,
      depreciationMethod: cls?.depreciationMethod ?? 'STRAIGHT_LINE',
      usefulLifeMonths: String(cls?.usefulLifeMonths ?? 60),
      depreciationStartDate: '', salvageValue: '0', endDate: '', remainingLifeMonths: null,
    }));
  };
  const areasOf = (a: FixedAsset): AreaForm[] =>
    a.areaValues.map((v) => ({
      areaId: v.areaId, code: v.area.code, name: v.area.name, postsToGl: v.area.postsToGl,
      depreciationMethod: v.depreciationMethod, usefulLifeMonths: String(v.usefulLifeMonths),
      depreciationStartDate: day(v.depreciationStartDate), salvageValue: String(Number(v.salvageValue)),
      endDate: day(v.endDate), remainingLifeMonths: v.remainingLifeMonths ?? null,
    }));

  useEffect(() => {
    let next: { form: Form; areas: AreaForm[] } | null = null;
    if (crud.mode === 'new') {
      const firstClass = lk?.assetClasses[0]?.id ?? '';
      const defaultSeries = lk?.series.find((s) => s.isDefault)?.id ?? lk?.series[0]?.id ?? '';
      next = { form: { ...emptyForm, assetClassId: firstClass, seriesId: defaultSeries }, areas: defaultAreas(firstClass) };
      setTab('General');
    } else if (crud.mode === 'edit' && asset) {
      next = {
        form: {
          seriesId: '', code: asset.code, name: asset.name, foreignName: asset.foreignName ?? '', barCode: asset.barCode ?? '',
          assetClassId: asset.assetClassId, isActive: asset.isActive,
          manufacturer: asset.manufacturer ?? '', additionalIdentifier: asset.additionalIdentifier ?? '',
          serialNumber: asset.serialNumber ?? '', inventoryNo: asset.inventoryNo ?? '',
          branchId: asset.branchId ?? '', employeeId: asset.employeeId ?? '', technicianId: asset.technicianId ?? '',
          vendorId: asset.vendorId ?? '', mfrCatalogNo: asset.mfrCatalogNo ?? '', purchaseDate: day(asset.purchaseDate),
          purchaseCost: asset.purchaseCost !== null && asset.purchaseCost !== undefined ? String(Number(asset.purchaseCost)) : '',
          costCenterId: asset.costCenterId ?? '', projectId: asset.projectId ?? '', distributionRuleId: asset.distributionRuleId ?? '',
          remarks: asset.remarks ?? '',
        },
        areas: areasOf(asset),
      };
    }
    if (next) {
      setForm(next.form);
      setAreas(next.areas);
      setBaseline(JSON.stringify(next));
    } else {
      setBaseline('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crud.mode, asset?.id, asset?.updatedAt, lk]);

  const manualNumber = crud.mode === 'new' && !form.seriesId;
  const paramsEditable = isForm && !locked;

  const save = () => {
    if (!form.name.trim()) return crud.setError('Description is required.');
    if (form.name.trim().length > 200) return crud.setError('Description is at most 200 characters.');
    if (!form.assetClassId) return crud.setError('Choose the asset class: it decides the accounts and depreciation defaults.');
    if (manualNumber && !form.code.trim()) return crud.setError('Enter the asset number, or choose a numbering series.');
    if (form.costCenterId && form.distributionRuleId) return crud.setError('Choose a cost center or a distribution rule, not both.');
    const cost = form.purchaseCost.trim();
    if (cost && (!twoDecimals(cost) || Number(cost) > MAX_AMOUNT)) {
      return crud.setError('Purchase cost must be a number of at least 0 with at most 2 decimals.');
    }
    const areaParams: AssetAreaParams[] = [];
    if (paramsEditable) {
      for (const a of areas) {
        const life = Number(a.usefulLifeMonths);
        const salvage = a.salvageValue.trim() || '0';
        if (!Number.isInteger(life) || life < 1 || life > 1200) return crud.setError(`Area ${a.code}: useful life is a whole number of months from 1 to 1200.`);
        if (!twoDecimals(salvage) || Number(salvage) > MAX_AMOUNT) return crud.setError(`Area ${a.code}: salvage value must be 0 or more, with at most 2 decimals.`);
        areaParams.push({
          areaId: a.areaId, depreciationMethod: a.depreciationMethod, usefulLifeMonths: life,
          depreciationStartDate: a.depreciationStartDate || null, salvageValue: Number(salvage),
        });
      }
    }
    const editing = crud.mode === 'edit';
    // On edit every text field is sent, so clearing one clears it; on add an
    // empty field is simply left out.
    const text = (v: string) => (editing ? v.trim() : v.trim() || undefined);
    const ref = (v: string) => (editing ? v || '' : v || undefined);
    const payload: FixedAssetPayload = {
      ...(crud.mode === 'new' ? (manualNumber ? { code: form.code.trim() } : { seriesId: form.seriesId }) : locked ? {} : { code: form.code.trim() }),
      name: form.name.trim(),
      foreignName: text(form.foreignName),
      barCode: text(form.barCode),
      ...(locked ? {} : { assetClassId: form.assetClassId }),
      isActive: form.isActive,
      manufacturer: text(form.manufacturer),
      additionalIdentifier: text(form.additionalIdentifier),
      serialNumber: text(form.serialNumber),
      inventoryNo: text(form.inventoryNo),
      branchId: ref(form.branchId),
      employeeId: ref(form.employeeId),
      technicianId: ref(form.technicianId),
      vendorId: ref(form.vendorId),
      mfrCatalogNo: text(form.mfrCatalogNo),
      purchaseDate: form.purchaseDate || (editing ? null : undefined),
      purchaseCost: cost ? Number(cost) : editing ? null : undefined,
      costCenterId: ref(form.costCenterId),
      projectId: ref(form.projectId),
      distributionRuleId: ref(form.distributionRuleId),
      remarks: text(form.remarks),
      ...(paramsEditable ? { areas: areaParams } : {}),
    };
    crud.save(payload);
  };

  // Deactivate: the way out for an asset that can no longer be deleted (FA-D10).
  const activeMut = useMutation({
    mutationFn: (v: { id: string; isActive: boolean }) => fixedAssetsApi.update(v.id, { isActive: v.isActive }),
    onSuccess: (row) => {
      void qc.invalidateQueries({ queryKey: ['fixed-assets'] });
      crud.select(row);
    },
    onError: (e: unknown) => crud.setError(e instanceof Error ? e.message : 'The server refused the change.'),
  });

  const changeClass = (classId: string) => {
    if (classId === form.assetClassId) return;
    if (crud.mode === 'edit' && !window.confirm('Changing the asset class copies its depreciation defaults into every area again. Continue?')) return;
    set('assetClassId', classId);
    const defaults = defaultAreas(classId);
    setAreas((list) =>
      list.map((a) => {
        const d = defaults.find((x) => x.areaId === a.areaId);
        return d ? { ...a, depreciationMethod: d.depreciationMethod, usefulLifeMonths: d.usefulLifeMonths } : a;
      }),
    );
  };

  const selectRow = (a: FixedAsset) => {
    if (a.id === crud.selected?.id) return;
    if (!discardOk('Opening another asset')) return;
    crud.select(a);
    if (isForm) crud.cancel();
  };
  const handleClose = () => {
    if (dirty && !confirmDiscardUnsaved('Closing Asset Master Data')) return;
    onClose();
  };
  const cancelEdit = () => {
    if (!discardOk('Cancel')) return;
    crud.cancel();
  };

  const bookValue = (a: FixedAsset) => a.areaValues.find((v) => v.area.postsToGl) ?? a.areaValues[0];
  const canCapitalize = !!asset && asset.isActive && (asset.status === 'NEW' || asset.status === 'CAPITALIZED');
  const currency = lk?.currency ?? '';

  // Overview / Values: the figures of the chosen area at the end of the chosen fiscal year.
  const areaValues = (valuesQuery.data ?? []).find((x) => x.area.id === viewAreaId);
  const yearRow = (() => {
    const years = areaValues?.years ?? [];
    if (!years.length || fiscalYear === null) return null;
    const exact = years.find((y) => y.fiscalYear === fiscalYear);
    if (exact) return exact;
    if (fiscalYear < years[0].fiscalYear) return null;
    return years[years.length - 1];
  })();
  const valuesRows = (areaValues?.years ?? []).filter((y) => fiscalYear === null || y.fiscalYear <= fiscalYear);
  const viewArea = asset?.areaValues.find((v) => v.areaId === viewAreaId);
  const postedDepreciation = (asset?.transactions ?? []).filter(
    (t) => t.areaId === viewAreaId && (t.type === 'DEPRECIATION' || t.type === 'MANUAL_DEPRECIATION'),
  );

  const field = (label: string, node: React.ReactNode, required?: boolean) => (
    <FieldRow label={label} labelWidth="130px" required={required}>{node}</FieldRow>
  );
  const ro = (v: React.ReactNode) => <span className="text-[10.5px] text-[#222]">{v || '—'}</span>;
  const sel = (k: keyof Form, options: { id: string; label: string }[], opts: { disabled?: boolean; title?: string } = {}) => (
    <ClassicSel value={form[k] as string} onChange={(e) => set(k, e.target.value as never)} className="w-full" disabled={!isForm || opts.disabled} title={opts.title}>
      <option value="">—</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </ClassicSel>
  );
  const txt = (k: keyof Form, maxLength: number, placeholder?: string) => (
    <ClassicInput value={form[k] as string} onChange={(e) => set(k, e.target.value as never)} className="w-full" disabled={!isForm} placeholder={placeholder} maxLength={maxLength} />
  );
  const viewOrForm = (viewValue: React.ReactNode, node: React.ReactNode) => (isForm ? node : ro(viewValue));
  const empLabel = (e: { employeeNumber: string | null; name: string }) => (e.employeeNumber ? `${e.employeeNumber} — ${e.name}` : e.name);
  const employeeOptions = (lk?.employees ?? []).map((e) => ({ id: e.id, label: empLabel(e) }));
  const yearSelect = (
    <ClassicSel value={fiscalYear ?? ''} onChange={(e) => setFiscalYear(Number(e.target.value))} className="w-24">
      {(lk?.fiscalYears ?? []).map((y) => <option key={y} value={y}>{y}</option>)}
    </ClassicSel>
  );
  const areaSelect = (
    <ClassicSel value={viewAreaId} onChange={(e) => setAreaView(e.target.value)} className="w-48">
      {(asset?.areaValues ?? []).map((v) => <option key={v.areaId} value={v.areaId}>{v.area.code} — {v.area.name}</option>)}
    </ClassicSel>
  );

  const shownAreas: AreaForm[] = isForm ? areas : asset ? areasOf(asset) : [];

  return (
    <ClassicWindow
      title="Asset Master Data"
      icon={<Landmark className="w-3.5 h-3.5 text-gray-600" />}
      accent="#e8a01c"
      onClose={handleClose}
      onFocus={onFocus}
      windowState={windowState}
      onUpdateState={onUpdateState}
      minWidth={1050}
      minHeight={600}
      toolbar={
        <>
          <CrudToolbar
            onNew={() => {
              if (!can.create) return crud.setError('You do not have permission to add fixed assets (financials.fixed_asset.create).');
              if (!discardOk('New')) return;
              crud.openNew();
            }}
            onEdit={() => crud.selected && crud.openEdit(crud.selected)}
            onDelete={() => crud.remove()}
            onRefresh={() => { crud.refetch(); void lookupsQuery.refetch(); void detailQuery.refetch(); }}
            canEdit={!!crud.selected && can.update && !isForm}
            canDelete={!!asset?.deletable && can.remove && !isForm}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
            extra={
              <>
                {asset && !asset.deletable && can.update && !isForm && (
                  <ToolBtn
                    onClick={() => {
                      const next = !asset.isActive;
                      if (!next && !window.confirm(`Deactivate ${asset.code}? It stays in Find and in reports but is no longer offered on new documents.`)) return;
                      activeMut.mutate({ id: asset.id, isActive: next });
                    }}
                    disabled={activeMut.isPending}
                    title="An asset with postings cannot be deleted; deactivate it instead"
                  >
                    {asset.isActive ? <><Ban className="w-3 h-3" /> Deactivate</> : <><CheckCircle2 className="w-3 h-3" /> Activate</>}
                  </ToolBtn>
                )}
                <ToolBtn
                  onClick={() => asset && onCapitalize?.(asset.id, 'CAPITALIZATION')}
                  disabled={!canCapitalize || !can.post || isForm}
                  title={!can.post ? 'Needs financials.fixed_asset_document.create' : 'Open Capitalization with this asset'}
                >
                  <PlusSquare className="w-3 h-3" /> Capitalize…
                </ToolBtn>
                <ToolBtn
                  onClick={() => asset && onCapitalize?.(asset.id, 'CREDIT_MEMO')}
                  disabled={!asset || !asset.isActive || asset.status !== 'CAPITALIZED' || !can.post || isForm}
                  title="Open Capitalization Credit Memo with this asset"
                >
                  <MinusSquare className="w-3 h-3" /> Credit Memo…
                </ToolBtn>
              </>
            }
          />
          <StatusNote error={crud.error || lookupError || (detailQuery.error instanceof Error ? detailQuery.error.message : '')} status={crud.status} />
        </>
      }
      footer={<><span>{crud.rows.length} asset{crud.rows.length === 1 ? '' : 's'}</span><span>Item Type: Fixed Assets{dirty ? ' · unsaved changes' : ''}</span></>}
    >
      <div className="flex flex-1 min-h-0">
        {/* ── Register / Find ─────────────────────────────────────────────── */}
        <div className="w-[260px] shrink-0 border-r border-[#d4d0c8] bg-white flex flex-col min-h-0">
          <div className="p-1.5 border-b border-[#e0e0e0] flex gap-1 items-center">
            <Search className="w-3 h-3 text-gray-400" />
            <ClassicInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="No., description, serial, inventory, bar code" className="flex-1" />
            <ClassicSel value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as '' | FixedAssetStatus)} className="w-20">
              <option value="">All</option>
              <option value="NEW">New</option>
              <option value="CAPITALIZED">Active</option>
              <option value="RETIRED">Retired</option>
            </ClassicSel>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <ListPlaceholder noCompany={crud.noCompany} isLoading={crud.isLoading} isEmpty={!crud.isLoading && crud.rows.length === 0} emptyText={search ? 'No asset matches.' : 'No fixed assets yet. Click New.'} />
            {crud.rows.map((a) => {
              const bv = bookValue(a);
              return (
                <div
                  key={a.id}
                  onClick={() => selectRow(a)}
                  onDoubleClick={() => can.update && !isForm && crud.openEdit(a)}
                  className={cn('px-2 py-1.5 border-b border-[#f0f0f0] cursor-default', crud.selected?.id === a.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/60')}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10.5px] font-medium">{a.code}</span>
                    <span className={cn('text-[8.5px] px-1 rounded-[1px]', STATUS_STYLE[a.status])}>{STATUS_LABEL[a.status]}</span>
                  </div>
                  <div className="text-[10px] text-gray-700 truncate">{a.name}{a.isActive ? '' : ' (inactive)'}</div>
                  <div className="text-[9.5px] text-gray-500">{a.assetClass.code} · NBV {money(bv?.netBookValue)} {currency}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Asset ────────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#f0f0f0]">
          {!isForm && !asset && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400">Select an asset, or click New.</div>
          )}
          {(isForm || asset) && (
            <>
              {/* Header */}
              <div className="p-3 grid grid-cols-[1fr_260px] gap-6 shrink-0 border-b border-[#d4d0c8]">
                <div>
                  <FieldRow label="Item No." labelWidth="130px" required>
                    {crud.mode === 'new' ? (
                      <div className="flex gap-1 w-full">
                        <ClassicSel value={form.seriesId} onChange={(e) => set('seriesId', e.target.value)} className="w-32">
                          {(lk?.series ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          <option value="">Manual</option>
                        </ClassicSel>
                        {manualNumber ? (
                          <ClassicInput value={form.code} onChange={(e) => set('code', e.target.value)} className="flex-1" placeholder="Asset number" maxLength={50} autoFocus />
                        ) : (
                          <ClassicInput
                            value={(() => { const s = lk?.series.find((x) => x.id === form.seriesId); return s ? `${s.prefix ?? ''}${String(s.nextNumber).padStart(s.digits, '0')} (next)` : ''; })()}
                            readOnly disabled className="flex-1"
                          />
                        )}
                      </div>
                    ) : isForm && !locked ? (
                      <ClassicInput value={form.code} onChange={(e) => set('code', e.target.value)} className="w-48" maxLength={50} />
                    ) : ro(<span className="font-mono font-bold" title={locked ? 'Fixed once the asset is capitalized' : undefined}>{asset?.code}</span>)}
                  </FieldRow>
                  {field('Description', viewOrForm(asset?.name, txt('name', 200)), true)}
                  {field('Foreign Name', viewOrForm(asset?.foreignName, txt('foreignName', 200)))}
                  {field('Item Type', ro('Fixed Assets'))}
                  {field('Bar Code', viewOrForm(asset?.barCode, txt('barCode', 100)))}
                  <div className="flex gap-6 ml-[138px] mt-1 text-[10.5px] text-gray-600">
                    <label className="flex items-center gap-1" title="A fixed asset is never stock (FA-D16)"><input type="checkbox" checked={false} disabled readOnly /> Inventory Item</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked disabled readOnly /> Purchasing Item</label>
                  </div>
                </div>
                <div className="border-l border-[#d4d0c8] pl-4">
                  <FieldRow label="Asset Status" labelWidth="110px">
                    {asset && crud.mode !== 'new' ? <span className={cn('text-[9.5px] px-1.5 py-0.5 rounded-[1px]', STATUS_STYLE[asset.status])}>{STATUS_LABEL[asset.status]}</span> : ro('New')}
                  </FieldRow>
                  <FieldRow label="Capitalization Date" labelWidth="110px">{ro(crud.mode === 'new' ? '' : shown(asset?.capitalizedAt))}</FieldRow>
                  <FieldRow label="Quantity" labelWidth="110px">{ro(crud.mode === 'new' || !asset ? '0' : String(asset.quantity))}</FieldRow>
                  <FieldRow label="Currency" labelWidth="110px">{ro(currency)}</FieldRow>
                  <FieldRow label="Net Book Value" labelWidth="110px">{ro(asset && crud.mode !== 'new' ? money(bookValue(asset)?.netBookValue) : '')}</FieldRow>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-0.5 px-3 pt-2 shrink-0">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn('px-3 py-1 text-[10.5px] border border-b-0 rounded-t-[2px]', tab === t ? 'bg-white border-[#a0a0a0] font-bold' : 'bg-[#e5e5e5] border-[#d4d0c8] text-gray-600 hover:bg-[#f5f5f5]')}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-h-0 overflow-auto mx-3 mb-2 bg-white border border-[#a0a0a0] p-3">
                {tab === 'General' && (
                  <div className="max-w-xl">
                    {field('Manufacturer', viewOrForm(asset?.manufacturer, txt('manufacturer', 100)))}
                    {field('Additional Identifier', viewOrForm(asset?.additionalIdentifier, txt('additionalIdentifier', 100)))}
                    {field('Status', isForm
                      ? (
                        <div className="flex gap-4 text-[10.5px]">
                          <label className="flex items-center gap-1"><input type="radio" checked={form.isActive} onChange={() => set('isActive', true)} /> Active</label>
                          <label className="flex items-center gap-1"><input type="radio" checked={!form.isActive} onChange={() => set('isActive', false)} /> Inactive</label>
                        </div>
                      )
                      : ro(asset?.isActive ? 'Active' : 'Inactive (not offered on new documents)'))}
                  </div>
                )}

                {tab === 'Purchasing Data' && (
                  <div className="max-w-xl">
                    {field('Preferred Vendor', viewOrForm(asset?.vendor ? `${asset.vendor.cardCode} — ${asset.vendor.cardName}` : '',
                      sel('vendorId', (lk?.vendors ?? []).map((v) => ({ id: v.id, label: `${v.cardCode} — ${v.cardName}` })))))}
                    {field('Mfr Catalog No.', viewOrForm(asset?.mfrCatalogNo, txt('mfrCatalogNo', 100)))}
                    {field('Purchase Date', viewOrForm(shown(asset?.purchaseDate),
                      <ClassicInput type="date" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} className="w-36" />))}
                    {field('Purchase Cost', viewOrForm(asset?.purchaseCost ? `${money(asset.purchaseCost)} ${currency}` : '',
                      <ClassicInput inputMode="decimal" value={form.purchaseCost} onChange={(e) => set('purchaseCost', e.target.value)} className="w-36 text-right" placeholder="0.00" />))}
                    <div className="text-[10px] text-gray-500 mt-2 ml-[138px]">
                      The planned cost is offered as the amount when the asset is capitalized. The asset's value is set by capitalization documents, not here.
                    </div>
                  </div>
                )}

                {tab === 'Fixed Assets' && (
                  <div className="flex flex-col h-full">
                    <div className="flex gap-0.5 border-b border-[#d4d0c8] mb-3">
                      {FA_TABS.map((t) => (
                        <button key={t} onClick={() => setFaTab(t)}
                          className={cn('px-3 py-0.5 text-[10px] border border-b-0', faTab === t ? 'bg-[#fff8dc] border-[#c0a060] font-bold' : 'border-transparent text-gray-600 hover:bg-gray-100')}>
                          {t}
                        </button>
                      ))}
                    </div>

                    {faTab === 'Overview' && (
                      <>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            {field('Asset Class', isForm && !locked
                              ? (
                                <ClassicSel value={form.assetClassId} onChange={(e) => changeClass(e.target.value)} className="w-full">
                                  <option value="">—</option>
                                  {(lk?.assetClasses ?? []).map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                                  {asset && crud.mode === 'edit' && !lk?.assetClasses.some((c) => c.id === asset.assetClassId) && (
                                    <option value={asset.assetClassId}>{asset.assetClass.code} — {asset.assetClass.name} (inactive)</option>
                                  )}
                                </ClassicSel>
                              )
                              : ro(asset ? <span title={locked ? 'Fixed once the asset is capitalized; a Transfer moves it (FA-2)' : undefined}>{asset.assetClass.code} — {asset.assetClass.name}</span> : ''), true)}
                            {field('Inventory No.', viewOrForm(asset?.inventoryNo, txt('inventoryNo', 50)))}
                            {field('Serial Numbers', viewOrForm(asset?.serialNumber, txt('serialNumber', 100)))}
                            {field('Location', viewOrForm(asset?.branch?.name, sel('branchId', (lk?.branches ?? []).map((b) => ({ id: b.id, label: b.code ? `${b.code} — ${b.name}` : b.name })))))}
                            {field('Technician', viewOrForm(asset?.technician ? empLabel(asset.technician) : '', sel('technicianId', employeeOptions)))}
                            {field('Employee', viewOrForm(asset?.employee ? empLabel(asset.employee) : '', sel('employeeId', employeeOptions)))}
                            {field('Capitalization Date', ro(crud.mode === 'new' ? '' : shown(asset?.capitalizedAt)))}
                          </div>
                          <div>
                            {crud.mode === 'new' || !asset ? (
                              <div className="text-[10.5px] text-gray-500 mt-1">Values appear once the asset is saved and capitalized.</div>
                            ) : (
                              <>
                                {field('Depreciation Area', areaSelect)}
                                {field('Fiscal Year', yearSelect)}
                                {field('Acquisition & Prod. Cost', ro(<span className="font-mono">{money(yearRow?.apcLastDay ?? 0)}</span>))}
                                {field('Ordinary Depreciation', ro(<span className="font-mono">{money(yearRow?.accumulatedLastDay ?? 0)}</span>))}
                                {field('Net Book Value', ro(<span className="font-mono font-bold">{money(yearRow?.nbvLastDay ?? 0)}</span>))}
                                {field('Salvage Value', ro(<span className="font-mono">{money(viewArea?.salvageValue ?? 0)}</span>))}
                                {field('Quantity', ro(String(asset.quantity)))}
                                {valuesQuery.isFetching && <div className="text-[10px] text-gray-400 ml-[138px]">Loading…</div>}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 text-[10.5px] font-bold text-[#333]">Depreciation Parameters</div>
                        <table className="w-full border-collapse text-[10.5px] mt-1">
                          <thead>
                            <tr className="bg-[#f0f0f0]">
                              {['Depreciation Area', 'Depreciation Type', 'Start Date', 'End Date', 'Useful Life (months)', 'Remaining Life (months)', 'Salvage Value'].map((h) => (
                                <th key={h} className="text-left p-1 border border-[#d4d0c8]">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {shownAreas.map((a, i) => {
                              const upd = (patch: Partial<AreaForm>) => setAreas((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                              const end = a.endDate || lifeEnd(a.depreciationStartDate, Number(a.usefulLifeMonths));
                              return (
                                <tr key={a.areaId}>
                                  <td className="p-1 border border-[#eee] font-mono">{a.code}{a.postsToGl ? ' (G/L)' : ''}</td>
                                  <td className="p-1 border border-[#eee]">
                                    {paramsEditable ? (
                                      <ClassicSel value={a.depreciationMethod} onChange={(e) => upd({ depreciationMethod: e.target.value as DepreciationMethod })} className="w-full">
                                        {(lk?.depreciationMethods ?? []).map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                      </ClassicSel>
                                    ) : (lk?.depreciationMethods.find((m) => m.value === a.depreciationMethod)?.label ?? a.depreciationMethod)}
                                  </td>
                                  <td className="p-1 border border-[#eee]">
                                    {paramsEditable
                                      ? <ClassicInput type="date" value={a.depreciationStartDate} onChange={(e) => upd({ depreciationStartDate: e.target.value, endDate: '' })} className="w-36" title="Empty: the first capitalization's asset value date" />
                                      : shown(a.depreciationStartDate) || '—'}
                                  </td>
                                  <td className="p-1 border border-[#eee]">{shown(end) || '—'}</td>
                                  <td className="p-1 border border-[#eee]">
                                    {paramsEditable
                                      ? <ClassicInput type="number" min={1} max={1200} step={1} value={a.usefulLifeMonths} onChange={(e) => upd({ usefulLifeMonths: e.target.value, endDate: '' })} className="w-20 text-right" />
                                      : a.usefulLifeMonths}
                                  </td>
                                  <td className="p-1 border border-[#eee]">{a.remainingLifeMonths ?? (Number(a.usefulLifeMonths) || '—')}</td>
                                  <td className="p-1 border border-[#eee]">
                                    {paramsEditable
                                      ? <ClassicInput inputMode="decimal" value={a.salvageValue} onChange={(e) => upd({ salvageValue: e.target.value })} className="w-28 text-right" />
                                      : money(a.salvageValue)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="text-[10px] text-gray-500 mt-2">
                          {locked
                            ? 'Locked: the asset has been capitalized. The depreciation run computes from these parameters.'
                            : 'Defaults come from the asset class and stay editable until the first capitalization. An empty start date becomes the first capitalization’s asset value date.'}
                        </div>
                      </>
                    )}

                    {faTab === 'Values' && (
                      <>
                        {!selectedId && <div className="text-[10.5px] text-gray-500">Save the asset first.</div>}
                        {selectedId && (
                          <>
                            <div className="flex items-center gap-2 mb-2 text-[10.5px]">
                              <span>Depreciation Area</span>{areaSelect}
                              <span>Up to Fiscal Year</span>{yearSelect}
                              {valuesQuery.isFetching && <span className="text-gray-400">Loading…</span>}
                            </div>
                            <table className="w-full border-collapse text-[10.5px]">
                              <thead>
                                <tr className="bg-[#f0f0f0]">
                                  {['Fiscal Year', 'APC First Day', 'Acquisition', 'Retirement', 'Transfer', 'Write-Up', 'Ordinary Dep.', 'Unplanned Dep.', 'APC Last Day', 'NBV Last Day'].map((h) => (
                                    <th key={h} className="text-right first:text-left p-1 border border-[#d4d0c8]">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {valuesRows.map((y) => (
                                  <tr key={y.fiscalYear}>
                                    <td className="p-1 border border-[#eee]">{y.fiscalYear}</td>
                                    {[y.apcFirstDay, y.acquisition, y.retirement, y.transfer, y.writeUp, y.ordinaryDepreciation, y.unplannedDepreciation, y.apcLastDay, y.nbvLastDay].map((v, j) => (
                                      <td key={j} className="p-1 border border-[#eee] text-right font-mono">{money(v)}</td>
                                    ))}
                                  </tr>
                                ))}
                                {!valuesRows.length && !valuesQuery.isFetching && (
                                  <tr><td colSpan={10} className="p-2 text-gray-500">No values in this area up to {fiscalYear}.</td></tr>
                                )}
                              </tbody>
                            </table>
                            <div className="text-[10px] text-gray-500 mt-2">Acquisition is net of capitalization credit memos. Retirement, transfer and write-up arrive with their modules.</div>
                          </>
                        )}
                      </>
                    )}

                    {faTab === 'Depreciation' && (
                      <>
                        {!selectedId && <div className="text-[10.5px] text-gray-500">Save the asset first.</div>}
                        {selectedId && (
                          <>
                            <div className="flex items-center gap-2 mb-2 text-[10.5px]">
                              <span>Depreciation Area</span>{areaSelect}
                              {forecastQuery.isFetching && <span className="text-gray-400">Loading…</span>}
                            </div>
                            <div className="text-[10.5px] font-bold mb-1">Posted depreciation</div>
                            <table className="w-full border-collapse text-[10.5px] mb-3">
                              <thead>
                                <tr className="bg-[#f0f0f0]">
                                  {['Posting Date', 'Area', 'Type', 'Amount', 'JE No.'].map((h) => <th key={h} className="text-left p-1 border border-[#d4d0c8]">{h}</th>)}
                                </tr>
                              </thead>
                              <tbody>
                                {postedDepreciation.map((t) => (
                                  <tr key={t.id}>
                                    <td className="p-1 border border-[#eee]">{shown(t.postingDate)}</td>
                                    <td className="p-1 border border-[#eee] font-mono">{t.area?.code ?? '—'}</td>
                                    <td className="p-1 border border-[#eee]">{TX_LABEL[t.type] ?? t.type}</td>
                                    <td className="p-1 border border-[#eee] text-right font-mono">{money(t.amount)}</td>
                                    <td className="p-1 border border-[#eee]">
                                      {t.journalEntry
                                        ? <button className="text-blue-700 underline font-mono" onClick={() => onOpenJournalEntry?.(t.journalEntry!.id)}>{t.journalEntry.number}</button>
                                        : <span className="text-gray-400">statistical</span>}
                                    </td>
                                  </tr>
                                ))}
                                {!postedDepreciation.length && <tr><td colSpan={5} className="p-2 text-gray-500">No depreciation posted in this area yet.</td></tr>}
                              </tbody>
                            </table>
                            <div className="text-[10.5px] font-bold mb-1">Next 12 months (planned)</div>
                            <table className="w-full border-collapse text-[10.5px]">
                              <thead>
                                <tr className="bg-[#f0f0f0]">
                                  {['Month', 'Period End', 'Planned Depreciation', 'Accumulated', 'Net Book Value'].map((h) => (
                                    <th key={h} className="text-right first:text-left p-1 border border-[#d4d0c8]">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(forecastQuery.data?.rows ?? []).map((r) => (
                                  <tr key={r.month}>
                                    <td className="p-1 border border-[#eee]">{r.month}</td>
                                    <td className="p-1 border border-[#eee] text-right">{shown(r.date)}</td>
                                    <td className="p-1 border border-[#eee] text-right font-mono">{money(r.charge)}</td>
                                    <td className="p-1 border border-[#eee] text-right font-mono">{money(r.accumulated)}</td>
                                    <td className="p-1 border border-[#eee] text-right font-mono">{money(r.netBookValue)}</td>
                                  </tr>
                                ))}
                                {forecastQuery.data && !forecastQuery.data.rows.length && (
                                  <tr><td colSpan={5} className="p-2 text-gray-500">Nothing planned: the asset is not capitalized in this area, or it is fully depreciated.</td></tr>
                                )}
                              </tbody>
                            </table>
                          </>
                        )}
                      </>
                    )}

                    {faTab === 'Cost Accounting' && (
                      <div className="max-w-xl">
                        {field('Cost Center', viewOrForm(asset?.costCenter ? `${asset.costCenter.code} — ${asset.costCenter.name}` : '',
                          sel('costCenterId', (lk?.costCenters ?? []).map((c) => ({ id: c.id, label: `${c.code} — ${c.name}` })),
                            { disabled: !!form.distributionRuleId, title: form.distributionRuleId ? 'Clear the distribution rule first: one or the other' : undefined })))}
                        {field('Distribution Rule', viewOrForm(asset?.distributionRule ? `${asset.distributionRule.code} — ${asset.distributionRule.name}` : '',
                          sel('distributionRuleId', (lk?.distributionRules ?? []).map((c) => ({ id: c.id, label: `${c.code} — ${c.name}` })),
                            { disabled: !!form.costCenterId, title: form.costCenterId ? 'Clear the cost center first: one or the other' : undefined })))}
                        {field('Project', viewOrForm(asset?.project ? `${asset.project.code} — ${asset.project.name}` : '',
                          sel('projectId', (lk?.projects ?? []).map((c) => ({ id: c.id, label: `${c.code} — ${c.name}` })))))}
                        <div className="text-[10px] text-gray-500 mt-2 ml-[138px]">
                          The cost center or distribution rule, and the project, go on the depreciation expense line; the project also goes on capitalization lines.
                        </div>
                      </div>
                    )}

                    {faTab === 'Accounts' && (
                      <div className="max-w-xl">
                        {(!asset || crud.mode === 'new') && <div className="text-[10.5px] text-gray-500">The accounts come from the asset class once the asset is saved.</div>}
                        {asset && crud.mode !== 'new' && (
                          <>
                            {field('APC Account', ro(`${asset.assetClass.assetAccount.code} — ${asset.assetClass.assetAccount.name}`))}
                            {field('Accumulated Dep.', ro(`${asset.assetClass.accumulatedDepreciationAccount.code} — ${asset.assetClass.accumulatedDepreciationAccount.name}`))}
                            {field('Depreciation Exp.', ro(`${asset.assetClass.depreciationExpenseAccount.code} — ${asset.assetClass.depreciationExpenseAccount.name}`))}
                            {field('Acquisition Clearing', ro(`${asset.assetClass.clearingAccount.code} — ${asset.assetClass.clearingAccount.name}`))}
                            <div className="text-[10px] text-gray-500 mt-2 ml-[138px]">
                              Set per asset class under Administration → Setup → Financials → Fixed Assets → Asset Classes.
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'History' && (
                  <>
                    {!asset?.transactions?.length && <div className="text-[10.5px] text-gray-500">No movements yet.</div>}
                    {!!asset?.transactions?.length && crud.mode !== 'new' && (
                      <table className="w-full border-collapse text-[10.5px]">
                        <thead>
                          <tr className="bg-[#f0f0f0]">
                            {['Posting Date', 'Area', 'Movement', 'Amount', 'Document', 'Journal Entry', 'Remarks'].map((h) => (
                              <th key={h} className="text-left p-1 border border-[#d4d0c8]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {asset.transactions.map((t) => (
                            <tr key={t.id}>
                              <td className="p-1 border border-[#eee]">{shown(t.postingDate)}</td>
                              <td className="p-1 border border-[#eee] font-mono">{t.area?.code ?? '—'}</td>
                              <td className="p-1 border border-[#eee]">{TX_LABEL[t.type] ?? t.type}</td>
                              <td className={cn('p-1 border border-[#eee] text-right font-mono', Number(t.amount) < 0 && 'text-red-700')}>{money(t.amount)}</td>
                              <td className="p-1 border border-[#eee]">
                                {t.capitalization ? (
                                  <button className="text-blue-700 underline" onClick={() => onOpenDocument?.(t.capitalization!.id, t.capitalization!.kind)}>
                                    {t.capitalization.number}{t.capitalization.status === 'CANCELLED' ? ' (cancelled)' : ''}
                                  </button>
                                ) : '—'}
                              </td>
                              <td className="p-1 border border-[#eee]">
                                {t.journalEntry ? (
                                  <button className="text-blue-700 underline font-mono" onClick={() => onOpenJournalEntry?.(t.journalEntry!.id)}>{t.journalEntry.number}</button>
                                ) : <span className="text-gray-400">{t.area ? 'statistical' : '—'}</span>}
                              </td>
                              <td className="p-1 border border-[#eee]">{t.remarks ?? ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}

                {tab === 'Remarks' && (
                  isForm
                    ? <textarea value={form.remarks} maxLength={5000} onChange={(e) => set('remarks', e.target.value)} className="w-full h-40 border border-[#d4d0c8] p-2 text-[11px] outline-none focus:border-orange-400" />
                    : <div className="text-[11px] whitespace-pre-wrap">{asset?.remarks || <span className="text-gray-400">No remarks.</span>}</div>
                )}
              </div>

              {isForm && (
                <div className="px-3 pb-3 flex gap-2 shrink-0">
                  <YellowBtn onClick={save} disabled={crud.isBusy}>{crud.isBusy ? 'Saving…' : crud.mode === 'new' ? 'Add' : 'Update'}</YellowBtn>
                  <GreyBtn onClick={cancelEdit}>Cancel</GreyBtn>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
