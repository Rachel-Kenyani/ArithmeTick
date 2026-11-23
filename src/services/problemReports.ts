import Constants from "expo-constants";
import { Platform } from "react-native";

import { isAuthConfigured, supabase } from "@/services/auth";
import type { Grade } from "@/types/domain";

export type ReportKind = "broken" | "hard" | "idea" | "other";

export const REPORT_KINDS: readonly { id: ReportKind; label: string }[] = [
  { id: "broken", label: "Something didn’t work" },
  { id: "hard", label: "Hard to use or reach" },
  { id: "idea", label: "An idea" },
  { id: "other", label: "Something else" },
];

export const MESSAGE_MAX = 2000;
export const REPORT_EMAIL = "rachelkenyani@gmail.com";

export interface ProblemReport {
  kind: ReportKind;
  message: string;
  grade: Grade | null;
}

export type SendResult = { ok: true } | { ok: false; message: string };

/** What's wrong with a report before sending, or null when it's ready. */
export function reportProblem(report: Partial<ProblemReport>): { kind: string | null; message: string | null } {
  const text = report.message?.trim() ?? "";
  return {
    kind: report.kind ? null : "Choose what kind of report this is.",
    message: !text ? "Tell us what happened, in a sentence or two." : text.length > MESSAGE_MAX ? `Please keep it under ${MESSAGE_MAX} characters.` : null,
  };
}

/** The app version and phone type, so a problem can be matched to a build. Never anything about the child. */
export function deviceInfo(): { app_version: string; platform: string } {
  return { app_version: Constants.expoConfig?.version ?? "unknown", platform: `${Platform.OS} ${String(Platform.Version)}` };
}

/** Sends a report to the developer. Never throws: a failure says how to email instead. */
export async function sendProblemReport(report: ProblemReport): Promise<SendResult> {
  const failed: SendResult = { ok: false, message: `We couldn’t send it. Check your connection, or email ${REPORT_EMAIL}.` };
  const problem = reportProblem(report);
  if (problem.kind || problem.message) return { ok: false, message: problem.kind ?? problem.message ?? "" };
  if (!isAuthConfigured) return failed;
  try {
    const { data } = await supabase().auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return { ok: false, message: `Please log in again, or email ${REPORT_EMAIL}.` };
    const { error } = await supabase()
      .from("problem_reports")
      .insert({ user_id: userId, kind: report.kind, message: report.message.trim(), grade: report.grade, ...deviceInfo() });
    return error ? failed : { ok: true };
  } catch {
    return failed;
  }
}
