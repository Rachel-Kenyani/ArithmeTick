import type { Grade, LevelDraft } from "@/types/domain";

export type AvatarKind = "owl" | "cheetah" | "bear" | "fox";

export const AVATARS: readonly AvatarKind[] = ["owl", "cheetah", "bear", "fox"];

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
  grade: Grade;
  avatar: AvatarKind;
  schoolCode: string | null;
  progress: Record<Grade, number>;
  stars: number;
  badges: string[];
  highFives: number;
  questsDone: number;
  cleanSolves?: Partial<Record<Grade, number>>;
  helpedSolves?: number;
  daysPlayed?: string[];
  attempts?: AttemptLog[];
  gradeSeconds?: Partial<Record<Grade, number>>;
  drafts?: Record<string, { pal: boolean; board: LevelDraft }>;
}

export interface AttemptLog {
  grade: Grade;
  level: number;
  target: number;
  answer: number;
  correct: boolean;
  ms: number;
  pal: boolean;
  at: number;
}

export interface Account {
  identifier: string;
  method: "password" | "google";
  name?: string | null;
}

export interface PendingVerification {
  identifier: string;
  purpose: "signup" | "reset";
}

export interface AppState {
  v: 1;
  seenSplash: boolean;
  account: Account | null;
  pending: PendingVerification | null;
  profiles: ChildProfile[];
  activeProfileId: string | null;
  screenTime: { day: string; usedSeconds: number };
  justUnlocked: { grade: Grade; level: number } | null;
}
