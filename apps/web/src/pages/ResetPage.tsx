import { ApiError } from '@erp/sdk';
import { Banner, Button, passwordChecklist, PasswordInput } from '@erp/ui';
import { Link, useParams } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { errorMessage, sdk } from '../auth';
import { ruleLabel } from './password';

// A new password from a reset, lockout or first-password link (§5.3.7). The link works once;
// every other session ends. The checklist shows the 15-character rule; with MFA on, the
// server accepts 8.

export function ResetPage() {
  const { t } = useTranslation();
  const { token } = useParams({ from: '/reset/$token' });
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState<'form' | 'done' | 'invalid'>('form');
  const [error, setError] = useState<string>();
  const checklist = passwordChecklist(password, { mfa: false }, ruleLabel(t));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) return setError(t('reset.mismatch'));
    setError(undefined);
    sdk.auth
      .resetPassword(token, password)
      .then(() => setState('done'))
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.code === 'link_invalid') setState('invalid');
        else setError(errorMessage(e, t));
      });
  };

  if (state === 'done') {
    return (
      <section className="flex flex-col gap-4">
        <Banner tone="success">{t('reset.done')}</Banner>
        <Link to="/signin" className="underline">
          {t('forgot.back')}
        </Link>
      </section>
    );
  }
  if (state === 'invalid') {
    return (
      <section className="flex flex-col gap-4">
        <Banner tone="error">{t('reset.invalid')}</Banner>
        <Link to="/forgot" className="underline">
          {t('reset.request_new')}
        </Link>
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-4" aria-labelledby="reset-title">
      <h1 id="reset-title" className="text-2xl font-semibold">
        {t('reset.title')}
      </h1>
      {error && <Banner tone="error">{error}</Banner>}
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <PasswordInput
          label={t('reset.password')}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
          hint={t('rules.mfa_note')}
          checklist={[...checklist, { key: 'not_common', ok: false, label: t('rules.not_common') }]}
          autoFocus
        />
        <PasswordInput
          label={t('reset.confirm')}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
        />
        <Button type="submit" disabled={!password || !confirm}>
          {t('reset.submit')}
        </Button>
      </form>
    </section>
  );
}
