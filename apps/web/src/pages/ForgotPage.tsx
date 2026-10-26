import { EmailSchema } from '@erp/contracts';
import { Banner, Button, Input } from '@erp/ui';
import { Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { errorMessage, sdk } from '../auth';

// Forgot password (§5.3.7): always the same answer, whether or not the address has an account.

export function ForgotPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = EmailSchema.safeParse(email);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message);
    setError(undefined);
    sdk.auth
      .forgotPassword(parsed.data)
      .then(() => setSent(true))
      .catch((e: unknown) => setError(errorMessage(e, t)));
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="forgot-title">
      <h1 id="forgot-title" className="text-2xl font-semibold">
        {t('forgot.title')}
      </h1>
      {sent ? (
        <Banner tone="success">{t('forgot.sent')}</Banner>
      ) : (
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          <p>{t('forgot.intro')}</p>
          {error && <Banner tone="error">{error}</Banner>}
          <Input
            label={t('signin.email')}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Button type="submit">{t('forgot.submit')}</Button>
        </form>
      )}
      <Link to="/signin" className="underline">
        {t('forgot.back')}
      </Link>
    </section>
  );
}
