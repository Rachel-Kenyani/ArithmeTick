/**
 * "Continue with Google" for both Log In and Create Account. The native Google account picker returns an ID
 * token, which Supabase turns into a session (signInWithIdToken): the first time, that also creates the account.
 *
 * Needs a development build (`npx expo run:ios` / `run:android`): Expo Go has no native Google module, so the
 * library is loaded lazily and a friendly message is shown there. Without Supabase + the Google client IDs
 * configured, the offline prototype's sample identity is used instead.
 */

import { isAuthConfigured, supabase } from "@/services/auth";

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/** Placeholder identity for the offline prototype. */
const SAMPLE_IDENTITY = { email: "parent@gmail.com", name: null };
/** A Supabase user whose first and latest sign-in are this close together has just been created. */
const NEW_ACCOUNT_WINDOW_MS = 30_000;

export type GoogleResult =
  | { ok: true; email: string; name: string | null; isNew: boolean; sample: boolean }
  | { ok: false; cancelled: boolean; message: string };

const isGoogleConfigured = isAuthConfigured && Boolean(WEB_CLIENT_ID);
const failed = (message: string): GoogleResult => ({ ok: false, cancelled: false, message });
const CANCELLED: GoogleResult = { ok: false, cancelled: true, message: "" };

type GoogleModule = typeof import("@react-native-google-signin/google-signin");
let googleModule: GoogleModule | null = null;
async function loadGoogle(): Promise<GoogleModule | null> {
  if (googleModule) return googleModule;
  try {
    const mod = await import("@react-native-google-signin/google-signin");
    mod.GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, iosClientId: IOS_CLIENT_ID });
    googleModule = mod;
    return mod;
  } catch {
    return null;
  }
}

function isNewAccount(createdAt?: string, lastSignInAt?: string): boolean {
  if (!createdAt || !lastSignInAt) return false;
  return Math.abs(Date.parse(lastSignInAt) - Date.parse(createdAt)) < NEW_ACCOUNT_WINDOW_MS;
}

export async function continueWithGoogle(): Promise<GoogleResult> {
  if (!isGoogleConfigured) return { ok: true, ...SAMPLE_IDENTITY, isNew: false, sample: true };

  const google = await loadGoogle();
  if (!google) return failed("Google sign-in works in the full app build, not in Expo Go.");
  const { GoogleSignin, isCancelledResponse, isErrorWithCode, statusCodes } = google;

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (isCancelledResponse(response)) return CANCELLED;
    const idToken = response.data.idToken;
    if (!idToken) return failed("Google didn’t send a sign-in token. Try again.");

    const { data, error } = await supabase().auth.signInWithIdToken({ provider: "google", token: idToken });
    if (error || !data.user) return failed("We couldn’t sign you in with Google. Try again.");
    const user = data.user;
    return {
      ok: true,
      email: user.email ?? response.data.user.email,
      name: response.data.user.name,
      isNew: isNewAccount(user.created_at, user.last_sign_in_at),
      sample: false,
    };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.IN_PROGRESS) return CANCELLED;
    if (isErrorWithCode(error) && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return failed("This phone needs Google Play services to sign in with Google.");
    }
    return failed("We couldn’t sign you in with Google. Try again.");
  }
}

/** Forget the Google account on log out, so the picker shows next time. */
export async function signOutOfGoogle(): Promise<void> {
  if (!isGoogleConfigured || !googleModule) return;
  try {
    await googleModule.GoogleSignin.signOut();
  } catch {
    // Logging out of ArithmeTick still goes ahead.
  }
}
