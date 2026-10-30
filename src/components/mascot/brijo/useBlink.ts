/**
 * Brijo eyelids: a one-shot blink helper plus natural blinking on a random timer.
 */

import { useCallback, useEffect } from "react";
import { Easing, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

export function useBlink(canBlink: boolean) {
  const lid = useSharedValue(0);

  const blinkOnce = useCallback(
    (double: boolean) => {
      const down = { duration: 90, easing: Easing.inOut(Easing.quad) };
      const up = { duration: 110, easing: Easing.inOut(Easing.quad) };
      lid.set(double
        ? withSequence(withTiming(1, down), withTiming(0, up), withTiming(1, down), withTiming(0, up))
        : withSequence(withTiming(1, down), withTiming(0, up)));
    },
    [lid],
  );
  // Natural blinking every ~3–5s (sometimes a double blink).
  useEffect(() => {
    if (!canBlink) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      timer = setTimeout(() => {
        blinkOnce(Math.random() < 0.2); // NOSONAR decorative animation timing, not security-sensitive
        schedule();
      }, 3000 + Math.random() * 2000); // NOSONAR decorative animation timing, not security-sensitive
    };
    schedule();
    return () => clearTimeout(timer);
  }, [canBlink, blinkOnce]);

  return { lid, blinkOnce };
}
