import { buttonClass, EmptyState, Skeleton } from '@erp/ui';
import { Link, useSearch } from '@tanstack/react-router';
import { ShieldOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { reasonOf, useAccess } from '../access';
import { useAuthState } from '../auth';

/** "You don't have access" with the reason (Part 05 §5.5.7, Part 12 §12.5). */
export function NoAccessPage() {
  const { t } = useTranslation();
  const { permission } = useSearch({ from: '/no-access' });
  const current = useAccess();
  const state = useAuthState();
  // Until the company's access has loaded, the reason is not known yet.
  const loading = !current && state.status === 'signed_in' && state.membership !== null;
  const reason = reasonOf(current, permission);
  if (loading) return <Skeleton label={t('common.loading')} />;
  return (
    <div className="mx-auto max-w-xl pt-10">
      <EmptyState
        icon={<ShieldOff aria-hidden className="size-5" />}
        title={<span data-testid="no-access-title">{t('access.no_access_title')}</span>}
        description={t(reason === 'plan' ? 'access.reason_plan' : 'access.reason_role')}
        action={
          <Link to="/" className={buttonClass('secondary')}>
            {t('access.back_home')}
          </Link>
        }
      />
    </div>
  );
}
