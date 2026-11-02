import { SCREEN_TIME_ENABLED, SESSION_CAP_SECONDS } from "@/types/domain";

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
      return { ...s, screenTime: { day, usedSeconds: Math.min(SESSION_CAP_SECONDS, used + seconds) } };
    });
  },
};
