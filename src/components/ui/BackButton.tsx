/**
 * The sun-yellow back square that sits top-left above the card. 64×64, chunky sun edge.
 *
 *   <BackButton href={ROUTES.welcome} />          go to a route
 *   <BackButton />                                 router.back(), or `fallbackHref` when there is no history
 *   <BackButton onPress={close} label="Close" />   custom behaviour
 */

import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ChevronLeftIcon } from "@/components/ui/icons";
import { sfx } from "@/services/audio";
import { colors, edges } from "@/theme";

export interface BackButtonProps {
  href?: Href;
  fallbackHref?: Href;
  onPress?: () => void;
  label?: string;
  size?: "sm" | "md";
}

const EDGE = 6;
const SIZES = {
  sm: { button: 44, radius: 14, icon: 24 },
  md: { button: 64, radius: 16, icon: 30 },
} as const;

export default function BackButton({ href, fallbackHref = "/", onPress, label = "Go back", size = "md" }: Readonly<BackButtonProps>) {
  const dim = SIZES[size];
  const handlePress = () => {
    sfx.click();
    if (onPress) return onPress();
    if (href) router.navigate(href);
    else if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  };

  return (
    <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={{ width: dim.button, height: dim.button + EDGE }}>
      {({ pressed }) => (
        <>
          <View style={[StyleSheet.absoluteFill, styles.edge, { borderRadius: dim.radius }]} />
          <View style={[styles.face, { width: dim.button, height: dim.button, borderRadius: dim.radius }, pressed && styles.pressed]}>
            <ChevronLeftIcon size={dim.icon} strokeWidth={2.6} color={colors.jgOutline} />
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  edge: { top: EDGE, backgroundColor: edges.sun },
  face: { backgroundColor: colors.jgSun, alignItems: "center", justifyContent: "center" },
  pressed: { backgroundColor: "#ffdb63", transform: [{ translateY: EDGE - 2 }] },
});
