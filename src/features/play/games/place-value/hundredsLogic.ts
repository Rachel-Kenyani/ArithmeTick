import type { CounterItem } from "@/features/play/components/CounterFace";

import { plural } from "./packTensLogic";
import { CHART_HEIGHT } from "./PlaceValueChart";

export type HundredsStep = "pack" | "hundreds" | "tens" | "ones" | "solved";
export type AskStep = "hundreds" | "tens" | "ones";

export const CRATES_PER_BOX = 10;

/** Space between crates on the table, so each crate reads as its own ten. */
export const CRATE_GAP = 8;

/**
 * Height taken by everything on the board except the crates. While packing: chart, two-line prompt, the hundred
 * box and the ones row. After: chart, prompt, shelf of boxes, table heading, ones row and the answer buttons.
 */
function boardChrome(packing: boolean): number {
  const shared = CHART_HEIGHT + 72 + 52 + 24;
  return packing ? shared + 120 + 4 * 12 : shared + 56 + 22 + 52 + 6 * 12;
}

export function splitHundreds(a: number): { hundreds: number; tens: number; ones: number; crates: number } {
  return { hundreds: Math.floor(a / 100), tens: Math.floor(a / 10) % 10, ones: a % 10, crates: Math.floor(a / 10) };
}

export function hundredsPrompt(step: HundredsStep, handFilled: boolean, item: CounterItem, a: number): string {
  if (step === "pack") {
    return handFilled ? "A full box holds 10 crates. That's 100! Tap the empty box to fill it!" : "Tap or drag a crate to put it in the box.";
  }
  const { hundreds, tens, ones } = splitHundreds(a);
  return {
    hundreds: "How many full boxes of 100 are there?",
    tens: "How many crates of ten are left?",
    ones: `How many ${plural(item)} are left over?`,
    solved: `${hundreds} hundreds, ${tens} tens and ${ones} ones make ${a}!`,
  }[step];
}

export function hundredsClip(step: HundredsStep, handFilled: boolean): string {
  if (step === "pack") return handFilled ? "h-fill" : "h-pack";
  return { hundreds: "h-boxes", tens: "h-crates", ones: "h-leftover", solved: "" }[step];
}

export function nextAsk(step: AskStep): HundredsStep {
  if (step === "hundreds") return "tens";
  if (step === "tens") return "ones";
  return "solved";
}

/** The space one crate of ten (5 × 2 items, with its padding and border) takes up for a given item size. */
export function crateSlot(cell: number): { w: number; h: number } {
  return { w: Math.ceil(cell * 5.9 + 4), h: Math.ceil(cell * 2.6 + 4) };
}

/** Picks the column count (3–5) that lets the crates be biggest while still fitting the board. */
export function crateLayout(size: { w: number; h: number }, crates: number, packing: boolean): { cell: number; cols: number } {
  const room = { w: size.w - 32, h: size.h - boardChrome(packing) };
  let best = { cell: 6, cols: 4 };
  for (const cols of [3, 4, 5]) {
    const rows = Math.ceil(crates / cols);
    const byWidth = (room.w - (cols - 1) * CRATE_GAP - 4 * cols) / (cols * 5.9);
    const byHeight = (room.h - (rows - 1) * CRATE_GAP - 4 * rows) / (rows * 2.6);
    const cell = Math.floor(Math.min(22, byWidth, byHeight));
    if (cell > best.cell) best = { cell, cols };
  }
  return best;
}
