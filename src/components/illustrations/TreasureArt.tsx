/**
 * Treasures Brijo collects along the trail (one per level, see data/stories.ts). Flat fills, a highlight
 * and the chunky #1b1b1b outline, on a 64×64 viewBox — cheap to draw on budget phones.
 */

import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

import { colors } from "@/theme";

export type TreasureId = "mango" | "feather" | "shell" | "flower" | "banana" | "nest" | "orange" | "pebble" | "seed" | "drum" | "leaf" | "star" | "tomato";

const INK = "#1b1b1b";
const W = 3;

function Art({ id }: Readonly<{ id: TreasureId }>) {
  switch (id) {
    case "tomato":
      return (
        <G>
          <Path d="M32 18c14 0 22 9 22 20S44 56 32 56 10 49 10 38s8-20 22-20z" fill="#e8402e" stroke={INK} strokeWidth={W} />
          <Path d="M18 40c3 7 9 10 16 10" stroke="#b62a1d" strokeWidth={4} strokeLinecap="round" fill="none" />
          <Ellipse cx={23} cy={30} rx={4} ry={5} fill="#ff8d78" />
          <Path d="M32 22l-6-6 5 1 1-6 2 6 5-2-4 6 7 1-7 2" fill="#3fa34d" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        </G>
      );
    case "mango":
      return (
        <G>
          <Path d="M32 14c14 0 22 12 20 26-2 12-12 18-22 16S10 46 12 32 20 14 32 14z" fill="#ffb11b" stroke={INK} strokeWidth={W} />
          <Path d="M20 40c2 8 10 12 18 10" stroke="#e8771a" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Ellipse cx={24} cy={26} rx={4} ry={6} fill="#ffe08a" />
          <Path d="M32 15c0-5 2-8 6-9" stroke={INK} strokeWidth={W} strokeLinecap="round" fill="none" />
          <Path d="M37 8c6-3 12-1 15 3-6 3-12 2-15-3z" fill={colors.atTealLight} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
        </G>
      );
    case "feather":
      return (
        <G>
          <Path d="M48 8C28 12 16 30 16 50l4 2c6-4 22-10 28-28 3-8 2-12 0-16z" fill={colors.atPurpleLight} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
          <Path d="M44 14C34 24 26 38 20 52" stroke={colors.atPurple} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M30 30l8 2M26 38l8 1M36 22l7 2" stroke={colors.atPurple} strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M20 52l-6 6" stroke={INK} strokeWidth={W} strokeLinecap="round" />
        </G>
      );
    case "shell":
      return (
        <G>
          <Path d="M10 44C10 26 20 12 32 12s22 14 22 32c-6 6-14 8-22 8s-16-2-22-8z" fill="#ffd3c2" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
          <Path d="M32 14v36M22 18l4 32M42 18l-4 32M14 30l10 20M50 30L40 50" stroke="#e59a83" strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M24 50h16l-3 6H27z" fill="#ffd3c2" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
        </G>
      );
    case "flower":
      return (
        <G>
          {[0, 72, 144, 216, 288].map((a) => (
            <Ellipse key={a} cx={32} cy={18} rx={8} ry={11} fill={colors.atPlum} stroke={INK} strokeWidth={W} transform={`rotate(${a} 32 32)`} />
          ))}
          <Circle cx={32} cy={32} r={8} fill={colors.atYellow} stroke={INK} strokeWidth={W} />
          <Circle cx={29.5} cy={29.5} r={2.4} fill="#fff4c4" />
        </G>
      );
    case "banana":
      return (
        <G>
          <Path d="M12 22c4 18 18 30 38 26 4-1 4-5 0-6-14 2-26-6-30-22-1-4-9-4-8 2z" fill="#ffd84a" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
          <Path d="M20 24c4 10 12 16 22 18" stroke="#e8b400" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M12 22l-2-6 6-2 2 6" fill="#7a5a1e" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
        </G>
      );
    case "nest":
      return (
        <G>
          <Ellipse cx={26} cy={30} rx={7} ry={9} fill="#f4f1e6" stroke={INK} strokeWidth={W} />
          <Ellipse cx={38} cy={30} rx={7} ry={9} fill="#cfe9ff" stroke={INK} strokeWidth={W} />
          <Path d="M8 34c2 14 12 20 24 20s22-6 24-20z" fill="#b07a3c" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
          <Path d="M12 40c10 4 30 4 40 0M16 47c8 3 24 3 32 0" stroke="#7d5124" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        </G>
      );
    case "orange":
      return (
        <G>
          <Circle cx={32} cy={36} r={20} fill="#ff9a1f" stroke={INK} strokeWidth={W} />
          <Circle cx={25} cy={29} r={4.5} fill="#ffd08a" />
          <Path d="M32 16c2-4 6-6 10-6-1 5-5 7-10 6z" fill={colors.atTealLight} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
        </G>
      );
    case "pebble":
      return (
        <G>
          <Path d="M10 40c0-12 10-22 24-22s20 8 20 18-10 16-22 16S10 50 10 40z" fill="#a9b4bb" stroke={INK} strokeWidth={W} />
          <Ellipse cx={26} cy={30} rx={7} ry={3.5} fill="#d6dde1" />
        </G>
      );
    case "seed":
      return (
        <G>
          <Path d="M32 10c12 8 16 20 14 32-2 8-8 12-14 12s-12-4-14-12c-2-12 2-24 14-32z" fill="#8d5a2b" stroke={INK} strokeWidth={W} />
          <Path d="M32 16v34" stroke="#5f3a17" strokeWidth={2.4} strokeLinecap="round" />
          <Ellipse cx={26} cy={28} rx={3} ry={6} fill="#b07a3c" />
        </G>
      );
    case "drum":
      return (
        <G>
          <Path d="M14 22v22c0 6 8 10 18 10s18-4 18-10V22" fill={colors.atPlum} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
          <Ellipse cx={32} cy={22} rx={18} ry={7} fill="#f4e3c3" stroke={INK} strokeWidth={W} />
          <Path d="M16 28l8 22M48 28l-8 22M24 30l8 22 8-22" stroke={colors.atYellow} strokeWidth={2.4} strokeLinejoin="round" fill="none" />
        </G>
      );
    case "leaf":
      return (
        <G>
          <Path d="M12 52C10 30 26 12 52 10c2 24-14 42-40 42z" fill={colors.atTealLight} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
          <Path d="M14 50C24 38 34 28 48 14M26 40l-2-10M34 32l8 2" stroke={colors.atTeal} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        </G>
      );
    case "star":
      return (
        <Path
          d="M32 8l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 25l16-2z"
          fill={colors.atYellow}
          stroke={INK}
          strokeWidth={W}
          strokeLinejoin="round"
        />
      );
  }
}

export default function TreasureArt({ id, size = 48 }: Readonly<{ id: TreasureId; size?: number }>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityElementsHidden importantForAccessibility="no">
      <Art id={id} />
    </Svg>
  );
}
