import { StyleSheet, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";

import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import SplashBackdrop, {
  SPLASH_BACKGROUND,
} from "@/components/backdrops/SplashBackdrop";
import HoldToConfirm from "@/components/ui/HoldToConfirm";
import { LogoutIcon } from "@/components/ui/icons";
import { ROUTES } from "@/constants/routes";
import { auth } from "@/services/auth";
import { signOutOfGoogle } from "@/services/googleAuth";
import { actions, useAppState } from "@/state/store";
import { colors } from "@/theme";
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

      <HoldToConfirm
        label="Grown-ups: hold to log out"
        icon={<LogoutIcon size={20} strokeWidth={2.2} color={colors.atPlum} />}
        onConfirm={() => {
          void signOutOfGoogle().then(() => auth.signOut());
          actions.logout();
          router.replace(ROUTES.welcome as never);
        }}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", alignSelf: "center" },
});
