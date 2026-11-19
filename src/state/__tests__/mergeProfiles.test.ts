import { forAccount, mergeFamilies, mergeProfile } from "@/state/mergeProfiles";
import { makeProfile } from "@/state/seed";
import type { AttemptLog, ChildProfile } from "@/types/models";

const base = (extra: Partial<ChildProfile> = {}): ChildProfile => ({
  ...makeProfile({ name: "Jabali", grade: 1, avatar: "owl" }),
  id: "child-1",
  editedAt: 100,
  ...extra,
});
const answer = (at: number, correct = true): AttemptLog => ({ grade: 1, level: 1, target: 6, answer: correct ? 6 : 5, correct, ms: 5000, pal: false, at });

describe("mergeProfile", () => {
  it("keeps the furthest level in each grade and the most stars", () => {
    const phone = base({ progress: { 1: 5, 2: 0, 3: 0 }, stars: 15 });
    const account = base({ progress: { 1: 3, 2: 2, 3: 0 }, stars: 21 });
    const merged = mergeProfile(phone, account);
    expect(merged.progress).toEqual({ 1: 5, 2: 2, 3: 0 });
    expect(merged.stars).toBe(21);
  });

  it("keeps every badge from both phones, once each", () => {
    const merged = mergeProfile(base({ badges: ["a", "b"] }), base({ badges: ["b", "c"] }));
    expect(merged.badges).toEqual(["a", "b", "c"]);
  });

  it("keeps every answer once, in time order", () => {
    const merged = mergeProfile(base({ attempts: [answer(1), answer(3)] }), base({ attempts: [answer(2), answer(3)] }));
    expect(merged.attempts?.map((a) => a.at)).toEqual([1, 2, 3]);
  });

  it("caps answers at the most recent 200", () => {
    const many = Array.from({ length: 150 }, (_, i) => answer(i));
    const more = Array.from({ length: 150 }, (_, i) => answer(1000 + i));
    const merged = mergeProfile(base({ attempts: many }), base({ attempts: more }));
    expect(merged.attempts).toHaveLength(200);
    expect(merged.attempts?.at(-1)?.at).toBe(1149);
  });

  it("takes the name and animal from the copy edited last", () => {
    const phone = base({ name: "Jabs", avatar: "fox", editedAt: 200 });
    const account = base({ name: "Jabali", avatar: "owl", editedAt: 100 });
    expect(mergeProfile(phone, account)).toMatchObject({ name: "Jabs", avatar: "fox", editedAt: 200 });
    expect(mergeProfile(account, phone)).toMatchObject({ name: "Jabs", avatar: "fox", editedAt: 200 });
  });

  it("keeps this phone's unfinished boards and ignores the account's", () => {
    const board = { pal: false, board: { misses: 1 } };
    const merged = mergeProfile(base({ drafts: { "g1-l2": board } }), base({ drafts: { "g1-l3": board } }));
    expect(Object.keys(merged.drafts ?? {})).toEqual(["g1-l2"]);
  });
});

describe("mergeFamilies", () => {
  it("restores the whole family onto an empty phone", () => {
    const saved = [base({ id: "a", name: "Jabali" }), base({ id: "b", name: "Tessa" })];
    expect(mergeFamilies([], saved).map((p) => p.name)).toEqual(["Jabali", "Tessa"]);
  });

  it("keeps children added on either phone, matched by id", () => {
    const phone = [base({ id: "a", stars: 3 }), base({ id: "c", name: "Amani" })];
    const account = [base({ id: "a", stars: 9 }), base({ id: "b", name: "Tessa" })];
    const merged = mergeFamilies(phone, account);
    expect(merged.map((p) => p.id)).toEqual(["a", "c", "b"]);
    expect(merged[0].stars).toBe(9);
  });

  it("leaves the phone's family as it is when nothing was saved", () => {
    const phone = [base()];
    expect(mergeFamilies(phone, [])).toEqual(phone);
  });
});

describe("forAccount", () => {
  it("leaves unfinished boards off what is saved", () => {
    const saved = forAccount(base({ drafts: { "g1-l2": { pal: false, board: { misses: 0 } } } }));
    expect(saved).not.toHaveProperty("drafts");
    expect(saved).toMatchObject({ id: "child-1", name: "Jabali" });
  });
});
