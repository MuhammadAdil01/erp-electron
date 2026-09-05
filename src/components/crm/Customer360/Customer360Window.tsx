import React, { useState } from 'react';
import { UserSquare2, AlertTriangle, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { businessPartnersApi, customer360Api, type BpCardType } from '../../../api/crm.api';
import {
  ClassicWindow,
  ListPlaceholder,
  StatusNote,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, ClassicSel } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

const money = (v: string | number) =>
  Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Tile: React.FC<{ label: string; value: string; tone?: 'plain' | 'warn' | 'good' }> = ({
  label, value, tone = 'plain',
}) => (
  <div
    className={cn(
      'border border-[#d4d0c8] bg-white px-2 py-1.5 rounded-[1px] min-w-0',
      tone === 'warn' && 'border-red-300 bg-red-50',
      tone === 'good' && 'border-green-300 bg-green-50',
    )}
  >
    <div className="text-[9px] text-gray-500 uppercase tracking-wide truncate">{label}</div>
    <div
      className={cn(
        'text-[13px] font-bold font-mono truncate',
        tone === 'warn' && 'text-red-700',
        tone === 'good' && 'text-green-800',
      )}
    >
      {value}
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode; count?: number }> = ({
  title, children, count,
}) => (
  <div className="mb-3">
    <div className="text-[10.5px] font-bold text-[#444] mb-1 pb-0.5 border-b border-[#e0e0e0] flex justify-between">
      <span>{title}</span>
      {count !== undefined && <span className="text-gray-400 font-normal">{count}</span>}
    </div>
    {children}
  </div>
);

export const Customer360Window: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const companyId = activeCompanyId;

  const [search, setSearch] = useState('');
  const [cardType, setCardType] = useState<'' | BpCardType>('');
  const [bpId, setBpId] = useState<string | null>(null);

  const { data: partners = [], isLoading: listLoading } = useQuery({
    queryKey: ['bp-lookup-360', companyId, search, cardType],
    queryFn: () =>
      businessPartnersApi.lookup({
        search: search || undefined,
        cardType: cardType || undefined,
        take: 200,
      }),
    enabled: !!companyId,
  });

  // One aggregate call backs every panel below, so the tiles and the rows
  // beneath them can never disagree.
  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-360', bpId],
    queryFn: () => customer360Api.overview(bpId as string),
    enabled: !!bpId,
    retry: false,
  });

  const s = data?.summary;

  return (
    <ClassicWindow
      title="Customer 360"
      icon={<UserSquare2 className="w-3.5 h-3.5 text-gray-600" />}
      accent="#3b82f6"
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={980}
      minHeight={580}
      toolbar={
        <>
          <div className="flex items-center gap-1">
            <Search className="w-3 h-3 text-gray-500" />
            <ClassicInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find partner…"
              className="w-48"
            />
          </div>
          <ClassicSel
            value={cardType}
            onChange={(e) => setCardType(e.target.value as '' | BpCardType)}
            className="w-28 ml-1"
          >
            <option value="">All types</option>
            <option value="CUSTOMER">Customers</option>
            <option value="VENDOR">Vendors</option>
            <option value="LEAD">Leads</option>
          </ClassicSel>
          <StatusNote
            error={error instanceof Error ? error.message : undefined}
          />
        </>
      }
      footer={
        <>
          <span>{data ? `${data.partner.cardCode} — ${data.partner.cardName}` : 'No partner selected'}</span>
          <span>Customer 360</span>
        </>
      }
    >
      <div className="flex flex-1 min-h-0">
        {/* Partner picker */}
        <div className="w-[230px] shrink-0 border-r border-[#d4d0c8] bg-white overflow-auto custom-scrollbar">
          <ListPlaceholder
            noCompany={!companyId}
            isLoading={listLoading}
            isEmpty={!listLoading && partners.length === 0}
            emptyText="No business partners match."
          />
          {partners.map((p) => (
            <div
              key={p.id}
              onClick={() => setBpId(p.id)}
              className={cn(
                'px-2 py-1.5 border-b border-[#f0f0f0] cursor-default',
                bpId === p.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50/60',
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[10px] text-gray-600">{p.cardCode}</span>
                <span className="text-[8.5px] bg-blue-100 text-blue-700 px-1 rounded-[1px]">
                  {p.cardType}
                </span>
              </div>
              <div className="text-[10.5px] font-medium truncate">{p.cardName}</div>
              <div className="text-[9.5px] text-gray-500 font-mono">
                {p.currency} {money(p.accountBalance)}
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard */}
        <div className="flex-1 min-w-0 overflow-auto bg-[#f5f5f5] p-3">
          {!bpId && (
            <div className="h-full flex items-center justify-center text-[11px] text-gray-400">
              Select a business partner to see their full picture.
            </div>
          )}

          {bpId && isLoading && (
            <div className="text-[11px] text-gray-400">Loading…</div>
          )}

          {data && s && (
            <>
              {/* Header */}
              <div className="mb-3">
                <div className="text-[15px] font-bold text-gray-800">{data.partner.cardName}</div>
                <div className="text-[10.5px] text-gray-500">
                  {data.partner.cardCode} · {data.partner.cardType}
                  {data.partner.group && ` · ${data.partner.group.name}`}
                  {data.partner.salesEmployee && ` · Rep: ${data.partner.salesEmployee.name}`}
                  {data.partner.territory && ` · ${data.partner.territory.name}`}
                </div>
              </div>

              {s.overCreditLimit && (
                <div className="mb-3 flex items-center gap-2 text-[10.5px] text-red-800 bg-red-50 border border-red-300 px-2 py-1.5 rounded-[1px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Over credit limit — open balance {money(s.openReceivables)} against a limit of{' '}
                  {money(s.creditLimit ?? '0')}.
                </div>
              )}

              {/* Tiles */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <Tile
                  label={`Open Receivables (${s.currency})`}
                  value={money(s.openReceivables)}
                  tone={Number(s.openReceivables) > 0 ? 'warn' : 'plain'}
                />
                <Tile label={`Open Payables (${s.currency})`} value={money(s.openPayables)} />
                <Tile
                  label="Credit Available"
                  value={s.creditAvailable !== null ? money(s.creditAvailable) : '—'}
                  tone={s.overCreditLimit ? 'warn' : 'plain'}
                />
                <Tile label="Ledger Balance" value={money(s.ledgerBalance)} />
                <Tile label="Open Opportunities" value={String(s.openOpportunities)} />
                <Tile label="Pipeline Value" value={money(s.openOpportunityValue)} />
                <Tile label="Won / Lost" value={`${s.wonOpportunities} / ${s.lostOpportunities}`} tone="good" />
                <Tile label="Open Activities" value={String(s.openActivities)} />
              </div>

              {/* Aging */}
              <Section title="Receivables Aging">
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(data.aging).map(([bucket, amount]) => (
                    <Tile
                      key={bucket}
                      label={bucket.replace('d', '').replace('_', '–').replace('plus', '+')}
                      value={money(amount)}
                      tone={bucket !== 'current' && Number(amount) > 0 ? 'warn' : 'plain'}
                    />
                  ))}
                </div>
              </Section>

              {/* AR */}
              <Section title="Open A/R Invoices" count={data.arInvoices.length}>
                <table className="w-full border-collapse text-[10.5px] bg-white border border-[#d4d0c8]">
                  <thead>
                    <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                      <th className="text-left p-1 border-r border-[#eee]">Number</th>
                      <th className="text-left p-1 border-r border-[#eee]">Issued</th>
                      <th className="text-left p-1 border-r border-[#eee]">Due</th>
                      <th className="text-left p-1 border-r border-[#eee]">Status</th>
                      <th className="text-right p-1 border-r border-[#eee]">Total</th>
                      <th className="text-right p-1">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.arInvoices.length === 0 && (
                      <tr><td colSpan={6} className="p-2 text-center text-gray-400">No open invoices.</td></tr>
                    )}
                    {data.arInvoices.map((inv, i) => (
                      <tr key={inv.id} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
                        <td className="p-1 border-r border-[#eee] font-mono">{inv.number}</td>
                        <td className="p-1 border-r border-[#eee]">{new Date(inv.issueDate).toLocaleDateString()}</td>
                        <td className="p-1 border-r border-[#eee]">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-1 border-r border-[#eee]">{inv.status}</td>
                        <td className="p-1 border-r border-[#eee] text-right font-mono">{money(inv.total)}</td>
                        <td className="p-1 text-right font-mono font-bold">{money(inv.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>

              {/* Opportunities */}
              <Section title="Opportunities" count={data.opportunities.length}>
                <table className="w-full border-collapse text-[10.5px] bg-white border border-[#d4d0c8]">
                  <thead>
                    <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                      <th className="text-left p-1 border-r border-[#eee]">Name</th>
                      <th className="text-left p-1 border-r border-[#eee]">Stage</th>
                      <th className="text-left p-1 border-r border-[#eee]">Status</th>
                      <th className="text-right p-1 border-r border-[#eee]">Potential</th>
                      <th className="text-right p-1">Weighted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.opportunities.length === 0 && (
                      <tr><td colSpan={5} className="p-2 text-center text-gray-400">No opportunities.</td></tr>
                    )}
                    {data.opportunities.map((o, i) => (
                      <tr key={o.id} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
                        <td className="p-1 border-r border-[#eee]">{o.name}</td>
                        <td className="p-1 border-r border-[#eee]">{o.currentStage?.name ?? '—'}</td>
                        <td className="p-1 border-r border-[#eee]">{o.status}</td>
                        <td className="p-1 border-r border-[#eee] text-right font-mono">{money(o.potentialAmount)}</td>
                        <td className="p-1 text-right font-mono">{money(o.weightedAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>

              {/* Activities */}
              <Section title="Recent Activities" count={data.activities.length}>
                <table className="w-full border-collapse text-[10.5px] bg-white border border-[#d4d0c8]">
                  <thead>
                    <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                      <th className="text-left p-1 border-r border-[#eee]">Date</th>
                      <th className="text-left p-1 border-r border-[#eee]">Type</th>
                      <th className="text-left p-1 border-r border-[#eee]">Subject</th>
                      <th className="text-left p-1 border-r border-[#eee]">Assigned To</th>
                      <th className="text-left p-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.activities.length === 0 && (
                      <tr><td colSpan={5} className="p-2 text-center text-gray-400">No activities logged.</td></tr>
                    )}
                    {data.activities.map((a, i) => (
                      <tr key={a.id} className={i % 2 ? 'bg-[#fafafa]' : 'bg-white'}>
                        <td className="p-1 border-r border-[#eee]">{new Date(a.startDate).toLocaleDateString()}</td>
                        <td className="p-1 border-r border-[#eee]">{a.kind}</td>
                        <td className="p-1 border-r border-[#eee]">{a.subject}</td>
                        <td className="p-1 border-r border-[#eee]">{a.assignedTo?.name ?? '—'}</td>
                        <td className="p-1">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>

              {/* Contacts */}
              <Section title="Contact Persons" count={data.partner.contacts.length}>
                <div className="grid grid-cols-3 gap-2">
                  {data.partner.contacts.length === 0 && (
                    <div className="text-[10.5px] text-gray-400 col-span-3">No contacts recorded.</div>
                  )}
                  {data.partner.contacts.map((c) => (
                    <div key={c.id} className="border border-[#d4d0c8] bg-white p-2 rounded-[1px]">
                      <div className="text-[10.5px] font-bold truncate">
                        {c.name}
                        {c.isDefault && <span className="ml-1 text-[8.5px] text-blue-700">(default)</span>}
                      </div>
                      <div className="text-[9.5px] text-gray-500 truncate">{c.position ?? ''}</div>
                      <div className="text-[9.5px] text-gray-600 truncate">{c.email ?? ''}</div>
                      <div className="text-[9.5px] text-gray-600 truncate">{c.phone1 ?? c.mobile ?? ''}</div>
                    </div>
                  ))}
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
