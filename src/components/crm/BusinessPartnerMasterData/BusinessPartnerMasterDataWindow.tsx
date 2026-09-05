import React, { useEffect, useMemo, useState } from 'react';
import { Users, Plus, Trash2, RefreshCw, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useCrudResource } from '../../../hooks/useCrudResource';
import {
  businessPartnersApi,
  bpGroupsApi,
  territoriesApi,
  salesEmployeesApi,
  type BusinessPartner,
  type CreateBusinessPartnerPayload,
  type BpCardType,
  type BpContactPerson,
  type BpAddress,
  type BpBankAccount,
} from '../../../api/crm.api';
import { paymentTermsApi } from '../../../api/financials.api';
import {
  ClassicWindow,
  CrudToolbar,
  ToolBtn,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

type Tab = 'General' | 'Contact Persons' | 'Addresses' | 'Payment Terms' | 'Accounting' | 'Remarks';
const TABS: Tab[] = ['General', 'Contact Persons', 'Addresses', 'Payment Terms', 'Accounting', 'Remarks'];

const emptyForm = {
  cardCode: '', cardName: '', cardType: 'CUSTOMER' as BpCardType, foreignName: '',
  groupId: '', currency: 'USD', federalTaxId: '',
  phone1: '', phone2: '', mobile: '', fax: '', email: '', website: '',
  territoryId: '', salesEmployeeId: '',
  paymentTermsId: '', creditLimit: '', commitmentLimit: '', discountPercent: '',
  industry: '', businessType: '', priority: '',
  isActive: true, remarks: '',
};

const money = (v: string | number | null | undefined) =>
  v === null || v === undefined || v === ''
    ? '0.00'
    : Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const BusinessPartnerMasterDataWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const companyId = activeCompanyId;

  const [tab, setTab] = useState<Tab>('General');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | BpCardType>('');
  const [form, setForm] = useState(emptyForm);
  const [contacts, setContacts] = useState<BpContactPerson[]>([]);
  const [addresses, setAddresses] = useState<BpAddress[]>([]);
  const [banks, setBanks] = useState<BpBankAccount[]>([]);

  const listParams = useMemo(
    () => ({ take: 500, ...(typeFilter ? { cardType: typeFilter } : {}), ...(search ? { search } : {}) }),
    [typeFilter, search],
  );

  const crud = useCrudResource<BusinessPartner, CreateBusinessPartnerPayload>(
    'business-partners',
    businessPartnersApi,
    { params: listParams, label: (b) => `${b.cardCode} — ${b.cardName}` },
  );

  const { data: groups = [] } = useQuery({
    queryKey: ['bp-groups', companyId],
    queryFn: () => bpGroupsApi.getAll(),
    enabled: !!companyId,
  });
  const { data: territories = [] } = useQuery({
    queryKey: ['territories-flat', companyId],
    queryFn: () => territoriesApi.getAll(),
    enabled: !!companyId,
  });
  const { data: reps = [] } = useQuery({
    queryKey: ['sales-employees', companyId],
    queryFn: () => salesEmployeesApi.getAll({ isActive: true }),
    enabled: !!companyId,
  });
  const { data: terms = [] } = useQuery({
    queryKey: ['payment-terms', companyId],
    queryFn: () => paymentTermsApi.getAll({ isActive: true }),
    enabled: !!companyId,
  });

  useEffect(() => {
    if (crud.mode === 'new') {
      setForm(emptyForm); setContacts([]); setAddresses([]); setBanks([]); setTab('General');
    } else if (crud.mode === 'edit' && crud.selected) {
      const b = crud.selected;
      setForm({
        cardCode: b.cardCode, cardName: b.cardName, cardType: b.cardType,
        foreignName: b.foreignName ?? '', groupId: b.groupId ?? '', currency: b.currency,
        federalTaxId: b.federalTaxId ?? '',
        phone1: b.phone1 ?? '', phone2: b.phone2 ?? '', mobile: b.mobile ?? '',
        fax: b.fax ?? '', email: b.email ?? '', website: b.website ?? '',
        territoryId: b.territoryId ?? '', salesEmployeeId: b.salesEmployeeId ?? '',
        paymentTermsId: b.paymentTermsId ?? '',
        creditLimit: b.creditLimit ?? '', commitmentLimit: b.commitmentLimit ?? '',
        discountPercent: b.discountPercent ?? '',
        industry: b.industry ?? '', businessType: b.businessType ?? '', priority: b.priority ?? '',
        isActive: b.isActive, remarks: b.remarks ?? '',
      });
      setContacts(b.contacts.map((c) => ({ ...c })));
      setAddresses(b.addresses.map((a) => ({ ...a })));
      setBanks(b.bankAccounts.map((x) => ({ ...x })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crud.mode, crud.selected]);

  const numOrUndef = (s: string) => (s === '' ? undefined : Number(s));

  const handleSave = () => {
    if (!form.cardName.trim()) {
      crud.setError('Business partner name is required.');
      return;
    }
    // Only one default per collection; addresses are default-per-type.
    if (contacts.filter((c) => c.isDefault).length > 1) {
      crud.setError('Only one contact person can be marked default.');
      return;
    }
    for (const t of ['BILL_TO', 'SHIP_TO'] as const) {
      if (addresses.filter((a) => a.isDefault && a.addressType === t).length > 1) {
        crud.setError(`Only one default ${t === 'BILL_TO' ? 'Bill To' : 'Ship To'} address is allowed.`);
        return;
      }
    }
    if (contacts.some((c) => !c.name.trim())) {
      crud.setError('Every contact person needs a name.');
      return;
    }
    if (addresses.some((a) => !a.addressName.trim())) {
      crud.setError('Every address needs an address name.');
      return;
    }

    crud.save({
      // Blank card code lets the backend allocate one from the numbering series.
      cardCode: form.cardCode.trim() || undefined,
      cardName: form.cardName.trim(),
      cardType: form.cardType,
      foreignName: form.foreignName || undefined,
      groupId: form.groupId || undefined,
      currency: form.currency || 'USD',
      federalTaxId: form.federalTaxId || undefined,
      phone1: form.phone1 || undefined, phone2: form.phone2 || undefined,
      mobile: form.mobile || undefined, fax: form.fax || undefined,
      email: form.email || undefined, website: form.website || undefined,
      territoryId: form.territoryId || undefined,
      salesEmployeeId: form.salesEmployeeId || undefined,
      paymentTermsId: form.paymentTermsId || undefined,
      creditLimit: numOrUndef(form.creditLimit),
      commitmentLimit: numOrUndef(form.commitmentLimit),
      discountPercent: numOrUndef(form.discountPercent),
      industry: form.industry || undefined,
      businessType: form.businessType || undefined,
      priority: form.priority || undefined,
      isActive: form.isActive,
      remarks: form.remarks || undefined,
      contacts, addresses, bankAccounts: banks,
    });
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';
  const b = crud.selected;

  const gridBtn = (label: string, onClick: () => void) => (
    <ToolBtn onClick={onClick} className="mb-1"><Plus className="w-3 h-3" /> {label}</ToolBtn>
  );

  return (
    <ClassicWindow
      title="Business Partner Master Data"
      icon={<Users className="w-3.5 h-3.5 text-gray-600" />}
      accent="#3b82f6"
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={1000}
      minHeight={580}
      toolbar={
        <>
          <CrudToolbar
            onNew={crud.openNew}
            onEdit={() => b && crud.openEdit(b)}
            onDelete={() => crud.remove()}
            onRefresh={crud.refetch}
            canEdit={!!b}
            canDelete={!!b}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <div className="flex items-center gap-1 ml-2">
            <Search className="w-3 h-3 text-gray-500" />
            <ClassicInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find code, name, email…"
              className="w-48"
            />
          </div>
          <ClassicSel
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as '' | BpCardType)}
            className="w-28 ml-1"
          >
            <option value="">All types</option>
            <option value="CUSTOMER">Customers</option>
            <option value="VENDOR">Vendors</option>
            <option value="LEAD">Leads</option>
          </ClassicSel>
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={
        <>
          <span>{crud.rows.length} business partner{crud.rows.length === 1 ? '' : 's'}</span>
          <span>Business Partner Master Data</span>
        </>
      }
    >
      <div className="flex flex-1 min-h-0">
        {/* List */}
        <div className="w-[230px] shrink-0 border-r border-[#d4d0c8] bg-white overflow-auto custom-scrollbar">
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && crud.rows.length === 0}
            emptyText="No business partners yet. Click New."
          />
          {crud.rows.map((p) => (
            <div
              key={p.id}
              onClick={() => crud.select(p)}
              onDoubleClick={() => crud.openEdit(p)}
              className={cn(
                'px-2 py-1.5 border-b border-[#f0f0f0] cursor-default',
                b?.id === p.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/60',
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[10px] text-gray-600">{p.cardCode}</span>
                <span className="text-[8.5px] bg-blue-100 text-blue-700 px-1 rounded-[1px]">{p.cardType}</span>
              </div>
              <div className={cn('text-[10.5px] font-medium truncate', !p.isActive && 'text-gray-400 italic')}>
                {p.cardName}
              </div>
              <div className="text-[9.5px] text-gray-500 font-mono">
                {p.currency} {money(p.accountBalance)}
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#ececec]">
          {!isForm && !b && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400">
              Select a business partner, or click New.
            </div>
          )}

          {(isForm || b) && (
            <>
              {/* Header strip */}
              <div className="shrink-0 p-2 bg-[#f7f7f7] border-b border-[#d4d0c8]">
                <div className="flex items-center gap-3 flex-wrap text-[10.5px]">
                  <label className="flex items-center gap-1">
                    <span className="text-gray-600">Code</span>
                    {isForm ? (
                      <ClassicInput
                        value={form.cardCode}
                        onChange={(e) => setForm((f) => ({ ...f, cardCode: e.target.value }))}
                        className="w-28 font-mono"
                        placeholder="auto"
                        title="Leave blank to auto-generate from the numbering series"
                      />
                    ) : <span className="font-mono font-bold">{b?.cardCode}</span>}
                  </label>
                  <label className="flex items-center gap-1 flex-1 min-w-[220px]">
                    <span className="text-gray-600">Name</span>
                    {isForm ? (
                      <ClassicInput
                        value={form.cardName}
                        onChange={(e) => setForm((f) => ({ ...f, cardName: e.target.value }))}
                        className="flex-1"
                      />
                    ) : <span className="font-bold">{b?.cardName}</span>}
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="text-gray-600">Type</span>
                    {isForm ? (
                      <ClassicSel
                        value={form.cardType}
                        onChange={(e) => setForm((f) => ({ ...f, cardType: e.target.value as BpCardType }))}
                        className="w-28"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="VENDOR">Vendor</option>
                        <option value="LEAD">Lead</option>
                      </ClassicSel>
                    ) : <span>{b?.cardType}</span>}
                  </label>
                  {!isForm && b && (
                    <span className="font-mono text-[11px]">
                      Balance: <b>{b.currency} {money(b.accountBalance)}</b>
                    </span>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-[2px] px-2 pt-1 shrink-0">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      'px-3 py-0.5 text-[10.5px] border border-[#999] border-b-0 rounded-t-[3px]',
                      tab === t ? 'bg-white font-bold -mb-[1px] z-10 relative' : 'bg-[#e1e1e1] hover:bg-gray-200',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex-1 min-h-0 overflow-auto bg-white border-t border-[#999] p-3">
                {tab === 'General' && (
                  <div className="grid grid-cols-2 gap-x-6">
                    <div>
                      <FieldRow label="Foreign Name">
                        {isForm ? <ClassicInput className="w-full" value={form.foreignName}
                          onChange={(e) => setForm((f) => ({ ...f, foreignName: e.target.value }))} />
                          : b?.foreignName ?? '—'}
                      </FieldRow>
                      <FieldRow label="Group">
                        {isForm ? (
                          <ClassicSel className="w-full" value={form.groupId}
                            onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value }))}>
                            <option value="">— none —</option>
                            {groups.filter((g) => g.type === form.cardType).map((g) => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </ClassicSel>
                        ) : b?.group?.name ?? '—'}
                      </FieldRow>
                      <FieldRow label="Currency">
                        {isForm ? <ClassicInput className="w-24" maxLength={3} value={form.currency}
                          onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))} />
                          : b?.currency}
                      </FieldRow>
                      <FieldRow label="Tax ID">
                        {isForm ? <ClassicInput className="w-full" value={form.federalTaxId}
                          onChange={(e) => setForm((f) => ({ ...f, federalTaxId: e.target.value }))} />
                          : b?.federalTaxId ?? '—'}
                      </FieldRow>
                      <FieldRow label="Telephone 1">
                        {isForm ? <ClassicInput className="w-full" value={form.phone1}
                          onChange={(e) => setForm((f) => ({ ...f, phone1: e.target.value }))} />
                          : b?.phone1 ?? '—'}
                      </FieldRow>
                      <FieldRow label="Mobile">
                        {isForm ? <ClassicInput className="w-full" value={form.mobile}
                          onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
                          : b?.mobile ?? '—'}
                      </FieldRow>
                      <FieldRow label="E-Mail">
                        {isForm ? <ClassicInput className="w-full" type="email" value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                          : b?.email ?? '—'}
                      </FieldRow>
                      <FieldRow label="Website">
                        {isForm ? <ClassicInput className="w-full" value={form.website}
                          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
                          : b?.website ?? '—'}
                      </FieldRow>
                    </div>
                    <div>
                      <FieldRow label="Territory">
                        {isForm ? (
                          <ClassicSel className="w-full" value={form.territoryId}
                            onChange={(e) => setForm((f) => ({ ...f, territoryId: e.target.value }))}>
                            <option value="">— none —</option>
                            {territories.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </ClassicSel>
                        ) : b?.territory?.name ?? '—'}
                      </FieldRow>
                      <FieldRow label="Sales Employee">
                        {isForm ? (
                          <ClassicSel className="w-full" value={form.salesEmployeeId}
                            onChange={(e) => setForm((f) => ({ ...f, salesEmployeeId: e.target.value }))}>
                            <option value="">— none —</option>
                            {reps.map((r) => <option key={r.id} value={r.id}>{r.code} — {r.name}</option>)}
                          </ClassicSel>
                        ) : b?.salesEmployee?.name ?? '—'}
                      </FieldRow>
                      <FieldRow label="Industry">
                        {isForm ? <ClassicInput className="w-full" value={form.industry}
                          onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} />
                          : b?.industry ?? '—'}
                      </FieldRow>
                      <FieldRow label="Business Type">
                        {isForm ? <ClassicInput className="w-full" value={form.businessType}
                          onChange={(e) => setForm((f) => ({ ...f, businessType: e.target.value }))} />
                          : b?.businessType ?? '—'}
                      </FieldRow>
                      <FieldRow label="Priority">
                        {isForm ? <ClassicInput className="w-full" value={form.priority}
                          onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} />
                          : b?.priority ?? '—'}
                      </FieldRow>
                      <FieldRow label="Active">
                        {isForm ? <input type="checkbox" checked={form.isActive}
                          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                          : b?.isActive ? 'Yes' : 'No'}
                      </FieldRow>
                      {!isForm && b && (
                        <>
                          <FieldRow label="Orders Balance">{money(b.ordersBalance)}</FieldRow>
                          <FieldRow label="Opportunities">{money(b.opportunitiesAmount)}</FieldRow>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {tab === 'Payment Terms' && (
                  <div className="grid grid-cols-2 gap-x-6">
                    <div>
                      <FieldRow label="Payment Terms">
                        {isForm ? (
                          <ClassicSel className="w-full" value={form.paymentTermsId}
                            onChange={(e) => setForm((f) => ({ ...f, paymentTermsId: e.target.value }))}>
                            <option value="">— none —</option>
                            {terms.map((t) => (
                              <option key={t.id} value={t.id}>{t.code} — {t.name} (net {t.netDays}d)</option>
                            ))}
                          </ClassicSel>
                        ) : b?.paymentTerms ? `${b.paymentTerms.code} — ${b.paymentTerms.name}` : '—'}
                      </FieldRow>
                      <FieldRow label="Credit Limit">
                        {isForm ? <ClassicInput className="w-full font-mono" type="number" step="0.01"
                          value={form.creditLimit}
                          onChange={(e) => setForm((f) => ({ ...f, creditLimit: e.target.value }))} />
                          : money(b?.creditLimit)}
                      </FieldRow>
                      <FieldRow label="Commitment Limit">
                        {isForm ? <ClassicInput className="w-full font-mono" type="number" step="0.01"
                          value={form.commitmentLimit}
                          onChange={(e) => setForm((f) => ({ ...f, commitmentLimit: e.target.value }))} />
                          : money(b?.commitmentLimit)}
                      </FieldRow>
                      <FieldRow label="Discount %">
                        {isForm ? <ClassicInput className="w-full font-mono" type="number" step="0.01"
                          min="0" max="100" value={form.discountPercent}
                          onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))} />
                          : `${money(b?.discountPercent)}%`}
                      </FieldRow>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-600 bg-gray-50 border border-gray-200 p-2 rounded-[1px]">
                        Credit limit is checked against open receivables. Customer 360 flags a partner
                        who is over their limit.
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'Accounting' && (
                  <div className="grid grid-cols-2 gap-x-6">
                    <div>
                      <FieldRow label="Account Balance">{money(b?.accountBalance)}</FieldRow>
                      <FieldRow label="Deliveries">{money(b?.deliveriesBalance)}</FieldRow>
                      <FieldRow label="Orders">{money(b?.ordersBalance)}</FieldRow>
                    </div>
                    <div>
                      <div className="mb-1"><b className="text-[10.5px]">Bank Accounts</b></div>
                      {isForm && gridBtn('Add bank account', () =>
                        setBanks((p) => [...p, { bankName: '', accountNo: '', iban: '', isDefault: p.length === 0 }]))}
                      {banks.length === 0 && <div className="text-[10px] text-gray-400">None recorded.</div>}
                      {banks.map((bk, i) => (
                        <div key={i} className="border border-[#e0e0e0] p-1.5 mb-1 rounded-[1px]">
                          {isForm ? (
                            <div className="flex gap-1 items-center">
                              <ClassicInput className="flex-1" placeholder="Bank" value={bk.bankName ?? ''}
                                onChange={(e) => setBanks((p) => p.map((x, j) => j === i ? { ...x, bankName: e.target.value } : x))} />
                              <ClassicInput className="flex-1" placeholder="Account no." value={bk.accountNo ?? ''}
                                onChange={(e) => setBanks((p) => p.map((x, j) => j === i ? { ...x, accountNo: e.target.value } : x))} />
                              <button onClick={() => setBanks((p) => p.filter((_, j) => j !== i))}
                                className="text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <div className="text-[10.5px]">{bk.bankName} · {bk.accountNo}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 'Contact Persons' && (
                  <div>
                    {isForm && gridBtn('Add contact', () =>
                      setContacts((p) => [...p, { name: '', isDefault: p.length === 0, isActive: true }]))}
                    {contacts.length === 0 && (
                      <div className="text-[10.5px] text-gray-400">No contact persons recorded.</div>
                    )}
                    {contacts.map((c, i) => (
                      <div key={i} className="border border-[#e0e0e0] p-2 mb-2 rounded-[1px]">
                        {isForm ? (
                          <div className="grid grid-cols-4 gap-2 items-center">
                            <ClassicInput placeholder="Name *" value={c.name}
                              onChange={(e) => setContacts((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                            <ClassicInput placeholder="Position" value={c.position ?? ''}
                              onChange={(e) => setContacts((p) => p.map((x, j) => j === i ? { ...x, position: e.target.value } : x))} />
                            <ClassicInput placeholder="E-mail" value={c.email ?? ''}
                              onChange={(e) => setContacts((p) => p.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} />
                            <div className="flex items-center gap-2">
                              <ClassicInput placeholder="Phone" value={c.phone1 ?? ''}
                                onChange={(e) => setContacts((p) => p.map((x, j) => j === i ? { ...x, phone1: e.target.value } : x))} />
                              <label className="flex items-center gap-1 text-[9.5px] whitespace-nowrap">
                                <input type="radio" name="defaultContact" checked={!!c.isDefault}
                                  onChange={() => setContacts((p) => p.map((x, j) => ({ ...x, isDefault: j === i })))} />
                                Default
                              </label>
                              <button onClick={() => setContacts((p) => p.filter((_, j) => j !== i))}
                                className="text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10.5px]">
                            <b>{c.name}</b>{c.isDefault && <span className="ml-1 text-[9px] text-blue-700">(default)</span>}
                            <span className="text-gray-500"> · {c.position ?? '—'} · {c.email ?? '—'} · {c.phone1 ?? '—'}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'Addresses' && (
                  <div>
                    {isForm && gridBtn('Add address', () =>
                      setAddresses((p) => [...p, { addressName: '', addressType: 'BILL_TO', isDefault: false }]))}
                    {addresses.length === 0 && (
                      <div className="text-[10.5px] text-gray-400">No addresses recorded.</div>
                    )}
                    {addresses.map((a, i) => (
                      <div key={i} className="border border-[#e0e0e0] p-2 mb-2 rounded-[1px]">
                        {isForm ? (
                          <div className="grid grid-cols-5 gap-2 items-center">
                            <ClassicInput placeholder="Address name *" value={a.addressName}
                              onChange={(e) => setAddresses((p) => p.map((x, j) => j === i ? { ...x, addressName: e.target.value } : x))} />
                            <ClassicSel value={a.addressType}
                              onChange={(e) => setAddresses((p) => p.map((x, j) => j === i ? { ...x, addressType: e.target.value as BpAddress['addressType'] } : x))}>
                              <option value="BILL_TO">Bill To</option>
                              <option value="SHIP_TO">Ship To</option>
                            </ClassicSel>
                            <ClassicInput placeholder="Street" value={a.street ?? ''}
                              onChange={(e) => setAddresses((p) => p.map((x, j) => j === i ? { ...x, street: e.target.value } : x))} />
                            <ClassicInput placeholder="City" value={a.city ?? ''}
                              onChange={(e) => setAddresses((p) => p.map((x, j) => j === i ? { ...x, city: e.target.value } : x))} />
                            <div className="flex items-center gap-2">
                              <ClassicInput placeholder="Country" value={a.country ?? ''}
                                onChange={(e) => setAddresses((p) => p.map((x, j) => j === i ? { ...x, country: e.target.value } : x))} />
                              <label className="flex items-center gap-1 text-[9.5px] whitespace-nowrap">
                                <input type="checkbox" checked={!!a.isDefault}
                                  onChange={(e) => setAddresses((p) => p.map((x, j) =>
                                    // Default is per address type, so setting one
                                    // only clears others of the same type.
                                    j === i ? { ...x, isDefault: e.target.checked }
                                      : x.addressType === a.addressType && e.target.checked ? { ...x, isDefault: false } : x))} />
                                Default
                              </label>
                              <button onClick={() => setAddresses((p) => p.filter((_, j) => j !== i))}
                                className="text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10.5px]">
                            <b>{a.addressName}</b> <span className="text-[9px] text-gray-500">({a.addressType})</span>
                            <span className="text-gray-600"> · {[a.street, a.city, a.country].filter(Boolean).join(', ') || '—'}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'Remarks' && (
                  isForm ? (
                    <textarea
                      value={form.remarks}
                      onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                      className="w-full h-40 border border-[#d4d0c8] p-2 text-[10.5px] outline-none focus:border-orange-400"
                    />
                  ) : (
                    <div className="text-[10.5px] whitespace-pre-wrap">{b?.remarks || '— no remarks —'}</div>
                  )
                )}
              </div>

              {isForm && (
                <div className="h-10 px-3 bg-[#f0f0f0] border-t border-[#ccc] flex items-center gap-2 shrink-0">
                  <YellowBtn onClick={handleSave} disabled={crud.isBusy}>
                    {crud.isBusy ? 'Saving…' : crud.mode === 'new' ? 'Add' : 'Update'}
                  </YellowBtn>
                  <GreyBtn onClick={crud.cancel}>Cancel</GreyBtn>
                  <span className="text-[9.5px] text-gray-500 ml-2">
                    Contact, address and bank grids are saved together with the partner.
                  </span>
                </div>
              )}

              {!isForm && b && (
                <div className="h-9 px-3 bg-[#f0f0f0] border-t border-[#ccc] flex items-center gap-2 shrink-0">
                  <YellowBtn onClick={() => crud.openEdit(b)}>Edit</YellowBtn>
                  <ToolBtn onClick={() => businessPartnersApi.refreshBalances(b.id).then(() => crud.refetch())}>
                    <RefreshCw className="w-3 h-3" /> Recalculate balances
                  </ToolBtn>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
