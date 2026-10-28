import { AuthClient, webTransport, type AuthState } from '@erp/auth-client';
import { ApiError, createSdk } from '@erp/sdk';
import { useSyncExternalStore } from 'react';

// Staff sign-in for the Platform Console (D5): its own token audience (console), its own
// refresh cookie, and no desktop variant (D6: the console is web only).

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api/v1';

let client: AuthClient | undefined;

export const sdk = createSdk({
  baseUrl: new URL(API_BASE).origin,
  getAccessToken: () => auth().getAccessToken(),
  onUnauthorized: () => auth().refresh(),
});

export function auth(): AuthClient {
  client ??= new AuthClient(webTransport(sdk.staff), { lockName: 'erp-console-refresh' });
  return client;
}

export function useAuthState(): AuthState {
  return useSyncExternalStore(
    (listener) => auth().subscribe(listener),
    () => auth().getState(),
  );
}

export function errorMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'invalid_credentials':
        return t('signin.invalid');
      case 'mfa_invalid':
        return t('signin.mfa_invalid');
      case 'link_invalid':
        return t('reset.invalid');
      case 'rate_limited':
        return t('common.rate_limited');
      case 'validation_failed':
        return error.problem?.errors?.[0]?.message ?? error.problem?.detail ?? t('common.error');
    }
    // Conflicts, refusals and stale versions: the API's own explanation.
    if (error.problem?.detail) return error.problem.detail;
  }
  return t('common.error');
}
