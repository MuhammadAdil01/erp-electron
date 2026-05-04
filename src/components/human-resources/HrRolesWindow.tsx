import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Minus, Square, RefreshCw, Plus, Trash2, Shield, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hrApi, HrRole, HrUser, HrPermission, CreateHrRolePayload } from '../../api/hr.api';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

type ActiveTab = 'roles' | 'users';

const HR_ROLE_LEVELS = [
  { label: 'HR Admin',   hint: 'Full control — MANAGE on all HR modules' },
  { label: 'HR Manager', hint: 'Elevated — CREATE / UPDATE / DELETE on all HR modules' },
  { label: 'HR Viewer',  hint: 'Read-only — VIEW only on all HR modules' },
];

export const HrRolesWindow: React.FC<Props> = ({ show, onClose, windowState, setWindowState, onFocus }) => {
  const { user: authUser, hasPermission } = useAuth();
  const canManage = hasPermission('hr:MANAGE');
  const canCreate = hasPermission('hr:CREATE') || canManage;
  const canDelete = hasPermission('hr:DELETE') || canManage;

  const [activeTab, setActiveTab] = useState<ActiveTab>('roles');

  // ── Roles state ──────────────────────────────────────────────────────────
  const [roles, setRoles] = useState<HrRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<HrRole | null>(null);
  const [availablePerms, setAvailablePerms] = useState<HrPermission[]>([]);
  const [roleForm, setRoleForm] = useState<CreateHrRolePayload>({ name: '', description: '', permissionIds: [] });
  const [roleMode, setRoleMode] = useState<'view' | 'create' | 'edit'>('view');

  // ── Users state ──────────────────────────────────────────────────────────
  const [hrUsers, setHrUsers] = useState<HrUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<HrUser | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cleanupRef = useRef<(() => void) | null>(null);

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [r, p] = await Promise.all([
        hrApi.getAllRoles(),
        hrApi.getAvailablePermissions(),
      ]);
      setRoles(r);
      setAvailablePerms(p);
    } catch {
      setError('Failed to load HR roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const u = await hrApi.getAllUsers();
      setHrUsers(u);
    } catch {
      setError('Failed to load HR users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    if (activeTab === 'roles') fetchRoles();
    else fetchUsers();
  }, [show, activeTab, fetchRoles, fetchUsers]);

  useEffect(() => () => { if (cleanupRef.current) cleanupRef.current(); }, []);

  // ── Role actions ─────────────────────────────────────────────────────────

  const handleSelectRole = (role: HrRole) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description ?? '',
      permissionIds: role.rolePermissions.map(rp => rp.permission.id),
    });
    setRoleMode('view');
    setError('');
    setSuccess('');
  };

  const handleNewRole = () => {
    setSelectedRole(null);
    setRoleForm({ name: '', description: '', permissionIds: [] });
    setRoleMode('create');
    setError('');
    setSuccess('');
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) { setError('Role name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (roleMode === 'create') {
        const created = await hrApi.createRole(roleForm);
        setRoles(prev => [...prev, created]);
        setSelectedRole(created);
        setRoleMode('view');
        setSuccess('HR role created');
      } else if (roleMode === 'edit' && selectedRole) {
        const updated = await hrApi.updateRole(selectedRole.id, roleForm);
        setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
        setSelectedRole(updated);
        setRoleMode('view');
        setSuccess('HR role updated');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    if (!window.confirm(`Delete HR role "${selectedRole.name}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await hrApi.removeRole(selectedRole.id);
      setRoles(prev => prev.filter(r => r.id !== selectedRole.id));
      setSelectedRole(null);
      setRoleForm({ name: '', description: '', permissionIds: [] });
      setRoleMode('view');
      setSuccess('HR role deleted');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to delete role');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await hrApi.seedDefaults();
      await fetchRoles();
      setSuccess(`Seeded: ${res.seeded.join(', ')}`);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to seed defaults');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissionIds: prev.permissionIds?.includes(permId)
        ? prev.permissionIds.filter(id => id !== permId)
        : [...(prev.permissionIds ?? []), permId],
    }));
  };

  // ── Window drag/resize ───────────────────────────────────────────────────

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    const sx = e.clientX - windowState.x, sy = e.clientY - windowState.y;
    const onMove = (ev: MouseEvent) => setWindowState(p => ({ ...p, x: ev.clientX - sx, y: ev.clientY - sy }));
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); cleanupRef.current = null; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    cleanupRef.current = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  };

  const handleResize = (dir: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const sw = windowState.width, sh = windowState.height, sx = e.clientX, sy = e.clientY;
    const sxp = windowState.x, syp = windowState.y;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      setWindowState(prev => {
        let nx = prev.x, ny = prev.y, nw = prev.width, nh = prev.height;
        const minW = 760, minH = 540;
        if (dir.includes('e')) nw = Math.max(minW, sw + dx);
        if (dir.includes('s')) nh = Math.max(minH, sh + dy);
        if (dir.includes('w')) { const pw = sw - dx; if (pw > minW) { nw = pw; nx = sxp + dx; } else { nw = minW; nx = sxp + (sw - minW); } }
        if (dir.includes('n')) { const ph = sh - dy; if (ph > minH) { nh = ph; ny = syp + dy; } else { nh = minH; ny = syp + (sh - minH); } }
        return { ...prev, x: nx, y: ny, width: nw, height: nh };
      });
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); cleanupRef.current = null; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    cleanupRef.current = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  };

  if (!show || windowState.isMinimized) return null;

  // ── Styles ───────────────────────────────────────────────────────────────

  const lbl = 'text-[11px] text-gray-700 whitespace-nowrap leading-[18px]';
  const inp = 'w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white disabled:bg-[#e1e1e1] disabled:text-gray-600';
  const btn = 'px-3 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] hover:brightness-95 active:shadow-inner font-normal flex items-center justify-center gap-1';
  const btnPrimary = 'px-3 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] hover:brightness-95 active:shadow-inner';
  const btnDanger = 'px-3 py-0.5 bg-gradient-to-b from-[#ffdddd] to-[#ffaaaa] border border-red-400 text-red-700 text-[11px] shadow-sm rounded-[1px] hover:brightness-95 active:shadow-inner flex items-center gap-1';
  const tab = (active: boolean) => `px-4 py-1 text-[11px] font-medium border-t border-l border-r rounded-t-sm cursor-default select-none ${active ? 'bg-[#ececec] border-gray-400 -mb-px z-10' : 'bg-[#d4d4d4] border-gray-300 text-gray-600 hover:brightness-95'}`;

  // Group permissions by module for display
  const permsByModule = availablePerms.reduce<Record<string, HrPermission[]>>((acc, p) => {
    const key = p.module.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div
      onMouseDown={onFocus}
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
      }}
      className="absolute bg-[#ececec] flex flex-col shadow-[4px_4px_16px_rgba(0,0,0,0.5)] border border-[#404040]/50 rounded-[2px] overflow-hidden group/window select-none text-[11px]"
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleDrag}
        className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-orange-600" />
          <span className="text-black font-medium text-[11.5px] tracking-tight">HR Access Control</span>
        </div>
        <div className="flex items-center gap-0.5">
          <div onClick={() => setWindowState(p => ({ ...p, isMinimized: true }))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5">
            <Minus className="w-3.5 h-3.5 text-gray-600" />
          </div>
          <div onClick={() => setWindowState(p => ({ ...p, isMaximized: !p.isMaximized }))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5">
            <Square className="w-3 h-3 text-gray-600" />
          </div>
          <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors group">
            <X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" />
          </div>
        </div>
      </div>

      {/* Orange ribbon */}
      <div className="h-2 bg-[#f39c12] border-b border-gray-400 shrink-0" />

      {/* HR role level legend */}
      <div className="px-3 pt-2 pb-1 flex items-center gap-4 border-b border-gray-300 bg-[#f5f5f5] shrink-0">
        {HR_ROLE_LEVELS.map(level => (
          <div key={level.label} className="flex items-center gap-1">
            <span className="font-bold text-orange-700">{level.label}</span>
            <span className="text-gray-500">— {level.hint}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-3 pt-2 flex gap-0.5 border-b border-gray-400 shrink-0">
        <button className={tab(activeTab === 'roles')} onClick={() => setActiveTab('roles')}>
          <Shield className="w-3 h-3 inline mr-1" />HR Roles
        </button>
        <button className={tab(activeTab === 'users')} onClick={() => setActiveTab('users')}>
          <Users className="w-3 h-3 inline mr-1" />HR Users
        </button>
      </div>

      {/* Status bar */}
      {(error || success) && (
        <div className={`px-3 py-1 text-[10.5px] font-medium shrink-0 ${error ? 'bg-red-50 text-red-700 border-b border-red-200' : 'bg-green-50 text-green-700 border-b border-green-200'}`}>
          {error || success}
        </div>
      )}

      {/* ── ROLES TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'roles' && (
        <div className="flex-1 flex gap-0 min-h-0 overflow-hidden">

          {/* Left panel — role list */}
          <div className="w-[220px] flex flex-col border-r border-gray-400 shrink-0">
            <div className="flex items-center justify-between px-2 py-1 bg-[#e4e4e4] border-b border-gray-400">
              <span className="font-semibold text-gray-700">HR Roles</span>
              <div className="flex gap-0.5">
                <button onClick={fetchRoles} className={btn} title="Refresh">
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
                {canManage && (
                  <button onClick={handleNewRole} className={btn} title="New HR Role">
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500 italic text-[10.5px]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />Loading…
                </div>
              ) : roles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 text-[10.5px] italic px-3 text-center">
                  <Shield className="w-6 h-6 text-gray-300" />
                  No HR roles found.
                  {canManage && (
                    <button onClick={handleSeedDefaults} disabled={saving} className={btnPrimary}>
                      Seed Defaults
                    </button>
                  )}
                </div>
              ) : (
                roles.map((role, i) => (
                  <div
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    className={`flex items-center px-2 border-b border-gray-100 h-[22px] cursor-default truncate
                      ${selectedRole?.id === role.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50'}`}
                  >
                    <span className="w-5 text-gray-400 text-center shrink-0">{i + 1}</span>
                    <span className="ml-1 truncate font-medium">{role.name}</span>
                    <span className="ml-auto text-gray-400 text-[9.5px] shrink-0">{role._count.userRoles}u</span>
                  </div>
                ))
              )}
            </div>
            {canManage && roles.length > 0 && (
              <div className="px-2 py-1 border-t border-gray-300 bg-[#ececec]">
                <button onClick={handleSeedDefaults} disabled={saving} className={`${btn} w-full justify-center`}>
                  <Plus className="w-3 h-3" />Seed Defaults
                </button>
              </div>
            )}
          </div>

          {/* Right panel — role detail / form */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {(selectedRole || roleMode === 'create') ? (
              <>
                {/* Role form fields */}
                <div className="p-3 border-b border-gray-300 bg-[#f5f5f5] shrink-0">
                  <div className="grid grid-cols-[90px_1fr] gap-x-2 gap-y-1.5 max-w-md">
                    <span className={lbl}>Role Name</span>
                    <input
                      className={inp}
                      value={roleForm.name}
                      disabled={roleMode === 'view'}
                      onChange={e => setRoleForm(p => ({ ...p, name: e.target.value }))}
                    />
                    <span className={lbl}>Description</span>
                    <input
                      className={inp}
                      value={roleForm.description ?? ''}
                      disabled={roleMode === 'view'}
                      onChange={e => setRoleForm(p => ({ ...p, description: e.target.value }))}
                    />
                    <span className={lbl}>Domain</span>
                    <input className={inp} value="HR" disabled />
                    <span className={lbl}>Users Assigned</span>
                    <input className={inp} value={selectedRole?._count.userRoles ?? 0} disabled />
                  </div>
                </div>

                {/* Permissions grid */}
                <div className="flex-1 overflow-y-auto p-3 min-h-0">
                  <div className="text-[10.5px] font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Module Permissions {roleMode === 'view' ? '(read-only)' : ''}
                  </div>
                  {Object.entries(permsByModule).map(([modName, perms]) => (
                    <div key={modName} className="mb-3">
                      <div className="text-[10.5px] font-semibold text-gray-700 mb-1 border-b border-gray-200 pb-0.5">
                        {modName}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {perms.map(perm => (
                          <label key={perm.id} className={`flex items-center gap-1 ${roleMode === 'view' ? 'cursor-default' : 'cursor-pointer'}`}>
                            <input
                              type="checkbox"
                              checked={roleForm.permissionIds?.includes(perm.id) ?? false}
                              disabled={roleMode === 'view'}
                              onChange={() => togglePermission(perm.id)}
                              className="w-3 h-3"
                            />
                            <span className="text-[11px]">{perm.action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="px-3 py-2 border-t border-gray-300 bg-[#ececec] flex items-center gap-1.5 shrink-0">
                  {canManage && roleMode === 'view' && (
                    <>
                      <button onClick={() => setRoleMode('edit')} className={btnPrimary}>Edit</button>
                      <button onClick={handleDeleteRole} disabled={saving} className={btnDanger}>
                        <Trash2 className="w-3 h-3" />Delete
                      </button>
                    </>
                  )}
                  {canManage && (roleMode === 'create' || roleMode === 'edit') && (
                    <>
                      <button onClick={handleSaveRole} disabled={saving} className={btnPrimary}>
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          if (selectedRole) { handleSelectRole(selectedRole); }
                          else { setRoleMode('view'); setRoleForm({ name: '', description: '', permissionIds: [] }); }
                        }}
                        className={btn}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 italic text-[10.5px]">
                Select an HR role from the list to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── USERS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-3">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className="font-semibold text-gray-700 text-[11.5px]">HR Domain Users</span>
            <button onClick={fetchUsers} className={btn} disabled={loading}>
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />Refresh
            </button>
          </div>

          {/* Users table */}
          <div className="flex-1 flex flex-col border border-gray-400 bg-white overflow-hidden shadow-inner min-h-0">
            <div className="flex bg-[#e4e4e4] border-b border-gray-400 divide-x divide-gray-400 text-[10.5px] shrink-0">
              <div className="w-8  px-1 py-0.5 text-center text-gray-600 font-medium">#</div>
              <div className="w-36 px-2 py-0.5 text-gray-700 font-medium">Name</div>
              <div className="w-44 px-2 py-0.5 text-gray-700 font-medium">Email</div>
              <div className="w-28 px-2 py-0.5 text-gray-700 font-medium">Department</div>
              <div className="flex-1 px-2 py-0.5 text-gray-700 font-medium">HR Role(s)</div>
              <div className="w-16 px-2 py-0.5 text-gray-700 font-medium">Status</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[repeating-linear-gradient(white,white_21px,#f5f5f5_21px,#f5f5f5_22px)]">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500 italic">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />Loading…
                </div>
              ) : hrUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 italic text-[10.5px]">
                  No HR users found. Create an HR user via the HR Admin role.
                </div>
              ) : (
                hrUsers.map((u, i) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`flex border-b border-gray-200 divide-x divide-gray-200 h-[22px] items-center cursor-default
                      ${selectedUser?.id === u.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50'}`}
                  >
                    <div className="w-8  px-1 text-center text-gray-500">{i + 1}</div>
                    <div className="w-36 px-2 truncate font-medium">{u.name}</div>
                    <div className="w-44 px-2 truncate text-gray-600">{u.email}</div>
                    <div className="w-28 px-2 truncate text-gray-600">{u.department?.name ?? '—'}</div>
                    <div className="flex-1 px-2 truncate text-orange-700">
                      {u.userRoles?.map(r => r.role.name).join(', ') || '—'}
                    </div>
                    <div className={`w-16 px-2 font-medium ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                ))
              )}
              {!loading && Array(Math.max(0, 12 - hrUsers.length)).fill(null).map((_, i) => (
                <div key={`empty-${i}`} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[22px] items-center">
                  <div className="w-8 px-1" /><div className="w-36 px-2" /><div className="w-44 px-2" />
                  <div className="w-28 px-2" /><div className="flex-1 px-2" /><div className="w-16 px-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Selected user detail */}
          {selectedUser && (
            <div className="mt-2 p-2 border border-gray-400 bg-[#f5f5f5] shrink-0">
              <div className="grid grid-cols-[80px_1fr_80px_1fr] gap-x-3 gap-y-1">
                <span className={lbl}>Name</span>
                <span className="text-[11px] font-medium">{selectedUser.name}</span>
                <span className={lbl}>Email</span>
                <span className="text-[11px]">{selectedUser.email}</span>
                <span className={lbl}>HR Roles</span>
                <span className="text-[11px] text-orange-700 font-medium col-span-3">
                  {selectedUser.userRoles?.map(r => r.role.name).join(' · ') || 'None assigned'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resize handles */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')}  className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('s')}  className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('e')}  className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('w')}  className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[70]" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}
    </div>
  );
};
