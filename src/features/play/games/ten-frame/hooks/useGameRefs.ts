/**
 * Mirrors of game state for gesture callbacks / timers (always the latest values).
 */

import { useEffect, useMemo, useRef } from "react";

import { CAP_IDS } from "../constants";
import type { Flight, Geometry, Pt } from "../types";

export function useGameRefs(geo: Geometry, palActive: boolean, onSolved: () => void, onStruggle: () => void) {
  // Mirrors of state for gesture callbacks / timers (always the latest values).
  const geoRef = useRef<Geometry>(geo);
  const placedRef = useRef<number[]>([]);
  const solvedRef = useRef(false);
  const palRef = useRef(palActive);
  const draggingRef = useRef<number | null>(null);
  const nearRef = useRef(false);
  const removalsRef = useRef(0);
  const targetsRef = useRef<(Pt | null)[]>(CAP_IDS.map(() => null));
  const flightRef = useRef<Map<number, Flight>>(new Map());
  const solvedCalledRef = useRef(false);
  const cbRef = useRef({ onSolved, onStruggle });

  useEffect(() => {
    cbRef.current = { onSolved, onStruggle };
  }, [onSolved, onStruggle]);

  useEffect(() => {
    palRef.current = palActive;
  }, [palActive]);

  return useMemo(
    () => ({ geoRef, placedRef, solvedRef, palRef, draggingRef, nearRef, removalsRef, targetsRef, flightRef, solvedCalledRef, cbRef }),
    [],
  );
}

export type GameRefs = ReturnType<typeof useGameRefs>;
