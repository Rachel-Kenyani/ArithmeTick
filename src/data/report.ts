import { levelCount } from "@/data/levels";
import { masteryLine, masteryOf, type SkillId } from "@/data/skills";
import type { ChildProfile } from "@/types/models";

/**
 * A game to try at home for a skill that is still growing, written for the grown-up. `{name}` is the child's name.
 * Each uses things every Kenyan home has, like the Move & Play activities.
 */
export const PRACTICE_IDEAS: Record<SkillId, string> = {
  makingTen: "Show a number on your fingers, like 7. Ask {name} how many more fingers make 10.",
  takingAway: "Put 9 bottle tops on the table. Hide some under a cup while {name} looks away. How many are hiding?",
  placeValue: "Bundle sticks or spoons into tens with a rubber band. Ask {name} how many tens and ones make 34.",
  addingOn: "At the shop, ask {name} to add two prices together, counting on from the bigger one.",
  countingInSteps: "Climb the stairs with {name}, counting in 2s on the way up and in 10s on the way back down.",
  groups: "Lay out seeds in 3 rows of 4. Ask {name} to count the rows, not every seed: 4, 8, 12.",
  sharing: "Share a chapati or mango into 2 or 4 equal pieces at dinner. Ask {name} what each piece is called.",
  time: "Each time you look at a clock today, ask {name} where the long hand is and what time it shows.",
};

/** What the server keeps about a child for report emails, and nothing more: no answers, no animal, no badges. */
export interface ChildReport {
  child_id: string;
  child_name: string;
  grade: number;
  levels_done: number;
  level_count: number;
  /** Levels finished in every grade, so the weekly email can say how many were done this week. */
  total_levels: number;
  stars: number;
  /** "making 10 is strong, taking away is still growing", or null before there is enough to say. */
  skills_line: string | null;
  /** One thing to try at home, for the skill that needs it most. */
  practice_idea: string | null;
}

export function childReport(profile: ChildProfile): ChildReport {
  const mastery = masteryOf(profile.attempts ?? []);
  const needsMost = mastery.filter((m) => m.band === "growing").sort((a, b) => a.score - b.score)[0];
  return {
    child_id: profile.id,
    child_name: profile.name,
    grade: profile.grade,
    levels_done: profile.progress[profile.grade],
    level_count: levelCount(profile.grade),
    total_levels: profile.progress[1] + profile.progress[2] + profile.progress[3],
    stars: profile.stars,
    skills_line: masteryLine(mastery),
    practice_idea: needsMost ? PRACTICE_IDEAS[needsMost.skill].replaceAll("{name}", profile.name) : null,
  };
}

/** True when this level was the last one in the child's grade and was just finished for the first time. */
export function finishedGrade(profile: ChildProfile, levelNumber: number, firstTime: boolean): boolean {
  return firstTime && levelNumber === levelCount(profile.grade);
}
