import type { CounterItem } from "@/features/play/components/CounterFace";

export type Step = "pack" | "tens" | "ones" | "solved";

export const around = (n: number) => [
  ...new Set([n - 1, n, n + 1].filter((x) => x >= 0)),
];

const DROP_GIVE = 24;

export function inside(
  x: number,
  y: number,
  fx: number,
  fy: number,
  fw: number,
  fh: number,
): boolean {
  return (
    x >= fx - DROP_GIVE &&
    x <= fx + fw + DROP_GIVE &&
    y >= fy - DROP_GIVE &&
    y <= fy + fh + DROP_GIVE
  );
}

export function promptFor(
  step: Step,
  handFilled: boolean,
  tens: number,
  ones: number,
  a: number,
): string {
  if (step === "pack") {
    return handFilled
      ? "A full crate holds 10. Tap the empty crate to fill it!"
      : "Tap or drag a tomato to put it on the crate";
  }
  return {
    tens: "How many full ten crates are there?",
    ones: "How many tomatoes are left over?",
    solved: `${tens} full crates and ${ones} left over make ${a}!`,
  }[step];
}

export function clipFor(step: Step, handFilled: boolean): string {
  if (step === "pack") return handFilled ? "pv-fill" : "pv-pack";
  return step === "tens" ? "pv-crates" : "pv-leftover";
}

export function gridFor(
  size: { w: number; h: number } | null,
  a: number,
  crateCell: number,
): { cols: number; pitch: number } {
  if (!size) return { cols: 7, pitch: 44 };
  const avail = size.h - 58 - 44 - 46 - (crateCell * 2 + 24) - 40 - 40;
  let best = { cols: 7, pitch: 0 };
  for (let cols = 5; cols <= 8; cols++) {
    const pitch = Math.min(
      56,
      (size.w - 24) / cols,
      avail / Math.ceil(a / cols),
    );
    if (pitch > best.pitch) best = { cols, pitch };
  }
  return { cols: best.cols, pitch: Math.floor(best.pitch) };
}


export function plural(item: CounterItem, n = 2): string {
  if (item === "cap") return n === 1 ? "bottle top" : "bottle tops";
  if (n === 1) return item;
  return item === "tomato" || item === "mango" ? `${item}es` : `${item}s`;
}

export const itemWord = (item: CounterItem) => (item === "cap" ? "bottle top" : item);

export const sameSize = (
  prev: { w: number; h: number } | null,
  w: number,
  h: number,
) => prev !== null && Math.abs(prev.w - w) < 1 && Math.abs(prev.h - h) < 1;
