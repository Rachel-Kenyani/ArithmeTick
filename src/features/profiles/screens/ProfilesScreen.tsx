/**
 * "Welcome Back! Who is playing today?" — choose a child (docs/APP-SHELL.md §2/§5, mockup 07).
 *
 * Title card on top, then the family as big pale-mint tiles (avatar, name in Quicksand teal, a tiny grade chip
 * and ★ stars) plus the dashed "Add Profile" tile. 2 columns on phones, 3 on tablets, 4 on wide screens; rows
 * are centred on wider screens. Tapping a child: chord + tile pop + avatar hop + sparkle burst, the other
 * tiles step back, then selectProfile → /home.
 */

import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";

import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import SplashBackdrop, {
  SPLASH_BACKGROUND,
} from "@/components/backdrops/SplashBackdrop";
import { useAppState } from "@/state/store";
import { useGuard } from "@/hooks/useGuard";

import AddProfileTile from "../components/AddProfileTile";
import HeaderCard from "../components/HeaderCard";
import ProfileTile from "../components/ProfileTile";
import { useProfileChooser } from "../hooks/useProfileChooser";
import { gridLayout } from "../utils/gridLayout";

export default function ProfilesScreen() {
  const ready = useGuard("account");
  const { profiles } = useAppState();
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();

  const empty = ready && profiles.length === 0;
  const { chosen, choose, canAdd, addProfile, tileState } = useProfileChooser({
    profileCount: profiles.length,
    empty,
    reduceMotion,
  });

  // Breakpoints (web: sm 640, lg 1024).
  const sm = W >= 640;
  const { cols, gap, listMax } = gridLayout(W);
  const listW = Math.min(
    W - Math.max(16, insets.left) - Math.max(16, insets.right),
    listMax,
  );
  const cellW = (listW - gap * (cols - 1)) / cols;

  if (!ready || empty) return <SplashBackdrop />;

  return (
    <ScreenShell
      backgroundImage={SPLASH_BACKGROUND}
      maxWidth={10000}
      gap={sm ? 28 : 20}
    >
      <HeaderCard reduce={reduceMotion}>
        <Panel
          style={{ paddingTop: sm ? 24 : 20, paddingBottom: sm ? 24 : 20 }}
        >
          <ScreenHeading
            title="Welcome Back!"
            subtitle="Who is playing today?"
          />
        </Panel>
      </HeaderCard>

      <View
        style={[
          styles.grid,
          { width: listW, gap, justifyContent: sm ? "center" : "flex-start" },
        ]}
      >
        {profiles.map((child, i) => {
          const isChosen = chosen === child.id;
          return (
            <ProfileTile
              key={child.id}
              child={child}
              index={i}
              state={tileState(child.id)}
              isChosen={isChosen}
              disabled={!!chosen && !isChosen}
              reduce={reduceMotion}
              sm={sm}
              width={cellW}
              onPress={() => choose(child)}
            />
          );
        })}

        {/* A family has at most MAX_PROFILES explorers: the Add tile goes away once it's full. */}
        {canAdd ? (
          <AddProfileTile
            index={profiles.length}
            state={tileState(null)}
            reduce={reduceMotion}
            disabled={!!chosen}
            onPress={addProfile}
            width={cellW}
            sm={sm}
          />
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", alignSelf: "center" },
});
