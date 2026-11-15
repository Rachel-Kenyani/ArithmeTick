import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { PendingVerification } from "@/types/models";

export type AuthResult = { ok: true } | { ok: false; message: string };

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
const ALREADY_REGISTERED: AuthResult = {
  ok: false,
  message: "That email or phone number already has an account. Log in instead.",
};
const NO_PHONE_ACCOUNT: AuthResult = {
  ok: false,
  message: "No account uses that phone number. Check the number, or sign up.",
};
const isEmail = (identifier: string) => identifier.includes("@");

function failure(error: { message: string; code?: string } | null, fallback: string): AuthResult {
  if (!error) return OK;
  if (error.code === "invalid_credentials") return { ok: false, message: "That email or password didn’t match." };
  if (error.code === "email_not_confirmed") return { ok: false, message: "Please verify your email first. Check your inbox for the code." };
  if (error.code === "user_already_exists" || error.code === "phone_exists" || error.code === "email_exists") return ALREADY_REGISTERED;
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
  signUp(identifier: string, password: string): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(NOT_CONFIGURED);
    return safely(async () => {
      const { data, error } = isEmail(identifier)
        ? await supabase().auth.signUp({ email: identifier, password })
        : await supabase().auth.signUp({ phone: identifier, password });
      if (!error && data.user && data.user.identities?.length === 0) return ALREADY_REGISTERED;
      return failure(error, "We couldn’t create the account. Try again.");
    }, "We couldn’t create the account. Try again.");
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
      if (error && UNKNOWN_ACCOUNT_CODES.has(error.code ?? "")) {
        // An email reset never says whether the account exists. For a phone, Supabase sends nothing, so say so
        // instead of showing a code screen for a text that will never arrive.
        return isEmail(identifier) ? OK : NO_PHONE_ACCOUNT;
      }
      return failure(error, "We couldn’t send the code. Try again.");
    }, "We couldn’t send the code. Try again.");
  },

  resendCode(flow: PendingVerification): Promise<AuthResult> {
    if (!isAuthConfigured) return Promise.resolve(NOT_CONFIGURED);
    if (flow.purpose === "reset") return auth.sendResetCode(flow.identifier);
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

  async signOut(): Promise<void> {
    if (!isAuthConfigured) return;
    try {
      await supabase().auth.signOut();
    } catch {
    }
  },
};
