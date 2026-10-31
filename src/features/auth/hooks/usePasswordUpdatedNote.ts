/**
 * One-time "Password updated" note after Reset Password (flag set there, consumed here).
 */

import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

import { consumePasswordUpdated } from "@/services/flash";

export function usePasswordUpdatedNote() {
  // One-time "Password updated" note after Reset Password (flag set there, consumed here).
  const [flagged] = useState(consumePasswordUpdated);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  useEffect(() => {
    if (!flagged) return;
    const show = setTimeout(() => {
      setPasswordUpdated(true);
      AccessibilityInfo.announceForAccessibility("Password updated. Log in with your new password.");
    }, 350);
    return () => clearTimeout(show);
  }, [flagged]);

  useEffect(() => {
    if (!passwordUpdated) return;
    const hide = setTimeout(() => setPasswordUpdated(false), 5200);
    return () => clearTimeout(hide);
  }, [passwordUpdated]);

  return passwordUpdated;
}
