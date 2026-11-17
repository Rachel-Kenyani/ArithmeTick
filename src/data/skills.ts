import { getLevel, type LevelDef } from "@/data/levels";
import type { AttemptLog } from "@/types/models";

/** The maths skills ArithmeTick practises. Each level belongs to one; Move & Play activities belong to none. */
export type SkillId = "makingTen" | "takingAway" | "placeValue" | "addingOn" | "countingInSteps" | "groups" | "sharing" | "time";

export interface SkillDef {
  id: SkillId;
  /** How a grown-up reads it: "Amani: making 10 is strong". */
  name: string;
}

export const SKILLS: readonly SkillDef[] = [
  { id: "makingTen", name: "making 10" },
  { id: "takingAway", name: "taking away" },
  { id: "placeValue", name: "place value" },
  { id: "addingOn", name: "adding on" },
  { id: "countingInSteps", name: "counting in steps" },
  { id: "groups", name: "equal groups" },
  { id: "sharing", name: "sharing equally" },
  { id: "time", name: "telling the time" },
];

/** Which skill a level practises, or null for a Move & Play activity. */
export function skillOf(level: LevelDef): SkillId | null {
  if (level.kind === "quest") return null;
  switch (level.game) {
    case "tenFrame":
      return "makingTen";
    case "takeAway":
      return "takingAway";
    case "placeValue":
      if (level.puzzle.op === "build") return "placeValue";
      return level.puzzle.op === "add" ? "addingOn" : "takingAway";
    case "hundreds":
      return "placeValue";
    case "columns":
      return level.puzzle.op === "add" ? "addingOn" : "takingAway";
    case "numberTrack":
      return "countingInSteps";
    case "groups":
    case "array":
      return "groups";
    case "halves":
    case "fraction":
      return "sharing";
    case "clock":
      return "time";
  }
}

/** Only the most recent answers count, so a child who has improved is not held back by early mistakes. */
export const RECENT_ANSWERS = 20;
/** Fewer answers than this is too little to judge, so the skill shows as just started. */
export const MIN_ANSWERS = 4;
/** A right answer within this long of opening the level counts as quick. */
export const QUICK_MS = 60_000;
/** A score at or above this is strong. */
export const STRONG_SCORE = 0.75;
/** A skill is only strong when most answers came without help, however right they were. */
export const STRONG_MAX_HELPED = 0.5;

const WEIGHT = { accuracy: 0.6, unaided: 0.25, quick: 0.15 } as const;

export type MasteryBand = "new" | "growing" | "strong";

export interface SkillMastery {
  skill: SkillId;
  /** Answers the score is based on, at most RECENT_ANSWERS. */
  answers: number;
  /** Share of those answers that were right. */
  accuracy: number;
  /** Share given while help mode was on. */
  helped: number;
  /** Share of right answers given quickly. */
  quick: number;
  /** 0 to 1: mostly accuracy, then working without help, then speed. */
  score: number;
  band: MasteryBand;
}

const share = (part: number, whole: number) => (whole === 0 ? 0 : part / whole);

function scoreOf(recent: readonly AttemptLog[]): Omit<SkillMastery, "skill"> {
  const right = recent.filter((a) => a.correct);
  const accuracy = share(right.length, recent.length);
  const helped = share(recent.filter((a) => a.pal).length, recent.length);
  const quick = share(right.filter((a) => a.ms <= QUICK_MS).length, right.length);
  const score = WEIGHT.accuracy * accuracy + WEIGHT.unaided * (1 - helped) + WEIGHT.quick * quick;
  let band: MasteryBand = "growing";
  if (recent.length < MIN_ANSWERS) band = "new";
  else if (score >= STRONG_SCORE && helped < STRONG_MAX_HELPED) band = "strong";
  return { answers: recent.length, accuracy, helped, quick, score, band };
}

/**
 * How well a child knows each skill they have practised, from their recent answers in every grade. Skills with no
 * answers yet are left out. Ordered as SKILLS lists them.
 */
export function masteryOf(attempts: readonly AttemptLog[]): SkillMastery[] {
  const bySkill = new Map<SkillId, AttemptLog[]>();
  for (const attempt of attempts) {
    const level = getLevel(attempt.grade, attempt.level);
    const skill = level ? skillOf(level) : null;
    if (!skill) continue;
    const list = bySkill.get(skill) ?? [];
    list.push(attempt);
    bySkill.set(skill, list);
  }
  return SKILLS.filter((s) => bySkill.has(s.id)).map((s) => {
    const recent = [...(bySkill.get(s.id) ?? [])].sort((a, b) => a.at - b.at).slice(-RECENT_ANSWERS);
    return { skill: s.id, ...scoreOf(recent) };
  });
}

const nameOf = (id: SkillId) => SKILLS.find((s) => s.id === id)?.name ?? id;

function list(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/**
 * What a child is strong at and still growing in, without their name: "making 10 is strong, taking away is still
 * growing". Skills with too few answers are left out. Null when there is nothing to say yet.
 */
export function masteryLine(mastery: readonly SkillMastery[]): string | null {
  const strong = mastery.filter((m) => m.band === "strong").map((m) => nameOf(m.skill));
  const growing = mastery.filter((m) => m.band === "growing").map((m) => nameOf(m.skill));
  const parts: string[] = [];
  if (strong.length) parts.push(`${list(strong)} ${strong.length === 1 ? "is" : "are"} strong`);
  if (growing.length) parts.push(`${list(growing)} ${growing.length === 1 ? "is" : "are"} still growing`);
  return parts.length ? parts.join(", ") : null;
}

/** One line for grown-ups: "Amani: making 10 is strong, taking away is still growing." Null when there is nothing to say yet. */
export function masterySummary(childName: string, mastery: readonly SkillMastery[]): string | null {
  const line = masteryLine(mastery);
  return line ? `${childName}: ${line}.` : null;
}
