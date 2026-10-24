/** The home top bar on the sky: explorer switcher, stars and screen time (docs/APP-SHELL.md §5 "Home"). */

import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ExplorerChip from "@/features/home/components/header/ExplorerChip";
import StarsPill from "@/features/home/components/header/StarsPill";
import TimePill from "@/features/home/components/header/TimePill";
import type { ChildProfile } from "@/types/models";

export interface HomeTopBarProps {
  profile: ChildProfile;
  secondsLeft: number;
  onSwitchExplorer: () => void;
}

export default function HomeTopBar({ profile, secondsLeft, onSwitchExplorer }: Readonly<HomeTopBarProps>) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const roomy = width >= 380;
  const sm = width >= 640;

  return (
    <View
      style={[
        styles.topBar,
        { paddingTop: insets.top + 12, paddingHorizontal: roomy ? 16 : 12, gap: sm ? 12 : 8 },
      ]}
    >
      <ExplorerChip profile={profile} onPress={onSwitchExplorer} />

      <View style={[styles.right, { gap: roomy ? 8 : 6 }]}>
        <StarsPill stars={profile.stars} />

        <TimePill secondsLeft={secondsLeft} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingBottom: 12 , backgroundColor:"#D6F4DE", width: "100%", maxWidth: 512, alignSelf: "center", flexDirection: "row", alignItems: "center" },
  right: { marginLeft: "auto", flexShrink: 0, flexDirection: "row", alignItems: "center" },
});
