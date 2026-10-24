/**
 * Jaymo worklet sampling — keyframe easing, cross-faded part values and SVG matrices.
 */

import type { SharedValue } from "react-native-reanimated";

import { PART_DEFAULTS, type AnimKey, type Ease, type Part, type PartMotion, type Timing } from "./choreography";
import { SCRIPT_LIST } from "./scripts";

/* ------------------------------------------------------------------------------------------
 * Worklet sampling
 * ---------------------------------------------------------------------------------------- */

function ease(kind: Ease, u: number): number {
  "worklet";
  if (kind === "o") return 1 - (1 - u) * (1 - u);
  if (kind === "i") return u * u;
  return u * u * (3 - 2 * u);
}

/** Resting value of `key` on `part` when the script has none. */
function restValue(script: PartMotion | undefined, part: Part, key: AnimKey): number {
  "worklet";
  const fallback = key.startsWith("scale") || key === "opacity" ? 1 : 0;
  return script?.rest?.[key] ?? PART_DEFAULTS[part][key] ?? fallback;
}

/** Easing for keyframe segment `i` (defaults to "io"). */
function segmentEase(e: Timing["ease"], i: number): Ease {
  "worklet";
  if (e === undefined) return "io";
  if (typeof e === "string") return e;
  return e[i] ?? "io";
}

/** Value of `key` on `part` for mood index `m` at clock `time` (seconds). */
function sample(m: number, part: Part, key: AnimKey, time: number, still: boolean): number {
  "worklet";
  const script = SCRIPT_LIST[m][part];
  const rest = restValue(script, part, key);
  const frames = script?.loop?.[key];
  const t = script?.t;
  if (still || !frames || !t || frames.length === 0) return rest;
  const local = time - (t.delay ?? 0);
  if (local < 0) return frames[0];
  const p = (local % t.d) / t.d;
  const n = frames.length;
  for (let i = 0; i < n - 1; i++) {
    const t0 = t.times ? t.times[i] : i / (n - 1);
    const t1 = t.times ? t.times[i + 1] : (i + 1) / (n - 1);
    if (p <= t1 || i === n - 2) {
      const u = t1 > t0 ? Math.min(1, Math.max(0, (p - t0) / (t1 - t0))) : 1;
      const e = segmentEase(t.ease, i);
      return frames[i] + (frames[i + 1] - frames[i]) * ease(e, u);
    }
  }
  return frames[n - 1];
}

export interface Rig {
  clock: SharedValue<number>;
  mood: SharedValue<number>;
  prev: SharedValue<number>;
  blend: SharedValue<number>;
  still: boolean;
}

export function val(r: Rig, part: Part, key: AnimKey): number {
  "worklet";
  const now = sample(r.mood.value, part, key, r.clock.value, r.still);
  const b = r.blend.value;
  if (b >= 1) return now;
  const before = sample(r.prev.value, part, key, r.clock.value, r.still);
  return before + (now - before) * b;
}

/** SVG matrix [a b c d e f] for translate(tx,ty) · rotate(deg) · scale(sx,sy) about pivot (px,py). */
export function matrix(px: number, py: number, deg: number, tx: number, ty: number, sx: number, sy: number): number[] {
  "worklet";
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const a = cos * sx;
  const b = sin * sx;
  const c = -sin * sy;
  const d = cos * sy;
  return [a, b, c, d, px + tx - (a * px + c * py), py + ty - (b * px + d * py)];
}
