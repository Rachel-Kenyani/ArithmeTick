/**
 * Verify card logic: code / error state, countdown + expiry, resend toast, shake + haptic, and verify → next.
 */

import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, type TextInputInstance } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { sfx } from "@/services/audio";
import type { PendingVerification } from "@/types/models";
import { actions } from "@/state/store";

import {
  CODE_LENGTH,
  CODE_LIFETIME_SECONDS,
  FLOW,
  SUCCESS_PAUSE_MS,
  TOAST_MS,
} from "../utils/verifyFlow";
import { useCountdown } from "./useCountdown";

export function useVerifyFlow(
  flow: PendingVerification,
  onVerified: (flow: PendingVerification) => void,
) {
  const reduceMotion = useReducedMotion();
  const copy = FLOW[flow.purpose];
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const { secondsLeft, restart } = useCountdown(CODE_LIFETIME_SECONDS);
  /** Bumped on every resend: drives (and re-triggers) the "New code sent" toast. 0 = hidden. */
  const [toast, setToast] = useState(0);
  const otpRef = useRef<TextInputInstance>(null);
  const navTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const shakeX = useSharedValue(0);
  const resendScale = useSharedValue(1);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));
  const resendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resendScale.value }],
  }));

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(0), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => () => clearTimeout(navTimer.current), []);

  const expired = secondsLeft === 0;

  useEffect(() => {
    if (expired)
      AccessibilityInfo.announceForAccessibility(
        "This code has expired. Send a new code.",
      );
  }, [expired]);

  /** Gentle side-to-side shake of the boxes (skipped with reduced motion) and a light warning haptic. */
  const shake = () => {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});
    if (reduceMotion) return;
    const step = (to: number) =>
      withTiming(to, { duration: 64, easing: Easing.inOut(Easing.ease) });
    shakeX.set(
      withSequence(step(-9), step(9), step(-6), step(6), step(-2), step(0)),
    );
  };

  const verify = (value: string) => {
    if (verified) return;
    if (expired) {
      // The status line already says the code expired: point at its action instead of adding a second error.
      setError(null);
      shake();
      if (!reduceMotion) {
        resendScale.set(
          withSequence(
            withTiming(1.14, {
              duration: 250,
              easing: Easing.out(Easing.ease),
            }),
            withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) }),
          ),
        );
      }
      return;
    }
    if (value.length < CODE_LENGTH) {
      setError(`Enter all ${CODE_LENGTH} digits of the code.`);
      shake();
      otpRef.current?.focus();
      return;
    }
    onVerified(flow);
    if (!actions.verifyCode(value)) {
      setError("That code didn’t match. Check it and try again.");
      setCode("");
      shake();
      otpRef.current?.focus();
      return;
    }
    setError(null);
    setVerified(true);
    sfx.sparkle();
    AccessibilityInfo.announceForAccessibility("Verified!");
    navTimer.current = setTimeout(
      () => router.push(copy.next),
      SUCCESS_PAUSE_MS,
    );
  };

  const onChange = (next: string) => {
    setCode(next);
    if (error) setError(null);
  };

  const resend = () => {
    if (verified) return;
    sfx.click();
    restart();
    setCode("");
    setError(null);
    setToast((n) => n + 1);
  };

  return {
    copy, code, error, verified, secondsLeft, expired, toast, otpRef,
    shakeStyle, resendStyle, verify, onChange, resend,
  };
}
