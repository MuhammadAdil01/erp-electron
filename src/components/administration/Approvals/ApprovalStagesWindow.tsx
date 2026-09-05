import React, { useEffect, useState } from 'react';
import { GitBranch } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  approvalsApi,
  type ApprovalStage,
  type CreateApprovalStagePayload,
} from '../../../api/administration.api';
import { usersApi } from '../../../api/users.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
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

const emptyForm = {
  name: '',
  description: '',
  requiredApprovals: 1,
  remarks: '',
  isActive: true,
  approverIds: [] as string[],
};

export const ApprovalStagesWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const stagesQuery = useQuery({
    queryKey: ['approval-stages', companyId],
    queryFn: () => approvalsApi.listStages(),
    enabled: !!companyId,
  });

  const usersQuery = useQuery({
    queryKey: ['users', companyId],
    // `getAll` takes the company as a query param, which the users controller
    // needs when a platform operator calls it.
    queryFn: () => usersApi.getAll(companyId ?? undefined),
    enabled: !!companyId,
  });

  const stages = stagesQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const selected = stages.find((s) => s.id === selectedId) ?? null;

  // A stage deleted elsewhere must not leave the detail pane showing a record
  // that no longer exists.
  useEffect(() => {
    if (selectedId && !stages.some((s) => s.id === selectedId)) setSelectedId(null);
  }, [stages, selectedId]);

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected that change.');
    setStatus('');
  };
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['approval-stages'] });

  const saveMut = useMutation({
    mutationFn: () => {
      const payload: CreateApprovalStagePayload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        requiredApprovals: Number(form.requiredApprovals) || 1,
        remarks: form.remarks.trim() || undefined,
        isActive: form.isActive,
        approverIds: form.approverIds,
      };
      return mode === 'new'
        ? approvalsApi.createStage(payload)
        : approvalsApi.updateStage(selectedId as string, payload);
    },
    onSuccess: (row) => {
      invalidate();
      setSelectedId(row.id);
      setMode('view');
      setError('');
      setStatus(mode === 'new' ? `Stage ${row.name} created.` : `Stage ${row.name} saved.`);
    },
    onError: onErr,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => approvalsApi.removeStage(id),
    onSuccess: () => {
      invalidate();
      setSelectedId(null);
      setMode('view');
      setError('');
      setStatus('Stage deleted.');
    },
    onError: onErr,
  });

  const isBusy = saveMut.isPending || deleteMut.isPending;

  const openNew = () => {
    setForm({ ...emptyForm });
    setMode('new');
    setError(''); setStatus('');
  };

  const openEdit = () => {
    if (!selected) return;
    setForm({
      name: selected.name,
      description: selected.description ?? '',
      requiredApprovals: selected.requiredApprovals,
      remarks: selected.remarks ?? '',
      isActive: selected.isActive,
      approverIds: selected.approvers.map((a) => a.userId),
    });
    setMode('edit');
    setError(''); setStatus('');
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError('A stage name is required.'); return; }
    if (!form.approverIds.length) {
      setError('A stage needs at least one authorizer — a stage with none can never be approved.');
      return;
    }
    const required = Number(form.requiredApprovals);
    if (!Number.isInteger(required) || required < 1) {
      setError('Number of approvals required must be at least 1.');
      return;
    }
    if (required > form.approverIds.length) {
      setError(
        `This stage asks for ${required} approval(s) but names only ${form.approverIds.length} ` +
        'authorizer(s), so it could never complete.',
      );
      return;
    }
    setError('');
    saveMut.mutate();
  };

  const toggleApprover = (userId: string) =>
    setForm((f) => ({
      ...f,
      approverIds: f.approverIds.includes(userId)
        ? f.approverIds.filter((id) => id !== userId)
        : [...f.approverIds, userId],
    }));

  return (
    <ClassicWindow
      title="Approval Stages — Setup"
      icon={<GitBranch className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={840}
      minHeight={520}
      toolbar={
        <>
          <CrudToolbar
            onNew={openNew}
            onEdit={openEdit}
            onDelete={() => {
              if (!selected) return;
              if ((selected._count?.templateStages ?? 0) > 0) {
                setError(
                  `${selected.name} is used by ${selected._count?.templateStages} template(s). ` +
                  'Remove it from those templates first.',
                );
                return;
              }
              if (!window.confirm(`Delete approval stage ${selected.name}?`)) return;
              deleteMut.mutate(selected.id);
            }}
            onRefresh={() => stagesQuery.refetch()}
            canEdit={!!selected}
            canDelete={!!selected}
            isFetching={stagesQuery.isFetching}
            isBusy={isBusy}
          />
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>{stages.length} stage(s)</span>
          <span>Approval Stages</span>
        </>
      }
    >
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="w-[320px] shrink-0 border-r border-[#d4d0c8] overflow-auto bg-white custom-scrollbar">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Stage Name</th>
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Approvers</th>
                <th className="px-2 py-1 font-bold text-[#444] text-right">Required</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((s: ApprovalStage) => (
                <tr
                  key={s.id}
                  onClick={() => { setSelectedId(s.id); setMode('view'); setError(''); setStatus(''); }}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    selectedId === s.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/50',
                    !s.isActive && 'text-gray-400 italic',
                  )}
                >
                  <td className="px-2 py-1 border-r border-[#f0f0f0]">{s.name}</td>
                  <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">{s.approvers.length}</td>
                  <td className="px-2 py-1 text-right">{s.requiredApprovals}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder
            noCompany={!companyId}
            isLoading={stagesQuery.isLoading}
            isEmpty={!stagesQuery.isLoading && !stages.length}
            emptyText="No approval stages yet. Click New — a template needs at least one stage."
          />
        </div>

        <div className="flex-1 min-w-0 overflow-auto bg-white p-3 custom-scrollbar">
          {mode === 'view' ? (
            !selected ? (
              <div className="text-[10.5px] text-gray-400">
                Pick a stage to see who authorizes at it, or click New to add one.
              </div>
            ) : (
              <>
                <div className="text-[11px] font-bold mb-1">{selected.name}</div>
                <div className="text-[10px] text-gray-600 mb-2">
                  {selected.description || 'No description.'}
                </div>
                <div className="text-[10.5px] mb-2">
                  Requires <b>{selected.requiredApprovals}</b> of {selected.approvers.length}{' '}
                  authorizer(s) · used by {selected._count?.templateStages ?? 0} template(s)
                  {!selected.isActive && <span className="text-red-700"> · inactive</span>}
                </div>
                <table className="w-full border-collapse text-[10.5px] max-w-[520px]">
                  <thead>
                    <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                      <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">#</th>
                      <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Authorizer</th>
                      <th className="px-2 py-1 font-bold text-[#444]">E-Mail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.approvers.map((a, i) => (
                      <tr key={a.id} className="border-b border-[#f0f0f0]">
                        <td className="px-2 py-1 border-r border-[#f0f0f0]">{i + 1}</td>
                        <td className="px-2 py-1 border-r border-[#f0f0f0]">{a.user.name}</td>
                        <td className="px-2 py-1">{a.user.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selected.remarks && (
                  <div className="text-[10px] text-gray-600 mt-2">Remarks: {selected.remarks}</div>
                )}
              </>
            )
          ) : (
            <div className="max-w-[620px] space-y-1">
              <div className="text-[11px] font-bold mb-1">
                {mode === 'new' ? 'New Approval Stage' : `Edit — ${selected?.name}`}
              </div>

              <FieldRow label="Stage Name" labelWidth="150px" required>
                <ClassicInput
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#fffbd0]"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label="Stage Description" labelWidth="150px">
                <ClassicInput
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <FieldRow label="No. of Approvals Required" labelWidth="150px" required>
                <ClassicInput
                  type="number"
                  min={1}
                  value={String(form.requiredApprovals)}
                  onChange={(e) => setForm((f) => ({ ...f, requiredApprovals: Number(e.target.value) }))}
                  className="w-24 text-right"
                />
              </FieldRow>
              <FieldRow label="Remarks" labelWidth="150px">
                <ClassicInput
                  value={form.remarks}
                  onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                  className="w-full"
                />
              </FieldRow>
              <label className="flex items-center gap-2 text-[11px] cursor-pointer py-1">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Active
              </label>

              <div className="pt-2">
                <div className="text-[11px] font-bold mb-1">
                  Authorizers ({form.approverIds.length} selected)
                </div>
                <div className="border border-[#d4d0c8] max-h-[220px] overflow-auto custom-scrollbar">
                  {users.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 text-[10.5px] px-2 py-1 border-b border-[#f0f0f0] cursor-pointer hover:bg-blue-50/50"
                    >
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5"
                        checked={form.approverIds.includes(u.id)}
                        onChange={() => toggleApprover(u.id)}
                      />
                      <span className="flex-1">{u.name}</span>
                      <span className="text-gray-500">{u.email}</span>
                    </label>
                  ))}
                  {!users.length && (
                    <div className="p-2 text-[10.5px] text-gray-400">
                      No users in this company yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <YellowBtn onClick={handleSave} disabled={isBusy}>
                  {saveMut.isPending ? 'Saving…' : mode === 'new' ? 'Add' : 'Update'}
                </YellowBtn>
                <GreyBtn onClick={() => { setMode('view'); setError(''); }}>Cancel</GreyBtn>
                <span className="text-[9.5px] text-gray-500 ml-1">
                  A stage cannot require more approvals than it names authorizers.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
