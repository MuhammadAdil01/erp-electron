import { ApiError } from '@erp/sdk';
import { Banner, Button, passwordChecklist, PasswordInput } from '@erp/ui';
import { Link, useParams } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { errorMessage, sdk } from '../auth';
import { AuthPage } from '../shell';
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

  const link = (to: '/signin' | '/forgot', text: string) => (
    <Link to={to} className="font-medium text-link no-underline hover:underline">
      {text}
    </Link>
  );
  if (state === 'done') {
    return (
      <AuthPage title={t('reset.title')} footer={link('/signin', t('forgot.back'))}>
        <Banner tone="success">{t('reset.done')}</Banner>
      </AuthPage>
    );
  }
  if (state === 'invalid') {
    return (
      <AuthPage title={t('reset.title')} footer={link('/forgot', t('reset.request_new'))}>
        <Banner tone="error">{t('reset.invalid')}</Banner>
      </AuthPage>
    );
  }
  return (
    <AuthPage title={t('reset.title')} footer={link('/signin', t('forgot.back'))}>
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        {error && <Banner tone="error">{error}</Banner>}
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
        <Button type="submit" size="lg" className="w-full" disabled={!password || !confirm}>
          {t('reset.submit')}
        </Button>
      </form>
    </AuthPage>
  );
}
