import { DAILY_LIMIT_CHOICES, SCREEN_TIME_ENABLED, dailyLimitSeconds } from "@/types/domain";

import { setState, todayKey } from "../core";

export const screenTimeActions = {
  ensureToday() {
    const day = todayKey();
    setState((s) => (s.screenTime.day === day ? s : { ...s, screenTime: { day, usedSeconds: 0 } }));
  },

  tickScreenTime(seconds = 1) {
    if (!SCREEN_TIME_ENABLED) return;
    const day = todayKey();
    setState((s) => {
      const used = s.screenTime.day === day ? s.screenTime.usedSeconds : 0;
      return { ...s, screenTime: { day, usedSeconds: Math.min(dailyLimitSeconds(s.dailyLimitMinutes), used + seconds) } };
    });
  },

  /**
   * Sets the family's daily limit. Time already played today still counts: lowering the limit below it ends play for
   * today, and raising it gives the rest back. Only the listed choices are accepted.
   */
  setDailyLimit(minutes: number) {
    if (!DAILY_LIMIT_CHOICES.some((m) => m === minutes)) return;
    setState((s) => (s.dailyLimitMinutes === minutes ? s : { ...s, dailyLimitMinutes: minutes }));
  },
};
