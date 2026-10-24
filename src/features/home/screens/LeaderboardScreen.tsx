/** /leaderboard — placeholder until the leaderboard is built. */

import ComingSoonTab from "@/features/home/components/ComingSoonTab";
import { TrophyIcon } from "@/components/ui/icons";
import { colors } from "@/theme";

export default function LeaderboardScreen() {
  return (
    <ComingSoonTab
      tab="score"
      title="Score"
      icon={<TrophyIcon size={34} strokeWidth={2.2} color={colors.white} />}
      message="See how your stars stack up with other explorers. It's on its way!"
    />
  );
}
