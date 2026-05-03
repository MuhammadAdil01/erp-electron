import React, { useState, useCallback, useRef } from 'react';
import { X, Minus, Square, Plus, Trash2, RefreshCw, Shield, User, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { usersApi, User as ApiUser, CreateUserPayload, UpdateUserPayload } from '../../api/users.api';
import { rolesApi } from '../../api/roles.api';
import { cn, ClassicInput, YellowBtn, GreyBtn, FieldRow } from '../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

type Mode = 'view' | 'new' | 'edit';

export const UsersSetupWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const { user: authUser } = useAuth();
  const qc = useQueryClient();
  const cleanupRef = useRef<(() => void) | null>(null);

  const [selected, setSelected] = useState<ApiUser | null>(null);
  const [mode, setMode] = useState<Mode>('view');
  const [form, setForm] = useState({ name: '', email: '', password: '', isActive: true, roleIds: [] as string[] });
  const [err, setErr] = useState('');
  const [status, setStatus] = useState('');

  const companyId = authUser?.companyId;

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users-setup', companyId],
    queryFn: () => usersApi.getAll(),
    enabled: !!companyId,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles-setup', companyId],
    queryFn: () => rolesApi.getAll(),
    enabled: !!companyId,
  });

  const createMut = useMutation({
    mutationFn: (p: CreateUserPayload) => usersApi.create(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users-setup'] });
      setMode('view'); setStatus('User created successfully.'); setErr('');
    },
    onError: (e: any) => setErr(e.message ?? 'Failed to create user'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, p }: { id: string; p: UpdateUserPayload }) => usersApi.update(id, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users-setup'] });
      setMode('view'); setStatus('User updated successfully.'); setErr('');
    },
    onError: (e: any) => setErr(e.message ?? 'Failed to update user'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users-setup'] });
      setSelected(null); setMode('view'); setStatus('User deleted.'); setErr('');
    },
    onError: (e: any) => setErr(e.message ?? 'Failed to delete user'),
  });

  const isBusy = createMut.isPending || updateMut.isPending || deleteMut.isPending;

  const openNew = () => {
    setForm({ name: '', email: '', password: '', isActive: true, roleIds: [] });
    setErr(''); setStatus(''); setMode('new');
  };

  const openEdit = (u: ApiUser) => {
    setSelected(u);
    setForm({
      name: u.name, email: u.email, password: '',
      isActive: u.isActive,
      roleIds: (u.userRoles ?? []).map(ur => ur.role.id),
    });
    setErr(''); setStatus(''); setMode('edit');
  };

  const handleSave = () => {
    setErr('');
    if (!form.name.trim() || !form.email.trim()) { setErr('Name and email are required.'); return; }
    if (mode === 'new') {
      if (!form.password.trim()) { setErr('Password is required for new users.'); return; }
      createMut.mutate({ name: form.name, email: form.email, password: form.password, isActive: form.isActive, roleIds: form.roleIds });
    } else if (mode === 'edit' && selected) {
      const p: UpdateUserPayload = { name: form.name, email: form.email, isActive: form.isActive, roleIds: form.roleIds };
      if (form.password.trim()) p.password = form.password;
      updateMut.mutate({ id: selected.id, p });
    }
  };

  const handleDelete = () => {
    if (!selected || !window.confirm(`Delete user "${selected.name}"?`)) return;
    deleteMut.mutate(selected.id);
  };

  const toggleRole = (roleId: string) => {
    setForm(f => ({
      ...f,
      roleIds: f.roleIds.includes(roleId) ? f.roleIds.filter(id => id !== roleId) : [...f.roleIds, roleId],
    }));
  };

  // ── drag ──────────────────────────────────────────────────────────────────────
  const handleDrag = useCallback((e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;
    const onMove = (me: MouseEvent) => setWindowState(p => ({ ...p, x: me.clientX - startX, y: me.clientY - startY }));
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); cleanupRef.current = null; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    cleanupRef.current = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [windowState.isMaximized, windowState.x, windowState.y, setWindowState]);

  // ── resize ─────────────────────────────────────────────────────────────────────
  const handleResize = useCallback((dir: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const { x: sx, y: sy, width: sw, height: sh } = windowState;
    const mx = e.clientX, my = e.clientY;
    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - mx, dy = me.clientY - my;
      setWindowState(p => {
        const MIN_W = 680, MIN_H = 520;
        let nx = p.x, ny = p.y, nw = p.width, nh = p.height;
        if (dir.includes('e')) nw = Math.max(MIN_W, sw + dx);
        if (dir.includes('s')) nh = Math.max(MIN_H, sh + dy);
        if (dir.includes('w')) { const pw = sw - dx; nw = pw > MIN_W ? pw : MIN_W; nx = pw > MIN_W ? sx + dx : sx + sw - MIN_W; }
        if (dir.includes('n')) { const ph = sh - dy; nh = ph > MIN_H ? ph : MIN_H; ny = ph > MIN_H ? sy + dy : sy + sh - MIN_H; }
        return { ...p, x: nx, y: ny, width: nw, height: nh };
      });
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [windowState, setWindowState]);

  if (!show || windowState.isMinimized) return null;

  const style: React.CSSProperties = windowState.isMaximized
    ? { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: windowState.zIndex }
    : { position: 'absolute', left: windowState.x, top: windowState.y, width: windowState.width, height: windowState.height, zIndex: windowState.zIndex };

  return (
    <div style={style} onMouseDown={onFocus}
      className="flex flex-col bg-[#ececec] shadow-[4px_4px_16px_rgba(0,0,0,0.5)] border border-[#404040]/50 rounded-[2px] overflow-hidden select-none text-[11px]">

      {/* Title bar */}
      <div onMouseDown={handleDrag}
        className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-black font-medium text-[11.5px] tracking-tight">Users - Setup</span>
        </div>
        <div className="flex items-center gap-0.5">
          <div onClick={() => setWindowState(p => ({ ...p, isMinimized: true }))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Minus className="w-3.5 h-3.5 text-gray-600" /></div>
          <div onClick={() => setWindowState(p => ({ ...p, isMaximized: !p.isMaximized }))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Square className="w-3 h-3 text-gray-600" /></div>
          <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 group"><X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" /></div>
        </div>
      </div>

      {/* Orange accent */}
      <div className="h-[3px] shrink-0" style={{ background: 'linear-gradient(to right, #f39c12, #e67e22)' }} />

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] border-b border-[#d4d0c8] shrink-0">
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
          <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
        </button>
        {status && <span className="text-[10px] text-green-700 ml-2">{status}</span>}
        {err && <span className="text-[10px] text-red-600 ml-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</span>}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* User list */}
        <div className="w-[220px] bg-white border-r border-[#d4d0c8] flex flex-col shrink-0 overflow-auto">
          {!companyId ? (
            <div className="p-3 text-[10px] text-gray-400 italic">Log in as a company user to manage users.</div>
          ) : isLoading ? (
            <div className="p-3 text-[10.5px] text-gray-400">Loading…</div>
          ) : users.length === 0 ? (
            <div className="p-3 text-[10.5px] text-gray-400">No users found.</div>
          ) : users.map(u => (
            <div key={u.id}
              onClick={() => { setSelected(u); setMode('view'); setErr(''); setStatus(''); }}
              onDoubleClick={() => openEdit(u)}
              className={cn('flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-[#f0f0f0] transition-colors',
                selected?.id === u.id ? 'bg-[#ffed99]' : 'hover:bg-[#f5f5f5]')}>
              <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0', u.isActive ? 'bg-blue-400' : 'bg-gray-300')}>
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] font-medium text-gray-800 truncate">{u.name}</div>
                <div className="text-[9.5px] text-gray-500 truncate">{u.email}</div>
                <div className="flex gap-0.5 mt-0.5 flex-wrap">
                  {(u.userRoles ?? []).map(ur => (
                    <span key={ur.role.id} className="bg-orange-100 text-orange-700 px-1 rounded-[1px] text-[8.5px]">{ur.role.name}</span>
                  ))}
                  {!u.isActive && <span className="bg-gray-200 text-gray-500 px-1 rounded-[1px] text-[8.5px]">Inactive</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail / form panel */}
        <div className="flex-1 p-4 overflow-auto bg-white">
          {mode === 'view' && !selected && (
            <div className="text-[11px] text-gray-400 mt-10 text-center">Select a user or click New</div>
          )}

          {mode === 'view' && selected && (
            <div>
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#e0e0e0]">
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', selected.isActive ? 'bg-blue-400' : 'bg-gray-300')}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[12px] font-bold text-gray-800">{selected.name}</div>
                  <div className="text-[10px] text-gray-500">{selected.email}</div>
                </div>
              </div>
              <FieldRow label="Status">{selected.isActive ? 'Active' : 'Inactive'}</FieldRow>
              <FieldRow label="Roles">
                <div className="flex gap-1 flex-wrap">
                  {(selected.userRoles ?? []).length === 0
                    ? <span className="text-gray-400 text-[10px]">None assigned</span>
                    : (selected.userRoles ?? []).map(ur => (
                      <span key={ur.role.id} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-[1px] text-[9px]">{ur.role.name}</span>
                    ))}
                </div>
              </FieldRow>
              <div className="mt-4">
                <YellowBtn onClick={() => openEdit(selected)}>Edit</YellowBtn>
              </div>
            </div>
          )}

          {(mode === 'new' || mode === 'edit') && (
            <div>
              <div className="text-[11px] font-bold text-[#333] mb-3 border-b border-[#e0e0e0] pb-1">
                {mode === 'new' ? 'New User' : `Edit — ${selected?.name}`}
              </div>
              <FieldRow label="Name" required>
                <ClassicInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-52" />
              </FieldRow>
              <FieldRow label="Email" required>
                <ClassicInput type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-52" />
              </FieldRow>
              <FieldRow label={mode === 'new' ? 'Password *' : 'New Password'}>
                <ClassicInput type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-52" placeholder={mode === 'edit' ? 'leave blank to keep current' : ''} />
              </FieldRow>
              <FieldRow label="Active">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
              </FieldRow>

              <div className="mt-3 mb-1 text-[10.5px] font-bold text-[#444]">Roles</div>
              <div className="border border-[#d4d0c8] rounded-[1px] p-2 max-h-40 overflow-auto bg-white">
                {roles.length === 0
                  ? <div className="text-[10px] text-gray-400">No roles defined yet. Create roles in Company Admin.</div>
                  : roles.map(r => (
                    <label key={r.id} className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-[#f5f5f5] px-1 rounded-[1px]">
                      <input type="checkbox" checked={form.roleIds.includes(r.id)} onChange={() => toggleRole(r.id)} />
                      <span className="text-[10.5px]">{r.name}</span>
                      {r.description && <span className="text-[9px] text-gray-400">— {r.description}</span>}
                    </label>
                  ))}
              </div>

              <div className="flex gap-2 mt-4">
                <YellowBtn onClick={handleSave} disabled={isBusy}>{isBusy ? 'Saving…' : 'Save'}</YellowBtn>
                <GreyBtn onClick={() => { setMode('view'); setErr(''); setStatus(''); }}>Cancel</GreyBtn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-1 bg-[#f0f0f0] border-t border-[#d4d0c8] text-[9.5px] text-gray-500 shrink-0 flex justify-between">
        <span>{authUser?.name} · {companyId ? `Company: ${companyId.slice(0, 8)}…` : 'No company'}</span>
        <span>Users Setup</span>
      </div>

      {/* Resize handles */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-1 right-1 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-1 right-1 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('e')} className="absolute top-1 bottom-1 right-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('w')} className="absolute top-1 bottom-1 left-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[70]" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}
    </div>
  );
};
