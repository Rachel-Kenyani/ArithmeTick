import { levelsForGrade, type LevelDef } from "@/data/levels";
import { skillOf, type SkillId } from "@/data/skills";
import type { Grade } from "@/types/domain";
import type { AttemptLog } from "@/types/models";

/**
 * The skill to warm up on when a skill is hard: the one it builds on. Making 10 and place value are the foundations,
 * so they warm up on themselves.
 */
export const BUILDS_ON: Record<SkillId, SkillId> = {
  makingTen: "makingTen",
  takingAway: "makingTen",
  placeValue: "placeValue",
  addingOn: "placeValue",
  countingInSteps: "placeValue",
  groups: "countingInSteps",
  sharing: "groups",
  time: "countingInSteps",
};

/** Wrong answers on one play of a level that count as finding it hard. */
export const HARD_MISSES = 2;
/** Answers further apart than this belong to different plays of a level. */
const SAME_PLAY_MS = 20 * 60 * 1000;

export type NextStep =
  | { kind: "next"; level: number }
  | { kind: "warmUp"; level: number; then: number }
  | { kind: "tryAgain"; level: number }
  | { kind: "done" };

interface LastPlay {
  level: number;
  misses: number;
  helped: boolean;
  endedAt: number;
}

/** The child's most recent play in this grade: the run of answers for one level at the end of their history. */
function lastPlay(attempts: readonly AttemptLog[], grade: Grade): LastPlay | null {
  const mine = attempts.filter((a) => a.grade === grade).sort((a, b) => a.at - b.at);
  const last = mine.at(-1);
  if (!last) return null;
  const run: AttemptLog[] = [];
  for (let i = mine.length - 1; i >= 0; i--) {
    const a = mine[i];
    const previous = run.at(-1) ?? last;
    if (a.level !== last.level || previous.at - a.at > SAME_PLAY_MS) break;
    run.push(a);
  }
  return {
    level: last.level,
    misses: run.filter((a) => !a.correct).length,
    helped: run.some((a) => a.pal),
    endedAt: last.at,
  };
}

/** The latest finished level before `before`, in this grade, that practises `skill`. */
function warmUpFor(levels: readonly LevelDef[], completed: number, before: number, skill: SkillId): number | null {
  const candidates = levels.filter((l) => l.number < before && l.number <= completed && skillOf(l) === skill);
  return candidates.at(-1)?.number ?? null;
}

/**
 * What to play next, decided after each level. Normally the next level on the map. When the last play was hard (two
 * or more wrong answers, or help mode came on), suggest a short warm-up on a finished level of the skill it builds on,
 * then that level again; with nothing to warm up on, suggest trying it again. A warm-up is suggested once: after it is
 * played, the map goes back to normal.
 */
export function nextStep(grade: Grade, completed: number, attempts: readonly AttemptLog[]): NextStep {
  const levels = levelsForGrade(grade);
  const following: NextStep = completed >= levels.length ? { kind: "done" } : { kind: "next", level: completed + 1 };

  const play = lastPlay(attempts, grade);
  if (!play || (play.misses < HARD_MISSES && !play.helped)) return following;

  const level = levels.find((l) => l.number === play.level);
  const skill = level ? skillOf(level) : null;
  if (!level || !skill) return following;

  const warmUp = warmUpFor(levels, completed, play.level, BUILDS_ON[skill]) ?? warmUpFor(levels, completed, play.level, skill);
  const retry = play.level <= completed ? following : { kind: "tryAgain" as const, level: play.level };
  if (warmUp === null) return retry;
  return { kind: "warmUp", level: warmUp, then: retry.kind === "next" || retry.kind === "tryAgain" ? retry.level : play.level };
}

/** True when this level is the warm-up the map suggested, so its banner can say so. */
export function isWarmUp(grade: Grade, completed: number, attempts: readonly AttemptLog[], levelNumber: number): boolean {
  const step = nextStep(grade, completed, attempts);
  return step.kind === "warmUp" && step.level === levelNumber;
}
