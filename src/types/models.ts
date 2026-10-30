/** Persisted data shapes (see lib/store.ts). Pure types + constants — no React. */

import type { Grade, LevelDraft } from "@/types/domain";

export type AvatarKind = "owl" | "cheetah" | "bear" | "fox";

export const AVATARS: readonly AvatarKind[] = ["owl", "cheetah", "bear", "fox"];

/** Most child profiles one parent account can have (for now). */
export const MAX_PROFILES = 4;

export const AVATAR_LABELS: Record<AvatarKind, string> = {
  owl: "Owl",
  cheetah: "Cheetah",
  bear: "Bear",
  fox: "Fox",
};

export interface ChildProfile {
  id: string;
  name: string;
  /** The grade whose level map the child plays. */
  grade: Grade;
  avatar: AvatarKind;
  /** Optional 6-character school invite code entered by the parent. */
  schoolCode: string | null;
  /** Levels finished, in order, per grade (0..levelCount). Level n is playable when n ≤ progress[grade] + 1. */
  progress: Record<Grade, number>;
  stars: number;
  /** Earned badge ids (lib/badges.ts), in the order they were earned. */
  badges: string[];
  /** Real-world high-fives tapped on the celebration screen. */
  highFives: number;
  /** Physical Quests confirmed by a grown-up (any grade). */
  questsDone: number;
  /** Recent answers checked in levels (newest last, capped), kept on the phone for PAL later. */
  attempts?: AttemptLog[];
  /**
   * Seconds spent finishing each grade's levels for the first time (replays don't count). Stops growing once
   * the grade is complete, so it is that grade's finishing time — kept for a future leaderboard.
   */
  gradeSeconds?: Partial<Record<Grade, number>>;
  /** Unfinished levels by key `g{grade}-l{level}` (resume), with whether help was on. Cleared when the level is finished. */
  drafts?: Record<string, { pal: boolean; board: LevelDraft }>;
}

/** One "Done" press: what the child built and whether it matched. */
export interface AttemptLog {
  grade: Grade;
  level: number;
  target: number;
  answer: number;
  correct: boolean;
  /** Milliseconds from the level opening to this answer. */
  ms: number;
  /** Stealth PAL help was showing when they answered. */
  pal: boolean;
  at: number;
}

export interface Account {
  /** Email or phone number the parent signed in with (never a password). */
  identifier: string;
  method: "password" | "google";
  /** Display name from Google (absent for password accounts). */
  name?: string | null;
}

export interface PendingVerification {
  identifier: string;
  purpose: "signup" | "reset";
}

export interface AppState {
  v: 1;
  /** The fun first-launch splash has been shown on this device. */
  seenSplash: boolean;
  account: Account | null;
  /** An OTP flow in progress (Create Account → Verify Account, or Forgot → Verify Identity → Reset). */
  pending: PendingVerification | null;
  profiles: ChildProfile[];
  activeProfileId: string | null;
  /** Daily screen-time cap bookkeeping (local date YYYY-MM-DD). */
  screenTime: { day: string; usedSeconds: number };
  /**
   * One-shot hand-off from the play screen to the home map: the level that was just unlocked,
   * so the map can play its unlock animation. The map clears it after reading.
   */
  justUnlocked: { grade: Grade; level: number } | null;
}
