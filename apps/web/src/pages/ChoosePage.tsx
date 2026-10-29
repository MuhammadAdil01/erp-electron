import { Banner } from '@erp/ui';
import { useNavigate } from '@tanstack/react-router';
import { Building2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, errorMessage, sdk, useAuthState } from '../auth';
import { AuthPage } from '../shell';

// The workspace choice (§5.3.4 step 3, §5.3.5): one row per company the person works for;
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
    <AuthPage title={t('choose.title')} description={t('choose.subtitle')}>
      <div className="flex flex-col gap-3">
        {error && <Banner tone="error">{error}</Banner>}
        {state.memberships.length === 0 && (
          <p className="m-0 text-sm text-muted">{t('choose.none')}</p>
        )}
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {state.memberships.map((m) => (
            <li key={m.membership_id}>
              <button
                type="button"
                onClick={() => choose(m.membership_id)}
                aria-current={
                  state.membership?.membership_id === m.membership_id ? 'true' : undefined
                }
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-start shadow-1 transition-colors hover:border-primary/50 hover:bg-subtle"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-link">
                  <Building2 aria-hidden className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold text-fg">{m.tenant_name}</span>
                  <span className="text-xs text-muted">{m.tenant_code}</span>
                </span>
                <ChevronRight aria-hidden className="size-4 text-faint" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AuthPage>
  );
}
