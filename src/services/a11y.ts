import { AccessibilityInfo, Platform, type AccessibilityActionEvent } from "react-native";

/**
 * Says something to a screen reader user (TalkBack or VoiceOver). Does nothing when no screen reader is on, so it is
 * safe to call for every board change.
 */
export function announce(text: string) {
  if (text) AccessibilityInfo.announceForAccessibility(text);
}

/**
 * On iOS, VoiceOver doesn't read live regions, so text that Android reads through `accessibilityLiveRegion` has to be
 * announced. Use this beside a live region so neither platform hears it twice.
 */
export function announceOnIos(text: string) {
  if (Platform.OS === "ios") announce(text);
}

/**
 * Props that let a screen reader user double-tap to activate an element, on both Android and iOS. Use them instead of
 * `onAccessibilityTap`, which only fires on iOS. Pass nothing when the element can't be activated right now.
 */
export function activateProps(onActivate?: () => void) {
  if (!onActivate) return {};
  return {
    accessibilityActions: [{ name: "activate" as const }],
    onAccessibilityAction: (e: AccessibilityActionEvent) => {
      if (e.nativeEvent.actionName === "activate") onActivate();
    },
  };
}

/** What a screen reader user hears after each answer. Never says "wrong". */
export function answerAnnouncement(correct: boolean, answer: number): string {
  return correct ? `Yes, ${answer}!` : "Not quite. Have another go.";
}

/** What a screen reader user hears when a level is finished. */
export function levelDoneAnnouncement(starsEarned: number): string {
  if (starsEarned <= 0) return "Level done! Well done.";
  return `Level done! You earned ${starsEarned} ${starsEarned === 1 ? "star" : "stars"}.`;
}
