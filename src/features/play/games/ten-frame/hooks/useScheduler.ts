/**
 * setTimeout wrapper whose timers are all cleared on unmount.
 */

import { useCallback, useEffect, useRef } from "react";

export function useScheduler() {
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Every timer this module starts is cleared on unmount (the screen remounts modules often).
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timersRef.current.delete(t);
      fn();
    }, ms);
    timersRef.current.add(t);
  }, []);
}
