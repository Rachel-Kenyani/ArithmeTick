/**
 * Keeps every cap on its computed spot: shared drag values for the gestures + syncing caps to slots / tray dimples.
 */

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

  /**
   * Move every cap (except the one under a finger) to the centre of its slot / tray dimple,
   * computed from the board geometry. "instant" = jump (first layout, resize), "spring" = animate caps
   * whose target moved (plus `forceId`, e.g. a cap that was dropped far away and must fly home).
   */
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

  // New sizes → put every cap exactly on its spot (before paint).
  useLayoutEffect(() => {
    geoRef.current = geo;
    gridRect.set(geo.grid);
    syncCaps("instant");
  }, [geo, gridRect, syncCaps, geoRef]);

  // Grid contents changed → spring the caps that have somewhere new to be.
  useLayoutEffect(() => {
    syncCaps("spring");
  }, [placed, syncCaps]);

  return { drag, syncCaps };
}
