import type { ArrayPuzzle, Grade, ClockPuzzle, GroupsPuzzle, HalvesPuzzle, NumberTrackPuzzle, PlaceValuePuzzle, QuestTask, TakeAwayPuzzle, TenFramePuzzle } from "@/types/domain";

interface LevelBase {
  grade: Grade;
  number: number;
  title: string;
  equation: string;
}

export type LevelDef =
  | (LevelBase & { kind: "puzzle"; grade: 1; game: "tenFrame"; puzzle: TenFramePuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 1; game: "takeAway"; puzzle: TakeAwayPuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 2; game: "placeValue"; puzzle: PlaceValuePuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 2; game: "numberTrack"; puzzle: NumberTrackPuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 2; game: "groups"; puzzle: GroupsPuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 2; game: "halves"; puzzle: HalvesPuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 2; game: "clock"; puzzle: ClockPuzzle })
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

const placeValue = (number: number, op: PlaceValuePuzzle["op"], a: number, b = 0): LevelDef => ({
  grade: 2,
  number,
  kind: "puzzle",
  game: "placeValue",
  title: PLACE_VALUE_TITLES[op](a, b),
  equation: op === "build" ? `${a} = ${Math.floor(a / 10)} tens + ${a % 10} ones` : op === "add" ? `${a} + ${b} = ${a + b}` : `${a} − ${b} = ${a - b}`,
  puzzle: { op, a, b },
});

const numberTrack = (number: number, from: number, gaps: number[]): LevelDef => ({
  grade: 2,
  number,
  kind: "puzzle",
  game: "numberTrack",
  title: "Count back",
  equation: `${from}, ${from - 1}, ${from - 2} … count back from ${from}`,
  puzzle: { from, gaps },
});

const groupsOf = (number: number, groups: number, each: number): LevelDef => ({
  grade: 2,
  number,
  kind: "puzzle",
  game: "groups",
  title: `Groups of ${each}`,
  equation: `${Array.from({ length: groups }, () => each).join(" + ")} = ${groups} × ${each} = ${groups * each}`,
  puzzle: { groups, each },
});

const halfOf = (number: number, total: number): LevelDef => ({
  grade: 2,
  number,
  kind: "puzzle",
  game: "halves",
  title: "Share in half",
  equation: `Half of ${total} = ${total / 2}`,
  puzzle: { total },
});

const clockAt = (number: number, hour: number): LevelDef => ({
  grade: 2,
  number,
  kind: "puzzle",
  game: "clock",
  title: "What time?",
  equation: `${hour} o'clock`,
  puzzle: { hour },
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
  1: [tenFrame(1, 6), tenFrame(2, 7), quest(1, 3), tenFrame(4, 8), takeAway(5, 7, 2), quest(1, 6), tenFrame(7, 9), takeAway(8, 9, 4), quest(1, 9)],
  2: [
    placeValue(1, "build", 34),
    numberTrack(2, 50, [48, 46, 43, 41]),
    quest(2, 3, "length"),
    placeValue(4, "add", 27, 5),
    placeValue(5, "sub", 32, 7),
    quest(2, 6, "massCapacity"),
    groupsOf(7, 3, 2),
    halfOf(8, 8),
    quest(2, 9, "money"),
    placeValue(10, "sub", 45, 18),
    clockAt(11, 3),
    quest(2, 12, "shapes"),
  ],
  3: [array(1, 3, 4), array(2, 2, 6), quest(3, 3), array(4, 3, 5), array(5, 4, 3), quest(3, 6)],
};

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

export function levelStatus(number: number, completed: number): LevelStatus {
  if (number <= completed) return "done";
  if (number === completed + 1) return "current";
  return "locked";
}

export function isPlayable(grade: Grade, number: number, completed: number): boolean {
  return number >= 1 && number <= Math.min(completed + 1, levelCount(grade));
}
