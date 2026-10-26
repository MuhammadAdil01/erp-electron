import {
  AcceptedSchema,
  DoneSchema,
  HealthResponseSchema,
  LoginResponseSchema,
  MembershipsSchema,
  MeSchema,
  ProblemDetailsSchema,
  RecoveryCodesSchema,
  SessionsSchema,
  SignedInSchema,
  StaffEnrolledSchema,
  StaffMeSchema,
  StaffSetupInfoSchema,
  TotpEnrolmentSchema,
  type ProblemDetails,
} from '@erp/contracts';
import type { z } from 'zod';

// The typed API client (Part 10 §10.3, Part 11 §11.10), built on the shared contracts: every
// response is checked against its schema, every error arrives as an ApiError carrying the
// RFC 9457 problem. Used by the web app, the Platform Console and the desktop main process.

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly problem: ProblemDetails | null,
  ) {
    super(problem?.detail ?? problem?.title ?? `API returned ${status}`);
    this.name = 'ApiError';
  }

  get code(): string | undefined {
    return this.problem?.code;
  }
}

export type SdkOptions = {
  /** The API origin, for example http://localhost:3000. */
  baseUrl: string;
  /** `desktop` makes the API return the refresh token in the body (main process only). */
  client?: 'web' | 'desktop';
  fetch?: typeof fetch;
  /** The current access token, for routes that need one. */
  getAccessToken?: () => Promise<string | null>;
  /** Called once when an authorized call answers 401; true means "retry with a new token". */
  onUnauthorized?: () => Promise<boolean>;
};

type Call = {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string>;
};

export function createSdk(options: SdkOptions) {
  const doFetch: typeof fetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));

  async function call<S extends z.ZodType>(
    path: string,
    schema: S,
    c: Call = {},
  ): Promise<z.infer<S>> {
    const send = async () => {
      const headers: Record<string, string> = { accept: 'application/json' };
      if (c.body !== undefined) headers['content-type'] = 'application/json';
      if (options.client === 'desktop') headers['x-erp-client'] = 'desktop';
      if (c.auth) {
        const token = await options.getAccessToken?.();
        if (token) headers.authorization = `Bearer ${token}`;
      }
      const url = new URL(path, options.baseUrl);
      for (const [k, v] of Object.entries(c.query ?? {})) url.searchParams.set(k, v);
      return doFetch(url, {
        method: c.method ?? (c.body !== undefined ? 'POST' : 'GET'),
        headers,
        body: c.body !== undefined ? JSON.stringify(c.body) : undefined,
        // The web app's refresh cookie travels with the auth routes (httpOnly, SameSite=Strict).
        credentials: options.client === 'desktop' ? 'omit' : 'include',
      });
    };
    let response = await send();
    if (response.status === 401 && c.auth && (await options.onUnauthorized?.())) {
      response = await send();
    }
    const text = await response.text();
    const json: unknown = text ? JSON.parse(text) : undefined;
    if (!response.ok) {
      const problem = ProblemDetailsSchema.safeParse(json);
      throw new ApiError(response.status, problem.success ? problem.data : null);
    }
    return schema.parse(json);
  }

  const app = '/api/v1';
  const platform = '/api/platform/v1';
  const tokenBody = (refreshToken?: string) =>
    refreshToken ? { refresh_token: refreshToken } : {};

  return {
    health: () => call(`${app}/health`, HealthResponseSchema),

    auth: {
      login: (body: { email: string; password: string; device_id?: string }) =>
        call(`${app}/auth/login`, LoginResponseSchema, { body }),
      verifyMfa: (body: { challenge: string; code?: string; recovery_code?: string }) =>
        call(`${app}/auth/mfa/verify`, SignedInSchema, { body }),
      refresh: (refreshToken?: string) =>
        call(`${app}/auth/refresh`, SignedInSchema, { body: tokenBody(refreshToken) }),
      logout: (refreshToken?: string) =>
        call(`${app}/auth/logout`, DoneSchema, { body: tokenBody(refreshToken), auth: true }),
      logoutAll: () => call(`${app}/auth/logout-all`, DoneSchema, { body: {}, auth: true }),
      switchCompany: (membershipId: string) =>
        call(`${app}/auth/switch`, SignedInSchema, {
          body: { membership_id: membershipId },
          auth: true,
        }),
      stepUp: (body: { code?: string; recovery_code?: string }) =>
        call(`${app}/auth/step-up`, DoneSchema, { body, auth: true }),
      forgotPassword: (email: string) =>
        call(`${app}/auth/password/forgot`, AcceptedSchema, { body: { email } }),
      resetPassword: (token: string, password: string) =>
        call(`${app}/auth/password/reset`, DoneSchema, { body: { token, password } }),
      confirmEmail: (token: string) =>
        call(`${app}/auth/email/confirm`, DoneSchema, { body: { token } }),
    },

    me: {
      get: () => call(`${app}/me`, MeSchema, { auth: true }),
      memberships: () => call(`${app}/me/memberships`, MembershipsSchema, { auth: true }),
      sessions: () => call(`${app}/me/sessions`, SessionsSchema, { auth: true }),
      revokeSession: (id: string) =>
        call(`${app}/me/sessions/${encodeURIComponent(id)}`, DoneSchema, {
          method: 'DELETE',
          auth: true,
        }),
      changePassword: (current: string, next: string) =>
        call(`${app}/me/password`, DoneSchema, {
          body: { current_password: current, new_password: next },
          auth: true,
        }),
      startTotp: () => call(`${app}/me/mfa/totp`, TotpEnrolmentSchema, { body: {}, auth: true }),
      confirmTotp: (code: string) =>
        call(`${app}/me/mfa/totp/confirm`, RecoveryCodesSchema, { body: { code }, auth: true }),
      disableMfa: () => call(`${app}/me/mfa`, DoneSchema, { method: 'DELETE', auth: true }),
      newRecoveryCodes: () =>
        call(`${app}/me/mfa/recovery-codes`, RecoveryCodesSchema, { body: {}, auth: true }),
      changeEmail: (newEmail: string, password: string) =>
        call(`${app}/me/email`, AcceptedSchema, {
          body: { new_email: newEmail, password },
          auth: true,
        }),
    },

    staff: {
      login: (body: { email: string; password: string; device_id?: string }) =>
        call(`${platform}/auth/login`, LoginResponseSchema, { body }),
      verifyMfa: (body: { challenge: string; code?: string; recovery_code?: string }) =>
        call(`${platform}/auth/mfa/verify`, SignedInSchema, { body }),
      enrol: (challenge: string, code: string) =>
        call(`${platform}/auth/mfa/enrol`, StaffEnrolledSchema, { body: { challenge, code } }),
      refresh: (refreshToken?: string) =>
        call(`${platform}/auth/refresh`, SignedInSchema, { body: tokenBody(refreshToken) }),
      logout: (refreshToken?: string) =>
        call(`${platform}/auth/logout`, DoneSchema, { body: tokenBody(refreshToken), auth: true }),
      setupInfo: (token: string) =>
        call(`${platform}/auth/setup`, StaffSetupInfoSchema, { query: { token } }),
      setup: (token: string, password: string) =>
        call(`${platform}/auth/setup`, DoneSchema, { body: { token, password } }),
      me: () => call(`${platform}/me`, StaffMeSchema, { auth: true }),
    },
  };
}

export type Sdk = ReturnType<typeof createSdk>;
