/** The sun-yellow "Play" pill hanging off the stop to play now. */

import { StyleSheet, Text, View } from "react-native";

import { PlayIcon } from "@/components/ui/icons";
import SpringIn from "@/features/home/components/level-node/SpringIn";
import { colors, fonts } from "@/theme";

/** The "Play" pill under the stop to play now. */
export default function PlayPill({ reduceMotion }: Readonly<{ reduceMotion: boolean }>) {
  return (
    <SpringIn animate reduce={false} from={{ scale: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -8 }} delay={200}>
      <View style={styles.playWrap}>
        <View style={styles.playEdge} />
        <View style={styles.play}>
          <PlayIcon size={16} fill="currentColor" strokeWidth={1.5} color={colors.jgOutline} />
          <Text style={styles.playText}>Play</Text>
        </View>
      </View>
    </SpringIn>
  );
}

const styles = StyleSheet.create({
  playWrap: { paddingBottom: 4 },
  playEdge: { ...StyleSheet.absoluteFill, top: 4, borderRadius: 999, backgroundColor: "#c99a1c" },
  play: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: colors.jgSun,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 14,
  },
  playText: { fontFamily: fonts.headingBold, fontSize: 19, lineHeight: 22, color: colors.jgOutline },
});
