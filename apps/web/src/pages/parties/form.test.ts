import { PartyInputSchema, type PartyDetail } from '@erp/contracts';
import { describe, expect, it } from 'vitest';
import {
  blankAddress,
  blankContact,
  emptyParty,
  errorsOf,
  formOf,
  inputOf,
  isDirty,
  phonesOf,
  tabOf,
  validate,
} from './form';

const saved: PartyDetail = {
  id: '01a21996-f803-77ef-992a-68741e31ad9e',
  code: 'C-0042',
  kind: 'organization',
  name: 'Al-Noor Traders',
  other_name: null,
  status: 'active',
  archived_at: null,
  national_id: { value: '•••••-••••567-1', masked: true },
  ntn: '1234567-8',
  strn: null,
  email: 'sales@alnoor.pk',
  phone: '+92 42 3571 0000',
  mobile: null,
  whatsapp: null,
  website: null,
  tags: ['wholesale', 'lahore'],
  owner: { id: '01a21996-3e31-78ce-b27d-5cd1aa4fe427', name: 'Ayesha' },
  notes: null,
  roles: ['customer', 'supplier'],
  contacts: [
    {
      id: '01a21996-f803-77ef-992a-68741e31ad9f',
      name: 'Bilal Ahmed',
      position: 'Buyer',
      email: null,
      phone: null,
      mobile: '0300 1234567',
      is_primary: true,
      notes: null,
    },
  ],
  addresses: [
    {
      id: '01a21996-f807-7008-bfc8-7ae1be63eeb5',
      kind: 'billing',
      label: null,
      line1: '12 Mall Road',
      line2: null,
      city: 'Lahore',
      region: null,
      postal_code: null,
      country: 'PK',
      is_default: true,
    },
  ],
  customer: {
    customer_group: 'Wholesale',
    currency: 'PKR',
    payment_terms_days: 30,
    credit_limit: '250000.00',
    credit_hold: false,
    discount_pct: '7.50',
    sales_rep: null,
  },
  supplier: {
    supplier_group: null,
    currency: null,
    payment_terms_days: 15,
    lead_time_days: null,
    rating: 4,
    withholding_profile: null,
    bank_name: 'Standard Chartered',
    bank_account_title: null,
    bank_account_number: { value: '••••••••••••••••••••6702', masked: true },
  },
  created_at: '2026-11-27T00:00:00.000Z',
  created_by: null,
  updated_at: '2026-11-27T00:00:00.000Z',
  updated_by: null,
  version: 3,
};

describe('the party form', () => {
  it('starts a new party as an organization managed by its creator, and needs a name', () => {
    const me = '01a21996-3e31-78ce-b27d-5cd1aa4fe427';
    const form = emptyParty(me);
    expect(form).toMatchObject({ kind: 'organization', status: 'active', owner_membership_id: me });
    expect(validate(form)).toEqual({ name: 'Enter the name' });
    expect(validate({ ...form, name: 'Al-Noor Traders' })).toEqual({});
  });

  it('round-trips a saved party without sending its masked numbers back', () => {
    const form = formOf(saved);
    expect(isDirty(form, formOf(saved))).toBe(false);
    const input = PartyInputSchema.parse(inputOf(form));
    expect(input.national_id).toBeUndefined(); // kept by the API
    expect(input.supplier?.bank_account_number).toBeUndefined();
    expect(input).toMatchObject({
      code: 'C-0042',
      tags: ['wholesale', 'lahore'],
      owner_membership_id: saved.owner!.id,
      contacts: [{ id: saved.contacts[0]!.id, name: 'Bilal Ahmed', is_primary: true }],
      addresses: [{ id: saved.addresses[0]!.id, kind: 'billing', is_default: true }],
      customer: { payment_terms_days: 30, credit_limit: '250000.00', discount_pct: '7.50' },
      supplier: { payment_terms_days: 15, rating: 4 },
    });
  });

  it('sends a number the person changed, and null when they cleared it', () => {
    const form = formOf(saved);
    const changed = { ...form, national_id: '35202-7654321-9', national_id_changed: true };
    expect(isDirty(changed, form)).toBe(true);
    expect(PartyInputSchema.parse(inputOf(changed)).national_id).toBe('35202-7654321-9');
    const cleared = { ...form, national_id: '', national_id_changed: true };
    expect(PartyInputSchema.parse(inputOf(cleared)).national_id).toBeNull();
  });

  it('switching a role off sends null, and a person sends no contact persons', () => {
    const form = formOf(saved);
    const input = inputOf({
      ...form,
      kind: 'person',
      customer: { ...form.customer, enabled: false },
    });
    expect(input.customer).toBeNull();
    expect(input.contacts).toEqual([]);
  });

  it('finds the API’s errors before sending and names the tab that shows each', () => {
    const form = formOf(saved);
    const errors = validate({
      ...form,
      email: 'nope',
      customer: { ...form.customer, discount_pct: '150' },
      addresses: [...form.addresses, { ...blankAddress('PK'), line1: '' }],
      contacts: [...form.contacts, blankContact()],
    });
    expect(Object.keys(errors).sort()).toEqual([
      'addresses.1.line1',
      'contacts.1.name',
      'customer.discount_pct',
      'email',
    ]);
    expect(Object.keys(errors).map(tabOf).sort()).toEqual([
      'addresses',
      'contacts',
      'customer',
      'details',
    ]);
    expect(tabOf('supplier.bank_account_number')).toBe('supplier');
  });

  it('keeps the first message per field from an API problem', () => {
    expect(
      errorsOf([
        { field: 'code', message: 'Another party already uses this code' },
        { field: 'code', message: 'second' },
      ]),
    ).toEqual({ code: 'Another party already uses this code' });
  });

  it('gives the duplicate check every phone number that is filled in', () => {
    expect(phonesOf({ ...emptyParty(null), phone: ' 042 111 ', whatsapp: '0300 1' })).toEqual([
      '042 111',
      '0300 1',
    ]);
  });
});
