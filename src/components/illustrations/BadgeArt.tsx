/**
 * One hand-drawn illustration per badge id (see src/data/badges.ts). 64×64 viewBox, warm flat
 * fills with 2–4 shades, a highlight and the chunky dark outline.
 *
 *   <BadgeArt id="balance-master" size={48} />
 */

import type { ReactNode } from "react";
import { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";

import { colors } from "@/theme";

import { ArtFrame, ink, OUTLINE, starPath, type ArtProps } from "./art";
import TrophyArt from "./TrophyArt";

const SKIN = "#f3b98a";
const SKIN_SHADE = "#d9925f";
const WOOD = "#c98a4b";
const WOOD_DARK = "#9a6230";
const LEAF = "#79ae2d";
const LEAF_DARK = "#4f7d17";
const LEAF_LIGHT = "#a9d65a";

function Compass() {
  return (
    <>
      <Circle cx="32" cy="34" r="25" fill={colors.atTeal} {...ink} />
      <Circle cx="32" cy="34" r="19" fill={colors.atCream} {...ink} strokeWidth={1.8} />
      <Path d="M18 26a16 16 0 0 1 10-8" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      {[0, 90, 180, 270].map((a) => (
        <Line key={a} x1="32" y1="17.5" x2="32" y2="21" stroke={OUTLINE} strokeWidth={2} strokeLinecap="round" transform={`rotate(${a} 32 34)`} />
      ))}
      <Path d="M32 18l5 16h-10z" fill={colors.atPlum} {...ink} strokeWidth={1.8} />
      <Path d="M32 50l5-16h-10z" fill={colors.atMintDeep} {...ink} strokeWidth={1.8} />
      <Circle cx="32" cy="34" r="3" fill={colors.jgSun} {...ink} strokeWidth={1.6} />
      <Rect x="28" y="4" width="8" height="6" rx="2" fill={colors.atTealLight} {...ink} />
    </>
  );
}

function BalanceScale() {
  return (
    <>
      <Path d="M20 58h24l-4-6H24z" fill={WOOD_DARK} {...ink} />
      <Rect x="29.5" y="14" width="5" height="40" rx="2" fill={WOOD} {...ink} />
      <Rect x="8" y="14" width="48" height="5" rx="2.5" fill={colors.atPurple} {...ink} />
      <Circle cx="32" cy="12" r="4" fill={colors.jgSun} {...ink} />
      <Path d="M12 19l-6 16M12 19l6 16M52 19l-6 16M52 19l6 16" stroke={OUTLINE} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Path d="M3 35h18a9 6 0 0 1-18 0z" fill={colors.atPurpleLight} {...ink} />
      <Path d="M43 35h18a9 6 0 0 1-18 0z" fill={colors.atPurpleLight} {...ink} />
      <Circle cx="9" cy="31.5" r="3.2" fill={colors.atPlum} {...ink} strokeWidth={1.6} />
      <Circle cx="15.5" cy="31.5" r="3.2" fill={colors.jgSun} {...ink} strokeWidth={1.6} />
      <Rect x="48" y="28" width="7" height="7" rx="1.5" fill={colors.atTealLight} {...ink} strokeWidth={1.6} />
      <Path d="M10 16h16" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
    </>
  );
}

function Crane() {
  const blocks: ReactNode[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      blocks.push(
        <Rect key={`${r}-${c}`} x={22 + c * 9} y={34 + r * 8} width="8" height="7" rx="1.2" fill={(r + c) % 2 ? colors.atYellow : colors.jgSun} stroke={OUTLINE} strokeWidth={1.6} />,
      );
    }
  }
  return (
    <>
      {/* mast */}
      <Rect x="8" y="10" width="7" height="48" fill={colors.atYellow} {...ink} />
      <Path d="M8 18l7 8M15 26l-7 8M8 34l7 8M15 42l-7 8" stroke={OUTLINE} strokeWidth={1.4} fill="none" />
      {/* jib */}
      <Rect x="4" y="6" width="54" height="5" rx="1.5" fill={colors.atYellow} {...ink} />
      <Rect x="2" y="11" width="8" height="6" rx="1" fill={colors.atPlum} {...ink} strokeWidth={1.8} />
      <Line x1="46" y1="11" x2="46" y2="24" stroke={OUTLINE} strokeWidth={1.6} />
      <Path d="M43 24h6l-1 4h-4z" fill={colors.atTeal} {...ink} strokeWidth={1.6} />
      <Path d="M6 58h54" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" />
      {blocks}
    </>
  );
}

function LeafHand() {
  return (
    <>
      {/* leaf */}
      <Path d="M32 34C18 30 14 16 22 4c12 6 18 18 10 30z" fill={LEAF} {...ink} />
      <Path d="M22 4c4 10 8 20 10 30" fill="none" stroke={LEAF_DARK} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M24 12c-2 3-2 7 0 10" fill="none" stroke={LEAF_LIGHT} strokeWidth={2.4} strokeLinecap="round" />
      {/* open hand cupped below */}
      <Path
        d="M8 42c4-2 8 0 11 3l7 2c4 1 4 6 0 6h-8l14 1 12-8c3-2 6 1 4 4l-12 10H18c-5 0-8-2-10-4z"
        fill={SKIN}
        {...ink}
      />
      <Path d="M18 53h8M30 54l10-6" stroke={SKIN_SHADE} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <Rect x="2" y="44" width="8" height="16" rx="2" fill={colors.atTeal} {...ink} />
    </>
  );
}

function Puzzle() {
  return (
    <>
      <Path d="M6 22h10a5 5 0 1 1 10 0h8v10a5 5 0 1 0 0 10v10H6z" fill={colors.atTeal} {...ink} />
      <Path d="M34 22h8a5 5 0 1 1 10 0h6v30H34V42a5 5 0 1 0 0-10z" fill={colors.jgSun} {...ink} />
      <Path d="M10 26v8" stroke={colors.atTealLight} strokeWidth={3} strokeLinecap="round" />
      <Path d="M54 26v8" stroke="#fff6c9" strokeWidth={3} strokeLinecap="round" />
      <SvgText x="19" y="45" fontSize="16" fontWeight="bold" fill="#fff" textAnchor="middle">3</SvgText>
      <SvgText x="47" y="45" fontSize="16" fontWeight="bold" fill={OUTLINE} textAnchor="middle">7</SvgText>
    </>
  );
}

function Magnifier() {
  return (
    <>
      <Rect x="38" y="40" width="9" height="22" rx="4" fill={WOOD} {...ink} transform="rotate(-45 42.5 51)" />
      <Circle cx="26" cy="26" r="20" fill={colors.atPurple} {...ink} />
      <Circle cx="26" cy="26" r="15" fill={colors.atMint} {...ink} strokeWidth={1.8} />
      <SvgText x="26" y="34" fontSize="22" fontWeight="bold" fill={colors.atPurple} textAnchor="middle">5</SvgText>
      <Path d="M15 22a12 12 0 0 1 7-8" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    </>
  );
}

function StickBundle() {
  const sticks: ReactNode[] = [];
  for (let i = 0; i < 10; i++) {
    const x = 14 + i * 4;
    sticks.push(
      <G key={i}>
        <Rect x={x} y="8" width="4" height="48" rx="2" fill={i % 2 ? WOOD : "#dea464"} stroke={OUTLINE} strokeWidth={1.4} />
      </G>,
    );
  }
  return (
    <>
      {sticks}
      <Rect x="10" y="27" width="44" height="9" rx="3" fill={colors.atPlum} {...ink} />
      <Path d="M28 36l-4 10M36 36l4 10" stroke={OUTLINE} strokeWidth={4.4} strokeLinecap="round" />
      <Path d="M28 36l-4 10M36 36l4 10" stroke={colors.atPlum} strokeWidth={2.2} strokeLinecap="round" />
      <Ellipse cx="32" cy="31.5" rx="5" ry="4.5" fill={colors.atYellow} {...ink} strokeWidth={1.8} />
      <Path d="M13 29.5h12" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
    </>
  );
}

function HighFive() {
  const hand = (
    <>
      <Path d="M8 60l4-18-6-14c-1-3 3-5 5-2l5 9V12c0-3 4-3 4 0v14V9c0-3 4-3 4 0v17V11c0-3 4-3 4 0v16V15c0-3 4-3 4 0v22c0 8-3 13-8 16l-1 7z" fill={SKIN} {...ink} />
      <Path d="M16 40c3 1 7 1 10-1M22 26v4" stroke={SKIN_SHADE} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </>
  );
  return (
    <>
      <G transform="rotate(-14 20 40) translate(-4 0)">{hand}</G>
      <G transform="translate(64 0) scale(-1 1) rotate(-14 20 40) translate(-4 0)">{hand}</G>
      <Path d="M32 2v5M24 4l2 4M40 4l-2 4" stroke={colors.atPlum} strokeWidth={2.6} strokeLinecap="round" />
    </>
  );
}

function Stars() {
  return (
    <>
      <Path d={starPath(20, 44, 13)} fill={colors.jgSunEdge} {...ink} />
      <Path d={starPath(44, 44, 13)} fill={colors.jgSunEdge} {...ink} />
      <Path d={starPath(32, 28, 20)} fill={colors.jgSun} {...ink} />
      <Path d="M26 22l3-5" stroke="#fff6c9" strokeWidth={3} strokeLinecap="round" />
      <Path d="M54 8l1.5 3.5L59 13l-3.5 1.5L54 18l-1.5-3.5L49 13l3.5-1.5z" fill={colors.atYellowSoft} {...ink} strokeWidth={1.6} />
      <Circle cx="9" cy="14" r="2.2" fill={colors.atYellowSoft} {...ink} strokeWidth={1.4} />
    </>
  );
}

const ART: Record<string, () => ReactNode> = {
  "ten-frame-explorer": Compass,
  "balance-master": BalanceScale,
  "array-architect": Crane,
  "hands-on-hero": LeafHand,
  "number-builder": Puzzle,
  "number-detective": Magnifier,
  "regroup-ranger": StickBundle,
  "high-five-hero": HighFive,
  "star-collector": Stars,
};

const CHAMPION_TONE = { "grade-1-champion": "teal", "grade-2-champion": "purple", "grade-3-champion": "yellow" } as const;

export interface BadgeArtProps extends ArtProps {
  /** Badge id from src/data/badges.ts. Unknown ids fall back to the star burst. */
  id: string;
}

export default function BadgeArt({ id, size = 64, title }: Readonly<BadgeArtProps>) {
  if (id in CHAMPION_TONE) {
    return <TrophyArt size={size} title={title} tone={CHAMPION_TONE[id as keyof typeof CHAMPION_TONE]} />;
  }
  const Glyph = ART[id] ?? Stars;
  return (
    <ArtFrame size={size} title={title}>
      <Glyph />
    </ArtFrame>
  );
}
