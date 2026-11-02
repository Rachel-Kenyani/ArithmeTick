import {
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { SplashValues } from "../hooks/useSplashValues";
import { AT, EASING, FINALE_AT, SQUASH_AT, SQUASH_MS } from "./timeline";

export function startFlourishes(v: SplashValues) {
  const { squashX, squashY, breath, burst, wink } = v;
  const pulses = (peak: number) =>
    withSequence(
      ...SQUASH_AT.map((t, i) =>
        withDelay(
          i === 0 ? t : t - SQUASH_AT[i - 1] - SQUASH_MS,
          withSequence(
            withTiming(peak, { duration: 80, easing: EASING.out }),
            withSpring(1, { duration: SQUASH_MS - 80, dampingRatio: 0.4 }),
          ),
        ),
      ),
    );
  squashX.set(pulses(1.08));
  squashY.set(pulses(0.92));
  breath.set(
    withDelay(
      AT[3],
      withRepeat(
        withSequence(
          withTiming(1.025, { duration: 900, easing: EASING.inOut }),
          withTiming(1, { duration: 900, easing: EASING.inOut }),
        ),
        -1,
      ),
    ),
  );
  burst.set(
    withDelay(
      FINALE_AT,
      withTiming(1, { duration: 650, easing: EASING.out }),
    ),
  );
  wink.set(
    withDelay(
      FINALE_AT + 250,
      withSequence(
        withTiming(0, { duration: 60 }),
        withDelay(220, withTiming(1, { duration: 60 })),
      ),
    ),
  );
}
