/**
 * Idle invitation: an untouched tray cap hops now and then.
 */

import { useEffect, type RefObject } from "react";

import { INVITE_EVERY_MS } from "../constants";
import { firstTrayCap } from "../logic/caps";
import type { FxKind } from "../types";

export function useIdleInvite(
  idle: boolean,
  placedRef: RefObject<number[]>,
  draggingRef: RefObject<number | null>,
  fire: (ids: readonly number[], kind: FxKind) => void,
) {
  useEffect(() => {
    if (!idle) return;
    const t = setInterval(() => {
      const id = firstTrayCap(placedRef.current, draggingRef.current);
      if (id !== null) fire([id], "invite");
    }, INVITE_EVERY_MS);
    return () => clearInterval(t);
  }, [idle, fire, draggingRef, placedRef]);
}
