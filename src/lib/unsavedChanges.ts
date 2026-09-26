import { useEffect, useRef } from 'react';

/**
 * Windows with edits that have not been saved yet.
 *
 * Switching company from Choose Company clears every cached list and resets
 * every window to the new tenant. A half-edited payroll grid would otherwise
 * vanish without a word — or worse, a Save pressed a moment later would land
 * in the company the user had just switched to. Windows register a "dirty"
 * check here; anything that is about to throw that work away asks first.
 */
type Guard = { label: string; isDirty: () => boolean };
const guards = new Map<symbol, Guard>();

export function useUnsavedChangesGuard(label: string, isDirty: boolean) {
  const dirty = useRef(isDirty);
  dirty.current = isDirty;
  useEffect(() => {
    const key = Symbol(label);
    guards.set(key, { label, isDirty: () => dirty.current });
    return () => { guards.delete(key); };
  }, [label]);
}

/** Names of the windows that would lose work right now. */
export const dirtyWindows = () => [...guards.values()].filter((g) => g.isDirty()).map((g) => g.label);

/** True when there is nothing to lose, or the user agreed to lose it. */
export function confirmDiscardUnsaved(action: string): boolean {
  const names = dirtyWindows();
  if (!names.length) return true;
  return window.confirm(
    `${[...new Set(names)].join(', ')} ${names.length === 1 ? 'has' : 'have'} unsaved changes.\n\n` +
      `${action} will discard them. Continue?`,
  );
}
