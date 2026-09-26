import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

/**
 * Loads the options for one dropdown (pay periods, loan types, categories …).
 *
 * Replaces the `api.getAll().then(setX).catch(() => setX([]))` pattern every
 * HR-Payroll window used. That pattern turned a 500, a 403 or a timeout into
 * an empty dropdown that looked exactly like "no data", so a broken request was
 * indistinguishable from a company that simply had nothing set up. Here a
 * failure comes back as `error`, which the window shows in its StatusNote.
 *
 * Keyed by the active company, so switching companies refetches instead of
 * showing the previous tenant's options — and a response that arrives late for
 * company A is cached under A's key and never rendered into company B's window.
 */
export function useLookup<T>(
  label: string,
  load: () => Promise<T[]>,
  options: { enabled?: boolean; params?: unknown } = {},
) {
  const { activeCompanyId } = useAuth();
  const enabled = (options.enabled ?? true) && !!activeCompanyId;
  const query = useQuery({
    queryKey: ['lookup', label, activeCompanyId, options.params ?? null],
    queryFn: load,
    enabled,
    staleTime: 60_000,
  });
  const message = query.error instanceof Error ? query.error.message : query.error ? String(query.error) : '';
  return {
    items: (query.data ?? []) as T[],
    isLoading: query.isLoading && enabled,
    error: message ? `Could not load ${label}: ${message}` : '',
    reload: () => void query.refetch(),
  };
}

/** The first failure among a window's lookups, for its StatusNote. */
export const firstError = (...errors: (string | undefined | null)[]) => errors.find((e) => !!e) ?? '';
