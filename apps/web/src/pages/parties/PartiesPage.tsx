import type { PartyRole, PartySummary } from '@erp/contracts';
import {
  Badge,
  Banner,
  Button,
  DataGrid,
  EmptyState,
  FilterBar,
  FilterChip,
  PageHeader,
  Skeleton,
  StatusChip,
  useToast,
  type ColumnDef,
  type DataGridLabels,
} from '@erp/ui';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Download, Plus, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '../../access';
import { errorMessage, sdk } from '../../auth';
import { useTranslatedToast } from '../../toasts';

// Parties list (Part 06 §6.2.1, Part 12 §12.3 "List page"): search, role and archive filters,
// a grid with saved views, more rows by cursor, New and Export where the member may.

/** `value`, once it has stopped changing for `ms`. */
export function useDebounced<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return settled;
}

export function useGridLabels(): DataGridLabels {
  const { t } = useTranslation();
  return {
    columns: t('grid.columns'),
    views: t('grid.views'),
    saveView: t('grid.save_view'),
    viewName: t('grid.view_name'),
    noRows: t('grid.no_rows'),
    density: t('grid.density'),
  };
}

export function PartyStatus({ party }: { party: { status: string; archived: boolean } }) {
  const { t } = useTranslation();
  const status = party.archived ? 'archived' : party.status;
  return <StatusChip status={status} label={t(`parties.status.${status}`)} />;
}

export function RoleBadges({ roles }: { roles: readonly PartyRole[] }) {
  const { t } = useTranslation();
  return (
    <span className="flex flex-wrap gap-1">
      {roles.map((r) => (
        <Badge key={r} tone="neutral">
          {t(`parties.role.${r}`)}
        </Badge>
      ))}
    </span>
  );
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function PartiesPage() {
  const { t } = useTranslation();
  const can = useCan();
  const navigate = useNavigate();
  const toast = useTranslatedToast();
  const show = useToast();
  const labels = useGridLabels();
  const [search, setSearch] = useState('');
  const q = useDebounced(search, 300);
  const [role, setRole] = useState<PartyRole | undefined>();
  const [archived, setArchived] = useState(false);
  const filters = useMemo(() => ({ q, role, archived }), [q, role, archived]);
  const filtered = Boolean(q.trim() || role || archived);

  const parties = useInfiniteQuery({
    queryKey: ['parties', filters],
    queryFn: ({ pageParam }) => sdk.parties.list({ ...filters, limit: 50, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
  });
  const rows = useMemo(() => parties.data?.pages.flatMap((p) => p.data) ?? [], [parties.data]);

  const columns = useMemo<ColumnDef<PartySummary, unknown>[]>(
    () => [
      {
        id: 'name',
        header: t('parties.col.name'),
        accessorFn: (p) => p.name,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <span className="flex flex-col">
              <Link
                to="/parties/$id"
                params={{ id: p.id }}
                className="font-medium text-link no-underline hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {p.name}
              </Link>
              <span className="text-xs text-muted">
                {[p.code, p.other_name, t(`parties.kind.${p.kind}`)].filter(Boolean).join(' · ')}
              </span>
            </span>
          );
        },
      },
      {
        id: 'roles',
        header: t('parties.col.roles'),
        accessorFn: (p) => p.roles.join(' '),
        cell: ({ row }) => <RoleBadges roles={row.original.roles} />,
      },
      { id: 'phone', header: t('parties.col.phone'), accessorFn: (p) => p.phone ?? '' },
      { id: 'email', header: t('parties.col.email'), accessorFn: (p) => p.email ?? '' },
      { id: 'city', header: t('parties.col.city'), accessorFn: (p) => p.city ?? '' },
      { id: 'owner', header: t('parties.col.owner'), accessorFn: (p) => p.owner?.name ?? '' },
      {
        id: 'status',
        header: t('parties.col.status'),
        accessorFn: (p) => (p.archived ? 'archived' : p.status),
        cell: ({ row }) => <PartyStatus party={row.original} />,
      },
    ],
    [t],
  );

  const exportList = async () => {
    try {
      download('parties.csv', await sdk.parties.exportCsv(filters));
      toast('parties.exported', 'success');
    } catch (error) {
      show(errorMessage(error, t), 'error');
    }
  };

  return (
    <>
      <PageHeader
        title={t('parties.title')}
        count={parties.data && !parties.hasNextPage ? rows.length : undefined}
        description={t('parties.description')}
        actions={
          <>
            {can('core.parties.export') && (
              <Button variant="secondary" onClick={() => void exportList()}>
                <Download aria-hidden className="size-4" />
                {t('parties.export')}
              </Button>
            )}
            {can('core.parties.create') && (
              <Button onClick={() => void navigate({ to: '/parties/new' })}>
                <Plus aria-hidden className="size-4" />
                {t('parties.new')}
              </Button>
            )}
          </>
        }
      />
      <FilterBar search={search} onSearch={setSearch} searchLabel={t('parties.search')}>
        <FilterChip
          label={t('parties.filter_customers')}
          active={role === 'customer'}
          onClick={() => setRole(role === 'customer' ? undefined : 'customer')}
        />
        <FilterChip
          label={t('parties.filter_suppliers')}
          active={role === 'supplier'}
          onClick={() => setRole(role === 'supplier' ? undefined : 'supplier')}
        />
        <FilterChip
          label={t('parties.filter_archived')}
          active={archived}
          onClick={() => setArchived(!archived)}
        />
      </FilterBar>

      {parties.error ? (
        <Banner tone="error">{errorMessage(parties.error, t)}</Banner>
      ) : !parties.data ? (
        <Skeleton label={t('common.loading')} lines={6} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<UsersRound aria-hidden className="size-5" />}
          title={filtered ? t('parties.empty_filtered') : t('parties.empty_title')}
          description={filtered ? undefined : t('parties.empty_description')}
          action={
            !filtered &&
            can('core.parties.create') && (
              <Button onClick={() => void navigate({ to: '/parties/new' })}>
                {t('parties.new')}
              </Button>
            )
          }
        />
      ) : (
        <>
          <DataGrid
            data={rows}
            columns={columns}
            getRowId={(p) => p.id}
            onRowClick={(p) => void navigate({ to: '/parties/$id', params: { id: p.id } })}
            labels={labels}
            viewsKey="web.parties"
          />
          {parties.hasNextPage && (
            <div className="mt-3 flex justify-center">
              <Button
                variant="secondary"
                disabled={parties.isFetchingNextPage}
                onClick={() => void parties.fetchNextPage()}
              >
                {t('parties.load_more')}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
