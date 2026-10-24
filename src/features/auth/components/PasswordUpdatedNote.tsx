/**
 * "Password updated" pill shown in the back-button row of Log In after a reset.
 */

import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeOutUp, ReduceMotion, ZoomIn } from "react-native-reanimated";

import { CheckIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

const NOTE_IN = ZoomIn.springify().stiffness(420).damping(30).reduceMotion(ReduceMotion.System);
const NOTE_OUT = FadeOutUp.duration(200).reduceMotion(ReduceMotion.System);

export default function PasswordUpdatedNote() {
  return (
    <Animated.View entering={NOTE_IN} exiting={NOTE_OUT} pointerEvents="none" style={styles.noteWrap}>
      <View style={styles.note}>
        <View style={styles.noteBadge}>
          <CheckIcon size={18} strokeWidth={3} color={colors.white} />
        </View>
        <Text style={styles.noteText}>Password updated</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Centred in the back-button row (the shell puts the 70px back button + 20px gap above the content).
  noteWrap: { position: "absolute", top: -78, left: 80, right: 80, height: 64, alignItems: "center", justifyContent: "center", zIndex: 50 },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 16,
    borderWidth: 2,
    borderColor: "rgba(0,150,138,0.3)",
    shadowColor: "#003c5a",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  noteBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.jgTeal, alignItems: "center", justifyContent: "center" },
  noteText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.atInk },
});
