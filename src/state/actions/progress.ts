import { newlyEarned, getBadge, type BadgeDef } from "@/data/badges";
import { getLevel, levelCount } from "@/data/levels";
import type { LevelDraft } from "@/types/domain";
import type { AttemptLog, ChildProfile } from "@/types/models";

import { getSnapshot, setState, updateProfile } from "../core";

export const STARS_PER_LEVEL = 3;
const MAX_LEVEL_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 200;

export interface LevelCompletion {
  starsEarned: number;
  firstTime: boolean;
  newBadges: BadgeDef[];
}

export const draftKey = (grade: number, level: number) => `g${grade}-l${level}`;

export const progressActions = {
  completeLevel(profileId: string, levelNumber: number, seconds = 0): LevelCompletion {
    const profile = getSnapshot().profiles.find((p) => p.id === profileId);
    if (!profile) return { starsEarned: 0, firstTime: false, newBadges: [] };
    const grade = profile.grade;
    const done = profile.progress[grade];
    const firstTime = levelNumber === done + 1;
    const level = getLevel(grade, levelNumber);
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

  saveDraft(profileId: string, key: string, draft: { pal: boolean; board: LevelDraft } | null) {
    updateProfile(profileId, (p) => {
      const drafts = { ...p.drafts };
      if (draft) drafts[key] = draft;
      else delete drafts[key];
      return { ...p, drafts };
    });
  },

  recordHighFive(profileId: string): BadgeDef[] {
    const profile = getSnapshot().profiles.find((p) => p.id === profileId);
    if (!profile) return [];
    const next = { ...profile, highFives: profile.highFives + 1 };
    const earned = newlyEarned(next);
    next.badges = [...next.badges, ...earned];
    updateProfile(profileId, () => next);
    return earned.map((id) => getBadge(id)).filter((b): b is BadgeDef => b !== null);
  },

  logAttempt(profileId: string, attempt: AttemptLog) {
    updateProfile(profileId, (p) => ({ ...p, attempts: [...(p.attempts ?? []), attempt].slice(-MAX_ATTEMPTS) }));
  },

  clearJustUnlocked() {
    setState((s) => (s.justUnlocked ? { ...s, justUnlocked: null } : s));
  },
};
