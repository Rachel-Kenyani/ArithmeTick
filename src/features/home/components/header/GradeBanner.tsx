/** The home-screen continue card: the current lesson is the clearest action on the map. */

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

export default function GradeBanner({
  grade,
  completed,
  total,
}: Readonly<GradeBannerProps>) {
  const meta = GRADE_META[grade];
  const { width } = useWindowDimensions();
  const tablet = width >= 640;
  const progress = `${completed} of ${total}`;

  return (
    <View style={[styles.wrap, { paddingHorizontal: tablet ? 24 : 16 }]}>
      <Panel variant="card" halo={false} style={styles.card}>
        <View
          style={styles.summary}
          accessibilityRole="header"
          accessibilityLabel={`${meta.shortLabel}, ${meta.mechanic}. ${progress} levels complete`}
        >
          <View>
            <Text style={styles.eyebrow}>
              {meta.shortLabel} · {meta.mechanic}
            </Text>
          </View>
          <View
            style={styles.pips}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {Array.from({ length: total }, (_, index) => (
              <View
                key={index}
                style={[styles.pip, pipStyle(index, completed)]}
              />
            ))}
          </View>
        </View>
        {completed === total ? (
          <Text style={styles.complete}>This world is complete!</Text>
        ) : null}
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", maxWidth: 512, alignSelf: "center", paddingTop: 12 },
  card: { gap: 10, paddingHorizontal: 16 },
  summary: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    color: colors.atTeal,
  },
  progressText: {
    fontFamily: fonts.headingBold,
    fontSize: 19,
    lineHeight: 23,
    color: colors.atTeal,
    fontVariant: ["tabular-nums"],
  },
  pips: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0 },
  pip: { height: 10, borderRadius: 999, borderWidth: 1 },
  pipDone: { width: 20, backgroundColor: colors.jgSun, borderColor: "#c99a1c" },
  pipNow: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.jgTeal,
  },
  pipTodo: {
    width: 10,
    backgroundColor: colors.white,
    borderColor: colors.jgField,
  },
  complete: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    color: colors.atTeal,
    textAlign: "center",
  },
});
