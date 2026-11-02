import { cancelAnimation, withSpring } from "react-native-reanimated";

import { CAP_IDS, DEFAULT_TARGET, MAX_TARGET, MIN_TARGET } from "../constants";
import type { CapColor, CapMotion, Flight, Pt } from "../types";
import { clamp } from "../utils/math";
import { flightTransition } from "../utils/motion";

const CAP_COLORS: readonly CapColor[] = ["teal", "purple", "purple", "teal", "purple", "teal", "teal", "purple", "teal", "purple"];
export const capColor = (id: number): CapColor => CAP_COLORS[id % CAP_COLORS.length];

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
