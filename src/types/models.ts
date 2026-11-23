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
  cleanLevels?: string[];
  replays?: number;
  daysPlayed?: string[];
  attempts?: AttemptLog[];
  gradeSeconds?: Partial<Record<Grade, number>>;
  drafts?: Record<string, { pal: boolean; board: LevelDraft }>;
  sound?: SoundSettings;
  /** "Larger Brijo captions": Brijo's instructions and story text shown 25% larger, for a child who finds the normal size hard to read. */
  largeText?: boolean;
  /** "Calm mode": no sparkles, bouncing or celebration sounds, for a child who is easily overwhelmed. */
  calm?: boolean;
  /** When the name, animal, school code or sound settings last changed, so the newest edit wins across phones. */
  editedAt?: number;
}

export interface SoundSettings {
  effects: boolean;
  voice: boolean;
}

export const DEFAULT_SOUND: SoundSettings = { effects: true, voice: true };

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
  /** The grown-up turned on weekly email reports. The server holds the real setting; this remembers it on the phone. */
  reports?: boolean;
}

export interface PendingVerification {
  identifier: string;
  /** `existing`: someone signed up with an email or phone that already has an account. They see the sign-up screens, but get a code to choose a new password. */
  purpose: "signup" | "reset" | "existing";
}

export interface AppState {
  v: 1;
  seenSplash: boolean;
  account: Account | null;
  pending: PendingVerification | null;
  profiles: ChildProfile[];
  /** Each signed-out account's children, by account key, so one account never sees another's family. */
  families?: Record<string, ChildProfile[]>;
  activeProfileId: string | null;
  screenTime: { day: string; usedSeconds: number };
  /** The family's daily play limit in minutes, set by a grown-up. Kept on this phone only, never saved with the account. */
  dailyLimitMinutes?: number;
  justUnlocked: { grade: Grade; level: number } | null;
}
