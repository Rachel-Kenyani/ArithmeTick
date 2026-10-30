/**
 * Badge catalogue. A badge is earned the first time its test passes after a level is finished
 * or a high-five is recorded. Order = display order AND celebration priority (when one level
 * earns several badges, the celebration shows the first one in this list).
 */

import type { ChildProfile } from "@/types/models";
import { levelCount } from "@/data/levels";
import type { Grade } from "@/types/domain";

export type BadgeTone = "teal" | "purple" | "yellow" | "plum" | "leaf";

export interface BadgeDef {
  id: string;
  name: string;
  /** Short "how to earn" line, shown under locked badges (parent-readable, ≤ 5 words). */
  how: string;
  tone: BadgeTone;
  grade?: Grade;
  test: (p: ChildProfile) => boolean;
}

export const BADGES: readonly BadgeDef[] = [
  { id: "ten-frame-explorer", name: "Ten-Frame Explorer", how: "Grade 1 · Level 1", tone: "teal", grade: 1, test: (p) => p.progress[1] >= 1 },
  { id: "balance-master", name: "Balance Master", how: "Grade 2 · Level 1", tone: "purple", grade: 2, test: (p) => p.progress[2] >= 1 },
  { id: "array-architect", name: "Array Architect", how: "Grade 3 · Level 1", tone: "yellow", grade: 3, test: (p) => p.progress[3] >= 1 },
  { id: "hands-on-hero", name: "Hands-On Hero", how: "Finish a Move & Play level", tone: "leaf", test: (p) => p.questsDone >= 1 },
  { id: "number-builder", name: "Number Builder", how: "Grade 1 · Level 5", tone: "teal", grade: 1, test: (p) => p.progress[1] >= 5 },
  { id: "number-detective", name: "Number Detective", how: "Grade 2 · Level 5", tone: "purple", grade: 2, test: (p) => p.progress[2] >= 5 },
  { id: "regroup-ranger", name: "Regroup Ranger", how: "Grade 3 · Level 5", tone: "yellow", grade: 3, test: (p) => p.progress[3] >= 5 },
  { id: "grade-1-champion", name: "Grade 1 Champion", how: "Finish Grade 1", tone: "teal", grade: 1, test: (p) => p.progress[1] >= levelCount(1) },
  { id: "grade-2-champion", name: "Grade 2 Champion", how: "Finish Grade 2", tone: "purple", grade: 2, test: (p) => p.progress[2] >= levelCount(2) },
  { id: "grade-3-champion", name: "Grade 3 Champion", how: "Finish Grade 3", tone: "yellow", grade: 3, test: (p) => p.progress[3] >= levelCount(3) },
  { id: "high-five-hero", name: "High-Five Hero", how: "5 real high-fives", tone: "plum", test: (p) => p.highFives >= 5 },
  { id: "star-collector", name: "Star Collector", how: "Collect 30 stars", tone: "yellow", test: (p) => p.stars >= 30 },
];

export function getBadge(id: string): BadgeDef | null {
  return BADGES.find((b) => b.id === id) ?? null;
}

/** Ids of badges whose test passes for `p` but which `p` has not earned yet, in catalogue order. */
export function newlyEarned(p: ChildProfile): string[] {
  return BADGES.filter((b) => !p.badges.includes(b.id) && b.test(p)).map((b) => b.id);
}
