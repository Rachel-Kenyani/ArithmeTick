import { screenTimeActions } from "@/state/actions/screenTime";
import { DEFAULT_STATE, getSnapshot, setState, todayKey } from "@/state/core";
import { secondsLeftToday } from "@/state/hooks";
import { forAccount } from "@/state/mergeProfiles";
import { makeProfile } from "@/state/seed";
import { DAILY_LIMIT_CHOICES, DEFAULT_DAILY_LIMIT_MINUTES, dailyLimitSeconds, playedToday } from "@/types/domain";

beforeEach(() => {
  setState(() => ({ ...DEFAULT_STATE, screenTime: { day: todayKey(), usedSeconds: 0 } }));
});

const remaining = () => secondsLeftToday(getSnapshot());

describe("dailyLimitSeconds", () => {
  it("starts every family at 15 minutes", () => {
    expect(DEFAULT_DAILY_LIMIT_MINUTES).toBe(15);
    expect(dailyLimitSeconds(undefined)).toBe(15 * 60);
  });

  it("falls back to 15 minutes for a setting that isn't one of the choices", () => {
    expect(dailyLimitSeconds(7)).toBe(15 * 60);
    expect(dailyLimitSeconds(30)).toBe(30 * 60);
  });
});

describe("setDailyLimit", () => {
  it.each(DAILY_LIMIT_CHOICES)("accepts %i minutes", (minutes) => {
    screenTimeActions.setDailyLimit(minutes);
    expect(getSnapshot().dailyLimitMinutes).toBe(minutes);
  });

  it("ignores anything that isn't one of the choices", () => {
    screenTimeActions.setDailyLimit(25);
    screenTimeActions.setDailyLimit(0);
    expect(getSnapshot().dailyLimitMinutes).toBeUndefined();
  });
});

describe("time left today", () => {
  it("counts down from the chosen limit", () => {
    screenTimeActions.setDailyLimit(30);
    screenTimeActions.tickScreenTime(60);
    expect(remaining()).toBe(29 * 60);
  });

  it("stops counting at the limit", () => {
    screenTimeActions.setDailyLimit(10);
    screenTimeActions.tickScreenTime(20 * 60);
    expect(getSnapshot().screenTime.usedSeconds).toBe(10 * 60);
    expect(remaining()).toBe(0);
  });

  it("ends play for today when the limit is lowered below time already played", () => {
    screenTimeActions.setDailyLimit(30);
    screenTimeActions.tickScreenTime(12 * 60);
    screenTimeActions.setDailyLimit(10);
    expect(remaining()).toBe(0);
  });

  it("gives the rest back when the limit is raised", () => {
    screenTimeActions.tickScreenTime(15 * 60);
    expect(remaining()).toBe(0);
    screenTimeActions.setDailyLimit(20);
    expect(remaining()).toBe(5 * 60);
  });

  it("starts a new day with the full limit", () => {
    screenTimeActions.setDailyLimit(20);
    setState((s) => ({ ...s, screenTime: { day: "2000-01-01", usedSeconds: 20 * 60 } }));
    screenTimeActions.ensureToday();
    expect(remaining()).toBe(20 * 60);
  });
});

describe("kept on the phone", () => {
  it("is not part of what is saved with the account", () => {
    screenTimeActions.setDailyLimit(45);
    const saved = forAccount(makeProfile({ name: "Jabali", grade: 1, avatar: "owl" }));
    expect(JSON.stringify(saved)).not.toContain("dailyLimit");
    expect(JSON.stringify(saved)).not.toContain("screenTime");
  });
});

describe("playedToday", () => {
  it("rounds a started minute up, and never past the limit", () => {
    expect(playedToday(0, 900)).toBe("0 of 15 minutes played today");
    expect(playedToday(61, 900)).toBe("2 of 15 minutes played today");
    expect(playedToday(2000, 900)).toBe("15 of 15 minutes played today");
  });
});
