import React, { useState } from 'react';
import { ScrollText, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { licenseApi } from '../../../api/administration.api';
import { usersApi } from '../../../api/users.api';
import {
  ClassicWindow,
  ToolBtn,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

/**
 * Support User Log.
 *
 * Written by the administration actions that matter — a license import, a seat
 * assignment or release, a change-log cleanup, a forced disconnect. Read-only
 * here on purpose: a log a user can edit is not a log.
 */
export const SupportUserLogWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const companyId = activeCompanyId;

  const [userId, setUserId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const logQuery = useQuery({
    queryKey: ['support-user-log', companyId, userId, from, to],
    queryFn: () =>
      licenseApi.supportLog({
        userId: userId || undefined,
        from: from || undefined,
        to: to || undefined,
        take: 500,
      }),
    enabled: !!companyId,
  });

  const usersQuery = useQuery({
    queryKey: ['users', companyId],
    queryFn: () => usersApi.getAll(companyId ?? undefined),
    enabled: !!companyId,
  });

  const rows = logQuery.data ?? [];

  return (
    <ClassicWindow
      title="Support User Log"
      icon={<ScrollText className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={860}
      minHeight={480}
      toolbar={
        <ToolBtn onClick={() => logQuery.refetch()} title="Refresh">
          <RefreshCw className={cn('w-3 h-3', logQuery.isFetching && 'animate-spin')} /> Refresh
        </ToolBtn>
      }
      footer={
        <>
          <span>{rows.length} entr{rows.length === 1 ? 'y' : 'ies'}</span>
          <span>Support User Log</span>
        </>
      }
    >
      <div className="shrink-0 bg-[#f7f7f7] border-b border-[#d4d0c8] px-3 py-2 flex items-end gap-3 flex-wrap">
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-600">User</span>
          <ClassicSel value={userId} onChange={(e) => setUserId(e.target.value)} className="w-48">
            <option value="">Anyone</option>
            {(usersQuery.data ?? []).map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </ClassicSel>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-600">From</span>
          <ClassicInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-600">To</span>
          <ClassicInput type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" />
        </label>
        <GreyBtn onClick={() => { setUserId(''); setFrom(''); setTo(''); }}>Clear</GreyBtn>
      </div>

      <div className="flex-1 min-h-0 overflow-auto bg-white custom-scrollbar">
        <table className="w-full border-collapse text-[10.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">When</th>
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">User</th>
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Action</th>
              <th className="px-2 py-1 font-bold text-[#444]">Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[#f0f0f0]">
                <td className="px-2 py-1 border-r border-[#f0f0f0] whitespace-nowrap">
                  {new Date(r.occurredAt).toLocaleString()}
                </td>
                <td className="px-2 py-1 border-r border-[#f0f0f0]">{r.user?.name ?? 'system'}</td>
                <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono">{r.action}</td>
                <td className="px-2 py-1 text-gray-700">{r.detail ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ListPlaceholder
          noCompany={!companyId}
          isLoading={logQuery.isLoading}
          isEmpty={!logQuery.isLoading && !rows.length}
          emptyText="Nothing logged for those filters yet."
        />
      </div>
    </ClassicWindow>
  );
};
