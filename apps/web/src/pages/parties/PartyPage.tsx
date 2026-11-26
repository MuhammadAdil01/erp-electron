import type { PartyDetail, PartyDuplicates } from '@erp/contracts';
import { ApiError } from '@erp/sdk';
import {
  Banner,
  Breadcrumbs,
  Button,
  Dialog,
  IconButton,
  Input,
  Menu,
  PageHeader,
  Skeleton,
  Tabs,
  useToast,
} from '@erp/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useBlocker, useNavigate, useParams } from '@tanstack/react-router';
import { Ellipsis } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccess, useCan } from '../../access';
import { errorMessage, sdk } from '../../auth';
import { useTranslatedToast } from '../../toasts';
import {
  emptyParty,
  errorsOf,
  formOf,
  inputOf,
  isDirty,
  phonesOf,
  tabOf,
  validate,
  type Errors,
  type PartyForm,
  type TabKey,
} from './form';
import { PartyStatus, RoleBadges } from './PartiesPage';
import {
  ActivitySection,
  AddressesSection,
  ContactsSection,
  CustomerSection,
  DetailsSection,
  OverviewSection,
  SupplierSection,
} from './sections';

// The party record (Part 06 §6.2.1, Part 12 §12.3 "Master record"): an Overview, the data tabs
// and the Activity tab, saved together with If-Match. New parties are checked for duplicates
// before they are created (§6.2.1).

/** Country for new addresses until company settings exist: the tenant's country pack. */
const DEFAULT_COUNTRY = 'PK';

export function NewPartyPage() {
  const access = useAccess();
  const [tab, setTab] = useState<TabKey>('details');
  return (
    <PartyEditor
      saved={null}
      etag=""
      owner={access?.membership_id ?? null}
      tab={tab}
      setTab={setTab}
    />
  );
}

export function PartyRecordPage() {
  const { t } = useTranslation();
  const { id } = useParams({ from: '/parties/$id' });
  const [tab, setTab] = useState<TabKey>('overview');
  const party = useQuery({ queryKey: ['party', id], queryFn: () => sdk.parties.get(id) });
  if (party.error) {
    const missing = party.error instanceof ApiError && party.error.code === 'not_found';
    return (
      <Banner tone="error" action={<Link to="/parties">{t('parties.back')}</Link>}>
        {missing ? t('parties.not_found') : errorMessage(party.error, t)}
      </Banner>
    );
  }
  if (!party.data) return <Skeleton label={t('common.loading')} lines={8} />;
  return (
    <PartyEditor
      // A new version from the API starts the form again from what was saved.
      key={`${id}:${party.data.etag}`}
      saved={party.data.body}
      etag={party.data.etag}
      owner={null}
      tab={tab}
      setTab={setTab}
    />
  );
}

function PartyEditor({
  saved,
  etag,
  owner,
  tab,
  setTab,
}: {
  saved: PartyDetail | null;
  etag: string;
  owner: string | null;
  tab: TabKey;
  setTab: (tab: TabKey) => void;
}) {
  const { t } = useTranslation();
  const can = useCan();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useTranslatedToast();
  const show = useToast();
  const initial = useMemo(() => (saved ? formOf(saved) : emptyParty(owner)), [saved, owner]);
  const [form, setForm] = useState<PartyForm>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [stale, setStale] = useState(false);
  const [duplicates, setDuplicates] = useState<PartyDuplicates['data'] | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [reason, setReason] = useState('');
  const leaving = useRef(false);

  const isNew = saved === null;
  const record = saved
    ? { created_by: saved.created_by?.id ?? null, membership_id: saved.owner?.id ?? null }
    : undefined;
  const mayChange = isNew ? can('core.parties.create') : can('core.parties.update', record);
  const archived = Boolean(saved?.archived_at);
  const editable = mayChange && !archived && !stale;
  const dirty = isDirty(form, initial);
  const set = (patch: Partial<PartyForm>) => setForm((f) => ({ ...f, ...patch }));

  const members = useQuery({
    queryKey: ['party-members'],
    queryFn: () => sdk.parties.accountManagers(),
    enabled: editable,
    staleTime: 60_000,
  });

  // Never lose work (§12.1 #8): leaving with unsaved changes asks first.
  const blocker = useBlocker({
    shouldBlockFn: () => !leaving.current,
    disabled: !dirty || !editable,
    enableBeforeUnload: () => dirty && editable && !leaving.current,
    withResolver: true,
  });

  const afterSave = (result: { body: PartyDetail; etag: string }) => {
    queryClient.setQueryData(['party', result.body.id], result);
    void queryClient.invalidateQueries({ queryKey: ['parties'] });
  };

  const showProblem = (error: unknown) => {
    if (error instanceof ApiError && error.code === 'precondition_failed') {
      setStale(true);
      return;
    }
    if (error instanceof ApiError && error.problem?.errors?.length) {
      const found = errorsOf(error.problem.errors);
      setErrors(found);
      const first = Object.keys(found)[0];
      if (first) setTab(tabOf(first));
    }
    show(errorMessage(error, t), 'error');
  };

  const save = async (skipDuplicateCheck = false) => {
    const found = validate(form);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      setTab(tabOf(first));
      toast('parties.fix_errors', 'error');
      return;
    }
    setBusy(true);
    try {
      if (isNew && !skipDuplicateCheck) {
        const same = await sdk.parties.duplicates({
          name: form.name,
          email: form.email,
          phones: phonesOf(form),
          national_id: form.national_id || null,
        });
        if (same.data.length) {
          setDuplicates(same.data);
          return;
        }
      }
      const input = inputOf(form);
      const result = isNew
        ? await sdk.parties.create(input)
        : await sdk.parties.update(saved.id, input, etag);
      afterSave(result);
      toast(isNew ? 'parties.created' : 'parties.saved', 'success');
      if (isNew) {
        leaving.current = true;
        void navigate({ to: '/parties/$id', params: { id: result.body.id } });
      }
    } catch (error) {
      showProblem(error);
    } finally {
      setBusy(false);
    }
  };

  // Ctrl+S saves (Part 12 §12.2 keyboard shortcuts).
  const saveRef = useRef(save);
  useLayoutEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    if (!editable) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editable]);

  const archive = async (on: boolean) => {
    if (!saved) return;
    setBusy(true);
    try {
      const result = on
        ? await sdk.parties.archive(saved.id, etag, reason.trim() || undefined)
        : await sdk.parties.restore(saved.id, etag);
      setArchiving(false);
      afterSave(result);
      toast(on ? 'parties.archived' : 'parties.restored', 'success');
    } catch (error) {
      setArchiving(false);
      showProblem(error);
    } finally {
      setBusy(false);
    }
  };

  const errorDot = (key: TabKey) =>
    Object.keys(errors).some((field) => tabOf(field) === key) ? (
      <span aria-hidden className="ms-1.5 inline-block size-2 rounded-full bg-danger-solid" />
    ) : null;
  const label = (key: TabKey) => (
    <>
      {t(`parties.tab.${key}`)}
      {errorDot(key)}
    </>
  );
  const sectionProps = { form, set, errors, disabled: !editable };
  const tabs: { value: TabKey; label: ReactNode; content: ReactNode }[] = [
    ...(saved
      ? [
          {
            value: 'overview' as const,
            label: label('overview'),
            content: <OverviewSection party={saved} />,
          },
        ]
      : []),
    {
      value: 'details',
      label: label('details'),
      content: <DetailsSection {...sectionProps} members={members.data?.data} saved={saved} />,
    },
    ...(form.kind === 'organization'
      ? [
          {
            value: 'contacts' as const,
            label: label('contacts'),
            content: <ContactsSection {...sectionProps} />,
          },
        ]
      : []),
    {
      value: 'addresses',
      label: label('addresses'),
      content: <AddressesSection {...sectionProps} country={DEFAULT_COUNTRY} />,
    },
    {
      value: 'customer',
      label: label('customer'),
      content: <CustomerSection {...sectionProps} members={members.data?.data} saved={saved} />,
    },
    { value: 'supplier', label: label('supplier'), content: <SupplierSection {...sectionProps} /> },
    ...(saved
      ? [
          {
            value: 'activity' as const,
            label: label('activity'),
            content: <ActivitySection id={saved.id} version={saved.version} />,
          },
        ]
      : []),
  ];
  const current = tabs.some((x) => x.value === tab) ? tab : tabs[0]!.value;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            label={t('shell.breadcrumbs')}
            items={[
              {
                label: (
                  <Link
                    to="/parties"
                    className="text-muted no-underline hover:text-fg hover:underline"
                  >
                    {t('parties.title')}
                  </Link>
                ),
              },
              { label: saved?.name ?? t('parties.new') },
            ]}
          />
        }
        title={saved?.name ?? t('parties.new')}
        status={
          saved && (
            <span className="flex flex-wrap items-center gap-2">
              <PartyStatus party={{ status: saved.status, archived }} />
              <RoleBadges roles={saved.roles} />
            </span>
          )
        }
        actions={
          <>
            {editable && dirty && !isNew && (
              <Button
                variant="ghost"
                onClick={() => {
                  setForm(initial);
                  setErrors({});
                }}
              >
                {t('parties.discard')}
              </Button>
            )}
            {editable && (
              <Button disabled={busy || (!isNew && !dirty)} onClick={() => void save()}>
                {isNew ? t('parties.create') : t('parties.save')}
              </Button>
            )}
            {saved && mayChange && (
              <Menu
                trigger={
                  <IconButton label={t('parties.more')}>
                    <Ellipsis aria-hidden className="size-4" />
                  </IconButton>
                }
                items={[
                  archived
                    ? {
                        key: 'restore',
                        label: t('parties.restore'),
                        onSelect: () => void archive(false),
                      }
                    : {
                        key: 'archive',
                        label: t('parties.archive'),
                        danger: true,
                        onSelect: () => {
                          setReason('');
                          setArchiving(true);
                        },
                      },
                ]}
              />
            )}
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        {stale && (
          <Banner
            tone="warning"
            action={
              <Button
                variant="secondary"
                onClick={() =>
                  void queryClient.invalidateQueries({ queryKey: ['party', saved?.id] })
                }
              >
                {t('parties.reload')}
              </Button>
            }
          >
            {t('parties.stale')}
          </Banner>
        )}
        {archived && (
          <Banner
            tone="info"
            action={
              mayChange && (
                <Button variant="secondary" disabled={busy} onClick={() => void archive(false)}>
                  {t('parties.restore')}
                </Button>
              )
            }
          >
            {t('parties.archived_banner')}
          </Banner>
        )}
        {!mayChange && !isNew && <Banner tone="info">{t('parties.read_only')}</Banner>}
      </div>

      <Tabs
        value={current}
        onValueChange={(v) => setTab(v as TabKey)}
        tabs={tabs}
        label={t('parties.tabs')}
      />

      <Dialog
        open={duplicates !== null}
        onOpenChange={(open) => !open && setDuplicates(null)}
        title={t('parties.duplicates_title')}
        description={t('parties.duplicates_intro')}
        closeLabel={t('common.cancel')}
        size="lg"
        footer={
          <Button
            onClick={() => {
              setDuplicates(null);
              void save(true);
            }}
          >
            {t('parties.create_anyway')}
          </Button>
        }
      >
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {duplicates?.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-3 rounded-md border border-line p-3"
            >
              <span className="flex flex-col">
                <span className="font-medium text-fg">{d.name}</span>
                <span className="text-sm text-muted">
                  {d.reasons.map((r) => t(`parties.duplicate_reason.${r}`)).join(', ')}
                  {d.archived ? ` · ${t('parties.status.archived')}` : ''}
                </span>
              </span>
              <Link
                to="/parties/$id"
                params={{ id: d.id }}
                className="text-sm font-medium text-link"
              >
                {t('parties.open')}
              </Link>
            </li>
          ))}
        </ul>
      </Dialog>

      <Dialog
        open={archiving}
        onOpenChange={setArchiving}
        title={t('parties.archive_title', { name: saved?.name ?? '' })}
        description={t('parties.archive_intro')}
        closeLabel={t('common.cancel')}
        footer={
          <Button variant="danger" disabled={busy} onClick={() => void archive(true)}>
            {t('parties.archive')}
          </Button>
        }
      >
        <Input
          label={t('parties.archive_reason')}
          value={reason}
          maxLength={500}
          onChange={(e) => setReason(e.target.value)}
        />
      </Dialog>

      <Dialog
        open={blocker.status === 'blocked'}
        onOpenChange={(open) => !open && blocker.reset?.()}
        title={t('parties.leave_title')}
        description={t('parties.leave_intro')}
        closeLabel={t('parties.stay')}
        footer={
          <Button variant="danger" onClick={() => blocker.proceed?.()}>
            {t('parties.leave')}
          </Button>
        }
      />
    </>
  );
}
