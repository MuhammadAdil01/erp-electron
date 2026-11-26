import { describe, expect, it } from 'vitest';
import {
  maskSensitive,
  PartyDuplicateQuerySchema,
  PartyInputSchema,
  PartyListQuerySchema,
} from './parties';

const messages = (input: unknown) => {
  const result = PartyInputSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

describe('PartyInputSchema', () => {
  it('fills defaults and turns empty text into null', () => {
    const party = PartyInputSchema.parse({
      kind: 'organization',
      name: '  Al-Noor Traders ',
      email: ' Sales@AlNoor.PK ',
      phone: '',
      tags: ['wholesale', 'wholesale', 'lahore'],
    });
    expect(party).toMatchObject({
      name: 'Al-Noor Traders',
      status: 'active',
      email: 'sales@alnoor.pk',
      phone: null,
      tags: ['wholesale', 'lahore'],
      contacts: [],
      addresses: [],
      customer: null,
      supplier: null,
    });
    // Left out: the stored national ID is kept. null: it is removed.
    expect(party.national_id).toBeUndefined();
    expect(PartyInputSchema.parse({ kind: 'person', name: 'A', national_id: '' }).national_id).toBe(
      null,
    );
  });

  it('keeps money as decimal strings and checks their range', () => {
    const party = PartyInputSchema.parse({
      kind: 'organization',
      name: 'Buyer',
      customer: { credit_limit: 250000, discount_pct: '7.5', currency: 'pkr' },
    });
    expect(party.customer).toMatchObject({
      credit_limit: '250000',
      discount_pct: '7.5',
      currency: 'PKR',
      credit_hold: false,
    });
    expect(messages({ kind: 'person', name: 'A', customer: { discount_pct: '120' } })).toEqual([
      'customer.discount_pct: Enter a number from 0 to 100, with at most four decimals',
    ]);
    expect(messages({ kind: 'person', name: 'A', customer: { credit_limit: '-5' } })).toHaveLength(
      1,
    );
  });

  it('refuses contact persons on a person, two primary contacts and two defaults of a kind', () => {
    expect(messages({ kind: 'person', name: 'A', contacts: [{ name: 'B' }] })).toEqual([
      'contacts: Contact persons belong to organizations; a person is contacted directly',
    ]);
    expect(
      messages({
        kind: 'organization',
        name: 'A',
        contacts: [
          { name: 'B', is_primary: true },
          { name: 'C', is_primary: true },
        ],
      }),
    ).toEqual(['contacts: Only one contact person can be the primary contact']);
    const address = { kind: 'billing', line1: 'Main Boulevard', country: 'pk', is_default: true };
    expect(messages({ kind: 'organization', name: 'A', addresses: [address, address] })).toEqual([
      'addresses: Only one billing address can be the default',
    ]);
  });

  it('checks codes, countries, e-mails and phone numbers', () => {
    expect(
      messages({
        kind: 'organization',
        name: 'A',
        code: 'C 01',
        email: 'not-an-email',
        phone: 'call me',
        addresses: [{ kind: 'office', line1: 'X', country: 'Pakistan' }],
      }).map((m) => m.split(':')[0]),
    ).toEqual(['code', 'email', 'phone', 'addresses.0.country']);
  });
});

describe('PartyListQuerySchema', () => {
  it('reads filters from the query string', () => {
    expect(PartyListQuerySchema.parse({ role: 'customer', archived: 'true', limit: '20' })).toEqual(
      {
        role: 'customer',
        archived: true,
        limit: 20,
      },
    );
    expect(PartyListQuerySchema.parse({}).archived).toBe(false);
    expect(PartyListQuerySchema.safeParse({ role: 'guest' }).success).toBe(false);
  });
});

describe('PartyDuplicateQuerySchema', () => {
  it('lower-cases the e-mail and accepts several phones', () => {
    expect(
      PartyDuplicateQuerySchema.parse({ email: 'A@B.PK', phones: ['0300 1234567'] }),
    ).toMatchObject({ email: 'a@b.pk', phones: ['0300 1234567'], name: null });
  });
});

describe('maskSensitive', () => {
  it('hides every letter and digit but the last four, keeping separators', () => {
    expect(maskSensitive('35202-1234567-1')).toBe('•••••-••••567-1');
    expect(maskSensitive('PK36SCBL0000001123456702')).toBe('••••••••••••••••••••6702');
    expect(maskSensitive('123')).toBe('123');
  });
});
