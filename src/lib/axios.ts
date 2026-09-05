import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_BASE || 'https://erp-backend-sepia.vercel.app/api/v1';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

/**
 * A second instance with no interceptors, used for /auth/refresh only.
 *
 * The refresh call must never pass through the 401 handler below: a failing
 * refresh would trigger another refresh, and so on.
 */
export const authClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request: attach Bearer token + the active company ─────────────────────────
api.interceptors.request.use((config) => {
  const { token, activeCompanyId, user } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // A platform super admin belongs to no company, so every company-scoped
  // endpoint would query `companyId: null` — matching nothing on reads and
  // throwing on writes. Choose Company records the tenant they are
  // administering; this header carries it. The server honours it for super
  // admins only, so a company user cannot use it to reach another tenant.
  if (activeCompanyId && user?.isSuperAdmin) {
    config.headers['X-Company-Id'] = activeCompanyId;
  }
  return config;
});

/**
 * The single in-flight refresh.
 *
 * Refresh tokens rotate and the server treats a re-presented token as theft —
 * it revokes the whole chain and forces a real re-login. A screen like Company
 * Administration fires three or four queries at once, so without this latch an
 * expired access token would spawn parallel refreshes, the losers would replay
 * a token the winner had already spent, and the "reuse detected" branch would
 * log the user out. That is exactly the failure this coalescing prevents.
 */
let refreshInFlight: Promise<string> | null = null;

function runRefresh(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) throw new Error('No refresh token');

    // Imported lazily: auth.api imports this module, and a static import here
    // would close the cycle at module-evaluation time.
    const { authApi } = await import('../api/auth.api');
    const pair = await authApi.refresh(refreshToken);
    useAuthStore.getState().setTokens(pair.accessToken, pair.refreshToken);
    return pair.accessToken;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

/** Requests that must not be retried after a refresh — they *are* the auth flow. */
const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/register'];
const isAuthPath = (url?: string) => !!url && AUTH_PATHS.some((p) => url.includes(p));

type RetriedConfig = AxiosRequestConfig & { _retriedAfterRefresh?: boolean };

// ── Response: unwrap { success, data, timestamp } envelope + refresh on 401 ───
api.interceptors.response.use(
  (response) => {
    // Backend wraps all responses: { success: true, data: T, timestamp: string }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError<{ message?: string | string[]; statusCode?: number }>) => {
    const config = error.config as RetriedConfig | undefined;

    // A 401 means the access token is missing, expired or rejected. An expired
    // token is the common case and is recoverable, so try one refresh and
    // replay the request.
    //
    // The session is cleared in exactly one place: when the refresh itself is
    // refused. That is the only 401 that actually proves the session is dead.
    //
    // This used to also clear on *any* other 401 — including the replay's own
    // 401 after a refresh that had just succeeded. So a single endpoint
    // answering 401 for a reason of its own signed the user out of the whole
    // app with no explanation, which is what "the entire screen logs out" when
    // adding a posting period was. Now such a 401 surfaces as an error message
    // in the window that caused it, and the session survives.
    if (
      error.response?.status === 401 &&
      config &&
      !config._retriedAfterRefresh &&
      !isAuthPath(config.url) &&
      useAuthStore.getState().refreshToken
    ) {
      try {
        await runRefresh();
        config._retriedAfterRefresh = true;
        // No need to set the header here: replaying through `api` re-runs the
        // request interceptor, which reads the freshly stored access token.
        // Rebuilding the header object by hand would drop the AxiosHeaders
        // instance the original request was built with.
        return api.request(config);
      } catch {
        // The refresh was refused — expired, revoked, or reuse detected. There
        // is no way back to a valid session from here.
        useAuthStore.getState().clearAuth();
      }
    } else if (
      error.response?.status === 401 &&
      !isAuthPath(config?.url) &&
      !useAuthStore.getState().refreshToken
    ) {
      // No refresh token at all: nothing to recover with.
      useAuthStore.getState().clearAuth();
    }

    // Bubble up a clean error message. Nest's ValidationPipe answers with an
    // array of messages; joining keeps them readable in the UI instead of
    // rendering "[object Object]".
    const raw = error.response?.data?.message;
    const message =
      (Array.isArray(raw) ? raw.join('; ') : raw) ?? error.message ?? 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
