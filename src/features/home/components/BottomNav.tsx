import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";

import Scaled from "@/components/ui/Scaled";
import { MapIcon, MedalIcon, SettingsIcon, TrophyIcon } from "@/components/ui/icons";
import { useUiScale } from "@/hooks/useUiScale";
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
    label: "Stars",
    href: ROUTES.leaderboard,
    Icon: TrophyIcon,
  },
  { key: "settings", label: "Settings", href: ROUTES.settings, Icon: SettingsIcon },
];

const IDLE_TILE = "rgba(0,111,104,0.1)";
const TILE = colors.atPurple;
const TILE_EDGE = "#4a2a75";
const EDGE = 6;
const EDGE_PRESSED = 2;

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
  const scale = useUiScale();
  const { width } = useWindowDimensions();
  const barWidth = Math.min(width - 32, 528 * scale);
  return (
    <View accessibilityRole="tablist" style={[styles.bar, { width: barWidth, borderRadius: 22 * scale, padding: 8 * scale }]}>
      <Scaled innerStyle={styles.row}>
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
      </Scaled>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignSelf: "center",
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
