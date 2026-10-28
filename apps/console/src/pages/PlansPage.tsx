import type { PlanView } from '@erp/contracts';
import { Button, DataGrid, Dialog, Input, PageHeader, type ColumnDef } from '@erp/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sdk } from '../auth';
import { Loaded, ReasonField, Status, useChange, useGridLabels, useResource } from '../lib';
import { holds, useStaffAccess } from '../staff-access';

// Plans & Add-ons (Part 02 §2.11, Part 03 §3.11): tiers, limits, included features, prices and
// visibility. A Billing Manager's price change waits for a second approver (◐).

const CURRENCIES = ['PKR', 'USD'] as const;
const PERIODS = ['monthly', 'yearly'] as const;

function priceText(prices: PlanView['prices']): string {
  return Object.entries(prices)
    .flatMap(([cur, by]) =>
      Object.entries(by).map(([period, amount]) => `${cur} ${amount} / ${period}`),
    )
    .join(' · ');
}

export function PlansPage() {
  const { t } = useTranslation();
  const access = useStaffAccess();
  const canEdit = holds(access, 'catalogue.edit');
  const canPrice = holds(access, 'catalogue.prices');
  const plans = useResource(() => sdk.console.catalogue.plans(), []);
  const change = useChange();
  const labels = useGridLabels();
  const [pricing, setPricing] = useState<PlanView | null>(null);
  const [editing, setEditing] = useState<PlanView | null>(null);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    limits: '{}',
    features: '',
    visibility: 'private',
    reason: '',
  });

  const columns = useMemo<ColumnDef<PlanView, unknown>[]>(
    () => [
      { accessorKey: 'name', header: t('console.plans.plan') },
      { accessorKey: 'key', header: t('console.plans.key') },
      {
        id: 'kind',
        header: t('console.plans.kind'),
        accessorFn: (p) => t(`console.plans.${p.kind}`),
      },
      { accessorKey: 'tier', header: t('console.plans.tier') },
      {
        id: 'limits',
        header: t('console.plans.limits'),
        accessorFn: (p) =>
          Object.entries(p.limits)
            .map(([k, v]) => `${k} ${v}`)
            .join(', '),
      },
      {
        id: 'prices',
        header: t('console.plans.prices'),
        accessorFn: (p) => priceText(p.prices) || t('console.plans.no_prices'),
      },
      {
        id: 'visibility',
        header: t('console.plans.visibility'),
        accessorFn: (p) => t(`console.plans.${p.visibility}`),
      },
      {
        id: 'status',
        header: t('console.common.status'),
        accessorFn: (p) => (p.archived_at ? 'archived' : 'active'),
        cell: (c) => <Status status={String(c.getValue())} />,
      },
      {
        id: 'actions',
        header: t('console.common.actions'),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="flex gap-2">
            {canPrice && (
              <button
                type="button"
                className="underline"
                onClick={() => {
                  const next: Record<string, string> = {};
                  for (const c of CURRENCIES)
                    for (const p of PERIODS)
                      next[`${c}.${p}`] = String(row.original.prices[c]?.[p] ?? '');
                  setPrices({ ...next, reason: '' });
                  setPricing(row.original);
                }}
              >
                {t('console.plans.change_prices')}
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                className="underline"
                onClick={() => {
                  const p = row.original;
                  setForm({
                    name: p.name,
                    limits: JSON.stringify(p.limits),
                    features: p.feature_keys.join(', '),
                    visibility: p.visibility,
                    reason: '',
                  });
                  setEditing(p);
                }}
              >
                {t('console.common.edit')}
              </button>
            )}
          </span>
        ),
      },
    ],
    [t, canEdit, canPrice],
  );

  const savePrices = () => {
    const next: Record<string, Partial<Record<(typeof PERIODS)[number], number>>> = {};
    for (const c of CURRENCIES)
      for (const p of PERIODS) {
        const raw = prices[`${c}.${p}`]?.trim();
        if (raw) (next[c] ??= {})[p] = Number(raw);
      }
    void change(
      () =>
        sdk.console.catalogue.prices(
          pricing!.kind === 'plan' ? 'plans' : 'addons',
          pricing!.key,
          next,
          prices.reason ?? '',
        ),
      () => {
        setPricing(null);
        plans.reload();
      },
    );
  };

  const savePlan = () => {
    let limits: Record<string, number>;
    try {
      limits = JSON.parse(form.limits) as Record<string, number>;
    } catch {
      return;
    }
    const p = editing!;
    void change(
      () =>
        sdk.console.catalogue.upsertPlan(
          {
            key: p.key,
            kind: p.kind,
            name: form.name,
            tier: p.tier,
            limits,
            feature_keys: form.features
              .split(',')
              .map((f) => f.trim())
              .filter(Boolean),
            prices: p.prices,
            visibility: form.visibility as 'public' | 'private',
            reason: form.reason,
          },
          `W/"${p.version}"`,
        ),
      () => {
        setEditing(null);
        plans.reload();
      },
    );
  };

  return (
    <>
      <PageHeader title={t('console.plans.title')} count={plans.data?.data.length} />
      <Loaded resource={plans}>
        {(data) => (
          <DataGrid
            data={data.data}
            columns={columns}
            getRowId={(p) => `${p.kind}:${p.key}`}
            labels={labels}
          />
        )}
      </Loaded>

      <Dialog
        open={pricing !== null}
        onOpenChange={(o) => !o && setPricing(null)}
        title={`${t('console.plans.change_prices')}: ${pricing?.name ?? ''}`}
        closeLabel={t('common.cancel')}
        footer={
          <Button disabled={(prices.reason ?? '').trim().length < 3} onClick={savePrices}>
            {t('console.common.save')}
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          {CURRENCIES.flatMap((c) =>
            PERIODS.map((p) => (
              <Input
                key={`${c}.${p}`}
                label={`${c} · ${t(`console.plans.${p}`)}`}
                inputMode="decimal"
                value={prices[`${c}.${p}`] ?? ''}
                onChange={(e) => setPrices({ ...prices, [`${c}.${p}`]: e.target.value })}
              />
            )),
          )}
        </div>
        <ReasonField
          value={prices.reason ?? ''}
          onChange={(reason) => setPrices({ ...prices, reason })}
        />
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={`${t('console.common.edit')}: ${editing?.name ?? ''}`}
        closeLabel={t('common.cancel')}
        footer={
          <Button disabled={form.reason.trim().length < 3} onClick={savePlan}>
            {t('console.common.save')}
          </Button>
        }
      >
        <div className="grid gap-3">
          <Input
            label={t('console.plans.plan')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label={`${t('console.plans.limits')} (JSON)`}
            value={form.limits}
            onChange={(e) => setForm({ ...form, limits: e.target.value })}
          />
          <Input
            label={t('console.plans.features')}
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
          />
          <label className="grid gap-1">
            <span className="font-medium">{t('console.plans.visibility')}</span>
            <select
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              className="rounded-md border p-2"
            >
              <option value="private">{t('console.plans.private')}</option>
              <option value="public">{t('console.plans.public')}</option>
            </select>
          </label>
          <ReasonField value={form.reason} onChange={(reason) => setForm({ ...form, reason })} />
        </div>
      </Dialog>
    </>
  );
}
