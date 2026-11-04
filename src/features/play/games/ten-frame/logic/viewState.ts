import { colors } from "@/theme";

import { CAP_COUNT, TARGET_TOP } from "../constants";
import type { BoardLayout, GroupTone, WellMode } from "../types";
import { clamp } from "../utils/math";

export function fullRowTone(topFull: boolean, tone: Exclude<GroupTone, null>): GroupTone {
  return topFull ? tone : null;
}

export function nextBox(prev: { w: number; h: number } | null, width: number, height: number): { w: number; h: number } {
  return prev && Math.abs(prev.w - width) < 0.5 && Math.abs(prev.h - height) < 0.5 ? prev : { w: width, h: height };
}

export function groupTones(palActive: boolean, topFull: boolean): { rowTone: GroupTone; topTone: GroupTone } {
  return {
    rowTone: palActive ? "mint" : null,
    topTone: fullRowTone(topFull, palActive ? "mint" : "gold"),
  };
}

export function slotMarkers(
  count: number,
  target: number,
  palActive: boolean,
  revealAll: boolean,
  solved: boolean,
  isDragging: boolean,
  near: boolean,
): { nextSlot: number; previewSlot: number; hintSlot: number } {
  const limit = palActive && revealAll ? target : CAP_COUNT;
  const nextSlot = count < limit ? count : -1;
  return {
    nextSlot,
    previewSlot: isDragging && near && !solved ? nextSlot : -1,
    hintSlot: !palActive && !isDragging && !solved ? nextSlot : -1,
  };
}

export function frameChrome(L: BoardLayout): { cellRadius: number; haloInset: number; badge: number; frameEdge: number } {
  if (L.compact) {
    return { cellRadius: 16, haloInset: 2, badge: 40, frameEdge: 4 };
  }
  return { cellRadius: clamp(Math.round(L.cell * 0.23), 22, 28), haloInset: 6, badge: 52, frameEdge: 8 };
}

export function gridLabelFor(topCount: number, bottomCount: number, solved: boolean, target: number): string {
  return (
    `Ten-frame: ${topCount} ${topCount === 1 ? "cap" : "caps"} in top row, ${bottomCount} in bottom row` +
    (solved ? `. ${TARGET_TOP} + ${target - TARGET_TOP} = ${target}` : "")
  );
}

export function wellModeFor(i: number, palActive: boolean, target: number, revealAll: boolean): WellMode {
  if (!palActive) return "plain";
  if (i < TARGET_TOP) return "palTop";
  if (!revealAll) return "plain";
  if (i < target) return "palDrop";
  return "palLocked";
}

export function frameColorFor(solved: boolean, previewing: boolean): string {
  if (solved) return colors.atYellow;
  return previewing ? colors.atTealLight : "rgba(0,79,74,0.2)";
}
