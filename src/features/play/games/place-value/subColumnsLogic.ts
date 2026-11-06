import type { Place } from "./PlaceValueChart";
import { digitsOf } from "./columnsLogic";

/**
 * Column subtraction as it is done on paper. Before a column whose top digit is too small, Brijo borrows 1 from the
 * column to its left (crossing out that digit and writing one less), then the child takes away column by column.
 */
export type SubStep = "borrowTens" | "ones" | "borrowHundreds" | "tens" | "hundreds" | "solved";

const ORDER: SubStep[] = ["borrowTens", "ones", "borrowHundreds", "tens", "hundreds", "solved"];

/** Whether a column has to borrow from the column to its left. */
export function needsBorrow(place: "ones" | "tens", a: number, b: number): boolean {
  const top = digitsOf(a);
  const bottom = digitsOf(b);
  if (place === "ones") return top.ones < bottom.ones;
  return top.tens - (top.ones < bottom.ones ? 1 : 0) < bottom.tens;
}

/** Each top digit after all borrowing: what the child actually takes away from. */
export function borrowedTop(a: number, b: number): Record<Place, number> {
  const top = digitsOf(a);
  const fromTens = needsBorrow("ones", a, b);
  const fromHundreds = needsBorrow("tens", a, b);
  return {
    ones: top.ones + (fromTens ? 10 : 0),
    tens: top.tens - (fromTens ? 1 : 0) + (fromHundreds ? 10 : 0),
    hundreds: top.hundreds - (fromHundreds ? 1 : 0),
  };
}

export function firstSubStep(a: number, b: number): SubStep {
  return needsBorrow("ones", a, b) ? "borrowTens" : "ones";
}

export function nextSubStep(step: SubStep, a: number, b: number): SubStep {
  if (step === "borrowTens") return "ones";
  if (step === "ones") return needsBorrow("tens", a, b) ? "borrowHundreds" : "tens";
  if (step === "borrowHundreds") return "tens";
  if (step === "tens") return "hundreds";
  return "solved";
}

const reached = (step: SubStep, than: SubStep) => ORDER.indexOf(step) >= ORDER.indexOf(than);

/**
 * The new top digits written above the columns so far. Borrowing from the tens changes both the tens (one less)
 * and the ones (ten more), so both are rewritten at once.
 */
export function rewrittenTop(step: SubStep, a: number, b: number): Partial<Record<Place, number>> {
  const top = digitsOf(a);
  const out: Partial<Record<Place, number>> = {};
  if (needsBorrow("ones", a, b) && reached(step, "borrowTens")) {
    out.ones = top.ones + 10;
    out.tens = top.tens - 1;
  }
  if (needsBorrow("tens", a, b) && reached(step, "borrowHundreds")) {
    out.tens = (out.tens ?? top.tens) + 10;
    out.hundreds = top.hundreds - 1;
  }
  return out;
}

export function subFocus(step: SubStep): Place | null {
  if (step === "borrowTens" || step === "ones") return "ones";
  if (step === "borrowHundreds" || step === "tens") return "tens";
  if (step === "hundreds") return "hundreds";
  return null;
}

/** The answer digits written so far. */
export function subWritten(step: SubStep, a: number, b: number): Partial<Record<Place, number>> {
  const d = digitsOf(a - b);
  const past = (than: SubStep) => ORDER.indexOf(step) > ORDER.indexOf(than);
  return { ones: past("ones") ? d.ones : undefined, tens: past("tens") ? d.tens : undefined, hundreds: past("hundreds") ? d.hundreds : undefined };
}

/** The take-away in one column: from how many, take how many. */
export function columnTakeAway(place: Place, a: number, b: number): { from: number; take: number } {
  return { from: borrowedTop(a, b)[place], take: digitsOf(b)[place] };
}

export function subPrompt(step: SubStep, a: number, b: number): string {
  const top = digitsOf(a);
  const bottom = digitsOf(b);
  const ask = (place: Place, name: string) => {
    const { from, take } = columnTakeAway(place, a, b);
    if (take === 0) return `Now the ${name}. Take away nothing. How many ${name}?`;
    return `Now the ${name}. What is ${from} − ${take}? Tap ${take} ${take === 1 ? "bottle top to take it" : "bottle tops to take them"} away.`;
  };
  switch (step) {
    case "borrowTens":
      return `We can't take ${bottom.ones} from ${top.ones}. I borrow 1 ten: ${top.tens} tens becomes ${top.tens - 1}, and ${top.ones} ones becomes ${top.ones + 10}. Tap the arrow when you are ready.`;
    case "ones":
      return ask("ones", "ones");
    case "borrowHundreds": {
      const tens = borrowedTop(a, b).tens - 10;
      return `We can't take ${bottom.tens} tens from ${tens}. I borrow 1 hundred: ${top.hundreds} hundreds becomes ${top.hundreds - 1}, and ${tens} tens becomes ${tens + 10}. Tap the arrow when you are ready.`;
    }
    case "tens":
      return ask("tens", "tens");
    case "hundreds":
      return ask("hundreds", "hundreds");
    case "solved":
      return `${a} − ${b} = ${a - b}!`;
  }
}

export function subClip(step: SubStep, grade: number, level: number): string {
  if (step === "solved") return "";
  const name = { borrowTens: "borrow", ones: "ones", borrowHundreds: "borrow-hundreds", tens: "tens", hundreds: "hundreds" }[step];
  return `g${grade}-l${String(level).padStart(2, "0")}-${name}`;
}
