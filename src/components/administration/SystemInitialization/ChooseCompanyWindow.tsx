import React, { useMemo, useState } from 'react';
import { Building2, Check, Plus, RefreshCw, UserCog } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  companiesApi,
  type AvailableCompany,
  type OnboardCompanyPayload,
} from '../../../api/companies.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

type FindBy = 'name' | 'database';

const emptyNewCompany = {
  name: '',
  slug: '',
  industry: 'generic',
  country: '',
  currency: 'USD',
  locale: 'en-US',
  timezone: 'UTC',
  fiscalYearStart: 1,
  planKey: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
};

/** A slug is the tenant's stable key, so it is derived rather than hand-typed. */
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);

/**
 * Choose Company.
 *
 * This window decides which tenant the session acts in. That matters most for a
 * platform operator, whose token carries no company at all: until they pick one
 * here, every company-scoped window queries a null tenant — reads come back
 * empty and writes fail. Picking a company records it in the auth store, from
 * where the axios layer sends it as `X-Company-Id` on every request.
 */
export const ChooseCompanyWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { user, isSuperAdmin, activeCompanyId, setActiveCompany, login, logout } = useAuth();
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(activeCompanyId);
  const [findBy, setFindBy] = useState<FindBy>('name');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const [pane, setPane] = useState<'list' | 'new' | 'changeUser'>('list');
  const [form, setForm] = useState(emptyNewCompany);
  const [creds, setCreds] = useState({ email: '', password: '', companySlug: '' });
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const {
    data: companies = [], isLoading, isFetching, refetch,
  } = useQuery({
    queryKey: ['choose-company', user?.id],
    queryFn: () => companiesApi.available(),
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) =>
      (findBy === 'name' ? c.name : c.databaseName).toLowerCase().includes(q),
    );
  }, [companies, search, findBy]);

  const selected = companies.find((c) => c.id === selectedId) ?? null;

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected that request.');
    setStatus('');
  };

  const createMut = useMutation({
    mutationFn: () => {
      const payload: OnboardCompanyPayload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        industry: form.industry || undefined,
        country: form.country || undefined,
        currency: form.currency || undefined,
        locale: form.locale || undefined,
        timezone: form.timezone || undefined,
        fiscalYearStart: Number(form.fiscalYearStart) || undefined,
        planKey: form.planKey.trim(),
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword.trim() || undefined,
      };
      return companiesApi.onboard(payload);
    },
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['choose-company'] });
      setPane('list');
      setForm(emptyNewCompany);
      setError('');
      // Shown once and never stored: the server generates a password when none
      // was supplied, and there is no second chance to read it back.
      setGeneratedPassword(res.adminPassword ?? null);
      setStatus(
        res.adminPassword
          ? 'Company created. Copy the admin password below — it is not shown again.'
          : 'Company created.',
      );
    },
    onError: onErr,
  });

  const changeUserMut = useMutation({
    mutationFn: () => login(creds.email.trim(), creds.password, creds.companySlug.trim() || undefined),
    onSuccess: () => {
      void qc.invalidateQueries();
      setPane('list');
      setCreds({ email: '', password: '', companySlug: '' });
      setError('');
      setStatus('Signed in as a different user.');
    },
    onError: onErr,
  });

  const isBusy = createMut.isPending || changeUserMut.isPending;

  const handleOk = () => {
    if (!selected) {
      setError('Select a company first.');
      return;
    }
    if (!selected.isActive) {
      setError(`${selected.name} is deactivated and cannot be opened.`);
      return;
    }

    setActiveCompany({ id: selected.id, name: selected.name, slug: selected.slug });
    // Every cached list is scoped to the old company. Clearing rather than
    // refetching is deliberate: a stale row from the previous tenant rendering
    // for even one frame under the new one is worse than a moment of loading.
    void qc.clear();
    setError('');
    setStatus(`Now working in ${selected.name}.`);
    onClose();
  };

  const handleCreateSubmit = () => {
    if (!form.name.trim()) { setError('Company name is required.'); return; }
    if (!form.planKey.trim()) { setError('A subscription plan key is required.'); return; }
    if (!form.adminName.trim()) { setError('The first administrator needs a name.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(form.adminEmail.trim())) {
      setError('Enter a valid email address for the first administrator.');
      return;
    }
    if (form.adminPassword && form.adminPassword.length < 8) {
      setError('The administrator password must be at least 8 characters, or leave it blank.');
      return;
    }
    setError('');
    createMut.mutate();
  };

  return (
    <ClassicWindow
      title="Choose Company"
      icon={<Building2 className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={860}
      minHeight={520}
      toolbar={
        <>
          <ToolBtn onClick={() => { setPane('new'); setError(''); setStatus(''); setGeneratedPassword(null); }} disabled={!isSuperAdmin || isBusy}
            title={isSuperAdmin ? 'Create a new company' : 'Only a platform operator can create a company'}>
            <Plus className="w-3 h-3" /> New
          </ToolBtn>
          <ToolBtn onClick={() => refetch()} disabled={isBusy} title="Refresh">
            <RefreshCw className={cn('w-3 h-3', isFetching && 'animate-spin')} /> Refresh
          </ToolBtn>
          <ToolBtn onClick={() => { setPane('changeUser'); setError(''); setStatus(''); }} disabled={isBusy}>
            <UserCog className="w-3 h-3" /> Change User
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>
            {companies.length} compan{companies.length === 1 ? 'y' : 'ies'} available
            {activeCompanyId ? ` · working in ${companies.find((c) => c.id === activeCompanyId)?.name ?? activeCompanyId}` : ' · none selected'}
          </span>
          <span>Choose Company</span>
        </>
      }
    >
      {/* ── Signed-in identity ── */}
      <div className="shrink-0 bg-[#f7f7f7] border-b border-[#d4d0c8] px-3 py-2">
        <div className="grid grid-cols-[90px_1fr_110px_1fr] items-center gap-2">
          <span className="text-[11px] text-gray-700">User ID</span>
          <ClassicInput value={user?.email ?? ''} readOnly className="w-full bg-[#f0f0f0]" />
          <span className="text-[11px] text-gray-700">Role</span>
          <ClassicInput
            value={isSuperAdmin ? 'Platform Super Admin' : (user?.roleType ?? '')}
            readOnly
            className="w-full bg-[#f0f0f0]"
          />
        </div>
        {isSuperAdmin && !activeCompanyId && (
          <div className="text-[10px] text-amber-800 mt-1.5">
            You are signed in as a platform operator and are not inside a company. Pick one below —
            the Administration windows are company-scoped and stay empty until you do.
          </div>
        )}
      </div>

      {/* ── New company ── */}
      {pane === 'new' && (
        <div className="shrink-0 bg-[#fffbe6] border-b border-[#e0d090] p-3">
          <div className="text-[11px] font-bold mb-2">New Company</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1">
            <FieldRow label="Company Name" labelWidth="110px" required>
              <ClassicInput
                value={form.name}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  // Kept in step until the operator edits the slug themselves.
                  slug: f.slug === slugify(f.name) ? slugify(e.target.value) : f.slug,
                }))}
                className="w-full"
                autoFocus
              />
            </FieldRow>
            <FieldRow label="Database Name" labelWidth="110px" required>
              <ClassicInput
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                className="w-full font-mono"
                placeholder="acme-corp"
              />
            </FieldRow>
            <FieldRow label="Plan Key" labelWidth="110px" required>
              <ClassicInput
                value={form.planKey}
                onChange={(e) => setForm((f) => ({ ...f, planKey: e.target.value }))}
                className="w-full font-mono"
                placeholder="starter"
              />
            </FieldRow>

            <FieldRow label="Localization" labelWidth="110px">
              <ClassicInput
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase().slice(0, 2) }))}
                className="w-full"
                placeholder="PK"
              />
            </FieldRow>
            <FieldRow label="Currency" labelWidth="110px">
              <ClassicInput
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase().slice(0, 3) }))}
                className="w-full"
              />
            </FieldRow>
            <FieldRow label="Fiscal Year Starts" labelWidth="110px">
              <ClassicSel
                value={String(form.fiscalYearStart)}
                onChange={(e) => setForm((f) => ({ ...f, fiscalYearStart: Number(e.target.value) }))}
                className="w-full"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(Date.UTC(2000, i, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })}
                  </option>
                ))}
              </ClassicSel>
            </FieldRow>

            <FieldRow label="Admin Name" labelWidth="110px" required>
              <ClassicInput
                value={form.adminName}
                onChange={(e) => setForm((f) => ({ ...f, adminName: e.target.value }))}
                className="w-full"
              />
            </FieldRow>
            <FieldRow label="Admin Email" labelWidth="110px" required>
              <ClassicInput
                type="email"
                value={form.adminEmail}
                onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
                className="w-full"
              />
            </FieldRow>
            <FieldRow label="Admin Password" labelWidth="110px">
              <ClassicInput
                type="password"
                value={form.adminPassword}
                onChange={(e) => setForm((f) => ({ ...f, adminPassword: e.target.value }))}
                className="w-full"
                placeholder="blank = server generates one"
              />
            </FieldRow>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <YellowBtn onClick={handleCreateSubmit} disabled={isBusy}>
              {createMut.isPending ? 'Creating…' : 'Create Company'}
            </YellowBtn>
            <GreyBtn onClick={() => { setPane('list'); setError(''); }}>Cancel</GreyBtn>
            <span className="text-[9.5px] text-gray-600 ml-1">
              Creates the company, its subscription and its first administrator in one step.
            </span>
          </div>
        </div>
      )}

      {generatedPassword && (
        <div className="shrink-0 bg-green-50 border-b border-green-300 px-3 py-2">
          <div className="text-[10.5px] text-green-900">
            First administrator password (shown once):{' '}
            <span className="font-mono font-bold select-all">{generatedPassword}</span>
          </div>
          <button
            className="text-[9.5px] underline text-green-800 mt-0.5"
            onClick={() => setGeneratedPassword(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Change user ── */}
      {pane === 'changeUser' && (
        <div className="shrink-0 bg-[#eef4ff] border-b border-[#b9cdf0] p-3">
          <div className="text-[11px] font-bold mb-2">Change User</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1">
            <FieldRow label="User ID" labelWidth="90px" required>
              <ClassicInput
                type="email"
                value={creds.email}
                onChange={(e) => setCreds((c) => ({ ...c, email: e.target.value }))}
                className="w-full"
                autoFocus
              />
            </FieldRow>
            <FieldRow label="Password" labelWidth="90px" required>
              <ClassicInput
                type="password"
                value={creds.password}
                onChange={(e) => setCreds((c) => ({ ...c, password: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') changeUserMut.mutate(); }}
                className="w-full"
              />
            </FieldRow>
            <FieldRow label="Database" labelWidth="90px">
              <ClassicInput
                value={creds.companySlug}
                onChange={(e) => setCreds((c) => ({ ...c, companySlug: e.target.value }))}
                className="w-full font-mono"
                placeholder="blank = platform operator"
              />
            </FieldRow>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <YellowBtn
              onClick={() => {
                if (!creds.email.trim() || !creds.password) {
                  setError('Enter both a user ID and a password.');
                  return;
                }
                setError('');
                changeUserMut.mutate();
              }}
              disabled={isBusy}
            >
              {changeUserMut.isPending ? 'Signing in…' : 'Sign In'}
            </YellowBtn>
            <GreyBtn onClick={() => { setPane('list'); setError(''); }}>Cancel</GreyBtn>
            <GreyBtn onClick={() => { logout(); onClose(); }}>Log Out</GreyBtn>
            <span className="text-[9.5px] text-gray-600 ml-1">
              Signing in as another user replaces the current session.
            </span>
          </div>
        </div>
      )}

      {/* ── Companies grid ── */}
      <div className="flex-1 min-h-0 flex gap-3 p-2 overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="text-[11px] font-bold text-gray-700 mb-1">Companies on Current Server</div>
          <div className="flex-1 min-h-0 overflow-auto border border-[#d4d0c8] bg-white custom-scrollbar">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Company Name</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Database Name</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Localization</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Currency</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Users</th>
                  <th className="px-2 py-1 font-bold text-[#444] text-right">Modules</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: AvailableCompany) => (
                  <tr
                    key={c.id}
                    onClick={() => { setSelectedId(c.id); setError(''); }}
                    onDoubleClick={() => { setSelectedId(c.id); handleOk(); }}
                    className={cn(
                      'border-b border-[#f0f0f0] cursor-default',
                      selectedId === c.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/50',
                      !c.isActive && 'text-gray-400 italic',
                    )}
                  >
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">
                      <span className="inline-flex items-center gap-1">
                        {c.id === activeCompanyId && <Check className="w-3 h-3 text-green-700" />}
                        {c.name}
                        {!c.isActive && <span className="text-[9px]">(inactive)</span>}
                      </span>
                    </td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono">{c.databaseName}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">{c.localization}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">{c.currency ?? '—'}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">{c._count.users}</td>
                    <td className="px-2 py-1 text-right">{c.moduleCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {isLoading && <div className="p-3 text-[10.5px] text-gray-400">Loading companies…</div>}
            {!isLoading && companies.length === 0 && (
              <div className="p-3 text-[10.5px] text-gray-400">
                No companies yet.{isSuperAdmin ? ' Click New to create the first one.' : ''}
              </div>
            )}
            {!isLoading && companies.length > 0 && filtered.length === 0 && (
              <div className="p-3 text-[10.5px] text-gray-400">
                No company matches “{search}”.
              </div>
            )}
          </div>
        </div>

        {/* ── Find By ── */}
        <div className="w-[190px] shrink-0 flex flex-col gap-2 pt-5">
          <span className="text-[11px] font-bold text-gray-700">Find By:</span>
          <label className="flex items-center gap-2 text-[11px] cursor-pointer">
            <input
              type="radio"
              name="chooseCompanyFindBy"
              className="w-3 h-3"
              checked={findBy === 'name'}
              onChange={() => setFindBy('name')}
            />
            Company Name
          </label>
          <label className="flex items-center gap-2 text-[11px] cursor-pointer">
            <input
              type="radio"
              name="chooseCompanyFindBy"
              className="w-3 h-3"
              checked={findBy === 'database'}
              onChange={() => setFindBy('database')}
            />
            Database Name
          </label>
          <ClassicInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
            placeholder="Type to filter…"
          />

          {selected && (
            <div className="mt-3 border border-[#d4d0c8] bg-[#f7f7f7] p-2 text-[10px] space-y-0.5">
              <div className="font-bold text-[10.5px]">{selected.name}</div>
              <div>Branches: {selected._count.branches}</div>
              <div>Industry: {selected.industry ?? '—'}</div>
              <div>Timezone: {selected.timezone ?? '—'}</div>
              <div>
                FY starts:{' '}
                {selected.fiscalYearStart
                  ? new Date(Date.UTC(2000, selected.fiscalYearStart - 1, 1))
                      .toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
                  : '—'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── OK / Cancel ── */}
      <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
        <YellowBtn onClick={handleOk} disabled={!selected || isBusy}>OK</YellowBtn>
        <GreyBtn onClick={onClose}>Cancel</GreyBtn>
        {activeCompanyId && (
          <GreyBtn
            onClick={() => {
              setActiveCompany(null);
              void qc.clear();
              setSelectedId(null);
              setStatus('Company context cleared.');
            }}
            disabled={!isSuperAdmin}
            title={isSuperAdmin ? 'Leave the company' : 'A company user always works in their own company'}
          >
            Clear Selection
          </GreyBtn>
        )}
        <span className="text-[9.5px] text-gray-600 ml-1">
          Double-click a row to open it. The choice applies to every window and survives a restart.
        </span>
      </div>
    </ClassicWindow>
  );
};
