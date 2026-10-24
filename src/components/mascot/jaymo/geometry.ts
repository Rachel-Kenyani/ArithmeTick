/**
 * Jaymo palette + artwork geometry (200×200 viewBox, identical to web) and rig pivots.
 */

/* ------------------------------------------------------------------------------------------
 * Palette + geometry (identical to web)
 * ---------------------------------------------------------------------------------------- */

export const C = {
  outline: "#1B1B1B",
  teal: "#009088",
  lid: "#0A9C93",
  tuft: "#884DCF",
  wing: "#6D41A3",
  body: "#56318A",
  kitenge: "#B57AFC",
  rim: "#66BCB8",
  grey: "#666666",
  pupil: "#262626",
  white: "#FFFFFF",
  orange: "#FEAD1D",
  mouth: "#4A1630",
  tongue: "#F27A93",
  z: "#7E4FCB",
} as const;

export const HEAD = { cx: 100, cy: 64, rx: 52, ry: 44 } as const;
export const FACE_Y = 66.5;
export const TUFT_L = "M57 6.5 L50.8 33.5 L78.1 33.5 Z";
export const TUFT_R = "M143 6.5 L149.2 33.5 L121.9 33.5 Z";
export const FOREHEAD_V = "M73 27 L127 27 L100 61.5 Z";

export const LENS = { left: 71.25, right: 128.75, r: 23.4 } as const;
export const EYE = { inset: 2.2, ringR: 18, r: 16.2, irisInset: 2.7, irisR: 7.4, pupilR: 3.9 } as const;
export const TEMPLE_ARMS = `M40.5 ${FACE_Y} H48 M152 ${FACE_Y} H159.5`;
export const BRIDGE = `M94 ${FACE_Y - 0.3} H106`;

export const BEAK_Y = 81.4;
export const BEAK_UPPER_FILL = `M100 74.3 L92.2 ${BEAK_Y} L100 85 L107.8 ${BEAK_Y} Z`;
export const BEAK_UPPER_LINE = `M92.2 ${BEAK_Y} L100 74.3 L107.8 ${BEAK_Y}`;
export const BEAK_LOWER_FILL = `M92.2 ${BEAK_Y} L100 95.3 L107.8 ${BEAK_Y} Z`;
export const BEAK_LOWER_LINE = `M92.2 ${BEAK_Y} L100 95.3 L107.8 ${BEAK_Y}`;
export const MOUTH_PATH = `M93.2 ${BEAK_Y} H106.8 L104.4 90 Q100 92.6 95.6 90 Z`;

export const CHEST = "M47 105 L153 105 L100 194 Z";
const KITENGE: readonly (readonly [number, number])[] = [
  [76.6, 117.5], [100, 117.5], [123.4, 117.5],
  [88.3, 134], [111.7, 134],
  [100, 150.5],
];
export const KITENGE_PATH = KITENGE.map(([x, y]) => `M${x - 7.2} ${y} H${x + 7.2} L${x} ${y + 10.6} Z`).join(" ");

export const WING_L =
  "M47 105 C41.5 108.5 39 117 39 125 C39 150 60 168 83 171 C88 171.6 90.6 168.4 89 164.5 L60 106.4 Z";
export const BODY_PATH =
  "M52 105 C46.5 109 44.5 117 44.5 125 C44.5 147 63 163 84 166 L116 166 C137 163 155.5 147 155.5 125 C155.5 117 153.5 109 148 105 Z";

export const TOE = { w: 6.8, h: 18.6, y: 177, gap: 9 } as const;
export const FOOT_X = { left: 80.5, right: 119.5 } as const;

export const Z_PATH = "M160 50 H171 L160 61 H171";

export const W = { line: 2.6, lens: 2.4, beak: 2.2, toe: 2.2, kitenge: 1.8, arm: 2.6, bridge: 2.8, lash: 2 } as const;

export function inkFor(size: number): number {
  return Math.min(1.45, Math.max(1, 96 / Math.max(size, 1)));
}

/** Pivots — fixed points in artwork space. */
export const PIVOT = {
  boop: [100, 196],
  shadow: [100, 196.8],
  rig: [100, 195],
  squash: [100, 177],
  head: [100, 104],
  wingL: [48, 106],
  wingR: [152, 106],
  footL: [FOOT_X.left, 177],
  footR: [FOOT_X.right, 177],
  mouth: [100, BEAK_Y],
} as const;
