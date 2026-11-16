import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import { GROWN_UP } from "@/components/ui/GrownUpNote";
import HoldToConfirm from "@/components/ui/HoldToConfirm";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import { LogoutIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { ROUTES } from "@/constants/routes";
import { useGuard } from "@/hooks/useGuard";
import { auth } from "@/services/auth";
import { signOutOfGoogle } from "@/services/googleAuth";
import { actions, useAppState } from "@/state/store";
import { colors, fonts } from "@/theme";
import { MAX_PROFILES } from "@/types/models";

function whatIsDeleted(names: readonly string[]): string {
  if (names.length === 0) return "This deletes the account. It can’t be undone.";
  const who = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  return `This deletes the account and ${who}’s stars, badges and progress. It can’t be undone.`;
}

/** Grown-up controls: add a child, see who is signed in, log out, delete the account. Opened by the corner hold on the family screen. */
export default function AccountScreen() {
  const ready = useGuard("account");
  const { account, profiles } = useAppState();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready || !account) return null;

  const logOut = () => {
    void signOutOfGoogle().then(() => auth.signOut());
    actions.logout();
    router.replace(ROUTES.welcome as never);
  };

  const deleteAccount = () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    void auth.deleteAccount().then((result) => {
      if (!result.ok) {
        setError(result.message);
        setDeleting(false);
        return;
      }
      void signOutOfGoogle();
      actions.deleteAccount();
      router.replace(ROUTES.welcome as never);
    });
  };

  return (
    <ScreenShell backgroundImage={SPLASH_BACKGROUND} back={ROUTES.profiles}>
      <View style={styles.stack}>
        <Panel style={styles.panel}>
          <ScreenHeading title="Grown-ups" />
          <View style={styles.signedIn}>
            <Text style={styles.caption}>Signed in as</Text>
            <Text style={styles.identity} numberOfLines={1} ellipsizeMode="middle">
              {account.name ?? account.identifier}
            </Text>
            {account.name ? <Text style={styles.caption}>{account.identifier}</Text> : null}
          </View>
          {profiles.length < MAX_PROFILES ? (
            <HoldToConfirm
              label="Add a child"
              hint="Hold to add another explorer to this family."
              icon={<PlusIcon size={20} strokeWidth={2.4} color={colors.atPlum} />}
              onConfirm={() => router.push(ROUTES.addExplorer as never)}
            />
          ) : null}
          <HoldToConfirm
            label="Log out"
            hint="Hold to log out. Your family's progress stays saved."
            icon={<LogoutIcon size={20} strokeWidth={2.2} color={colors.atPlum} />}
            onConfirm={logOut}
          />
        </Panel>

        <Panel style={[styles.panel, styles.danger]}>
          <Text style={styles.dangerTitle}>Delete account</Text>
          <Text style={styles.body}>{whatIsDeleted(profiles.map((p) => p.name))}</Text>
          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
          {deleting ? (
            <ActivityIndicator color={GROWN_UP.ink} accessibilityLabel="Deleting the account" />
          ) : (
            <HoldToConfirm
              tone="danger"
              label="Delete everything"
              hint="Hold for 2 seconds. This can't be undone."
              icon={<TrashIcon size={20} strokeWidth={2.4} color={colors.white} />}
              onConfirm={deleteAccount}
            />
          )}
        </Panel>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  panel: { gap: 12 },
  signedIn: { gap: 2, padding: 14, borderRadius: 16, backgroundColor: GROWN_UP.bg, borderWidth: 2, borderColor: GROWN_UP.border },
  caption: { fontFamily: fonts.textSemiBold, fontSize: 14, color: colors.muted },
  identity: { fontFamily: fonts.textBold, fontSize: 18, color: GROWN_UP.ink },
  danger: { backgroundColor: GROWN_UP.bg, borderColor: GROWN_UP.border },
  dangerTitle: { fontFamily: fonts.textBold, fontSize: 18, color: GROWN_UP.ink },
  body: { fontFamily: fonts.textSemiBold, fontSize: 16, lineHeight: 22, color: GROWN_UP.ink },
  error: { fontFamily: fonts.textBold, fontSize: 16, lineHeight: 22, color: GROWN_UP.ink },
});
