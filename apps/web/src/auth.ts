import {
  AuthClient,
  desktopBridge,
  desktopTransport,
  webTransport,
  type AuthState,
  type DesktopAuthBridge,
} from '@erp/auth-client';
import type { ProblemDetails } from '@erp/contracts';
import { ApiError, createSdk } from '@erp/sdk';
import { useSyncExternalStore } from 'react';
import { API_BASE } from './api';

// One API client and one session for the whole app. Inside the desktop app the main process
// holds the refresh token (window.erp.auth); in a browser it is the API's httpOnly cookie.

export const API_ORIGIN = new URL(API_BASE).origin;

let client: AuthClient | undefined;

export const sdk = createSdk({
  baseUrl: API_ORIGIN,
  getAccessToken: () => auth().getAccessToken(),
  onUnauthorized: () => auth().refresh(),
});

/** The bridge passes failures as data; turn them back into ApiError for the screens. */
function withApiErrors(bridge: DesktopAuthBridge): DesktopAuthBridge {
  const wrap =
    <A extends unknown[], R>(fn: (...args: A) => Promise<R>) =>
    (...args: A) =>
      fn(...args).catch((e: unknown) => {
        const failure = e as { status?: unknown; problem?: ProblemDetails | null };
        if (typeof failure?.status === 'number')
          throw new ApiError(failure.status, failure.problem ?? null);
        throw e;
      });
  return {
    login: wrap(bridge.login),
    verifyMfa: wrap(bridge.verifyMfa),
    refresh: wrap(bridge.refresh),
    logout: wrap(bridge.logout),
  };
}

export function auth(): AuthClient {
  if (!client) {
    const bridge = desktopBridge();
    const transport = bridge ? desktopTransport(withApiErrors(bridge)) : webTransport(sdk.auth);
    client = new AuthClient(transport, {
      lockName: 'erp-web-refresh',
    });
  }
  return client;
}

export function useAuthState(): AuthState {
  return useSyncExternalStore(
    (listener) => auth().subscribe(listener),
    () => auth().getState(),
  );
}

/** What to tell the person about a failed call, by the problem's stable code. */
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
      case 'conflict':
        return error.problem?.errors?.[0]?.message ?? error.problem?.detail ?? t('common.error');
    }
  }
  return t('common.error');
}
