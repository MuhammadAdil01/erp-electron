import { Card, KpiTile, PageHeader } from '@erp/ui';
import { Link } from '@tanstack/react-router';
import { ClipboardCheck, Globe2, LayoutTemplate, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sdk } from '../auth';
import { holds, useStaffAccess } from '../staff-access';

// The console dashboard (Part 03 §3.4). It shows what exists today: work waiting for this
// person and the published catalogue; tenant, revenue and health widgets arrive with the
// screens behind them (Stages 5–9).

export function HomePage() {
  const { t } = useTranslation();
  const access = useStaffAccess();
  const [me, setMe] = useState<{ name: string; roles: string[] }>();
  const [counts, setCounts] = useState<{ templates?: number; packs?: number; staff?: number }>({});
  useEffect(() => {
    sdk.staff
      .me()
      .then(setMe)
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    if (!access) return;
    const published = (rows: { status: string }[]) =>
      rows.filter((r) => r.status === 'published').length;
    if (holds(access, 'catalogue.view', 'catalogue.draft'))
      void sdk.console.templates
        .list()
        .then((r) => setCounts((c) => ({ ...c, templates: published(r.data) })));
    if (holds(access, 'country_packs.view'))
      void sdk.console.countryPacks
        .list()
        .then((r) => setCounts((c) => ({ ...c, packs: published(r.data) })));
    if (holds(access, 'staff.view'))
      void sdk.console.staff.list().then((r) => setCounts((c) => ({ ...c, staff: r.data.length })));
  }, [access]);
  if (!me)
    return (
      <p aria-busy="true" className="sr-only">
        {t('common.loading')}
      </p>
    );
  const waiting = access?.badges.approvals ?? 0;
  const roles = me.roles.map((r) => t(`console.role.${r}`)).join(', ');
  return (
    <>
      <PageHeader
        title={<span data-testid="console-welcome">{t('console.welcome', { name: me.name })}</span>}
        description={t('console.dashboard.subtitle', { name: me.name, roles })}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={t('console.dashboard.waiting_title')}>
          {holds(access, 'approvals.view') && waiting > 0 ? (
            <Link
              to="/approvals"
              className="flex items-center gap-3 rounded-md border border-line p-3 no-underline hover:bg-subtle"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-info-subtle text-info">
                <ClipboardCheck aria-hidden className="size-5" />
              </span>
              <span className="flex-1 text-sm text-fg">{t('console.dashboard.approvals')}</span>
              <span className="text-lg font-semibold text-fg tabular">{waiting}</span>
            </Link>
          ) : (
            <p className="m-0 text-sm text-muted">{t('console.dashboard.waiting_none')}</p>
          )}
        </Card>
        <div className="grid gap-6 sm:grid-cols-3 xl:col-span-2">
          {counts.templates !== undefined && (
            <KpiTile
              label={t('console.dashboard.templates')}
              value={counts.templates}
              icon={<LayoutTemplate aria-hidden className="size-4" />}
            />
          )}
          {counts.packs !== undefined && (
            <KpiTile
              label={t('console.dashboard.packs')}
              value={counts.packs}
              icon={<Globe2 aria-hidden className="size-4" />}
            />
          )}
          {counts.staff !== undefined && (
            <KpiTile
              label={t('console.dashboard.staff')}
              value={counts.staff}
              icon={<Users aria-hidden className="size-4" />}
            />
          )}
        </div>
      </div>
    </>
  );
}
