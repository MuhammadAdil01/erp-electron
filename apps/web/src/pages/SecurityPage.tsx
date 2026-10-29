import { ApiError } from '@erp/sdk';
import {
  Banner,
  Breadcrumbs,
  Button,
  Card,
  Input,
  PageHeader,
  passwordChecklist,
  PasswordInput,
  QrCode,
  RecoveryCodes,
  StatusChip,
} from '@erp/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Globe, Monitor } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, errorMessage, sdk } from '../auth';
import { useTranslatedToast } from '../toasts';
import { ruleLabel } from './password';

// My Account › Security (Part 05 §5.3.9–5.3.11): password, two-step sign-in with recovery
// codes, signed-in sessions, and the e-mail address. Sensitive changes ask for a fresh code
// when the API answers step_up_required.

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card title={title}>
      <div className="flex flex-col gap-4 text-sm">{children}</div>
    </Card>
  );
}

export function SecurityPage() {
  const { t } = useTranslation();
  const me = useQuery({ queryKey: ['me'], queryFn: () => sdk.me.get() });
  return (
    <>
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            label={t('shell.breadcrumbs')}
            items={[{ label: t('shell.my_account') }, { label: t('nav.security') }]}
          />
        }
        title={t('security.title')}
        description={t('security.subtitle')}
      />
      {me.data && (
        <div className="grid items-start gap-6 xl:grid-cols-2">
          <div className="flex flex-col gap-6">
            <MfaSection enrolled={me.data.mfa.enrolled} required={me.data.mfa.required} />
            <SessionsSection />
          </div>
          <div className="flex flex-col gap-6">
            <PasswordSection mfa={me.data.mfa.enrolled} email={me.data.email} />
            <EmailSection current={me.data.email} />
          </div>
        </div>
      )}
    </>
  );
}

function PasswordSection({ mfa, email }: { mfa: boolean; email: string }) {
  const { t } = useTranslation();
  const toast = useTranslatedToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState<string>();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    sdk.me
      .changePassword(current, next)
      .then(() => {
        setCurrent('');
        setNext('');
        toast('security.changed');
      })
      .catch((e: unknown) => setError(errorMessage(e, t)));
  };
  return (
    <Section title={t('security.password_title')}>
      {error && <Banner tone="error">{error}</Banner>}
      <form noValidate onSubmit={submit} className="flex flex-col gap-3">
        <input type="email" autoComplete="username" value={email} readOnly hidden />
        <PasswordInput
          label={t('security.current')}
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
        />
        <PasswordInput
          label={t('security.new')}
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          showLabel={t('common.show')}
          hideLabel={t('common.hide')}
          checklist={passwordChecklist(next, { mfa, email }, ruleLabel(t))}
        />
        <Button type="submit" disabled={!current || !next}>
          {t('security.change')}
        </Button>
      </form>
    </Section>
  );
}

/** Runs a sensitive action; when the API asks for a step-up, asks for a code and tries again. */
function useStepUp() {
  const [pending, setPending] = useState<() => Promise<void>>();
  const run = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (e) {
      if (e instanceof ApiError && e.code === 'step_up_required') setPending(() => action);
      else throw e;
    }
  };
  return { pending, run, clear: () => setPending(undefined) };
}

function MfaSection({ enrolled, required }: { enrolled: boolean; required: boolean }) {
  const { t } = useTranslation();
  const toast = useTranslatedToast();
  const queries = useQueryClient();
  const [enrolment, setEnrolment] = useState<{ secret: string; otpauth_uri: string }>();
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState<string[]>();
  const [error, setError] = useState<string>();
  const stepUp = useStepUp();
  const [stepUpCode, setStepUpCode] = useState('');
  const refresh = () => void queries.invalidateQueries({ queryKey: ['me'] });
  const fail = (e: unknown) => setError(errorMessage(e, t));

  const start = () =>
    void stepUp.run(async () => setEnrolment(await sdk.me.startTotp())).catch(fail);
  const confirm = (event: FormEvent) => {
    event.preventDefault();
    sdk.me
      .confirmTotp(code)
      .then((result) => {
        setEnrolment(undefined);
        setCode('');
        setCodes(result.recovery_codes);
        toast('security.mfa_enabled');
      })
      .catch(fail);
  };
  const newCodes = () =>
    void stepUp
      .run(async () => setCodes((await sdk.me.newRecoveryCodes()).recovery_codes))
      .catch(fail);
  const disable = () =>
    void stepUp
      .run(async () => {
        await sdk.me.disableMfa();
        toast('security.mfa_disabled');
        refresh();
      })
      .catch(fail);
  const confirmStepUp = (event: FormEvent) => {
    event.preventDefault();
    const action = stepUp.pending;
    sdk.auth
      .stepUp({ code: stepUpCode })
      .then(async () => {
        stepUp.clear();
        setStepUpCode('');
        await action?.();
      })
      .catch(fail);
  };

  return (
    <Section title={t('security.mfa_title')}>
      {error && <Banner tone="error">{error}</Banner>}
      <p className="m-0 flex items-center gap-2">
        <StatusChip
          status={enrolled ? 'active' : 'draft'}
          label={enrolled ? t('security.mfa_on') : t('security.mfa_off')}
        />
      </p>
      {required && <p className="m-0 text-muted">{t('security.mfa_required')}</p>}

      {codes ? (
        <RecoveryCodes
          codes={codes}
          labels={{
            title: t('security.codes_title'),
            intro: t('security.codes_intro'),
            copy: t('security.codes_copy'),
            download: t('security.codes_download'),
            saved: t('security.codes_saved'),
            done: t('common.done'),
          }}
          onDone={() => {
            setCodes(undefined);
            refresh();
          }}
        />
      ) : stepUp.pending ? (
        <form noValidate onSubmit={confirmStepUp} className="flex flex-col gap-3">
          <h3 className="m-0 text-sm font-semibold">{t('security.stepup_title')}</h3>
          <p className="m-0 text-muted">{t('security.stepup_intro')}</p>
          <Input
            label={t('signin.mfa_code')}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={stepUpCode}
            onChange={(e) => setStepUpCode(e.target.value.trim())}
            autoFocus
          />
          <Button type="submit" disabled={!stepUpCode}>
            {t('signin.verify')}
          </Button>
        </form>
      ) : enrolment ? (
        <form noValidate onSubmit={confirm} className="flex flex-col gap-3">
          <p className="m-0 text-muted">{t('security.mfa_scan')}</p>
          <QrCode value={enrolment.otpauth_uri} label={t('security.mfa_scan')} />
          <p className="m-0">
            {t('security.mfa_key')}:{' '}
            <code
              data-testid="totp-secret"
              className="rounded-sm bg-subtle px-1.5 py-0.5 font-mono text-xs"
            >
              {enrolment.secret}
            </code>
          </p>
          <Input
            label={t('security.mfa_confirm')}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
          />
          <Button type="submit" disabled={!code}>
            {t('signin.verify')}
          </Button>
        </form>
      ) : enrolled ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={newCodes}>
            {t('security.codes_new')}
          </Button>
          {!required && (
            <Button variant="secondary" onClick={disable}>
              {t('security.mfa_disable')}
            </Button>
          )}
        </div>
      ) : (
        <div>
          <Button onClick={start}>{t('security.mfa_start')}</Button>
        </div>
      )}
    </Section>
  );
}

function SessionsSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queries = useQueryClient();
  const sessions = useQuery({ queryKey: ['sessions'], queryFn: () => sdk.me.sessions() });
  const when = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso),
    );
  return (
    <Section title={t('security.sessions_title')}>
      <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-md border border-line p-0">
        {sessions.data?.data.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-subtle text-muted">
                {s.client === 'desktop' ? (
                  <Monitor aria-hidden className="size-4" />
                ) : (
                  <Globe aria-hidden className="size-4" />
                )}
              </span>
              <span className="flex flex-col">
                <span className="flex items-center gap-2 font-medium text-fg">
                  {s.client === 'desktop'
                    ? t('security.session_desktop')
                    : t('security.session_web')}
                  {s.current && (
                    <StatusChip status="active" label={t('security.session_current')} />
                  )}
                </span>
                <span className="text-xs text-muted">
                  {t('security.last_active', { when: when(s.last_seen_at) })}
                </span>
              </span>
            </span>
            {!s.current && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  void sdk.me
                    .revokeSession(s.id)
                    .then(() => queries.invalidateQueries({ queryKey: ['sessions'] }))
                }
              >
                {t('security.session_signout')}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <div>
        <Button
          variant="secondary"
          onClick={() =>
            void sdk.auth
              .logoutAll()
              .then(() => auth().signOut())
              .then(() => navigate({ to: '/signin' }))
          }
        >
          {t('security.signout_all')}
        </Button>
      </div>
    </Section>
  );
}

function EmailSection({ current }: { current: string }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    sdk.me
      .changeEmail(email, password)
      .then(() => {
        setSent(true);
        setPassword('');
      })
      .catch((e: unknown) => setError(errorMessage(e, t)));
  };
  return (
    <Section title={t('security.email_title')}>
      <p>{current}</p>
      {error && <Banner tone="error">{error}</Banner>}
      {sent ? (
        <Banner tone="success">{t('security.email_sent')}</Banner>
      ) : (
        <form noValidate onSubmit={submit} className="flex flex-col gap-3">
          <Input
            label={t('security.email_new')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            label={t('security.email_password')}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showLabel={t('common.show')}
            hideLabel={t('common.hide')}
          />
          <Button type="submit" disabled={!email || !password}>
            {t('security.email_submit')}
          </Button>
        </form>
      )}
    </Section>
  );
}
