import { useEffect, useState } from 'react';

type Listener = (now: number) => void;

const listeners = new Set<Listener>();
let timerId: number | null = null;

function tick() {
  const now = Date.now();
  listeners.forEach((listener) => listener(now));
}

function startTimer() {
  if (timerId !== null) return;
  timerId = window.setInterval(tick, 1000);
}

function stopTimer() {
  if (timerId === null) return;
  window.clearInterval(timerId);
  timerId = null;
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    // Resync immediately after the tab wakes up, then resume ticking.
    tick();
    startTimer();
  } else {
    stopTimer();
  }
}

/**
 * One shared 1s ticker for every countdown on the page.
 *
 * Each tick reads Date.now() directly (never decrements a counter), so the
 * display stays correct after the tab sleeps or the machine suspends. Returns
 * null until the first client render so no stale value is ever painted.
 */
export function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());

    const listener: Listener = (value) => setNow(value);
    const isFirstSubscriber = listeners.size === 0;

    if (isFirstSubscriber) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      if (document.visibilityState === 'visible') startTimer();
    }

    listeners.add(listener);
    tick();

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        stopTimer();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  return now;
}
