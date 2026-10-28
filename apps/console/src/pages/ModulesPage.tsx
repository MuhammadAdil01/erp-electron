import { STATUSES } from '@erp/contracts';
import { Button, DataGrid, Drawer, FilterBar, Input, PageHeader, type ColumnDef } from '@erp/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sdk } from '../auth';
import { Loaded, ReasonField, Status, useChange, useGridLabels, useResource } from '../lib';
import { holds, useStaffAccess } from '../staff-access';

// Modules & Features (Part 03 §3.11): every module and feature comes from the registry; staff
// edit only how they are shown (name, description, icon, order, countries, status).

type Modules = Awaited<ReturnType<typeof sdk.console.catalogue.modules>>['data'];
type Feature = Modules[number]['features'][number] & { module: string };

export function ModulesPage() {
  const { t } = useTranslation();
  const edit = holds(useStaffAccess(), 'catalogue.edit');
  const modules = useResource(() => sdk.console.catalogue.modules(), []);
  const change = useChange();
  const labels = useGridLabels();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Feature | null>(null);
  const [form, setForm] = useState({ display_name: '', description: '', icon: '', order: '', countries: '', status: '', reason: '' });

  const features = useMemo(() => {
    const all = (modules.data?.data ?? []).flatMap((m) => m.features.map((f) => ({ ...f, module: m.display_name ?? m.name })));
    const q = search.trim().toLowerCase();
    return q ? all.filter((f) => `${f.key} ${f.name} ${f.display_name ?? ''} ${f.module}`.toLowerCase().includes(q)) : all;
  }, [modules.data, search]);

  const columns = useMemo<ColumnDef<Feature, unknown>[]>(
    () => [
      { accessorKey: 'module', header: t('console.nav.modules') },
      { id: 'name', header: t('console.modules.feature'), accessorFn: (f) => f.display_name ?? f.name },
      { accessorKey: 'key', header: t('console.modules.key') },
      { accessorKey: 'release', header: t('console.modules.release') },
      { id: 'status', header: t('console.common.status'), accessorFn: (f) => f.status_override ?? f.status, cell: (c) => <Status status={String(c.getValue())} /> },
      { accessorKey: 'permissions', header: t('console.modules.permissions') },
      { id: 'countries', header: t('console.modules.countries'), accessorFn: (f) => f.countries.join(', ') },
    ],
    [t],
  );

  const open = (f: Feature) => {
    setForm({
      display_name: f.display_name ?? '',
      description: f.description ?? '',
      icon: f.icon ?? '',
      order: f.display_order === null ? '' : String(f.display_order),
      countries: f.countries.join(', '),
      status: f.status_override ?? '',
      reason: '',
    });
    setEditing(f);
  };

  const save = () =>
    void change(
      () =>
        sdk.console.catalogue.patchFeature(editing!.key, {
          display_name: form.display_name.trim() || null,
          description: form.description.trim() || null,
          icon: form.icon.trim() || null,
          display_order: form.order.trim() ? Number(form.order) : null,
          countries: form.countries.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean),
          status_override: (form.status || null) as (typeof STATUSES)[number] | null,
          reason: form.reason,
        }),
      () => {
        setEditing(null);
        modules.reload();
      },
    );

  return (
    <>
      <PageHeader title={t('console.modules.title')} count={features.length} />
      <FilterBar search={search} onSearch={setSearch} searchLabel={t('console.common.filter')} />
      <Loaded resource={modules}>
        {() => <DataGrid data={features} columns={columns} getRowId={(f) => f.key} labels={labels} onRowClick={open} viewsKey="console.modules" />}
      </Loaded>
      <Drawer open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={editing ? `${editing.name} · ${editing.key}` : ''} closeLabel={t('common.close')}>
        {editing && (
          <div className="grid gap-3">
            <p className="text-sm opacity-80">
              {t('console.modules.requires')}: {editing.requires.join(', ') || '—'} · {editing.always_on ? t('console.modules.always_on') : editing.release}
            </p>
            <Input label={t('console.modules.display_name')} value={form.display_name} placeholder={editing.name} disabled={!edit} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
            <Input label={t('console.modules.description')} value={form.description} disabled={!edit} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input label={t('console.modules.icon')} value={form.icon} disabled={!edit} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            <Input label={t('console.modules.order')} inputMode="numeric" value={form.order} disabled={!edit} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            <Input label={t('console.modules.countries')} value={form.countries} disabled={!edit} onChange={(e) => setForm({ ...form, countries: e.target.value })} />
            <label className="grid gap-1">
              <span className="font-medium">{t('console.modules.status_shown')}</span>
              <select value={form.status} disabled={!edit} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-md border p-2">
                <option value="">{t('console.modules.registry_default')} ({editing.status})</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            {edit && (
              <>
                <ReasonField value={form.reason} onChange={(reason) => setForm({ ...form, reason })} />
                <Button disabled={form.reason.trim().length < 3} onClick={save}>
                  {t('console.common.save')}
                </Button>
              </>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
