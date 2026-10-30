/**
 * Idle invitation: an untouched tray cap hops now and then. If the board is still empty after
 * DEMO_AFTER_MS, the first tray cap shows how to play — it glides most of the way to the first
 * empty slot (which is already glowing as the hint slot) and springs back home.
 */

import { useEffect, type RefObject } from "react";
import { withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";

import { DEMO_AFTER_MS, DEMO_EVERY_MS, INVITE_EVERY_MS } from "../constants";
import { firstTrayCap } from "../logic/caps";
import type { CapMotion, FxKind, Pt } from "../types";
import { EASE_IN_OUT, SPRING_RETURN } from "../utils/motion";

/** How far along the way to the slot the demo cap travels (it never "places" itself). */
const DEMO_REACH = 0.8;

export function useIdleInvite(
  idle: boolean,
  placedRef: RefObject<number[]>,
  draggingRef: RefObject<number | null>,
  fire: (ids: readonly number[], kind: FxKind) => void,
  caps: readonly CapMotion[],
  homes: readonly Pt[],
  firstSlot: Pt | undefined,
) {
  useEffect(() => {
    if (!idle) return;
    const hop = setInterval(() => {
      const id = firstTrayCap(placedRef.current, draggingRef.current);
      if (id !== null) fire([id], "invite");
    }, INVITE_EVERY_MS);

    const demo = () => {
      const id = firstTrayCap(placedRef.current, draggingRef.current);
      const home = id === null ? undefined : homes[id];
      if (id === null || !home || !firstSlot) return;
      const glide = (from: number, to: number) =>
        withSequence(
          withTiming(from + (to - from) * DEMO_REACH, { duration: 900, easing: EASE_IN_OUT }),
          withDelay(350, withSpring(from, SPRING_RETURN)),
        );
      caps[id].x.set(glide(home.x, firstSlot.x));
      caps[id].y.set(glide(home.y, firstSlot.y));
    };
    let every: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(() => {
      demo();
      every = setInterval(demo, DEMO_EVERY_MS);
    }, DEMO_AFTER_MS);

    return () => {
      clearInterval(hop);
      clearTimeout(first);
      if (every) clearInterval(every);
    };
  }, [idle, fire, draggingRef, placedRef, caps, homes, firstSlot]);
}
