import { describe, expect, it, vi } from 'vitest';
import { startIdleTimer, STAFF_IDLE_MS } from './idle';

describe('staff idle timeout (D5)', () => {
  function fakeTimers() {
    let now = 0;
    const timers: { at: number; fn: () => void; id: number }[] = [];
    let next = 1;
    return {
      set: (fn: () => void, ms: number) => {
        const id = next++;
        timers.push({ at: now + ms, fn, id });
        return id;
      },
      clear: (id: unknown) => {
        const i = timers.findIndex((t) => t.id === id);
        if (i >= 0) timers.splice(i, 1);
      },
      advance: (ms: number) => {
        now += ms;
        for (const t of [...timers].filter((t) => t.at <= now)) {
          timers.splice(timers.indexOf(t), 1);
          t.fn();
        }
      },
    };
  }

  it('signs out after 30 minutes without activity, and activity starts the count again', () => {
    const timers = fakeTimers();
    const target = new EventTarget();
    const onIdle = vi.fn();
    const stop = startIdleTimer({
      onIdle,
      target,
      setTimer: timers.set,
      clearTimer: timers.clear,
    });
    timers.advance(STAFF_IDLE_MS - 1000);
    target.dispatchEvent(new Event('keydown'));
    timers.advance(STAFF_IDLE_MS - 1000);
    expect(onIdle).not.toHaveBeenCalled();
    timers.advance(1000);
    expect(onIdle).toHaveBeenCalledTimes(1);
    stop();
  });

  it('stops watching when signed out', () => {
    const timers = fakeTimers();
    const onIdle = vi.fn();
    const stop = startIdleTimer({
      onIdle,
      target: new EventTarget(),
      setTimer: timers.set,
      clearTimer: timers.clear,
    });
    stop();
    timers.advance(STAFF_IDLE_MS * 2);
    expect(onIdle).not.toHaveBeenCalled();
  });
});
