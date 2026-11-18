import { useSyncExternalStore } from 'react';

let currentTimestamp = typeof window !== 'undefined' ? Date.now() : 0;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  // Update timestamp every 15 seconds and notify subscribers cleanly
  setInterval(() => {
    currentTimestamp = Date.now();
    listeners.forEach((listener) => listener());
  }, 15000);
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return currentTimestamp;
}

function getServerSnapshot() {
  return 0;
}

/**
 * Pure React 19 / Next.js 16 compliant hook to subscribe to the current timestamp.
 * Returns a stable cached timestamp that updates every 15 seconds without infinite loops.
 */
export function useCurrentTimestamp(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
