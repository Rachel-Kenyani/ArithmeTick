/**
 * Pure cap bookkeeping: colours, targets, tray / slot lookups and sending a cap to its spot.
 */

import { cancelAnimation, withSpring } from "react-native-reanimated";

import { CAP_IDS, DEFAULT_TARGET, MAX_TARGET, MIN_TARGET } from "../constants";
import type { CapColor, CapMotion, Flight, Pt } from "../types";
import { clamp } from "../utils/math";
import { flightTransition } from "../utils/motion";

/** Colours are mixed on purpose: they are only for looks, so they never hint how many caps to use. */
const CAP_COLORS: readonly CapColor[] = ["teal", "purple", "purple", "teal", "purple", "teal", "teal", "purple", "teal", "purple"];
export const capColor = (id: number): CapColor => CAP_COLORS[id % CAP_COLORS.length];

/** Any incoming `target` becomes a whole number in 6..10 (bad input → the default 7). */
export function normalizeTarget(target: number | undefined): number {
  if (target === undefined || !Number.isFinite(target)) return DEFAULT_TARGET;
  return clamp(Math.round(target), MIN_TARGET, MAX_TARGET);
}

export function firstTrayCap(placed: readonly number[], exclude: number | null): number | null {
  for (const id of CAP_IDS) {
    if (id !== exclude && !placed.includes(id)) return id;
  }
  return null;
}

/** The slot cap `id` sits in, or null while it is in the tray. */
export function slotOf(placed: readonly number[], id: number): number | null {
  const slot = placed.indexOf(id);
  return slot >= 0 ? slot : null;
}

export function isSlotBelow(slot: number | null, limit: number): boolean {
  return slot !== null && slot < limit;
}

export function trayDimpleBorder(id: number): string {
  return capColor(id) === "teal" ? "rgba(0,111,104,0.25)" : "rgba(109,65,163,0.25)";
}

/**
 * Point one cap at its slot / tray dimple. "instant" jumps it there; "spring" animates it only when
 * its target moved (or it is `forceId`), using the flight kind queued for it.
 */
export function moveCapToTarget(
  id: number,
  target: Pt,
  prev: Pt | null,
  motion: CapMotion,
  flights: Map<number, Flight>,
  mode: "instant" | "spring",
  forceId?: number,
): void {
  const { x, y } = motion;
  if (mode === "instant") {
    flights.delete(id);
    cancelAnimation(x);
    cancelAnimation(y);
    x.set(target.x);
    y.set(target.y);
    return;
  }
  const unchanged = prev !== null && Math.abs(prev.x - target.x) < 0.5 && Math.abs(prev.y - target.y) < 0.5;
  if (unchanged && forceId !== id) return;
  const kind = flights.get(id) ?? "snap";
  flights.delete(id);
  x.set(withSpring(target.x, flightTransition(kind, "x")));
  y.set(withSpring(target.y, flightTransition(kind, "y")));
}
