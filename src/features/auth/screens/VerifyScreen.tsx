/**
 * Verify Account (mockup 05, pending.purpose = "signup") / Verify Identity (mockup 09, "reset").
 *
 * - Needs a pending OTP flow in the store; without one → /welcome.
 * - 5 OTP boxes, focused on load, auto-submit when complete.
 * - Parent-facing countdown "Code Expires in 00:59". At 00:00 the countdown becomes one inline alert, "This code
 *   has expired", with its own "Send a new code" action; verifying then just shakes and points at it (no second
 *   error). "Resend Code" is always enabled: it restarts the clock, clears the boxes and shows a "New code sent" toast.
 * - Errors are inline under the boxes, one at a time, with an icon, a gentle shake and a light warning haptic:
 *   incomplete → "Enter all 5 digits of the code."; wrong → "That code didn't match. Check it and try again."
 * - Prototype rule: any 5 digits pass (actions.verifyCode). Signup → "Almost Done!", reset → Reset Password.
 */

import { router } from "expo-router";
import { useEffect, useState } from "react";

import SplashBackdrop from "@/components/backdrops/SplashBackdrop";
import type { PendingVerification } from "@/types/models";
import { ROUTES } from "@/constants/routes";
import { useAppState, useHydrated } from "@/state/store";

import VerifyCard from "../components/verify/VerifyCard";

export default function VerifyScreen() {
  const hydrated = useHydrated();
  const { pending } = useAppState();
  // Signup verification clears `pending` while we navigate away — keep showing the screen meanwhile.
  const [finished, setFinished] = useState<PendingVerification | null>(null);
  const flow = pending ?? finished;

  useEffect(() => {
    if (hydrated && !flow) router.replace(ROUTES.welcome);
  }, [hydrated, flow]);

  if (!hydrated || !flow) return <SplashBackdrop />;
  // Keyed: a new flow (e.g. a different number) starts with fresh boxes and a fresh clock.
  return (
    <VerifyCard
      key={`${flow.purpose}:${flow.identifier}`}
      flow={flow}
      onVerified={setFinished}
    />
  );
}
