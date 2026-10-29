import {
  TemplateDefinitionSchema,
  templateProblems,
  type TemplateDefinition,
} from '@erp/contracts';
import { Banner, Button, DataGrid, Dialog, Input, PageHeader, Tabs, type ColumnDef } from '@erp/ui';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sdk } from '../auth';
import { Loaded, ReasonField, Status, useChange, useGridLabels, useResource, when } from '../lib';
import { holds, useStaffAccess } from '../staff-access';

// Industry templates (Part 02 §2.10, Part 03 §3.11): every version with its status; a new
// version starts as a copy; drafts are edited as JSON with the registry checks running as you
// type; publishing waits for a second approver; any two versions can be compared.

type Summary = Awaited<ReturnType<typeof sdk.console.templates.list>>['data'][number];

export function TemplatesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const templates = useResource(() => sdk.console.templates.list(), []);
  const labels = useGridLabels();
  const columns = useMemo<ColumnDef<Summary, unknown>[]>(
    () => [
      { id: 'name', header: t('console.templates.template'), accessorFn: (s) => s.name },
      { accessorKey: 'version', header: t('console.common.version') },
      {
        accessorKey: 'status',
        header: t('console.common.status'),
        cell: (c) => <Status status={c.row.original.status} />,
      },
      { accessorKey: 'industry', header: t('console.templates.industry') },
      { accessorKey: 'roles', header: t('console.templates.roles') },
      { accessorKey: 'entitlements', header: t('console.templates.entitlements') },
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
      <PageHeader title={t('console.templates.title')} count={templates.data?.data.length} />
      <Loaded resource={templates}>
        {(data) => (
          <DataGrid
            data={data.data}
            columns={columns}
            getRowId={(s) => `${s.key}@${s.version}`}
            labels={labels}
            onRowClick={(s) =>
              void navigate({
                to: '/catalogue/templates/$key/$version',
                params: { key: s.key, version: s.version },
              })
            }
          />
        )}
      </Loaded>
    </>
  );
}

function parseDefinition(text: string): { definition?: TemplateDefinition; problems: string[] } {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { problems: ['invalid-json'] };
  }
  const parsed = TemplateDefinitionSchema.safeParse(json);
  if (!parsed.success)
    return { problems: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
  return { definition: parsed.data, problems: templateProblems(parsed.data) };
}

export function TemplatePage() {
  const { t } = useTranslation();
  const { key, version } = useParams({ strict: false });
  const navigate = useNavigate();
  const access = useStaffAccess();
  const change = useChange();
  const detail = useResource(() => sdk.console.templates.get(key, version), [key, version]);
  const versions = useResource(() => sdk.console.templates.list(), []);
  const [tab, setTab] = useState('overview');
  const [text, setText] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [compare, setCompare] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const diff = useResource(
    () => (compare ? sdk.console.templates.diff(key, compare, version) : Promise.resolve(null)),
    [key, version, compare],
  );
  const live = text === null ? null : parseDefinition(text);

  return (
    <Loaded resource={detail}>
      {({ body, etag }) => {
        const d = body.definition;
        const isDraft = body.status === 'draft';
        const others = (versions.data?.data ?? []).filter(
          (v) => v.key === key && v.version !== version,
        );
        return (
          <>
            <Link
              to="/catalogue/templates"
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
            <div className="my-4 flex flex-wrap gap-2">
              {holds(access, 'catalogue.draft') && (
                <Button onClick={() => setDrafting(true)}>
                  {t('console.templates.new_draft')}
                </Button>
              )}
              {isDraft && holds(access, 'catalogue.draft') && text === null && (
                <Button onClick={() => setText(JSON.stringify(d, null, 2))}>
                  {t('console.templates.edit')}
                </Button>
              )}
            </div>
            {body.problems.length > 0 ? (
              <Banner tone="error" title={t('console.templates.problems')}>
                <ul className="list-disc ps-5">
                  {body.problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Banner>
            ) : (
              isDraft && <Banner tone="success">{t('console.templates.no_problems')}</Banner>
            )}

            {text !== null && (
              <section className="my-4 grid gap-2">
                <label htmlFor="definition" className="font-medium">
                  {t('console.templates.definition')}
                </label>
                <textarea
                  id="definition"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  spellCheck={false}
                  className="min-h-96 rounded-md border border-line-strong bg-surface p-3 font-mono text-xs text-fg shadow-1"
                  dir="ltr"
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
                    disabled={!live?.definition || reason.trim().length < 3}
                    onClick={() =>
                      void change(
                        () =>
                          sdk.console.templates.update(
                            key,
                            version,
                            { definition: live!.definition!, reason },
                            etag,
                          ),
                        () => {
                          setText(null);
                          setReason('');
                          detail.reload();
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

            {isDraft && holds(access, 'catalogue.publish') && text === null && (
              <section className="my-4 grid max-w-xl gap-2">
                <ReasonField value={reason} onChange={setReason} />
                <Button
                  disabled={body.problems.length > 0 || reason.trim().length < 3}
                  onClick={() =>
                    void change(
                      () => sdk.console.templates.publish(key, version, reason),
                      () => detail.reload(),
                    )
                  }
                >
                  {t('console.templates.publish')}
                </Button>
              </section>
            )}

            <Tabs
              value={tab}
              onValueChange={setTab}
              label={t('console.templates.template')}
              tabs={[
                {
                  value: 'overview',
                  label: t('console.templates.overview'),
                  content: (
                    <div className="grid gap-4">
                      <p>{d.description}</p>
                      <div>
                        <h3 className="font-semibold">
                          {t('console.templates.entitlements')} ({d.entitlements.length})
                        </h3>
                        <p className="text-sm">{d.entitlements.join(', ')}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold">{t('console.templates.limits')}</h3>
                        <p className="text-sm">
                          {Object.entries(d.limits)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ')}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold">{t('console.templates.terminology')}</h3>
                        <ul className="text-sm">
                          {Object.entries(d.terminology).map(([k, v]) => (
                            <li key={k}>
                              {k} → {v}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ),
                },
                {
                  value: 'roles',
                  label: `${t('console.templates.roles')} (${d.roles.length})`,
                  content: (
                    <div className="grid gap-3">
                      {d.roles.map((r) => (
                        <details
                          key={r.key}
                          className="w-full h-9 rounded-md border border-line-strong bg-surface px-3 text-sm text-fg shadow-1"
                        >
                          <summary className="cursor-pointer font-medium">
                            {r.name} ·{' '}
                            {r.owner
                              ? t('console.templates.owner_role')
                              : `${r.grants.length} ${t('console.templates.grants')}`}
                          </summary>
                          <p className="text-sm opacity-80">{r.description}</p>
                          <ul className="text-sm">
                            {r.grants.map((g) => (
                              <li key={g.permission}>
                                {g.permission} ({g.scope})
                                {g.thresholds ? ` ${JSON.stringify(g.thresholds)}` : ''}
                              </li>
                            ))}
                          </ul>
                        </details>
                      ))}
                    </div>
                  ),
                },
                {
                  value: 'compare',
                  label: t('console.templates.compare'),
                  content: (
                    <div className="grid gap-3">
                      <label className="flex items-center gap-2">
                        {t('console.templates.compare_with')}
                        <select
                          value={compare}
                          onChange={(e) => setCompare(e.target.value)}
                          className="h-9 rounded-md border border-line-strong bg-surface px-3 text-sm text-fg shadow-1"
                        >
                          <option value="">—</option>
                          {others.map((o) => (
                            <option key={o.version} value={o.version}>
                              {o.version} ({t(`console.status.${o.status}`)})
                            </option>
                          ))}
                        </select>
                      </label>
                      {diff.data && (
                        <div className="grid gap-2 text-sm">
                          <p>
                            {t('console.templates.entitlements')}: +
                            {diff.data.entitlements.added.join(', ') || '—'} / −
                            {diff.data.entitlements.removed.join(', ') || '—'}
                          </p>
                          <p>
                            {t('console.templates.limits')}:{' '}
                            {diff.data.limits
                              .map((l) => `${l.key} ${l.before ?? '—'} → ${l.after ?? '—'}`)
                              .join(' · ') || t('console.templates.no_changes')}
                          </p>
                          <p>
                            {t('console.templates.roles')}: +
                            {diff.data.roles.added.join(', ') || '—'} / −
                            {diff.data.roles.removed.join(', ') || '—'}
                          </p>
                          {diff.data.roles.changed.map((c) => (
                            <p key={c.key}>
                              {c.key}: +{c.added.join(', ') || '—'} / −{c.removed.join(', ') || '—'}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />

            <Dialog
              open={drafting}
              onOpenChange={setDrafting}
              title={t('console.templates.new_draft')}
              closeLabel={t('common.cancel')}
              footer={
                <Button
                  disabled={!/^\d+\.\d+\.\d+$/.test(newVersion) || reason.trim().length < 3}
                  onClick={() =>
                    void change(
                      () =>
                        sdk.console.templates.createDraft(key, {
                          version: newVersion,
                          from_version: version,
                          reason,
                        }),
                      () => {
                        setDrafting(false);
                        void navigate({
                          to: '/catalogue/templates/$key/$version',
                          params: { key, version: newVersion },
                        });
                      },
                    )
                  }
                >
                  {t('console.templates.new_draft')}
                </Button>
              }
            >
              <p>
                {t('console.templates.from_version')}: {version}
              </p>
              <Input
                label={t('console.templates.new_version')}
                placeholder="1.1.0"
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
