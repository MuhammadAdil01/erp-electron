import type { ChangeResult } from '@erp/contracts';
import { Banner, Input, Skeleton, StatusChip, useToast, type DataGridLabels } from '@erp/ui';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { errorMessage } from './auth';

// Small pieces every console screen uses: loading data, the reason field every change needs,
// status chips with translated labels, and the grid's words.

/**
 * Loads data for a screen and loads it again when `inputs` change or on reload(). While a
 * reload runs the last data stays on screen; after the inputs change it does not.
 */
export function useResource<T>(load: () => Promise<T>, inputs: readonly unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: unknown; inputs?: string; key?: string }>({});
  const [round, setRound] = useState(0);
  const loader = useRef(load);
  useLayoutEffect(() => {
    loader.current = load;
  });
  const inputsKey = JSON.stringify(inputs);
  const key = `${inputsKey}#${round}`;
  useEffect(() => {
    let live = true;
    loader.current().then(
      (data) => live && setState({ data, inputs: inputsKey, key }),
      (error: unknown) => live && setState({ error, inputs: inputsKey, key }),
    );
    return () => {
      live = false;
    };
  }, [inputsKey, key]);
  const reload = useCallback(() => setRound((r) => r + 1), []);
  const sameInputs = state.inputs === inputsKey;
  return {
    data: sameInputs ? state.data : undefined,
    error: state.key === key ? state.error : undefined,
    loading: state.key !== key,
    reload,
  };
}

/** Data, a loading skeleton or the error, for a resource. */
export function Loaded<T>({
  resource,
  children,
}: {
  resource: { data?: T; error?: unknown; loading: boolean };
  children: (data: T) => ReactNode;
}) {
  const { t } = useTranslation();
  if (resource.error) return <Banner tone="error">{errorMessage(resource.error, t)}</Banner>;
  if (resource.data === undefined) return <Skeleton label={t('common.loading')} lines={5} />;
  return <>{children(resource.data)}</>;
}

/** The reason every console change carries into the audit log. */
export function ReasonField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useTranslation();
  return (
    <Input
      label={t('console.common.reason')}
      hint={t('console.common.reason_hint')}
      value={value}
      required
      minLength={3}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function Status({ status }: { status: string }) {
  const { t } = useTranslation();
  return <StatusChip status={status} label={t(`console.status.${status}`, { defaultValue: status })} />;
}

export function useGridLabels(): DataGridLabels {
  const { t } = useTranslation();
  return {
    columns: t('console.common.columns'),
    views: t('console.common.views'),
    saveView: t('console.common.save_view'),
    viewName: t('console.common.view_name'),
    noRows: t('console.common.no_rows'),
  };
}

/** Runs a change and tells the person how it went: done (`done`, or Saved), or waiting for a second approver. */
export function useChange() {
  const { t } = useTranslation();
  const toast = useToast();
  return async (
    action: () => Promise<ChangeResult | unknown>,
    after?: () => void,
    done?: string,
  ): Promise<boolean> => {
    try {
      const result = await action();
      const pending = (result as ChangeResult | undefined)?.status === 'pending';
      toast(pending ? t('console.common.pending_approval') : (done ?? t('console.common.saved')), 'success');
      after?.();
      return true;
    } catch (e) {
      toast(errorMessage(e, t), 'error');
      return false;
    }
  };
}

export function when(iso: string | null | undefined, locale: string): string {
  return iso ? new Date(iso).toLocaleString(locale === 'ur' ? 'ur-PK' : 'en-GB') : '—';
}
