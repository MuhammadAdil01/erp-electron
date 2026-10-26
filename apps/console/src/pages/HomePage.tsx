import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sdk } from '../auth';

/** The console's first page: who is signed in, and with which staff roles. */
export function HomePage() {
  const { t } = useTranslation();
  const [me, setMe] = useState<{ name: string; roles: string[] }>();
  useEffect(() => {
    sdk.staff
      .me()
      .then(setMe)
      .catch(() => undefined);
  }, []);
  if (!me) return <p aria-busy="true">{t('common.loading')}</p>;
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h1 data-testid="console-welcome">{t('console.welcome', { name: me.name })}</h1>
      <p>{t('console.roles', { roles: me.roles.join(', ') })}</p>
    </section>
  );
}
