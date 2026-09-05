import React, { useState, useCallback, useEffect } from 'react';
import {
  X, Minus, Square, Plus, Trash2, RefreshCw,
  Users, Shield, Layers, Check, AlertCircle, Building2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { usersApi, User, CreateUserPayload, UpdateUserPayload } from '../../api/users.api';
import { rolesApi, Role, CreateRolePayload, Permission, PermissionScope } from '../../api/roles.api';
import { companiesApi, systemModulesApi, SystemModule, Company, CompanyListItem } from '../../api/companies.api';
import { WindowState } from '../../types/window';
import { cn, ClassicTab, ClassicInput, YellowBtn, GreyBtn, FieldRow } from '../ui/ClassicERPUI';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

const UsersTab: React.FC<{ companyId: string }> = ({ companyId }) => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<User | null>(null);
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view');
  const [form, setForm] = useState<{ name: string; email: string; password: string; isActive: boolean; roleIds: string[] }>({
    name: '', email: '', password: '', isActive: true, roleIds: [],
  });
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');

  const { data: users = [], isLoading: loadingUsers, refetch } = useQuery({
    queryKey: ['company-users', companyId],
    queryFn: () => usersApi.getAll(companyId),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['company-roles', companyId],
    queryFn: () => rolesApi.getAll(companyId),
  });

  const createMut = useMutation({
    mutationFn: (p: CreateUserPayload) => usersApi.create(p, companyId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['company-users', companyId] }); setMode('view'); setStatus('User created.'); },
    onError: (e: any) => setErr(e.message ?? 'Failed to create user'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, p }: { id: string; p: UpdateUserPayload }) => usersApi.update(id, p, companyId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['company-users', companyId] }); setMode('view'); setStatus('User updated.'); },
    onError: (e: any) => setErr(e.message ?? 'Failed to update user'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => usersApi.remove(id, companyId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['company-users', companyId] }); setSelected(null); setStatus('User deleted.'); },
    onError: (e: any) => setErr(e.message ?? 'Failed to delete user'),
  });

  const openNew = () => {
    setForm({ name: '', email: '', password: '', isActive: true, roleIds: [] });
    setErr(''); setStatus('');
    setMode('new');
  };

  const openEdit = (u: User) => {
    setSelected(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      isActive: u.isActive,
      roleIds: (u.userRoles ?? []).map(ur => ur.role.id),
    });
    setErr(''); setStatus('');
    setMode('edit');
  };

  const handleSave = () => {
    setErr('');
    if (!form.name.trim() || !form.email.trim()) { setErr('Name and email are required.'); return; }
    if (mode === 'new') {
      if (!form.password.trim()) { setErr('Password is required for new users.'); return; }
      createMut.mutate({ name: form.name, email: form.email, password: form.password, isActive: form.isActive, roleIds: form.roleIds });
    } else if (mode === 'edit' && selected) {
      const payload: UpdateUserPayload = { name: form.name, email: form.email, isActive: form.isActive, roleIds: form.roleIds };
      if (form.password.trim()) payload.password = form.password;
      updateMut.mutate({ id: selected.id, p: payload });
    }
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!window.confirm(`Delete user "${selected.name}"?`)) return;
    deleteMut.mutate(selected.id);
  };

  const toggleRole = (roleId: string) => {
    setForm(f => ({
      ...f,
      roleIds: f.roleIds.includes(roleId) ? f.roleIds.filter(id => id !== roleId) : [...f.roleIds, roleId],
    }));
  };

  const isBusy = createMut.isPending || updateMut.isPending || deleteMut.isPending;

  return (
    <div className="flex flex-col h-full">
      {/* toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] border-b border-[#d4d0c8]">
        <button onClick={openNew} className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white hover:bg-[#ffed99] rounded-[1px]">
          <Plus className="w-3 h-3" /> New
        </button>
        <button onClick={() => selected && openEdit(selected)} disabled={!selected}
          className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white hover:bg-[#ffed99] rounded-[1px] disabled:opacity-40">
          Edit
        </button>
        <button onClick={handleDelete} disabled={!selected || isBusy}
          className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white hover:bg-red-100 rounded-[1px] disabled:opacity-40">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
        <button onClick={() => refetch()} className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white hover:bg-[#ffed99] rounded-[1px]">
          <RefreshCw className={cn('w-3 h-3', loadingUsers && 'animate-spin')} />
        </button>
        {status && <span className="text-[10px] text-green-700 ml-2">{status}</span>}
        {err && <span className="text-[10px] text-red-600 ml-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</span>}
      </div>

      {/* body: list + form */}
      <div className="flex flex-1 overflow-hidden">
        {/* user list */}
        <div className="w-64 flex flex-col border-r border-[#d4d0c8] bg-white overflow-auto">
          {loadingUsers ? (
            <div className="text-[10.5px] text-gray-500 p-3">Loading…</div>
          ) : users.length === 0 ? (
            <div className="text-[10.5px] text-gray-400 p-3">No users yet</div>
          ) : users.map(u => (
            <div
              key={u.id}
              onClick={() => { setSelected(u); setMode('view'); setErr(''); setStatus(''); }}
              onDoubleClick={() => openEdit(u)}
              className={cn(
                'px-3 py-1.5 text-[10.5px] cursor-pointer border-b border-[#f0f0f0] select-none',
                selected?.id === u.id ? 'bg-[#ffeb9c]' : 'hover:bg-[#f5f5f5]',
              )}
            >
              <div className="font-semibold text-[#222]">{u.name}</div>
              <div className="text-[#666]">{u.email}</div>
              <div className="flex gap-1 mt-0.5 flex-wrap">
                {(u.userRoles ?? []).map(ur => (
                  <span key={ur.role.id} className="bg-orange-100 text-orange-700 px-1 rounded-[1px] text-[9px]">{ur.role.name}</span>
                ))}
                {!u.isActive && <span className="bg-gray-200 text-gray-600 px-1 rounded-[1px] text-[9px]">Inactive</span>}
              </div>
            </div>
          ))}
        </div>

        {/* detail / form panel */}
        <div className="flex-1 p-4 overflow-auto">
          {mode === 'view' && !selected && (
            <div className="text-[11px] text-gray-400 mt-8 text-center">Select a user or click New</div>
          )}

          {mode === 'view' && selected && (
            <div>
              <div className="text-[11px] font-bold text-[#333] mb-3 border-b border-[#e0e0e0] pb-1">{selected.name}</div>
              <FieldRow label="Email">{selected.email}</FieldRow>
              <FieldRow label="Status">{selected.isActive ? 'Active' : 'Inactive'}</FieldRow>
              <FieldRow label="Roles">
                <div className="flex gap-1 flex-wrap">
                  {(selected.userRoles ?? []).map(ur => (
                    <span key={ur.role.id} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-[1px] text-[9px]">{ur.role.name}</span>
                  ))}
                  {(selected.userRoles ?? []).length === 0 && <span className="text-gray-400 text-[10px]">None</span>}
                </div>
              </FieldRow>
              <div className="mt-3">
                <YellowBtn onClick={() => openEdit(selected)}>Edit</YellowBtn>
              </div>
            </div>
          )}

          {(mode === 'new' || mode === 'edit') && (
            <div>
              <div className="text-[11px] font-bold text-[#333] mb-3 border-b border-[#e0e0e0] pb-1">
                {mode === 'new' ? 'New User' : `Edit — ${selected?.name}`}
              </div>
              <FieldRow label="Name" required><ClassicInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-52" /></FieldRow>
              <FieldRow label="Email" required><ClassicInput type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-52" /></FieldRow>
              <FieldRow label={mode === 'new' ? 'Password *' : 'New Password'}>
                <ClassicInput type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-52" placeholder={mode === 'edit' ? 'leave blank to keep' : ''} />
              </FieldRow>
              <FieldRow label="Active">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
              </FieldRow>

              <div className="mt-3 mb-1 text-[10.5px] font-bold text-[#444]">Roles</div>
              <div className="border border-[#d4d0c8] rounded-[1px] p-2 max-h-40 overflow-auto bg-white">
                {roles.length === 0 ? (
                  <div className="text-[10px] text-gray-400">No roles defined yet — create roles in the Roles tab.</div>
                ) : roles.map(r => (
                  <label key={r.id} className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-[#f5f5f5] px-1">
                    <input type="checkbox" checked={form.roleIds.includes(r.id)} onChange={() => toggleRole(r.id)} />
                    <span className="text-[10.5px]">{r.name}</span>
                    {r.description && <span className="text-[9px] text-gray-400">— {r.description}</span>}
                  </label>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <YellowBtn onClick={handleSave} disabled={isBusy}>{isBusy ? 'Saving…' : 'Save'}</YellowBtn>
                <GreyBtn onClick={() => { setMode('view'); setErr(''); }}>Cancel</GreyBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Roles Tab ────────────────────────────────────────────────────────────────

/**
 * The permission catalog is flat: 300-odd rows of
 * `{ moduleSlug, resource, action }`. It is *not* a five-column
 * VIEW/CREATE/UPDATE/DELETE/MANAGE grid — there are 27 distinct actions, and
 * the ones this screen exists to hand out (`administration.approval.decide`,
 * `tenancy.module.activate`) are among the ones a fixed grid cannot show.
 * So group module → resource and render whatever actions each resource has.
 */
type ResourceGroup = { resource: string; perms: Permission[] };
type ModuleGroup = { moduleSlug: string; resources: ResourceGroup[]; perms: Permission[] };

function groupPermissions(perms: Permission[]): ModuleGroup[] {
  const byModule = new Map<string, Map<string, Permission[]>>();
  for (const p of perms) {
    if (!byModule.has(p.moduleSlug)) byModule.set(p.moduleSlug, new Map());
    const byResource = byModule.get(p.moduleSlug)!;
    if (!byResource.has(p.resource)) byResource.set(p.resource, []);
    byResource.get(p.resource)!.push(p);
  }
  return [...byModule.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([moduleSlug, byResource]) => {
      const resources = [...byResource.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([resource, list]) => ({
          resource,
          perms: [...list].sort((x, y) => x.action.localeCompare(y.action)),
        }));
      return { moduleSlug, resources, perms: resources.flatMap((r) => r.perms) };
    });
}

/**
 * The three grants this screen was opened for. Named explicitly because
 * finding `tenancy.module.activate` by scrolling a 300-row catalog is the kind
 * of thing that gets given up on and replaced by "just make them a super admin".
 */
const PRESETS: { label: string; title: string; keys: string[] }[] = [
  {
    label: 'Admin User Create/Update',
    title: 'List, create and update users in this company',
    keys: ['administration.view', 'administration.create', 'administration.update'],
  },
  {
    label: 'Module Assignment',
    title: 'Assign modules to users and activate modules for the company',
    keys: ['administration.view', 'administration.update', 'tenancy.module.activate'],
  },
  {
    label: 'Module Approval',
    title: 'See and decide pending module-access requests',
    keys: ['administration.approval.view', 'administration.approval.decide'],
  },
];

const RolesTab: React.FC<{ companyId: string }> = ({ companyId }) => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Role | null>(null);
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view');
  const [form, setForm] = useState<{ name: string; description: string; isDefault: boolean; permissionKeys: string[] }>({
    name: '', description: '', isDefault: false, permissionKeys: [],
  });
  // Scopes carried over from the role as loaded. A permission the user did not
  // touch must go back at the scope it had — rewriting every assignment to ALL
  // would silently widen a DEPARTMENT-scoped grant on an unrelated edit.
  const [scopes, setScopes] = useState<Record<string, PermissionScope>>({});
  const [filter, setFilter] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');

  const { data: roles = [], isLoading: loadingRoles, refetch } = useQuery({
    queryKey: ['company-roles', companyId],
    queryFn: () => rolesApi.getAll(companyId),
  });

  const { data: availablePerms = [], isLoading: loadingPerms, error: permsError } = useQuery({
    queryKey: ['available-permissions', companyId],
    queryFn: () => rolesApi.getAvailablePermissions(companyId),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['company-roles', companyId] });
    // A role edit changes what its members may do, so the user list (which
    // renders role chips) goes stale with it.
    qc.invalidateQueries({ queryKey: ['company-users', companyId] });
  };

  const createMut = useMutation({
    mutationFn: (p: CreateRolePayload) => rolesApi.create(p, companyId),
    onSuccess: () => { invalidate(); setMode('view'); setStatus('Role created.'); },
    onError: (e: any) => setErr(e.message ?? 'Failed to create role'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, p }: { id: string; p: Partial<CreateRolePayload> }) => rolesApi.update(id, p, companyId),
    onSuccess: (updated) => { invalidate(); if (updated) setSelected(updated); setMode('view'); setStatus('Role updated.'); },
    onError: (e: any) => setErr(e.message ?? 'Failed to update role'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => rolesApi.remove(id, companyId),
    onSuccess: () => { invalidate(); setSelected(null); setStatus('Role deleted.'); },
    onError: (e: any) => setErr(e.message ?? 'Failed to delete role'),
  });

  const groups = React.useMemo(() => groupPermissions(availablePerms), [availablePerms]);

  const visibleGroups = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map(g => ({
        ...g,
        resources: g.resources
          .map(r => ({ ...r, perms: r.perms.filter(p => p.key.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)) }))
          .filter(r => r.perms.length > 0),
      }))
      .filter(g => g.resources.length > 0);
  }, [groups, filter]);

  const grantedKeys = (r: Role) => (r.rolePermissions ?? []).map(rp => rp.permission.key);

  const openNew = () => {
    setForm({ name: '', description: '', isDefault: false, permissionKeys: [] });
    setScopes({});
    setErr(''); setStatus('');
    setMode('new');
  };

  const openEdit = (r: Role) => {
    setSelected(r);
    setForm({
      name: r.name,
      description: r.description ?? '',
      isDefault: r.isDefault,
      permissionKeys: grantedKeys(r),
    });
    setScopes(Object.fromEntries(
      (r.rolePermissions ?? []).map(rp => [rp.permission.key, rp.scope ?? 'ALL'] as const),
    ));
    setErr(''); setStatus('');
    setMode('edit');
  };

  const handleSave = () => {
    setErr('');
    if (!form.name.trim()) { setErr('Role name is required.'); return; }
    // The backend takes `permissions: [{ permissionKey, scope }]`, and its
    // ValidationPipe runs with forbidNonWhitelisted — an unknown field such as
    // the `permissionIds` this screen used to send is rejected outright.
    const payload: CreateRolePayload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      isDefault: form.isDefault,
      permissions: form.permissionKeys.map(k => ({ permissionKey: k, scope: scopes[k] ?? 'ALL' })),
    };
    if (mode === 'new') {
      createMut.mutate(payload);
    } else if (mode === 'edit' && selected) {
      updateMut.mutate({ id: selected.id, p: payload });
    }
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!window.confirm(`Delete role "${selected.name}"?`)) return;
    deleteMut.mutate(selected.id);
  };

  const togglePerm = (key: string) => {
    setForm(f => ({
      ...f,
      permissionKeys: f.permissionKeys.includes(key)
        ? f.permissionKeys.filter(k => k !== key)
        : [...f.permissionKeys, key],
    }));
  };

  const setMany = (keys: string[], on: boolean) => {
    setForm(f => ({
      ...f,
      permissionKeys: on
        ? [...new Set([...f.permissionKeys, ...keys])]
        : f.permissionKeys.filter(k => !keys.includes(k)),
    }));
  };

  const applyPreset = (keys: string[]) => {
    const known = new Set(availablePerms.map(p => p.key));
    const grantable = keys.filter(k => known.has(k));
    const missing = keys.filter(k => !known.has(k));
    setMany(grantable, true);
    setErr(missing.length
      ? `Not available for this company (module disabled): ${missing.join(', ')}`
      : '');
  };

  const isBusy = createMut.isPending || updateMut.isPending || deleteMut.isPending;
  const editing = mode === 'new' || mode === 'edit';

  const permissionMatrix = (
    <div className="border border-[#d4d0c8] rounded-[1px] flex-1 overflow-auto bg-white min-h-[160px]">
      {loadingPerms ? (
        <div className="text-[10px] text-gray-400 p-3">Loading permissions…</div>
      ) : permsError ? (
        <div className="text-[10px] text-red-600 p-3 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{(permsError as Error).message}
        </div>
      ) : availablePerms.length === 0 ? (
        <div className="text-[10px] text-gray-400 p-3">
          No modules enabled for this company — enable modules in the Modules tab first.
        </div>
      ) : visibleGroups.length === 0 ? (
        <div className="text-[10px] text-gray-400 p-3">No permission matches that filter.</div>
      ) : visibleGroups.map(group => {
        const keys = group.perms.map(p => p.key);
        const allOn = keys.every(k => form.permissionKeys.includes(k));
        const isCollapsed = collapsed[group.moduleSlug] && !filter;
        return (
          <div key={group.moduleSlug} className="border-b border-[#e8e8e8] last:border-b-0">
            <div className="flex items-center gap-2 px-2 py-1 bg-[#f4f4f4] border-b border-[#e0e0e0]">
              <button
                type="button"
                onClick={() => setCollapsed(c => ({ ...c, [group.moduleSlug]: !c[group.moduleSlug] }))}
                className="text-[10px] w-3 text-gray-500"
              >{isCollapsed ? '▸' : '▾'}</button>
              <span className="text-[10.5px] font-bold text-[#333] capitalize">{group.moduleSlug.replace(/-/g, ' ')}</span>
              <span className="text-[9px] text-gray-400">
                {keys.filter(k => form.permissionKeys.includes(k)).length}/{keys.length}
              </span>
              {editing && (
                <label className="ml-auto flex items-center gap-1 text-[9px] text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={allOn} onChange={() => setMany(keys, !allOn)} />
                  all
                </label>
              )}
            </div>
            {!isCollapsed && group.resources.map(res => (
              <div key={res.resource} className="flex items-start gap-2 px-2 py-1 border-b border-[#f4f4f4] last:border-b-0 hover:bg-[#fafafa]">
                <div className="w-48 shrink-0 text-[10px] font-medium text-[#444] pt-[1px] break-words">{res.resource}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {res.perms.map(p => {
                    const on = form.permissionKeys.includes(p.key);
                    return (
                      <label
                        key={p.id}
                        title={p.description ? `${p.key} — ${p.description}` : p.key}
                        className={cn(
                          'flex items-center gap-1 text-[10px]',
                          editing ? 'cursor-pointer' : 'cursor-default',
                          on ? 'text-[#222]' : 'text-gray-500',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          disabled={!editing}
                          onChange={() => togglePerm(p.key)}
                        />
                        {p.action}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] border-b border-[#d4d0c8]">
        <button onClick={openNew} className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white hover:bg-[#ffed99] rounded-[1px]">
          <Plus className="w-3 h-3" /> New
        </button>
        <button onClick={() => selected && openEdit(selected)} disabled={!selected}
          className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white hover:bg-[#ffed99] rounded-[1px] disabled:opacity-40">
          Edit
        </button>
        <button onClick={handleDelete} disabled={!selected || isBusy}
          className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white hover:bg-red-100 rounded-[1px] disabled:opacity-40">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
        <button onClick={() => refetch()} className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white hover:bg-[#ffed99] rounded-[1px]">
          <RefreshCw className={cn('w-3 h-3', loadingRoles && 'animate-spin')} />
        </button>
        {status && <span className="text-[10px] text-green-700 ml-2">{status}</span>}
        {err && <span className="text-[10px] text-red-600 ml-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</span>}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* roles list */}
        <div className="w-56 flex flex-col border-r border-[#d4d0c8] bg-white overflow-auto shrink-0">
          {loadingRoles ? (
            <div className="text-[10.5px] text-gray-500 p-3">Loading…</div>
          ) : roles.length === 0 ? (
            <div className="text-[10.5px] text-gray-400 p-3">No roles yet</div>
          ) : roles.map(r => (
            <div
              key={r.id}
              onClick={() => { setSelected(r); setMode('view'); setForm(f => ({ ...f, permissionKeys: grantedKeys(r) })); setErr(''); setStatus(''); }}
              onDoubleClick={() => openEdit(r)}
              className={cn(
                'px-3 py-1.5 text-[10.5px] cursor-pointer border-b border-[#f0f0f0] select-none',
                selected?.id === r.id ? 'bg-[#ffeb9c]' : 'hover:bg-[#f5f5f5]',
              )}
            >
              <div className="font-semibold text-[#222] flex items-center gap-1">
                {r.name}
                {r.isDefault && <span className="text-[8px] bg-blue-100 text-blue-600 px-1 rounded-[1px]">default</span>}
              </div>
              <div className="text-[#666]">
                {r._count?.userRoles ?? 0} user{(r._count?.userRoles ?? 0) !== 1 ? 's' : ''}
                {' · '}{(r.rolePermissions ?? []).length} perm{(r.rolePermissions ?? []).length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* role detail */}
        <div className="flex-1 p-3 overflow-hidden flex flex-col min-w-0">
          {mode === 'view' && !selected && (
            <div className="text-[11px] text-gray-400 mt-8 text-center">Select a role or click New</div>
          )}

          {mode === 'view' && selected && (
            <div className="flex flex-col h-full min-h-0">
              <div className="text-[11px] font-bold text-[#333] mb-1 border-b border-[#e0e0e0] pb-1">{selected.name}</div>
              {selected.description && <div className="text-[10.5px] text-gray-500 mb-2">{selected.description}</div>}
              <div className="flex items-center gap-2 mb-1 shrink-0">
                <span className="text-[10.5px] font-bold text-[#444]">Permissions</span>
                <ClassicInput
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="filter…"
                  className="w-40 ml-auto"
                />
              </div>
              {permissionMatrix}
              <div className="mt-2 shrink-0">
                <YellowBtn onClick={() => openEdit(selected)}>Edit</YellowBtn>
              </div>
            </div>
          )}

          {editing && (
            <div className="flex flex-col h-full min-h-0">
              <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">
                {mode === 'new' ? 'New Role' : `Edit — ${selected?.name}`}
              </div>
              <FieldRow label="Name" required>
                <ClassicInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-48" />
              </FieldRow>
              <FieldRow label="Description">
                <ClassicInput value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-64" />
              </FieldRow>
              <FieldRow label="Set as default">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} />
              </FieldRow>

              <div className="flex items-center gap-2 mt-2 mb-1 flex-wrap shrink-0">
                <span className="text-[10.5px] font-bold text-[#444]">Permissions</span>
                <span className="text-[9.5px] text-gray-500">Grant:</span>
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    title={p.title}
                    onClick={() => applyPreset(p.keys)}
                    className="px-1.5 py-0.5 text-[9.5px] border border-[#d4a020] bg-[#fff8e6] hover:bg-[#ffed99] rounded-[1px]"
                  >{p.label}</button>
                ))}
                <ClassicInput
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="filter permissions…"
                  className="w-44 ml-auto"
                />
                <span className="text-[9.5px] text-gray-500">{form.permissionKeys.length} selected</span>
              </div>

              {permissionMatrix}

              <div className="flex gap-2 mt-3 shrink-0">
                <YellowBtn onClick={handleSave} disabled={isBusy}>{isBusy ? 'Saving…' : 'Save'}</YellowBtn>
                <GreyBtn onClick={() => { setMode('view'); setErr(''); if (selected) setForm(f => ({ ...f, permissionKeys: grantedKeys(selected) })); }}>Cancel</GreyBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Modules Tab ──────────────────────────────────────────────────────────────

const ModulesTab: React.FC<{ companyId: string }> = ({ companyId }) => {
  const qc = useQueryClient();
  const [toggling, setToggling] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');

  const { data: company, isLoading: loadingCompany } = useQuery<Company>({
    queryKey: ['company-detail', companyId],
    queryFn: () => companiesApi.getOne(companyId),
  });

  const { data: allModules = [], isLoading: loadingMods } = useQuery<SystemModule[]>({
    queryKey: ['system-modules'],
    queryFn: () => systemModulesApi.getAll(),
  });

  const toggleMut = useMutation({
    mutationFn: ({ moduleId, isEnabled }: { moduleId: string; isEnabled: boolean }) =>
      companiesApi.toggleModule(companyId, moduleId, isEnabled),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['company-detail', companyId] });
      // The role editor only offers permissions belonging to enabled modules,
      // so a toggle changes what that catalog contains.
      qc.invalidateQueries({ queryKey: ['available-permissions', companyId] });
      setToggling(null);
      setErr('');
      setStatus(`Module ${vars.isEnabled ? 'enabled' : 'disabled'}.`);
    },
    onError: (e: any) => { setToggling(null); setStatus(''); setErr(e?.message ?? 'Failed to change module'); },
  });

  const isEnabled = (moduleId: string) =>
    company?.companyModules?.find(cm => cm.moduleId === moduleId)?.isEnabled ?? false;

  const handleToggle = (moduleId: string) => {
    const current = isEnabled(moduleId);
    setToggling(moduleId);
    setStatus('');
    setErr('');
    toggleMut.mutate({ moduleId, isEnabled: !current });
  };

  const isLoading = loadingCompany || loadingMods;

  const iconColors: Record<string, string> = {
    administration: 'bg-orange-100 text-orange-600',
    financials: 'bg-green-100 text-green-700',
    hr: 'bg-blue-100 text-blue-700',
    'hr-payroll': 'bg-purple-100 text-purple-700',
    crm: 'bg-yellow-100 text-yellow-700',
    purchasing: 'bg-red-100 text-red-600',
    inventory: 'bg-teal-100 text-teal-700',
    banking: 'bg-indigo-100 text-indigo-700',
    reports: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-3 py-1.5 bg-[#f0f0f0] border-b border-[#d4d0c8] text-[10.5px]">
        <span className="text-gray-600">Toggle which modules are available in this company.</span>
        {status && <span className="ml-4 text-green-700">{status}</span>}
        {err && <span className="ml-4 text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</span>}
      </div>

      <div className="flex-1 overflow-auto p-3">
        {isLoading ? (
          <div className="text-[10.5px] text-gray-400 p-4 text-center">Loading…</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {allModules.map(mod => {
              const enabled = isEnabled(mod.id);
              const busy = toggling === mod.id;
              const colorClass = iconColors[mod.slug] ?? 'bg-gray-100 text-gray-600';
              return (
                <div
                  key={mod.id}
                  className={cn(
                    'border rounded-[2px] p-3 flex flex-col gap-2 transition-all',
                    enabled ? 'border-orange-300 bg-orange-50' : 'border-[#d4d0c8] bg-white',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className={cn('w-7 h-7 rounded-[2px] flex items-center justify-center text-[11px] font-bold', colorClass)}>
                      {mod.name.charAt(0)}
                    </div>
                    <button
                      onClick={() => handleToggle(mod.id)}
                      disabled={busy}
                      className={cn(
                        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner',
                        enabled ? 'bg-orange-500' : 'bg-gray-300',
                        busy && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                          enabled ? 'translate-x-4' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold text-[#333]">{mod.name}</div>
                    {mod.description && <div className="text-[9.5px] text-gray-500 mt-0.5 leading-tight">{mod.description}</div>}
                  </div>
                  <div className="text-[9px] font-semibold mt-auto">
                    <span className={enabled ? 'text-orange-600' : 'text-gray-400'}>{enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Window ──────────────────────────────────────────────────────────────

export const CompanyAdminWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const { user, isSuperAdmin, activeCompanyId } = useAuth();
  const [activeTab, setActiveTab] = useState<'Users' | 'Roles' | 'Modules'>('Users');
  // Seeded from the company chosen in Choose Company, so this window opens on
  // the tenant the operator is already working in rather than on whichever one
  // happens to sort first.
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(activeCompanyId ?? '');

  // Super admin: fetch all companies so they can pick one
  const { data: allCompanies = [], isLoading: loadingCompanies } = useQuery<CompanyListItem[]>({
    queryKey: ['all-companies-list'],
    queryFn: () => companiesApi.getAll(),
    enabled: isSuperAdmin,
  });

  // Auto-select the first company for super admin
  useEffect(() => {
    if (isSuperAdmin && !selectedCompanyId && allCompanies.length > 0) {
      setSelectedCompanyId(allCompanies[0].id);
    }
  }, [isSuperAdmin, allCompanies, selectedCompanyId]);

  // The company ID to actually operate on
  const effectiveCompanyId = isSuperAdmin
    ? selectedCompanyId
    : (user?.companyId ?? activeCompanyId ?? '');

  // ── drag ──────────────────────────────────────────────────────────────────
  const handleTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    e.preventDefault();
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;
    const onMove = (me: MouseEvent) => {
      setWindowState(prev => ({ ...prev, x: me.clientX - startX, y: me.clientY - startY }));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [windowState.isMaximized, windowState.x, windowState.y, setWindowState]);

  // ── resize (all edges & corners) ───────────────────────────────────────
  const MIN_W = 760;
  const MIN_H = 500;

  const handleEdgeResize = useCallback((e: React.MouseEvent, direction: string) => {
    if (windowState.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX = windowState.x;
    const startY = windowState.y;
    const startW = windowState.width;
    const startH = windowState.height;

    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - startMouseX;
      const dy = me.clientY - startMouseY;
      setWindowState(prev => {
        let newX = startX, newY = startY, newW = startW, newH = startH;

        // East (right edge)
        if (direction.includes('e')) {
          newW = Math.max(MIN_W, startW + dx);
        }
        // West (left edge)
        if (direction.includes('w')) {
          const proposedW = startW - dx;
          if (proposedW >= MIN_W) {
            newW = proposedW;
            newX = startX + dx;
          } else {
            newW = MIN_W;
            newX = startX + (startW - MIN_W);
          }
        }
        // South (bottom edge)
        if (direction.includes('s')) {
          newH = Math.max(MIN_H, startH + dy);
        }
        // North (top edge)
        if (direction.includes('n')) {
          const proposedH = startH - dy;
          if (proposedH >= MIN_H) {
            newH = proposedH;
            newY = startY + dy;
          } else {
            newH = MIN_H;
            newY = startY + (startH - MIN_H);
          }
        }

        return { ...prev, x: newX, y: newY, width: newW, height: newH };
      });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [windowState.isMaximized, windowState.x, windowState.y, windowState.width, windowState.height, setWindowState]);

  // ── maximize ──────────────────────────────────────────────────────────────
  const toggleMaximize = () => {
    if (windowState.isMaximized) {
      setWindowState(prev => ({ ...prev, isMaximized: false, x: 100, y: 80, width: 960, height: 680 }));
    } else {
      setWindowState(prev => ({ ...prev, isMaximized: true, x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - 40 }));
    }
  };

  if (!show) return null;

  const { x, y, width, height, zIndex, isMaximized } = windowState;

  const style: React.CSSProperties = isMaximized
    ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: `calc(100vh - 40px)`, zIndex }
    : { position: 'absolute', left: x, top: y, width, height, zIndex };

  return (
    <div
      style={style}
      className="flex flex-col bg-[#f0f0f0] border border-[#808080] shadow-xl rounded-[1px] overflow-hidden"
      onMouseDown={onFocus}
    >
      {/* title bar */}
      <div
        className="flex items-center justify-between px-2 py-1 shrink-0 cursor-move select-none"
        style={{ background: 'linear-gradient(to bottom, #fefefe, #d1d1d1)' }}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={toggleMaximize}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-orange-600" />
          <span className="text-[11px] font-bold text-[#333]">Company Administration</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            className="w-4 h-4 flex items-center justify-center border border-[#d4d0c8] bg-[#f0f0f0] hover:bg-[#ffed99] rounded-[1px]"
            onClick={() => setWindowState(prev => ({ ...prev, isMinimized: true }))}
          ><Minus className="w-2.5 h-2.5" /></button>
          <button
            className="w-4 h-4 flex items-center justify-center border border-[#d4d0c8] bg-[#f0f0f0] hover:bg-[#ffed99] rounded-[1px]"
            onClick={toggleMaximize}
          ><Square className="w-2.5 h-2.5" /></button>
          <button
            className="w-4 h-4 flex items-center justify-center border border-[#d4d0c8] bg-[#f0f0f0] hover:bg-red-500 hover:text-white rounded-[1px]"
            onClick={onClose}
          ><X className="w-2.5 h-2.5" /></button>
        </div>
      </div>

      {/* orange accent bar */}
      <div className="h-[3px] shrink-0" style={{ background: 'linear-gradient(to right, #f39c12, #e67e22)' }} />

      {/* Super admin company selector */}
      {isSuperAdmin && (
        <div className="flex items-center gap-3 px-3 py-1.5 bg-[#fff8e6] border-b border-[#f0c060] shrink-0">
          <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span className="text-[10.5px] font-bold text-orange-800 whitespace-nowrap">Managing company:</span>
          {loadingCompanies ? (
            <span className="text-[10.5px] text-gray-500">Loading companies…</span>
          ) : allCompanies.length === 0 ? (
            <span className="text-[10.5px] text-red-500">No companies found</span>
          ) : (
            <select
              value={selectedCompanyId}
              onChange={e => setSelectedCompanyId(e.target.value)}
              className="h-[20px] border border-[#d4a020] px-1 text-[10.5px] bg-white rounded-[1px] outline-none focus:border-orange-500 min-w-[200px]"
            >
              {allCompanies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.slug}) — {c._count.users} user{c._count.users !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          )}
          <span className="text-[9.5px] text-orange-600 ml-auto italic">Super Admin mode</span>
        </div>
      )}

      {/* tab bar */}
      <div className="flex items-end px-3 pt-2 border-b border-[#808080] bg-[#e8e8e8] shrink-0">
        {(['Users', 'Roles', 'Modules'] as const).map(tab => {
          const Icon = tab === 'Users' ? Users : tab === 'Roles' ? Shield : Layers;
          return (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1 text-[10.5px] cursor-pointer border-t border-l border-r rounded-t-[2px] mr-1',
                activeTab === tab
                  ? 'bg-white border-[#808080] font-bold -mb-[1px] relative z-10'
                  : 'bg-[#d8d8d8] border-transparent hover:bg-[#e8e8e8]',
              )}
            >
              <Icon className="w-3 h-3" />
              {tab}
            </div>
          );
        })}
      </div>

      {/* content */}
      <div className="flex-1 overflow-hidden bg-white">
        {!effectiveCompanyId ? (
          <div className="flex items-center justify-center h-full text-[11px] text-gray-400">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              {isSuperAdmin
                ? 'Select a company above to manage its users, roles, and modules.'
                : 'No company context — log in as a company user to manage this company.'}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'Users'   && <UsersTab   companyId={effectiveCompanyId} />}
            {activeTab === 'Roles'   && <RolesTab   companyId={effectiveCompanyId} />}
            {activeTab === 'Modules' && <ModulesTab companyId={effectiveCompanyId} />}
          </>
        )}
      </div>

      {/* status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#f0f0f0] border-t border-[#d4d0c8] text-[9.5px] text-gray-500 shrink-0">
        <span>
          {user?.name}
          {isSuperAdmin && <span className="ml-1 px-1 bg-orange-500 text-white rounded-[1px] text-[8px] font-bold">SUPER ADMIN</span>}
          {effectiveCompanyId && <span className="ml-2 text-gray-400">· Company ID: {effectiveCompanyId.slice(0, 8)}…</span>}
        </span>
        <span>Company Administration</span>
      </div>

      {/* resize handles — all edges & corners */}
      {!isMaximized && (
        <>
          {/* edges */}
          <div className="absolute top-0 left-2 right-2 h-[5px] cursor-n-resize" onMouseDown={e => handleEdgeResize(e, 'n')} />
          <div className="absolute bottom-0 left-2 right-2 h-[5px] cursor-s-resize" onMouseDown={e => handleEdgeResize(e, 's')} />
          <div className="absolute left-0 top-2 bottom-2 w-[5px] cursor-w-resize" onMouseDown={e => handleEdgeResize(e, 'w')} />
          <div className="absolute right-0 top-2 bottom-2 w-[5px] cursor-e-resize" onMouseDown={e => handleEdgeResize(e, 'e')} />
          {/* corners */}
          <div className="absolute top-0 left-0 w-[10px] h-[10px] cursor-nw-resize" onMouseDown={e => handleEdgeResize(e, 'nw')} />
          <div className="absolute top-0 right-0 w-[10px] h-[10px] cursor-ne-resize" onMouseDown={e => handleEdgeResize(e, 'ne')} />
          <div className="absolute bottom-0 left-0 w-[10px] h-[10px] cursor-sw-resize" onMouseDown={e => handleEdgeResize(e, 'sw')} />
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] cursor-se-resize" onMouseDown={e => handleEdgeResize(e, 'se')}
            style={{ background: 'linear-gradient(135deg, transparent 50%, #b0b0b0 50%)' }}
          />
        </>
      )}
    </div>
  );
};
