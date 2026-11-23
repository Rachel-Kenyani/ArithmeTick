import { StyleSheet } from "react-native";

import { LARGE_TEXT_SCALE, scaleText } from "@/hooks/useTextScale";
import { profileActions } from "@/state/actions/profiles";
import { DEFAULT_STATE, getSnapshot, setState } from "@/state/core";
import { mergeProfile } from "@/state/mergeProfiles";
import { makeProfile } from "@/state/seed";

describe("scaleText", () => {
  const style = { fontSize: 20, lineHeight: 26, color: "#004f4a" };

  it("leaves the style untouched at normal size", () => {
    expect(scaleText(style, 1)).toBe(style);
  });

  it("makes the font size and line height 25% larger, keeping everything else", () => {
    expect(StyleSheet.flatten(scaleText(style, LARGE_TEXT_SCALE))).toEqual({ fontSize: 25, lineHeight: 33, color: "#004f4a" });
  });

  it("works through style arrays, using the last size set", () => {
    expect(StyleSheet.flatten(scaleText([style, { fontSize: 16 }], LARGE_TEXT_SCALE))).toMatchObject({ fontSize: 20, lineHeight: 33 });
  });

  it("adds no size to a style without one", () => {
    expect(StyleSheet.flatten(scaleText({ color: "red" }, LARGE_TEXT_SCALE))).toEqual({ color: "red" });
  });
});

describe("setLargeText", () => {
  beforeEach(() => {
    setState(() => ({ ...DEFAULT_STATE, profiles: [{ ...makeProfile({ name: "Jabali", grade: 1, avatar: "owl" }), id: "a", editedAt: 1 }] }));
  });

  it("turns Larger text on and off for one child, and marks the edit", () => {
    profileActions.setLargeText("a", true);
    expect(getSnapshot().profiles[0].largeText).toBe(true);
    expect(getSnapshot().profiles[0].editedAt).toBeGreaterThan(1);
    profileActions.setLargeText("a", false);
    expect(getSnapshot().profiles[0].largeText).toBe(false);
  });

  it("leaves the child untouched when it is already set that way", () => {
    profileActions.setLargeText("a", true);
    const before = getSnapshot().profiles[0];
    profileActions.setLargeText("a", true);
    expect(getSnapshot().profiles[0]).toBe(before);
  });

  it("follows the child to another phone, newest edit winning", () => {
    const base = { ...makeProfile({ name: "Jabali", grade: 1, avatar: "owl" }), id: "a" };
    const phone = { ...base, largeText: false, editedAt: 100 };
    const account = { ...base, largeText: true, editedAt: 200 };
    expect(mergeProfile(phone, account).largeText).toBe(true);
  });
});
