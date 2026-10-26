/** /badges — placeholder until the badge collection is built. */

import ComingSoonTab from "@/features/home/components/ComingSoonTab";
import { MedalIcon } from "@/components/ui/icons";
import { colors } from "@/theme";

export default function BadgesScreen() {
  return (
    <ComingSoonTab
      tab="badges"
      title="Badges"
      icon={<MedalIcon size={34} strokeWidth={2.2} color={colors.white} />}
      message="Finish levels to win badges. They will show up here."
    />
  );
}
