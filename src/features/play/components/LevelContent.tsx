/**
 * LevelContent — the canvas content: the grade module (with its puzzle params) or the Physical Quest.
 */

import { memo } from "react";

import { storyFor } from "@/data/stories";
import Grade1TakeAway from "@/features/play/games/take-away/Grade1TakeAway";
import Grade1TenFrame from "@/features/play/games/ten-frame/Grade1TenFrame";
import Grade2NumberTrack from "@/features/play/games/number-track/Grade2NumberTrack";
import Grade2PlaceValue from "@/features/play/games/place-value/Grade2PlaceValue";
import Grade2Stub from "@/features/play/games/grade2/Grade2Stub";
import Grade3ArrayMultiplication from "@/features/play/games/array-multiplication/Grade3ArrayMultiplication";
import PhysicalQuestOverlay from "@/features/play/components/PhysicalQuestOverlay";
import type { LevelDef } from "@/data/levels";
import type { GradeModuleProps } from "@/types/domain";

interface LevelContentProps {
  level: LevelDef;
  palActive: boolean;
  waiting?: boolean;
  onStruggle: () => void;
  onAttempt: NonNullable<GradeModuleProps["onAttempt"]>;
  onDone: () => void;
  childName: string;
  draft?: GradeModuleProps["draft"];
  onDraft: NonNullable<GradeModuleProps["onDraft"]>;
}

/**
 * Memoised: the screen re-renders every second while screen time ticks, but every prop here is
 * stable (level comes from the LEVELS table, callbacks are useCallback'd), so the grade module is
 * left alone mid-drag.
 */
const LevelContent = memo(function LevelContent({ level, childName, palActive, waiting, onStruggle, onAttempt, onDone, draft, onDraft }: Readonly<LevelContentProps>) {
  const key = `g${level.grade}-l${level.number}`;
  if (level.kind === "quest") return <PhysicalQuestOverlay key={key} grade={level.grade} task={level.task} childName={childName} story={storyFor(level.grade, level.number)?.ask} levelNumber={level.number} onConfirmed={onDone} />;

  const item = storyFor(level.grade, level.number)?.treasure ?? "cap";
  const shared = { item, level: level.number, palActive, waiting, onStruggle, onAttempt, onSolved: onDone, draft, onDraft };
  switch (level.grade) {
    case 1:
      if (level.game === "takeAway") return <Grade1TakeAway key={key} {...shared} start={level.puzzle.start} away={level.puzzle.away} />;
      return <Grade1TenFrame key={key} {...shared} target={level.puzzle.target} />;
    case 2:
      if (level.game === "placeValue") return <Grade2PlaceValue key={key} {...shared} op={level.puzzle.op} a={level.puzzle.a} b={level.puzzle.b} />;
      if (level.game === "numberTrack") return <Grade2NumberTrack key={key} {...shared} from={level.puzzle.from} gaps={level.puzzle.gaps} />;
      return <Grade2Stub key={key} {...shared} goal={level.puzzle.goal} />;
    case 3:
      return <Grade3ArrayMultiplication key={key} {...shared} rows={level.puzzle.rows} cols={level.puzzle.cols} />;
  }
});

export default LevelContent;
