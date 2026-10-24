/**
 * Splash intro — the frame-1 "arithmetick" wordmark under the owl.
 */

import Svg, { Circle, G, Path } from "react-native-svg";

import { WORD_DOT_Y, WORD_LETTERS } from "../art/wordmarkArt";
import { LOGO_W, PURPLE, TEAL, WORD_H, WORD_TOP } from "../constants";

/** "arithmetick" wordmark from Logo-splash-1 (y 104…165 of the artboard). */
export default function Wordmark({ width }: Readonly<{ width: number }>) {
  return (
    <Svg
      width={width}
      height={(width * WORD_H) / LOGO_W}
      viewBox={`0 ${WORD_TOP} ${LOGO_W} ${WORD_H}`}
    >
      <G fill={TEAL}>
        {WORD_LETTERS.map((letter) => (
          <Path key={letter.cx} d={letter.d} />
        ))}
      </G>
      {WORD_LETTERS.map((letter) =>
        letter.dot ? (
          <Circle
            key={letter.dot}
            cx={letter.dot}
            cy={WORD_DOT_Y}
            r={7.04}
            fill={PURPLE}
          />
        ) : null,
      )}
    </Svg>
  );
}
