import { LEVELS, getLevel } from "@/data/levels";
import {
  MIN_ANSWERS,
  QUICK_MS,
  RECENT_ANSWERS,
  SKILLS,
  masteryOf,
  masterySummary,
  skillOf,
  type SkillId,
  type SkillMastery,
} from "@/data/skills";
import type { Grade } from "@/types/domain";
import type { AttemptLog } from "@/types/models";

let clock = 0;
function answer(grade: Grade, level: number, correct: boolean, extra: Partial<AttemptLog> = {}): AttemptLog {
  clock += 1000;
  return { grade, level, target: 1, answer: correct ? 1 : 2, correct, ms: 10_000, pal: false, at: clock, ...extra };
}
const many = (n: number, make: () => AttemptLog) => Array.from({ length: n }, make);
const skillAt = (grade: Grade, level: number) => {
  const def = getLevel(grade, level);
  return def ? skillOf(def) : undefined;
};
const find = (mastery: SkillMastery[], skill: SkillId) => mastery.find((m) => m.skill === skill);

beforeEach(() => {
  clock = 0;
});

describe("skillOf", () => {
  it.each<[Grade, number, SkillId | null]>([
    [1, 1, "makingTen"],
    [1, 5, "takingAway"],
    [1, 3, null],
    [2, 1, "placeValue"],
    [2, 2, "countingInSteps"],
    [2, 4, "addingOn"],
    [2, 5, "takingAway"],
    [2, 7, "groups"],
    [2, 8, "sharing"],
    [2, 11, "time"],
    [3, 1, "placeValue"],
    [3, 4, "addingOn"],
    [3, 5, "takingAway"],
    [3, 7, "groups"],
    [3, 8, "sharing"],
    [3, 10, "sharing"],
    [3, 11, "time"],
  ])("puts Grade %i Level %i in %s", (grade, level, skill) => {
    expect(skillAt(grade, level)).toBe(skill);
  });

  it("gives every puzzle level a skill and every Move & Play activity none", () => {
    for (const levels of Object.values(LEVELS)) {
      for (const level of levels) {
        if (level.kind === "quest") expect(skillOf(level)).toBeNull();
        else expect(SKILLS.map((s) => s.id)).toContain(skillOf(level));
      }
    }
  });
});

describe("masteryOf", () => {
  it("is empty before any answers", () => {
    expect(masteryOf([])).toEqual([]);
  });

  it("ignores answers for levels that no longer exist", () => {
    expect(masteryOf([answer(1, 99, true)])).toEqual([]);
  });

  it("marks a skill as new until there are enough answers to judge", () => {
    const m = masteryOf(many(MIN_ANSWERS - 1, () => answer(1, 1, true)));
    expect(find(m, "makingTen")?.band).toBe("new");
  });

  it("never calls a skill strong when most answers needed help", () => {
    const answers = [...many(5, () => answer(1, 1, true, { pal: true })), ...many(4, () => answer(1, 1, true))];
    const m = find(masteryOf(answers), "makingTen");
    expect(m?.accuracy).toBe(1);
    expect(m?.band).toBe("growing");
  });

  it("calls quick, right, unaided answers strong", () => {
    const m = find(masteryOf(many(8, () => answer(1, 1, true))), "makingTen");
    expect(m).toMatchObject({ answers: 8, accuracy: 1, helped: 0, quick: 1, band: "strong" });
    expect(m?.score).toBeCloseTo(1);
  });

  it("calls mostly wrong answers still growing", () => {
    const answers = [...many(6, () => answer(1, 5, false)), ...many(2, () => answer(1, 5, true))];
    const m = find(masteryOf(answers), "takingAway");
    expect(m?.accuracy).toBeCloseTo(0.25);
    expect(m?.band).toBe("growing");
  });

  it("scores right answers given with help lower than the same answers without", () => {
    const alone = find(masteryOf(many(8, () => answer(1, 1, true))), "makingTen");
    const helped = find(masteryOf(many(8, () => answer(1, 1, true, { pal: true }))), "makingTen");
    expect(helped?.helped).toBe(1);
    expect(helped?.score ?? 1).toBeLessThan(alone?.score ?? 0);
    expect(helped?.band).toBe("growing");
  });

  it("scores slow right answers a little lower than quick ones", () => {
    const quick = find(masteryOf(many(8, () => answer(1, 1, true))), "makingTen");
    const slow = find(masteryOf(many(8, () => answer(1, 1, true, { ms: QUICK_MS + 1 }))), "makingTen");
    expect(slow?.quick).toBe(0);
    expect(slow?.score ?? 1).toBeLessThan(quick?.score ?? 0);
    expect(slow?.band).toBe("strong");
  });

  it("only counts the most recent answers, so early mistakes stop counting", () => {
    const answers = [...many(30, () => answer(1, 1, false)), ...many(RECENT_ANSWERS, () => answer(1, 1, true))];
    const m = find(masteryOf(answers), "makingTen");
    expect(m?.answers).toBe(RECENT_ANSWERS);
    expect(m?.accuracy).toBe(1);
  });

  it("uses answer time, not the order they were saved in", () => {
    const late = many(RECENT_ANSWERS, () => answer(1, 1, true));
    const early = many(5, () => answer(1, 1, false)).map((a, i) => ({ ...a, at: -100 + i }));
    expect(find(masteryOf([...late, ...early]), "makingTen")?.accuracy).toBe(1);
  });

  it("combines the same skill across grades", () => {
    const answers = [...many(3, () => answer(1, 5, true)), ...many(3, () => answer(3, 5, true))];
    expect(find(masteryOf(answers), "takingAway")?.answers).toBe(6);
  });

  it("lists skills in the order SKILLS does", () => {
    const answers = [answer(2, 11, true), answer(1, 1, true), answer(2, 7, true)];
    expect(masteryOf(answers).map((m) => m.skill)).toEqual(["makingTen", "groups", "time"]);
  });
});

describe("masterySummary", () => {
  const amani = [
    ...many(8, () => answer(1, 1, true)),
    ...many(6, () => answer(1, 5, false)),
    ...many(2, () => answer(1, 5, true)),
  ];

  it("says what is strong and what is still growing, by name", () => {
    expect(masterySummary("Amani", masteryOf(amani))).toBe("Amani: making 10 is strong, taking away is still growing.");
  });

  it("joins several skills with and", () => {
    const answers = [...amani, ...many(8, () => answer(2, 11, true))];
    expect(masterySummary("Amani", masteryOf(answers))).toBe(
      "Amani: making 10 and telling the time are strong, taking away is still growing.",
    );
  });

  it("leaves out skills that have just started", () => {
    const answers = [...many(8, () => answer(1, 1, true)), answer(2, 11, false)];
    expect(masterySummary("Amani", masteryOf(answers))).toBe("Amani: making 10 is strong.");
  });

  it("has nothing to say before enough answers", () => {
    expect(masterySummary("Amani", masteryOf([answer(1, 1, true)]))).toBeNull();
  });
});
