import type { CounterItem } from "@/features/play/components/CounterFace";

export type Grade = 1 | 2 | 3;

export interface GradeModuleProps {
  waiting?: boolean;
  level?: number;
  palActive: boolean;
  onStruggle: () => void;
  onAttempt?: (attempt: {
    target: number;
    answer: number;
    correct: boolean;
  }) => void;
  onSolved: () => void;
  item?: CounterItem;
  draft?: LevelDraft;
  onDraft?: (draft: LevelDraft) => void;
}

export interface LevelDraft {
  misses: number;
  version?: number;
  placed?: number[];
  rows?: number;
  cols?: number;
  regrouping?: boolean;
  picked?: number[];
}

export interface TenFramePuzzle {
  target: number;
}

export interface TakeAwayPuzzle {
  start: number;
  away: number;
}

export interface PlaceValuePuzzle {
  op: "build" | "add" | "sub";
  a: number;
  b: number;
}

export interface ColumnsPuzzle {
  op: "add" | "sub";
  a: number;
  b: number;
}

export interface NumberTrackPuzzle {
  from: number;
  gaps: number[];
  step: number;
}

export interface GroupsPuzzle {
  groups: number;
  each: number;
}

export interface HalvesPuzzle {
  total: number;
  shares?: number;
}

export interface FractionPuzzle {
  parts: number;
}

export interface ClockPuzzle {
  hour: number;
  half?: boolean;
}

export type QuestTask = "groups" | "findIt" | "hideGuess" | "fingers" | "raceDay" | "waterDay" | "change" | "treasureWalk" | "length" | "massCapacity" | "money" | "shapes";

export interface HundredsPuzzle {
  a: number;
}

export interface ArrayPuzzle {
  rows: number;
  cols: number;
}

export type TenFrameProps = GradeModuleProps & Partial<TenFramePuzzle>;
export type TakeAwayProps = GradeModuleProps & TakeAwayPuzzle;
export type PlaceValueProps = GradeModuleProps & PlaceValuePuzzle;
export type GroupsProps = GradeModuleProps & GroupsPuzzle;
export type HalvesProps = GradeModuleProps & HalvesPuzzle & { grade?: 2 | 3 };
export type ClockProps = GradeModuleProps & ClockPuzzle & { grade?: 2 | 3 };
export type FractionProps = GradeModuleProps & FractionPuzzle;
export type NumberTrackProps = GradeModuleProps & NumberTrackPuzzle & { grade?: 2 | 3 };
export type ArrayProps = GradeModuleProps & Partial<ArrayPuzzle>;
export type HundredsProps = GradeModuleProps & HundredsPuzzle;
export type ColumnsProps = GradeModuleProps & ColumnsPuzzle;

export interface GradeMeta {
  grade: Grade;
  shortLabel: string;
  mechanic: string;
  missionTitle: string;
  equation: string;
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
    mechanic: "Tens and Ones",
    missionTitle: "Make 34",
    equation: "27 + 5 = 32",
    badgeName: "Place Value Pro",
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

/** The daily play limit a family starts with, in minutes. Grown-ups can change it on the Grown-ups page. */
export const DEFAULT_DAILY_LIMIT_MINUTES = 15;
/** The limits a grown-up can choose from, in minutes. */
export const DAILY_LIMIT_CHOICES = [10, 15, 20, 30, 45, 60] as const;
export const SCREEN_TIME_ENABLED = true;

/** "6 of 15 minutes played today", rounded up so a started minute counts. */
export function playedToday(usedSeconds: number, limitSeconds: number): string {
  const used = Math.min(Math.ceil(usedSeconds / 60), limitSeconds / 60);
  return `${used} of ${limitSeconds / 60} minutes played today`;
}


/** The daily limit in seconds, falling back to the default for a missing or unknown setting. */
export function dailyLimitSeconds(minutes: number | undefined): number {
  const valid = DAILY_LIMIT_CHOICES.some((m) => m === minutes) ? (minutes as number) : DEFAULT_DAILY_LIMIT_MINUTES;
  return valid * 60;
}
