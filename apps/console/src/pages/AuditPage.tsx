import type { AuditEntry } from '@erp/contracts';
import { Button, DataGrid, Drawer, FilterBar, PageHeader, type ColumnDef } from '@erp/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sdk } from '../auth';
import { Status, useChange, useGridLabels, when } from '../lib';
import { holds, useStaffAccess } from '../staff-access';

// Platform audit log (Part 03 §3.17): newest first, as far as this role may see; filters by
// action; each entry with its reason and before and after values; CSV export for the Owner and
// the Auditor. Entries cannot be changed or removed.

export function AuditPage() {
  const { t, i18n } = useTranslation();
  const access = useStaffAccess();
  const change = useChange();
  const labels = useGridLabels();
  const [action, setAction] = useState('');
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [open, setOpen] = useState<AuditEntry | null>(null);

  const load = useCallback(
    async (from?: string) => {
      const page = await sdk.console.audit.list({ action: action.trim() || undefined, cursor: from, limit: '100' });
      setEntries((prev) => (from ? [...prev, ...page.data] : page.data));
      setCursor(page.next_cursor);
    },
    [action],
  );
  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  const columns = useMemo<ColumnDef<AuditEntry, unknown>[]>(
    () => [
      { id: 'at', header: t('console.audit.at'), accessorFn: (e) => when(e.at, i18n.language) },
      { id: 'actor', header: t('console.audit.actor'), accessorFn: (e) => e.actor?.name ?? t('console.audit.system') },
      { accessorKey: 'action', header: t('console.audit.action') },
      { id: 'target', header: t('console.audit.target'), accessorFn: (e) => [e.target_type, e.target_id].filter(Boolean).join(' · ') },
      { accessorKey: 'reason', header: t('console.audit.reason') },
      { accessorKey: 'result', header: t('console.audit.result'), cell: (c) => <Status status={c.row.original.result} /> },
    ],
    [t, i18n.language],
  );

  const exportCsv = () =>
    void change(async () => {
      const csv = await sdk.console.audit.exportCsv({ action: action.trim() || undefined });
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'platform-audit.csv';
      a.click();
      URL.revokeObjectURL(url);
    });

  return (
    <>
      <PageHeader
        title={t('console.audit.title')}
        actions={holds(access, 'audit.export') && <Button onClick={exportCsv}>{t('console.audit.export')}</Button>}
      />
      <FilterBar search={action} onSearch={setAction} searchLabel={t('console.audit.filter_action')} />
      <DataGrid data={entries} columns={columns} getRowId={(e) => e.id} labels={labels} onRowClick={setOpen} viewsKey="console.audit" />
      {cursor && (
        <div className="mt-3">
          <Button onClick={() => void load(cursor)}>{t('console.audit.load_more')}</Button>
        </div>
      )}
      <Drawer open={open !== null} onOpenChange={(o) => !o && setOpen(null)} title={t('console.audit.entry')} closeLabel={t('common.close')}>
        {open && (
          <div className="grid gap-2 text-sm">
            <p>{when(open.at, i18n.language)} · {open.actor?.name ?? t('console.audit.system')}</p>
            <p>
              <strong>{open.action}</strong> · {open.target_type} {open.target_id}
            </p>
            <p>{t('console.audit.reason')}: {open.reason ?? '—'}</p>
            {(['before', 'after'] as const).map((k) => (
              <div key={k}>
                <h3 className="font-semibold">{t(`console.audit.${k}`)}</h3>
                <pre dir="ltr" className="overflow-auto rounded-md p-2 text-xs" style={{ background: 'var(--erp-color-surface)' }}>
                  {JSON.stringify(open[k], null, 2) ?? '—'}
                </pre>
              </div>
            ))}
            <p className="opacity-70">#{open.seq} · {open.correlation_id ?? ''}</p>
          </div>
        )}
      </Drawer>
    </>
  );
}
