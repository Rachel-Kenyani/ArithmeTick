/**
 * Splash intro — the sound and haptic cue list: one entry per beat, as [ms from mount, cue].
 */

import * as Haptics from "expo-haptics";

import { sfx } from "@/services/audio";

import { WORD_LETTERS } from "../art/wordmarkArt";
import { AT, FINALE_AT, LETTER_STAGGER, SQUASH_AT } from "./timeline";

/** A cue that fires one impact haptic, swallowing failures (e.g. haptics unavailable). */
function hapticTap(style: Haptics.ImpactFeedbackStyle) {
  return () => void Haptics.impactAsync(style).catch(() => {});
}

/** Sound and haptics on each beat */
export function splashCues(): [number, () => void][] {
  return [
    [AT[2], sfx.pickup],
    [SQUASH_AT[0], hapticTap(Haptics.ImpactFeedbackStyle.Light)],
    [AT[3], sfx.click],
    [AT[4], sfx.palShimmer],
    [AT[7], sfx.groupPulse],
    [SQUASH_AT[1], sfx.boing],
    [SQUASH_AT[1], hapticTap(Haptics.ImpactFeedbackStyle.Medium)],
    [AT[9], sfx.palShimmer],
    [AT[10], sfx.nudge],
    [AT[11], sfx.nudge],
    [SQUASH_AT[2], hapticTap(Haptics.ImpactFeedbackStyle.Light)],
    [FINALE_AT, sfx.sparkle],
    [
      FINALE_AT,
      () =>
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {}),
    ],
    ...WORD_LETTERS.map((_, i): [number, () => void] => [
      FINALE_AT + 150 + i * LETTER_STAGGER,
      () => sfx.snap(i),
    ]),
  ];
}
