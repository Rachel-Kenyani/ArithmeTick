/** Level-map geometry: stop positions, trail legs, lead-in/out and the finish flag, in px. */

import type { TrailPropKind } from "@/features/home/components/TrailArt";

export interface Pt {
  x: number;
  y: number;
}

export interface MapLayout {
  width: number;
  height: number;
  big: boolean;
  node: number;
  currentNode: number;
  trail: number;
  nodes: Pt[];
  /** segments[i] joins node i → node i + 1 */
  segments: string[];
  leadIn: string;
  leadOut: string;
  flag: Pt;
  props: { kind: TrailPropKind; x: number; y: number; size: number }[];
}

const PROP_KINDS: TrailPropKind[] = ["bush", "flower", "rock", "mushroom", "flower", "bush"];

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const f = (n: number) => Math.round(n * 10) / 10;

export function computeLayout(width: number, regionHeight: number, count: number): MapLayout {
  // Tablet-sized stops (88px) whenever the column is tablet-wide and the map has a usable height — that includes
  // tablets lying flat (1024×768), where the trail simply scrolls a little; phones held sideways stay compact.
  const big = width >= 460 && regionHeight >= 480;
  const node = big ? 88 : 76;
  const currentNode = node + 8;
  const padTop = big ? 138 : 116;
  const padBottom = big ? 116 : 98;
  const gaps = Math.max(1, count - 1);
  const step = clamp((regionHeight - padTop - padBottom) / gaps, big ? 100 : 80, big ? 150 : 124);
  const height = Math.round(padTop + gaps * step + padBottom);
  const amp = Math.min(width * 0.2, 118);
  const cx = width / 2;

  const nodes: Pt[] = Array.from({ length: count }, (_, i) => ({
    x: i % 2 === 0 ? cx - amp : cx + amp,
    y: height - padBottom - i * step,
  }));

  // Each leg leaves a stop sideways (towards the other column), rises, and enters the next stop sideways —
  // a gentle S that keeps the space right above (stars) and below (labels) every stop clear.
  const segments = nodes.slice(0, -1).map((a, i) => {
    const b = nodes[i + 1];
    const dx = b.x - a.x;
    return `M${f(a.x)} ${f(a.y)}C${f(a.x + dx * 0.62)} ${f(a.y - step * 0.06)} ${f(b.x - dx * 0.62)} ${f(b.y + step * 0.06)} ${f(b.x)} ${f(b.y)}`;
  });

  const first = nodes[0];
  const startX = cx + amp * 0.55;
  const leadIn = `M${f(startX)} ${height + 24}C${f(startX)} ${f(first.y + 46)} ${f(first.x + amp * 0.9)} ${f(first.y)} ${f(first.x)} ${f(first.y)}`;

  const last = nodes.at(-1) ?? first;
  const flag = { x: cx - amp * 0.2, y: last.y - (big ? 50 : 40) };
  const leadOut = `M${f(last.x)} ${f(last.y)}C${f(last.x - amp * 0.7)} ${f(last.y)} ${f(flag.x + 4)} ${f(flag.y + 30)} ${f(flag.x + 4)} ${f(flag.y)}`;

  // Small props on the outer edge opposite each stop (that edge is empty at that height).
  const inset = big ? 46 : 30;
  const props = nodes.map((p, i) => ({
    kind: PROP_KINDS[i % PROP_KINDS.length],
    x: i % 2 === 0 ? width - inset : inset,
    y: p.y + (i % 3 === 1 ? -10 : 6),
    size: big ? 54 : 44,
  }));

  return {
    width,
    height,
    big,
    node,
    currentNode,
    trail: big ? 30 : 26,
    nodes,
    segments,
    leadIn,
    leadOut,
    flag,
    props,
  };
}
