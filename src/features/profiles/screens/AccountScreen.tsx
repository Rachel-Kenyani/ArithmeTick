import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import Avatar from "@/components/ui/Avatar";
import { GROWN_UP } from "@/components/ui/GrownUpNote";
import Panel from "@/components/ui/Panel";
import ScreenShell from "@/components/ui/ScreenShell";
import { SettingsGroup, SettingsRow } from "@/components/ui/SettingsList";
import { confirm } from "@/components/ui/confirm";
import { LogoutIcon, MailIcon, PhoneIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { ROUTES } from "@/constants/routes";
import { canChangeEmail } from "@/features/auth/utils/validate";
import ReportsGroup from "@/features/profiles/components/ReportsGroup";
import { initialOf } from "@/features/profiles/utils/initialOf";
import { useGuard } from "@/hooks/useGuard";
import { auth } from "@/services/auth";
import { signOutOfGoogle } from "@/services/googleAuth";
import { actions, useAppState } from "@/state/store";
import { colors, fonts } from "@/theme";
import { MAX_PROFILES, type Account } from "@/types/models";

function AccountHeader({ account }: Readonly<{ account: Account }>) {
  const shown = account.name ?? account.identifier;
  const initial = initialOf(shown);
  return (
    <View style={styles.header} accessible accessibilityLabel={`Signed in as ${shown}`}>
      <View style={styles.avatar}>
        {initial ? <Text style={styles.initial}>{initial}</Text> : <PhoneIcon size={24} strokeWidth={2.4} color={colors.white} />}
      </View>
      <View style={styles.headerText}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="middle">
          {shown}
        </Text>
        <Text style={styles.email} numberOfLines={1} ellipsizeMode="middle">
          {account.name ? account.identifier : "Signed in"}
        </Text>
      </View>
    </View>
  );
}

/**
 * The grown-ups' settings, reached by holding the gear on the family screen. That hold is the parent check, so the
 * rows here are ordinary taps, laid out as grouped lists. Logging out asks first, and deleting the account has its own
 * confirmation screen.
 */
export default function AccountScreen() {
  const ready = useGuard("account");
  const { account, profiles } = useAppState();

  if (!ready || !account) return null;

  const logOut = () => {
    void confirm("Log out?", "Your family's progress stays saved on this phone.", "Log out").then((yes) => {
      if (!yes) return;
      void signOutOfGoogle().then(() => auth.signOut());
      actions.logout();
      router.replace(ROUTES.welcome as never);
    });
  };

  return (
    <ScreenShell backgroundImage={SPLASH_BACKGROUND} back={ROUTES.profiles}>
      <Panel style={styles.panel}>
        <AccountHeader account={account} />

        <SettingsGroup title="Family">
          {profiles.map((child) => (
            <SettingsRow
              key={child.id}
              label={child.name}
              icon={<Avatar kind={child.avatar} size={32} />}
              value={`Grade ${child.grade}`}
            />
          ))}
        </SettingsGroup>
        {profiles.length < MAX_PROFILES ? (
          <SettingsGroup>
            <SettingsRow
              label="Add a child"
              hint="Up to 4 explorers in one family."
              icon={<PlusIcon size={22} strokeWidth={2.4} color={GROWN_UP.ink} />}
              opens
              onPress={() => router.push(ROUTES.addExplorer as never)}
            />
          </SettingsGroup>
        ) : null}

        <ReportsGroup account={account} family={profiles} />

        <View style={styles.cards}>
          <Text style={styles.heading} accessibilityRole="header">
            Account
          </Text>
          {canChangeEmail(account) ? (
            <SettingsGroup>
              <SettingsRow
                label="Change email"
                hint="Log in with a different email. Progress stays."
                icon={<MailIcon size={22} strokeWidth={2.2} color={GROWN_UP.ink} />}
                opens
                onPress={() => router.push(ROUTES.changeEmail as never)}
              />
            </SettingsGroup>
          ) : null}
          <SettingsGroup>
            <SettingsRow
              label="Log out"
              hint="Progress stays saved on this phone."
              icon={<LogoutIcon size={22} strokeWidth={2.2} color={GROWN_UP.ink} />}
              onPress={logOut}
            />
          </SettingsGroup>
          <SettingsGroup>
            <SettingsRow
              tone="danger"
              label="Delete account"
              hint="Removes the account and every child's progress."
              icon={<TrashIcon size={22} strokeWidth={2.2} color={colors.danger} />}
              opens
              onPress={() => router.push(ROUTES.deleteAccount as never)}
            />
          </SettingsGroup>
        </View>
      </Panel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 22 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GROWN_UP.ink,
    borderWidth: 3,
    borderColor: colors.white,
  },
  initial: { fontFamily: fonts.displayBold, fontSize: 26, lineHeight: 30, color: colors.white },
  headerText: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.textBold, fontSize: 19, color: GROWN_UP.ink },
  email: { fontFamily: fonts.textSemiBold, fontSize: 14, color: colors.muted },
  cards: { gap: 10 },
  heading: { fontFamily: fonts.textBold, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: GROWN_UP.ink, paddingHorizontal: 6 },
});
