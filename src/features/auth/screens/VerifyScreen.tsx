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
  const [finished, setFinished] = useState<PendingVerification | null>(null);
  const flow = pending ?? finished;

  const focused = useIsFocused();
  useEffect(() => {
    if (focused && hydrated && !flow) router.replace(ROUTES.welcome);
  }, [focused, hydrated, flow]);

  if (!hydrated || !flow) return <SplashBackdrop />;
  return (
    <VerifyCard
      key={`${flow.purpose}:${flow.identifier}`}
      flow={flow}
      onVerified={setFinished}
    />
  );
}
