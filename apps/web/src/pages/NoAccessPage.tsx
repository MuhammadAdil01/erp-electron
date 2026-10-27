import { Banner } from '@erp/ui';
import { Link, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { reasonOf, useAccess } from '../access';

/** "You don't have access" with the reason (Part 05 §5.5.7). */
export function NoAccessPage() {
  const { t } = useTranslation();
  const { permission } = useSearch({ from: '/no-access' });
  const reason = reasonOf(useAccess(), permission);
  return (
    <>
      <h1 className="text-2xl font-semibold" data-testid="no-access-title">
        {t('access.no_access_title')}
      </h1>
      <Banner>{t(reason === 'plan' ? 'access.reason_plan' : 'access.reason_role')}</Banner>
      <Link to="/" className="underline">
        {t('access.back_home')}
      </Link>
    </>
  );
}
