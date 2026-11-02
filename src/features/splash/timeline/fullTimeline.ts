import {
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { SplashValues } from "../hooks/useSplashValues";
import { FRAME3_DROP } from "../constants";
import { AT, EASING, HOLD_LAST, SPRING, STEPS } from "./timeline";

export function startFullTimeline(
  v: SplashValues,
  centreShift: number,
  frame7Y: number,
  frame8X: number,
  done: (ok?: boolean) => void,
) {
  const {
    wordOpacity,
    wordY,
    owlY,
    smallOpacity,
    bigOpacity,
    bigScale,
    pupils,
    sky,
    bigY,
    bigX,
    bodyOpacity,
    scene,
    bg11,
    bg12,
    headTilt,
  } = v;
  const at = AT;
  const ease = (i: number, to: number) => {
    "worklet";
    const step = STEPS[i];
    return step.spring
      ? withSpring(to, {
          duration: step.duration,
          dampingRatio: SPRING[step.spring],
        })
      : withTiming(to, {
          duration: step.duration,
          easing: EASING[step.easing],
        });
  };
  const after = (i: number, to: number) => withDelay(at[i], ease(i, to));
  wordOpacity.set(after(0, 0));
  wordY.set(after(0, 24));
  owlY.set(
    withSequence(
      after(0, centreShift),
      withDelay(
        at[1] - at[0] - STEPS[0].duration,
        ease(1, centreShift + FRAME3_DROP),
      ),
    ),
  );
  smallOpacity.set(withDelay(at[2], withTiming(0, { duration: 0 })));
  bigOpacity.set(withDelay(at[2], withTiming(1, { duration: 0 })));
  bigScale.set(after(2, 1));
  pupils.set(
    withSequence(
      after(3, 0),
      withDelay(at[4] - at[3] - STEPS[3].duration, ease(4, 1)),
    ),
  );
  sky.set(after(4, 1));
  bigY.set(
    withSequence(
      after(2, 0),
      withDelay(at[5] - at[2] - STEPS[2].duration, ease(5, frame7Y)),
    ),
  );
  bigX.set(after(6, frame8X));
  bodyOpacity.set(after(7, 1));
  scene.set(after(8, 1));
  bg11.set(after(9, 1));
  bg12.set(after(10, 1));
  const gap = (i: number) => at[i] - at[i - 1] - STEPS[i - 1].duration;
  headTilt.set(
    withSequence(
      after(10, 20),
      withDelay(gap(11), ease(11, -20)),
      withDelay(gap(12), ease(12, 0)),
      withDelay(HOLD_LAST, withTiming(0, { duration: 1 }, done)),
    ),
  );
}
