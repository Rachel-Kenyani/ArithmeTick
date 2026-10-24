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
}

const EDGE = 6;

export default function BackButton({ href, fallbackHref = "/", onPress, label = "Go back" }: Readonly<BackButtonProps>) {
  const handlePress = () => {
    sfx.click();
    if (onPress) return onPress();
    if (href) router.navigate(href);
    else if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  };

  return (
    <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={styles.wrap}>
      {({ pressed }) => (
        <>
          <View style={[StyleSheet.absoluteFill, styles.edge]} />
          <View style={[styles.face, pressed && styles.pressed]}>
            <ChevronLeftIcon size={30} strokeWidth={2.6} color={colors.jgOutline} />
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 64, height: 64 + EDGE },
  edge: { top: EDGE, borderRadius: 16, backgroundColor: edges.sun },
  face: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.jgSun, alignItems: "center", justifyContent: "center" },
  pressed: { backgroundColor: "#ffdb63", transform: [{ translateY: EDGE - 2 }] },
});
