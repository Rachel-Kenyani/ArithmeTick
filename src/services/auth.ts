/**
 * Parent accounts (email or Kenyan phone). With EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY set,
 * sign-up, log-in, the 8-digit codes (email, or SMS via the send-sms hook) and password resets go through Supabase Auth (passwords go straight to Supabase and
 * are never stored on the phone). Without them the app keeps its offline prototype rules: any 8 digits pass.
 *
 * Every call resolves to { ok: true } or { ok: false, message } with a parent-readable message.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { PendingVerification } from "@/types/models";
import { CODE_LENGTH } from "@/features/auth/utils/verifyFlow";

export type AuthResult = { ok: true } | { ok: false; message: string };

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(URL && ANON_KEY);

let client: SupabaseClient | null = null;
/** The shared Supabase client (only call when isAuthConfigured). */
export function supabase(): SupabaseClient {
  client ??= createClient(URL ?? "", ANON_KEY ?? "", {
    auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return client;
}

const OK: AuthResult = { ok: true };
/** The "Reset password" button in the email opens the app here (allow it under Auth → URL Configuration). */
export const RESET_LINK = "arithmetick://reset-password";
/** Errors Supabase gives for a number with no account; Forgot Password treats them as "sent". */
const UNKNOWN_ACCOUNT_CODES = new Set(["otp_disabled", "user_not_found", "signup_disabled"]);
const ALREADY_REGISTERED: AuthResult = {
  ok: false,
  message: "That email already has an account.",
};
const isEmail = (identifier: string) => identifier.includes("@");

function failure(error: { message: string; code?: string } | null, fallback: string): AuthResult {
  if (!error) return OK;
  if (error.code === "invalid_credentials") return { ok: false, message: "That email or password didn’t match." };
  if (error.code === "email_not_confirmed") return { ok: false, message: "Please verify your email first. Check your inbox for the code." };
  if (error.code === "user_already_exists") return ALREADY_REGISTERED;
  // Supabase allows one code per number/email about every 60s, and only a few an hour.
  const wait = /after (\d+) seconds?/i.exec(error.message);
  if (wait) return { ok: false, message: `Please wait ${wait[1]} seconds, then tap Resend Code.` };
  if (error.code === "over_sms_send_rate_limit" || error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") {
    return { ok: false, message: "Too many codes sent for now. Please try again in a little while." };
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
  /** Create the account; Supabase sends a code (email, or SMS via Africa's Talking) to confirm it. */
  signUp(identifier: string, password: string): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(OK);
    return safely(async () => {
      const { data, error } = isEmail(identifier)
        ? await supabase().auth.signUp({ email: identifier, password })
        : await supabase().auth.signUp({ phone: identifier, password });
      // An address that already has an account (e.g. from Google) comes back without an error but with no
      // identities, and no code is sent, so say so instead of opening Verify for a code that never comes.
      if (!error && data.user && data.user.identities?.length === 0) return ALREADY_REGISTERED;
      return failure(error, "We couldn’t create the account. Try again.");
    }, "We couldn’t create the account. Try again.");
  },

  logIn(identifier: string, password: string): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(OK);
    return safely(async () => {
      const { error } = isEmail(identifier)
        ? await supabase().auth.signInWithPassword({ email: identifier, password })
        : await supabase().auth.signInWithPassword({ phone: identifier, password });
      return failure(error, "We couldn’t log you in. Try again.");
    }, "We couldn’t log you in. Try again.");
  },

  /**
   * Forgot password: send a code that proves it's the parent. Email uses Supabase's reset email; phones get an
   * SMS sign-in code instead (Supabase has no reset-by-SMS), and Reset Password then saves the new password.
   */
  sendResetCode(identifier: string): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(OK);
    return safely(async () => {
      const { error } = isEmail(identifier)
        ? await supabase().auth.resetPasswordForEmail(identifier, { redirectTo: RESET_LINK })
        : await supabase().auth.signInWithOtp({ phone: identifier, options: { shouldCreateUser: false } });
      // An unknown number looks exactly like a known one, so nobody can check who has an account.
      if (error && UNKNOWN_ACCOUNT_CODES.has(error.code ?? "")) return OK;
      return failure(error, "We couldn’t send the code. Try again.");
    }, "We couldn’t send the code. Try again.");
  },

  /** "Resend Code" on the Verify screen. */
  resendCode(flow: PendingVerification): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(OK);
    if (flow.purpose === "reset") return auth.sendResetCode(flow.identifier);
    return safely(async () => {
      const { error } = isEmail(flow.identifier)
        ? await supabase().auth.resend({ type: "signup", email: flow.identifier })
        : await supabase().auth.resend({ type: "sms", phone: flow.identifier });
      return failure(error, "We couldn’t send a new code. Try again.");
    }, "We couldn’t send a new code. Try again.");
  },

  /** Check the code: confirms a new account, or opens a short session that allows a new password. */
  verifyCode(flow: PendingVerification, code: string): Promise<AuthResult> {
    const wrong: AuthResult = { ok: false, message: "That code didn’t match. Check it and try again." };
    if (!isAuthConfigured) return Promise.resolve(new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code) ? OK : wrong);
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

  /** Reset Password → save it (needs the session from verifyCode), then sign out so they log in fresh. */
  setNewPassword(password: string): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(OK);
    return safely(async () => {
      const { error } = await supabase().auth.updateUser({ password });
      if (error) return failure(error, "We couldn’t save the new password. Try again.");
      await supabase().auth.signOut();
      return OK;
    }, "We couldn’t save the new password. Try again.");
  },

  /**
   * The email's reset link lands as arithmetick://reset-password#access_token=…&refresh_token=…&type=recovery.
   * Turns it into the short session that lets Reset Password save a new password. Resolves with the email.
   */
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

  async signOut(): Promise<void> {
    if (!isAuthConfigured) return;
    try {
      await supabase().auth.signOut();
    } catch {
      // Logging out still clears the account on the phone.
    }
  },
};
