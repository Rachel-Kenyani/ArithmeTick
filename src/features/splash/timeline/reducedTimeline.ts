/**
 * Splash intro — the reduced-motion timeline: frame 1 → 4 → 9 → 10 → 11 → 12 as plain fades, no movement.
 */

import { withDelay, withSequence, withTiming } from "react-native-reanimated";

import type { SplashValues } from "../hooks/useSplashValues";
import { HOLD_LAST, T } from "./timeline";

export function startReducedTimeline(
  v: SplashValues,
  frame7Y: number,
  frame8X: number,
  done: (ok?: boolean) => void,
) {
  const {
    wordOpacity,
    smallOpacity,
    bigOpacity,
    sky,
    bigY,
    bigX,
    bodyOpacity,
    scene,
    bg11,
    bg12,
  } = v;
  // frame 1 → frame 4 → frame 9, as plain fades
  wordOpacity.set(withDelay(T.hold1, withTiming(0, { duration: 250 })));
  smallOpacity.set(withDelay(T.hold1, withTiming(0, { duration: 250 })));
  bigOpacity.set(withDelay(T.hold1, withTiming(1, { duration: 250 })));
  const nineAt = T.hold1 + 1200;
  sky.set(withDelay(T.hold1, withTiming(1, { duration: 250 })));
  bigY.set(withDelay(nineAt, withTiming(frame7Y, { duration: 1 })));
  bigX.set(withDelay(nineAt, withTiming(frame8X, { duration: 1 })));
  bodyOpacity.set(withDelay(nineAt, withTiming(1, { duration: 300 })));
  const tenAt = nineAt + 300 + T.hold9;
  scene.set(withDelay(tenAt, withTiming(1, { duration: 300 })));
  const elevenAt = tenAt + 300 + T.hold10;
  bg11.set(withDelay(elevenAt, withTiming(1, { duration: 300 })));
  bg12.set(
    withDelay(
      elevenAt + 300 + T.hold11,
      withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(HOLD_LAST, withTiming(1, { duration: 1 }, done)),
      ),
    ),
  );
}
