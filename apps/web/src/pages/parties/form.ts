import {
  PartyInputSchema,
  uuidv7,
  type AddressKind,
  type FieldError,
  type PartyDetail,
  type PartyInput,
  type PartyKind,
  type PartyStatus,
} from '@erp/contracts';

// The party record as the screen edits it: every field a string or a switch, so inputs stay
// controlled, turned into the API's input (PartyInputSchema) on save. Pure, so it is tested
// without a browser.

export type ContactForm = {
  key: string;
  id?: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  mobile: string;
  is_primary: boolean;
  notes: string;
};

export type AddressForm = {
  key: string;
  id?: string;
  kind: AddressKind;
  label: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

export type CustomerForm = {
  enabled: boolean;
  customer_group: string;
  currency: string;
  payment_terms_days: string;
  credit_limit: string;
  credit_hold: boolean;
  discount_pct: string;
  sales_rep_membership_id: string | null;
};

export type SupplierForm = {
  enabled: boolean;
  supplier_group: string;
  currency: string;
  payment_terms_days: string;
  lead_time_days: string;
  rating: string;
  withholding_profile: string;
  bank_name: string;
  bank_account_title: string;
  /** What is shown: the saved number (maybe masked) until the person types a new one. */
  bank_account_number: string;
  bank_account_changed: boolean;
};

export type PartyForm = {
  kind: PartyKind;
  name: string;
  other_name: string;
  code: string;
  status: PartyStatus;
  /** What is shown: the saved number (maybe masked) until the person types a new one. */
  national_id: string;
  national_id_changed: boolean;
  ntn: string;
  strn: string;
  email: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  website: string;
  /** Comma-separated, as typed. */
  tags: string;
  owner_membership_id: string | null;
  notes: string;
  contacts: ContactForm[];
  addresses: AddressForm[];
  customer: CustomerForm;
  supplier: SupplierForm;
};

export const TAB_KEYS = [
  'overview',
  'details',
  'contacts',
  'addresses',
  'customer',
  'supplier',
  'activity',
] as const;
export type TabKey = (typeof TAB_KEYS)[number];

const blankCustomer = (): CustomerForm => ({
  enabled: false,
  customer_group: '',
  currency: '',
  payment_terms_days: '',
  credit_limit: '',
  credit_hold: false,
  discount_pct: '',
  sales_rep_membership_id: null,
});

const blankSupplier = (): SupplierForm => ({
  enabled: false,
  supplier_group: '',
  currency: '',
  payment_terms_days: '',
  lead_time_days: '',
  rating: '',
  withholding_profile: '',
  bank_name: '',
  bank_account_title: '',
  bank_account_number: '',
  bank_account_changed: true,
});

export function blankContact(): ContactForm {
  return {
    key: uuidv7(),
    name: '',
    position: '',
    email: '',
    phone: '',
    mobile: '',
    is_primary: false,
    notes: '',
  };
}

export function blankAddress(country: string, kind: AddressKind = 'billing'): AddressForm {
  return {
    key: uuidv7(),
    kind,
    label: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postal_code: '',
    country,
    is_default: false,
  };
}

/** A new party: an organization managed by the person creating it. */
export function emptyParty(owner: string | null): PartyForm {
  return {
    kind: 'organization',
    name: '',
    other_name: '',
    code: '',
    status: 'active',
    national_id: '',
    national_id_changed: true,
    ntn: '',
    strn: '',
    email: '',
    phone: '',
    mobile: '',
    whatsapp: '',
    website: '',
    tags: '',
    owner_membership_id: owner,
    notes: '',
    contacts: [],
    addresses: [],
    customer: blankCustomer(),
    supplier: blankSupplier(),
  };
}

const s = (v: string | null | undefined) => v ?? '';
const n = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v));

/** The form for a saved party. */
export function formOf(p: PartyDetail): PartyForm {
  return {
    kind: p.kind,
    name: p.name,
    other_name: s(p.other_name),
    code: s(p.code),
    status: p.status,
    national_id: p.national_id?.value ?? '',
    national_id_changed: false,
    ntn: s(p.ntn),
    strn: s(p.strn),
    email: s(p.email),
    phone: s(p.phone),
    mobile: s(p.mobile),
    whatsapp: s(p.whatsapp),
    website: s(p.website),
    tags: p.tags.join(', '),
    owner_membership_id: p.owner?.id ?? null,
    notes: s(p.notes),
    contacts: p.contacts.map((c) => ({
      key: c.id,
      id: c.id,
      name: c.name,
      position: s(c.position),
      email: s(c.email),
      phone: s(c.phone),
      mobile: s(c.mobile),
      is_primary: c.is_primary,
      notes: s(c.notes),
    })),
    addresses: p.addresses.map((a) => ({
      key: a.id,
      id: a.id,
      kind: a.kind,
      label: s(a.label),
      line1: a.line1,
      line2: s(a.line2),
      city: s(a.city),
      region: s(a.region),
      postal_code: s(a.postal_code),
      country: a.country,
      is_default: a.is_default,
    })),
    customer: p.customer
      ? {
          enabled: true,
          customer_group: s(p.customer.customer_group),
          currency: s(p.customer.currency),
          payment_terms_days: n(p.customer.payment_terms_days),
          credit_limit: s(p.customer.credit_limit),
          credit_hold: p.customer.credit_hold,
          discount_pct: s(p.customer.discount_pct),
          sales_rep_membership_id: p.customer.sales_rep?.id ?? null,
        }
      : blankCustomer(),
    supplier: p.supplier
      ? {
          enabled: true,
          supplier_group: s(p.supplier.supplier_group),
          currency: s(p.supplier.currency),
          payment_terms_days: n(p.supplier.payment_terms_days),
          lead_time_days: n(p.supplier.lead_time_days),
          rating: n(p.supplier.rating),
          withholding_profile: s(p.supplier.withholding_profile),
          bank_name: s(p.supplier.bank_name),
          bank_account_title: s(p.supplier.bank_account_title),
          bank_account_number: p.supplier.bank_account_number?.value ?? '',
          bank_account_changed: false,
        }
      : blankSupplier(),
  };
}

/** A whole number as typed, or null when empty; anything else goes to the API to refuse. */
function count(v: string): number | null {
  const t = v.trim();
  return t === '' ? null : Number(t);
}

/**
 * The API input for the form. A sensitive number the person did not change is left out, so the
 * API keeps the stored one (they may only have seen it masked).
 */
export function inputOf(f: PartyForm): PartyInput {
  return {
    kind: f.kind,
    name: f.name,
    other_name: f.other_name,
    code: f.code,
    status: f.status,
    ...(f.national_id_changed ? { national_id: f.national_id } : {}),
    ntn: f.ntn,
    strn: f.strn,
    email: f.email,
    phone: f.phone,
    mobile: f.mobile,
    whatsapp: f.whatsapp,
    website: f.website,
    tags: f.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    owner_membership_id: f.owner_membership_id,
    notes: f.notes,
    contacts:
      f.kind === 'organization'
        ? f.contacts.map((c) => ({
            ...(c.id ? { id: c.id } : {}),
            name: c.name,
            position: c.position,
            email: c.email,
            phone: c.phone,
            mobile: c.mobile,
            is_primary: c.is_primary,
            notes: c.notes,
          }))
        : [],
    addresses: f.addresses.map((a) => ({
      ...(a.id ? { id: a.id } : {}),
      kind: a.kind,
      label: a.label,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      region: a.region,
      postal_code: a.postal_code,
      country: a.country,
      is_default: a.is_default,
    })),
    customer: f.customer.enabled
      ? {
          customer_group: f.customer.customer_group,
          currency: f.customer.currency,
          payment_terms_days: count(f.customer.payment_terms_days),
          credit_limit: f.customer.credit_limit,
          credit_hold: f.customer.credit_hold,
          discount_pct: f.customer.discount_pct,
          sales_rep_membership_id: f.customer.sales_rep_membership_id,
        }
      : null,
    supplier: f.supplier.enabled
      ? {
          supplier_group: f.supplier.supplier_group,
          currency: f.supplier.currency,
          payment_terms_days: count(f.supplier.payment_terms_days),
          lead_time_days: count(f.supplier.lead_time_days),
          rating: count(f.supplier.rating),
          withholding_profile: f.supplier.withholding_profile,
          bank_name: f.supplier.bank_name,
          bank_account_title: f.supplier.bank_account_title,
          ...(f.supplier.bank_account_changed
            ? { bank_account_number: f.supplier.bank_account_number }
            : {}),
        }
      : null,
  };
}

/** Field errors by path ("contacts.0.name"), the first message for each. */
export type Errors = Record<string, string>;

export function errorsOf(list: readonly Pick<FieldError, 'field' | 'message'>[]): Errors {
  const out: Errors = {};
  for (const e of list) out[e.field] ??= e.message;
  return out;
}

/** Checks the form with the API's own rules, before anything is sent. */
export function validate(f: PartyForm): Errors {
  const result = PartyInputSchema.safeParse(inputOf(f));
  return result.success
    ? {}
    : errorsOf(result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })));
}

/** The tab that shows a field, so the screen can open it when the field has an error. */
export function tabOf(field: string): TabKey {
  const head = field.split('.')[0] ?? '';
  if (head === 'contacts' || head === 'addresses' || head === 'customer' || head === 'supplier') {
    return head;
  }
  return 'details';
}

/** Whether the form differs from the saved record (or from an empty one). */
export function isDirty(f: PartyForm, saved: PartyForm): boolean {
  return JSON.stringify(inputOf(f)) !== JSON.stringify(inputOf(saved));
}

/** The phone numbers of the form, for the duplicate check. */
export function phonesOf(f: PartyForm): string[] {
  return [f.phone, f.mobile, f.whatsapp].map((p) => p.trim()).filter(Boolean);
}
