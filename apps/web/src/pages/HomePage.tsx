import { Button } from '@erp/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { fetchHealth } from '../api';
import { useAuthState } from '../auth';

export function HomePage() {
  const { t } = useTranslation();
  const state = useAuthState();
  const health = useQuery({ queryKey: ['health'], queryFn: fetchHealth, retry: false });
  const membership = state.status === 'signed_in' ? state.membership : null;
  const several = state.status === 'signed_in' && state.memberships.length > 1;

  return (
    <>
      <h1 className="text-2xl font-semibold" data-testid="home-title">
        {membership ? t('home.welcome', { company: membership.tenant_name }) : t('home.no_company')}
      </h1>
      <nav className="flex gap-4">
        <Link to="/account/security" className="underline">
          {t('home.security')}
        </Link>
        {several && (
          <Link to="/choose" className="underline">
            {t('choose.switch')}
          </Link>
        )}
      </nav>
      <p data-testid="api-status" className="text-lg font-medium">
        {health.isPending ? (
          <span>{t('health.checking')}</span>
        ) : health.isSuccess ? (
          <span style={{ color: 'var(--erp-color-success)' }}>{t('health.ok')}</span>
        ) : (
          <span style={{ color: 'var(--erp-color-danger)' }}>{t('health.down')}</span>
        )}
      </p>
      <div>
        <Button onClick={() => void health.refetch()} disabled={health.isFetching}>
          {t('health.check_again')}
        </Button>
      </div>
    </>
  );
}
