/**
 * ComingSoonTab — a placeholder screen for a bottom-tab destination that isn't built yet (Badges, Score).
 *
 * Same shell as /home (meadow backdrop + bottom tab bar), a heading, Brijo and a short friendly note.
 * Switching tabs never stacks screens: "Map" returns to the existing /home, the other tab replaces this one.
 */

import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import BrijoHeadArt from "@/components/mascot/BrijoHeadArt";
import BottomNav, { navigateToTab, type BottomTab } from "@/features/home/components/BottomNav";
import StatusBarScrim from "@/features/home/components/StatusBarScrim";
import Panel from "@/components/ui/Panel";
import SplashBackdrop, { HOME_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import { useGuard } from "@/hooks/useGuard";
import { colors, fonts } from "@/theme";

export interface ComingSoonTabProps {
  tab: Exclude<BottomTab, "map">;
  title: string;
  icon: ReactNode;
  message: string;
}

export default function ComingSoonTab({ tab, title, icon, message }: Readonly<ComingSoonTabProps>) {
  const ready = useGuard("profile");
  const insets = useSafeAreaInsets();
  if (!ready) return <SplashBackdrop source={HOME_BACKGROUND} />;

  return (
    <SplashBackdrop source={HOME_BACKGROUND}>
      <StatusBar style="dark" />
      <StatusBarScrim />
      <View style={[styles.body, { paddingTop: insets.top + 24 }]}>
        <Panel style={styles.card}>
          <View style={styles.iconBadge} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {icon}
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <BrijoHeadArt width={120} />
          <Text style={styles.soon}>Coming soon!</Text>
          <Text style={styles.message}>{message}</Text>
        </Panel>
      </View>
      <BottomNav active={tab} onNavigate={navigateToTab} />
    </SplashBackdrop>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, justifyContent: "center", paddingBottom: 24 },
  card: { width: "100%", maxWidth: 448, alignSelf: "center", alignItems: "center", gap: 12, paddingVertical: 28 },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.atPurple,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: fonts.headingBold, fontSize: 28, color: colors.atTeal, textAlign: "center" },
  soon: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.atPurple, textAlign: "center" },
  // #3c3c3c on the mint card ≈ 10:1
  message: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 22, color: "#3c3c3c", textAlign: "center" },
});
