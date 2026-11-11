import { isAuthConfigured, supabase } from "@/services/auth";

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

const SAMPLE_IDENTITY = { email: "parent@gmail.com", name: null };

export type GoogleResult =
  | { ok: true; email: string; name: string | null; sample: boolean }
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

export async function continueWithGoogle(): Promise<GoogleResult> {
  if (!isGoogleConfigured) return { ok: true, ...SAMPLE_IDENTITY, sample: true };

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

export async function signOutOfGoogle(): Promise<void> {
  if (!isGoogleConfigured || !googleModule) return;
  try {
    await googleModule.GoogleSignin.signOut();
  } catch {
  }
}
