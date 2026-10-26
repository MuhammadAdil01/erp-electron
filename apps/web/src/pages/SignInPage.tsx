import { EmailSchema } from '@erp/contracts';
import { Banner, Button, Input, PasswordInput } from '@erp/ui';
import { Link, Navigate, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, errorMessage, useAuthState } from '../auth';

// Sign-in (Part 05 §5.3.4): e-mail first, then the password, then the second factor when one
// is enrolled. The same message for an unknown e-mail and a wrong password.

type Step = { kind: 'email' } | { kind: 'password' } | { kind: 'mfa'; challenge: string };

export function SignInPage() {
  const { t } = useTranslation();
  const state = useAuthState();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>({ kind: 'email' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  // Only someone who arrives here already signed in is sent on; after sign-in done() decides
  // where to go (the company chooser when there are several).
  if (state.status === 'signed_in' && step.kind === 'email') return <Navigate to="/" />;

  const done = () => {
    const now = auth().getState();
    const choose = now.status === 'signed_in' && !now.membership && now.memberships.length > 1;
    void navigate({ to: choose ? '/choose' : '/' });
  };

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    setError(undefined);
    try {
      await work();
    } catch (e) {
      setError(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = (event: FormEvent) => {
    event.preventDefault();
    const parsed = EmailSchema.safeParse(email);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message);
    setError(undefined);
    setStep({ kind: 'password' });
  };

  const submitPassword = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      const result = await auth().signIn(email, password);
      setPassword('');
      if (result.status === 'mfa_required') setStep({ kind: 'mfa', challenge: result.challenge });
      else done();
    });
  };

  const submitCode = (event: FormEvent) => {
    event.preventDefault();
    if (step.kind !== 'mfa') return;
    void run(async () => {
      await auth().verifyMfa(
        useRecovery
          ? { challenge: step.challenge, recovery_code: code }
          : { challenge: step.challenge, code },
      );
      done();
    });
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="signin-title">
      <h1 id="signin-title" className="text-2xl font-semibold">
        {step.kind === 'mfa' ? t('signin.mfa_title') : t('signin.title')}
      </h1>
      {error && <Banner tone="error">{error}</Banner>}

      {step.kind === 'email' && (
        <form noValidate onSubmit={submitEmail} className="flex flex-col gap-4">
          <Input
            label={t('signin.email')}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Button type="submit">{t('signin.next')}</Button>
        </form>
      )}

      {step.kind === 'password' && (
        <form noValidate onSubmit={submitPassword} className="flex flex-col gap-4">
          {/* Kept for password managers, which pair the password with the account name. */}
          <input type="email" autoComplete="username" value={email} readOnly hidden />
          <p>
            {email}{' '}
            <button type="button" className="underline" onClick={() => setStep({ kind: 'email' })}>
              {t('signin.change_email')}
            </button>
          </p>
          <PasswordInput
            label={t('signin.password')}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showLabel={t('common.show')}
            hideLabel={t('common.hide')}
            autoFocus
          />
          <Button type="submit" disabled={busy || !password}>
            {t('signin.submit')}
          </Button>
          <Link to="/forgot" className="underline">
            {t('signin.forgot')}
          </Link>
        </form>
      )}

      {step.kind === 'mfa' && (
        <form noValidate onSubmit={submitCode} className="flex flex-col gap-4">
          <Input
            label={useRecovery ? t('signin.recovery_code') : t('signin.mfa_code')}
            inputMode={useRecovery ? 'text' : 'numeric'}
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            autoFocus
          />
          <Button type="submit" disabled={busy || !code}>
            {t('signin.verify')}
          </Button>
          <button
            type="button"
            className="underline"
            onClick={() => {
              setUseRecovery((v) => !v);
              setCode('');
            }}
          >
            {useRecovery ? t('signin.use_code') : t('signin.use_recovery')}
          </button>
        </form>
      )}
    </section>
  );
}
