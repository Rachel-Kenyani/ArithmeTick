/**
 * Splash intro — frame 14's wordmark, returning letter by letter between the branch and the grass.
 */

import { View } from "react-native";

import { WORD_LETTERS } from "../art/wordmarkArt";
import { FINALE_LOGO, FINALE_WORD_Y } from "../constants";
import { FINALE_AT, reducedFinaleAt, T } from "../timeline/timeline";
import FinaleLetter from "./FinaleLetter";

export default function FinaleWordmark({
  W,
  H,
  finaleW,
  reduce,
}: Readonly<{ W: number; H: number; finaleW: number; reduce: boolean }>) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: (W - finaleW) / 2,
        top:
          FINALE_WORD_Y * H - (finaleW * FINALE_LOGO.h) / FINALE_LOGO.w / 2,
        width: finaleW,
        height: (finaleW * FINALE_LOGO.h) / FINALE_LOGO.w,
      }}
    >
      {WORD_LETTERS.map((letter, i) => (
        <FinaleLetter
          key={letter.cx}
          letter={letter}
          index={i}
          width={finaleW}
          startAt={reduce ? reducedFinaleAt(T) : FINALE_AT + 150}
          reduce={reduce}
        />
      ))}
    </View>
  );
}
