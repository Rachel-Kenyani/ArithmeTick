/** The mint grade banner: "Grade 2" over "Balance Scale", with "2 of 6 done" and six progress pips. */

import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import Panel from "@/components/ui/Panel";
import { GRADE_META, type Grade } from "@/types/domain";
import { colors, fonts } from "@/theme";

export interface GradeBannerProps {
  grade: Grade;
  completed: number;
  total: number;
}

function pipStyle(index: number, completed: number) {
  if (index < completed) return styles.pipDone;
  return index === completed ? styles.pipNow : styles.pipTodo;
}

export default function GradeBanner({ grade, completed, total }: Readonly<GradeBannerProps>) {
  const meta = GRADE_META[grade];
  const { width } = useWindowDimensions();
  const roomy = width >= 380;
  const sm = width >= 640;
  let bannerTitleSize = 21;
  if (sm) bannerTitleSize = 25;
  else if (roomy) bannerTitleSize = 23;

  return (
    <View style={[styles.bannerWrap, { paddingHorizontal: sm ? 24 : 16 }]}>
      <Panel
        variant="pill"
        style={[
          styles.banner,
          { paddingVertical: sm ? 10 : 8, paddingLeft: sm ? 24 : 20 },
        ]}
      >
        <View style={styles.bannerText} accessible accessibilityRole="header" accessibilityLabel={`${meta.shortLabel}, ${meta.mechanic}. ${completed} of ${total} levels done`}>
          <Text style={styles.bannerEyebrow}>{meta.shortLabel}</Text>
          <Text numberOfLines={1} style={[styles.bannerTitle, { fontSize: bannerTitleSize }]}>
            {meta.mechanic}
          </Text>
        </View>
        {/* Already spoken by the header above */}
        <View style={styles.progress} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.progressText}>
            {completed} of {total}
          </Text>
          <View style={styles.pips}>
            {Array.from({ length: total }, (_, i) => (
              <View
                key={i}
                style={[styles.pip, pipStyle(i, completed)]}
              />
            ))}
          </View>
        </View>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { width: "100%", maxWidth: 512, alignSelf: "center", paddingTop: 20 },
  banner: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 12, paddingRight: 16 },
  bannerText: { flex: 1, minWidth: 0 },
  bannerEyebrow: { fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 17, color: colors.atTeal },
  bannerTitle: { fontFamily: fonts.headingBold, color: colors.atTeal },
  progress: { flexShrink: 0, alignItems: "flex-end", gap: 6 },
  progressText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.atTeal, fontVariant: ["tabular-nums"] },
  pips: { flexDirection: "row", alignItems: "center", gap: 4 },
  pip: { height: 10, borderRadius: 999, borderWidth: 1 },
  pipDone: { width: 20, backgroundColor: colors.jgSun, borderColor: "#c99a1c" },
  pipNow: { width: 20, backgroundColor: colors.jgTeal, borderColor: colors.jgTealEdge },
  pipTodo: { width: 10, backgroundColor: colors.white, borderColor: colors.jgField },
});
