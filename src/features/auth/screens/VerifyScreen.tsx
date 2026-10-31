/**
 * Verify Account (pending.purpose = "signup") / Verify Identity ("reset"). Needs a pending OTP flow in the store;
 * without one → /welcome. Signup → "Almost Done!", reset → Reset Password.
 */

import { router, useIsFocused } from "expo-router";
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

  // Only while this screen is showing: once Reset Password finishes, this screen is still underneath and
  // must not pull the parent back to Welcome.
  const focused = useIsFocused();
  useEffect(() => {
    if (focused && hydrated && !flow) router.replace(ROUTES.welcome);
  }, [focused, hydrated, flow]);

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
