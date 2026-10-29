import { EmailSchema } from '@erp/contracts';
import { Banner, Button, Input } from '@erp/ui';
import { Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { errorMessage, sdk } from '../auth';
import { AuthPage } from '../shell';

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
    <AuthPage
      title={t('forgot.title')}
      description={sent ? undefined : t('forgot.subtitle')}
      footer={
        <Link to="/signin" className="font-medium text-link no-underline hover:underline">
          {t('forgot.back')}
        </Link>
      }
    >
      {sent ? (
        <Banner tone="success">{t('forgot.sent')}</Banner>
      ) : (
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          {error && <Banner tone="error">{error}</Banner>}
          <Input
            label={t('signin.email')}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Button type="submit" size="lg" className="w-full">
            {t('forgot.submit')}
          </Button>
        </form>
      )}
    </AuthPage>
  );
}
