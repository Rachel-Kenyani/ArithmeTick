/**
 * Progress actions — level completion, stars, badges, high-fives, and the "just unlocked" flag.
 */

import { newlyEarned, getBadge, type BadgeDef } from "@/data/badges";
import { getLevel, levelCount } from "@/data/levels";
import type { LevelDraft } from "@/types/domain";
import type { AttemptLog, ChildProfile } from "@/types/models";

import { getSnapshot, setState, updateProfile } from "../core";

/** Stars a level is worth the first time it is finished. */
export const STARS_PER_LEVEL = 3;
/** One level can add at most this much to a grade's finishing time (a phone left open on a level). */
const MAX_LEVEL_SECONDS = 15 * 60;
/** How many recent answers each profile keeps. */
const MAX_ATTEMPTS = 200;

export interface LevelCompletion {
  /** Stars added by this completion (3 the first time, 0 on a replay). */
  starsEarned: number;
  /** First time this level was finished (so the next level just unlocked). */
  firstTime: boolean;
  /** Badges earned by this completion, in celebration-priority order. */
  newBadges: BadgeDef[];
}

/** Key of a level in ChildProfile.drafts. */
export const draftKey = (grade: number, level: number) => `g${grade}-l${level}`;

export const progressActions = {
  /**
   * Record a finished level for the profile's current grade. Safe to call for replays. `seconds` is how long
   * the level took; first-time finishes add it to the grade's finishing time.
   */
  completeLevel(profileId: string, levelNumber: number, seconds = 0): LevelCompletion {
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
      progress: firstTime ? { ...profile.progress, [grade]: Math.min(levelCount(grade), done + 1) } : profile.progress,
      stars: profile.stars + starsEarned,
      gradeSeconds: firstTime
        ? { ...profile.gradeSeconds, [grade]: (profile.gradeSeconds?.[grade] ?? 0) + Math.min(MAX_LEVEL_SECONDS, Math.max(0, Math.round(seconds))) }
        : profile.gradeSeconds,
      questsDone: profile.questsDone + (level?.kind === "quest" ? 1 : 0),
    };
    if (next.drafts?.[draftKey(grade, levelNumber)]) {
      next.drafts = { ...next.drafts };
      delete next.drafts[draftKey(grade, levelNumber)];
    }
    const earned = newlyEarned(next);
    next.badges = [...next.badges, ...earned];

    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => (p.id === profileId ? next : p)),
      justUnlocked: firstTime && levelNumber < levelCount(grade) ? { grade, level: levelNumber + 1 } : s.justUnlocked,
    }));
    return {
      starsEarned,
      firstTime,
      newBadges: earned.map((id) => getBadge(id)).filter((b): b is BadgeDef => b !== null),
    };
  },

  /** Save (or with null, forget) where the child left an unfinished level. */
  saveDraft(profileId: string, key: string, draft: { pal: boolean; board: LevelDraft } | null) {
    updateProfile(profileId, (p) => {
      const drafts = { ...p.drafts };
      if (draft) drafts[key] = draft;
      else delete drafts[key];
      return { ...p, drafts };
    });
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

  /** Keep a checked answer on the phone (the newest MAX_ATTEMPTS only) for adaptive learning later. */
  logAttempt(profileId: string, attempt: AttemptLog) {
    updateProfile(profileId, (p) => ({ ...p, attempts: [...(p.attempts ?? []), attempt].slice(-MAX_ATTEMPTS) }));
  },

  clearJustUnlocked() {
    setState((s) => (s.justUnlocked ? { ...s, justUnlocked: null } : s));
  },
};
