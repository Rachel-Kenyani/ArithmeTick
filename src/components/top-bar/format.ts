/** Play-time text for the top bar: "m:ss" on screen and a short spoken sentence for screen readers. */

export function formatLeft(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function plural(count: number, unit: string) {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

export function spokenLeft(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const parts = [m ? plural(m, "minute") : "", r ? plural(r, "second") : ""].filter(Boolean);
  return parts.length ? `${parts.join(" ")} of play time left today` : "No play time left today";
}
