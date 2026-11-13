import type { Place } from "./PlaceValueChart";

export type ColumnsStep = "ones" | "carryTens" | "tens" | "carryHundreds" | "hundreds" | "solved";

export function digitsOf(n: number): Record<Place, number> {
  return { hundreds: Math.floor(n / 100), tens: Math.floor(n / 10) % 10, ones: n % 10 };
}

export function columnTotals(a: number, b: number): Record<Place, number> {
  const top = digitsOf(a);
  const bottom = digitsOf(b);
  const ones = top.ones + bottom.ones;
  const tens = top.tens + bottom.tens + (ones >= 10 ? 1 : 0);
  const hundreds = top.hundreds + bottom.hundreds + (tens >= 10 ? 1 : 0);
  return { hundreds, tens, ones };
}

export function isCarriedInto(place: Place, a: number, b: number): boolean {
  const totals = columnTotals(a, b);
  return (place === "tens" && totals.ones >= 10) || (place === "hundreds" && totals.tens >= 10);
}

export function columnTerms(place: Place, a: number, b: number): number[] {
  const totals = columnTotals(a, b);
  const carriedIn = (place === "tens" && totals.ones >= 10) || (place === "hundreds" && totals.tens >= 10);
  const top = digitsOf(a)[place];
  const bottom = place === "hundreds" && b < 100 ? null : digitsOf(b)[place];
  return [...(carriedIn ? [1] : []), top, ...(bottom === null ? [] : [bottom])];
}

export function nextStep(step: ColumnsStep, a: number, b: number): ColumnsStep {
  const totals = columnTotals(a, b);
  if (step === "ones") return totals.ones >= 10 ? "carryTens" : "tens";
  if (step === "carryTens") return "tens";
  if (step === "tens") return totals.tens >= 10 ? "carryHundreds" : "hundreds";
  if (step === "carryHundreds") return "hundreds";
  return "solved";
}

const ORDER: ColumnsStep[] = ["ones", "carryTens", "tens", "carryHundreds", "hundreds", "solved"];
const after = (step: ColumnsStep, than: ColumnsStep) => ORDER.indexOf(step) > ORDER.indexOf(than);

export function writtenDigits(step: ColumnsStep, a: number, b: number): Partial<Record<Place, number>> {
  const sum = digitsOf(a + b);
  const totals = columnTotals(a, b);
  return {
    ones: after(step, "ones") ? sum.ones : undefined,
    tens: after(step, "tens") ? sum.tens : undefined,
    hundreds: after(step, "hundreds") ? totals.hundreds : undefined,
  };
}

export function carriedInto(step: ColumnsStep, a: number, b: number): Partial<Record<Place, boolean>> {
  const at = ORDER.indexOf(step);
  return {
    tens: isCarriedInto("tens", a, b) && at >= ORDER.indexOf("carryTens"),
    hundreds: isCarriedInto("hundreds", a, b) && at >= ORDER.indexOf("carryHundreds"),
  };
}

export function focusPlace(step: ColumnsStep): Place | null {
  if (step === "ones") return "ones";
  if (step === "carryTens" || step === "tens") return "tens";
  if (step === "carryHundreds" || step === "hundreds") return "hundreds";
  return null;
}

export function columnsPrompt(step: ColumnsStep, a: number, b: number): string {
  const totals = columnTotals(a, b);
  const sum = (place: Place) => columnTerms(place, a, b).join(" + ");
  switch (step) {
    case "ones":
      return `Start with the ones. What is ${sum("ones")}? Tap the bottle tops to count.`;
    case "carryTens":
      return `${totals.ones} is 1 ten and ${totals.ones - 10} ones. The ${totals.ones - 10} goes in the ones, and I carry the 1 to the tens. Tap the arrow when you are ready.`;
    case "tens":
      return `Now the tens. What is ${sum("tens")}?`;
    case "carryHundreds":
      return `${totals.tens} tens is 1 hundred and ${totals.tens - 10} tens. The ${totals.tens - 10} goes in the tens, and I carry the 1 to the hundreds. Tap the arrow when you are ready.`;
    case "hundreds":
      return columnTerms("hundreds", a, b).length > 1 ? `Now the hundreds. What is ${sum("hundreds")}?` : "Now the hundreds. Bring the hundreds down. How many hundreds?";
    case "solved":
      return `${a} + ${b} = ${a + b}!`;
  }
}

export function columnsClip(step: ColumnsStep, grade: number, level: number): string {
  if (step === "solved") return "";
  const name = { ones: "ones", carryTens: "carry", tens: "tens", carryHundreds: "carry-tens", hundreds: "hundreds" }[step];
  return `g${grade}-l${String(level).padStart(2, "0")}-${name}`;
}

export function choicesFor(total: number): number[] {
  const slips = [total >= 10 ? total - 10 : total + 2, total + 1, total - 1];
  return [...new Set([total, ...slips].filter((n) => n >= 0))].slice(0, 3).sort((x, y) => x - y);
}
