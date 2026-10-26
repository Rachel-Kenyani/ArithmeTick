/**
 * Progress actions — level completion, stars, badges, high-fives, and the "just unlocked" flag.
 */

import { newlyEarned, getBadge, type BadgeDef } from "@/data/badges";
import { getLevel, LEVELS_PER_GRADE } from "@/data/levels";
import type { ChildProfile } from "@/types/models";

import { getSnapshot, setState, updateProfile } from "../core";

/** Stars a level is worth the first time it is finished. */
export const STARS_PER_LEVEL = 3;

export interface LevelCompletion {
  /** Stars added by this completion (3 the first time, 0 on a replay). */
  starsEarned: number;
  /** First time this level was finished (so the next level just unlocked). */
  firstTime: boolean;
  /** Badges earned by this completion, in celebration-priority order. */
  newBadges: BadgeDef[];
}

export const progressActions = {
  /** Record a finished level for the profile's current grade. Safe to call for replays. */
  completeLevel(profileId: string, levelNumber: number): LevelCompletion {
    const profile = getSnapshot().profiles.find((p) => p.id === profileId);
    if (!profile) return { starsEarned: 0, firstTime: false, newBadges: [] };
    const grade = profile.grade;
    const done = profile.progress[grade];
    const firstTime = levelNumber === done + 1;
    const level = getLevel(grade, levelNumber);
    // Each level is worth 3 stars, won once: replays add none, so the total can't be farmed.
    const starsEarned = firstTime ? STARS_PER_LEVEL : 0;

    const next: ChildProfile = {
      ...profile,
      progress: firstTime ? { ...profile.progress, [grade]: Math.min(LEVELS_PER_GRADE, done + 1) } : profile.progress,
      stars: profile.stars + starsEarned,
      questsDone: profile.questsDone + (level?.kind === "quest" ? 1 : 0),
    };
    const earned = newlyEarned(next);
    next.badges = [...next.badges, ...earned];

    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => (p.id === profileId ? next : p)),
      justUnlocked: firstTime && levelNumber < LEVELS_PER_GRADE ? { grade, level: levelNumber + 1 } : s.justUnlocked,
    }));
    return {
      starsEarned,
      firstTime,
      newBadges: earned.map((id) => getBadge(id)).filter((b): b is BadgeDef => b !== null),
    };
  },

  /** A real high-five on the celebration screen. Returns badges this earned (e.g. High-Five Hero). */
  recordHighFive(profileId: string): BadgeDef[] {
    const profile = getSnapshot().profiles.find((p) => p.id === profileId);
    if (!profile) return [];
    const next = { ...profile, highFives: profile.highFives + 1 };
    const earned = newlyEarned(next);
    next.badges = [...next.badges, ...earned];
    updateProfile(profileId, () => next);
    return earned.map((id) => getBadge(id)).filter((b): b is BadgeDef => b !== null);
  },

  clearJustUnlocked() {
    setState((s) => (s.justUnlocked ? { ...s, justUnlocked: null } : s));
  },
};
