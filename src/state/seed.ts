/**
 * Profile seeding — new ids, blank child profiles, and the demo children shown on a fresh device.
 */

import { newlyEarned } from "@/data/badges";
import type { ChildProfile } from "@/types/models";
import type { Grade } from "@/types/domain";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `p-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`; // NOSONAR non-security local id fallback
}

const EMPTY_PROGRESS: Record<Grade, number> = { 1: 0, 2: 0, 3: 0 };

export function makeProfile(input: Partial<ChildProfile> & Pick<ChildProfile, "name" | "grade" | "avatar">): ChildProfile {
  return {
    id: newId(),
    schoolCode: null,
    progress: { ...EMPTY_PROGRESS },
    stars: 0,
    badges: [],
    highFives: 0,
    questsDone: 0,
    ...input,
  };
}

/** Demo children shown after "Log In" on a fresh device (matches the "Welcome Back!" mockup). */
export function demoProfiles(): ChildProfile[] {
  const seeded = [
    makeProfile({ name: "Jaymo", grade: 1, avatar: "owl" }),
    makeProfile({ name: "Bahati", grade: 2, avatar: "cheetah", progress: { 1: 0, 2: 2, 3: 0 }, stars: 6, questsDone: 0 }),
    makeProfile({ name: "Amani", grade: 3, avatar: "bear", progress: { 1: 0, 2: 0, 3: 4 }, stars: 12, questsDone: 1, highFives: 3 }),
    makeProfile({ name: "Raha", grade: 1, avatar: "fox", progress: { 1: 1, 2: 0, 3: 0 }, stars: 3 }),
  ];
  return seeded.map((p) => ({ ...p, badges: newlyEarned(p) }));
}
