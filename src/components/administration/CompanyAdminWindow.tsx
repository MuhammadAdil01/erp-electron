import React, { useState, useCallback, useEffect } from 'react';
import {
  X, Minus, Square, Plus, Trash2, RefreshCw,
  Users, Shield, Layers, Check, AlertCircle, Building2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { usersApi, User, CreateUserPayload, UpdateUserPayload } from '../../api/users.api';
import { rolesApi, Role, CreateRolePayload, Permission } from '../../api/roles.api';
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

const ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'] as const;

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

const RolesTab: React.FC<{ companyId: string }> = ({ companyId }) => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Role | null>(null);
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view');
  const [form, setForm] = useState<{ name: string; description: string; isDefault: boolean; permissionIds: string[] }>({
    name: '', description: '', isDefault: false, permissionIds: [],
  });
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');

  const { data: roles = [], isLoading: loadingRoles, refetch } = useQuery({
    queryKey: ['company-roles', companyId],
    queryFn: () => rolesApi.getAll(companyId),
  });

  const { data: availablePerms = [] } = useQuery({
    queryKey: ['available-permissions', companyId],
    queryFn: () => rolesApi.getAvailablePermissions(companyId),
  });

  const createMut = useMutation({
    mutationFn: (p: CreateRolePayload) => rolesApi.create(p, companyId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['company-roles', companyId] }); setMode('view'); setStatus('Role created.'); },
    onError: (e: any) => setErr(e.message ?? 'Failed to create role'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, p }: { id: string; p: Partial<CreateRolePayload> }) => rolesApi.update(id, p, companyId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['company-roles', companyId] }); setMode('view'); setStatus('Role updated.'); },
    onError: (e: any) => setErr(e.message ?? 'Failed to update role'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => rolesApi.remove(id, companyId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['company-roles', companyId] }); setSelected(null); setStatus('Role deleted.'); },
    onError: (e: any) => setErr(e.message ?? 'Failed to delete role'),
  });

  // Group permissions by module for the matrix
  const permsByModule = availablePerms.reduce<Record<string, { module: Permission['module']; perms: Permission[] }>>((acc, p) => {
    if (!acc[p.moduleId]) acc[p.moduleId] = { module: p.module, perms: [] };
    acc[p.moduleId].perms.push(p);
    return acc;
  }, {});

  const openNew = () => {
    setForm({ name: '', description: '', isDefault: false, permissionIds: [] });
    setErr(''); setStatus('');
    setMode('new');
  };

  const openEdit = (r: Role) => {
    setSelected(r);
    setForm({
      name: r.name,
      description: r.description ?? '',
      isDefault: r.isDefault,
      permissionIds: r.rolePermissions.map(rp => rp.permission.id),
    });
    setErr(''); setStatus('');
    setMode('edit');
  };

  const handleSave = () => {
    setErr('');
    if (!form.name.trim()) { setErr('Role name is required.'); return; }
    const payload: CreateRolePayload = { name: form.name, description: form.description || undefined, isDefault: form.isDefault, permissionIds: form.permissionIds };
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

  const togglePerm = (permId: string) => {
    setForm(f => ({
      ...f,
      permissionIds: f.permissionIds.includes(permId) ? f.permissionIds.filter(id => id !== permId) : [...f.permissionIds, permId],
    }));
  };

  const toggleModuleAll = (moduleId: string) => {
    const modulePerms = permsByModule[moduleId]?.perms ?? [];
    const allSelected = modulePerms.every(p => form.permissionIds.includes(p.id));
    const modulePermIds = modulePerms.map(p => p.id);
    setForm(f => ({
      ...f,
      permissionIds: allSelected
        ? f.permissionIds.filter(id => !modulePermIds.includes(id))
        : [...new Set([...f.permissionIds, ...modulePermIds])],
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
          <RefreshCw className={cn('w-3 h-3', loadingRoles && 'animate-spin')} />
        </button>
        {status && <span className="text-[10px] text-green-700 ml-2">{status}</span>}
        {err && <span className="text-[10px] text-red-600 ml-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</span>}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* roles list */}
        <div className="w-56 flex flex-col border-r border-[#d4d0c8] bg-white overflow-auto">
          {loadingRoles ? (
            <div className="text-[10.5px] text-gray-500 p-3">Loading…</div>
          ) : roles.length === 0 ? (
            <div className="text-[10.5px] text-gray-400 p-3">No roles yet</div>
          ) : roles.map(r => (
            <div
              key={r.id}
              onClick={() => { setSelected(r); setMode('view'); setErr(''); setStatus(''); }}
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
              <div className="text-[#666]">{r._count.userRoles} user{r._count.userRoles !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>

        {/* role detail */}
        <div className="flex-1 p-3 overflow-auto">
          {mode === 'view' && !selected && (
            <div className="text-[11px] text-gray-400 mt-8 text-center">Select a role or click New</div>
          )}

          {mode === 'view' && selected && (
            <div>
              <div className="text-[11px] font-bold text-[#333] mb-2 border-b border-[#e0e0e0] pb-1">{selected.name}</div>
              {selected.description && <div className="text-[10.5px] text-gray-500 mb-3">{selected.description}</div>}
              <div className="text-[10.5px] font-bold text-[#444] mb-1">Permissions</div>
              <div className="overflow-auto max-h-80">
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                      <th className="text-left px-2 py-1 border-r border-[#d4d0c8] w-32">Module</th>
                      {ACTIONS.map(a => <th key={a} className="px-2 py-1 border-r border-[#d4d0c8] w-16 text-center">{a}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(permsByModule).map(({ module, perms }) => (
                      <tr key={module.id} className="border-b border-[#f0f0f0]">
                        <td className="px-2 py-1 border-r border-[#f0f0f0] font-medium">{module.name}</td>
                        {ACTIONS.map(action => {
                          const perm = perms.find(p => p.action === action);
                          const has = perm && selected.rolePermissions.some(rp => rp.permission.id === perm.id);
                          return (
                            <td key={action} className="px-2 py-1 border-r border-[#f0f0f0] text-center">
                              {has ? <Check className="w-3 h-3 text-green-600 inline" /> : <span className="text-gray-300">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <YellowBtn onClick={() => openEdit(selected)}>Edit</YellowBtn>
              </div>
            </div>
          )}

          {(mode === 'new' || mode === 'edit') && (
            <div className="flex flex-col h-full">
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

              <div className="mt-2 mb-1 text-[10.5px] font-bold text-[#444]">Permissions</div>
              <div className="border border-[#d4d0c8] rounded-[1px] flex-1 overflow-auto bg-white">
                {availablePerms.length === 0 ? (
                  <div className="text-[10px] text-gray-400 p-3">No modules enabled for this company — enable modules in the Modules tab first.</div>
                ) : (
                  <table className="w-full border-collapse text-[10px]">
                    <thead className="sticky top-0">
                      <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                        <th className="text-left px-2 py-1 border-r border-[#d4d0c8] w-32">Module</th>
                        {ACTIONS.map(a => <th key={a} className="px-2 py-1 border-r border-[#d4d0c8] w-16 text-center">{a}</th>)}
                        <th className="px-2 py-1 text-center w-12">All</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(permsByModule).map(({ module, perms }) => {
                        const allSelected = perms.every(p => form.permissionIds.includes(p.id));
                        return (
                          <tr key={module.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                            <td className="px-2 py-1 border-r border-[#f0f0f0] font-medium">{module.name}</td>
                            {ACTIONS.map(action => {
                              const perm = perms.find(p => p.action === action);
                              return (
                                <td key={action} className="px-2 py-1 border-r border-[#f0f0f0] text-center">
                                  {perm ? (
                                    <input
                                      type="checkbox"
                                      checked={form.permissionIds.includes(perm.id)}
                                      onChange={() => togglePerm(perm.id)}
                                    />
                                  ) : <span className="text-gray-200">—</span>}
                                </td>
                              );
                            })}
                            <td className="px-2 py-1 text-center">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={() => toggleModuleAll(module.id)}
                                title="Toggle all for this module"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex gap-2 mt-3">
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

// ─── Modules Tab ──────────────────────────────────────────────────────────────

const ModulesTab: React.FC<{ companyId: string }> = ({ companyId }) => {
  const qc = useQueryClient();
  const [toggling, setToggling] = useState<string | null>(null);
  const [status, setStatus] = useState('');

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
      setToggling(null);
      setStatus(`Module ${vars.isEnabled ? 'enabled' : 'disabled'}.`);
    },
    onError: () => setToggling(null),
  });

  const isEnabled = (moduleId: string) =>
    company?.companyModules.find(cm => cm.moduleId === moduleId)?.isEnabled ?? false;

  const handleToggle = (moduleId: string) => {
    const current = isEnabled(moduleId);
    setToggling(moduleId);
    setStatus('');
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
                        'relative w-9 h-5 rounded-full transition-colors focus:outline-none border',
                        enabled ? 'bg-orange-400 border-orange-500' : 'bg-gray-200 border-gray-300',
                        busy && 'opacity-50',
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                        enabled ? 'translate-x-4' : 'translate-x-0.5',
                      )} />
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
  const { user, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'Users' | 'Roles' | 'Modules'>('Users');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

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
  const effectiveCompanyId = isSuperAdmin ? selectedCompanyId : (user?.companyId ?? '');

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

  // ── resize ────────────────────────────────────────────────────────────────
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = windowState.width;
    const startH = windowState.height;
    const onMove = (me: MouseEvent) => {
      setWindowState(prev => ({
        ...prev,
        width: Math.max(760, startW + me.clientX - startX),
        height: Math.max(500, startH + me.clientY - startY),
      }));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [windowState.width, windowState.height, setWindowState]);

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

      {/* resize handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeMouseDown}
          style={{ background: 'linear-gradient(135deg, transparent 50%, #b0b0b0 50%)' }}
        />
      )}
    </div>
  );
};
