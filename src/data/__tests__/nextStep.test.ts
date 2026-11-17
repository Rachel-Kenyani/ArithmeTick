import { BUILDS_ON, isWarmUp, nextStep } from "@/data/nextStep";
import { SKILLS } from "@/data/skills";
import type { Grade } from "@/types/domain";
import type { AttemptLog } from "@/types/models";

let clock = 0;
function answer(grade: Grade, level: number, correct: boolean, extra: Partial<AttemptLog> = {}): AttemptLog {
  clock += 30_000;
  return { grade, level, target: 1, answer: correct ? 1 : 2, correct, ms: 10_000, pal: false, at: clock, ...extra };
}

beforeEach(() => {
  clock = 0;
});

describe("nextStep", () => {
  it("goes to the next level when nothing has been played", () => {
    expect(nextStep(1, 0, [])).toEqual({ kind: "next", level: 1 });
  });

  it("goes to the next level after a smooth play", () => {
    const attempts = [answer(1, 4, false), answer(1, 4, true)];
    expect(nextStep(1, 4, attempts)).toEqual({ kind: "next", level: 5 });
  });

  it("says the grade is done after the last level", () => {
    expect(nextStep(1, 9, [answer(1, 8, true)])).toEqual({ kind: "done" });
  });

  it("suggests a warm-up on the skill it builds on after two misses", () => {
    // Grade 1 Level 5 is taking away, which builds on making 10: the latest finished making-10 level is Level 4.
    const attempts = [answer(1, 5, false), answer(1, 5, false), answer(1, 5, true)];
    expect(nextStep(1, 5, attempts)).toEqual({ kind: "warmUp", level: 4, then: 6 });
  });

  it("treats needing help mode as finding it hard", () => {
    const attempts = [answer(1, 5, true, { pal: true })];
    expect(nextStep(1, 5, attempts)).toEqual({ kind: "warmUp", level: 4, then: 6 });
  });

  it("comes back to an unfinished level after the warm-up", () => {
    const attempts = [answer(1, 5, false), answer(1, 5, false)];
    expect(nextStep(1, 4, attempts)).toEqual({ kind: "warmUp", level: 4, then: 5 });
  });

  it("warms up on the same skill when the one it builds on has no finished level", () => {
    // Grade 2 Level 10 is taking away; Grade 2 has no making-10 levels, but Level 5 is also taking away.
    const attempts = [answer(2, 10, false), answer(2, 10, false)];
    expect(nextStep(2, 9, attempts)).toEqual({ kind: "warmUp", level: 5, then: 10 });
  });

  it("suggests trying again when there is nothing to warm up on", () => {
    // Grade 1 Level 1 is the first level of all.
    const attempts = [answer(1, 1, false), answer(1, 1, false)];
    expect(nextStep(1, 0, attempts)).toEqual({ kind: "tryAgain", level: 1 });
  });

  it("goes back to normal once the warm-up has been played", () => {
    const attempts = [answer(1, 5, false), answer(1, 5, false), answer(1, 4, true)];
    expect(nextStep(1, 5, attempts)).toEqual({ kind: "next", level: 6 });
  });

  it("only counts misses from the latest play of a level", () => {
    const yesterday = [answer(1, 5, false), answer(1, 5, false)];
    clock += 24 * 60 * 60 * 1000;
    const today = [answer(1, 5, true)];
    expect(nextStep(1, 5, [...yesterday, ...today])).toEqual({ kind: "next", level: 6 });
  });

  it("ignores answers from other grades", () => {
    const attempts = [answer(1, 5, false), answer(1, 5, false)];
    expect(nextStep(2, 3, attempts)).toEqual({ kind: "next", level: 4 });
  });

  it("never suggests a level the child hasn't reached", () => {
    const attempts = [answer(3, 7, false), answer(3, 7, false)];
    const step = nextStep(3, 6, attempts);
    expect(step.kind).toBe("warmUp");
    if (step.kind === "warmUp") expect(step.level).toBeLessThanOrEqual(6);
  });
});

describe("BUILDS_ON", () => {
  it("names a known skill for every skill", () => {
    const ids = SKILLS.map((s) => s.id);
    for (const skill of ids) expect(ids).toContain(BUILDS_ON[skill]);
  });
});

describe("isWarmUp", () => {
  const hardFive = [answer(1, 5, false), answer(1, 5, false)];

  it("is true only for the suggested warm-up level", () => {
    expect(isWarmUp(1, 5, hardFive, 4)).toBe(true);
    expect(isWarmUp(1, 5, hardFive, 6)).toBe(false);
  });

  it("is false for a level to try again", () => {
    expect(isWarmUp(1, 0, [answer(1, 1, false), answer(1, 1, false)], 1)).toBe(false);
  });
});
