import { childReport, finishedGrade } from "@/data/report";
import { isAuthConfigured, supabase, type AuthResult } from "@/services/auth";
import type { ChildProfile } from "@/types/models";

const OK: AuthResult = { ok: true };
const FAILED: AuthResult = { ok: false, message: "We couldn't change email reports. Check your connection and try again." };
const SIGN_IN_AGAIN: AuthResult = { ok: false, message: "Please log out and log in again, then try once more." };

async function signedInUserId(): Promise<string | null> {
  const { data } = await supabase().auth.getSession();
  return data.session?.user.id ?? null;
}

/**
 * Weekly email reports, which a grown-up turns on. While they are on, a short summary of each child (name, grade,
 * levels, stars, skills and one idea to try at home) is kept on the server so the reports can be emailed. Turning
 * them off deletes those summaries. Nothing is kept until a grown-up turns reports on.
 */
export const reports = {
  async isOn(): Promise<boolean | null> {
    if (!isAuthConfigured) return null;
    try {
      const userId = await signedInUserId();
      if (!userId) return null;
      const { data, error } = await supabase().from("report_settings").select("user_id").eq("user_id", userId).maybeSingle();
      return error ? null : data !== null;
    } catch {
      return null;
    }
  },

  async turnOn(children: readonly ChildProfile[]): Promise<AuthResult> {
    if (!isAuthConfigured) return FAILED;
    try {
      const userId = await signedInUserId();
      if (!userId) return SIGN_IN_AGAIN;
      const { error } = await supabase().from("report_settings").upsert({ user_id: userId }, { onConflict: "user_id" });
      if (error) return FAILED;
      const rows = children.map((child) => ({ user_id: userId, ...childReport(child) }));
      if (rows.length) {
        const { error: rowsError } = await supabase().from("child_reports").upsert(rows, { onConflict: "user_id,child_id" });
        if (rowsError) return FAILED;
      }
      return OK;
    } catch {
      return FAILED;
    }
  },

  /** Turns reports off and deletes every child summary kept for them. */
  async turnOff(): Promise<AuthResult> {
    if (!isAuthConfigured) return FAILED;
    try {
      const userId = await signedInUserId();
      if (!userId) return SIGN_IN_AGAIN;
      const { error } = await supabase().from("child_reports").delete().eq("user_id", userId);
      if (error) return FAILED;
      const { error: settingsError } = await supabase().from("report_settings").delete().eq("user_id", userId);
      return settingsError ? FAILED : OK;
    } catch {
      return FAILED;
    }
  },

  /**
   * After a level: refreshes the child's summary, and emails the end-of-grade report when the last level of the grade
   * was just finished. Does nothing unless reports are on. Never throws: a missed update is caught up next level.
   */
  async afterLevel(child: ChildProfile, levelNumber: number, firstTime: boolean): Promise<void> {
    if (!isAuthConfigured) return;
    try {
      const userId = await signedInUserId();
      if (!userId) return;
      const { error } = await supabase()
        .from("child_reports")
        .upsert({ user_id: userId, ...childReport(child) }, { onConflict: "user_id,child_id" });
      if (error) return;
      if (finishedGrade(child, levelNumber, firstTime)) {
        await supabase().functions.invoke("send-report", { method: "POST", body: { kind: "grade", child_id: child.id } });
      }
    } catch {
      // A failed update is caught up after the next level.
    }
  },
};
