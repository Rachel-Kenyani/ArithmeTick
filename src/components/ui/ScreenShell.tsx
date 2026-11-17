import type { ReactNode } from "react";
import {
  Image,
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
import BackButton from "@/components/ui/BackButton";
import JungleBackdrop from "@/components/backdrops/JungleBackdrop";
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
  const content = (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: header ? 16 : insets.top + 16,
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
            {back ? (
              <View style={styles.backRow}>
                <BackButton
                  href={typeof back === "boolean" ? undefined : back}
                  fallbackHref={ROUTES.welcome}
                />
                {backTrailing}
              </View>
            ) : null}
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
      <Image
        source={picture}
        resizeMode="cover"
        style={styles.backgroundImage}
      />
      {header}
      {content}
      {footer}
      {header ? null : <StatusBarShield />}
    </View>
  ) : (
    <JungleBackdrop grass={grass} canopy={canopy}>
      {header}
      {content}
      {footer}
      {header ? null : <StatusBarShield />}
    </JungleBackdrop>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backgroundImage: { ...StyleSheet.absoluteFill, width: "100%", height: "100%" },
  scroll: { flexGrow: 1, alignItems: "center" },
  column: { width: "100%", flexGrow: 1 },
  scaledInner: { width: "100%" },
  backRow: { marginBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
});
