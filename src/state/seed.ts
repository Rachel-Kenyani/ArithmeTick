import type { ChildProfile } from "@/types/models";
import type { Grade } from "@/types/domain";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `p-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
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
