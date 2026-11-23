import { CELEBRATION_SOUNDS, shouldPlay } from "@/services/audio/calmSounds";
import { profileActions } from "@/state/actions/profiles";
import { DEFAULT_STATE, getSnapshot, setState } from "@/state/core";
import { mergeProfile } from "@/state/mergeProfiles";
import { makeProfile } from "@/state/seed";

describe("setCalm", () => {
  beforeEach(() => {
    setState(() => ({ ...DEFAULT_STATE, profiles: [{ ...makeProfile({ name: "Jabali", grade: 1, avatar: "owl" }), id: "a", editedAt: 1 }] }));
  });

  it("turns Calm mode on and off for one child, and marks the edit", () => {
    profileActions.setCalm("a", true);
    expect(getSnapshot().profiles[0].calm).toBe(true);
    expect(getSnapshot().profiles[0].editedAt).toBeGreaterThan(1);
    profileActions.setCalm("a", false);
    expect(getSnapshot().profiles[0].calm).toBe(false);
  });

  it("leaves the child untouched when it is already set that way", () => {
    profileActions.setCalm("a", true);
    const before = getSnapshot().profiles[0];
    profileActions.setCalm("a", true);
    expect(getSnapshot().profiles[0]).toBe(before);
  });

  it("follows the child to another phone, newest edit winning", () => {
    const base = { ...makeProfile({ name: "Jabali", grade: 1, avatar: "owl" }), id: "a" };
    expect(mergeProfile({ ...base, calm: true, editedAt: 5 }, { ...base, calm: false, editedAt: 2 }).calm).toBe(true);
    expect(mergeProfile({ ...base, calm: true, editedAt: 2 }, { ...base, calm: false, editedAt: 5 }).calm).toBe(false);
  });
});

describe("shouldPlay", () => {
  it("plays everything normally", () => {
    expect(shouldPlay("clap", { muted: false, calm: false })).toBe(true);
    expect(shouldPlay("click", { muted: false, calm: false })).toBe(true);
  });

  it("drops only celebration sounds in Calm mode, keeping the ones that say what happened", () => {
    for (const name of CELEBRATION_SOUNDS) expect(shouldPlay(name, { muted: false, calm: true })).toBe(false);
    expect(shouldPlay("solved", { muted: false, calm: true })).toBe(true);
    expect(shouldPlay("nudge", { muted: false, calm: true })).toBe(true);
    expect(shouldPlay("palShimmer", { muted: false, calm: true })).toBe(true);
  });

  it("plays nothing when sound effects are off", () => {
    expect(shouldPlay("click", { muted: true, calm: false })).toBe(false);
  });
});
