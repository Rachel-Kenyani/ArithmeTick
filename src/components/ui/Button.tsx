/**
 * The chunky jungle button from the onboarding mockups.
 *
 *   <Button icon={<RouteIcon />} trailing="chevron" onPress={…}>I'm New Here!</Button>
 *   <Button variant="white" icon={<GoogleIcon />}>Continue with Google</Button>
 *   <Button trailing="arrow" loading={busy} onPress={submit}>Log In</Button>
 *
 * - Quicksand label, white on teal / purple, black on white / sun; icon + label + trailing glyph centred.
 * - A solid bottom "edge" that shrinks while pressed as the face sinks 4px.
 * - sfx.click() + a light haptic on every press. Disabled = faded; loading = spinner, not pressable.
 */

import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { ArrowRightIcon, ChevronRightIcon } from "@/components/ui/icons";
import { sfx } from "@/services/audio";
import { colors, edges, fonts } from "@/theme";

export type ButtonVariant = "teal" | "purple" | "white" | "sun";

export interface ButtonProps {
  variant?: ButtonVariant;
  /** lg = 64px tall full-width CTA (default); md = 52px */
  size?: "md" | "lg";
  icon?: ReactNode;
  trailing?: "chevron" | "arrow" | null;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const FACE: Record<ButtonVariant, { bg: string; pressed: string; text: string; edge: string }> = {
  teal: { bg: colors.jgTeal, pressed: "#00a395", text: colors.white, edge: edges.teal },
  purple: { bg: colors.jgPurple, pressed: "#8a5dd6", text: colors.white, edge: edges.purple },
  white: { bg: colors.white, pressed: "#f6fbfa", text: colors.black, edge: edges.white },
  sun: { bg: colors.jgSun, pressed: "#ffdb63", text: colors.jgOutline, edge: edges.sun },
};

const SIZES = {
  lg: { height: 64, radius: 20, font: 20, icon: 24, padX: 24, gap: 16 },
  md: { height: 52, radius: 18, font: 18, icon: 22, padX: 20, gap: 12 },
} as const;

const EDGE = 6;
const EDGE_PRESSED = 2;

export default function Button({
  variant = "teal",
  size = "lg",
  icon,
  trailing,
  fullWidth = true,
  loading = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  style,
  children,
}: Readonly<ButtonProps>) {
  const face = FACE[variant];
  const dim = SIZES[size];
  const inert = disabled || loading;

  const handlePress = () => {
    if (inert) return;
    sfx.click();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={inert}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inert, busy: loading }}
      style={[fullWidth ? styles.full : styles.auto, { paddingBottom: EDGE }, disabled && !loading && styles.disabled, style]}
    >
      {({ pressed }) => {
        const down = pressed && !inert;
        return (
          <>
            {/* the chunky edge: a darker slab under the face */}
            <View style={[StyleSheet.absoluteFill, { top: EDGE, backgroundColor: face.edge, borderRadius: dim.radius }]} />
            <View
              style={[
                styles.face,
                {
                  minHeight: dim.height,
                  borderRadius: dim.radius,
                  paddingHorizontal: dim.padX,
                  gap: dim.gap,
                  backgroundColor: down ? face.pressed : face.bg,
                  transform: [{ translateY: down ? EDGE - EDGE_PRESSED : 0 }],
                },
              ]}
            >
              {loading ? <ActivityIndicator color={face.text} /> : icon}
              <Text
                style={[styles.label, { color: face.text, fontSize: dim.font }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.05}
              >
                {children}
              </Text>
              {trailing === "chevron" && (
                <ChevronRightIcon size={dim.icon} strokeWidth={2.2} color={face.text} />
              )}
              {trailing === "arrow" && (
                <ArrowRightIcon size={dim.icon} strokeWidth={2.2} color={face.text} />
              )}
            </View>
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  full: { alignSelf: "stretch", minWidth: 128 },
  auto: { alignSelf: "flex-start" },
  disabled: { opacity: 0.55 },
  face: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  label: { fontFamily: fonts.headingBold, textAlign: "center", flexShrink: 1, letterSpacing: 0.2 },
});
