import { PRACTICE_IDEAS, childReport, finishedGrade } from "@/data/report";
import { SKILLS } from "@/data/skills";
import { makeProfile } from "@/state/seed";
import type { Grade } from "@/types/domain";
import type { AttemptLog, ChildProfile } from "@/types/models";

let clock = 0;
const answer = (grade: Grade, level: number, correct: boolean): AttemptLog => {
  clock += 1000;
  return { grade, level, target: 1, answer: correct ? 1 : 2, correct, ms: 5000, pal: false, at: clock };
};
const many = (n: number, make: () => AttemptLog) => Array.from({ length: n }, make);

function jabali(extra: Partial<ChildProfile> = {}): ChildProfile {
  return { ...makeProfile({ name: "Jabali", grade: 1, avatar: "owl" }), progress: { 1: 4, 2: 0, 3: 0 }, stars: 12, ...extra };
}

beforeEach(() => {
  clock = 0;
});

describe("childReport", () => {
  it("keeps only what the email needs", () => {
    const report = childReport(jabali());
    expect(Object.keys(report).sort()).toEqual(
      ["child_id", "child_name", "grade", "level_count", "levels_done", "practice_idea", "skills_line", "stars", "total_levels"].sort(),
    );
    expect(report).toMatchObject({ child_name: "Jabali", grade: 1, levels_done: 4, level_count: 9, stars: 12 });
  });

  it("counts levels finished in every grade", () => {
    expect(childReport(jabali({ grade: 2, progress: { 1: 9, 2: 3, 3: 0 } })).total_levels).toBe(12);
  });

  it("says nothing about skills before there are enough answers", () => {
    const report = childReport(jabali({ attempts: [answer(1, 1, true)] }));
    expect(report.skills_line).toBeNull();
    expect(report.practice_idea).toBeNull();
  });

  it("describes skills and suggests a game for the one that needs it most", () => {
    const attempts = [...many(8, () => answer(1, 1, true)), ...many(6, () => answer(1, 5, false)), ...many(2, () => answer(1, 5, true))];
    const report = childReport(jabali({ attempts }));
    expect(report.skills_line).toBe("making 10 is strong, taking away is still growing");
    expect(report.practice_idea).toBe(PRACTICE_IDEAS.takingAway.replaceAll("{name}", "Jabali"));
  });

  it("suggests nothing when every skill is strong", () => {
    expect(childReport(jabali({ attempts: many(8, () => answer(1, 1, true)) })).practice_idea).toBeNull();
  });
});

describe("PRACTICE_IDEAS", () => {
  it("has a game for every skill that names the child", () => {
    for (const skill of SKILLS) expect(PRACTICE_IDEAS[skill.id]).toContain("{name}");
  });
});

describe("finishedGrade", () => {
  it("is true only the first time the last level of the grade is finished", () => {
    expect(finishedGrade(jabali(), 9, true)).toBe(true);
    expect(finishedGrade(jabali(), 9, false)).toBe(false);
    expect(finishedGrade(jabali(), 8, true)).toBe(false);
  });
});
