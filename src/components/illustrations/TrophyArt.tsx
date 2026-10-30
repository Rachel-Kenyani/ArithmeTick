/**
 * Gold trophy cup with handles, a star plate and a stepped plinth. `tone` tints the plinth band
 * (teal / purple / yellow = Grade 1 / 2 / 3).
 */

import { Ellipse, Path, Rect } from "react-native-svg";

import { colors } from "@/theme";

import { ArtFrame, ink, starPath, type ArtProps } from "./art";

export type TrophyTone = "teal" | "purple" | "yellow";

const BAND: Record<TrophyTone, { base: string; light: string }> = {
  teal: { base: colors.atTeal, light: colors.atTealLight },
  purple: { base: colors.atPurple, light: colors.atPurpleLight },
  yellow: { base: "#e08a00", light: colors.atYellow },
};

export interface TrophyArtProps extends ArtProps {
  tone?: TrophyTone;
}

export default function TrophyArt({ size = 64, title, tone = "yellow" }: Readonly<TrophyArtProps>) {
  const band = BAND[tone];
  return (
    <ArtFrame size={size} title={title}>
      {/* handles */}
      <Path d="M17 14H10a3 3 0 0 0-3 3v2a10 10 0 0 0 11 10" fill="none" {...ink} strokeWidth={4.6} />
      <Path d="M17 14H10a3 3 0 0 0-3 3v2a10 10 0 0 0 11 10" fill="none" stroke={colors.jgSunEdge} strokeWidth={2} strokeLinecap="round" />
      <Path d="M47 14h7a3 3 0 0 1 3 3v2a10 10 0 0 1-11 10" fill="none" {...ink} strokeWidth={4.6} />
      <Path d="M47 14h7a3 3 0 0 1 3 3v2a10 10 0 0 1-11 10" fill="none" stroke={colors.jgSunEdge} strokeWidth={2} strokeLinecap="round" />
      {/* stem + plinth */}
      <Path d="M28 38h8l2 8H26z" fill={colors.jgSunEdge} {...ink} />
      <Rect x="18" y="46" width="28" height="12" rx="3" fill={band.base} {...ink} />
      <Rect x="21" y="49" width="22" height="3" rx="1.5" fill={band.light} />
      {/* cup */}
      <Path d="M16 8h32v12a16 16 0 0 1-32 0z" fill={colors.jgSun} {...ink} />
      <Path d="M36 8h12v12a16 16 0 0 1-10 14.8A30 30 0 0 0 36 8z" fill={colors.jgSunEdge} opacity={0.55} />
      <Path d="M21 12v8a11 11 0 0 0 4 8.5" fill="none" stroke="#fff6c9" strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx="32" cy="8" rx="16" ry="2.4" fill={colors.atYellowSoft} {...ink} />
      <Path d={starPath(32, 20, 6.5)} fill="#fff6c9" {...ink} strokeWidth={1.8} />
    </ArtFrame>
  );
}
