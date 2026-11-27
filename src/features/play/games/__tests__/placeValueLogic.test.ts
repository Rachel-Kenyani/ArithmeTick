jest.mock("../place-value/PlaceValueChart", () => ({ CHART_HEIGHT: 600 }));

import { choicesFor, columnTerms, columnTotals, digitsOf, nextStep } from "../place-value/columnsLogic";
import { splitHundreds, nextAsk } from "../place-value/hundredsLogic";
import { around, inside, plural, promptFor, sameSize } from "../place-value/packTensLogic";

describe("column addition logic", () => {
  it("splits numbers and totals each place with carries", () => {
    expect(digitsOf(258)).toEqual({ hundreds: 2, tens: 5, ones: 8 });
    expect(columnTotals(187, 95)).toEqual({ hundreds: 2, tens: 18, ones: 12 });
  });

  it("includes carried ones and omits a missing hundreds digit", () => {
    expect(columnTerms("tens", 187, 95)).toEqual([1, 8, 9]);
    expect(columnTerms("hundreds", 187, 95)).toEqual([1, 1]);
  });

  it("walks carry and solved steps in order", () => {
    expect(nextStep("ones", 187, 95)).toBe("carryTens");
    expect(nextStep("carryTens", 187, 95)).toBe("tens");
    expect(nextStep("tens", 187, 95)).toBe("carryHundreds");
    expect(nextStep("carryHundreds", 187, 95)).toBe("hundreds");
    expect(nextStep("hundreds", 187, 95)).toBe("solved");
  });

  it("returns safe, sorted distractors", () => {
    expect(choicesFor(12)).toEqual([2, 12, 13]);
  });
});

describe("hundreds and tens logic", () => {
  it("splits hundreds, tens, ones, and crates", () => {
    expect(splitHundreds(247)).toEqual({ hundreds: 2, tens: 4, ones: 7, crates: 24 });
  });

  it("asks place values and then solves", () => {
    expect(nextAsk("hundreds")).toBe("tens");
    expect(nextAsk("tens")).toBe("ones");
    expect(nextAsk("ones")).toBe("solved");
  });

  it("builds the nearest whole-number answer set", () => {
    expect(around(0)).toEqual([0, 1]);
    expect(around(4)).toEqual([3, 4, 5]);
  });

  it("checks generous drop zones and stable sizes", () => {
    expect(inside(100, 100, 80, 80, 40, 40)).toBe(true);
    expect(inside(200, 200, 80, 80, 40, 40)).toBe(false);
    expect(sameSize({ w: 100, h: 200 }, 100.5, 200.5)).toBe(true);
  });

  it("uses singular and plural counter words", () => {
    expect(plural("tomato", 1)).toBe("tomato");
    expect(plural("tomato", 2)).toBe("tomatoes");
    expect(plural("cap", 1)).toBe("bottle top");
    expect(plural("cap", 2)).toBe("bottle tops");
  });

  it("returns packing and solved prompts", () => {
    expect(promptFor("pack", false, 2, 3, 23)).toContain("tomato");
    expect(promptFor("pack", true, 2, 3, 23)).toContain("full crate");
    expect(promptFor("solved", false, 2, 3, 23)).toBe("2 full crates and 3 left over make 23!");
  });
});
