import { profileActions } from "@/state/actions/profiles";
import { progressActions } from "@/state/actions/progress";
import { DEFAULT_STATE, getSnapshot, setState } from "@/state/core";
import { makeProfile } from "@/state/seed";

beforeEach(() => {
  setState(() => DEFAULT_STATE);
});

const addProfile = (name = "Amani") => {
  const profile = profileActions.addProfile({ name, grade: 1 });
  if (!profile) throw new Error("profile was not added");
  return profile;
};

describe("profileActions", () => {
  it("trims names and school codes and assigns the next unused avatar", () => {
    const first = addProfile();
    const second = profileActions.addProfile({ name: "  Bahati  ", grade: 2, schoolCode: "  abc123  " });

    expect(first.avatar).toBe("owl");
    expect(second).toMatchObject({ name: "Bahati", avatar: "cheetah", schoolCode: "ABC123" });
  });

  it("refuses the fifth profile and invalid appearance updates", () => {
    for (let i = 0; i < 4; i++) addProfile(`Child ${i}`);
    expect(profileActions.addProfile({ name: "Extra", grade: 1 })).toBeNull();

    profileActions.updateProfileAppearance(getSnapshot().profiles[0].id, { name: "   ", avatar: "bear" });
    expect(getSnapshot().profiles[0].name).toBe("Child 0");
  });

  it("only selects an existing profile", () => {
    const profile = addProfile();
    profileActions.selectProfile("missing");
    expect(getSnapshot().activeProfileId).toBeNull();
    profileActions.selectProfile(profile.id);
    expect(getSnapshot().activeProfileId).toBe(profile.id);
  });
});

describe("progressActions", () => {
  it("awards stars and unlocks the first level only once", () => {
    const profile = addProfile();

    const first = progressActions.completeLevel(profile.id, 1, 12, { misses: 0, helped: false });
    const replay = progressActions.completeLevel(profile.id, 1, 12, { misses: 0, helped: false });

    expect(first).toMatchObject({ starsEarned: 3, firstTime: true });
    expect(first.newBadges.map((badge) => badge.id)).toContain("ten-frame-explorer");
    expect(replay).toMatchObject({ starsEarned: 0, firstTime: false });

    const saved = getSnapshot().profiles[0];
    expect(saved.progress[1]).toBe(1);
    expect(saved.stars).toBe(3);
    expect(saved.replays).toBe(1);
    expect(saved.cleanLevels).toContain("g1-l1");
  });

  it("records helped solves, drafts, and capped attempts", () => {
    const profile = addProfile();

    progressActions.completeLevel(profile.id, 1, -10, { misses: 2, helped: true });
    progressActions.saveDraft(profile.id, "g1-l2", { pal: true, board: { misses: 1 } });
    expect(getSnapshot().profiles[0].drafts?.["g1-l2"]).toBeDefined();
    progressActions.saveDraft(profile.id, "g1-l2", null);
    expect(getSnapshot().profiles[0].drafts?.["g1-l2"]).toBeUndefined();

    const attempts = Array.from({ length: 205 }, (_, at) => ({
      grade: 1 as const,
      level: 1,
      target: 6,
      answer: 6,
      correct: true,
      ms: 100,
      pal: false,
      at,
    }));
    for (const attempt of attempts) progressActions.logAttempt(profile.id, attempt);
    expect(getSnapshot().profiles[0].attempts).toHaveLength(200);
    expect(getSnapshot().profiles[0].attempts?.[0].at).toBe(5);
  });

  it("updates high-fives once and safely ignores missing profiles", () => {
    const profile = addProfile();

    expect(progressActions.completeLevel("missing", 1)).toEqual({ starsEarned: 0, firstTime: false, newBadges: [] });
    expect(progressActions.recordHighFive("missing")).toEqual([]);

    progressActions.recordHighFive(profile.id);
    expect(getSnapshot().profiles[0].highFives).toBe(1);
  });
});
