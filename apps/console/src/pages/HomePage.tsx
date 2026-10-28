import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sdk } from '../auth';
import { useStaffAccess } from '../staff-access';

/** The console's first page: who is signed in, with which staff roles, and work waiting. */
export function HomePage() {
  const { t } = useTranslation();
  const access = useStaffAccess();
  const [me, setMe] = useState<{ name: string; roles: string[] }>();
  useEffect(() => {
    sdk.staff
      .me()
      .then(setMe)
      .catch(() => undefined);
  }, []);
  if (!me) return <p aria-busy="true">{t('common.loading')}</p>;
  const waiting = access?.badges.approvals ?? 0;
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h1 data-testid="console-welcome" className="text-2xl font-semibold">
        {t('console.welcome', { name: me.name })}
      </h1>
      <p>{t('console.roles', { roles: me.roles.map((r) => t(`console.role.${r}`)).join(', ') })}</p>
      {waiting > 0 && (
        <Link to="/approvals" className="underline">
          {t('console.home_approvals', { count: waiting })}
        </Link>
      )}
    </section>
  );
}
