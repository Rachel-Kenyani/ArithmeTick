/**
 * Game actions (gesture callbacks / timers only): solve, place, remove, refuse and PAL auto-place.
 */

import { useCallback, type Dispatch, type SetStateAction } from "react";

import { sfx } from "@/services/audio";

import { SOLVED_HANDOFF_MS, STRUGGLE_REMOVALS, TARGET_TOP } from "../constants";
import { firstTrayCap } from "../logic/caps";
import type { FxKind } from "../types";
import type { GameRefs } from "./useGameRefs";

interface CapActionsArgs {
  target: number;
  refs: GameRefs;
  setPlaced: Dispatch<SetStateAction<number[]>>;
  setSolved: Dispatch<SetStateAction<boolean>>;
  schedule: (fn: () => void, ms: number) => void;
  fire: (ids: readonly number[], kind: FxKind, delayFor?: (index: number) => number) => void;
  syncCaps: (mode: "instant" | "spring", forceId?: number) => void;
}

export function useCapActions({ target, refs, setPlaced, setSolved, schedule, fire, syncCaps }: Readonly<CapActionsArgs>) {
  const { placedRef, solvedRef, palRef, draggingRef, removalsRef, flightRef, solvedCalledRef, cbRef } = refs;
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
      // A (target + 1)th cap has no slot: refused. (With target 10 the frame is simply full.)
      if (solvedRef.current || current.includes(id) || current.length >= target) return false;
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
      if (next.length === target) solve(landMs);
      return true;
    },
    [fire, schedule, solve, target, flightRef, placedRef, setPlaced, solvedRef],
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

  const autoPlaceOne = useCallback(() => {
    if (solvedRef.current || placedRef.current.length >= TARGET_TOP) return;
    const id = firstTrayCap(placedRef.current, draggingRef.current);
    if (id !== null) placeCap(id, "auto");
  }, [placeCap, placedRef, solvedRef, draggingRef]);

  return { placeCap, removeCap, refuseCap, autoPlaceOne };
}
