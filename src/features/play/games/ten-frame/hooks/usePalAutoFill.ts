/**
 * Stealth PAL: auto-complete the top row once the board is measured.
 */

import { useEffect, type RefObject } from "react";

import { PAL_FILL_STAGGER_MS, PAL_FILL_START_MS, TARGET_TOP } from "../constants";

export function usePalAutoFill(palActive: boolean, measured: boolean, placedRef: RefObject<number[]>, autoPlaceOne: () => void) {
  useEffect(() => {
    if (!palActive || !measured) return;
    const missing = TARGET_TOP - Math.min(placedRef.current.length, TARGET_TOP);
    if (missing <= 0) return;
    const ids: ReturnType<typeof setTimeout>[] = [];
    for (let k = 0; k < missing; k += 1) {
      ids.push(setTimeout(autoPlaceOne, PAL_FILL_START_MS + k * PAL_FILL_STAGGER_MS));
    }
    return () => ids.forEach((t) => clearTimeout(t));
  }, [palActive, measured, autoPlaceOne, placedRef]);
}
