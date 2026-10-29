import { Banner, Button, Input, PasswordInput, QrCode, RecoveryCodes } from '@erp/ui';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, errorMessage, useAuthState } from '../auth';

// Staff sign-in (D5): e-mail and password, then always a second factor. At the first sign-in
// the authenticator is enrolled before anything else, and the recovery codes are shown once.

type Step =
  | { kind: 'password' }
  | { kind: 'mfa'; challenge: string }
  | { kind: 'enrol'; challenge: string; secret: string; uri: string }
  | { kind: 'codes'; codes: string[] };

export function SignInPage({ idle }: { idle?: boolean }) {
  const { t } = useTranslation();
  const state = useAuthState();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>({ kind: 'password' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();

  // Only someone who arrives here already signed in is sent on; after sign-in this page moves on
  // itself, so the recovery codes are always shown first.
  if (state.status === 'signed_in' && step.kind === 'password') return <Navigate to="/" />;

  const run = (work: () => Promise<void>) => {
    setError(undefined);
    work().catch((e: unknown) => setError(errorMessage(e, t)));
  };

  const submitPassword = (event: FormEvent) => {
    event.preventDefault();
    run(async () => {
      const result = await auth().signIn(email, password);
      setPassword('');
      if (result.status === 'mfa_required') setStep({ kind: 'mfa', challenge: result.challenge });
      else if (result.status === 'mfa_enrolment_required') {
        setStep({
          kind: 'enrol',
          challenge: result.challenge,
          secret: result.secret,
          uri: result.otpauth_uri,
        });
      }
    });
  };

  const submitCode = (event: FormEvent) => {
    event.preventDefault();
    run(async () => {
      if (step.kind === 'mfa') {
        await auth().verifyMfa({ challenge: step.challenge, code });
        void navigate({ to: '/' });
      } else if (step.kind === 'enrol') {
        setStep({ kind: 'codes', codes: await auth().enrol(step.challenge, code) });
      }
      setCode('');
    });
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="signin-title">
      <h1 id="signin-title" className="m-0 text-xl font-semibold tracking-tight">
        {step.kind === 'enrol' ? t('console.enrol_title') : t('console.signin_title')}
      </h1>
      {idle && step.kind === 'password' && <Banner>{t('console.idle')}</Banner>}
      {error && <Banner tone="error">{error}</Banner>}

      {step.kind === 'password' && (
        <form noValidate onSubmit={submitPassword} className="flex flex-col gap-4">
          <Input
            label={t('signin.email')}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <PasswordInput
            label={t('signin.password')}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showLabel={t('common.show')}
            hideLabel={t('common.hide')}
          />
          <Button type="submit" size="lg" className="w-full" disabled={!email || !password}>
            {t('signin.submit')}
          </Button>
        </form>
      )}

      {(step.kind === 'mfa' || step.kind === 'enrol') && (
        <form noValidate onSubmit={submitCode} className="flex flex-col gap-4">
          {step.kind === 'enrol' && (
            <>
              <p className="m-0 text-sm text-muted">{t('console.enrol_intro')}</p>
              <QrCode value={step.uri} label={t('security.mfa_scan')} />
              <p className="m-0 text-sm">
                {t('security.mfa_key')}:{' '}
                <code
                  data-testid="totp-secret"
                  className="rounded-sm bg-subtle px-1.5 py-0.5 font-mono text-xs"
                >
                  {step.secret}
                </code>
              </p>
            </>
          )}
          <Input
            label={t('signin.mfa_code')}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            autoFocus
          />
          <Button type="submit" size="lg" className="w-full" disabled={!code}>
            {t('signin.verify')}
          </Button>
        </form>
      )}

      {step.kind === 'codes' && (
        <RecoveryCodes
          codes={step.codes}
          labels={{
            title: t('security.codes_title'),
            intro: t('security.codes_intro'),
            copy: t('security.codes_copy'),
            download: t('security.codes_download'),
            saved: t('security.codes_saved'),
            done: t('common.done'),
          }}
          onDone={() => void navigate({ to: '/' })}
        />
      )}
    </section>
  );
}
