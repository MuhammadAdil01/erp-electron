import { ApiError } from '@erp/sdk';
import { Banner, Button, passwordChecklist, PasswordInput } from '@erp/ui';
import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { errorMessage, sdk } from '../auth';

// The one-time setup link of a new staff member (D5): greet them, set the password, then sign
// in to enrol the authenticator. Staff always use MFA, so the 8-character minimum applies.

export function SetupPage() {
  const { t } = useTranslation();
  const { token } = useParams({ from: '/setup/$token' });
  const [who, setWho] = useState<{ email: string; name: string }>();
  const [state, setState] = useState<'form' | 'done' | 'invalid'>('form');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    sdk.staff
      .setupInfo(token)
      .then(setWho)
      .catch(() => setState('invalid'));
  }, [token]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    sdk.staff
      .setup(token, password)
      .then(() => setState('done'))
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.code === 'link_invalid') setState('invalid');
        else setError(errorMessage(e, t));
      });
  };

  if (state === 'invalid') return <Banner tone="error">{t('reset.invalid')}</Banner>;
  if (state === 'done') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Banner tone="success">{t('console.setup_done')}</Banner>
        <Link to="/signin">{t('signin.submit')}</Link>
      </section>
    );
  }
  if (!who) return <p aria-busy="true">{t('common.loading')}</p>;
  const rule = (r: { key: string; min?: number; max?: number }) =>
    t(`rules.${r.key}`, { min: r.min, max: r.max });
  return (
    <section
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      aria-labelledby="setup-title"
    >
      <h1 id="setup-title">{t('console.setup_title')}</h1>
      <p>{t('console.setup_intro', { name: who.name, email: who.email })}</p>
      {error && <Banner tone="error">{error}</Banner>}
      <form
        noValidate
        onSubmit={submit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <input type="email" autoComplete="username" value={who.email} readOnly hidden />
        <PasswordInput
          label={t('reset.password')}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
          checklist={passwordChecklist(password, { mfa: true, email: who.email }, rule)}
          autoFocus
        />
        <Button type="submit" disabled={!password}>
          {t('reset.submit')}
        </Button>
      </form>
    </section>
  );
}
