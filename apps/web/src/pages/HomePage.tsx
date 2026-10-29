import { Button, Card, PageHeader } from '@erp/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Activity, Building2, LayoutGrid, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchHealth } from '../api';
import { sdk, useAuthState } from '../auth';

// The home page until role home pages arrive (Part 05 §5.6, Stage 7): the company, the
// person's account, and whether the system answers.

export function HomePage() {
  const { t } = useTranslation();
  const state = useAuthState();
  const me = useQuery({ queryKey: ['me'], queryFn: () => sdk.me.get() });
  const health = useQuery({ queryKey: ['health'], queryFn: fetchHealth, retry: false });
  const membership = state.status === 'signed_in' ? state.membership : null;
  const companies = state.status === 'signed_in' ? state.memberships.length : 0;
  const first = me.data?.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title={
          <span data-testid="home-title">
            {membership
              ? t('home.welcome', { company: membership.tenant_name })
              : t('home.no_company')}
          </span>
        }
        description={
          membership
            ? [first, t('home.subtitle', { company: membership.tenant_name })]
                .filter(Boolean)
                .join(' · ')
            : undefined
        }
      />
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-link">
              <ShieldCheck aria-hidden className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="m-0 text-base font-semibold">{t('home.account_title')}</h2>
              <p className="m-0 text-sm text-muted">{t('home.account_text')}</p>
              <Link
                to="/account/security"
                className="mt-2 text-sm font-medium text-link no-underline hover:underline"
              >
                {t('home.open_security')}
              </Link>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success-subtle text-success">
              <Activity aria-hidden className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="m-0 text-base font-semibold">{t('home.status_title')}</h2>
              <p data-testid="api-status" className="m-0 text-sm font-medium">
                {health.isPending ? (
                  <span className="text-muted">{t('health.checking')}</span>
                ) : health.isSuccess ? (
                  <span className="text-success">{t('health.ok')}</span>
                ) : (
                  <span className="text-danger">{t('health.down')}</span>
                )}
              </p>
              <div className="mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void health.refetch()}
                  loading={health.isFetching}
                >
                  {t('health.check_again')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-subtle text-muted">
              {companies > 1 ? (
                <Building2 aria-hidden className="size-5" />
              ) : (
                <LayoutGrid aria-hidden className="size-5" />
              )}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="m-0 text-base font-semibold">
                {companies > 1 ? t('home.companies_title') : t('home.modules_title')}
              </h2>
              <p className="m-0 text-sm text-muted">
                {companies > 1
                  ? t('home.companies_text', { count: companies })
                  : t('home.modules_text')}
              </p>
              {companies > 1 && (
                <Link
                  to="/choose"
                  className="mt-2 text-sm font-medium text-link no-underline hover:underline"
                >
                  {t('choose.switch')}
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
