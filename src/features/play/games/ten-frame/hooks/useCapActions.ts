import { useCallback, useRef, type Dispatch, type SetStateAction } from "react";

import { sfx } from "@/services/audio";

import { CAP_COUNT, COUNT_STEP_MS, SOLVED_HANDOFF_MS, STRUGGLE_REMOVALS, TARGET_TOP } from "../constants";
import type { FxKind } from "../types";
import type { GameRefs } from "./useGameRefs";

interface CapActionsArgs {
  target: number;
  refs: GameRefs;
  setPlaced: Dispatch<SetStateAction<number[]>>;
  setSolved: Dispatch<SetStateAction<boolean>>;
  setMisses: Dispatch<SetStateAction<number>>;
  initialMisses: number;
  schedule: (fn: () => void, ms: number) => void;
  fire: (ids: readonly number[], kind: FxKind, delayFor?: (index: number) => number, labelFor?: (index: number) => number) => void;
  syncCaps: (mode: "instant" | "spring", forceId?: number) => void;
}

export function useCapActions({ target, refs, setPlaced, setSolved, setMisses, initialMisses, schedule, fire, syncCaps }: Readonly<CapActionsArgs>) {
  const missesRef = useRef(initialMisses);
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

  const placeCap = useCallback(
    (id: number, source: "drag" | "tap" | "auto"): boolean => {
      const current = placedRef.current;
      const limit = palRef.current && missesRef.current >= 2 ? target : CAP_COUNT;
      if (solvedRef.current || current.includes(id) || current.length >= limit) return false;
      const slot = current.length;
      const next = [...current, id];
      flightRef.current.set(id, source === "drag" ? "snap" : "fly");
      placedRef.current = next;
      setPlaced(next);

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
    schedule(() => cbRef.current.onStruggle(), countEnd);
    missesRef.current += 1;
    setMisses(missesRef.current);
    if (missesRef.current < 2) return;
    for (let k = current.length; k < target; k += 1) schedule(() => sfx.snap(k), countEnd + 250 + (k - current.length) * COUNT_STEP_MS);
  }, [cbRef, fire, placedRef, schedule, setMisses, solve, solvedRef, target]);

  return { placeCap, removeCap, refuseCap, checkAnswer };
}
