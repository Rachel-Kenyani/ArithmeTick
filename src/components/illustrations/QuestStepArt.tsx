/**
 * Step illustrations for the Move & Play (physical quest) overlay:
 *   CapsStepArt    — a little pile of 10 bottle tops
 *   GroupsStepArt  — two groups of caps
 *   GrownUpStepArt — a child showing a grown-up
 */

import { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

import { colors } from "@/theme";

import { ArtFrame, ink, OUTLINE, type ArtProps } from "./art";

const CAP_COLOURS = [
  { top: "#e5484d", side: "#a8262b" },
  { top: colors.atTealLight, side: colors.atTeal },
  { top: colors.jgSun, side: colors.jgSunEdge },
  { top: colors.atPurpleLight, side: colors.atPurple },
] as const;

/** A single bottle top seen at a slight angle: ridged side band, flat top, highlight. */
function Cap({ x, y, r = 6, tone = 0 }: Readonly<{ x: number; y: number; r?: number; tone?: number }>) {
  const c = CAP_COLOURS[tone % CAP_COLOURS.length];
  return (
    <G>
      <Path d={`M${x - r} ${y}v${r * 0.5}a${r} ${r * 0.5} 0 0 0 ${r * 2} 0V${y}`} fill={c.side} stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
      <Ellipse cx={x} cy={y} rx={r} ry={r * 0.5} fill={c.top} stroke={OUTLINE} strokeWidth={1.6} />
      <Ellipse cx={x - r * 0.3} cy={y - r * 0.12} rx={r * 0.35} ry={r * 0.14} fill="#fff" opacity={0.6} />
    </G>
  );
}

/** Ten caps: a 4-3-2-1 pyramid. */
const PILE = [
  [11, 52], [24, 52], [37, 52], [50, 52],
  [17.5, 43], [30.5, 43], [43.5, 43],
  [24, 34], [37, 34],
  [30.5, 25],
] as const;

export function CapsStepArt({ size = 64, title }: Readonly<ArtProps>) {
  return (
    <ArtFrame size={size} title={title}>
      <Ellipse cx="31" cy="58" rx="27" ry="3.5" fill={colors.atMintDeep} />
      {PILE.map(([x, y], i) => (
        <Cap key={i} x={x} y={y} tone={i} />
      ))}
    </ArtFrame>
  );
}

const GROUP = [
  [0, 0], [10, 0], [20, 0], [5, -8], [15, -8],
] as const;

export function GroupsStepArt({ size = 64, title }: Readonly<ArtProps>) {
  return (
    <ArtFrame size={size} title={title}>
      <Ellipse cx="16" cy="44" rx="14.5" ry="13" fill={colors.atMint} {...ink} strokeWidth={1.8} strokeDasharray="3 4" />
      <Ellipse cx="48" cy="44" rx="14.5" ry="13" fill={colors.atYellowSoft} {...ink} strokeWidth={1.8} strokeDasharray="3 4" />
      {GROUP.map(([dx, dy], i) => (
        <Cap key={`a${i}`} x={6 + dx} y={48 + dy} r={4.6} tone={1} />
      ))}
      {GROUP.map(([dx, dy], i) => (
        <Cap key={`b${i}`} x={38 + dx} y={48 + dy} r={4.6} tone={2} />
      ))}
      <Path d="M24 14h16M34 9l6 5-6 5" fill="none" stroke={colors.atPlum} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M30 22h4" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" />
    </ArtFrame>
  );
}

export function GrownUpStepArt({ size = 64, title }: Readonly<ArtProps>) {
  return (
    <ArtFrame size={size} title={title}>
      {/* grown-up (right) */}
      <Path d="M36 62V40a10 10 0 0 1 20 0v22z" fill={colors.atPurple} {...ink} />
      <Path d="M40 42v18" stroke={colors.atPurpleLight} strokeWidth={3} strokeLinecap="round" />
      <Circle cx="46" cy="20" r="9" fill="#c98a5e" {...ink} />
      <Path d="M37 19a9 9 0 0 1 18-1c-4 0-9-2-11-5-2 3-4 5-7 6z" fill="#3b2a20" {...ink} strokeWidth={1.8} />
      <Circle cx="42.5" cy="21" r="1.1" fill={OUTLINE} />
      <Circle cx="49" cy="21" r="1.1" fill={OUTLINE} />
      <Path d="M43 25a3.5 3.5 0 0 0 5 0" fill="none" stroke={OUTLINE} strokeWidth={1.4} strokeLinecap="round" />
      {/* child (left) */}
      <Path d="M8 62V48a8 8 0 0 1 16 0v14z" fill={colors.atTeal} {...ink} />
      <Circle cx="16" cy="34" r="7.5" fill="#f3b98a" {...ink} />
      <Path d="M8.6 33a7.5 7.5 0 0 1 14.8 0c-3 0-6-1-7.4-3-1.4 2-4 3-7.4 3z" fill="#5a3a24" {...ink} strokeWidth={1.6} />
      <Circle cx="14" cy="35" r="0.9" fill={OUTLINE} />
      <Circle cx="19" cy="35" r="0.9" fill={OUTLINE} />
      <Path d="M14.5 38a2.5 2.5 0 0 0 3.5 0" fill="none" stroke={OUTLINE} strokeWidth={1.2} strokeLinecap="round" />
      {/* child holds up a cap toward the grown-up */}
      <Path d="M22 48l7-10" stroke={OUTLINE} strokeWidth={5} strokeLinecap="round" />
      <Path d="M22 48l7-10" stroke={colors.atTeal} strokeWidth={2.6} strokeLinecap="round" />
      <Cap x={30} y={34} r={4.8} tone={0} />
      {/* sparkle */}
      <Path d="M30 22v4M28 24h4" stroke={colors.atYellow} strokeWidth={2} strokeLinecap="round" />
      <Rect x="0" y="62" width="64" height="2" fill={OUTLINE} />
    </ArtFrame>
  );
}
