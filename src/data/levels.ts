/**
 * The level map for each grade. Levels are played strictly in order: level n unlocks when
 * level n − 1 is finished. Every 3rd level is a Physical Quest (spec: Physical-Digital Bridge).
 * Level 1 of every grade is the exact puzzle from the original spec.
 */

import type { ArrayPuzzle, BalancePuzzle, Grade, TenFramePuzzle } from "@/types/domain";

export const LEVELS_PER_GRADE = 6;

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
  | (LevelBase & { kind: "puzzle"; grade: 1; puzzle: TenFramePuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 2; puzzle: BalancePuzzle })
  | (LevelBase & { kind: "puzzle"; grade: 3; puzzle: ArrayPuzzle })
  | (LevelBase & { kind: "quest" });

const quest = (grade: Grade, number: number): LevelDef => ({
  grade,
  number,
  kind: "quest",
  title: "Physical Quest",
  equation: "2 groups make 10",
});

const tenFrame = (number: number, target: number): LevelDef => ({
  grade: 1,
  number,
  kind: "puzzle",
  title: `Make ${target}`,
  equation: `${target} = 5 + ${target - 5}`,
  puzzle: { target },
});

const balance = (number: number, start: number, target: number): LevelDef => ({
  grade: 2,
  number,
  kind: "puzzle",
  title: `Balance ${target}`,
  equation: `${start} + ${target - start} = ${target}`,
  puzzle: { start, target },
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
  1: [tenFrame(1, 7), tenFrame(2, 6), quest(1, 3), tenFrame(4, 8), tenFrame(5, 9), quest(1, 6)],
  2: [balance(1, 8, 14), balance(2, 9, 13), quest(2, 3), balance(4, 7, 12), balance(5, 8, 15), quest(2, 6)],
  3: [array(1, 3, 4), array(2, 2, 6), quest(3, 3), array(4, 3, 5), array(5, 4, 3), quest(3, 6)],
};

export function levelsForGrade(grade: Grade): readonly LevelDef[] {
  return LEVELS[grade];
}

export function getLevel(grade: Grade, number: number): LevelDef | null {
  return LEVELS[grade].find((l) => l.number === number) ?? null;
}

export type LevelStatus = "done" | "current" | "locked";

/** `completed` = how many levels of this grade are finished (0..LEVELS_PER_GRADE). */
export function levelStatus(number: number, completed: number): LevelStatus {
  if (number <= completed) return "done";
  if (number === completed + 1) return "current";
  return "locked";
}

export function isPlayable(number: number, completed: number): boolean {
  return number >= 1 && number <= Math.min(completed + 1, LEVELS_PER_GRADE);
}
