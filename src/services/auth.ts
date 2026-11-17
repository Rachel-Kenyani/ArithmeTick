import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { PendingVerification } from "@/types/models";

export type AuthResult = { ok: true } | { ok: false; message: string };
export type SignUpResult = { ok: true; existing: boolean } | { ok: false; message: string };

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(URL && ANON_KEY);

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  client ??= createClient(URL ?? "", ANON_KEY ?? "", {
    auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return client;
}

const OK: AuthResult = { ok: true };
const NOT_CONFIGURED: AuthResult = { ok: false, message: "Sign-in isn’t available right now. Try again later." };
export const RESET_LINK = "arithmetick://reset-password";
const UNKNOWN_ACCOUNT_CODES = new Set(["otp_disabled", "user_not_found", "signup_disabled"]);
const EXISTS_CODES = new Set(["user_already_exists", "phone_exists", "email_exists"]);
const isEmail = (identifier: string) => identifier.includes("@");

/** Turns a Supabase error into a message a parent can act on. Exported for tests. */
export function failure(error: { message: string; code?: string } | null, fallback: string): AuthResult {
  if (!error) return OK;
  if (error.code === "invalid_credentials") return { ok: false, message: "That email or password didn’t match." };
  if (error.code === "email_not_confirmed") return { ok: false, message: "Please verify your email first. Check your inbox for the code." };
  if (error.code === "same_password") return { ok: false, message: "That’s your current password. Choose a new one." };
  if (error.code === "weak_password") return { ok: false, message: "That password is too easy to guess. Try a longer one." };
  if (error.code === "session_not_found" || error.code === "session_expired" || /auth session missing/i.test(error.message)) {
    return { ok: false, message: "Your reset code has expired. Ask for a new code." };
  }
  const wait = /after (\d+) seconds?/i.exec(error.message);
  if (wait) return { ok: false, message: `Please wait ${wait[1]} seconds, then tap Resend Code.` };
  if (error.code === "over_sms_send_rate_limit" || error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") {
    return { ok: false, message: "Too many codes sent for now. Please try again in a little while." };
  }
  if (/error sending .*email/i.test(error.message)) {
    return { ok: false, message: "We couldn’t send the email code right now. Try Continue with Google, or try again later." };
  }
  if (error.code === "unexpected_failure" && /hook/i.test(error.message)) {
    return { ok: false, message: "We couldn’t text that number. It may be blocking promotional messages: on Safaricom, dial *456*9*5# and allow messages from AFRICASTKNG, then try again. Or use your email." };
  }
  if (error.code === "otp_expired") return { ok: false, message: "That code didn’t match or has expired. Try again." };
  if (error.message.toLowerCase().includes("network")) return { ok: false, message: "We couldn’t reach the server. Check your connection." };
  return { ok: false, message: fallback };
}

async function safely(run: () => Promise<AuthResult>, fallback: string): Promise<AuthResult> {
  try {
    return await run();
  } catch {
    return { ok: false, message: fallback };
  }
}

export const auth = {
  /**
   * Never says whether an account already exists. For an existing account, nothing is created: the owner is sent a
   * code to choose a new password instead, and the app shows the same code screen either way.
   */
  async signUp(identifier: string, password: string): Promise<SignUpResult> {
    if (!isAuthConfigured) return NOT_CONFIGURED;
    const fallback = "We couldn’t create the account. Try again.";
    try {
      const { data, error } = isEmail(identifier)
        ? await supabase().auth.signUp({ email: identifier, password })
        : await supabase().auth.signUp({ phone: identifier, password });
      const exists = error ? EXISTS_CODES.has(error.code ?? "") : data.user?.identities?.length === 0;
      if (exists) {
        const sent = await auth.sendResetCode(identifier);
        return sent.ok ? { ok: true, existing: true } : sent;
      }
      const result = failure(error, fallback);
      return result.ok ? { ok: true, existing: false } : result;
    } catch {
      return { ok: false, message: fallback };
    }
  },

  logIn(identifier: string, password: string): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(NOT_CONFIGURED);
    return safely(async () => {
      const { error } = isEmail(identifier)
        ? await supabase().auth.signInWithPassword({ email: identifier, password })
        : await supabase().auth.signInWithPassword({ phone: identifier, password });
      return failure(error, "We couldn’t log you in. Try again.");
    }, "We couldn’t log you in. Try again.");
  },

  sendResetCode(identifier: string): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(NOT_CONFIGURED);
    return safely(async () => {
      const { error } = isEmail(identifier)
        ? await supabase().auth.resetPasswordForEmail(identifier, { redirectTo: RESET_LINK })
        : await supabase().auth.signInWithOtp({ phone: identifier, options: { shouldCreateUser: false } });
      if (error && UNKNOWN_ACCOUNT_CODES.has(error.code ?? "")) return OK;
      return failure(error, "We couldn’t send the code. Try again.");
    }, "We couldn’t send the code. Try again.");
  },

  resendCode(flow: PendingVerification): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(NOT_CONFIGURED);
    if (flow.purpose !== "signup") return auth.sendResetCode(flow.identifier);
    return safely(async () => {
      const { error } = isEmail(flow.identifier)
        ? await supabase().auth.resend({ type: "signup", email: flow.identifier })
        : await supabase().auth.resend({ type: "sms", phone: flow.identifier });
      return failure(error, "We couldn’t send a new code. Try again.");
    }, "We couldn’t send a new code. Try again.");
  },

  verifyCode(flow: PendingVerification, code: string): Promise<AuthResult> {
    const wrong: AuthResult = { ok: false, message: "That code didn’t match. Check it and try again." };
    if (!isAuthConfigured) return Promise.resolve(NOT_CONFIGURED);
    return safely(async () => {
      if (!isEmail(flow.identifier)) {
        const { error } = await supabase().auth.verifyOtp({ phone: flow.identifier, token: code, type: "sms" });
        return error ? wrong : OK;
      }
      const type = flow.purpose === "signup" ? "signup" : "recovery";
      const { error } = await supabase().auth.verifyOtp({ email: flow.identifier, token: code, type });
      return error ? wrong : OK;
    }, "We couldn’t check the code. Check your connection.");
  },

  setNewPassword(password: string): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(NOT_CONFIGURED);
    return safely(async () => {
      const { error } = await supabase().auth.updateUser({ password });
      if (error) return failure(error, "We couldn’t save the new password. Try again.");
      await supabase().auth.signOut();
      return OK;
    }, "We couldn’t save the new password. Try again.");
  },

  async openResetLink(url: string): Promise<{ ok: true; email: string } | { ok: false; message: string }> {
    const expired = { ok: false as const, message: "That reset link has expired. Ask for a new code." };
    if (!isAuthConfigured) return expired;
    const params = new URLSearchParams(url.split("#")[1] ?? url.split("?")[1] ?? "");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (params.get("error") || !accessToken || !refreshToken) return expired;
    try {
      const { data, error } = await supabase().auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (error || !data.user?.email) return expired;
      return { ok: true, email: data.user.email };
    } catch {
      return expired;
    }
  },

  /**
   * Checks the current password, then asks Supabase to send a code to the new email. The password check stops someone
   * holding an unlocked phone from moving the account to their own email.
   */
  requestEmailChange(currentEmail: string, password: string, newEmail: string): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(NOT_CONFIGURED);
    const fallback = "We couldn’t send a code to the new email. Try again.";
    return safely(async () => {
      const checked = await supabase().auth.signInWithPassword({ email: currentEmail, password });
      if (checked.error?.code === "invalid_credentials") return { ok: false, message: "That password didn’t match." };
      if (checked.error) return failure(checked.error, fallback);
      const { error } = await supabase().auth.updateUser({ email: newEmail });
      if (error && EXISTS_CODES.has(error.code ?? "")) {
        return { ok: false, message: "That email is already used by another ArithmeTick account." };
      }
      return failure(error, fallback);
    }, fallback);
  },

  /** Finishes the change with the code sent to the new email. */
  confirmEmailChange(newEmail: string, code: string): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(NOT_CONFIGURED);
    return safely(async () => {
      const { data, error } = await supabase().auth.verifyOtp({ email: newEmail, token: code, type: "email_change" });
      if (error) return { ok: false, message: "That code didn’t match. Check it and try again." };
      if (data.user?.email?.toLowerCase() !== newEmail.toLowerCase()) {
        return { ok: false, message: "Also confirm with the code sent to your current email, then try again." };
      }
      return OK;
    }, "We couldn’t check the code. Check your connection.");
  },

  /** Deletes the signed-in account on the server. Needs a live session, so an old one asks the parent to log in again. */
  async deleteAccount(): Promise<AuthResult> {
    if (!isAuthConfigured) return NOT_CONFIGURED;
    const fallback = "We couldn’t delete the account. Check your connection and try again.";
    try {
      const { data } = await supabase().auth.getSession();
      if (!data.session) return { ok: false, message: "Please log out and log in again, then delete the account." };
      const { error } = await supabase().functions.invoke("delete-account", { method: "POST" });
      if (error) return { ok: false, message: fallback };
      await supabase().auth.signOut({ scope: "local" });
      return OK;
    } catch {
      return { ok: false, message: fallback };
    }
  },

  async signOut(): Promise<void> {
    if (!isAuthConfigured) return;
    try {
      await supabase().auth.signOut();
    } catch {
    }
  },
};
