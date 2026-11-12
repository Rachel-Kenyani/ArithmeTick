import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { colors, fonts } from "@/theme";

const RING = 92;

/**
 * The teal banner at the top of the Badges and Stars tabs: a progress ring, the screen's title and a short line.
 * The title sits on solid teal so it stays readable over the jungle background.
 */
export default function HeroBanner({
  title,
  subtitle,
  value,
  total,
  ringLabel,
  children,
}: Readonly<{ title: string; subtitle: string; value: number; total: number; ringLabel: string; children?: ReactNode }>) {
  const r = RING / 2 - 7;
  const length = 2 * Math.PI * r;
  return (
    <View style={styles.hero}>
      <Sparkles />
      <View style={styles.heroRow}>
        <View style={{ width: RING, height: RING }} accessible accessibilityLabel={ringLabel}>
          <Svg width={RING} height={RING}>
            <Circle cx={RING / 2} cy={RING / 2} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth={10} fill="none" />
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={r}
              stroke={colors.jgSun}
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(length * Math.min(value, total)) / Math.max(1, total)} ${length}`}
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          </Svg>
          <View style={styles.ringLabel}>
            <Text style={styles.ringValue}>{value}</Text>
            <Text style={styles.ringTotal}>{`of ${total}`}</Text>
          </View>
        </View>
        <View style={styles.heroText}>
          <Text accessibilityRole="header" style={styles.heroTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.heroSub}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

/** A lighter box inside the banner: a small gold label, a line, and an optional detail. Tappable when given onPress. */
export function HeroCallout({ label, title, detail, onPress, accessibilityLabel }: Readonly<{ label: string; title: string; detail?: string; onPress?: () => void; accessibilityLabel?: string }>) {
  const body = (
    <>
      <Text style={styles.calloutLabel}>{label}</Text>
      <Text style={styles.calloutTitle} numberOfLines={1}>
        {title}
      </Text>
      {detail ? (
        <Text style={styles.calloutDetail} numberOfLines={1}>
          {detail}
        </Text>
      ) : null}
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.callout} accessible accessibilityLabel={accessibilityLabel}>
        {body}
      </View>
    );
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [styles.callout, pressed ? styles.pressed : null]}>
      {body}
    </Pressable>
  );
}

function Sparkles() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path d="M300 18l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={colors.jgSun} opacity={0.9} />
      <Path d="M262 70l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill={colors.white} opacity={0.6} />
      <Circle cx={326} cy={86} r={3} fill={colors.atYellowSoft} opacity={0.7} />
      <Circle cx={24} cy={16} r={2.5} fill={colors.white} opacity={0.5} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  pressed: { transform: [{ scale: 0.96 }] },
  hero: { overflow: "hidden", borderRadius: 28, backgroundColor: colors.atTeal, padding: 18, gap: 14, borderWidth: 3, borderColor: "rgba(255,255,255,0.35)" },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  ringLabel: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  ringValue: { fontFamily: fonts.headingBold, fontSize: 30, lineHeight: 34, color: colors.white },
  ringTotal: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.atYellowSoft },
  heroText: { flex: 1, gap: 4 },
  heroTitle: { fontFamily: fonts.body, fontSize: 26, lineHeight: 30, color: colors.white },
  heroSub: { fontFamily: fonts.headingBold, fontSize: 16, color: colors.atYellowSoft },
  callout: { backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
  calloutLabel: { fontFamily: fonts.headingBold, fontSize: 12, letterSpacing: 1, color: colors.jgSun },
  calloutTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.white },
  calloutDetail: { fontFamily: fonts.headingBold, fontSize: 14, color: "rgba(255,255,255,0.85)" },
});
