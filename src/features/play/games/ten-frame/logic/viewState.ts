/**
 * Pure derived view state of the board: group tones, slot markers, frame decorations, labels.
 */

import { colors } from "@/theme";

import { CAP_COUNT, TARGET_TOP } from "../constants";
import type { BoardLayout, GroupTone, WellMode } from "../types";
import { clamp } from "../utils/math";

/** `tone` once the top row is full, otherwise no group tone. */
export function fullRowTone(topFull: boolean, tone: Exclude<GroupTone, null>): GroupTone {
  return topFull ? tone : null;
}

/** Keep the previous box (same object, no re-layout) unless the size really changed. */
export function nextBox(prev: { w: number; h: number } | null, width: number, height: number): { w: number; h: number } {
  return prev && Math.abs(prev.w - width) < 0.5 && Math.abs(prev.h - height) < 0.5 ? prev : { w: width, h: height };
}

/** Colour treatment of the top-row caps (`rowTone`) and of the "5" tile / target dots (`topTone`, only once the row is truly full). */
export function groupTones(palActive: boolean, topFull: boolean): { rowTone: GroupTone; topTone: GroupTone } {
  return {
    // The caps keep their own colours for a plain 5-group: gold only ever means "right answer".
    rowTone: palActive ? "mint" : null,
    topTone: fullRowTone(topFull, palActive ? "mint" : "gold"),
  };
}

/** The next empty slot, plus where the drop preview / idle hint show (-1 = nowhere). */
export function slotMarkers(
  count: number,
  target: number,
  palActive: boolean,
  solved: boolean,
  isDragging: boolean,
  near: boolean,
): { nextSlot: number; previewSlot: number; hintSlot: number } {
  // Every empty slot is fair game until PAL locks the ones past the target.
  const nextSlot = count < (palActive ? target : CAP_COUNT) ? count : -1;
  return {
    nextSlot,
    previewSlot: isDragging && near && !solved ? nextSlot : -1,
    hintSlot: !palActive && !isDragging && !solved ? nextSlot : -1,
  };
}

/** Compact / roomy sizes of the frame decorations. */
export function frameChrome(L: BoardLayout): { cellRadius: number; haloInset: number; badge: number; frameEdge: number } {
  if (L.compact) {
    // web shadow-chunky-sm (4px): a solid edge under the frame
    return { cellRadius: 16, haloInset: 2, badge: 40, frameEdge: 4 };
  }
  // web shadow-chunky (8px)
  return { cellRadius: clamp(Math.round(L.cell * 0.23), 22, 28), haloInset: 6, badge: 52, frameEdge: 8 };
}

export function gridLabelFor(topCount: number, bottomCount: number, solved: boolean, target: number): string {
  return (
    `Ten-frame: ${topCount} ${topCount === 1 ? "cap" : "caps"} in top row, ${bottomCount} in bottom row` +
    (solved ? `. ${target} = ${TARGET_TOP} + ${target - TARGET_TOP}` : "")
  );
}

export function wellModeFor(i: number, palActive: boolean, target: number): WellMode {
  if (!palActive) return "plain";
  if (i < TARGET_TOP) return "palTop";
  if (i < target) return "palDrop";
  return "palLocked";
}

export function frameColorFor(solved: boolean, previewing: boolean): string {
  if (solved) return colors.atYellow;
  return previewing ? colors.atTealLight : "rgba(0,79,74,0.2)";
}
