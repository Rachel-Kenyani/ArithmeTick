import { BADGES } from "@/data/badges";
import { levelCount } from "@/data/levels";
import { STARS_PER_LEVEL } from "@/state/actions/progress";
import type { ChildProfile } from "@/types/models";

export const FAMILY_GOAL_STEP = 30;
export const PERSONAL_GOAL_STEP = 15;

export interface StarGoal {
  stars: number;
  goal: number;
  reached: number;
  complete: boolean;
}

function starCeiling(child: ChildProfile): number {
  return Math.max(child.stars, levelCount(child.grade) * STARS_PER_LEVEL);
}

export function starGoal(children: readonly ChildProfile[], step: number): StarGoal {
  const stars = children.reduce((sum, c) => sum + c.stars, 0);
  const ceiling = children.reduce((sum, c) => sum + starCeiling(c), 0);
  const complete = stars >= ceiling;
  return { stars, goal: complete ? ceiling : Math.min((Math.floor(stars / step) + 1) * step, ceiling), reached: Math.floor(stars / step), complete };
}

export interface Journey {
  levelsDone: number;
  levels: number;
  badgesWon: number;
  badges: number;
  questsDone: number;
  daysPlayed: number;
}

export function journeyOf(child: ChildProfile): Journey {
  const theirs = BADGES.filter((b) => b.grade === undefined || b.grade === child.grade);
  return {
    levelsDone: child.progress[child.grade],
    levels: levelCount(child.grade),
    badgesWon: theirs.filter((b) => child.badges.includes(b.id)).length,
    badges: theirs.length,
    questsDone: child.questsDone,
    daysPlayed: child.daysPlayed?.length ?? 0,
  };
}
