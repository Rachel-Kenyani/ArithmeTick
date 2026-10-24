/**
 * BottomNav — the app's bottom tab bar (Map · Badges · Score), as on most phone apps.
 *
 * - Each tab: icon over a text label (never icon-only), a 56pt-tall touch target, `tab` role + `selected` state.
 * - Game-style tiles with the app button's chunky bottom edge (no borders): teal for the other tabs, and the
 *   current tab as a raised purple tile with a bold label. Shown by position as well as colour, plus the screen
 *   reader's `selected` state.
 */

import { Pressable, StyleSheet, Text, View } from "react-native";

import { HomeIcon, MedalIcon, TrophyIcon } from "@/components/ui/icons";
import { sfx } from "@/services/audio";
import { ROUTES } from "@/constants/routes";
import { colors, fonts } from "@/theme";

export type BottomTab = "map" | "badges" | "score";

const TABS: {
  key: BottomTab;
  label: string;
  href: string;
  Icon: typeof HomeIcon;
}[] = [
  { key: "map", label: "Map", href: ROUTES.home, Icon: HomeIcon },
  { key: "badges", label: "Badges", href: ROUTES.badges, Icon: MedalIcon },
  {
    key: "score",
    label: "Score",
    href: ROUTES.leaderboard,
    Icon: TrophyIcon,
  },
];

/** Idle #3f6b64 on the white bar ≈ 6:1; white on the #6d41a3 tile ≈ 7.6:1 (both WCAG AA). */
const IDLE_TILE = colors.atTeal;
const TILE = colors.atPurple;
const TILE_EDGE = "#4a2a75";
const IDLE_TILE_EDGE = "#004F4A";
/** Same chunky edge as the app's Button (components/ui/Button.tsx). */
const EDGE = 6;
const EDGE_PRESSED = 2;

export default function BottomNav({
  active,
  onNavigate,
}: Readonly<{
  active: BottomTab;
  onNavigate: (href: string) => void;
}>) {
  return (
    <View accessibilityRole="tablist" style={[styles.bar]}>
      <View style={styles.row}>
        {TABS.map(({ key, label, href, Icon }) => {
          const selected = key === active;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              onPress={() => {
                if (selected) return;
                sfx.click();
                onNavigate(href);
              }}
              style={styles.tab}
            >
              {({ pressed }) => {
                const down = pressed && !selected;
                return (
                  // The app button's look: a coloured face on a darker slab that shows as a chunky bottom edge,
                  // the face sinking into it while pressed. No border, no blurred shadow.
                  <View style={[styles.tile, selected && styles.tileRaised]}>
                    <View style={[styles.slab, { backgroundColor: selected ? TILE_EDGE : IDLE_TILE_EDGE }]} />
                    <View
                      style={[
                        styles.face,
                        {
                          backgroundColor: selected ? TILE : IDLE_TILE,
                          transform: [{ translateY: down ? EDGE - EDGE_PRESSED : 0 }],
                        },
                      ]}
                    >
                      {/* Labels scale with the system text size, capped so the bar keeps its shape */}
                      <Icon size={28} strokeWidth={selected ? 2.4 : 2} color={colors.white} />
                      <Text
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.4}
                        style={selected ? styles.tileLabel : styles.label}
                      >
                        {label}
                      </Text>
                    </View>
                  </View>
                );
              }}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginBottom: 16,
  },
  row: {
    width: "100%",
    maxWidth: 512,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tile: { minWidth: 124, paddingBottom: EDGE },
  // The current tab sits higher, popping out of the row like a game's selected tab
  tileRaised: { marginTop: -22 },
  slab: { position: "absolute", left: 0, right: 0, bottom: 0, top: EDGE, borderRadius: 18 },
  face: {
    alignItems: "center",
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  tileLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 16,
    color: colors.white,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 16,
    color: colors.white,
  },
});
