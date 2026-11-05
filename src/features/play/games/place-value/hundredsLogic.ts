import type { CounterItem } from "@/features/play/components/CounterFace";

import { plural } from "./packTensLogic";

export type HundredsStep = "pack" | "hundreds" | "tens" | "ones" | "solved";
export type AskStep = "hundreds" | "tens" | "ones";

export const CRATES_PER_BOX = 10;

export function splitHundreds(a: number): { hundreds: number; tens: number; ones: number; crates: number } {
  return { hundreds: Math.floor(a / 100), tens: Math.floor(a / 10) % 10, ones: a % 10, crates: Math.floor(a / 10) };
}

export function hundredsPrompt(step: HundredsStep, handFilled: boolean, item: CounterItem, a: number): string {
  if (step === "pack") {
    return handFilled ? "A full box holds 10 crates. That's one hundred! Tap the empty box to fill it!" : "Tap or drag a crate to put it in the box.";
  }
  const { hundreds, tens, ones } = splitHundreds(a);
  return {
    hundreds: "How many full boxes of one hundred are there?",
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

export function crateLayout(size: { w: number; h: number }, crates: number): { cell: number; cols: number } {
  const cols = 4;
  const rows = Math.ceil(crates / cols);
  const byWidth = (size.w - 40) / (cols * 6.6);
  const byHeight = (size.h * 0.4) / (rows * 3.1);
  return { cell: Math.max(6, Math.floor(Math.min(13, byWidth, byHeight))), cols };
}
