/**
 * Reviewer tools — jump grades/progress, reset screen time, wipe the demo.
 */

import { newlyEarned } from "@/data/badges";
import { LEVELS_PER_GRADE } from "@/data/levels";
import type { Grade } from "@/types/domain";

import { DEFAULT_STATE, setState, todayKey, updateProfile } from "../core";

export const reviewerActions = {
  setProfileGrade(profileId: string, grade: Grade) {
    updateProfile(profileId, (p) => ({ ...p, grade }));
  },

  /** Reviewer: mark `count` levels of the profile's current grade as finished (0 = reset that grade). */
  setProgress(profileId: string, count: number) {
    updateProfile(profileId, (p) => {
      const next = { ...p, progress: { ...p.progress, [p.grade]: Math.max(0, Math.min(LEVELS_PER_GRADE, count)) } };
      return { ...next, badges: [...next.badges, ...newlyEarned(next)] };
    });
  },

  resetScreenTime() {
    setState((s) => ({ ...s, screenTime: { day: todayKey(), usedSeconds: 0 } }));
  },

  /** Wipe everything on this device → next launch shows the first-time splash again. */
  resetDemo() {
    setState(() => ({ ...DEFAULT_STATE, screenTime: { day: todayKey(), usedSeconds: 0 } }));
  },
};
