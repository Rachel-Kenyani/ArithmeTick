import type { ReactElement } from "react";
import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from "react-native-svg";

import { colors } from "@/theme";

import { ArtFrame, ink, type ArtProps } from "./art";
import { Cap } from "./QuestStepArt";

const TASK_ART: Record<string, (props: ArtProps) => ReactElement> = {
  length: HandspanArt,
  massCapacity: ScaleCupArt,
  money: CoinsArt,
  shapes: ShapesArt,
  findIt: FindItArt,
  hideGuess: HideGuessArt,
  fingers: FingersArt,
};

export const hasQuestTaskArt = (task?: string): task is string => task !== undefined && task in TASK_ART;

export function QuestTaskPicture({ task, size }: Readonly<{ task: string; size: number }>) {
  const Art = TASK_ART[task];
  return Art ? <Art size={size} /> : null;
}

function HandPrint({ x, y, faded }: Readonly<{ x: number; y: number; faded?: boolean }>) {
  return (
    <G opacity={faded ? 0.45 : 1}>
      <Path
        d={`M${x} ${y}v-7c0-2 1-3 2-3h8c1 0 2 1 2 3v7z
            M${x + 1} ${y - 10}v-6a1.2 1.2 0 0 1 2.4 0v6
            M${x + 4} ${y - 10}v-8a1.2 1.2 0 0 1 2.4 0v8
            M${x + 7} ${y - 10}v-7a1.2 1.2 0 0 1 2.4 0v7
            M${x + 10} ${y - 9}v-5a1.1 1.1 0 0 1 2.2 0v5
            M${x - 1} ${y - 5}l-3-3a1.2 1.2 0 0 1 1.7-1.7l3 3`}
        fill="#f2b98a"
        {...ink}
        strokeWidth={1.4}
      />
    </G>
  );
}

export function HandspanArt({ size = 64, title }: Readonly<ArtProps>) {
  const steps = [6, 22, 38] as const;
  return (
    <ArtFrame size={size} title={title}>
      <Rect x="3" y="42" width="58" height="7" rx="2" fill="#c98b4e" {...ink} />
      <Path d="M8 49v10M56 49v10" {...ink} />
      {steps.map((x, i) => (
        <HandPrint key={x} x={x} y={40} faded={i < steps.length - 1} />
      ))}
      <Path d="M12 14q8-6 16 0M28 14q8-6 16 0" stroke={colors.atPurple} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <Path d="M26 12l2 2-2.6 1M42 12l2 2-2.6 1" stroke={colors.atPurple} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {steps.map((x, i) => (
        <SvgText key={x} x={x + 6} y={47.8} fontSize={6.5} fontWeight="bold" fill={colors.white} textAnchor="middle">
          {i + 1}
        </SvgText>
      ))}
    </ArtFrame>
  );
}

export function ScaleCupArt({ size = 64, title }: Readonly<ArtProps>) {
  return (
    <ArtFrame size={size} title={title}>
      <Path d="M18 58h10M23 58V22" {...ink} />
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
      <Circle cx="52" cy="12" r="7" fill={colors.atYellow} {...ink} />
      <Path d="M10 30L30 10l20 20z" fill={colors.atPurpleLight} {...ink} />
      <Rect x="14" y="30" width="32" height="22" rx="2" fill={colors.atTealLight} {...ink} />
      <Rect x="26" y="38" width="8" height="14" rx="1" fill={colors.white} {...ink} />
      <Path d="M4 56h56" {...ink} />
      <Path d="M30 52c2 6 12 2 16 6s10 2 14 0" fill="none" stroke="#a86f33" strokeWidth={3} strokeLinecap="round" />
    </ArtFrame>
  );
}

function Spoon({ x }: Readonly<{ x: number }>) {
  return (
    <G>
      <Ellipse cx={x} cy={42} rx={3.6} ry={5} fill="#d9dde3" {...ink} strokeWidth={1.8} />
      <Path d={`M${x} 47v11`} {...ink} strokeWidth={2.6} />
    </G>
  );
}

export function FindItArt({ size = 64, title }: Readonly<ArtProps>) {
  const spoons = [7, 17, 27, 37, 47, 57] as const;
  return (
    <ArtFrame size={size} title={title}>
      {spoons.map((x) => (
        <Spoon key={x} x={x} />
      ))}
      <Circle cx="24" cy="17" r="11" fill={colors.atCream} {...ink} />
      <Circle cx="24" cy="17" r="7" fill="none" stroke={colors.atTealLight} strokeWidth={2} />
      <Path d="M32 25l9 9" {...ink} strokeWidth={4.5} />
      <Path d="M32 25l9 9" stroke="#7a5a3a" strokeWidth={2} strokeLinecap="round" />
      <SvgText x="52" y="22" fontSize="14" fontWeight="bold" fill={colors.atPurple} textAnchor="middle">
        6
      </SvgText>
    </ArtFrame>
  );
}

export function HideGuessArt({ size = 64, title }: Readonly<ArtProps>) {
  return (
    <ArtFrame size={size} title={title}>
      <Path d="M4 56h56" {...ink} />
      <Cap x={10} y={50} r={5} tone={0} />
      <Cap x={22} y={50} r={5} tone={1} />
      <Cap x={10} y={41} r={5} tone={2} />
      <Path d="M30 54l4-26h22l4 26z" fill={colors.atPurpleLight} {...ink} />
      <Path d="M33 33h24" stroke={colors.atPurple} strokeWidth={2} />
      <SvgText x="45" y="50" fontSize="16" fontWeight="bold" fill={colors.white} textAnchor="middle">
        ?
      </SvgText>
    </ArtFrame>
  );
}

function Hand({ x, fingers }: Readonly<{ x: number; fingers: number }>) {
  const tips = [0, 5, 10, 15].slice(0, Math.min(4, fingers));
  return (
    <G>
      {tips.map((dx, i) => (
        <Rect key={dx} x={x + dx} y={i === 0 || i === 3 ? 18 : 12} width={4.6} height={22} rx={2.3} fill="#c58b5c" {...ink} strokeWidth={1.8} />
      ))}
      {fingers === 5 ? <Rect x={x - 1} y={30} width={4.6} height={16} rx={2.3} fill="#c58b5c" {...ink} strokeWidth={1.8} transform={`rotate(-28 ${x + 1} 44)`} /> : null}
      <Rect x={x - 2} y={32} width={23} height={22} rx={8} fill="#c58b5c" {...ink} />
    </G>
  );
}

export function FingersArt({ size = 64, title }: Readonly<ArtProps>) {
  return (
    <ArtFrame size={size} title={title}>
      <Hand x={10} fingers={5} />
      <Hand x={40} fingers={4} />
      <SvgText x="32" y="10" fontSize="9" fontWeight="bold" fill={colors.atPurple} textAnchor="middle">
        5 + 4
      </SvgText>
    </ArtFrame>
  );
}
