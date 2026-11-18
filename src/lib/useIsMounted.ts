import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Hook to safely detect client hydration without triggering cascading setState in useEffect
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
