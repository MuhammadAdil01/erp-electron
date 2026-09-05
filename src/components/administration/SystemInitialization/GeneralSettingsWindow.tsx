import React, { useEffect, useMemo, useState } from 'react';
import { Settings2, RefreshCw, RotateCcw, Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { settingsApi } from '../../../api/administration.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';
import {
  GENERAL_SETTINGS_TABS,
  defaultsFor,
  type FieldSpec,
  type TabSpec,
} from './generalSettings.schema';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

type Values = Record<string, string | number | boolean>;

/** Merges a group's stored values over the tab's shipped defaults. */
const seed = (tab: TabSpec, stored: Record<string, unknown> | undefined): Values => {
  const out = defaultsFor(tab);
  if (!stored) return out;
  for (const section of tab.sections) {
    for (const field of section.fields) {
      const v = stored[field.key];
      if (v === undefined || v === null) continue;
      out[field.key] =
        field.type === 'checkbox' ? Boolean(v)
        : field.type === 'number' ? Number(v)
        : String(v);
    }
  }
  return out;
};

/**
 * General Settings.
 *
 * Fifteen tabs of preferences, every one of them now persisted. The controls are
 * described in `generalSettings.schema.ts` and rendered from that description,
 * so a control cannot exist without a key to save it under — which is exactly
 * how the previous version ended up with two hundred inputs and no storage.
 *
 * Each tab owns one backend settings group and saves only its own keys. The
 * backend merges rather than replaces, so saving the Display tab cannot discard
 * what the Inventory tab holds.
 */
export const GeneralSettingsWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [activeKey, setActiveKey] = useState(GENERAL_SETTINGS_TABS[0].key);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  /** Per-tab edits, kept so switching tabs does not discard unsaved work. */
  const [edits, setEdits] = useState<Record<string, Values>>({});

  const tab = useMemo(
    () => GENERAL_SETTINGS_TABS.find((t) => t.key === activeKey) ?? GENERAL_SETTINGS_TABS[0],
    [activeKey],
  );

  const groupQuery = useQuery({
    queryKey: ['settings-group', companyId, tab.group],
    queryFn: () => settingsApi.getGroup(tab.group),
    enabled: !!companyId,
  });

  const stored = useMemo(() => seed(tab, groupQuery.data), [tab, groupQuery.data]);
  const values = edits[tab.key] ?? stored;

  const dirtyKeys = useMemo(() => {
    const current = edits[tab.key];
    if (!current) return [] as string[];
    return Object.keys(current).filter((k) => current[k] !== stored[k]);
  }, [edits, tab.key, stored]);

  // A tab has an entry here only while it holds unsaved edits — the entry is
  // dropped on save and on discard. That is enough to warn about work on tabs
  // that are not on screen, without holding every tab's server state in memory.
  const editedTabKeys = useMemo(() => Object.keys(edits), [edits]);

  // Leaving the window with unsaved edits should cost something more than a
  // silent loss, so the browser's own prompt is used while any tab is dirty.
  useEffect(() => {
    if (!editedTabKeys.length) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [editedTabKeys.length]);

  const setValue = (key: string, value: string | number | boolean) =>
    setEdits((prev) => ({
      ...prev,
      [tab.key]: { ...(prev[tab.key] ?? stored), [key]: value },
    }));

  const saveMut = useMutation({
    mutationFn: () => {
      const current = edits[tab.key];
      if (!current) return Promise.resolve({});
      // Only the keys that actually changed are sent. Posting the whole group
      // would rewrite every row on every save and lose the distinction between
      // "the company chose this value" and "this is still the shipped default".
      const payload: Record<string, unknown> = {};
      for (const k of dirtyKeys) payload[k] = current[k];
      if (!Object.keys(payload).length) return Promise.resolve({});
      return settingsApi.saveGroup(tab.group, payload);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['settings-group', companyId, tab.group] });
      setEdits((prev) => {
        const next = { ...prev };
        delete next[tab.key];
        return next;
      });
      setError('');
      setStatus(`${tab.label} settings saved.`);
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : 'The server rejected those settings.');
      setStatus('');
    },
  });

  const resetMut = useMutation({
    mutationFn: () => settingsApi.resetGroup(tab.group),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['settings-group', companyId, tab.group] });
      setEdits((prev) => {
        const next = { ...prev };
        delete next[tab.key];
        return next;
      });
      setError('');
      setStatus(`${tab.label} restored to defaults.`);
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : 'Could not reset that tab.');
      setStatus('');
    },
  });

  const isBusy = saveMut.isPending || resetMut.isPending;

  const renderField = (field: FieldSpec) => {
    if (field.dependsOn && !values[field.dependsOn]) return null;
    const value = values[field.key];

    const control = (() => {
      switch (field.type) {
        case 'checkbox':
          return (
            <label className="flex items-start gap-2 text-[11px] cursor-pointer py-0.5">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 mt-[1px]"
                checked={Boolean(value)}
                onChange={(e) => setValue(field.key, e.target.checked)}
              />
              <span>{field.label}</span>
            </label>
          );
        case 'select':
          return (
            <div className="grid grid-cols-[minmax(150px,1fr)_180px] items-center gap-2 py-0.5">
              <span className="text-[11px] text-gray-700">{field.label}</span>
              <ClassicSel
                value={String(value ?? '')}
                onChange={(e) => setValue(field.key, e.target.value)}
                className="w-full"
              >
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </ClassicSel>
            </div>
          );
        case 'number':
          return (
            <div className="grid grid-cols-[minmax(150px,1fr)_100px] items-center gap-2 py-0.5">
              <span className="text-[11px] text-gray-700">{field.label}</span>
              <ClassicInput
                type="number"
                value={String(value ?? '')}
                min={field.min}
                max={field.max}
                onChange={(e) => setValue(field.key, e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-right"
              />
            </div>
          );
        case 'color':
          return (
            <div className="grid grid-cols-[minmax(150px,1fr)_180px] items-center gap-2 py-0.5">
              <span className="text-[11px] text-gray-700">{field.label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={String(value ?? '#ececec')}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  className="w-8 h-[18px] border border-gray-400 p-0"
                />
                <ClassicInput
                  value={String(value ?? '')}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          );
        default:
          return (
            <div className={cn(
              'grid items-center gap-2 py-0.5',
              field.wide ? 'grid-cols-[180px_1fr]' : 'grid-cols-[minmax(150px,1fr)_180px]',
            )}>
              <span className="text-[11px] text-gray-700">{field.label}</span>
              <ClassicInput
                type={field.type === 'password' ? 'password' : 'text'}
                value={String(value ?? '')}
                placeholder={field.placeholder}
                onChange={(e) => setValue(field.key, e.target.value)}
                className="w-full"
              />
            </div>
          );
      }
    })();

    return (
      <div key={field.key} className={cn(field.wide && 'col-span-2')}>
        {control}
        {field.hint && (
          <div className="text-[9.5px] text-gray-500 pl-[22px] -mt-0.5 mb-1">{field.hint}</div>
        )}
      </div>
    );
  };

  return (
    <ClassicWindow
      title="General Settings"
      icon={<Settings2 className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={940}
      minHeight={600}
      toolbar={
        <>
          <ToolBtn onClick={() => saveMut.mutate()} disabled={isBusy || !dirtyKeys.length}>
            <Save className="w-3 h-3" />
            {saveMut.isPending ? 'Saving…' : `Save${dirtyKeys.length ? ` (${dirtyKeys.length})` : ''}`}
          </ToolBtn>
          <ToolBtn
            onClick={() => setEdits((prev) => { const n = { ...prev }; delete n[tab.key]; return n; })}
            disabled={!dirtyKeys.length}
          >
            <RotateCcw className="w-3 h-3" /> Discard
          </ToolBtn>
          <ToolBtn
            danger
            onClick={() => {
              if (!window.confirm(
                `Restore the ${tab.label} tab to its shipped defaults?\n\n` +
                'Every value this company has overridden on this tab is deleted.',
              )) return;
              resetMut.mutate();
            }}
            disabled={isBusy || !companyId}
          >
            Reset Tab
          </ToolBtn>
          <ToolBtn onClick={() => groupQuery.refetch()} title="Reload from the server">
            <RefreshCw className={cn('w-3 h-3', groupQuery.isFetching && 'animate-spin')} />
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>
            {tab.label} · group “{tab.group}”
            {dirtyKeys.length ? ` · ${dirtyKeys.length} unsaved change(s)` : ''}
            {editedTabKeys.length > 1 ? ` · ${editedTabKeys.length} tabs edited` : ''}
          </span>
          <span>General Settings</span>
        </>
      }
    >
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* ── Tab rail ── */}
        <div className="w-[150px] shrink-0 border-r border-[#d4d0c8] bg-[#f7f7f7] overflow-auto custom-scrollbar">
          {GENERAL_SETTINGS_TABS.map((t) => {
            const isDirty = Boolean(edits[t.key]);
            return (
              <div
                key={t.key}
                onClick={() => { setActiveKey(t.key); setError(''); setStatus(''); }}
                className={cn(
                  'px-3 py-1.5 text-[11px] cursor-default border-b border-[#e8e8e8]',
                  t.key === activeKey ? 'bg-[#ffed99] font-bold' : 'hover:bg-white',
                )}
              >
                {t.label}
                {isDirty && <span className="text-amber-700 ml-1" title="Unsaved changes">•</span>}
              </div>
            );
          })}
        </div>

        {/* ── Fields ── */}
        <div className="flex-1 min-w-0 overflow-auto bg-white p-3 custom-scrollbar">
          {!companyId ? (
            <div className="text-[10px] text-gray-500 italic">
              No company selected. Open{' '}
              <span className="font-medium not-italic">Administration → Choose Company</span> first.
            </div>
          ) : groupQuery.isLoading ? (
            <div className="text-[10.5px] text-gray-400">Loading settings…</div>
          ) : (
            <div className="space-y-4 max-w-[880px]">
              {tab.sections.map((section) => (
                <div key={section.title}>
                  <div className="text-[11px] font-bold text-gray-800 border-b border-[#e5e5e5] pb-0.5 mb-1.5">
                    {section.title}
                  </div>
                  <div className="grid grid-cols-2 gap-x-8">
                    {section.fields.map(renderField)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── OK / Cancel ── */}
      <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
        <YellowBtn
          onClick={() => {
            if (!dirtyKeys.length) { onClose(); return; }
            // OK saves this tab and closes. Only this tab: another tab's edits
            // are still on screen behind it, and silently writing them from a
            // button the user pressed on a different tab is not what OK means.
            saveMut.mutate(undefined, { onSuccess: () => onClose() });
          }}
          disabled={isBusy || !companyId}
        >
          {saveMut.isPending ? 'Saving…' : 'OK'}
        </YellowBtn>
        <GreyBtn onClick={onClose}>Cancel</GreyBtn>
        {editedTabKeys.filter((k) => k !== tab.key).length > 0 && (
          <span className="text-[9.5px] text-amber-800 ml-1">
            Other tabs have unsaved changes — save each one before closing.
          </span>
        )}
      </div>
    </ClassicWindow>
  );
};
