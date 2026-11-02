import { useLocalSearchParams } from "expo-router";

import PlayScreen from "@/features/play/PlayScreen";

export default function PlayPage() {
  const params = useLocalSearchParams<{ level: string }>();
  const raw = Array.isArray(params.level) ? params.level[0] : params.level;
  const parsed = Number(raw);
  const levelNumber = Number.isInteger(parsed) ? parsed : 0;
  return <PlayScreen key={levelNumber} levelNumber={levelNumber} />;
}
