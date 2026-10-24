/**
 * Splash intro — the big owl's wings, body and feet (Logo-splash-9), drawn inside BigOwl's fading body layer.
 */

import { Path, Rect } from "react-native-svg";

import { GOLD, PURPLE, PURPLE_DARK, TEAL } from "../constants";

export default function BigOwlBody() {
  const foot = (x: number) => (
    <Rect
      key={x}
      x={x}
      y={286.42}
      width={13.78}
      height={32.94}
      rx={6.89}
      fill={GOLD}
      stroke="#000"
      strokeWidth={2}
    />
  );
  const chevron = (x: number, y: number) => (
    <Path
      key={`${x}-${y}`}
      d={`M${x} ${y}h31.56l-15.21 23.1Z`}
      fill={PURPLE}
      stroke="#000"
      strokeWidth={3}
      strokeLinejoin="round"
    />
  );
  return (
    <>
      {[73.66, 89.44, 105.22, 132.27, 148.04, 163.82].map(foot)}
      <Path
        d="M90.13 211.6C107.93 241.61 123.82 271.53 107.04 281.48C83.93 281.48 53.83 269.78 36.03 239.78C18.24 209.78 25.89 183.43 39.98 171.03C56.88 172.72 72.33 181.6 90.13 211.6Z"
        fill={PURPLE_DARK}
        stroke="#000"
        strokeWidth={4}
      />
      <Path
        d="M162.94 211.6C145.15 241.61 129.26 271.53 146.04 281.48C169.14 281.48 199.24 269.78 217.04 239.78C234.84 209.78 226.5 183.43 212.41 171.03C195.51 172.72 180.74 181.6 162.94 211.6Z"
        fill={PURPLE_DARK}
        stroke="#000"
        strokeWidth={4}
      />
      <Path
        d="M39.98 171.03H212.41L126.19 319.8Z"
        fill={TEAL}
        stroke="#000"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {[
        [72.1, 191.88],
        [109.34, 192.46],
        [146.58, 193.03],
        [128.5, 218.38],
        [110.46, 244.3],
        [91.31, 218.38],
      ].map(([x, y]) => chevron(x, y))}
    </>
  );
}
