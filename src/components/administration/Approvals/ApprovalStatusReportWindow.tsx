import React, { useState } from 'react';
import { FileClock, Check, RefreshCw, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  approvalsApi,
  numberingApi,
  type ApprovalRequest,
  type ApprovalRequestStatus,
} from '../../../api/administration.api';
import { usersApi } from '../../../api/users.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

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

const STATUS_STYLE: Record<ApprovalRequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-200 text-gray-700',
  GENERATED: 'bg-blue-100 text-blue-800',
};

const when = (v?: string | null) => (v ? new Date(v).toLocaleString() : '—');

/**
 * Approval Status Report, and the queue the signed-in user acts on.
 *
 * Deciding happens here rather than in a separate window: the report is where an
 * authorizer already is when they see something waiting on them, and making them
 * navigate elsewhere to approve it is how queues get ignored.
 */
export const ApprovalStatusReportWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId, user } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [statusFilter, setStatusFilter] = useState<ApprovalRequestStatus | ''>('');
  const [documentType, setDocumentType] = useState('');
  const [originatorId, setOriginatorId] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const requestsQuery = useQuery({
    queryKey: ['approval-requests', companyId, scope, statusFilter, documentType, originatorId],
    queryFn: () =>
      scope === 'mine'
        ? approvalsApi.myQueue()
        : approvalsApi.listRequests({
            status: statusFilter || undefined,
            documentType: documentType || undefined,
            originatorId: originatorId || undefined,
          }),
    enabled: !!companyId,
  });

  const usersQuery = useQuery({
    queryKey: ['users', companyId],
    queryFn: () => usersApi.getAll(companyId ?? undefined),
    enabled: !!companyId,
  });

  const docTypesQuery = useQuery({
    queryKey: ['numbering-document-types', companyId],
    queryFn: () => numberingApi.documentTypes(),
    enabled: !!companyId,
  });

  const requests = requestsQuery.data ?? [];
  const selected = requests.find((r) => r.id === selectedId) ?? null;

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected that decision.');
    setStatus('');
  };
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['approval-requests'] });
    void qc.invalidateQueries({ queryKey: ['approval-decisions'] });
  };

  const decideMut = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'APPROVED' | 'REJECTED' }) =>
      approvalsApi.decide(id, decision, remarks.trim() || undefined),
    onSuccess: (row) => {
      invalidate();
      setRemarks('');
      setError('');
      setStatus(`Request ${row.documentNumber ?? row.id.slice(0, 8)} is now ${row.status}.`);
    },
    onError: onErr,
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => approvalsApi.cancel(id),
    onSuccess: () => {
      invalidate();
      setError('');
      setStatus('Request withdrawn.');
    },
    onError: onErr,
  });

  const isBusy = decideMut.isPending || cancelMut.isPending;

  /** The stage a decision would land on — the one currently in play. */
  const currentStage = (r: ApprovalRequest) =>
    r.stages.find((s) => s.ordering === r.currentStageOrder) ?? null;

  const canDecide = (r: ApprovalRequest | null) => {
    if (!r || r.status !== 'PENDING' || !user) return false;
    const stage = currentStage(r);
    if (!stage) return false;
    // Only an authorizer named on the live stage can decide, and only once.
    const isAuthorizer = stage.stage.approvers.some((a) => a.userId === user.id);
    const alreadyDecided = stage.decisions.some((d) => d.approverId === user.id);
    return isAuthorizer && !alreadyDecided;
  };

  return (
    <ClassicWindow
      title="Approval Status Report"
      icon={<FileClock className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={980}
      minHeight={560}
      toolbar={
        <>
          <ToolBtn
            onClick={() => { setScope('all'); setSelectedId(null); }}
            className={cn(scope === 'all' && 'bg-[#ffed99] font-bold')}
          >
            All Requests
          </ToolBtn>
          <ToolBtn
            onClick={() => { setScope('mine'); setSelectedId(null); }}
            className={cn(scope === 'mine' && 'bg-[#ffed99] font-bold')}
          >
            Waiting On Me
          </ToolBtn>
          <ToolBtn onClick={() => requestsQuery.refetch()} title="Refresh">
            <RefreshCw className={cn('w-3 h-3', requestsQuery.isFetching && 'animate-spin')} />
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>{requests.length} request(s)</span>
          <span>Approval Status Report</span>
        </>
      }
    >
      {scope === 'all' && (
        <div className="shrink-0 bg-[#f7f7f7] border-b border-[#d4d0c8] px-3 py-2 flex items-end gap-3 flex-wrap">
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-600">Status</span>
            <ClassicSel
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApprovalRequestStatus | '')}
              className="w-32"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="GENERATED">Generated</option>
            </ClassicSel>
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-600">Document Type</span>
            <ClassicSel
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-44"
            >
              <option value="">All</option>
              {(docTypesQuery.data ?? []).map((d) => (
                <option key={d.documentType} value={d.documentType}>{d.documentType}</option>
              ))}
            </ClassicSel>
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-600">Originator</span>
            <ClassicSel
              value={originatorId}
              onChange={(e) => setOriginatorId(e.target.value)}
              className="w-44"
            >
              <option value="">Anyone</option>
              {(usersQuery.data ?? []).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </ClassicSel>
          </label>
          <GreyBtn onClick={() => { setStatusFilter(''); setDocumentType(''); setOriginatorId(''); }}>
            Clear
          </GreyBtn>
        </div>
      )}

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 overflow-auto bg-white custom-scrollbar">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Document</th>
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Type</th>
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Originator</th>
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Template</th>
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Stage</th>
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Status</th>
                <th className="px-2 py-1 font-bold text-[#444]">Raised</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r: ApprovalRequest) => {
                const stage = currentStage(r);
                return (
                  <tr
                    key={r.id}
                    onClick={() => { setSelectedId(r.id); setRemarks(''); setError(''); setStatus(''); }}
                    className={cn(
                      'border-b border-[#f0f0f0] cursor-default',
                      selectedId === r.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/50',
                    )}
                  >
                    <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono">
                      {r.documentNumber ?? r.id.slice(0, 8)}
                    </td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">{r.documentType}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">{r.originator.name}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">{r.template.name}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">
                      {stage ? `${stage.ordering + 1}. ${stage.stage.name}` : '—'}
                    </td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">
                      <span className={cn('text-[9px] px-1 rounded-[1px]', STATUS_STYLE[r.status])}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-2 py-1">{when(r.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <ListPlaceholder
            noCompany={!companyId}
            isLoading={requestsQuery.isLoading}
            isEmpty={!requestsQuery.isLoading && !requests.length}
            emptyText={
              scope === 'mine'
                ? 'Nothing is waiting on you.'
                : 'No approval requests match those filters.'
            }
          />
        </div>

        {selected && (
          <div className="w-[340px] shrink-0 border-l border-[#d4d0c8] bg-[#f7f7f7] p-2 overflow-auto custom-scrollbar">
            <div className="text-[11px] font-bold mb-1">
              {selected.documentNumber ?? selected.id.slice(0, 8)} — {selected.documentType}
            </div>
            <div className="text-[10px] text-gray-600 mb-2">
              Raised by {selected.originator.name} · {when(selected.createdAt)}
              {selected.resolvedAt && <> · resolved {when(selected.resolvedAt)}</>}
            </div>
            {selected.remarks && (
              <div className="text-[10px] mb-2">Originator remarks: {selected.remarks}</div>
            )}

            <div className="text-[10.5px] font-bold mb-1">Stages</div>
            {[...selected.stages].sort((a, b) => a.ordering - b.ordering).map((s) => (
              <div key={s.id} className="border border-[#e0e0e0] bg-white p-1.5 mb-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-medium">
                    {s.ordering + 1}. {s.stage.name}
                  </span>
                  <span className={cn('text-[9px] px-1 rounded-[1px]', STATUS_STYLE[s.status])}>
                    {s.status}
                  </span>
                </div>
                <div className="text-[9.5px] text-gray-600">
                  {s.decisions.length} of {s.stage.requiredApprovals} approval(s)
                </div>
                {s.decisions.map((d) => (
                  <div key={d.id} className="text-[9.5px] mt-0.5">
                    <span className={d.decision === 'APPROVED' ? 'text-green-800' : 'text-red-800'}>
                      {d.decision === 'APPROVED' ? '✓' : '✗'} {d.approver.name}
                    </span>
                    {d.remarks && <span className="text-gray-600"> — {d.remarks}</span>}
                  </div>
                ))}
              </div>
            ))}

            {selected.status === 'PENDING' && (
              <div className="mt-2 border-t border-[#d4d0c8] pt-2">
                <div className="text-[10px] text-gray-600 mb-1">Remarks (optional)</div>
                <ClassicInput
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full mb-1.5"
                  placeholder="Why you approved or rejected"
                />
                {canDecide(selected) ? (
                  <div className="flex gap-1.5">
                    <YellowBtn
                      onClick={() => decideMut.mutate({ id: selected.id, decision: 'APPROVED' })}
                      disabled={isBusy}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Approve
                      </span>
                    </YellowBtn>
                    <GreyBtn
                      onClick={() => {
                        if (!window.confirm('Reject this request? The document will not post.')) return;
                        decideMut.mutate({ id: selected.id, decision: 'REJECTED' });
                      }}
                      disabled={isBusy}
                    >
                      <span className="inline-flex items-center gap-1">
                        <X className="w-3 h-3" /> Reject
                      </span>
                    </GreyBtn>
                  </div>
                ) : (
                  <div className="text-[9.5px] text-gray-600">
                    {selected.originator.id === user?.id
                      ? 'You raised this request, so you cannot decide it.'
                      : 'You are not an authorizer on the stage this request is waiting at.'}
                  </div>
                )}

                {selected.originator.id === user?.id && (
                  <GreyBtn
                    className="mt-1.5"
                    onClick={() => {
                      if (!window.confirm('Withdraw this request?')) return;
                      cancelMut.mutate(selected.id);
                    }}
                    disabled={isBusy}
                  >
                    Withdraw
                  </GreyBtn>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ClassicWindow>
  );
};
