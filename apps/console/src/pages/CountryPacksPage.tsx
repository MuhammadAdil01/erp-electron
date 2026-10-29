import { CountryPackDataSchema, countryPackProblems, type CountryPackData } from '@erp/contracts';
import { Banner, Button, DataGrid, Dialog, Input, PageHeader, type ColumnDef } from '@erp/ui';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sdk } from '../auth';
import { Loaded, ReasonField, Status, useChange, useGridLabels, useResource, when } from '../lib';
import { holds, useStaffAccess } from '../staff-access';
import { useStepUp } from '../step-up';

// Country packs (Part 02 §2.6, Part 03 §3.11): versioned country rules with an effective date.
// Drafts are edited as JSON; publishing needs a fresh MFA check and a second approver.

type Summary = Awaited<ReturnType<typeof sdk.console.countryPacks.list>>['data'][number];

export function CountryPacksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const packs = useResource(() => sdk.console.countryPacks.list(), []);
  const labels = useGridLabels();
  const columns = useMemo<ColumnDef<Summary, unknown>[]>(
    () => [
      { accessorKey: 'name', header: t('console.packs.country') },
      { accessorKey: 'version', header: t('console.common.version') },
      {
        accessorKey: 'status',
        header: t('console.common.status'),
        cell: (c) => <Status status={c.row.original.status} />,
      },
      { accessorKey: 'effective_from', header: t('console.packs.effective_from') },
      {
        id: 'by',
        header: t('console.templates.published_by'),
        accessorFn: (s) => s.published_by?.name ?? '—',
      },
      { id: 'updated', header: t('console.common.updated'), accessorFn: (s) => when(s.updated_at) },
    ],
    [t],
  );
  return (
    <>
      <PageHeader title={t('console.packs.title')} count={packs.data?.data.length} />
      <Loaded resource={packs}>
        {(data) => (
          <DataGrid
            data={data.data}
            columns={columns}
            getRowId={(p) => `${p.country}@${p.version}`}
            labels={labels}
            onRowClick={(p) =>
              void navigate({
                to: '/catalogue/country-packs/$country/$version',
                params: { country: p.country, version: p.version },
              })
            }
          />
        )}
      </Loaded>
    </>
  );
}

function parsePack(text: string): { data?: CountryPackData; problems: string[] } {
  try {
    const parsed = CountryPackDataSchema.safeParse(JSON.parse(text));
    if (!parsed.success)
      return { problems: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
    return { data: parsed.data, problems: countryPackProblems(parsed.data) };
  } catch {
    return { problems: ['invalid-json'] };
  }
}

export function CountryPackPage() {
  const { t } = useTranslation();
  const { country, version } = useParams({ strict: false });
  const navigate = useNavigate();
  const access = useStaffAccess();
  const change = useChange();
  const stepUp = useStepUp();
  const pack = useResource(
    () => sdk.console.countryPacks.get(country, version),
    [country, version],
  );
  const [text, setText] = useState<string | null>(null);
  const [effective, setEffective] = useState('');
  const [reason, setReason] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const live = text === null ? null : parsePack(text);

  return (
    <Loaded resource={pack}>
      {({ body, etag }) => {
        const d = body.data;
        const isDraft = body.status === 'draft';
        return (
          <>
            <Link
              to="/catalogue/country-packs"
              className="text-sm font-medium text-link no-underline hover:underline"
            >
              {t('console.common.back')}
            </Link>
            <div className="mt-2">
              <span className="me-2 text-2xl font-semibold">
                {d.name} {body.version}
              </span>
              <Status status={body.status} />
            </div>
            <p className="my-2">
              {t('console.packs.effective_from')}: {body.effective_from} ·{' '}
              {t('console.packs.currency')}: {d.currency} · {t('console.packs.timezone')}:{' '}
              {d.timezone} · {t('console.packs.fiscal_year')}: {d.fiscal_year_start_month}
            </p>
            <div className="my-4 flex flex-wrap gap-2">
              {holds(access, 'country_packs.edit') && (
                <Button onClick={() => setDrafting(true)}>{t('console.packs.new_draft')}</Button>
              )}
              {isDraft && holds(access, 'country_packs.edit') && text === null && (
                <Button
                  onClick={() => {
                    setText(JSON.stringify(d, null, 2));
                    setEffective(body.effective_from);
                  }}
                >
                  {t('console.packs.edit')}
                </Button>
              )}
            </div>
            {body.problems.length > 0 && (
              <Banner tone="error" title={t('console.templates.problems')}>
                <ul className="list-disc ps-5">
                  {body.problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Banner>
            )}

            {text !== null && (
              <section className="my-4 grid gap-2">
                <Input
                  label={t('console.packs.effective_from')}
                  type="date"
                  value={effective}
                  onChange={(e) => setEffective(e.target.value)}
                />
                <label htmlFor="pack-data" className="font-medium">
                  {t('console.packs.data')}
                </label>
                <textarea
                  id="pack-data"
                  dir="ltr"
                  spellCheck={false}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-96 rounded-md border border-line-strong bg-surface p-3 font-mono text-xs text-fg shadow-1"
                />
                {live && live.problems.length > 0 && (
                  <Banner tone="error" title={t('console.templates.problems')}>
                    <ul className="list-disc ps-5">
                      {live.problems.map((p) => (
                        <li key={p}>
                          {p === 'invalid-json' ? t('console.templates.invalid_json') : p}
                        </li>
                      ))}
                    </ul>
                  </Banner>
                )}
                <ReasonField value={reason} onChange={setReason} />
                <div className="flex gap-2">
                  <Button
                    disabled={!live?.data || live.problems.length > 0 || reason.trim().length < 3}
                    onClick={() =>
                      void change(
                        () =>
                          sdk.console.countryPacks.update(
                            country,
                            version,
                            { effective_from: effective, data: live!.data!, reason },
                            etag,
                          ),
                        () => {
                          setText(null);
                          setReason('');
                          pack.reload();
                        },
                      )
                    }
                  >
                    {t('console.common.save')}
                  </Button>
                  <Button variant="secondary" onClick={() => setText(null)}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </section>
            )}

            {isDraft && holds(access, 'country_packs.publish') && text === null && (
              <section className="my-4 grid max-w-xl gap-2">
                <ReasonField value={reason} onChange={setReason} />
                <Button
                  disabled={body.problems.length > 0 || reason.trim().length < 3}
                  onClick={() =>
                    void change(
                      () =>
                        stepUp(() => sdk.console.countryPacks.publish(country, version, reason)),
                      () => pack.reload(),
                    )
                  }
                >
                  {t('console.packs.publish')}
                </Button>
              </section>
            )}

            <h2 className="mt-6 text-lg font-semibold">{t('console.packs.holidays')}</h2>
            <ul data-testid="holidays">
              {d.holidays.map((h) => (
                <li key={`${h.date}-${h.name}`}>
                  {h.date} · {h.name}
                  {h.tentative && <em className="opacity-70"> ({t('console.packs.tentative')})</em>}
                </li>
              ))}
            </ul>
            <h2 className="mt-6 text-lg font-semibold">{t('console.packs.id_formats')}</h2>
            <ul>
              {Object.entries(d.id_formats).map(([k, f]) => (
                <li key={k}>
                  {f.label}: <code dir="ltr">{f.example}</code>
                </li>
              ))}
            </ul>

            <Dialog
              open={drafting}
              onOpenChange={setDrafting}
              title={t('console.packs.new_draft')}
              closeLabel={t('common.cancel')}
              footer={
                <Button
                  disabled={!/^\d+\.\d+(\.\d+)?$/.test(newVersion) || reason.trim().length < 3}
                  onClick={() =>
                    void change(
                      () =>
                        sdk.console.countryPacks.createDraft(country, {
                          version: newVersion,
                          from_version: version,
                          reason,
                        }),
                      () => {
                        setDrafting(false);
                        void navigate({
                          to: '/catalogue/country-packs/$country/$version',
                          params: { country, version: newVersion },
                        });
                      },
                    )
                  }
                >
                  {t('console.packs.new_draft')}
                </Button>
              }
            >
              <p>
                {t('console.templates.from_version')}: {version}
              </p>
              <Input
                label={t('console.templates.new_version')}
                placeholder="1.1"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
              />
              <ReasonField value={reason} onChange={setReason} />
            </Dialog>
          </>
        );
      }}
    </Loaded>
  );
}
