import type {
  ArrayPuzzle,
  Grade,
  ClockPuzzle,
  GroupsPuzzle,
  HundredsPuzzle,
  HalvesPuzzle,
  NumberTrackPuzzle,
  ColumnsPuzzle,
  FractionPuzzle,
  PlaceValuePuzzle,
  QuestTask,
  TakeAwayPuzzle,
  TenFramePuzzle,
} from "@/types/domain";

interface LevelBase {
  grade: Grade;
  number: number;
  title: string;
  equation: string;
}

export type LevelDef =
  | (LevelBase & {
      kind: "puzzle";
      grade: 1;
      game: "tenFrame";
      puzzle: TenFramePuzzle;
    })
  | (LevelBase & {
      kind: "puzzle";
      grade: 1;
      game: "takeAway";
      puzzle: TakeAwayPuzzle;
    })
  | (LevelBase & {
      kind: "puzzle";
      grade: 2;
      game: "placeValue";
      puzzle: PlaceValuePuzzle;
    })
  | (LevelBase & {
      kind: "puzzle";
      grade: 2 | 3;
      game: "numberTrack";
      puzzle: NumberTrackPuzzle;
    })
  | (LevelBase & {
      kind: "puzzle";
      grade: 2;
      game: "groups";
      puzzle: GroupsPuzzle;
    })
  | (LevelBase & {
      kind: "puzzle";
      grade: 2 | 3;
      game: "halves";
      puzzle: HalvesPuzzle;
    })
  | (LevelBase & {
      kind: "puzzle";
      grade: 2 | 3;
      game: "clock";
      puzzle: ClockPuzzle;
    })
  | (LevelBase & { kind: "puzzle"; grade: 3; game: "array"; puzzle: ArrayPuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 3; game: "hundreds"; puzzle: HundredsPuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 3; game: "columns"; puzzle: ColumnsPuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 3; game: "fraction"; puzzle: FractionPuzzle })
  | (LevelBase & { kind: "quest"; task: QuestTask });

const QUEST_TITLES: Record<QuestTask, { title: string; equation: string }> = {
  groups: { title: "Move & Play", equation: "2 groups make 10" },
  findIt: { title: "Find It", equation: "Find 6 objects at home" },
  hideGuess: { title: "Hide and Guess", equation: "How many are hiding?" },
  fingers: { title: "Finger Maths", equation: "5 + 4 = 9" },
  raceDay: { title: "Race Day", equation: "1st, 2nd, 3rd, 4th, 5th" },
  waterDay: { title: "Water Day", equation: "Measure in litres" },
  change: { title: "Market Day", equation: "50 − 30 = 20 shillings change" },
  treasureWalk: { title: "Treasure Walk", equation: "Forward, left, right" },
  length: { title: "Measure It", equation: "Measure with your hands" },
  massCapacity: {
    title: "Heavy or Full",
    equation: "Compare mass and capacity",
  },
  money: { title: "Market Day", equation: "Pay with shillings" },
  shapes: { title: "Shape House", equation: "Build a house with shapes" },
};

const quest = (
  grade: Grade,
  number: number,
  task: QuestTask = "groups",
): LevelDef => ({
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

const PLACE_VALUE_TITLES: Record<
  PlaceValuePuzzle["op"],
  (a: number, b: number) => string
> = {
  build: (a) => `Make ${a}`,
  add: (a, b) => `${a} + ${b}`,
  sub: (a, b) => `${a} − ${b}`,
};

const PLACE_VALUE_EQUATIONS: Record<
  PlaceValuePuzzle["op"],
  (a: number, b: number) => string
> = {
  build: (a) => `${a} = ${Math.floor(a / 10)} tens + ${a % 10} ones`,
  add: (a, b) => `${a} + ${b} = ${a + b}`,
  sub: (a, b) => `${a} − ${b} = ${a - b}`,
};

const placeValue = (
  number: number,
  op: PlaceValuePuzzle["op"],
  a: number,
  b = 0,
): LevelDef => ({
  grade: 2,
  number,
  kind: "puzzle",
  game: "placeValue",
  title: PLACE_VALUE_TITLES[op](a, b),
  equation: PLACE_VALUE_EQUATIONS[op](a, b),
  puzzle: { op, a, b },
});

const numberTrack = (
  grade: 2 | 3,
  number: number,
  from: number,
  gaps: number[],
  step = -1,
): LevelDef => ({
  grade,
  number,
  kind: "puzzle",
  game: "numberTrack",
  title: step === -1 ? "Count back" : `Count in ${step}s`,
  equation: step === -1 ? `${from}, ${from - 1}, ${from - 2} … count back from ${from}` : `${from}, ${from + step}, ${from + 2 * step} … count on in ${step}s`,
  puzzle: { from, gaps, step },
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

const quarterOf = (number: number): LevelDef => ({
  grade: 3,
  number,
  kind: "puzzle",
  game: "fraction",
  title: "Quarters",
  equation: "1 out of 4 equal parts = 1/4",
  puzzle: { parts: 4 },
});

const shareOf = (number: number, total: number, shares: number): LevelDef => ({
  grade: 3,
  number,
  kind: "puzzle",
  game: "halves",
  title: `Share ${total}`,
  equation: `${total} ÷ ${shares} = ${total / shares}`,
  puzzle: { total, shares },
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

const halfPast = (number: number, hour: number): LevelDef => ({
  grade: 3,
  number,
  kind: "puzzle",
  game: "clock",
  title: "Half past",
  equation: `half past ${hour}`,
  puzzle: { hour, half: true },
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
  game: "array",
  title: `Build ${rows} × ${cols}`,
  equation: `${rows} × ${cols} = ${rows * cols}`,
  puzzle: { rows, cols },
});

const columns = (number: number, op: ColumnsPuzzle["op"], a: number, b: number): LevelDef => {
  const sign = op === "add" ? "+" : "−";
  return {
    grade: 3,
    number,
    kind: "puzzle",
    game: "columns",
    title: `${a} ${sign} ${b}`,
    equation: `${a} ${sign} ${b} = ${op === "add" ? a + b : a - b}`,
    puzzle: { op, a, b },
  };
};

const hundreds = (number: number, a: number): LevelDef => ({
  grade: 3,
  number,
  kind: "puzzle",
  game: "hundreds",
  title: `Make ${a}`,
  equation: `${a} = ${Math.floor(a / 100)} hundreds + ${Math.floor(a / 10) % 10} tens + ${a % 10} ones`,
  puzzle: { a },
});

export const LEVELS: Record<Grade, readonly LevelDef[]> = {
  1: [
    tenFrame(1, 6),
    tenFrame(2, 7),
    quest(1, 3, "findIt"),
    tenFrame(4, 8),
    takeAway(5, 7, 2),
    quest(1, 6, "hideGuess"),
    tenFrame(7, 9),
    takeAway(8, 9, 4),
    quest(1, 9, "fingers"),
  ],
  2: [
    placeValue(1, "build", 34),
    numberTrack(2, 2, 50, [48, 46, 43, 41]),
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
  3: [
    hundreds(1, 243),
    numberTrack(3, 2, 130, [150, 180, 200, 210], 10),
    quest(3, 3, "raceDay"),
    columns(4, "add", 146, 27),
    columns(5, "sub", 352, 125),
    quest(3, 6, "waterDay"),
    array(7, 3, 4),
    shareOf(8, 12, 3),
    quest(3, 9, "change"),
    quarterOf(10),
    halfPast(11, 4),
    quest(3, 12, "treasureWalk"),
  ],
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

export function isPlayable(
  grade: Grade,
  number: number,
  completed: number,
): boolean {
  return number >= 1 && number <= Math.min(completed + 1, levelCount(grade));
}
