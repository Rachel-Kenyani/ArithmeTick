import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackButton from "@/components/ui/BackButton";
import SoundToggle from "@/components/top-bar/SoundToggle";
import StarsPill from "@/components/top-bar/StarsPill";
import TimePill from "@/components/top-bar/TimePill";

export interface AppTopBarProps {
  backLabel: string;
  onBack: () => void;
  stars: number;
  secondsLeft: number;
  onStarsPress?: () => void;
  timePaused?: boolean;
}

export default function AppTopBar({
  backLabel,
  onBack,
  stars,
  secondsLeft,
  onStarsPress,
  timePaused = false,
}: Readonly<AppTopBarProps>) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const roomy = width >= 380;

  return (
    <View style={[styles.topBar, { paddingTop: insets.top + 12, paddingHorizontal: roomy ? 16 : 12 }]}>
      <View style={styles.controls}>
        <BackButton label={backLabel} onPress={onBack} />
        <View style={[styles.actions, { gap: roomy ? 8 : 6 }]}>
          <SoundToggle />
          <StarsPill stars={stars} onPress={onStarsPress} />
          <TimePill secondsLeft={secondsLeft} paused={timePaused} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    zIndex: 20,
    paddingBottom: 10,
    width: "100%",
    maxWidth: 512,
    alignSelf: "center",
    backgroundColor: "rgba(0,79,74,0.65)",
  },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  actions: { flexShrink: 1, flexDirection: "row", alignItems: "center" },
});
