/**
 * Hero pictures for the Grade 2 Move & Play tasks (measurement and geometry with real things at home):
 *   HandspanArt — a hand stretched along a table edge (length)
 *   ScaleCupArt — a balance tipping to the heavy side, beside a cup and a jug (mass and capacity)
 *   CoinsArt    — Kenyan shilling coins and a note (money)
 *   ShapesArt   — a circle, triangle and square, a straight line and a curved line (shapes and lines)
 */

import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from "react-native-svg";

import { colors } from "@/theme";

import { ArtFrame, ink, type ArtProps } from "./art";

export function HandspanArt({ size = 64, title }: Readonly<ArtProps>) {
  return (
    <ArtFrame size={size} title={title}>
      <Rect x="4" y="40" width="56" height="8" rx="2" fill="#c98b4e" {...ink} />
      <Path d="M10 48v10M54 48v10" {...ink} />
      {/* thumb to little finger, stretched wide */}
      <Path
        d="M12 38c-2-4 0-7 3-6l5 3 2-12c1-3 5-3 5 0l1 11 2-14c1-3 5-3 5 0l0 14 3-12c1-3 5-2 5 1l-2 13 4-7c2-3 6-1 5 2l-6 12c-2 3-5 4-9 4H20c-4 0-6-2-8-5z"
        fill="#f2b98a"
        {...ink}
      />
      <Path d="M8 30h48" stroke={colors.atPurple} strokeWidth={2} strokeDasharray="3 3" />
      <Path d="M8 27v6M56 27v6" stroke={colors.atPurple} strokeWidth={2} />
    </ArtFrame>
  );
}

export function ScaleCupArt({ size = 64, title }: Readonly<ArtProps>) {
  return (
    <ArtFrame size={size} title={title}>
      <Path d="M18 58h10M23 58V22" {...ink} />
      {/* beam tipped down to the heavy (left) side */}
      <Path d="M8 26l30-8" {...ink} />
      <Path d="M8 26l-4 9h8zM38 18l-4 9h8z" fill={colors.atMint} {...ink} />
      <Circle cx="8" cy="31" r="3.5" fill="#7a5a3a" {...ink} />
      <Circle cx="38" cy="23" r="2" fill={colors.atYellow} {...ink} />
      <Path d="M44 40h10l-1 16h-8z" fill={colors.atTealLight} {...ink} />
      <Path d="M44 46h10" stroke={colors.atTeal} strokeWidth={2} />
      <Path d="M48 30h6l-1 8h-4z" fill="#fff" {...ink} />
    </ArtFrame>
  );
}

function Coin({ x, y, r, label, fill }: Readonly<{ x: number; y: number; r: number; label: string; fill: string }>) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={fill} {...ink} />
      <Circle cx={x} cy={y} r={r - 3} fill="none" stroke="#1b1b1b" strokeWidth={1} opacity={0.35} />
      <SvgText x={x} y={y + 3.5} fontSize={r * 0.75} fontWeight="bold" fill="#1b1b1b" textAnchor="middle">
        {label}
      </SvgText>
    </G>
  );
}

export function CoinsArt({ size = 64, title }: Readonly<ArtProps>) {
  return (
    <ArtFrame size={size} title={title}>
      <Rect x="6" y="8" width="44" height="22" rx="3" fill="#8fd19e" {...ink} />
      <Ellipse cx="28" cy="19" rx="6" ry="7" fill="#5fae72" {...ink} strokeWidth={1.6} />
      <SvgText x="13" y="26" fontSize="6" fontWeight="bold" fill="#1b1b1b">
        50
      </SvgText>
      <Coin x={16} y={46} r={10} label="20" fill="#e3c25a" />
      <Coin x={38} y={48} r={9} label="10" fill="#d7a64a" />
      <Coin x={54} y={42} r={7} label="5" fill="#c9c9c9" />
    </ArtFrame>
  );
}

export function ShapesArt({ size = 64, title }: Readonly<ArtProps>) {
  return (
    <ArtFrame size={size} title={title}>
      <Circle cx="15" cy="16" r="10" fill={colors.atYellow} {...ink} />
      <Path d="M44 6l12 20H32z" fill={colors.atPurpleLight} {...ink} />
      <Rect x="6" y="34" width="20" height="20" rx="2" fill={colors.atTealLight} {...ink} />
      <Path d="M34 38h24" {...ink} />
      <Path d="M34 52c6-8 12 8 18 0s6-4 6-4" fill="none" {...ink} />
    </ArtFrame>
  );
}
