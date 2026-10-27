/**
 * Game actions (gesture callbacks / timers only): solve, place, remove, refuse and check an answer.
 */

import { useCallback, type Dispatch, type SetStateAction } from "react";

import { sfx } from "@/services/audio";

import { CAP_COUNT, COUNT_STEP_MS, SOLVED_HANDOFF_MS, STRUGGLE_REMOVALS, TARGET_TOP } from "../constants";
import type { FxKind } from "../types";
import type { GameRefs } from "./useGameRefs";

interface CapActionsArgs {
  target: number;
  refs: GameRefs;
  setPlaced: Dispatch<SetStateAction<number[]>>;
  setSolved: Dispatch<SetStateAction<boolean>>;
  schedule: (fn: () => void, ms: number) => void;
  fire: (ids: readonly number[], kind: FxKind, delayFor?: (index: number) => number, labelFor?: (index: number) => number) => void;
  syncCaps: (mode: "instant" | "spring", forceId?: number) => void;
}

export function useCapActions({ target, refs, setPlaced, setSolved, schedule, fire, syncCaps }: Readonly<CapActionsArgs>) {
  const { placedRef, solvedRef, palRef, removalsRef, flightRef, solvedCalledRef, cbRef } = refs;
  const solve = useCallback(
    (landMs: number) => {
      if (solvedRef.current) return;
      solvedRef.current = true;
      setSolved(true);
      schedule(() => sfx.solved(), landMs + 160);
      fire(placedRef.current, "bounce", (i) => (landMs + 260) / 1000 + i * 0.05);
      schedule(() => {
        if (solvedCalledRef.current) return;
        solvedCalledRef.current = true;
        cbRef.current.onSolved();
      }, SOLVED_HANDOFF_MS + landMs);
    },
    [fire, schedule, cbRef, placedRef, setSolved, solvedCalledRef, solvedRef],
  );

  /** Put `id` into the next empty slot. Returns false when the grid refuses it. */
  const placeCap = useCallback(
    (id: number, source: "drag" | "tap" | "auto"): boolean => {
      const current = placedRef.current;
      // The child decides when to stop, so all 10 slots are open. Once PAL is helping, the
      // slots past the target lock (the yellow chunk) and an extra cap bounces home.
      const limit = palRef.current ? target : CAP_COUNT;
      if (solvedRef.current || current.includes(id) || current.length >= limit) return false;
      const slot = current.length;
      const next = [...current, id];
      flightRef.current.set(id, source === "drag" ? "snap" : "fly");
      placedRef.current = next;
      setPlaced(next);

      // A dropped cap is right at the grid: click now. A flying cap clicks when it lands.
      const landMs = source === "drag" ? 0 : 240;
      if (landMs === 0) sfx.snap(slot);
      else schedule(() => sfx.snap(slot), landMs);

      if (next.length === TARGET_TOP) {
        const at = landMs + 180;
        schedule(() => sfx.groupPulse(), at);
        fire(next.slice(0, TARGET_TOP), "pulse", (i) => at / 1000 + i * 0.06);
      }
      return true;
    },
    [fire, schedule, target, flightRef, palRef, placedRef, setPlaced, solvedRef],
  );

  const removeCap = useCallback((id: number) => {
    const current = placedRef.current;
    if (!current.includes(id)) return;
    const next = current.filter((c) => c !== id);
    flightRef.current.set(id, "return");
    placedRef.current = next;
    setPlaced(next);
    sfx.release();
    removalsRef.current += 1;
    if (removalsRef.current >= STRUGGLE_REMOVALS && !palRef.current) cbRef.current.onStruggle();
  }, [cbRef, flightRef, palRef, placedRef, removalsRef, setPlaced]);

  /** The grid can't take another cap: it bounces home with a playful wobble (no text). */
  const refuseCap = useCallback(
    (id: number) => {
      sfx.release();
      fire([id], "wobble");
      flightRef.current.set(id, "return");
      syncCaps("spring", id);
      if (!solvedRef.current) cbRef.current.onStruggle();
    },
    [fire, syncCaps, cbRef, flightRef, solvedRef],
  );

  /**
   * "Done": right → the solved flourish. Wrong → count along: the caps hop up one by one with a rising
   * note and the count stops at the target. Extra caps are left out of the count (then hop until sent
   * back); if caps run out first, the count carries on into ghost caps in the empty slots. No error text.
   */
  const checkAnswer = useCallback(() => {
    const current = placedRef.current;
    if (solvedRef.current || current.length === 0) return;
    const correct = current.length === target;
    cbRef.current.onAttempt?.({ target, answer: current.length, correct });
    if (correct) {
      solve(0);
      return;
    }
    const counted = Math.min(current.length, target);
    fire(current.slice(0, counted), "count", (i) => (i * COUNT_STEP_MS) / 1000, (i) => i + 1);
    for (let k = 0; k < counted; k += 1) schedule(() => sfx.snap(k), k * COUNT_STEP_MS);
    const countEnd = counted * COUNT_STEP_MS;
    if (current.length > target) schedule(() => fire(current.slice(target), "wobble"), countEnd);
    // PAL steps in when the count stops: extras start hopping, or ghost caps appear and the count carries on.
    schedule(() => cbRef.current.onStruggle(), countEnd);
    for (let k = current.length; k < target; k += 1) schedule(() => sfx.snap(k), countEnd + 250 + (k - current.length) * COUNT_STEP_MS);
  }, [cbRef, fire, placedRef, schedule, solve, solvedRef, target]);

  return { placeCap, removeCap, refuseCap, checkAnswer };
}
