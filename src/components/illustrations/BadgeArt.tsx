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
      <Rect x="8" y="10" width="7" height="48" fill={colors.atYellow} {...ink} />
      <Path d="M8 18l7 8M15 26l-7 8M8 34l7 8M15 42l-7 8" stroke={OUTLINE} strokeWidth={1.4} fill="none" />
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
      <Path d="M32 34C18 30 14 16 22 4c12 6 18 18 10 30z" fill={LEAF} {...ink} />
      <Path d="M22 4c4 10 8 20 10 30" fill="none" stroke={LEAF_DARK} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M24 12c-2 3-2 7 0 10" fill="none" stroke={LEAF_LIGHT} strokeWidth={2.4} strokeLinecap="round" />
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

function Feather() {
  return (
    <>
      <Path d="M48 6C30 8 16 24 14 46l4 4c22-2 38-16 40-34z" fill={colors.atTealLight} {...ink} />
      <Path d="M8 58L44 16" stroke={OUTLINE} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M22 34l10 2M28 26l10 2M18 42l8 2" stroke={colors.atTeal} strokeWidth={2} strokeLinecap="round" />
      <Path d="M46 12c-4 2-6 4-8 7" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </>
  );
}

function Shell() {
  return (
    <>
      <Path d="M32 8C16 8 6 24 8 44l10 10h28l10-10C58 24 48 8 32 8z" fill="#f6c9a8" {...ink} />
      <Path d="M32 54V12M22 54L16 18M42 54l6-36M14 50L9 32M50 50l5-18" stroke="#d9925f" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Rect x="24" y="52" width="16" height="7" rx="3" fill="#f6c9a8" {...ink} />
      <Path d="M20 16c-3 3-5 7-6 11" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </>
  );
}

function TwoGroups() {
  const dots = (cx: number, fill: string) =>
    [0, 1, 2].map((i) => <Circle key={`${cx}-${i}`} cx={cx + (i % 2 ? 6 : -6)} cy={22 + i * 10} r="5" fill={fill} {...ink} strokeWidth={1.6} />);
  return (
    <>
      <Ellipse cx="18" cy="32" rx="14" ry="22" fill={colors.atCream} {...ink} />
      <Ellipse cx="46" cy="32" rx="14" ry="22" fill={colors.atCream} {...ink} />
      {dots(18, colors.atTeal)}
      {dots(46, colors.atPurple)}
    </>
  );
}

function Flower() {
  return (
    <>
      <Path d="M18 44h28l-4 16H22z" fill={WOOD} {...ink} />
      <Rect x="15" y="40" width="34" height="6" rx="2" fill={WOOD_DARK} {...ink} />
      <Path d="M32 40V24" stroke={LEAF_DARK} strokeWidth={3} strokeLinecap="round" />
      <Path d="M32 34c-6 0-10-4-10-8 6 0 10 4 10 8z" fill={LEAF} {...ink} strokeWidth={1.6} />
      {[0, 72, 144, 216, 288].map((a) => (
        <Ellipse key={a} cx="32" cy="9" rx="5" ry="7" fill={colors.atPlum} {...ink} strokeWidth={1.6} transform={`rotate(${a} 32 16)`} />
      ))}
      <Circle cx="32" cy="16" r="5" fill={colors.jgSun} {...ink} strokeWidth={1.6} />
    </>
  );
}

function SoupPot() {
  return (
    <>
      <Path d="M24 14c0-4 4-4 4-8M34 14c0-4 4-4 4-8" stroke="#9aa8a6" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Rect x="4" y="26" width="8" height="5" rx="2" fill={colors.atInk} />
      <Rect x="52" y="26" width="8" height="5" rx="2" fill={colors.atInk} />
      <Path d="M10 22h44v24c0 8-6 12-12 12H22c-6 0-12-4-12-12z" fill={colors.atTeal} {...ink} />
      <Ellipse cx="32" cy="22" rx="22" ry="5" fill="#e0533c" {...ink} />
      <Circle cx="24" cy="21" r="4" fill="#ff7a5c" {...ink} strokeWidth={1.4} />
      <Circle cx="38" cy="22" r="3.5" fill="#ff7a5c" {...ink} strokeWidth={1.4} />
      <Path d="M16 30v10" stroke={colors.atTealLight} strokeWidth={3} strokeLinecap="round" />
    </>
  );
}

function Target() {
  return (
    <>
      <Circle cx="30" cy="34" r="24" fill="#fff" {...ink} />
      <Circle cx="30" cy="34" r="17" fill={colors.atPlum} {...ink} strokeWidth={1.8} />
      <Circle cx="30" cy="34" r="10" fill="#fff" {...ink} strokeWidth={1.8} />
      <Circle cx="30" cy="34" r="4" fill={colors.jgSun} {...ink} strokeWidth={1.6} />
      <Path d="M30 34L56 8" stroke={OUTLINE} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M52 6l6-2-2 6-4 2z" fill={colors.atTeal} {...ink} strokeWidth={1.6} />
    </>
  );
}

function NumberStones() {
  const stones = [
    { x: 6, y: 44, n: "50" },
    { x: 24, y: 34, n: "49" },
    { x: 42, y: 22, n: "48" },
  ];
  return (
    <>
      {stones.map((st) => (
        <G key={st.n}>
          <Ellipse cx={st.x + 8} cy={st.y + 8} rx="10" ry="8" fill={colors.atPurpleLight} {...ink} />
          <SvgText x={st.x + 8} y={st.y + 12} fontSize="10" fontWeight="bold" fill={OUTLINE} textAnchor="middle">
            {st.n}
          </SvgText>
        </G>
      ))}
      <Path d="M14 40c2-8 8-10 14-8M32 30c2-8 8-10 14-8" fill="none" stroke={colors.atPurple} strokeWidth={2} strokeDasharray="3 3" strokeLinecap="round" />
    </>
  );
}

function HandRuler() {
  return (
    <>
      <Rect x="4" y="44" width="56" height="12" rx="2" fill={colors.jgSun} {...ink} />
      {[12, 20, 28, 36, 44, 52].map((x) => (
        <Line key={x} x1={x} y1="44" x2={x} y2={x % 16 === 12 ? 52 : 49} stroke={OUTLINE} strokeWidth={1.4} />
      ))}
      <Path d="M18 42V20c0-3 4-3 4 0v12V14c0-3 4-3 4 0v18V16c0-3 4-3 4 0v16V20c0-3 4-3 4 0v14l5-6c2-2 5 0 4 2l-7 12z" fill={SKIN} {...ink} />
    </>
  );
}

function CrateUp() {
  const cells: ReactNode[] = [];
  for (let i = 0; i < 10; i++) {
    cells.push(<Circle key={i} cx={10 + (i % 5) * 9} cy={i < 5 ? 40 : 50} r="3.6" fill={i < 7 ? colors.atTeal : colors.atPurple} stroke={OUTLINE} strokeWidth={1.2} />);
  }
  return (
    <>
      <Rect x="3" y="33" width="50" height="24" rx="3" fill="#fff" {...ink} />
      {cells}
      <Path d="M56 30V8M50 14l6-6 6 6" fill="none" stroke={colors.atPurple} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
      <SvgText x="26" y="24" fontSize="14" fontWeight="bold" fill={colors.atPurple} textAnchor="middle">+1</SvgText>
    </>
  );
}

function SeedHoles() {
  return (
    <>
      <Path d="M2 34h60v24H2z" fill="#8A5A33" {...ink} />
      {[12, 32, 52].map((x) => (
        <G key={x}>
          <Ellipse cx={x} cy="44" rx="9" ry="5" fill="#5E3B1E" {...ink} strokeWidth={1.6} />
          <Ellipse cx={x - 3} cy="43" rx="2.4" ry="1.6" fill={colors.jgSun} />
          <Ellipse cx={x + 3} cy="43" rx="2.4" ry="1.6" fill={colors.jgSun} />
        </G>
      ))}
      <Path d="M32 32V14" stroke={LEAF_DARK} strokeWidth={3} strokeLinecap="round" />
      <Path d="M32 20c-8 0-12-6-12-10 8 0 12 6 12 10zM32 18c6 0 10-5 10-8-6 0-10 5-10 8z" fill={LEAF} {...ink} strokeWidth={1.6} />
    </>
  );
}

function FairPlates() {
  const plate = (cx: number) => (
    <G key={cx}>
      <Ellipse cx={cx} cy="44" rx="14" ry="6" fill="#fff" {...ink} />
      {[-5, 5].map((dx) => [-1, 1].map((r) => <Circle key={`${dx}${r}`} cx={cx + dx} cy={r < 0 ? 34 : 40} r="4" fill="#e0533c" stroke={OUTLINE} strokeWidth={1.4} />))}
    </G>
  );
  return (
    <>
      {plate(16)}
      {plate(48)}
      <SvgText x="32" y="20" fontSize="16" fontWeight="bold" fill={colors.atPurple} textAnchor="middle">=</SvgText>
      <Path d="M8 56h48" stroke={OUTLINE} strokeWidth={2} strokeLinecap="round" />
    </>
  );
}

function TenCoins() {
  return (
    <>
      {[46, 36, 26].map((y, i) => (
        <G key={y}>
          <Ellipse cx="32" cy={y + 6} rx="20" ry="7" fill="#b8892f" {...ink} />
          <Ellipse cx="32" cy={y} rx="20" ry="7" fill={i === 2 ? colors.jgSun : "#e3c25a"} {...ink} />
        </G>
      ))}
      <SvgText x="32" y="30" fontSize="9" fontWeight="bold" fill={OUTLINE} textAnchor="middle">10</SvgText>
      <SvgText x="32" y="14" fontSize="11" fontWeight="bold" fill={colors.atPurple} textAnchor="middle">30</SvgText>
    </>
  );
}

function ThreeOClock() {
  return (
    <>
      <Circle cx="32" cy="32" r="26" fill="#fff" {...ink} strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => (
        <Line key={i} x1="32" y1="9" x2="32" y2={i % 3 === 0 ? 14 : 12} stroke={OUTLINE} strokeWidth={i % 3 === 0 ? 2.4 : 1.4} transform={`rotate(${i * 30} 32 32)`} />
      ))}
      <Path d="M32 32V12" stroke={colors.atTeal} strokeWidth={3} strokeLinecap="round" />
      <Path d="M32 32h14" stroke={colors.atPurple} strokeWidth={4.4} strokeLinecap="round" />
      <Circle cx="32" cy="32" r="3" fill={OUTLINE} />
    </>
  );
}

function ShapeHouse() {
  return (
    <>
      <Circle cx="52" cy="12" r="7" fill={colors.jgSun} {...ink} />
      <Path d="M8 30L30 8l22 22z" fill={colors.atPurpleLight} {...ink} />
      <Rect x="12" y="30" width="36" height="22" rx="2" fill={colors.atTealLight} {...ink} />
      <Rect x="25" y="38" width="10" height="14" rx="1" fill="#fff" {...ink} />
      <Path d="M4 56h56" {...ink} />
      <Path d="M30 54c2 4 10 2 14 4s8 0 14-2" fill="none" stroke={WOOD} strokeWidth={3} strokeLinecap="round" />
    </>
  );
}

function Mountain() {
  return (
    <>
      <Path d="M2 58L24 20l10 14 8-10 20 34z" fill={colors.atPurpleLight} {...ink} />
      <Path d="M24 20l-6 10 6-2 4 4z" fill="#fff" {...ink} strokeWidth={1.6} />
      <Path d="M42 24V4" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M42 4l14 5-14 5z" fill={colors.atPlum} {...ink} strokeWidth={1.8} />
      <Path d="M8 52c8-6 14-2 20-8s12-4 16-10" fill="none" stroke={colors.jgSun} strokeWidth={2.4} strokeDasharray="3 3" strokeLinecap="round" />
    </>
  );
}

function Bee() {
  return (
    <>
      <Ellipse cx="22" cy="20" rx="10" ry="13" fill="#e8f6ff" {...ink} transform="rotate(-25 22 20)" />
      <Ellipse cx="40" cy="18" rx="10" ry="13" fill="#e8f6ff" {...ink} transform="rotate(25 40 18)" />
      <Ellipse cx="32" cy="38" rx="20" ry="15" fill={colors.jgSun} {...ink} />
      <Path d="M24 25v26M34 23v30" stroke={OUTLINE} strokeWidth={4} />
      <Circle cx="46" cy="34" r="2.4" fill={OUTLINE} />
      <Path d="M12 40l-8 2" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M48 24l6-8M52 26l8-4" stroke={OUTLINE} strokeWidth={1.8} strokeLinecap="round" />
    </>
  );
}

function Footprints() {
  const foot = (x: number, y: number, r: number) => (
    <G key={`${x}-${y}`} transform={`rotate(${r} ${x} ${y})`}>
      <Ellipse cx={x} cy={y} rx="6" ry="9" fill={LEAF} {...ink} />
      {[-4, -1, 2, 5].map((dx, i) => (
        <Circle key={dx} cx={x + dx} cy={y - 12 + Math.abs(i - 1.5)} r="1.8" fill={LEAF} stroke={OUTLINE} strokeWidth={1.2} />
      ))}
    </G>
  );
  return (
    <>
      {foot(16, 48, -12)}
      {foot(32, 32, 12)}
      {foot(48, 18, -12)}
    </>
  );
}

function SuperStar() {
  return (
    <>
      <Path d={starPath(32, 34, 26)} fill={colors.jgSun} {...ink} />
      <Path d="M22 6l5 7 5-9 5 9 5-7v10H22z" fill={colors.atPlum} {...ink} strokeWidth={1.8} />
      <SvgText x="32" y="42" fontSize="14" fontWeight="bold" fill={OUTLINE} textAnchor="middle">60</SvgText>
    </>
  );
}

const ART: Record<string, () => ReactNode> = {
  "ten-frame-explorer": Compass,
  "place-value-pro": BalanceScale,
  "feather-finder": Feather,
  "shell-seeker": Shell,
  "groups-guru": TwoGroups,
  "flower-planter": Flower,
  "soup-helper": SoupPot,
  "first-try-1": Target,
  "first-try-2": Target,
  "countdown-captain": NumberStones,
  "hand-measurer": HandRuler,
  "count-on-climber": CrateUp,
  "seed-sower": SeedHoles,
  "fair-sharer": FairPlates,
  "market-shopper": TenCoins,
  "time-keeper": ThreeOClock,
  "shape-builder": ShapeHouse,
  "never-give-up": Mountain,
  "busy-bee": Bee,
  "move-master": Footprints,
  "super-star": SuperStar,
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
