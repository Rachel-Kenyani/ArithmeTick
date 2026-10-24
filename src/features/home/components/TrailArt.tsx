/**
 * Flat, outlined jungle props for the home level map (same illustration language as JungleBackdrop:
 * flat fills, thick near-black outlines). All decorative: hidden from assistive tech, not touchable.
 *
 *   <TrailProp kind="bush" size={52} />   bush | flower | mushroom | rock
 *   <FinishFlag size={64} />               the purple pennant at the top of the trail
 */

import type { ReactElement } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

const INK = "#1b1b1b";

export type TrailPropKind = "bush" | "flower" | "mushroom" | "rock";

interface ArtProps {
  size: number;
  style?: StyleProp<ViewStyle>;
}

function Bush() {
  return (
    <G stroke={INK} strokeWidth={2.6} strokeLinejoin="round">
      <Circle cx={18} cy={36} r={12} fill="#4c9c13" />
      <Circle cx={46} cy={36} r={12} fill="#4c9c13" />
      <Circle cx={32} cy={26} r={15} fill="#64b51a" />
      <Path d="M8 46h48" strokeLinecap="round" />
      <G fill="#8ad61e" stroke="none">
        <Circle cx={27} cy={20} r={4} />
        <Circle cx={14} cy={32} r={2.6} />
        <Circle cx={43} cy={31} r={2.6} />
      </G>
      <G fill="#ffd54a" strokeWidth={1.8}>
        <Circle cx={38} cy={22} r={3.2} />
        <Circle cx={20} cy={40} r={3.2} />
      </G>
    </G>
  );
}

function Flower() {
  const petals = [0, 72, 144, 216, 288];
  return (
    <G stroke={INK} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
      <Path d="M32 30v20" fill="none" strokeWidth={3} />
      <Path d="M32 44c-6-1-11-5-12-10 6 0 11 3 12 10zM32 40c5-1 9-4 10-9-5 0-9 3-10 9z" fill="#64b51a" />
      <G transform="translate(32 20)">
        {petals.map((a) => (
          <Ellipse key={a} cx={0} cy={-8} rx={5.6} ry={8} fill="#ff8fb1" transform={`rotate(${a})`} />
        ))}
        <Circle r={5.4} fill="#ffd54a" />
      </G>
    </G>
  );
}

function Mushroom() {
  return (
    <G stroke={INK} strokeWidth={2.6} strokeLinejoin="round">
      <Path d="M26 30h12l2 16a3 3 0 0 1-3 3H27a3 3 0 0 1-3-3z" fill="#f6ead0" />
      <Path d="M12 32c0-12 9-20 20-20s20 8 20 20c0 2-1.5 3-3.5 3h-33C13.5 35 12 34 12 32z" fill="#f26b3a" />
      <G fill="#fff" strokeWidth={1.8}>
        <Circle cx={24} cy={22} r={3.4} />
        <Circle cx={38} cy={20} r={2.6} />
        <Circle cx={43} cy={29} r={2.4} />
        <Circle cx={19} cy={30} r={2} />
      </G>
    </G>
  );
}

function Rock() {
  return (
    <G stroke={INK} strokeWidth={2.4} strokeLinejoin="round">
      <Path d="M8 46l6-14 12-8 14 2 10 10 6 10z" fill="#8a8a8a" />
      <Path d="M16 33l10-7 8 1-8 6z" fill="#b5b5b5" stroke="none" />
      <Path d="M40 34l10 12h-12z" fill="#5d5d5d" stroke="none" />
      <Path d="M6 46h52" strokeLinecap="round" />
    </G>
  );
}

const PROPS: Record<TrailPropKind, () => ReactElement> = { bush: Bush, flower: Flower, mushroom: Mushroom, rock: Rock };

/** A little tuft of grass each prop stands on, so it reads as planted beside the trail rather than floating. */
function Mound() {
  return (
    <G stroke={INK} strokeWidth={2.4} strokeLinejoin="round">
      <Path d="M7 50c2-5 8-7 14-7h22c6 0 12 2 14 7 0 2-1.5 3-3.5 3h-43C8.5 53 7 52 7 50z" fill="#86c232" />
      <Path d="M15 45l1.5-5 2.5 4.5M44 44l2.5-5 1.5 5" fill="none" strokeLinecap="round" strokeWidth={2} />
    </G>
  );
}

function Decor({ style, children }: Readonly<{ style?: StyleProp<ViewStyle>; children: ReactElement }>) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={style}
    >
      {children}
    </View>
  );
}

export function TrailProp({ kind, size, style }: Readonly<ArtProps & { kind: TrailPropKind }>) {
  const Art = PROPS[kind];
  return (
    <Decor style={style}>
      <Svg viewBox="0 0 64 56" width={size} height={(size * 56) / 64}>
        <Mound />
        <Art />
      </Svg>
    </Decor>
  );
}

/** The finish pennant at the end of the trail: wooden pole on a rock, purple flag with a sun star. */
export function FinishFlag({ size, style }: Readonly<ArtProps>) {
  return (
    <Decor style={style}>
      <Svg viewBox="0 0 64 80" width={size} height={(size * 80) / 64}>
        <G stroke={INK} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round">
          <Rect x={17} y={6} width={6} height={64} rx={3} fill="#a8713a" />
          <Path d="M23 9h30l-8 11 8 11H23z" fill="#7e4fcb" />
          <Path
            d="M36 13.4l1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6z"
            fill="#ffd54a"
            strokeWidth={1.6}
          />
          <Circle cx={20} cy={6} r={4} fill="#ffd54a" />
          <Path d="M6 76l5-9 9-4 10 1 8 5 4 7z" fill="#8a8a8a" />
          <Path d="M13 67l7-3 6 1-6 4z" fill="#b5b5b5" stroke="none" />
        </G>
      </Svg>
    </Decor>
  );
}
