import { isAuthConfigured, supabase } from "@/services/auth";
import { forAccount } from "@/state/mergeProfiles";
import type { ChildProfile } from "@/types/models";

async function signedInUserId(): Promise<string | null> {
  const { data } = await supabase().auth.getSession();
  return data.session?.user.id ?? null;
}

/**
 * Saves each child's progress with the parent's account, and brings it back on any phone they sign in on. Never
 * throws: when offline, the phone keeps playing and the next save catches up.
 */
export const progressSync = {
  /** The family saved with the signed-in account, or null when it can't be reached. */
  async load(): Promise<ChildProfile[] | null> {
    if (!isAuthConfigured) return null;
    try {
      const userId = await signedInUserId();
      if (!userId) return null;
      const { data, error } = await supabase().from("child_progress").select("profile").eq("user_id", userId);
      if (error || !data) return null;
      return (data as { profile: ChildProfile }[]).map((row) => row.profile).filter((p) => typeof p?.id === "string");
    } catch {
      return null;
    }
  },

  /** Saves every child in the family. Returns whether it worked. */
  async save(profiles: readonly ChildProfile[]): Promise<boolean> {
    if (!isAuthConfigured || profiles.length === 0) return false;
    try {
      const userId = await signedInUserId();
      if (!userId) return false;
      const rows = profiles.map((p) => ({ user_id: userId, child_id: p.id, profile: forAccount(p) }));
      const { error } = await supabase().from("child_progress").upsert(rows, { onConflict: "user_id,child_id" });
      return !error;
    } catch {
      return false;
    }
  },
};
