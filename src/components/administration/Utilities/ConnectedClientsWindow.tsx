import React, { useState } from 'react';
import { Monitor, LogOut, RefreshCw } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { utilitiesApi, type ConnectedClient } from '../../../api/administration.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

const when = (v: string) => new Date(v).toLocaleString();

/**
 * Connected Clients.
 *
 * "Signed in" is derived from live refresh tokens rather than a session table.
 * A second table tracking the same fact would drift the moment a token was
 * revoked without the tracker being told, and then this window would list
 * sessions that no longer exist.
 */
export const ConnectedClientsWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId, user } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const clientsQuery = useQuery({
    queryKey: ['connected-clients', companyId],
    queryFn: () => utilitiesApi.connectedClients(),
    enabled: !!companyId,
    // Sessions come and go, so this is one of the few screens where polling is
    // the right answer rather than a stale list the operator has to remember to
    // refresh.
    refetchInterval: 30_000,
  });

  const disconnectMut = useMutation({
    mutationFn: (userId: string) => utilitiesApi.disconnectClient(userId),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['connected-clients'] });
      setSelectedId(null);
      setError('');
      setStatus(res.message);
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : 'Could not disconnect that user.');
      setStatus('');
    },
  });

  const clients = clientsQuery.data ?? [];
  const selected = clients.find((c) => c.user.id === selectedId) ?? null;

  const handleDisconnect = () => {
    if (!selected) return;
    if (selected.user.id === user?.id) {
      setError('That is your own session — use Log Out instead.');
      return;
    }
    if (!window.confirm(
      `Sign ${selected.user.email} out of all ${selected.sessionCount} session(s)?\n\n` +
      'They will have to sign in again. Unsaved work in their windows is lost.',
    )) return;
    setError('');
    disconnectMut.mutate(selected.user.id);
  };

  return (
    <ClassicWindow
      title="Connected Clients"
      icon={<Monitor className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={760}
      minHeight={440}
      toolbar={
        <>
          <ToolBtn onClick={() => clientsQuery.refetch()} title="Refresh">
            <RefreshCw className={cn('w-3 h-3', clientsQuery.isFetching && 'animate-spin')} /> Refresh
          </ToolBtn>
          <ToolBtn
            danger
            onClick={handleDisconnect}
            disabled={!selected || disconnectMut.isPending}
          >
            <LogOut className="w-3 h-3" />
            {disconnectMut.isPending ? 'Disconnecting…' : 'Disconnect'}
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>
            {clients.length} connected user(s) ·{' '}
            {clients.reduce((n, c) => n + c.sessionCount, 0)} live session(s)
          </span>
          <span>Connected Clients</span>
        </>
      }
    >
      {!companyId ? (
        <div className="p-3 text-[10px] text-gray-500 italic">
          No company selected. Open{' '}
          <span className="font-medium not-italic">Administration → Choose Company</span> first.
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex overflow-hidden">
          <div className="flex-1 min-w-0 overflow-auto bg-white custom-scrollbar">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">User</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">E-Mail</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Role</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Sessions</th>
                  <th className="px-2 py-1 font-bold text-[#444]">Newest Session</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c: ConnectedClient) => (
                  <tr
                    key={c.user.id}
                    onClick={() => { setSelectedId(c.user.id); setError(''); }}
                    className={cn(
                      'border-b border-[#f0f0f0] cursor-default',
                      selectedId === c.user.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/50',
                    )}
                  >
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">
                      {c.user.name}
                      {c.user.id === user?.id && (
                        <span className="text-[9px] text-gray-500 ml-1">(you)</span>
                      )}
                    </td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">{c.user.email}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">{c.user.roleType}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">{c.sessionCount}</td>
                    <td className="px-2 py-1">{when(c.lastSeenAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {clientsQuery.isLoading && (
              <div className="p-3 text-[10.5px] text-gray-400">Loading…</div>
            )}
            {!clientsQuery.isLoading && !clients.length && (
              <div className="p-3 text-[10.5px] text-gray-400">
                Nobody is signed in to this company right now.
              </div>
            )}
          </div>

          {selected && (
            <div className="w-[300px] shrink-0 border-l border-[#d4d0c8] bg-[#f7f7f7] p-2 overflow-auto custom-scrollbar">
              <div className="text-[11px] font-bold mb-1">{selected.user.name}</div>
              <div className="text-[10px] text-gray-600 mb-2">
                Last sign-in {selected.user.lastLoginAt ? when(selected.user.lastLoginAt) : '—'}
              </div>
              <div className="text-[10.5px] font-bold mb-1">Sessions</div>
              {selected.sessions.map((s) => (
                <div key={s.id} className="border border-[#e0e0e0] bg-white p-1.5 mb-1 text-[9.5px]">
                  <div>Started {when(s.createdAt)}</div>
                  <div>Expires {when(s.expiresAt)}</div>
                  <div className="text-gray-600">IP {s.ipAddress ?? '—'}</div>
                  <div className="text-gray-600 truncate" title={s.userAgent ?? ''}>
                    {s.userAgent ?? 'unknown client'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
        <YellowBtn onClick={onClose}>OK</YellowBtn>
        <GreyBtn onClick={onClose}>Cancel</GreyBtn>
        <span className="text-[9.5px] text-gray-600 ml-1">
          Disconnecting revokes every refresh token the user holds, so all their devices sign out.
        </span>
      </div>
    </ClassicWindow>
  );
};
