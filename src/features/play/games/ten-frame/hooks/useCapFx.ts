/**
 * A cap's one-shot effects: squash-pop on landing plus the wobble / pulse / bounce / invite the board requests.
 */

import { useEffect } from "react";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import type { FxSignal } from "../types";
import { EASE_IN_OUT, keyframes } from "../utils/motion";

export function useCapFx(fx: FxSignal | undefined, landed: number, reduced: boolean) {
  const fxScale = useSharedValue(1);
  const fxRot = useSharedValue(0);
  const fxY = useSharedValue(0);

  // A little squash-pop when the cap lands in a slot.
  useEffect(() => {
    if (landed > 0) fxScale.set(keyframes([1, 1.16, 0.95, 1], 450, 140));
  }, [landed, fxScale]);

  // One-shot effects requested by the board.
  useEffect(() => {
    if (!fx) return;
    const delay = fx.delay * 1000;
    if (fx.kind === "wobble") {
      fxRot.set(keyframes([0, -14, 12, -8, 5, 0], 550, delay, EASE_IN_OUT));
    } else if (fx.kind === "pulse") {
      fxScale.set(keyframes([1, 1.15, 1], 420, delay));
    } else if (fx.kind === "bounce" || fx.kind === "count") {
      fxY.set(keyframes(reduced ? [0, -4, 0] : [0, -18, 0, -7, 0], 750, delay));
    } else {
      fxY.set(keyframes([0, -12, 0, -5, 0], 800, delay));
      fxRot.set(keyframes([0, -6, 6, 0, 0], 800, delay));
    }
  }, [fx, reduced, fxRot, fxScale, fxY]);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: fxY.get() }, { rotate: `${fxRot.get()}deg` }, { scale: fxScale.get() }],
  }));
}
