import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { CrudApi, ListParams } from '../api/crud';

export type CrudMode = 'view' | 'new' | 'edit';

export interface UseCrudResourceResult<T, TCreate, TUpdate> {
  rows: T[];
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;

  selected: T | null;
  select: (row: T | null) => void;

  mode: CrudMode;
  openNew: () => void;
  openEdit: (row: T) => void;
  cancel: () => void;

  save: (payload: TCreate | TUpdate) => void;
  remove: (row?: T) => void;

  isBusy: boolean;
  /** Server-side failure message, cleared on the next successful write. */
  error: string;
  setError: (message: string) => void;
  /** Confirmation message after a successful write. */
  status: string;

  /** True when there is no company on the token — every list will be empty. */
  noCompany: boolean;
}

/**
 * Binds a window to a backend CRUD resource.
 *
 * Every SAP-style setup window in this app repeats the same shape: a list on the
 * left, a form on the right, and New / Edit / Delete in the toolbar. Rather than
 * re-implement the query keys, optimistic invalidation and error plumbing in
 * each one, they share this hook — so a fix to error handling lands everywhere
 * at once, and no window can forget to invalidate its list after a save.
 *
 * `queryKey` must be unique per resource; the company id is appended so
 * switching companies never serves another tenant's cached rows.
 */
export function useCrudResource<T extends { id: string }, TCreate = Partial<T>, TUpdate = Partial<TCreate>>(
  queryKey: string,
  crud: CrudApi<T, TCreate, TUpdate>,
  options: {
    params?: ListParams;
    /** Confirm before delete. Return false to abort. */
    confirmDelete?: (row: T) => boolean;
    /** Label used in the delete confirmation and status messages. */
    label?: (row: T) => string;
    enabled?: boolean;
  } = {},
): UseCrudResourceResult<T, TCreate, TUpdate> {
  const { user } = useAuth();
  const qc = useQueryClient();
  const companyId = user?.companyId ?? null;

  const [selected, setSelected] = useState<T | null>(null);
  const [mode, setMode] = useState<CrudMode>('view');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const label = options.label ?? ((row: T) => (row as { name?: string }).name ?? row.id);
  const enabled = (options.enabled ?? true) && !!companyId;

  const listKey = useMemo(
    () => [queryKey, companyId, options.params ?? null],
    [queryKey, companyId, options.params],
  );

  const query = useQuery({
    queryKey: listKey,
    queryFn: () => crud.getAll(options.params),
    enabled,
  });

  const invalidate = useCallback(() => {
    // Prefix match so any params variant of this resource refreshes too.
    void qc.invalidateQueries({ queryKey: [queryKey] });
  }, [qc, queryKey]);

  const onWriteError = useCallback((e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected that change.');
    setStatus('');
  }, []);

  const createMut = useMutation({
    mutationFn: (payload: TCreate) => crud.create(payload),
    onSuccess: (row) => {
      invalidate();
      setSelected(row);
      setMode('view');
      setError('');
      setStatus('Created.');
    },
    onError: onWriteError,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TUpdate }) => crud.update(id, payload),
    onSuccess: (row) => {
      invalidate();
      setSelected(row);
      setMode('view');
      setError('');
      setStatus('Saved.');
    },
    onError: onWriteError,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => crud.remove(id),
    onSuccess: () => {
      invalidate();
      setSelected(null);
      setMode('view');
      setError('');
      setStatus('Deleted.');
    },
    onError: onWriteError,
  });

  const openNew = useCallback(() => {
    setSelected(null);
    setMode('new');
    setError('');
    setStatus('');
  }, []);

  const openEdit = useCallback((row: T) => {
    setSelected(row);
    setMode('edit');
    setError('');
    setStatus('');
  }, []);

  const cancel = useCallback(() => {
    setMode('view');
    setError('');
    setStatus('');
  }, []);

  const save = useCallback(
    (payload: TCreate | TUpdate) => {
      setError('');
      if (mode === 'new') {
        createMut.mutate(payload as TCreate);
      } else if (mode === 'edit' && selected) {
        updateMut.mutate({ id: selected.id, payload: payload as TUpdate });
      }
    },
    [mode, selected, createMut, updateMut],
  );

  const remove = useCallback(
    (row?: T) => {
      const target = row ?? selected;
      if (!target) return;
      const confirmFn =
        options.confirmDelete ??
        ((r: T) => window.confirm(`Delete "${label(r)}"? This cannot be undone.`));
      if (!confirmFn(target)) return;
      deleteMut.mutate(target.id);
    },
    [selected, deleteMut, options, label],
  );

  return {
    rows: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: () => void query.refetch(),

    selected,
    select: (row) => {
      setSelected(row);
      setMode('view');
      setError('');
      setStatus('');
    },

    mode,
    openNew,
    openEdit,
    cancel,

    save,
    remove,

    isBusy: createMut.isPending || updateMut.isPending || deleteMut.isPending,
    error,
    setError,
    status,

    noCompany: !companyId,
  };
}
