/**
 * Screen-time actions — the daily 15-minute allowance.
 */

import { SESSION_CAP_SECONDS } from "@/types/domain";

import { setState, todayKey } from "../core";

export const screenTimeActions = {
  /** Roll the daily allowance over when the date changes. Call on app/screen mount. */
  ensureToday() {
    const day = todayKey();
    setState((s) => (s.screenTime.day === day ? s : { ...s, screenTime: { day, usedSeconds: 0 } }));
  },

  /** Count active play time against today's 15-minute cap. */
  tickScreenTime(seconds = 1) {
    const day = todayKey();
    setState((s) => {
      const used = s.screenTime.day === day ? s.screenTime.usedSeconds : 0;
      return { ...s, screenTime: { day, usedSeconds: Math.min(SESSION_CAP_SECONDS, used + seconds) } };
    });
  },
};
