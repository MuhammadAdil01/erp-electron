import { z } from 'zod';
import { pageSchema } from './api';

// Parties (Part 06 §6.2.1, Part 11 §11.5): one shared record for every person or organization a
// company deals with, replacing the old build's "Business Partners". A party can hold several
// roles at once; customer and supplier come now, the industry roles (guest, guardian, allottee,
// patient) with their packs. Contact persons, addresses and the role profiles are saved with
// the party in one request, guarded by the party's version (If-Match, §11.9).

export const PARTY_KINDS = ['person', 'organization'] as const;
export type PartyKind = (typeof PARTY_KINDS)[number];

export const PARTY_STATUSES = ['active', 'inactive'] as const;
export type PartyStatus = (typeof PARTY_STATUSES)[number];

export const PARTY_ROLES = ['customer', 'supplier'] as const;
export type PartyRole = (typeof PARTY_ROLES)[number];

export const ADDRESS_KINDS = ['billing', 'shipping', 'office', 'home', 'other'] as const;
export type AddressKind = (typeof ADDRESS_KINDS)[number];

/** Fields compared to find a possible duplicate (§6.2.1: phone, e-mail, CNIC and name). */
export const DUPLICATE_REASONS = ['name', 'email', 'phone', 'national_id'] as const;
export type DuplicateReason = (typeof DUPLICATE_REASONS)[number];

/** Optional text: trimmed; empty means "none" and is sent and stored as null. */
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));
}

const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .nullish()
  .transform((v) => (v ? v.toLowerCase() : null))
  .pipe(z.email({ error: 'Enter a valid e-mail address' }).nullable());

/** A phone number as people write it: digits with an optional +, spaces, dashes, brackets. */
const optionalPhone = optionalText(30).refine((v) => v === null || /^\+?[0-9 ()-]{5,30}$/.test(v), {
  message: 'Enter a phone number with digits, spaces, dashes or a leading +',
});

const optionalCurrency = z
  .string()
  .trim()
  .toUpperCase()
  .nullish()
  .transform((v) => (v ? v : null))
  .pipe(
    z
      .string()
      .regex(/^[A-Z]{3}$/, 'Use a three-letter currency code, for example PKR')
      .nullable(),
  );

/** A decimal amount as a string, as money travels in this API (Part 11 §11.1, §11.11). */
function optionalDecimal(max: number) {
  return z
    .union([z.string().trim(), z.number()])
    .nullish()
    .transform((v) => (v === null || v === undefined || v === '' ? null : String(v)))
    .refine((v) => v === null || (/^\d{1,15}(\.\d{1,4})?$/.test(v) && Number(v) <= max), {
      message: `Enter a number from 0 to ${max}, with at most four decimals`,
    });
}

function optionalCount(min: number, max: number) {
  return z
    .number()
    .int()
    .min(min)
    .max(max)
    .nullish()
    .transform((v) => v ?? null);
}

const Uuid = z.uuid();
const optionalUuid = Uuid.nullish().transform((v) => v ?? null);

// ─────────────────────────────── what clients send ───────────────────────────────

export const PartyContactInputSchema = z.object({
  /** Present for a contact person that already exists; new ones have none. */
  id: Uuid.optional(),
  name: z.string().trim().min(1, 'Enter the name').max(120),
  position: optionalText(80),
  email: optionalEmail,
  phone: optionalPhone,
  mobile: optionalPhone,
  is_primary: z.boolean().default(false),
  notes: optionalText(500),
});
export type PartyContactInput = z.input<typeof PartyContactInputSchema>;

export const PartyAddressInputSchema = z.object({
  id: Uuid.optional(),
  kind: z.enum(ADDRESS_KINDS),
  label: optionalText(60),
  line1: z.string().trim().min(1, 'Enter the street address').max(200),
  line2: optionalText(200),
  city: optionalText(80),
  region: optionalText(80),
  postal_code: optionalText(20),
  /** ISO 3166-1 alpha-2, for example PK. */
  country: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'Use a two-letter country code, for example PK'),
  /** The address used for this kind unless a document says otherwise; one per kind. */
  is_default: z.boolean().default(false),
});
export type PartyAddressInput = z.input<typeof PartyAddressInputSchema>;

/** The customer role (§6.2.1 "Customer role"); accounts and dunning come with Finance. */
export const CustomerProfileInputSchema = z.object({
  customer_group: optionalText(60),
  currency: optionalCurrency,
  payment_terms_days: optionalCount(0, 365),
  credit_limit: optionalDecimal(999_999_999_999),
  credit_hold: z.boolean().default(false),
  discount_pct: optionalDecimal(100),
  sales_rep_membership_id: optionalUuid,
});
export type CustomerProfileInput = z.input<typeof CustomerProfileInputSchema>;

/** The supplier role (§6.2.1 "Supplier role"); payable accounts come with Finance. */
export const SupplierProfileInputSchema = z.object({
  supplier_group: optionalText(60),
  currency: optionalCurrency,
  payment_terms_days: optionalCount(0, 365),
  lead_time_days: optionalCount(0, 365),
  rating: optionalCount(1, 5),
  withholding_profile: optionalText(60),
  bank_name: optionalText(80),
  bank_account_title: optionalText(120),
  /**
   * Sensitive (Part 04 §4.9.4). Leave it out to keep the stored number (clients that only see
   * it masked never send it back); null removes it.
   */
  bank_account_number: z
    .string()
    .trim()
    .max(34)
    .regex(/^[A-Za-z0-9 -]*$/, 'Use letters, digits, spaces or dashes')
    .nullish()
    .transform((v) => (v === undefined ? undefined : v ? v.toUpperCase() : null)),
});
export type SupplierProfileInput = z.input<typeof SupplierProfileInputSchema>;

const PartyFields = z.object({
  kind: z.enum(PARTY_KINDS),
  name: z.string().trim().min(1, 'Enter the name').max(200),
  /** The name in another language or script, for example Urdu. */
  other_name: optionalText(200),
  /** The company's own reference, for example C-0042, kept in capitals; unique in the company. */
  code: optionalText(30)
    .refine((v) => v === null || /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(v), {
      message: 'Use letters, digits, dots, dashes or slashes',
    })
    .transform((v) => v?.toUpperCase() ?? null),
  status: z.enum(PARTY_STATUSES).default('active'),
  /**
   * CNIC or registration number, sensitive (Part 04 §4.9.4). Leave it out to keep the stored
   * number; null removes it.
   */
  national_id: z
    .string()
    .trim()
    .max(40)
    .regex(/^[A-Za-z0-9 -]*$/, 'Use letters, digits, spaces or dashes')
    .nullish()
    .transform((v) => (v === undefined ? undefined : v ? v.toUpperCase() : null)),
  /** National Tax Number and Sales Tax Registration Number (Pakistan pack). */
  ntn: optionalText(30),
  strn: optionalText(30),
  email: optionalEmail,
  phone: optionalPhone,
  mobile: optionalPhone,
  whatsapp: optionalPhone,
  website: optionalText(200),
  tags: z
    .array(z.string().trim().min(1).max(40))
    .max(20)
    .default([])
    .transform((tags) => [...new Set(tags)]),
  /** The account manager: a member of the company. */
  owner_membership_id: optionalUuid,
  notes: optionalText(4000),
  contacts: z.array(PartyContactInputSchema).max(50).default([]),
  addresses: z.array(PartyAddressInputSchema).max(20).default([]),
  /** null: not a customer. */
  customer: CustomerProfileInputSchema.nullish().transform((v) => v ?? null),
  /** null: not a supplier. */
  supplier: SupplierProfileInputSchema.nullish().transform((v) => v ?? null),
});

/** The rules that span fields: contact persons, primary contact, one default per address kind. */
function checkParty(party: z.output<typeof PartyFields>, ctx: z.RefinementCtx) {
  if (party.kind === 'person' && party.contacts.length > 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['contacts'],
      message: 'Contact persons belong to organizations; a person is contacted directly',
    });
  }
  if (party.contacts.filter((c) => c.is_primary).length > 1) {
    ctx.addIssue({
      code: 'custom',
      path: ['contacts'],
      message: 'Only one contact person can be the primary contact',
    });
  }
  for (const kind of ADDRESS_KINDS) {
    if (party.addresses.filter((a) => a.kind === kind && a.is_default).length > 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['addresses'],
        message: `Only one ${kind} address can be the default`,
      });
    }
  }
  for (const list of ['contacts', 'addresses'] as const) {
    const ids = party[list].map((row) => row.id).filter(Boolean);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: 'custom', path: [list], message: 'The same row is listed twice' });
    }
  }
}

/** POST /parties and PUT /parties/{id}: the whole record (PUT needs If-Match). */
export const PartyInputSchema = PartyFields.superRefine(checkParty);
export type PartyInput = z.input<typeof PartyInputSchema>;
export type PartyInputParsed = z.output<typeof PartyInputSchema>;

/** GET /parties: search and filters (§11.9), cursor pagination. */
export const PartyListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  role: z.enum(PARTY_ROLES).optional(),
  kind: z.enum(PARTY_KINDS).optional(),
  status: z.enum(PARTY_STATUSES).optional(),
  /** true: only archived parties; otherwise archived ones are left out. */
  archived: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  tag: z.string().trim().min(1).max(40).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().min(1).optional(),
});
export type PartyListQuery = z.input<typeof PartyListQuerySchema>;

/** POST /parties/duplicates: what a new or changed record would look like. */
export const PartyDuplicateQuerySchema = z.object({
  name: optionalText(200),
  email: optionalText(254).transform((v) => (v ? v.toLowerCase() : null)),
  phones: z.array(z.string().trim().max(30)).max(10).default([]),
  national_id: optionalText(40),
  /** The record being edited, so it is not reported as its own duplicate. */
  exclude_id: optionalUuid,
});
export type PartyDuplicateQuery = z.input<typeof PartyDuplicateQuerySchema>;

/** POST /parties/{id}/archive and /restore. */
export const PartyArchiveRequestSchema = z.object({
  reason: optionalText(500),
});

// ─────────────────────────────── what the API returns ───────────────────────────────

const MemberRefSchema = z.object({ id: z.string(), name: z.string() });
export type MemberRef = z.infer<typeof MemberRefSchema>;

/** A sensitive value: the value itself, or a mask when the caller may not see it. */
export const SensitiveValueSchema = z.object({
  value: z.string(),
  masked: z.boolean(),
});
export type SensitiveValue = z.infer<typeof SensitiveValueSchema>;

export const PartyContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  mobile: z.string().nullable(),
  is_primary: z.boolean(),
  notes: z.string().nullable(),
});
export type PartyContact = z.infer<typeof PartyContactSchema>;

export const PartyAddressSchema = z.object({
  id: z.string(),
  kind: z.enum(ADDRESS_KINDS),
  label: z.string().nullable(),
  line1: z.string(),
  line2: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  postal_code: z.string().nullable(),
  country: z.string(),
  is_default: z.boolean(),
});
export type PartyAddress = z.infer<typeof PartyAddressSchema>;

export const CustomerProfileSchema = z.object({
  customer_group: z.string().nullable(),
  currency: z.string().nullable(),
  payment_terms_days: z.number().int().nullable(),
  credit_limit: z.string().nullable(),
  credit_hold: z.boolean(),
  discount_pct: z.string().nullable(),
  sales_rep: MemberRefSchema.nullable(),
});
export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;

export const SupplierProfileSchema = z.object({
  supplier_group: z.string().nullable(),
  currency: z.string().nullable(),
  payment_terms_days: z.number().int().nullable(),
  lead_time_days: z.number().int().nullable(),
  rating: z.number().int().nullable(),
  withholding_profile: z.string().nullable(),
  bank_name: z.string().nullable(),
  bank_account_title: z.string().nullable(),
  bank_account_number: SensitiveValueSchema.nullable(),
});
export type SupplierProfile = z.infer<typeof SupplierProfileSchema>;

/** A row of the parties list. */
export const PartySummarySchema = z.object({
  id: z.string(),
  code: z.string().nullable(),
  kind: z.enum(PARTY_KINDS),
  name: z.string(),
  other_name: z.string().nullable(),
  status: z.enum(PARTY_STATUSES),
  archived: z.boolean(),
  roles: z.array(z.enum(PARTY_ROLES)),
  email: z.string().nullable(),
  /** The first of phone, mobile and WhatsApp that is set. */
  phone: z.string().nullable(),
  /** City of the default billing address, or of the first address. */
  city: z.string().nullable(),
  tags: z.array(z.string()),
  owner: MemberRefSchema.nullable(),
  updated_at: z.string(),
});
export type PartySummary = z.infer<typeof PartySummarySchema>;

export const PartyPageSchema = pageSchema(PartySummarySchema);
export type PartyPage = z.infer<typeof PartyPageSchema>;

/** GET /parties/{id}: the whole record. The ETag header carries `version`. */
export const PartyDetailSchema = z.object({
  id: z.string(),
  code: z.string().nullable(),
  kind: z.enum(PARTY_KINDS),
  name: z.string(),
  other_name: z.string().nullable(),
  status: z.enum(PARTY_STATUSES),
  archived_at: z.string().nullable(),
  national_id: SensitiveValueSchema.nullable(),
  ntn: z.string().nullable(),
  strn: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  mobile: z.string().nullable(),
  whatsapp: z.string().nullable(),
  website: z.string().nullable(),
  tags: z.array(z.string()),
  owner: MemberRefSchema.nullable(),
  notes: z.string().nullable(),
  roles: z.array(z.enum(PARTY_ROLES)),
  contacts: z.array(PartyContactSchema),
  addresses: z.array(PartyAddressSchema),
  customer: CustomerProfileSchema.nullable(),
  supplier: SupplierProfileSchema.nullable(),
  created_at: z.string(),
  created_by: MemberRefSchema.nullable(),
  updated_at: z.string(),
  updated_by: MemberRefSchema.nullable(),
  version: z.number().int(),
});
export type PartyDetail = z.infer<typeof PartyDetailSchema>;

export const PartyDuplicatesSchema = z.object({
  data: z.array(PartySummarySchema.extend({ reasons: z.array(z.enum(DUPLICATE_REASONS)).min(1) })),
});
export type PartyDuplicates = z.infer<typeof PartyDuplicatesSchema>;

/** GET /parties/{id}/activity: the record's history, newest first (Part 06 §6.2 core.activity). */
export const PartyActivitySchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      at: z.string(),
      action: z.enum(['created', 'updated', 'archived', 'restored']),
      actor: MemberRefSchema.nullable(),
      /** Top-level fields whose value changed; sensitive ones are named, never shown. */
      fields: z.array(z.string()),
      reason: z.string().nullable(),
    }),
  ),
});
export type PartyActivity = z.infer<typeof PartyActivitySchema>;

/** GET /parties/account-managers: members who can be named account manager or sales rep. */
export const PartyMembersSchema = z.object({ data: z.array(MemberRefSchema) });
export type PartyMembers = z.infer<typeof PartyMembersSchema>;

/** The masked form of a sensitive value: every letter and digit but the last four hidden. */
export function maskSensitive(value: string, keep = 4): string {
  const positions = [...value].flatMap((ch, i) => (/[A-Za-z0-9]/.test(ch) ? [i] : []));
  const shown = new Set(positions.slice(-keep));
  return [...value].map((ch, i) => (/[A-Za-z0-9]/.test(ch) && !shown.has(i) ? '•' : ch)).join('');
}
