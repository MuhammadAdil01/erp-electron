// Staff sessions end after 30 minutes without use (D5). The API refuses to refresh an idle
// session; this signs the page out at the same moment, so nobody finds a console left open.

export const STAFF_IDLE_MS = 30 * 60_000;

const ACTIVITY = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

export type IdleTimerOptions = {
  timeoutMs?: number;
  onIdle: () => void;
  target?: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
};

/** Calls onIdle after timeoutMs without activity; returns a function that stops watching. */
export function startIdleTimer({
  timeoutMs = STAFF_IDLE_MS,
  onIdle,
  target = window,
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
}: IdleTimerOptions): () => void {
  let handle = setTimer(onIdle, timeoutMs);
  const reset = () => {
    clearTimer(handle);
    handle = setTimer(onIdle, timeoutMs);
  };
  for (const event of ACTIVITY) target.addEventListener(event, reset, { passive: true });
  return () => {
    clearTimer(handle);
    for (const event of ACTIVITY) target.removeEventListener(event, reset);
  };
}
