/**
 * ScreenShell — the standard app-shell screen: JungleBackdrop + a safe-area padded, scrollable column.
 *
 *  - `align="center"` centres back button + content vertically; `align="top"` stacks from the top.
 *  - The keyboard pushes the content up (KeyboardAvoidingView) so form fields stay visible.
 *  - Bottom padding clears the grass; on short phones the content scrolls.
 */

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

import BackButton from "@/components/ui/BackButton";
import JungleBackdrop from "@/components/backdrops/JungleBackdrop";
import { ROUTES } from "@/constants/routes";

export interface ScreenShellProps {
  children: ReactNode;
  /** Show the yellow back button. A route = go there; true = router.back() with /welcome fallback. */
  back?: Href | boolean;
  align?: "center" | "top";
  /** Max width of the content column (default 448 ≈ 28rem). */
  maxWidth?: number;
  grass?: boolean;
  canopy?: boolean;
  /** A full-screen background image (cover) in place of the drawn JungleBackdrop; `grass`/`canopy` then only set spacing. */
  backgroundImage?: ImageSourcePropType;
  /** Pinned above the scrolling column (e.g. the app top bar, which handles the status bar inset itself). */
  header?: ReactNode;
  /** Pinned under the scrolling column, on the same background (e.g. the bottom tab bar). */
  footer?: ReactNode;
  /** Spacing between children (default 24). */
  gap?: number;
  style?: StyleProp<ViewStyle>;
}

export default function ScreenShell({
  children,
  back,
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
              maxWidth,
              justifyContent: align === "center" ? "center" : "flex-start",
            },
          ]}
        >
          {back ? (
            <View style={styles.back}>
              <BackButton
                href={typeof back === "boolean" ? undefined : back}
                fallbackHref={ROUTES.welcome}
              />
            </View>
          ) : null}
          <View style={[{ gap }, align === "top" && styles.fill, style]}>
            {children}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
  return backgroundImage ? (
    <View style={styles.fill}>
      <Image
        source={backgroundImage}
        resizeMode="cover"
        style={styles.backgroundImage}
      />
      {header}
      {content}
      {footer}
    </View>
  ) : (
    <JungleBackdrop grass={grass} canopy={canopy}>
      {header}
      {content}
      {footer}
    </JungleBackdrop>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // Explicit 100% size: with only absoluteFill the image can render at its intrinsic pixel size (zoomed in)
  backgroundImage: { ...StyleSheet.absoluteFill, width: "100%", height: "100%" },
  scroll: { flexGrow: 1, alignItems: "center" },
  column: { width: "100%", flexGrow: 1 },
  back: { marginBottom: 20, alignSelf: "flex-start" },
});
