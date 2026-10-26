/** The home top bar keeps profile navigation, stars and the practical-break timer in one compact row. */

import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackButton from "@/components/ui/BackButton";
import StarsPill from "@/features/home/components/header/StarsPill";
import TimePill from "@/features/home/components/header/TimePill";

export interface HomeTopBarProps {
  stars: number;
  secondsLeft: number;
  onBack: () => void;
  onStarsPress: () => void;
}

export default function HomeTopBar({ stars, secondsLeft, onBack, onStarsPress }: Readonly<HomeTopBarProps>) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const roomy = width >= 380;

  return (
    <View
      style={[
        styles.topBar,
        { paddingTop: insets.top + 12, paddingHorizontal: roomy ? 16 : 12 },
      ]}
    >
      <View style={styles.controls}>
        <BackButton label="Choose another explorer" onPress={onBack} />
        <View style={[styles.actions, { gap: roomy ? 8 : 6 }]}>
          <StarsPill stars={stars} onPress={onStarsPress} />
          <TimePill secondsLeft={secondsLeft} compact={width < 360} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingBottom: 10,
    width: "100%",
    maxWidth: 512,
    alignSelf: "center",
    backgroundColor: "rgba(0,79,74,0.65)",
  },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  actions: { flexShrink: 1, flexDirection: "row", alignItems: "center", gap: 8 },
});
