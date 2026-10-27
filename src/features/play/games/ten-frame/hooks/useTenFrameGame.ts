/**
 * The ten-frame game state machine: grid contents, drag state, cap effects and every action wired together.
 */

import { useCallback, useState } from "react";
import { makeMutable } from "react-native-reanimated";

import type { GradeModuleProps } from "@/types/domain";

import { CAP_IDS } from "../constants";
import type { CapMotion, FxKind, FxSignal, Geometry } from "../types";
import { useCapActions } from "./useCapActions";
import { useCapHandlers } from "./useCapHandlers";
import { useCapSync } from "./useCapSync";
import { useGameRefs } from "./useGameRefs";
import { useIdleInvite } from "./useIdleInvite";
import { useScheduler } from "./useScheduler";

interface TenFrameGameArgs {
  target: number;
  palActive: boolean;
  onSolved: () => void;
  onStruggle: () => void;
  onAttempt?: NonNullable<GradeModuleProps["onAttempt"]>;
  geo: Geometry;
  measured: boolean;
  reduced: boolean;
}

export function useTenFrameGame({ target, palActive, onSolved, onStruggle, onAttempt, geo, measured, reduced }: Readonly<TenFrameGameArgs>) {
  const [placed, setPlaced] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [near, setNear] = useState(false);
  const [fx, setFx] = useState<Partial<Record<number, FxSignal>>>({});
  const [caps] = useState<CapMotion[]>(() => CAP_IDS.map(() => ({ x: makeMutable(0), y: makeMutable(0) })));

  const refs = useGameRefs(geo, palActive, onSolved, onStruggle, onAttempt);
  const schedule = useScheduler();

  const fire = useCallback((ids: readonly number[], kind: FxKind, delayFor?: (index: number) => number, labelFor?: (index: number) => number) => {
    setFx((prev) => {
      const next = { ...prev };
      ids.forEach((id, i) => {
        next[id] = { kind, n: (prev[id]?.n ?? 0) + 1, delay: delayFor ? delayFor(i) : 0, label: labelFor?.(i) };
      });
      return next;
    });
  }, []);

  const { drag, syncCaps } = useCapSync(geo, caps, placed, refs);
  const { placeCap, removeCap, refuseCap, checkAnswer } = useCapActions({ target, refs, setPlaced, setSolved, schedule, fire, syncCaps });
  const handlers = useCapHandlers({ refs, setDraggingId, setNear, fire, syncCaps, placeCap, refuseCap, removeCap });

  const idle = measured && !solved && placed.length === 0 && draggingId === null && !reduced;
  useIdleInvite(idle, refs.placedRef, refs.draggingRef, fire);

  return { placed, solved, draggingId, near, fx, caps, drag, checkAnswer, ...handlers };
}
