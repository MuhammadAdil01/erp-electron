import React, { useState } from 'react';
import { BellRing, Inbox, MailOpen } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useCrudResource } from '../../../hooks/useCrudResource';
import {
  alertsApi,
  type AlertDefinition,
  type AlertFrequency,
  type AlertPriority,
  type CreateAlertPayload,
} from '../../../api/administration.api';
import { usersApi } from '../../../api/users.api';
import {
  ClassicWindow,
  CrudToolbar,
  ToolBtn,
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

const PRIORITIES: AlertPriority[] = ['LOW', 'NORMAL', 'HIGH'];
const FREQUENCIES: { value: AlertFrequency; label: string }[] = [
  { value: 'ON_EVENT', label: 'When the event happens' },
  { value: 'MINUTES', label: 'Every N minutes' },
  { value: 'HOURLY', label: 'Hourly' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

const emptyForm = {
  name: '',
  description: '',
  priority: 'NORMAL' as AlertPriority,
  frequency: 'ON_EVENT' as AlertFrequency,
  frequencyValue: '',
  eventKey: '',
  savedQuery: '',
  isActive: true,
  recipientIds: [] as string[],
};

const PRIORITY_STYLE: Record<AlertPriority, string> = {
  LOW: 'bg-gray-200 text-gray-700',
  NORMAL: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-red-100 text-red-800',
};

export const AlertsManagementWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [tab, setTab] = useState<'definitions' | 'inbox'>('definitions');
  const [form, setForm] = useState(emptyForm);
  const [unreadOnly, setUnreadOnly] = useState(true);
  const [selectedInstances, setSelectedInstances] = useState<Set<string>>(new Set());

  const crud = useCrudResource<AlertDefinition, CreateAlertPayload>('alerts', alertsApi);

  const usersQuery = useQuery({
    queryKey: ['users', companyId],
    queryFn: () => usersApi.getAll(companyId ?? undefined),
    enabled: !!companyId,
  });

  const inboxQuery = useQuery({
    queryKey: ['alert-inbox', companyId, unreadOnly],
    queryFn: () => alertsApi.inbox(unreadOnly),
    enabled: !!companyId && tab === 'inbox',
  });

  const markReadMut = useMutation({
    mutationFn: (ids: string[]) => alertsApi.markRead(ids),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['alert-inbox'] });
      setSelectedInstances(new Set());
    },
  });

  const users = usersQuery.data ?? [];

  const openNew = () => { setForm({ ...emptyForm }); crud.openNew(); };

  const openEdit = () => {
    if (!crud.selected) return;
    const a = crud.selected;
    setForm({
      name: a.name,
      description: a.description ?? '',
      priority: a.priority,
      frequency: a.frequency,
      frequencyValue: a.frequencyValue != null ? String(a.frequencyValue) : '',
      eventKey: a.eventKey ?? '',
      savedQuery: a.savedQuery ?? '',
      isActive: a.isActive,
      recipientIds: a.subscriptions.map((s) => s.user.id),
    });
    crud.openEdit(a);
  };

  const handleSave = () => {
    if (!form.name.trim()) { crud.setError('An alert name is required.'); return; }
    if (!form.recipientIds.length) {
      crud.setError('Pick at least one recipient — an alert nobody receives never fires anywhere.');
      return;
    }
    if (form.frequency === 'MINUTES') {
      const n = Number(form.frequencyValue);
      if (!Number.isInteger(n) || n < 1) {
        crud.setError('Enter how many minutes between runs.');
        return;
      }
    }
    if (form.frequency === 'ON_EVENT' && !form.eventKey.trim()) {
      crud.setError('An event-driven alert needs an event key to listen for.');
      return;
    }
    crud.setError('');
    crud.save({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      frequency: form.frequency,
      frequencyValue: form.frequency === 'MINUTES' ? Number(form.frequencyValue) : undefined,
      eventKey: form.eventKey.trim() || undefined,
      savedQuery: form.savedQuery.trim() || undefined,
      isActive: form.isActive,
      recipientIds: form.recipientIds,
    });
  };

  const toggleRecipient = (id: string) =>
    setForm((f) => ({
      ...f,
      recipientIds: f.recipientIds.includes(id)
        ? f.recipientIds.filter((x) => x !== id)
        : [...f.recipientIds, id],
    }));

  const instances = inboxQuery.data ?? [];

  return (
    <ClassicWindow
      title="Alerts Management"
      icon={<BellRing className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={900}
      minHeight={560}
      toolbar={
        tab === 'definitions' ? (
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
        ) : (
          <>
            <ToolBtn
              onClick={() => markReadMut.mutate([...selectedInstances])}
              disabled={!selectedInstances.size || markReadMut.isPending}
            >
              <MailOpen className="w-3 h-3" /> Mark Read ({selectedInstances.size})
            </ToolBtn>
            <label className="flex items-center gap-1.5 text-[10.5px] ml-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
              />
              Unread only
            </label>
          </>
        )
      }
      footer={
        <>
          <span>
            {tab === 'definitions'
              ? `${crud.rows.length} alert definition(s)`
              : `${instances.length} message(s)`}
          </span>
          <span>Alerts Management</span>
        </>
      }
    >
      <div className="shrink-0 flex px-2 pt-1.5 bg-[#ececec] border-b border-[#d4d0c8]">
        {([
          { key: 'definitions' as const, label: 'Alert Definitions' },
          { key: 'inbox' as const, label: 'My Inbox' },
        ]).map(({ key, label }) => {
          const active = tab === key;
          return (
            <div
              key={key}
              onClick={() => setTab(key)}
              style={{ marginBottom: active ? '-1px' : 0 }}
              className={cn(
                'relative px-5 py-1 text-[11px] font-medium cursor-default rounded-t-[3px] border-l border-t border-r',
                active
                  ? 'bg-white border-[#d4d0c8] text-black z-10'
                  : 'bg-gradient-to-b from-[#f0f0f0] to-[#e0e0e0] border-gray-300 text-gray-600',
              )}
            >
              {active && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ffd700] rounded-t-[3px]" />}
              {label}
            </div>
          );
        })}
      </div>

      {tab === 'definitions' ? (
        <>
          <div className="flex-1 min-h-0 overflow-auto bg-white custom-scrollbar">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Alert</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Priority</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Frequency</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Recipients</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Sent</th>
                  <th className="px-2 py-1 font-bold text-[#444]">Last Run</th>
                </tr>
              </thead>
              <tbody>
                {crud.rows.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => crud.select(a)}
                    className={cn(
                      'border-b border-[#f0f0f0] cursor-default',
                      crud.selected?.id === a.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/50',
                      !a.isActive && 'text-gray-400 italic',
                    )}
                  >
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">
                      {a.name}
                      {a.description && (
                        <div className="text-[9px] text-gray-500">{a.description}</div>
                      )}
                    </td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">
                      <span className={cn('text-[9px] px-1 rounded-[1px]', PRIORITY_STYLE[a.priority])}>
                        {a.priority}
                      </span>
                    </td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">
                      {a.frequency}
                      {a.frequencyValue ? ` (${a.frequencyValue})` : ''}
                    </td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">
                      {a.subscriptions.length}
                    </td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">
                      {a._count?.instances ?? 0}
                    </td>
                    <td className="px-2 py-1">
                      {a.lastRunAt ? new Date(a.lastRunAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ListPlaceholder
              noCompany={crud.noCompany}
              isLoading={crud.isLoading}
              isEmpty={!crud.isLoading && !crud.rows.length}
              emptyText="No alerts defined. Click New to have the system notify someone when something happens."
            />
          </div>

          {crud.mode !== 'view' && (
            <div className="shrink-0 border-t border-[#d4d0c8] bg-white p-3 max-h-[320px] overflow-auto custom-scrollbar">
              <div className="text-[11px] font-bold mb-2">
                {crud.mode === 'new' ? 'New Alert' : 'Edit Alert'}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 max-w-[860px]">
                <FieldRow label="Name" labelWidth="110px" required>
                  <ClassicInput
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-[#fffbd0]"
                    autoFocus
                  />
                </FieldRow>
                <FieldRow label="Description" labelWidth="110px">
                  <ClassicInput
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full"
                  />
                </FieldRow>

                <FieldRow label="Priority" labelWidth="110px">
                  <ClassicSel
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as AlertPriority }))}
                    className="w-full"
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </ClassicSel>
                </FieldRow>
                <FieldRow label="Frequency" labelWidth="110px">
                  <ClassicSel
                    value={form.frequency}
                    onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as AlertFrequency }))}
                    className="w-full"
                  >
                    {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </ClassicSel>
                </FieldRow>

                {form.frequency === 'MINUTES' && (
                  <FieldRow label="Every (minutes)" labelWidth="110px" required>
                    <ClassicInput
                      type="number"
                      min={1}
                      value={form.frequencyValue}
                      onChange={(e) => setForm((f) => ({ ...f, frequencyValue: e.target.value }))}
                      className="w-24 text-right"
                    />
                  </FieldRow>
                )}
                {form.frequency === 'ON_EVENT' && (
                  <FieldRow label="Event Key" labelWidth="110px" required>
                    <ClassicInput
                      value={form.eventKey}
                      onChange={(e) => setForm((f) => ({ ...f, eventKey: e.target.value }))}
                      className="w-full font-mono"
                      placeholder="ar_invoice.overdue"
                    />
                  </FieldRow>
                )}

                <FieldRow label="Saved Query" labelWidth="110px">
                  <ClassicInput
                    value={form.savedQuery}
                    onChange={(e) => setForm((f) => ({ ...f, savedQuery: e.target.value }))}
                    className="w-full font-mono"
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

              <div className="mt-2">
                <div className="text-[11px] font-bold mb-1">
                  Recipients ({form.recipientIds.length})
                </div>
                <div className="border border-[#d4d0c8] max-h-[140px] overflow-auto custom-scrollbar max-w-[520px]">
                  {users.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 text-[10.5px] px-2 py-0.5 border-b border-[#f0f0f0] cursor-pointer hover:bg-blue-50/50"
                    >
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5"
                        checked={form.recipientIds.includes(u.id)}
                        onChange={() => toggleRecipient(u.id)}
                      />
                      <span className="flex-1">{u.name}</span>
                      <span className="text-gray-500">{u.email}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <YellowBtn onClick={handleSave} disabled={crud.isBusy}>
                  {crud.mode === 'new' ? 'Add' : 'Update'}
                </YellowBtn>
                <GreyBtn onClick={crud.cancel}>Cancel</GreyBtn>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto bg-white custom-scrollbar">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                <th className="px-2 py-1 border-r border-[#d4d0c8] w-8">
                  <input
                    type="checkbox"
                    className="w-3 h-3"
                    checked={!!instances.length && selectedInstances.size === instances.length}
                    onChange={(e) =>
                      setSelectedInstances(
                        e.target.checked ? new Set(instances.map((i) => i.id)) : new Set(),
                      )
                    }
                  />
                </th>
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Alert</th>
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Subject</th>
                <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Priority</th>
                <th className="px-2 py-1 font-bold text-[#444]">Received</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((i) => (
                <tr
                  key={i.id}
                  className={cn(
                    'border-b border-[#f0f0f0]',
                    !i.readAt && 'font-bold bg-[#fffbe6]',
                  )}
                >
                  <td className="px-2 py-1 border-r border-[#f0f0f0]">
                    <input
                      type="checkbox"
                      className="w-3 h-3"
                      checked={selectedInstances.has(i.id)}
                      onChange={() =>
                        setSelectedInstances((prev) => {
                          const next = new Set(prev);
                          if (next.has(i.id)) next.delete(i.id); else next.add(i.id);
                          return next;
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-1 border-r border-[#f0f0f0]">{i.alert.name}</td>
                  <td className="px-2 py-1 border-r border-[#f0f0f0]">{i.subject}</td>
                  <td className="px-2 py-1 border-r border-[#f0f0f0]">
                    <span className={cn('text-[9px] px-1 rounded-[1px]', PRIORITY_STYLE[i.alert.priority])}>
                      {i.alert.priority}
                    </span>
                  </td>
                  <td className="px-2 py-1">{new Date(i.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {inboxQuery.isLoading && <div className="p-3 text-[10.5px] text-gray-400">Loading…</div>}
          {!inboxQuery.isLoading && !instances.length && (
            <div className="p-3 text-[10.5px] text-gray-400 flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5" />
              {unreadOnly ? 'Nothing unread.' : 'Your alert inbox is empty.'}
            </div>
          )}
        </div>
      )}
    </ClassicWindow>
  );
};
