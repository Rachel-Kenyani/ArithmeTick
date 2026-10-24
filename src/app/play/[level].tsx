import { useLocalSearchParams } from "expo-router";

import PlayScreen from "@/features/play/PlayScreen";

export default function PlayPage() {
  const params = useLocalSearchParams<{ level: string }>();
  // "/play/2" → 2. Anything else ("/play/abc", "/play/1.5") becomes 0, which is never playable,
  // so PlayScreen sends the child back to the map instead of guessing a level.
  const raw = Array.isArray(params.level) ? params.level[0] : params.level;
  const parsed = Number(raw);
  const levelNumber = Number.isInteger(parsed) ? parsed : 0;
  // Remount per level so every level starts fresh.
  return <PlayScreen key={levelNumber} levelNumber={levelNumber} />;
}
