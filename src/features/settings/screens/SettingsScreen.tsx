import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { GROWN_UP, InfoIcon } from "@/components/ui/GrownUpNote";
import HoldToConfirm from "@/components/ui/HoldToConfirm";
import { SmileIcon, SpeechIcon } from "@/components/ui/icons";
import { ROUTES } from "@/constants/routes";
import BottomNav, { navigateToTab } from "@/features/home/components/BottomNav";
import MapTopBar from "@/features/home/components/MapTopBar";
import AvatarPicker from "@/features/settings/components/AvatarPicker";
import { useGuard } from "@/hooks/useGuard";
import { useSound } from "@/hooks/useSoundSettings";
import { actions, useActiveProfile } from "@/state/store";
import type { AvatarKind } from "@/types/models";
import { colors, fonts } from "@/theme";

export default function SettingsScreen() {
  const ready = useGuard("profile");
  const profile = useActiveProfile();
  const [name, setName] = useState(profile?.name ?? "");
  const [avatar, setAvatar] = useState<AvatarKind>(profile?.avatar ?? "owl");
  const validName = name.trim().length > 0;
  const { voice } = useSound();

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
      header={<MapTopBar />}
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
      <Panel style={styles.grownUp}>
        <View style={styles.grownUpHead}>
          <InfoIcon size={22} />
          <Text style={styles.grownUpTitle}>For grown-ups</Text>
        </View>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.switchState}>{voice ? `Brijo reads the instructions to ${profile.name}.` : `Brijo's voice is off for ${profile.name}.`}</Text>
            <Text style={styles.switchHint}>
              {voice
                ? `Turn this off if ${profile.name} reads well or needs quiet. The sound effects button is in the top bar.`
                : `${profile.name} can still tap Hear it on an instruction to hear it once.`}
            </Text>
          </View>
        </View>
        <HoldToConfirm
          label={voice ? "Hold to turn Brijo's voice off" : "Hold to turn Brijo's voice on"}
          icon={<SpeechIcon size={20} strokeWidth={2.2} color={GROWN_UP.ink} />}
          onConfirm={() => actions.setSound(profile.id, { voice: !voice })}
        />
      </Panel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: 20 },
  section: { gap: 8 },
  grownUp: { gap: 12, backgroundColor: GROWN_UP.bg, borderColor: GROWN_UP.border },
  grownUpHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  grownUpTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: GROWN_UP.ink },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  switchText: { flex: 1, gap: 4 },
  switchState: { fontFamily: fonts.headingBold, fontSize: 17, color: GROWN_UP.ink },
  switchHint: { fontFamily: fonts.headingBold, fontSize: 16, color: GROWN_UP.ink, opacity: 0.85 },
  label: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.atTeal },
});
