import { Banner, Button } from '@erp/ui';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, errorMessage, sdk, useAuthState } from '../auth';

// The workspace choice (§5.3.4 step 3, §5.3.5): one button per company the person works for;
// choosing one gets an access token for that membership.

export function ChoosePage() {
  const { t } = useTranslation();
  const state = useAuthState();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  if (state.status !== 'signed_in') return null;

  const choose = (membershipId: string) => {
    sdk.auth
      .switchCompany(membershipId)
      .then((body) => {
        auth().accept(body);
        void navigate({ to: '/' });
      })
      .catch((e: unknown) => setError(errorMessage(e, t)));
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="choose-title">
      <h1 id="choose-title" className="text-2xl font-semibold">
        {t('choose.title')}
      </h1>
      {error && <Banner tone="error">{error}</Banner>}
      {state.memberships.length === 0 && <p>{t('choose.none')}</p>}
      <ul className="flex flex-col gap-2">
        {state.memberships.map((m) => (
          <li key={m.membership_id}>
            <Button
              onClick={() => choose(m.membership_id)}
              aria-current={
                state.membership?.membership_id === m.membership_id ? 'true' : undefined
              }
              style={{ width: '100%', textAlign: 'start' }}
            >
              {m.tenant_name}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
