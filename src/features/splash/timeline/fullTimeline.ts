/**
 * Splash intro — the full-motion frame timeline: frames 1 → 14 as Figma's "After delay → Smart animate" steps.
 */

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
  // Each step is the Figma prototype's "After delay → Smart animate" from one frame to the next; a delay counts from
  // the end of the previous transition.
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
  // 1 → 2: the wordmark drops and fades; the owl slides to the exact centre of the screen
  wordOpacity.set(after(0, 0));
  wordY.set(after(0, 24));
  // 2 → 3: then sinks 29px below centre
  owlY.set(
    withSequence(
      after(0, centreShift),
      withDelay(
        at[1] - at[0] - STEPS[0].duration,
        ease(1, centreShift + FRAME3_DROP),
      ),
    ),
  );
  // 3 → 4: swap to the big owl (same size/spot) and spring it up to the centre
  smallOpacity.set(withDelay(at[2], withTiming(0, { duration: 0 })));
  bigOpacity.set(withDelay(at[2], withTiming(1, { duration: 0 })));
  bigScale.set(after(2, 1));
  // 4 → 5: blink; 5 → 6: the eyes reopen and the teal pattern gives way to the sky
  pupils.set(
    withSequence(
      after(3, 0),
      withDelay(at[4] - at[3] - STEPS[3].duration, ease(4, 1)),
    ),
  );
  sky.set(after(4, 1));
  // 2/3 → 4: back to the centre; 6 → 7: the head floats up
  bigY.set(
    withSequence(
      after(2, 0),
      withDelay(at[5] - at[2] - STEPS[2].duration, ease(5, frame7Y)),
    ),
  );
  // 7 → 8: then slides right
  bigX.set(after(6, frame8X));
  // 8 → 9: wings, body and feet appear below the head
  bodyOpacity.set(after(7, 1));
  // 9 → 10: the branch grows in under Jaymo from the left and the grass rises along the bottom
  scene.set(after(8, 1));
  // 10 → 11: clouds, canopy and taller plants; 11 → 12: vines
  bg11.set(after(9, 1));
  bg12.set(after(10, 1));
  // 11 → 12: the head tilts one way; 12 → 13: the other; 13 → 14: straight again, then hold
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
