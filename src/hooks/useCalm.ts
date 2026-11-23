import { useReducedMotion } from "react-native-reanimated";

import { useActiveProfile } from "@/state/store";

/** Whether the playing child has Calm mode on. */
export function useCalm(): boolean {
  return useActiveProfile()?.calm === true;
}

/**
 * Whether to skip bouncing, sparkles and other movement: when the phone's Reduce Motion is on, or the playing child
 * has Calm mode on. Use this in place of `useReducedMotion` on any screen a child plays on.
 */
export function useCalmMotion(): boolean {
  const system = useReducedMotion();
  const calm = useCalm();
  return system || calm;
}
