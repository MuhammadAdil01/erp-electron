import { STAFF_ROLES, type StaffMember, type StaffRoleKey } from '@erp/contracts';
import { Button, DataGrid, Dialog, Input, PageHeader, type ColumnDef } from '@erp/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sdk } from '../auth';
import { Loaded, ReasonField, Status, useChange, useGridLabels, useResource, when } from '../lib';
import { holds, useStaffAccess } from '../staff-access';
import { useStepUp } from '../step-up';

// Staff (Part 03 §3.2): the Platform Owner invites staff, changes their roles and deactivates
// them; the Auditor sees the list. Every change needs a reason and a fresh MFA check.

function RolesPicker({
  value,
  onChange,
}: {
  value: StaffRoleKey[];
  onChange: (roles: StaffRoleKey[]) => void;
}) {
  const { t } = useTranslation();
  return (
    <fieldset className="grid gap-1">
      <legend className="font-medium">{t('console.staff.roles')}</legend>
      {STAFF_ROLES.map((role) => (
        <label key={role} className="flex gap-2">
          <input
            type="checkbox"
            checked={value.includes(role)}
            onChange={(e) =>
              onChange(e.target.checked ? [...value, role] : value.filter((r) => r !== role))
            }
          />
          {t(`console.role.${role}`)}
        </label>
      ))}
    </fieldset>
  );
}

export function StaffPage() {
  const { t } = useTranslation();
  const access = useStaffAccess();
  const manage = holds(access, 'staff.manage');
  const staff = useResource(() => sdk.console.staff.list(), []);
  const change = useChange();
  const stepUp = useStepUp();
  const labels = useGridLabels();
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [leaving, setLeaving] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({
    email: '',
    name: '',
    roles: [] as StaffRoleKey[],
    reason: '',
  });

  const columns = useMemo<ColumnDef<StaffMember, unknown>[]>(
    () => [
      { accessorKey: 'name', header: t('console.staff.name') },
      { accessorKey: 'email', header: t('console.staff.email') },
      {
        id: 'roles',
        header: t('console.staff.roles'),
        accessorFn: (m) => m.roles.map((r) => t(`console.role.${r}`)).join(', '),
      },
      {
        accessorKey: 'status',
        header: t('console.common.status'),
        cell: (c) => <Status status={c.row.original.status} />,
      },
      {
        id: 'last',
        header: t('console.staff.last_sign_in'),
        accessorFn: (m) => (m.last_sign_in_at ? when(m.last_sign_in_at) : t('console.staff.never')),
      },
      ...(manage
        ? [
            {
              id: 'actions',
              header: t('console.common.actions'),
              enableSorting: false,
              cell: ({ row }: { row: { original: StaffMember } }) => {
                const m = row.original;
                if (m.id === access?.staff_id) return null;
                return (
                  <span className="flex flex-wrap gap-x-3 whitespace-nowrap">
                    <button
                      type="button"
                      className="cursor-pointer text-sm font-medium text-link hover:underline"
                      onClick={() => {
                        setForm({ email: m.email, name: m.name, roles: m.roles, reason: '' });
                        setEditing(m);
                      }}
                    >
                      {t('console.staff.change_roles')}
                    </button>
                    {m.status === 'invited' && (
                      <button
                        type="button"
                        className="cursor-pointer text-sm font-medium text-link hover:underline"
                        onClick={() =>
                          void change(() =>
                            sdk.console.staff.setupLink(m.id, 'new setup link requested'),
                          )
                        }
                      >
                        {t('console.staff.setup_link')}
                      </button>
                    )}
                    {m.status !== 'suspended' && (
                      <button
                        type="button"
                        className="cursor-pointer text-sm font-medium text-link hover:underline"
                        onClick={() => {
                          setForm((f) => ({ ...f, reason: '' }));
                          setLeaving(m);
                        }}
                      >
                        {t('console.staff.deactivate')}
                      </button>
                    )}
                  </span>
                );
              },
            } satisfies ColumnDef<StaffMember, unknown>,
          ]
        : []),
    ],
    [t, manage, access?.staff_id, change],
  );

  return (
    <>
      <PageHeader
        title={t('console.staff.title')}
        count={staff.data?.data.length}
        actions={
          manage && (
            <Button
              onClick={() => {
                setForm({ email: '', name: '', roles: [], reason: '' });
                setInviting(true);
              }}
            >
              {t('console.staff.invite')}
            </Button>
          )
        }
      />
      <Loaded resource={staff}>
        {(data) => (
          <DataGrid
            data={data.data}
            columns={columns}
            getRowId={(m) => m.id}
            labels={labels}
            viewsKey="console.staff"
          />
        )}
      </Loaded>

      <Dialog
        open={inviting}
        onOpenChange={setInviting}
        title={t('console.staff.invite')}
        closeLabel={t('common.cancel')}
        footer={
          <Button
            disabled={
              !form.email || !form.name || !form.roles.length || form.reason.trim().length < 3
            }
            onClick={() =>
              void change(
                () => stepUp(() => sdk.console.staff.invite(form)),
                () => {
                  setInviting(false);
                  staff.reload();
                },
                t('console.staff.invited', { email: form.email }),
              )
            }
          >
            {t('console.staff.invite')}
          </Button>
        }
      >
        <div className="grid gap-3">
          <Input
            label={t('console.staff.name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label={t('console.staff.email')}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <RolesPicker value={form.roles} onChange={(roles) => setForm({ ...form, roles })} />
          <ReasonField value={form.reason} onChange={(reason) => setForm({ ...form, reason })} />
        </div>
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={`${t('console.staff.change_roles')}: ${editing?.name ?? ''}`}
        closeLabel={t('common.cancel')}
        footer={
          <Button
            disabled={!form.roles.length || form.reason.trim().length < 3}
            onClick={() =>
              void change(
                () => stepUp(() => sdk.console.staff.roles(editing!.id, form.roles, form.reason)),
                () => {
                  setEditing(null);
                  staff.reload();
                },
              )
            }
          >
            {t('console.common.save')}
          </Button>
        }
      >
        <div className="grid gap-3">
          <RolesPicker value={form.roles} onChange={(roles) => setForm({ ...form, roles })} />
          <ReasonField value={form.reason} onChange={(reason) => setForm({ ...form, reason })} />
        </div>
      </Dialog>

      <Dialog
        open={leaving !== null}
        onOpenChange={(open) => !open && setLeaving(null)}
        title={`${t('console.staff.deactivate')}: ${leaving?.name ?? ''}`}
        description={t('console.staff.deactivate_intro')}
        closeLabel={t('common.cancel')}
        footer={
          <Button
            disabled={form.reason.trim().length < 3}
            variant="danger"
            onClick={() =>
              void change(
                () => stepUp(() => sdk.console.staff.deactivate(leaving!.id, form.reason)),
                () => {
                  setLeaving(null);
                  staff.reload();
                },
              )
            }
          >
            {t('console.staff.deactivate')}
          </Button>
        }
      >
        <ReasonField value={form.reason} onChange={(reason) => setForm({ ...form, reason })} />
      </Dialog>
    </>
  );
}
