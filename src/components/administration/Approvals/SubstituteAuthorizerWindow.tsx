import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useCrudResource } from '../../../hooks/useCrudResource';
import {
  substituteAuthorizersApi,
  approvalsApi,
  type SubstituteAuthorizer,
} from '../../../api/administration.api';
import { usersApi } from '../../../api/users.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
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

const emptyForm = {
  templateId: '',
  originalUserId: '',
  substituteUserId: '',
  validFrom: '',
  validTo: '',
  isActive: true,
};

const day = (v?: string | null) => (v ? String(v).slice(0, 10) : '');

/**
 * Substitute Authorizer for Approval Templates.
 *
 * Stands one user in for another over a date range — the leave cover for an
 * approval queue. Without it, a template whose only authorizer is away blocks
 * every document it routes until they return.
 */
export const SubstituteAuthorizerWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const companyId = activeCompanyId;

  const [form, setForm] = useState(emptyForm);

  const crud = useCrudResource<SubstituteAuthorizer>(
    'substitute-authorizers',
    substituteAuthorizersApi,
    { label: (r) => `${r.original?.name} → ${r.substitute?.name}` },
  );

  const usersQuery = useQuery({
    queryKey: ['users', companyId],
    queryFn: () => usersApi.getAll(companyId ?? undefined),
    enabled: !!companyId,
  });

  const templatesQuery = useQuery({
    queryKey: ['approval-templates', companyId],
    queryFn: () => approvalsApi.listTemplates(),
    enabled: !!companyId,
  });

  const users = usersQuery.data ?? [];
  const templates = templatesQuery.data ?? [];

  const openNew = () => {
    setForm({ ...emptyForm });
    crud.openNew();
  };

  const openEdit = () => {
    if (!crud.selected) return;
    const r = crud.selected;
    setForm({
      templateId: r.templateId ?? '',
      originalUserId: r.originalUserId,
      substituteUserId: r.substituteUserId,
      validFrom: day(r.validFrom),
      validTo: day(r.validTo),
      isActive: r.isActive,
    });
    crud.openEdit(r);
  };

  const handleSave = () => {
    if (!form.originalUserId) { crud.setError('Pick the authorizer being stood in for.'); return; }
    if (!form.substituteUserId) { crud.setError('Pick the substitute.'); return; }
    if (form.originalUserId === form.substituteUserId) {
      crud.setError('A user cannot be their own substitute.');
      return;
    }
    if (!form.validFrom || !form.validTo) {
      crud.setError('A substitution needs both a start and an end date — an open-ended one never lapses.');
      return;
    }
    if (form.validTo < form.validFrom) {
      crud.setError('The end date is before the start date.');
      return;
    }
    crud.setError('');
    crud.save({
      templateId: form.templateId || undefined,
      originalUserId: form.originalUserId,
      substituteUserId: form.substituteUserId,
      validFrom: form.validFrom,
      validTo: form.validTo,
      isActive: form.isActive,
    } as never);
  };

  return (
    <ClassicWindow
      title="Substitute Authorizer for Approval Templates"
      icon={<UserCheck className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={860}
      minHeight={480}
      toolbar={
        <>
          <CrudToolbar
            onNew={openNew}
            onEdit={openEdit}
            onDelete={() => crud.remove()}
            onRefresh={crud.refetch}
            canEdit={!!crud.selected}
            canDelete={!!crud.selected}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={
        <>
          <span>{crud.rows.length} substitution(s)</span>
          <span>Substitute Authorizer</span>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-auto bg-white custom-scrollbar">
        <table className="w-full border-collapse text-[10.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Authorizer</th>
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Substitute</th>
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Template</th>
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Valid From</th>
              <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Valid To</th>
              <th className="px-2 py-1 font-bold text-[#444]">Active</th>
            </tr>
          </thead>
          <tbody>
            {crud.rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => crud.select(r)}
                className={cn(
                  'border-b border-[#f0f0f0] cursor-default',
                  crud.selected?.id === r.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/50',
                  !r.isActive && 'text-gray-400 italic',
                )}
              >
                <td className="px-2 py-1 border-r border-[#f0f0f0]">{r.original?.name}</td>
                <td className="px-2 py-1 border-r border-[#f0f0f0]">{r.substitute?.name}</td>
                <td className="px-2 py-1 border-r border-[#f0f0f0]">
                  {r.template?.name ?? 'every template'}
                </td>
                <td className="px-2 py-1 border-r border-[#f0f0f0]">
                  {r.validFrom ? new Date(r.validFrom).toLocaleDateString() : '—'}
                </td>
                <td className="px-2 py-1 border-r border-[#f0f0f0]">
                  {r.validTo ? new Date(r.validTo).toLocaleDateString() : '—'}
                </td>
                <td className="px-2 py-1">{r.isActive ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ListPlaceholder
          noCompany={crud.noCompany}
          isLoading={crud.isLoading}
          isEmpty={!crud.isLoading && !crud.rows.length}
          emptyText="No substitutions. Click New to cover an authorizer who is away."
        />
      </div>

      {crud.mode !== 'view' && (
        <div className="shrink-0 border-t border-[#d4d0c8] bg-white p-3">
          <div className="text-[11px] font-bold mb-2">
            {crud.mode === 'new' ? 'New Substitution' : 'Edit Substitution'}
          </div>
          <div className="grid grid-cols-3 gap-x-6 gap-y-1 max-w-[900px]">
            <FieldRow label="Authorizer" labelWidth="90px" required>
              <ClassicSel
                value={form.originalUserId}
                onChange={(e) => setForm((f) => ({ ...f, originalUserId: e.target.value }))}
                className="w-full"
              >
                <option value="">— pick —</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </ClassicSel>
            </FieldRow>
            <FieldRow label="Substitute" labelWidth="90px" required>
              <ClassicSel
                value={form.substituteUserId}
                onChange={(e) => setForm((f) => ({ ...f, substituteUserId: e.target.value }))}
                className="w-full"
              >
                <option value="">— pick —</option>
                {users
                  .filter((u) => u.id !== form.originalUserId)
                  .map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </ClassicSel>
            </FieldRow>
            <FieldRow label="Template" labelWidth="90px">
              <ClassicSel
                value={form.templateId}
                onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
                className="w-full"
              >
                <option value="">Every template</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </ClassicSel>
            </FieldRow>

            <FieldRow label="Valid From" labelWidth="90px" required>
              <ClassicInput
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                className="w-full"
              />
            </FieldRow>
            <FieldRow label="Valid To" labelWidth="90px" required>
              <ClassicInput
                type="date"
                value={form.validTo}
                onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))}
                className="w-full"
              />
            </FieldRow>
            <label className="flex items-center gap-2 text-[11px] cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <YellowBtn onClick={handleSave} disabled={crud.isBusy}>
              {crud.mode === 'new' ? 'Add' : 'Update'}
            </YellowBtn>
            <GreyBtn onClick={crud.cancel}>Cancel</GreyBtn>
            <span className="text-[9.5px] text-gray-500 ml-1">
              The substitute can decide on the authorizer's behalf only between these dates.
            </span>
          </div>
        </div>
      )}
    </ClassicWindow>
  );
};
