/**
 * The level map for each grade. Levels are played strictly in order: level n unlocks when
 * level n − 1 is finished. Every 3rd level is a Physical Quest (spec: Physical-Digital Bridge).
 * Within each grade, puzzle difficulty rises with the level number.
 */

import type { ArrayPuzzle, Grade, Grade2StubPuzzle, NumberTrackPuzzle, PlaceValuePuzzle, QuestTask, TakeAwayPuzzle, TenFramePuzzle } from "@/types/domain";

interface LevelBase {
  grade: Grade;
  /** 1-based position on the map. */
  number: number;
  /** ≤ 3 words, glanceable (shown on the map node and the play screen chip). */
  title: string;
  /** Plain-text equation for aria labels / parent-facing copy. */
  equation: string;
}

export type LevelDef =
  | (LevelBase & { kind: "puzzle"; grade: 1; game: "tenFrame"; puzzle: TenFramePuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 1; game: "takeAway"; puzzle: TakeAwayPuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 2; game: "placeValue"; puzzle: PlaceValuePuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 2; game: "numberTrack"; puzzle: NumberTrackPuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 2; game: "groups" | "halves" | "clock"; puzzle: Grade2StubPuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 3; puzzle: ArrayPuzzle })
  | (LevelBase & { kind: "quest"; task: QuestTask });

const QUEST_TITLES: Record<QuestTask, { title: string; equation: string }> = {
  groups: { title: "Move & Play", equation: "2 groups make 10" },
  length: { title: "Measure It", equation: "Measure with your hands" },
  massCapacity: { title: "Heavy or Full", equation: "Compare mass and capacity" },
  money: { title: "Market Day", equation: "Pay with shillings" },
  shapes: { title: "Shape Hunt", equation: "Find shapes and lines" },
};

const quest = (grade: Grade, number: number, task: QuestTask = "groups"): LevelDef => ({
  grade,
  number,
  kind: "quest",
  task,
  ...QUEST_TITLES[task],
});

const tenFrame = (number: number, target: number): LevelDef => ({
  grade: 1,
  number,
  kind: "puzzle",
  game: "tenFrame",
  title: `Count to ${target}`,
  equation: `5 + ${target - 5} = ${target}`,
  puzzle: { target },
});

/** Curriculum 1.6 Subtraction: `start` caps, Brijo takes `away`, how many are left? */
const takeAway = (number: number, start: number, away: number): LevelDef => ({
  grade: 1,
  number,
  kind: "puzzle",
  game: "takeAway",
  title: `Take away ${away}`,
  equation: `${start} − ${away} = ${start - away}`,
  puzzle: { start, away },
});

const PLACE_VALUE_TITLES: Record<PlaceValuePuzzle["op"], (a: number, b: number) => string> = {
  build: (a) => `Make ${a}`,
  add: (a, b) => `${a} + ${b}`,
  sub: (a, b) => `${a} − ${b}`,
};

/** Curriculum 1.1–1.4: tens and ones, adding and subtracting with regrouping. */
const placeValue = (number: number, op: PlaceValuePuzzle["op"], a: number, b = 0): LevelDef => ({
  grade: 2,
  number,
  kind: "puzzle",
  game: "placeValue",
  title: PLACE_VALUE_TITLES[op](a, b),
  equation: op === "build" ? `${a} = ${Math.floor(a / 10)} tens + ${a % 10} ones` : op === "add" ? `${a} + ${b} = ${a + b}` : `${a} − ${b} = ${a - b}`,
  puzzle: { op, a, b },
});

/** A Grade 2 level whose board isn't built yet: it plays as a stand-in until then. */
/** Curriculum 1.2: count back from `from`, filling in the missing numbers. */
const numberTrack = (number: number, from: number, gaps: number[]): LevelDef => ({
  grade: 2,
  number,
  kind: "puzzle",
  game: "numberTrack",
  title: "Count back",
  equation: `${from}, ${from - 1}, ${from - 2} … count back from ${from}`,
  puzzle: { from, gaps },
});

const grade2Stub = (number: number, game: "groups" | "halves" | "clock", title: string, equation: string): LevelDef => ({
  grade: 2,
  number,
  kind: "puzzle",
  game,
  title,
  equation,
  puzzle: { goal: equation },
});

const array = (number: number, rows: number, cols: number): LevelDef => ({
  grade: 3,
  number,
  kind: "puzzle",
  title: `Build ${rows} × ${cols}`,
  equation: `${rows} × ${cols} = ${rows * cols}`,
  puzzle: { rows, cols },
});

export const LEVELS: Record<Grade, readonly LevelDef[]> = {
  // Grade 1 grows level by level with the KICD Grade 1 strands (addition, then subtraction, …).
  1: [tenFrame(1, 6), tenFrame(2, 7), quest(1, 3), tenFrame(4, 8), takeAway(5, 7, 2), quest(1, 6), tenFrame(7, 9), takeAway(8, 9, 4), quest(1, 9)],
  // Grade 2 covers every KICD Grade 2 sub-strand: numbers as puzzles, measurement and geometry as Move & Play
  // tasks with real objects. The curriculum sub-strand each level teaches is noted beside it.
  2: [
    placeValue(1, "build", 34), // 1.1 place value, 1.2 counting forward in tens and ones
    numberTrack(2, 50, [48, 46, 43, 41]), // 1.2 counting back from 50
    quest(2, 3, "length"), // 2.1 length, non-standard units
    placeValue(4, "add", 27, 5), // 1.3 2-digit + 1-digit with regrouping
    placeValue(5, "sub", 32, 7), // 1.4 1-digit from 2-digit with regrouping
    quest(2, 6, "massCapacity"), // 2.2 mass, 2.3 capacity
    grade2Stub(7, "groups", "Groups of 2", "2 + 2 + 2 = 3 × 2 = 6"), // 1.5 multiplication as repeated addition
    grade2Stub(8, "halves", "Share in half", "Half of 8 = 4"), // 1.6 fractions: halves
    quest(2, 9, "money"), // 2.5 Kenyan money
    placeValue(10, "sub", 45, 18), // 1.4 2-digit from 2-digit with regrouping
    grade2Stub(11, "clock", "What time?", "3 o'clock"), // 2.4 time
    quest(2, 12, "shapes"), // 3.1 lines, 3.2 shapes
  ],
  3: [array(1, 3, 4), array(2, 2, 6), quest(3, 3), array(4, 3, 5), array(5, 4, 3), quest(3, 6)],
};

/** How many levels a grade has (grades grow at different speeds). */
export function levelCount(grade: Grade): number {
  return LEVELS[grade].length;
}

export function levelsForGrade(grade: Grade): readonly LevelDef[] {
  return LEVELS[grade];
}

export function getLevel(grade: Grade, number: number): LevelDef | null {
  return LEVELS[grade].find((l) => l.number === number) ?? null;
}

export type LevelStatus = "done" | "current" | "locked";

/** `completed` = how many levels of this grade are finished (0..levelCount). */
export function levelStatus(number: number, completed: number): LevelStatus {
  if (number <= completed) return "done";
  if (number === completed + 1) return "current";
  return "locked";
}

export function isPlayable(grade: Grade, number: number, completed: number): boolean {
  return number >= 1 && number <= Math.min(completed + 1, levelCount(grade));
}
