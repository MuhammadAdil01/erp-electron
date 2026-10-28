import {
  AcceptedSchema,
  ACCESS_VERSION_HEADER,
  ApprovalsSchema,
  AuditPageSchema,
  CatalogueModulesSchema,
  ChangeResultSchema,
  ConsoleSearchSchema,
  CountryPackDetailSchema,
  CountryPacksSchema,
  DoneSchema,
  HealthResponseSchema,
  LoginResponseSchema,
  MeAccessSchema,
  MembershipsSchema,
  MeSchema,
  PlanSchema,
  PlansSchema,
  ProblemDetailsSchema,
  RecoveryCodesSchema,
  SessionsSchema,
  SignedInSchema,
  StaffAccessSchema,
  StaffEnrolledSchema,
  StaffListSchema,
  StaffMemberSchema,
  StaffMeSchema,
  StaffSetupInfoSchema,
  TemplateDetailSchema,
  TemplateDiffSchema,
  TemplatesSchema,
  TotpEnrolmentSchema,
  type Approval,
  type CountryPackDraftUpdateSchema,
  type FeatureDisplayPatchSchema,
  type ModuleDisplayPatchSchema,
  type PlanUpsertSchema,
  type PricesSchema,
  type ProblemDetails,
  type StaffRoleKey,
  type TemplateDraftUpdateSchema,
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
  /** The X-Access-Version of a company response, so the client can tell when access changed. */
  onAccessVersion?: (version: number) => void;
};

type Call = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | undefined>;
  headers?: Record<string, string>;
};

export function createSdk(options: SdkOptions) {
  const doFetch: typeof fetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));

  async function call<S extends z.ZodType>(
    path: string,
    schema: S,
    c: Call = {},
  ): Promise<z.infer<S>> {
    return (await exchange(path, c, (text) => schema.parse(text ? JSON.parse(text) : undefined)))
      .body;
  }

  /** A call that also returns the ETag, for records edited with If-Match. */
  async function callWithEtag<S extends z.ZodType>(path: string, schema: S, c: Call = {}) {
    const { body, response } = await exchange(path, c, (text) => schema.parse(JSON.parse(text)));
    return { body: body as z.infer<S>, etag: response.headers.get('etag') ?? '' };
  }

  async function exchange<T>(path: string, c: Call, parse: (text: string) => T) {
    const send = async () => {
      const headers: Record<string, string> = { accept: 'application/json', ...c.headers };
      if (c.body !== undefined) headers['content-type'] = 'application/json';
      if (options.client === 'desktop') headers['x-erp-client'] = 'desktop';
      if (c.auth) {
        const token = await options.getAccessToken?.();
        if (token) headers.authorization = `Bearer ${token}`;
      }
      const url = new URL(path, options.baseUrl);
      for (const [k, v] of Object.entries(c.query ?? {}))
        if (v !== undefined) url.searchParams.set(k, v);
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
    const version = response.headers.get(ACCESS_VERSION_HEADER);
    if (version !== null && Number.isInteger(Number(version))) {
      options.onAccessVersion?.(Number(version));
    }
    const text = await response.text();
    if (!response.ok) {
      let json: unknown;
      try {
        json = text ? JSON.parse(text) : undefined;
      } catch {
        json = undefined;
      }
      const problem = ProblemDetailsSchema.safeParse(json);
      throw new ApiError(response.status, problem.success ? problem.data : null);
    }
    return { body: parse(text), response };
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
      /** Features, permissions with scopes, menu and version in the current company. */
      access: () => call(`${app}/me/access`, MeAccessSchema, { auth: true }),
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

    /** Platform Console (Part 11 §11.10.3); every call needs a staff token. */
    console: {
      access: () => call(`${platform}/me/access`, StaffAccessSchema, { auth: true }),
      stepUp: (body: { code?: string; recovery_code?: string }) =>
        call(`${platform}/me/step-up`, DoneSchema, { body, auth: true }),
      search: (q: string) =>
        call(`${platform}/search`, ConsoleSearchSchema, { query: { q }, auth: true }),
      staff: {
        list: () => call(`${platform}/staff`, StaffListSchema, { auth: true }),
        invite: (body: { email: string; name: string; roles: StaffRoleKey[]; reason: string }) =>
          call(`${platform}/staff`, StaffMemberSchema, { body, auth: true }),
        roles: (id: string, roles: StaffRoleKey[], reason: string) =>
          call(`${platform}/staff/${encodeURIComponent(id)}/roles`, StaffMemberSchema, {
            method: 'PUT',
            body: { roles, reason },
            auth: true,
          }),
        deactivate: (id: string, reason: string) =>
          call(`${platform}/staff/${encodeURIComponent(id)}/deactivate`, StaffMemberSchema, {
            body: { reason },
            auth: true,
          }),
        setupLink: (id: string, reason: string) =>
          call(`${platform}/staff/${encodeURIComponent(id)}/setup-link`, DoneSchema, {
            body: { reason },
            auth: true,
          }),
      },
      catalogue: {
        modules: () =>
          call(`${platform}/catalogue/modules`, CatalogueModulesSchema, { auth: true }),
        patchModule: (key: string, body: z.input<typeof ModuleDisplayPatchSchema>) =>
          call(`${platform}/catalogue/modules/${encodeURIComponent(key)}`, DoneSchema, {
            method: 'PATCH',
            body,
            auth: true,
          }),
        patchFeature: (key: string, body: z.input<typeof FeatureDisplayPatchSchema>) =>
          call(`${platform}/catalogue/features/${encodeURIComponent(key)}`, DoneSchema, {
            method: 'PATCH',
            body,
            auth: true,
          }),
        plans: () => call(`${platform}/catalogue/plans`, PlansSchema, { auth: true }),
        upsertPlan: (body: z.input<typeof PlanUpsertSchema>, ifMatch?: string) =>
          call(`${platform}/catalogue/plans`, PlanSchema, {
            method: 'PUT',
            body,
            auth: true,
            headers: ifMatch ? { 'if-match': ifMatch } : undefined,
          }),
        prices: (
          kind: 'plans' | 'addons',
          key: string,
          prices: z.input<typeof PricesSchema>,
          reason: string,
        ) =>
          call(
            `${platform}/catalogue/${kind}/${encodeURIComponent(key)}/prices`,
            ChangeResultSchema,
            {
              body: { prices, reason },
              auth: true,
            },
          ),
        archive: (kind: 'plans' | 'addons', key: string, reason: string) =>
          call(`${platform}/catalogue/${kind}/${encodeURIComponent(key)}/archive`, DoneSchema, {
            body: { reason },
            auth: true,
          }),
      },
      templates: {
        list: () => call(`${platform}/catalogue/templates`, TemplatesSchema, { auth: true }),
        get: (key: string, version: string) =>
          callWithEtag(
            `${platform}/catalogue/templates/${encodeURIComponent(key)}/${version}`,
            TemplateDetailSchema,
            { auth: true },
          ),
        createDraft: (
          key: string,
          body: { version: string; from_version: string; reason: string },
        ) =>
          call(
            `${platform}/catalogue/templates/${encodeURIComponent(key)}/drafts`,
            TemplateDetailSchema,
            { body, auth: true },
          ),
        update: (
          key: string,
          version: string,
          body: z.input<typeof TemplateDraftUpdateSchema>,
          ifMatch: string,
        ) =>
          callWithEtag(
            `${platform}/catalogue/templates/${encodeURIComponent(key)}/${version}`,
            TemplateDetailSchema,
            {
              method: 'PUT',
              body,
              auth: true,
              headers: { 'if-match': ifMatch },
            },
          ),
        publish: (key: string, version: string, reason: string) =>
          call(
            `${platform}/catalogue/templates/${encodeURIComponent(key)}/${version}/publish`,
            ChangeResultSchema,
            {
              body: { reason },
              auth: true,
            },
          ),
        deprecate: (key: string, version: string, reason: string) =>
          call(
            `${platform}/catalogue/templates/${encodeURIComponent(key)}/${version}/deprecate`,
            DoneSchema,
            {
              body: { reason },
              auth: true,
            },
          ),
        diff: (key: string, from: string, to: string) =>
          call(
            `${platform}/catalogue/templates/${encodeURIComponent(key)}/diff`,
            TemplateDiffSchema,
            {
              query: { from, to },
              auth: true,
            },
          ),
      },
      countryPacks: {
        list: () => call(`${platform}/catalogue/country-packs`, CountryPacksSchema, { auth: true }),
        get: (country: string, version: string) =>
          callWithEtag(
            `${platform}/catalogue/country-packs/${encodeURIComponent(country)}/${version}`,
            CountryPackDetailSchema,
            { auth: true },
          ),
        createDraft: (
          country: string,
          body: { version: string; from_version: string; reason: string },
        ) =>
          call(
            `${platform}/catalogue/country-packs/${encodeURIComponent(country)}/drafts`,
            CountryPackDetailSchema,
            { body, auth: true },
          ),
        update: (
          country: string,
          version: string,
          body: z.input<typeof CountryPackDraftUpdateSchema>,
          ifMatch: string,
        ) =>
          callWithEtag(
            `${platform}/catalogue/country-packs/${encodeURIComponent(country)}/${version}`,
            CountryPackDetailSchema,
            {
              method: 'PUT',
              body,
              auth: true,
              headers: { 'if-match': ifMatch },
            },
          ),
        publish: (country: string, version: string, reason: string) =>
          call(
            `${platform}/catalogue/country-packs/${encodeURIComponent(country)}/${version}/publish`,
            ChangeResultSchema,
            {
              body: { reason },
              auth: true,
            },
          ),
      },
      approvals: {
        list: (status?: Approval['status']) =>
          call(`${platform}/approvals`, ApprovalsSchema, { query: { status }, auth: true }),
        approve: (id: string, note?: string) =>
          call(`${platform}/approvals/${encodeURIComponent(id)}/approve`, DoneSchema, {
            body: { note },
            auth: true,
          }),
        reject: (id: string, note: string) =>
          call(`${platform}/approvals/${encodeURIComponent(id)}/reject`, DoneSchema, {
            body: { note },
            auth: true,
          }),
        cancel: (id: string) =>
          call(`${platform}/approvals/${encodeURIComponent(id)}/cancel`, DoneSchema, {
            body: {},
            auth: true,
          }),
      },
      audit: {
        list: (query: AuditFilter = {}) =>
          call(`${platform}/audit`, AuditPageSchema, { query, auth: true }),
        /** The CSV export (Owner and Auditor), as text. */
        exportCsv: async (query: AuditFilter = {}) =>
          (
            await exchange(
              `${platform}/audit/export`,
              { query, auth: true, headers: { accept: 'text/csv' } },
              (t) => t,
            )
          ).body,
      },
    },
  };
}

/** Filters of the platform audit log (all optional). */
export type AuditFilter = {
  limit?: string;
  cursor?: string;
  actor?: string;
  action?: string;
  target_type?: string;
  target_id?: string;
  from?: string;
  to?: string;
};

export type Sdk = ReturnType<typeof createSdk>;
