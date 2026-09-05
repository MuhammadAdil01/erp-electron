import React, { useMemo, useState } from 'react';
import { KeyRound, Plus, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  licenseApi,
  type ImportLicensePayload,
  type LicenseAllocation,
} from '../../../api/administration.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

type Tab = 'allocation' | 'components' | 'assignment';

const emptyImport = {
  licenseKey: '',
  licenseServer: '',
  port: '40000',
  hardwareKey: '',
  installationNumber: '',
  systemNumber: '',
  validFrom: '',
  validTo: '',
  importedFileName: '',
  components: [{ code: '', name: '', totalCount: '1' }],
};

/**
 * License Administration.
 *
 * Seats are counted from the assignment rows, never stored — so "Used" and
 * "Available" cannot drift from who actually holds a seat. Assigning past the
 * entitlement is refused server-side inside the same transaction that counts,
 * so two operators handing out the last seat at once cannot both win.
 */
export const LicenseAdministrationWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [tab, setTab] = useState<Tab>('allocation');
  const [componentId, setComponentId] = useState('');
  const [userId, setUserId] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [imp, setImp] = useState(emptyImport);
  const [hideLocked, setHideLocked] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const allocationQuery = useQuery<LicenseAllocation>({
    queryKey: ['license-allocation', companyId],
    queryFn: () => licenseApi.allocation(),
    enabled: !!companyId,
  });

  const data = allocationQuery.data;
  const components = data?.components ?? [];
  const users = useMemo(
    () => (data?.users ?? []).filter((u) => (hideLocked ? u.isActive : true)),
    [data, hideLocked],
  );
  const assignments = data?.assignments ?? [];

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected that request.');
    setStatus('');
  };
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['license-allocation'] });

  const importMut = useMutation({
    mutationFn: () => {
      const payload: ImportLicensePayload = {
        licenseKey: imp.licenseKey.trim(),
        licenseServer: imp.licenseServer.trim() || undefined,
        port: imp.port ? Number(imp.port) : undefined,
        hardwareKey: imp.hardwareKey.trim() || undefined,
        installationNumber: imp.installationNumber.trim() || undefined,
        systemNumber: imp.systemNumber.trim() || undefined,
        validFrom: imp.validFrom || undefined,
        validTo: imp.validTo || undefined,
        importedFileName: imp.importedFileName.trim() || undefined,
        components: imp.components
          .filter((c) => c.code.trim())
          .map((c) => ({
            code: c.code.trim().toUpperCase(),
            name: c.name.trim() || c.code.trim().toUpperCase(),
            totalCount: Number(c.totalCount) || 0,
          })),
      };
      return licenseApi.import(payload);
    },
    onSuccess: () => {
      invalidate();
      setShowImport(false);
      setImp(emptyImport);
      setError('');
      setStatus('License imported.');
    },
    onError: onErr,
  });

  const assignMut = useMutation({
    mutationFn: () => licenseApi.assign(componentId, userId),
    onSuccess: (a) => {
      invalidate();
      setUserId('');
      setError('');
      setStatus(`${a.component.code} assigned to ${a.user.email}.`);
    },
    onError: onErr,
  });

  const unassignMut = useMutation({
    mutationFn: (id: string) => licenseApi.unassign(id),
    onSuccess: () => {
      invalidate();
      setError('');
      setStatus('Seat released.');
    },
    onError: onErr,
  });

  const isBusy = importMut.isPending || assignMut.isPending || unassignMut.isPending;

  const handleImport = () => {
    if (!imp.licenseKey.trim()) { setError('A license key is required.'); return; }
    if (imp.validFrom && imp.validTo && imp.validTo < imp.validFrom) {
      setError('The license end date is before its start date.');
      return;
    }
    const bad = imp.components.find((c) => c.code.trim() && Number(c.totalCount) < 0);
    if (bad) { setError(`Component ${bad.code} has a negative seat count.`); return; }
    setError('');
    importMut.mutate();
  };

  const handleAssign = () => {
    if (!componentId) { setError('Pick a component first.'); return; }
    if (!userId) { setError('Pick a user.'); return; }
    setError('');
    assignMut.mutate();
  };

  const seatsFor = (uid: string) =>
    assignments.filter((a) => a.userId === uid);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'allocation', label: 'Allocation' },
    { key: 'components', label: 'Components' },
    { key: 'assignment', label: 'Assignment' },
  ];

  return (
    <ClassicWindow
      title="License Administration"
      icon={<KeyRound className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={940}
      minHeight={580}
      toolbar={
        <>
          <ToolBtn onClick={() => { setShowImport(true); setError(''); setStatus(''); }} disabled={isBusy}>
            <Upload className="w-3 h-3" /> Import License File
          </ToolBtn>
          <ToolBtn onClick={() => allocationQuery.refetch()} title="Refresh">
            <RefreshCw className={cn('w-3 h-3', allocationQuery.isFetching && 'animate-spin')} /> Refresh
          </ToolBtn>
          <label className="flex items-center gap-1.5 text-[10.5px] ml-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3"
              checked={hideLocked}
              onChange={(e) => setHideLocked(e.target.checked)}
            />
            Hide Locked Users
          </label>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>
            {data?.license
              ? `License ${data.license.licenseKey}${data.license.validTo ? ` · expires ${new Date(data.license.validTo).toLocaleDateString()}` : ''}`
              : 'No license imported'}
            {' · '}
            {assignments.length} seat(s) in use
          </span>
          <span>License Administration</span>
        </>
      }
    >
      {!companyId ? (
        <div className="p-3 text-[10px] text-gray-500 italic">
          No company selected. Open{' '}
          <span className="font-medium not-italic">Administration → Choose Company</span> first.
        </div>
      ) : (
        <>
          {/* ── License header ── */}
          <div className="shrink-0 bg-[#f7f7f7] border-b border-[#d4d0c8] px-3 py-2">
            <div className="grid grid-cols-3 gap-x-6 gap-y-0.5">
              <FieldRow label="License Server" labelWidth="110px">
                <ClassicInput value={data?.license?.licenseServer ?? ''} readOnly className="w-full bg-[#f0f0f0]" />
              </FieldRow>
              <FieldRow label="Port" labelWidth="60px">
                <ClassicInput value={String(data?.license?.port ?? '')} readOnly className="w-24 bg-[#f0f0f0]" />
              </FieldRow>
              <FieldRow label="License" labelWidth="70px">
                <ClassicInput value={data?.license?.licenseKey ?? ''} readOnly className="w-full bg-[#f0f0f0] font-mono" />
              </FieldRow>
            </div>
          </div>

          {/* ── Import pane ── */}
          {showImport && (
            <div className="shrink-0 bg-[#fffbe6] border-b border-[#e0d090] p-3 max-h-[300px] overflow-auto custom-scrollbar">
              <div className="text-[11px] font-bold mb-2">Import License File</div>
              <div className="grid grid-cols-3 gap-x-6 gap-y-1">
                <FieldRow label="License Key" labelWidth="120px" required>
                  <ClassicInput
                    value={imp.licenseKey}
                    onChange={(e) => setImp((s) => ({ ...s, licenseKey: e.target.value }))}
                    className="w-full font-mono"
                    placeholder="0020345074-0001083"
                    autoFocus
                  />
                </FieldRow>
                <FieldRow label="License Server" labelWidth="120px">
                  <ClassicInput
                    value={imp.licenseServer}
                    onChange={(e) => setImp((s) => ({ ...s, licenseServer: e.target.value }))}
                    className="w-full"
                    placeholder="192.168.109.6"
                  />
                </FieldRow>
                <FieldRow label="Port" labelWidth="120px">
                  <ClassicInput
                    type="number"
                    value={imp.port}
                    onChange={(e) => setImp((s) => ({ ...s, port: e.target.value }))}
                    className="w-full"
                  />
                </FieldRow>

                <FieldRow label="Hardware Key" labelWidth="120px">
                  <ClassicInput
                    value={imp.hardwareKey}
                    onChange={(e) => setImp((s) => ({ ...s, hardwareKey: e.target.value }))}
                    className="w-full font-mono"
                  />
                </FieldRow>
                <FieldRow label="Installation No." labelWidth="120px">
                  <ClassicInput
                    value={imp.installationNumber}
                    onChange={(e) => setImp((s) => ({ ...s, installationNumber: e.target.value }))}
                    className="w-full font-mono"
                  />
                </FieldRow>
                <FieldRow label="System No." labelWidth="120px">
                  <ClassicInput
                    value={imp.systemNumber}
                    onChange={(e) => setImp((s) => ({ ...s, systemNumber: e.target.value }))}
                    className="w-full font-mono"
                  />
                </FieldRow>

                <FieldRow label="Valid From" labelWidth="120px">
                  <ClassicInput
                    type="date"
                    value={imp.validFrom}
                    onChange={(e) => setImp((s) => ({ ...s, validFrom: e.target.value }))}
                    className="w-full"
                  />
                </FieldRow>
                <FieldRow label="Valid To" labelWidth="120px">
                  <ClassicInput
                    type="date"
                    value={imp.validTo}
                    onChange={(e) => setImp((s) => ({ ...s, validTo: e.target.value }))}
                    className="w-full"
                  />
                </FieldRow>
                <FieldRow label="File Name" labelWidth="120px">
                  <ClassicInput
                    value={imp.importedFileName}
                    onChange={(e) => setImp((s) => ({ ...s, importedFileName: e.target.value }))}
                    className="w-full"
                    placeholder="license.txt"
                  />
                </FieldRow>
              </div>

              <div className="text-[11px] font-bold mt-3 mb-1">Components</div>
              {imp.components.map((c, i) => (
                <div key={i} className="flex items-end gap-2 mb-1">
                  <ClassicInput
                    value={c.code}
                    onChange={(e) => setImp((s) => {
                      const next = [...s.components];
                      next[i] = { ...next[i], code: e.target.value.toUpperCase() };
                      return { ...s, components: next };
                    })}
                    className="w-40 font-mono"
                    placeholder="PROFESSIONAL"
                  />
                  <ClassicInput
                    value={c.name}
                    onChange={(e) => setImp((s) => {
                      const next = [...s.components];
                      next[i] = { ...next[i], name: e.target.value };
                      return { ...s, components: next };
                    })}
                    className="w-56"
                    placeholder="Professional User"
                  />
                  <ClassicInput
                    type="number"
                    min={0}
                    value={c.totalCount}
                    onChange={(e) => setImp((s) => {
                      const next = [...s.components];
                      next[i] = { ...next[i], totalCount: e.target.value };
                      return { ...s, components: next };
                    })}
                    className="w-20 text-right"
                  />
                  <button
                    className="text-[11px] px-1 opacity-60 hover:opacity-100 hover:text-red-700"
                    onClick={() => setImp((s) => ({
                      ...s,
                      components: s.components.filter((_, idx) => idx !== i),
                    }))}
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <GreyBtn
                onClick={() => setImp((s) => ({
                  ...s,
                  components: [...s.components, { code: '', name: '', totalCount: '1' }],
                }))}
              >
                <span className="inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add Component</span>
              </GreyBtn>

              <div className="flex items-center gap-2 mt-3">
                <YellowBtn onClick={handleImport} disabled={isBusy}>
                  {importMut.isPending ? 'Importing…' : 'Import'}
                </YellowBtn>
                <GreyBtn onClick={() => { setShowImport(false); setError(''); }}>Cancel</GreyBtn>
                <span className="text-[9.5px] text-gray-600 ml-1">
                  Re-importing the same key renews it in place. A renewal that cuts a component
                  below its assigned seats is refused rather than quietly over-allocating.
                </span>
              </div>
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="shrink-0 flex px-2 pt-1.5 bg-[#ececec] border-b border-[#d4d0c8]">
            {TABS.map(({ key, label }) => {
              const active = tab === key;
              return (
                <div
                  key={key}
                  onClick={() => { setTab(key); setError(''); setStatus(''); }}
                  style={{ marginBottom: active ? '-1px' : 0 }}
                  className={cn(
                    'relative px-5 py-1 text-[11px] font-medium cursor-default rounded-t-[3px] border-l border-t border-r',
                    active
                      ? 'bg-white border-[#d4d0c8] text-black z-10'
                      : 'bg-gradient-to-b from-[#f0f0f0] to-[#e0e0e0] border-gray-300 text-gray-600',
                  )}
                >
                  {active && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ffd700] rounded-t-[3px]" />}
                  {label}
                </div>
              );
            })}
          </div>

          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Users */}
            {(tab === 'allocation' || tab === 'assignment') && (
              <div className="flex-1 min-w-0 overflow-auto bg-white custom-scrollbar border-r border-[#d4d0c8]">
                <table className="w-full border-collapse text-[10.5px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                      <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">User Code</th>
                      <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">User Name</th>
                      <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Role</th>
                      <th className="px-2 py-1 font-bold text-[#444]">Seats Held</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const seats = seatsFor(u.id);
                      return (
                        <tr
                          key={u.id}
                          onClick={() => { setUserId(u.id); setError(''); }}
                          className={cn(
                            'border-b border-[#f0f0f0] cursor-default',
                            userId === u.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/50',
                            !u.isActive && 'text-gray-400 italic',
                          )}
                        >
                          <td className="px-2 py-1 border-r border-[#f0f0f0]">{u.email}</td>
                          <td className="px-2 py-1 border-r border-[#f0f0f0]">{u.name}</td>
                          <td className="px-2 py-1 border-r border-[#f0f0f0]">{u.roleType}</td>
                          <td className="px-2 py-1">
                            {seats.length ? (
                              <span className="inline-flex flex-wrap gap-1">
                                {seats.map((s) => (
                                  <span
                                    key={s.id}
                                    className="text-[9px] bg-blue-100 text-blue-900 px-1 rounded-[1px] inline-flex items-center gap-1"
                                  >
                                    {s.component.code}
                                    <button
                                      className="hover:text-red-700"
                                      title="Release this seat"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!window.confirm(
                                          `Release the ${s.component.code} seat from ${u.email}?`,
                                        )) return;
                                        unassignMut.mutate(s.id);
                                      }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {allocationQuery.isLoading && (
                  <div className="p-3 text-[10.5px] text-gray-400">Loading…</div>
                )}
                {!allocationQuery.isLoading && !users.length && (
                  <div className="p-3 text-[10.5px] text-gray-400">No users in this company.</div>
                )}
              </div>
            )}

            {/* Components */}
            <div className={cn(
              'overflow-auto bg-white custom-scrollbar',
              tab === 'components' ? 'flex-1 min-w-0' : 'w-[380px] shrink-0',
            )}>
              <table className="w-full border-collapse text-[10.5px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                    <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Component</th>
                    <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Total</th>
                    <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Used</th>
                    <th className="px-2 py-1 font-bold text-[#444] text-right">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => { setComponentId(c.id); setError(''); }}
                      className={cn(
                        'border-b border-[#f0f0f0] cursor-default',
                        componentId === c.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/50',
                      )}
                    >
                      <td className="px-2 py-1 border-r border-[#f0f0f0]">
                        <span className="font-mono">{c.code}</span>
                        <div className="text-[9px] text-gray-500">{c.name}</div>
                      </td>
                      <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">{c.totalCount}</td>
                      <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">{c.used}</td>
                      <td className={cn(
                        'px-2 py-1 text-right font-bold',
                        c.available === 0 && 'text-red-700',
                      )}>
                        {c.available}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!components.length && !allocationQuery.isLoading && (
                <div className="p-3 text-[10.5px] text-gray-400">
                  No license components. Import a license file to define the entitlements.
                </div>
              )}
            </div>
          </div>

          {/* ── Assign ── */}
          <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2 flex-wrap">
            <YellowBtn onClick={handleAssign} disabled={isBusy || !componentId || !userId}>
              {assignMut.isPending ? 'Assigning…' : 'Assign Seat'}
            </YellowBtn>
            <GreyBtn onClick={onClose}>Cancel</GreyBtn>
            <span className="text-[9.5px] text-gray-600 ml-1">
              Pick a user on the left and a component on the right, then Assign. Used and Available
              are counted from the assignments, so they always agree with the list.
            </span>
          </div>
        </>
      )}
    </ClassicWindow>
  );
};
