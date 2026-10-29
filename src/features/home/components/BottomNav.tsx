/**
 * BottomNav — the app's bottom icon dock (Map · Badges · Scores).
 *
 * - Descriptive icons give children quick visual targets; labels remain available to assistive technology.
 * - A compact dock keeps Map as the screen's focus. Only the selected item gets the chunky purple treatment.
 */

import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { MapIcon, MedalIcon, SettingsIcon, TrophyIcon } from "@/components/ui/icons";
import { sfx } from "@/services/audio";

import { ROUTES } from "@/constants/routes";
import { colors } from "@/theme";

export type BottomTab = "map" | "badges" | "score" | "settings";

const TABS: {
  key: BottomTab;
  label: string;
  href: string;
  Icon: typeof MapIcon;
}[] = [
  { key: "map", label: "Map", href: ROUTES.home, Icon: MapIcon },
  { key: "badges", label: "Badges", href: ROUTES.badges, Icon: MedalIcon },
  {
    key: "score",
    label: "Scores",
    href: ROUTES.leaderboard,
    Icon: TrophyIcon,
  },
  { key: "settings", label: "Settings", href: ROUTES.settings, Icon: SettingsIcon },
];

/** Teal on the pale dock and white on the purple selection both meet AA contrast. */
const IDLE_TILE = "rgba(0,111,104,0.1)";
const TILE = colors.atPurple;
const TILE_EDGE = "#4a2a75";
const EDGE = 6;
const EDGE_PRESSED = 2;

/** Switch tabs without stacking screens: "Map" returns to the existing /home, other tabs replace the current one. */
export function navigateToTab(href: string) {
  if (href === ROUTES.home) router.dismissTo(ROUTES.home as never);
  else router.replace(href as never);
}

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
                const down = pressed;
                return (
                  <View style={styles.tile}>
                    {selected ? <View style={[styles.slab, { backgroundColor: TILE_EDGE }]} /> : null}
                    <View
                      style={[
                        styles.face,
                        {
                          backgroundColor: selected ? TILE : IDLE_TILE,
                          transform: [{ translateY: down ? EDGE - EDGE_PRESSED : 0 }],
                        },
                      ]}
                    >
                      <Icon size={28} strokeWidth={selected ? 2.4 : 2.2} color={selected ? colors.white : colors.atTeal} />
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
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.86)",
    padding: 8,
  },
  row: {
    width: "100%",
    maxWidth: 512,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  tile: { width: "100%", maxWidth: 148, paddingBottom: EDGE },
  slab: { position: "absolute", left: 0, right: 0, bottom: 0, top: EDGE, borderRadius: 16 },
  face: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
});
