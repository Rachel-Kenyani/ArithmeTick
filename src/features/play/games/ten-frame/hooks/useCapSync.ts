import { useCallback, useLayoutEffect, useMemo } from "react";
import { useSharedValue } from "react-native-reanimated";

import { CAP_IDS } from "../constants";
import { moveCapToTarget } from "../logic/caps";
import type { CapMotion, DragShared, Geometry, Rect4 } from "../types";
import type { GameRefs } from "./useGameRefs";

export function useCapSync(geo: Geometry, caps: CapMotion[], placed: number[], refs: GameRefs) {
  const { geoRef, placedRef, draggingRef, targetsRef, flightRef } = refs;
  const dragActive = useSharedValue(-1);
  const dragNear = useSharedValue(false);
  const gridRect = useSharedValue<Rect4>(geo.grid);
  const drag = useMemo<DragShared>(() => ({ active: dragActive, near: dragNear, grid: gridRect }), [dragActive, dragNear, gridRect]);

  const syncCaps = useCallback(
    (mode: "instant" | "spring", forceId?: number) => {
      const g = geoRef.current;
      const current = placedRef.current;
      for (const id of CAP_IDS) {
        if (draggingRef.current === id) continue;
        const slot = current.indexOf(id);
        const target = slot >= 0 ? g.slots[slot] : g.homes[id];
        const prev = targetsRef.current[id];
        targetsRef.current[id] = target;
        moveCapToTarget(id, target, prev, caps[id], flightRef.current, mode, forceId);
      }
    },
    [caps, draggingRef, flightRef, geoRef, placedRef, targetsRef],
  );

  useLayoutEffect(() => {
    geoRef.current = geo;
    gridRect.set(geo.grid);
    syncCaps("instant");
  }, [geo, gridRect, syncCaps, geoRef]);

  useLayoutEffect(() => {
    syncCaps("spring");
  }, [placed, syncCaps]);

  return { drag, syncCaps };
}
