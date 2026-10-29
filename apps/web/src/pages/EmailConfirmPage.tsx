import { Banner, Skeleton } from '@erp/ui';
import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sdk } from '../auth';
import { AuthPage } from '../shell';

// The link sent to a new e-mail address (§5.3.11): opening it makes the change.

export function EmailConfirmPage() {
  const { t } = useTranslation();
  const { token } = useParams({ from: '/email/confirm/$token' });
  const [state, setState] = useState<'working' | 'done' | 'invalid'>('working');
  // The link works once: never send it twice (React runs effects twice in development).
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    sdk.auth
      .confirmEmail(token)
      .then(() => setState('done'))
      .catch(() => setState('invalid'));
  }, [token]);
  return (
    <AuthPage
      title={t('email_confirm.title')}
      footer={
        <Link to="/signin" className="font-medium text-link no-underline hover:underline">
          {t('forgot.back')}
        </Link>
      }
    >
      {state === 'working' && <Skeleton lines={2} label={t('common.loading')} />}
      {state === 'done' && <Banner tone="success">{t('email_confirm.done')}</Banner>}
      {state === 'invalid' && <Banner tone="error">{t('email_confirm.invalid')}</Banner>}
    </AuthPage>
  );
}
