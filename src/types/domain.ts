/**
 * Shared contract between app/page.tsx and every component in /components.
 * Changing anything here means changing every consumer — keep it small.
 */

import type { CounterItem } from "@/features/play/components/CounterFace";

export type Grade = 1 | 2 | 3;


/** Props every grade module (Grade1TenFrame, Grade2BalanceScale, Grade3ArrayMultiplication) accepts. */
export interface GradeModuleProps {
  /** Level number on the map (1-based, display / data attributes only — never changes behaviour). */
  level?: number;
  /**
   * Stealth PAL adaptation is engaged. Controlled by the play screen: it flips to true when
   * the module calls onStruggle() or the reviewer presses "Simulate Error".
   * It never flips back to false for a mounted module (the screen remounts via `key`
   * to reset). Modules must react to it changing false → true at ANY moment
   * (mid-drag, mid-animation, half-filled grid) without resetting the child's progress.
   */
  palActive: boolean;
  /**
   * The module detected a struggle signal (over-filling, wrong frame, wrong array
   * size…). Call it as often as you like; the screen de-duplicates. NEVER show an
   * error message yourself — the screen responds by setting palActive=true.
   */
  onStruggle: () => void;
  /** The child checked an answer (right or wrong). Optional: modules without a "Done" step skip it. */
  onAttempt?: (attempt: { target: number; answer: number; correct: boolean }) => void;
  /** The puzzle is solved. Call exactly once, after the module's own "solved" flourish (~0.8–1.4s). */
  onSolved: () => void;
  /** What the child counts with: bottle tops ("cap") or the story's item. Default "cap". */
  item?: CounterItem;
  /** Where the child left this level last time (resume). Read once on mount. */
  draft?: LevelDraft;
  /** Report the board's current state whenever it changes; the screen saves it when the child leaves. */
  onDraft?: (draft: LevelDraft) => void;
}

/**
 * An unfinished level, saved on the phone so the child can carry on later. Each module fills the fields it
 * needs: Grade 1 `placed` (cap ids in fill order); Grade 3 `rows`/`cols` while building, then `picked`.
 */
export interface LevelDraft {
  /** Wrong "Done" presses so far (help comes back at the same strength). */
  misses: number;
  /** Board format version: a module ignores drafts saved by an older build of its board. */
  version?: number;
  placed?: number[];
  rows?: number;
  cols?: number;
  /** Grade 3: the array was right and the child is picking 10. */
  regrouping?: boolean;
  picked?: number[];
}

/** Grade 1 ten-frame: build `target` (6–10) as 5 + (target − 5) = target. Default 7. */
export interface TenFramePuzzle {
  target: number;
}

/** Grade 1 take-away: `start` caps (6–10) on the ten-frame, `away` (1–5) get eaten. Answer start − away. */
export interface TakeAwayPuzzle {
  start: number;
  away: number;
}

/** Grade 2 balance scale: `start` pre-filled (6–9) + missing addend = `target` (11–17, target − start ≤ 7). Default 8 + 6 = 14. */
export interface BalancePuzzle {
  start: number;
  target: number;
}

/** Grade 3 array: `rows` × `cols` (rows 2–4, cols 3–6, product 10–15) then regroup into 1 ten + ones. Default 3 × 4. */
export interface ArrayPuzzle {
  rows: number;
  cols: number;
}

export type TenFrameProps = GradeModuleProps & Partial<TenFramePuzzle>;
export type TakeAwayProps = GradeModuleProps & TakeAwayPuzzle;
export type BalanceProps = GradeModuleProps & Partial<BalancePuzzle>;
export type ArrayProps = GradeModuleProps & Partial<ArrayPuzzle>;

export interface GradeMeta {
  grade: Grade;
  shortLabel: string; // "Grade 1"
  mechanic: string; // "Counting Fun"
  missionTitle: string; // tiny, glanceable — never a paragraph
  equation: string; // plain-text equation for reviewers / aria labels
  badgeName: string;
}

export const GRADE_META: Record<Grade, GradeMeta> = {
  1: {
    grade: 1,
    shortLabel: "Grade 1",
    mechanic: "Counting Fun",
    missionTitle: "Count to 7",
    equation: "5 + 2 = 7",
    badgeName: "Ten-Frame Explorer",
  },
  2: {
    grade: 2,
    shortLabel: "Grade 2",
    mechanic: "Balance Scale",
    missionTitle: "Balance 14",
    equation: "8 + 6 = 14",
    badgeName: "Balance Master",
  },
  3: {
    grade: 3,
    shortLabel: "Grade 3",
    mechanic: "Array Grids",
    missionTitle: "Build 3 × 4",
    equation: "3 × 4 = 12",
    badgeName: "Array Architect",
  },
};


/** Daily screen-time cap (seconds). */
export const SESSION_CAP_SECONDS = 15 * 60;
/** TESTING: false freezes the daily timer at the full 15:00 (no ticking, never "time's up"). Set back to true before release. */
export const SCREEN_TIME_ENABLED = false;
