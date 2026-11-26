import {
  ADDRESS_KINDS,
  PARTY_KINDS,
  PARTY_STATUSES,
  type PartyAddress,
  type PartyDetail,
  type PartyMembers,
} from '@erp/contracts';
import {
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  Combobox,
  EmptyState,
  Input,
  Select,
  Skeleton,
  Switch,
  Textarea,
} from '@erp/ui';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { errorMessage, sdk } from '../../auth';
import {
  blankAddress,
  blankContact,
  type AddressForm,
  type ContactForm,
  type CustomerForm,
  type Errors,
  type PartyForm,
  type SupplierForm,
} from './form';
import { RoleBadges } from './PartiesPage';

// The tabs of the party record (Part 06 §6.2.1, Part 12 §12.3 "Master record"): Overview,
// Details, Contact persons, Addresses, Customer, Supplier and Activity.

export type SectionProps = {
  form: PartyForm;
  set: (patch: Partial<PartyForm>) => void;
  errors: Errors;
  disabled: boolean;
};

const grid = 'grid gap-4 md:grid-cols-2';

/** An input bound to one text field of a record. */
function Text({
  label,
  value,
  onChange,
  error,
  hint,
  disabled,
  type,
  inputMode,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  disabled: boolean;
  type?: string;
  inputMode?: 'numeric' | 'decimal' | 'tel' | 'email';
  required?: boolean;
}) {
  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      hint={hint}
      disabled={disabled}
      type={type}
      inputMode={inputMode}
      required={required}
    />
  );
}

/**
 * A sensitive number (CNIC, bank account): shown as saved, perhaps masked, until the person
 * chooses to change it; then an empty field. Left alone, the API keeps the stored number.
 */
function SensitiveField({
  label,
  hint,
  value,
  changed,
  onChange,
  onEdit,
  error,
  disabled,
}: {
  label: string;
  hint: string;
  value: string;
  changed: boolean;
  onChange: (value: string) => void;
  onEdit: () => void;
  error?: string;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  if (changed) {
    return (
      <Text
        label={label}
        hint={hint}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
      />
    );
  }
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Input label={label} hint={hint} value={value || t('parties.none')} readOnly disabled />
      </div>
      {!disabled && (
        <Button variant="secondary" onClick={onEdit}>
          {t('parties.field.change')}
        </Button>
      )}
    </div>
  );
}

/** Choose a member (account manager, sales rep), or nobody. */
function MemberPicker({
  label,
  value,
  onChange,
  members,
  disabled,
  current,
  error,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  members: PartyMembers['data'] | undefined;
  disabled: boolean;
  /** The saved member, shown even when no longer in the list. */
  current: { id: string; name: string } | null | undefined;
  error?: string;
}) {
  const { t } = useTranslation();
  const options = [
    { value: '', label: t('parties.nobody') },
    ...(members ?? []).map((m) => ({ value: m.id, label: m.name })),
  ];
  if (current && !options.some((o) => o.value === current.id)) {
    options.push({ value: current.id, label: current.name });
  }
  if (disabled) {
    const name = options.find((o) => o.value === (value ?? ''))?.label ?? t('parties.nobody');
    return <Input label={label} value={name} readOnly disabled />;
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Combobox
        label={label}
        options={options}
        value={value ?? ''}
        onChange={(v) => onChange(v || null)}
        placeholder={t('parties.choose_member')}
        emptyLabel={t('parties.no_members')}
      />
      {error && <p className="m-0 text-sm text-danger">{error}</p>}
    </div>
  );
}

export function DetailsSection({
  form,
  set,
  errors,
  disabled,
  members,
  saved,
}: SectionProps & { members: PartyMembers['data'] | undefined; saved: PartyDetail | null }) {
  const { t } = useTranslation();
  const f = (key: string) => t(`parties.field.${key}`);
  const text = (key: keyof PartyForm & string, extra: { hint?: string; type?: string } = {}) => (
    <Text
      label={f(key)}
      value={form[key] as string}
      onChange={(v) => set({ [key]: v } as Partial<PartyForm>)}
      error={errors[key]}
      disabled={disabled}
      {...extra}
    />
  );
  return (
    <Card>
      <div className={grid}>
        <Select
          label={f('kind')}
          value={form.kind}
          onValueChange={(v) => set({ kind: v as PartyForm['kind'] })}
          options={PARTY_KINDS.map((k) => ({ value: k, label: t(`parties.kind.${k}`) }))}
          disabled={disabled}
        />
        <Select
          label={f('status')}
          value={form.status}
          onValueChange={(v) => set({ status: v as PartyForm['status'] })}
          options={PARTY_STATUSES.map((s) => ({ value: s, label: t(`parties.status.${s}`) }))}
          disabled={disabled}
        />
        <Text
          label={f('name')}
          value={form.name}
          onChange={(name) => set({ name })}
          error={errors.name}
          disabled={disabled}
          required
        />
        {text('other_name', { hint: f('other_name_hint') })}
        {text('code', { hint: f('code_hint') })}
        <MemberPicker
          label={f('owner')}
          value={form.owner_membership_id}
          onChange={(owner_membership_id) => set({ owner_membership_id })}
          members={members}
          disabled={disabled}
          current={saved?.owner}
          error={errors.owner_membership_id}
        />
        <SensitiveField
          label={f('national_id')}
          hint={f('national_id_hint')}
          value={form.national_id}
          changed={form.national_id_changed}
          onChange={(national_id) => set({ national_id })}
          onEdit={() => set({ national_id: '', national_id_changed: true })}
          error={errors.national_id}
          disabled={disabled}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {text('ntn')}
          {text('strn')}
        </div>
        {text('email', { type: 'email' })}
        {text('website')}
        {text('phone', { type: 'tel' })}
        {text('mobile', { type: 'tel' })}
        {text('whatsapp', { type: 'tel' })}
        {text('tags', { hint: f('tags_hint') })}
      </div>
      <div className="mt-4">
        <Textarea
          label={f('notes')}
          value={form.notes}
          onChange={(e) => set({ notes: e.target.value })}
          error={errors.notes}
          disabled={disabled}
        />
      </div>
    </Card>
  );
}

function RowCard({
  title,
  onRemove,
  disabled,
  children,
}: {
  title: ReactNode;
  onRemove: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <Card
      title={title}
      actions={
        !disabled && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 aria-hidden className="size-4" />
            {t('parties.remove')}
          </Button>
        )
      }
    >
      {children}
    </Card>
  );
}

export function ContactsSection({ form, set, errors, disabled }: SectionProps) {
  const { t } = useTranslation();
  const f = (key: string) => t(`parties.field.${key}`);
  const update = (i: number, patch: Partial<ContactForm>) =>
    set({
      contacts: form.contacts.map((c, j) =>
        j === i
          ? { ...c, ...patch }
          : patch.is_primary
            ? { ...c, is_primary: false } // one primary contact
            : c,
      ),
    });
  return (
    <div className="flex flex-col gap-4">
      {errors.contacts && <Banner tone="error">{errors.contacts}</Banner>}
      {form.contacts.length === 0 && <EmptyState title={t('parties.no_contacts')} />}
      {form.contacts.map((c, i) => {
        const e = (key: string) => errors[`contacts.${i}.${key}`];
        return (
          <RowCard
            key={c.key}
            title={c.name || t('parties.add_contact')}
            disabled={disabled}
            onRemove={() => set({ contacts: form.contacts.filter((_, j) => j !== i) })}
          >
            <div className={grid}>
              <Text
                label={f('name')}
                value={c.name}
                onChange={(name) => update(i, { name })}
                error={e('name')}
                disabled={disabled}
                required
              />
              <Text
                label={f('position')}
                value={c.position}
                onChange={(position) => update(i, { position })}
                error={e('position')}
                disabled={disabled}
              />
              <Text
                label={f('email')}
                type="email"
                value={c.email}
                onChange={(email) => update(i, { email })}
                error={e('email')}
                disabled={disabled}
              />
              <Text
                label={f('phone')}
                type="tel"
                value={c.phone}
                onChange={(phone) => update(i, { phone })}
                error={e('phone')}
                disabled={disabled}
              />
              <Text
                label={f('mobile')}
                type="tel"
                value={c.mobile}
                onChange={(mobile) => update(i, { mobile })}
                error={e('mobile')}
                disabled={disabled}
              />
              <div className="flex items-end pb-2">
                <Checkbox
                  label={f('primary')}
                  checked={c.is_primary}
                  onCheckedChange={(is_primary) => update(i, { is_primary })}
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="mt-4">
              <Textarea
                label={f('notes')}
                value={c.notes}
                onChange={(ev) => update(i, { notes: ev.target.value })}
                disabled={disabled}
              />
            </div>
          </RowCard>
        );
      })}
      {!disabled && (
        <div>
          <Button
            variant="secondary"
            onClick={() => set({ contacts: [...form.contacts, blankContact()] })}
          >
            <Plus aria-hidden className="size-4" />
            {t('parties.add_contact')}
          </Button>
        </div>
      )}
    </div>
  );
}

export function AddressesSection({
  form,
  set,
  errors,
  disabled,
  country,
}: SectionProps & { country: string }) {
  const { t } = useTranslation();
  const f = (key: string) => t(`parties.field.${key}`);
  const update = (i: number, patch: Partial<AddressForm>) =>
    set({
      addresses: form.addresses.map((a, j) => {
        if (j === i) return { ...a, ...patch };
        const kind = patch.kind ?? form.addresses[i]!.kind;
        const makesDefault = patch.is_default ?? (patch.kind && form.addresses[i]!.is_default);
        // One default address per kind.
        return makesDefault && a.kind === kind ? { ...a, is_default: false } : a;
      }),
    });
  return (
    <div className="flex flex-col gap-4">
      {errors.addresses && <Banner tone="error">{errors.addresses}</Banner>}
      {form.addresses.length === 0 && <EmptyState title={t('parties.no_addresses')} />}
      {form.addresses.map((a, i) => {
        const e = (key: string) => errors[`addresses.${i}.${key}`];
        return (
          <RowCard
            key={a.key}
            title={a.label || t(`parties.address_kind.${a.kind}`)}
            disabled={disabled}
            onRemove={() => set({ addresses: form.addresses.filter((_, j) => j !== i) })}
          >
            <div className={grid}>
              <Select
                label={f('address_kind')}
                value={a.kind}
                onValueChange={(kind) => update(i, { kind: kind as AddressForm['kind'] })}
                options={ADDRESS_KINDS.map((k) => ({
                  value: k,
                  label: t(`parties.address_kind.${k}`),
                }))}
                disabled={disabled}
              />
              <Text
                label={f('label')}
                value={a.label}
                onChange={(label) => update(i, { label })}
                error={e('label')}
                disabled={disabled}
              />
              <Text
                label={f('line1')}
                value={a.line1}
                onChange={(line1) => update(i, { line1 })}
                error={e('line1')}
                disabled={disabled}
                required
              />
              <Text
                label={f('line2')}
                value={a.line2}
                onChange={(line2) => update(i, { line2 })}
                error={e('line2')}
                disabled={disabled}
              />
              <Text
                label={f('city')}
                value={a.city}
                onChange={(city) => update(i, { city })}
                error={e('city')}
                disabled={disabled}
              />
              <Text
                label={f('region')}
                value={a.region}
                onChange={(region) => update(i, { region })}
                error={e('region')}
                disabled={disabled}
              />
              <Text
                label={f('postal_code')}
                value={a.postal_code}
                onChange={(postal_code) => update(i, { postal_code })}
                error={e('postal_code')}
                disabled={disabled}
              />
              <Text
                label={f('country')}
                hint={f('country_hint')}
                value={a.country}
                onChange={(value) => update(i, { country: value.toUpperCase() })}
                error={e('country')}
                disabled={disabled}
                required
              />
              <div className="flex items-end pb-2">
                <Checkbox
                  label={f('default')}
                  checked={a.is_default}
                  onCheckedChange={(is_default) => update(i, { is_default })}
                  disabled={disabled}
                />
              </div>
            </div>
          </RowCard>
        );
      })}
      {!disabled && (
        <div>
          <Button
            variant="secondary"
            onClick={() =>
              set({
                addresses: [
                  ...form.addresses,
                  blankAddress(
                    country,
                    form.addresses.some((a) => a.kind === 'billing') ? 'shipping' : 'billing',
                  ),
                ],
              })
            }
          >
            <Plus aria-hidden className="size-4" />
            {t('parties.add_address')}
          </Button>
        </div>
      )}
    </div>
  );
}

export function CustomerSection({
  form,
  set,
  errors,
  disabled,
  members,
  saved,
}: SectionProps & { members: PartyMembers['data'] | undefined; saved: PartyDetail | null }) {
  const { t } = useTranslation();
  const f = (key: string) => t(`parties.field.${key}`);
  const c = form.customer;
  const update = (patch: Partial<CustomerForm>) => set({ customer: { ...c, ...patch } });
  const e = (key: string) => errors[`customer.${key}`];
  return (
    <Card>
      <div className="mb-4">
        <Switch
          label={t('parties.is_customer')}
          checked={c.enabled}
          onCheckedChange={(enabled) => update({ enabled })}
          disabled={disabled}
        />
      </div>
      {!c.enabled ? (
        <p className="m-0 text-sm text-muted">{t('parties.customer_off')}</p>
      ) : (
        <div className={grid}>
          <Text
            label={f('customer_group')}
            value={c.customer_group}
            onChange={(customer_group) => update({ customer_group })}
            error={e('customer_group')}
            disabled={disabled}
          />
          <MemberPicker
            label={f('sales_rep')}
            value={c.sales_rep_membership_id}
            onChange={(sales_rep_membership_id) => update({ sales_rep_membership_id })}
            members={members}
            disabled={disabled}
            current={saved?.customer?.sales_rep}
            error={e('sales_rep_membership_id')}
          />
          <Text
            label={f('currency')}
            hint={f('currency_hint')}
            value={c.currency}
            onChange={(currency) => update({ currency: currency.toUpperCase() })}
            error={e('currency')}
            disabled={disabled}
          />
          <Text
            label={f('payment_terms')}
            inputMode="numeric"
            value={c.payment_terms_days}
            onChange={(payment_terms_days) => update({ payment_terms_days })}
            error={e('payment_terms_days')}
            disabled={disabled}
          />
          <Text
            label={f('credit_limit')}
            inputMode="decimal"
            value={c.credit_limit}
            onChange={(credit_limit) => update({ credit_limit })}
            error={e('credit_limit')}
            disabled={disabled}
          />
          <Text
            label={f('discount')}
            inputMode="decimal"
            value={c.discount_pct}
            onChange={(discount_pct) => update({ discount_pct })}
            error={e('discount_pct')}
            disabled={disabled}
          />
          <div className="flex items-end pb-2">
            <Switch
              label={f('credit_hold')}
              checked={c.credit_hold}
              onCheckedChange={(credit_hold) => update({ credit_hold })}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

export function SupplierSection({ form, set, errors, disabled }: SectionProps) {
  const { t } = useTranslation();
  const f = (key: string) => t(`parties.field.${key}`);
  const s = form.supplier;
  const update = (patch: Partial<SupplierForm>) => set({ supplier: { ...s, ...patch } });
  const e = (key: string) => errors[`supplier.${key}`];
  return (
    <Card>
      <div className="mb-4">
        <Switch
          label={t('parties.is_supplier')}
          checked={s.enabled}
          onCheckedChange={(enabled) => update({ enabled })}
          disabled={disabled}
        />
      </div>
      {!s.enabled ? (
        <p className="m-0 text-sm text-muted">{t('parties.supplier_off')}</p>
      ) : (
        <div className={grid}>
          <Text
            label={f('supplier_group')}
            value={s.supplier_group}
            onChange={(supplier_group) => update({ supplier_group })}
            error={e('supplier_group')}
            disabled={disabled}
          />
          <Select
            label={f('rating')}
            value={s.rating || 'none'}
            onValueChange={(v) => update({ rating: v === 'none' ? '' : v })}
            options={[
              { value: 'none', label: t('parties.none') },
              ...['1', '2', '3', '4', '5'].map((r) => ({ value: r, label: '★'.repeat(Number(r)) })),
            ]}
            disabled={disabled}
          />
          <Text
            label={f('currency')}
            hint={f('currency_hint')}
            value={s.currency}
            onChange={(currency) => update({ currency: currency.toUpperCase() })}
            error={e('currency')}
            disabled={disabled}
          />
          <Text
            label={f('payment_terms')}
            inputMode="numeric"
            value={s.payment_terms_days}
            onChange={(payment_terms_days) => update({ payment_terms_days })}
            error={e('payment_terms_days')}
            disabled={disabled}
          />
          <Text
            label={f('lead_time')}
            inputMode="numeric"
            value={s.lead_time_days}
            onChange={(lead_time_days) => update({ lead_time_days })}
            error={e('lead_time_days')}
            disabled={disabled}
          />
          <Text
            label={f('withholding')}
            value={s.withholding_profile}
            onChange={(withholding_profile) => update({ withholding_profile })}
            error={e('withholding_profile')}
            disabled={disabled}
          />
          <Text
            label={f('bank_name')}
            value={s.bank_name}
            onChange={(bank_name) => update({ bank_name })}
            error={e('bank_name')}
            disabled={disabled}
          />
          <Text
            label={f('bank_title')}
            value={s.bank_account_title}
            onChange={(bank_account_title) => update({ bank_account_title })}
            error={e('bank_account_title')}
            disabled={disabled}
          />
          <SensitiveField
            label={f('bank_number')}
            hint={f('bank_hint')}
            value={s.bank_account_number}
            changed={s.bank_account_changed}
            onChange={(bank_account_number) => update({ bank_account_number })}
            onEdit={() => update({ bank_account_number: '', bank_account_changed: true })}
            error={e('bank_account_number')}
            disabled={disabled}
          />
        </div>
      )}
    </Card>
  );
}

function formatAddress(a: PartyAddress): string {
  return [a.line1, a.line2, a.city, a.region, a.postal_code, a.country].filter(Boolean).join(', ');
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium tracking-wide text-muted uppercase">{label}</dt>
      <dd className="m-0 text-sm text-fg">{children}</dd>
    </div>
  );
}

/** The 360 overview (§6.2.1): the record's own facts; other modules add theirs later. */
export function OverviewSection({ party }: { party: PartyDetail }) {
  const { t } = useTranslation();
  const when = (iso: string) => new Date(iso).toLocaleString();
  const primary = party.contacts.find((c) => c.is_primary) ?? party.contacts[0];
  const address =
    party.addresses.find((a) => a.kind === 'billing' && a.is_default) ??
    party.addresses.find((a) => a.is_default) ??
    party.addresses[0];
  const reach = (x: { email: string | null; phone: string | null; mobile?: string | null }) =>
    [x.phone, x.mobile, x.email].filter(Boolean).join(' · ');
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title={t('parties.overview.profile')}>
        <dl className="m-0 flex flex-col gap-3">
          <Fact label={t('parties.overview.roles')}>
            {party.roles.length ? (
              <RoleBadges roles={party.roles} />
            ) : (
              t('parties.overview.no_roles')
            )}
          </Fact>
          <Fact label={t('parties.field.kind')}>{t(`parties.kind.${party.kind}`)}</Fact>
          <Fact label={t('parties.overview.owner')}>
            {party.owner?.name ?? t('parties.nobody')}
          </Fact>
          {party.tags.length > 0 && (
            <Fact label={t('parties.field.tags')}>
              <span className="flex flex-wrap gap-1">
                {party.tags.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </span>
            </Fact>
          )}
        </dl>
      </Card>
      <Card title={t('parties.overview.reach')}>
        <dl className="m-0 flex flex-col gap-3">
          <Fact label={t('parties.overview.direct')}>{reach(party) || t('parties.none')}</Fact>
          {party.kind === 'organization' && (
            <Fact label={t('parties.overview.primary_contact')}>
              {primary
                ? [primary.name, primary.position, reach(primary)].filter(Boolean).join(' · ')
                : t('parties.none')}
            </Fact>
          )}
          <Fact label={t('parties.overview.address')}>
            {address ? formatAddress(address) : t('parties.none')}
          </Fact>
          <Fact label={t('parties.overview.counts')}>
            {[
              t('parties.overview.contacts', { count: party.contacts.length }),
              t('parties.overview.addresses', { count: party.addresses.length }),
            ].join(', ')}
          </Fact>
        </dl>
      </Card>
      <Card title={t('parties.overview.terms')}>
        <dl className="m-0 flex flex-col gap-3">
          {party.customer && (
            <Fact label={t('parties.role.customer')}>
              {[
                party.customer.credit_limit &&
                  t('parties.overview.credit', {
                    amount: party.customer.credit_limit,
                    currency: party.customer.currency ?? '',
                  }).trim(),
                party.customer.payment_terms_days !== null &&
                  t('parties.overview.days', { days: party.customer.payment_terms_days }),
                party.customer.credit_hold && t('parties.field.credit_hold'),
              ]
                .filter(Boolean)
                .join(' · ') || t('parties.none')}
            </Fact>
          )}
          {party.supplier && (
            <Fact label={t('parties.role.supplier')}>
              {[
                party.supplier.payment_terms_days !== null &&
                  t('parties.overview.days', { days: party.supplier.payment_terms_days }),
                party.supplier.lead_time_days !== null &&
                  t('parties.overview.lead', { days: party.supplier.lead_time_days }),
                party.supplier.rating && '★'.repeat(party.supplier.rating),
                party.supplier.bank_name,
              ]
                .filter(Boolean)
                .join(' · ') || t('parties.none')}
            </Fact>
          )}
          {!party.customer && !party.supplier && (
            <p className="m-0 text-sm text-muted">{t('parties.overview.no_terms')}</p>
          )}
          <Fact label={t('parties.overview.history')}>
            {t('parties.overview.created', {
              when: when(party.created_at),
              who: party.created_by?.name ?? t('parties.activity.someone'),
            })}
            <br />
            {t('parties.overview.updated', {
              when: when(party.updated_at),
              who: party.updated_by?.name ?? t('parties.activity.someone'),
            })}
          </Fact>
        </dl>
      </Card>
    </div>
  );
}

/** The record's history (§6.2 core.activity): who changed what, and when. */
export function ActivitySection({ id, version }: { id: string; version: number }) {
  const { t } = useTranslation();
  const activity = useQuery({
    queryKey: ['party-activity', id, version],
    queryFn: () => sdk.parties.activity(id),
  });
  if (activity.error) return <Banner tone="error">{errorMessage(activity.error, t)}</Banner>;
  if (!activity.data) return <Skeleton label={t('common.loading')} lines={4} />;
  if (!activity.data.data.length) return <EmptyState title={t('parties.activity.empty')} />;
  return (
    <Card>
      <ol className="m-0 flex list-none flex-col gap-4 p-0">
        {activity.data.data.map((entry) => (
          <li key={entry.id} className="flex flex-col gap-0.5 border-s-2 border-line ps-3">
            <span className="text-sm font-medium text-fg">
              {t(`parties.activity.${entry.action}`)} ·{' '}
              {entry.actor?.name ?? t('parties.activity.someone')}
            </span>
            <span className="text-xs text-muted">{new Date(entry.at).toLocaleString()}</span>
            {entry.fields.length > 0 && (
              <span className="text-sm text-muted">
                {t('parties.activity.fields', {
                  fields: entry.fields
                    .map((field) => t(`parties.changed.${field}`, { defaultValue: field }))
                    .join(', '),
                })}
              </span>
            )}
            {entry.reason && (
              <span className="text-sm text-muted">
                {t('parties.activity.reason', { reason: entry.reason })}
              </span>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}
