import React, { useMemo, useState } from 'react';
import { Gavel, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { approvalsApi } from '../../../api/administration.api';
import { usersApi } from '../../../api/users.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
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
  /** Opens the shared user-picker. Kept so the workspace can keep passing it. */
  onOpenSelectionUsers?: () => void;
}

const when = (v: string) => new Date(v).toLocaleString();

/**
 * Approval Decision Report — who decided what, and when.
 *
 * This is the audit view of the approval process, so it lists decisions rather
 * than requests: a request that went through three authorizers is three rows
 * here, which is the question this report is asked.
 */
export const ApprovalDecisionReportWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const companyId = activeCompanyId;

  const [approverId, setApproverId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');

  const decisionsQuery = useQuery({
    queryKey: ['approval-decisions', companyId, approverId, from, to],
    queryFn: () =>
      approvalsApi.decisionReport({
        approverId: approverId || undefined,
        from: from || undefined,
        to: to || undefined,
      }),
    enabled: !!companyId,
  });

  const usersQuery = useQuery({
    queryKey: ['users', companyId],
    queryFn: () => usersApi.getAll(companyId ?? undefined),
    enabled: !!companyId,
  });

  const rows = decisionsQuery.data ?? [];

  const summary = useMemo(() => {
    const approved = rows.filter((r) => r.decision === 'APPROVED').length;
    return { approved, rejected: rows.length - approved };
  }, [rows]);

  return (
    <ClassicWindow
      title="Approval Decision Report"
      icon={<Gavel className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={940}
      minHeight={500}
      toolbar={
        <>
          <ToolBtn onClick={() => decisionsQuery.refetch()} title="Refresh">
            <RefreshCw className={cn('w-3 h-3', decisionsQuery.isFetching && 'animate-spin')} /> Refresh
          </ToolBtn>
          <StatusNote
            error={error}
            status={rows.length ? `${summary.approved} approved · ${summary.rejected} rejected` : ''}
          />
        </>
      }
      footer={
        <>
          <span>{rows.length} decision(s)</span>
          <span>Approval Decision Report</span>
        </>
      }
    >
      <div className="shrink-0 bg-[#f7f7f7] border-b border-[#d4d0c8] px-3 py-2 flex items-end gap-3 flex-wrap">
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-600">Authorizer</span>
          <ClassicSel
            value={approverId}
            onChange={(e) => setApproverId(e.target.value)}
            className="w-48"
          >
            <option value="">Anyone</option>
            {(usersQuery.data ?? []).map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </ClassicSel>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-600">Decided From</span>
          <ClassicInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-600">To</span>
          <ClassicInput type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" />
        </label>
        <GreyBtn onClick={() => { setApproverId(''); setFrom(''); setTo(''); setError(''); }}>
          Clear
        </GreyBtn>
      </div>

      <div className="flex-1 min-h-0 overflow-auto bg-white custom-scrollbar">
        <table className="w-full border-collapse text-[10.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Decided</th>
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Authorizer</th>
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Decision</th>
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Stage</th>
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Document</th>
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Originator</th>
              <th className="px-2 py-1 font-bold text-[#444]">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="border-b border-[#f0f0f0]">
                <td className="px-2 py-1 border-r border-[#f0f0f0]">{when(d.decidedAt)}</td>
                <td className="px-2 py-1 border-r border-[#f0f0f0]">{d.approver.name}</td>
                <td className="px-2 py-1 border-r border-[#f0f0f0]">
                  <span className={cn(
                    'text-[9px] px-1 rounded-[1px]',
                    d.decision === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                  )}>
                    {d.decision}
                  </span>
                </td>
                <td className="px-2 py-1 border-r border-[#f0f0f0]">{d.requestStage.stage.name}</td>
                <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono">
                  {d.request.documentNumber ?? d.request.id.slice(0, 8)}
                  <span className="text-gray-500 font-sans"> · {d.request.documentType}</span>
                </td>
                <td className="px-2 py-1 border-r border-[#f0f0f0]">{d.request.originator.name}</td>
                <td className="px-2 py-1 text-gray-600">{d.remarks ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ListPlaceholder
          noCompany={!companyId}
          isLoading={decisionsQuery.isLoading}
          isEmpty={!decisionsQuery.isLoading && !rows.length}
          emptyText="No approval decisions recorded for those filters."
        />
      </div>
    </ClassicWindow>
  );
};
