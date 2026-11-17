import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Href } from "expo-router";

import Scaled from "@/components/ui/Scaled";
import { useUiScale } from "@/hooks/useUiScale";
import StatusBarShield from "@/components/top-bar/StatusBarShield";
import { TOP_BAR_SHIELD } from "@/components/top-bar/constants";
import BackButton from "@/components/ui/BackButton";
import JungleBackdrop from "@/components/backdrops/JungleBackdrop";
import SplashBackdrop from "@/components/backdrops/SplashBackdrop";
import { ROUTES } from "@/constants/routes";

export interface ScreenShellProps {
  children: ReactNode;
  back?: Href | boolean;
  /** Sits on the right of the back button's row, such as the Parents Gate badge. */
  backTrailing?: ReactNode;
  align?: "center" | "top";
  maxWidth?: number;
  grass?: boolean;
  canopy?: boolean;
  backgroundImage?: ImageSourcePropType;
  header?: ReactNode;
  footer?: ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}

export default function ScreenShell({
  children,
  back,
  backTrailing,
  align = "center",
  maxWidth = 448,
  grass = true,
  canopy = true,
  gap = 24,
  style,
  backgroundImage,
  header,
  footer,
}: Readonly<ScreenShellProps>) {
  const insets = useSafeAreaInsets();
  const scale = useUiScale();
  const picture = backgroundImage ?? null;
  const topBar = back ? (
    <View style={[styles.topBar, { paddingTop: insets.top + 12, paddingLeft: Math.max(16, insets.left), paddingRight: Math.max(16, insets.right) }]}>
      <Scaled style={[styles.topBarColumn, { maxWidth: maxWidth * scale }]} innerStyle={styles.backRow}>
        <BackButton href={typeof back === "boolean" ? undefined : back} fallbackHref={ROUTES.welcome} />
        {backTrailing}
      </Scaled>
    </View>
  ) : null;
  const bar = header ?? topBar;
  const content = (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: bar ? 16 : insets.top + 16,
            paddingBottom: insets.bottom + (grass ? 64 : 24),
            paddingLeft: Math.max(16, insets.left),
            paddingRight: Math.max(16, insets.right),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          style={[
            styles.column,
            {
              maxWidth: maxWidth * scale,
              justifyContent: align === "center" ? "center" : "flex-start",
            },
          ]}
        >
          <Scaled style={align === "top" && scale === 1 ? styles.fill : undefined} innerStyle={styles.scaledInner}>
            <View style={[{ gap }, align === "top" && styles.fill, style]}>
              {children}
            </View>
          </Scaled>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
  return picture ? (
    <View style={styles.fill}>
      <SplashBackdrop source={picture} />
      {bar}
      {content}
      {footer}
      {bar ? null : <StatusBarShield />}
    </View>
  ) : (
    <JungleBackdrop grass={grass} canopy={canopy}>
      {bar}
      {content}
      {footer}
      {bar ? null : <StatusBarShield />}
    </JungleBackdrop>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: "center" },
  column: { width: "100%", flexGrow: 1 },
  scaledInner: { width: "100%" },
  topBar: { zIndex: 20, width: "100%", paddingBottom: 10, backgroundColor: TOP_BAR_SHIELD },
  topBarColumn: { width: "100%", alignSelf: "center" },
  backRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
});
