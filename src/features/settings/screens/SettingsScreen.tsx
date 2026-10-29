/** Explorer settings (the Settings tab): a child can choose a name and any of the four animal avatars. */

import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import AppTopBar from "@/components/top-bar/AppTopBar";
import { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { SmileIcon } from "@/components/ui/icons";
import { ROUTES } from "@/constants/routes";
import BottomNav, { navigateToTab } from "@/features/home/components/BottomNav";
import AvatarPicker from "@/features/settings/components/AvatarPicker";
import { useGuard } from "@/hooks/useGuard";
import { actions, useActiveProfile, useScreenTimeRemaining } from "@/state/store";
import type { AvatarKind } from "@/types/models";
import { colors, fonts } from "@/theme";

export default function SettingsScreen() {
  const ready = useGuard("profile");
  const profile = useActiveProfile();
  const secondsLeft = useScreenTimeRemaining();
  const [name, setName] = useState(profile?.name ?? "");
  const [avatar, setAvatar] = useState<AvatarKind>(profile?.avatar ?? "owl");
  const validName = name.trim().length > 0;

  if (!ready || !profile) return null;

  const save = () => {
    actions.updateProfileAppearance(profile.id, { name, avatar });
    navigateToTab(ROUTES.home);
  };

  return (
    <ScreenShell
      align="top"
      grass={false}
      backgroundImage={SPLASH_BACKGROUND}
      header={
        <>
          <StatusBar style="light" />
          <AppTopBar backLabel="Back to map" onBack={() => navigateToTab(ROUTES.home)} stars={profile.stars} secondsLeft={secondsLeft} />
        </>
      }
      footer={<BottomNav active="settings" onNavigate={navigateToTab} />}
    >
      <Panel style={styles.card}>
        <ScreenHeading title="My Settings" />
        <View style={styles.section}>
          <Text style={styles.label}>Your name</Text>
          <TextField label="Explorer name" value={name} onChangeText={setName} maxLength={24} autoCapitalize="words" icon={<SmileIcon size={24} strokeWidth={2.2} color={colors.atPurple} />} />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Choose your animal</Text>
          <AvatarPicker value={avatar} onChange={setAvatar} />
        </View>
        <Button disabled={!validName} onPress={save}>Save</Button>
      </Panel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: 20 },
  section: { gap: 8 },
  label: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.atTeal },
});
