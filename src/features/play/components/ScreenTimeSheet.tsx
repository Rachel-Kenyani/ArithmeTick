/**
 * ScreenTimeSheet — daily cap reached: a warm stop, never a punishment.
 */

import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Twinkle, { TWINKLES, twinkleKey } from "@/features/play/components/Twinkle";
import BrijoMascot from "@/components/mascot/BrijoMascot";
import Button from "@/components/ui/Button";
import { HomeIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

export default function ScreenTimeSheet({ onBack, reduced }: Readonly<{ onBack: () => void; reduced: boolean }>) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const sm = width >= 640;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.sheetOverlay, sm ? styles.sheetOverlaySm : null]}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      accessibilityViewIsModal
    >
      <View style={[StyleSheet.absoluteFill, styles.sheetScrim]} />

      <Animated.View
        accessibilityRole="none"
        accessibilityLabel="That's today's screen time! Go play outside. Brijo will be here tomorrow."
        style={[
          styles.sheet,
          sm ? styles.sheetSm : styles.sheetPhone,
          { paddingBottom: sm ? 32 : insets.bottom + 24 },
        ]}
        entering={reduced ? FadeIn : SlideInDown.springify().stiffness(260).damping(30)}
        exiting={reduced ? FadeOut : SlideOutDown}
      >
        {/* moon + twinkles behind a sleepy Brijo */}
        <View style={styles.moonStage} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <View style={styles.moon}>
            <View style={styles.moonShade} />
          </View>
          {TWINKLES.map((pos, i) => (
            <Twinkle key={twinkleKey(pos)} index={i} reduced={reduced} pos={pos} />
          ))}
          <BrijoMascot mood="sleep" size={140} />
        </View>

        <Text accessibilityRole="header" style={[styles.sheetTitle, { fontSize: sm ? 36 : 32 }]}>
          That&apos;s today&apos;s screen time!
        </Text>
        <Text style={styles.sheetCopy}>Go play outside. Brijo will be here tomorrow.</Text>

        <Button variant="teal" icon={<HomeIcon color={colors.white} />} trailing="chevron" onPress={onBack}>
          Back to map
        </Button>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheetOverlay: { zIndex: 70, alignItems: "center", justifyContent: "flex-end" },
  sheetOverlaySm: { justifyContent: "center", padding: 24 },
  sheetScrim: { backgroundColor: "rgba(22,42,85,0.72)" },
  sheet: {
    width: "100%",
    maxWidth: 448,
    alignItems: "center",
    backgroundColor: colors.jgCard,
    paddingHorizontal: 24,
    paddingTop: 16,
    shadowColor: "#003c5a",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  sheetPhone: { borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  sheetSm: { borderRadius: 32 },
  moonStage: { marginTop: -80, marginBottom: 4, height: 150, width: 280, alignItems: "center", justifyContent: "flex-end" },
  moon: {
    position: "absolute",
    top: 0,
    right: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffd54a",
    borderWidth: 3,
    borderColor: colors.jgOutline,
    overflow: "hidden",
    shadowColor: "#ffd54a",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  moonShade: { position: "absolute", top: -2, left: -2, width: 36, height: 40, borderRadius: 20, backgroundColor: "#fff2b0" },
  sheetTitle: { fontFamily: fonts.headingBold, lineHeight: 38, color: colors.atTeal, textAlign: "center" },
  sheetCopy: {
    marginTop: 8,
    marginBottom: 24,
    fontFamily: fonts.bodyMedium,
    fontSize: 18,
    lineHeight: 24,
    color: colors.jgOutline,
    textAlign: "center",
  },
});
