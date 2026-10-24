/**
 * Cap gesture / tap / screen-reader handlers: pick-up, near the grid, drop, tap to place / send back.
 */

import { useCallback, type Dispatch, type SetStateAction } from "react";

import { sfx } from "@/services/audio";

import { NEAR_PX, TARGET_TOP } from "../constants";
import { firstTrayCap } from "../logic/caps";
import type { FxKind } from "../types";
import { isPointNear } from "../utils/math";
import type { GameRefs } from "./useGameRefs";

interface CapHandlersArgs {
  refs: GameRefs;
  setDraggingId: Dispatch<SetStateAction<number | null>>;
  setNear: Dispatch<SetStateAction<boolean>>;
  fire: (ids: readonly number[], kind: FxKind, delayFor?: (index: number) => number) => void;
  syncCaps: (mode: "instant" | "spring", forceId?: number) => void;
  placeCap: (id: number, source: "drag" | "tap" | "auto") => boolean;
  refuseCap: (id: number) => void;
  removeCap: (id: number) => void;
}

export function useCapHandlers({ refs, setDraggingId, setNear, fire, syncCaps, placeCap, refuseCap, removeCap }: Readonly<CapHandlersArgs>) {
  const { geoRef, placedRef, solvedRef, palRef, draggingRef, nearRef, flightRef } = refs;
  const handleDragStart = useCallback((id: number) => {
    if (solvedRef.current) return;
    draggingRef.current = id;
    setDraggingId(id);
    sfx.pickup();
  }, [draggingRef, setDraggingId, solvedRef]);

  const handleNear = useCallback((isNear: boolean) => {
    const next = isNear && !solvedRef.current;
    if (next !== nearRef.current) {
      nearRef.current = next;
      setNear(next);
    }
  }, [nearRef, setNear, solvedRef]);

  const handleDragEnd = useCallback(
    (id: number, px: number, py: number) => {
      const dropNear = isPointNear(px, py, geoRef.current.grid, NEAR_PX);
      draggingRef.current = null;
      setDraggingId(null);
      nearRef.current = false;
      setNear(false);

      if (solvedRef.current) {
        flightRef.current.set(id, "return");
        syncCaps("spring", id);
        return;
      }
      if (dropNear) {
        if (!placeCap(id, "drag")) refuseCap(id);
        return;
      }
      sfx.release();
      flightRef.current.set(id, "return");
      syncCaps("spring", id);
    },
    [placeCap, refuseCap, syncCaps, draggingRef, flightRef, geoRef, nearRef, setDraggingId, setNear, solvedRef],
  );

  const handleTap = useCallback(
    (id: number) => {
      if (solvedRef.current) return;
      // Native only: a cap currently held by a finger can't also be tapped.
      if (draggingRef.current === id) return;
      const current = placedRef.current;
      const slot = current.indexOf(id);
      if (slot === -1) {
        // Tap / screen-reader alternative to dragging: the cap hops into the next slot.
        sfx.pickup();
        if (!placeCap(id, "tap")) refuseCap(id);
        return;
      }
      if (palRef.current && slot < TARGET_TOP) {
        // Locked 5-group: it can't leave, but it lights up together.
        sfx.groupPulse();
        fire(current.slice(0, TARGET_TOP), "pulse", (i) => i * 0.05);
        return;
      }
      removeCap(id);
    },
    [fire, placeCap, refuseCap, removeCap, draggingRef, palRef, placedRef, solvedRef],
  );

  /** Screen reader: activating the next empty slot sends the first tray cap there (same as tapping it). */
  const fillNext = useCallback(() => {
    const id = firstTrayCap(placedRef.current, draggingRef.current);
    if (id !== null) handleTap(id);
  }, [handleTap, draggingRef, placedRef]);

  return { handleDragStart, handleNear, handleDragEnd, handleTap, fillNext };
}
