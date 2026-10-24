/**
 * Pure layout / copy helpers for the play screen: clock + spoken screen time, gutters and top-bar sizing.
 */

export function formatClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function plural(count: number, unit: string) {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

/** Side gutter: 16 from 640px, 12 from 380px, else 8. */
export function gutterFor(width: number) {
  if (width >= 640) return 16;
  return width >= 380 ? 12 : 8;
}

export function spokenTime(seconds: number, paused: boolean) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const parts = [m ? plural(m, "minute") : "", r ? plural(r, "second") : ""].filter(Boolean);
  return `Screen time: ${parts.length ? parts.join(" ") : "none"} left today${paused ? ", paused" : ""}`;
}

/** Gap between top-bar items: 12 from 640px, 8 from 380px, else 6. */
export function topBarGapFor(width: number) {
  if (width >= 640) return 12;
  return width >= 380 ? 8 : 6;
}

export function levelChipPadding(width: number, isQuest: boolean) {
  if (width >= 640) return { paddingLeft: isQuest ? 12 : 60, paddingRight: 24 };
  if (width >= 380) return { paddingLeft: 16, paddingRight: 16 };
  return { paddingLeft: 14, paddingRight: 12 };
}

export function levelTitleSize(width: number, longTitle: boolean) {
  if (width >= 640) return 24;
  if (longTitle) return width >= 380 ? 20 : 18;
  return width >= 380 ? 22 : 21;
}
