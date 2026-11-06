import { memo } from "react";

import { storyFor } from "@/data/stories";
import Grade1TakeAway from "@/features/play/games/take-away/Grade1TakeAway";
import Grade1TenFrame from "@/features/play/games/ten-frame/Grade1TenFrame";
import Grade3ColumnSub from "@/features/play/games/place-value/Grade3ColumnSub";
import Grade3Columns from "@/features/play/games/place-value/Grade3Columns";
import Grade2NumberTrack from "@/features/play/games/number-track/Grade2NumberTrack";
import Grade2PlaceValue from "@/features/play/games/place-value/Grade2PlaceValue";
import Grade2Groups from "@/features/play/games/groups/Grade2Groups";
import Grade2Halves from "@/features/play/games/halves/Grade2Halves";
import Grade2Clock from "@/features/play/games/clock/Grade2Clock";
import Grade3Hundreds from "@/features/play/games/place-value/Grade3Hundreds";
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
      if (level.game === "numberTrack") return <Grade2NumberTrack key={key} {...shared} from={level.puzzle.from} gaps={level.puzzle.gaps} step={level.puzzle.step} />;
      if (level.game === "groups") return <Grade2Groups key={key} {...shared} groups={level.puzzle.groups} each={level.puzzle.each} />;
      if (level.game === "halves") return <Grade2Halves key={key} {...shared} total={level.puzzle.total} />;
      return <Grade2Clock key={key} {...shared} hour={level.puzzle.hour} />;
    case 3:
      if (level.game === "columns" && level.puzzle.op === "sub") return <Grade3ColumnSub key={key} {...shared} op="sub" a={level.puzzle.a} b={level.puzzle.b} />;
      if (level.game === "columns") return <Grade3Columns key={key} {...shared} op={level.puzzle.op} a={level.puzzle.a} b={level.puzzle.b} />;
      if (level.game === "hundreds") return <Grade3Hundreds key={key} {...shared} a={level.puzzle.a} />;
      if (level.game === "numberTrack") return <Grade2NumberTrack key={key} {...shared} grade={3} from={level.puzzle.from} gaps={level.puzzle.gaps} step={level.puzzle.step} />;
      return <Grade3ArrayMultiplication key={key} {...shared} rows={level.puzzle.rows} cols={level.puzzle.cols} />;
  }
});

export default LevelContent;
