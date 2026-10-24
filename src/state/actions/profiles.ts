/**
 * Profile actions — add and select child profiles.
 */

import { AVATARS, MAX_PROFILES, type ChildProfile } from "@/types/models";
import type { Grade } from "@/types/domain";

import { getSnapshot, setState } from "../core";
import { makeProfile } from "../seed";

export const profileActions = {
  /**
   * "Almost Done!" → adds a child (avatar auto-assigned, cycling owl → cheetah → bear → fox).
   * Returns null (and adds nothing) once the account already has MAX_PROFILES children.
   */
  addProfile(input: { name: string; grade: Grade; schoolCode?: string | null }): ChildProfile | null {
    const s = getSnapshot();
    if (s.profiles.length >= MAX_PROFILES) return null;
    const used = new Set(s.profiles.map((p) => p.avatar));
    const avatar = AVATARS.find((a) => !used.has(a)) ?? AVATARS[s.profiles.length % AVATARS.length];
    const profile = makeProfile({
      name: input.name.trim(),
      grade: input.grade,
      avatar,
      schoolCode: input.schoolCode?.trim() ? input.schoolCode.trim().toUpperCase() : null,
    });
    setState((prev) => ({ ...prev, profiles: [...prev.profiles, profile] }));
    return profile;
  },

  selectProfile(id: string) {
    setState((s) => (s.profiles.some((p) => p.id === id) ? { ...s, activeProfileId: id } : s));
  },
};
