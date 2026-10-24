/**
 * "Continue with Google" button plus the "or" divider, shared by Log In and Sign Up.
 */

import { StyleSheet } from "react-native";

import Button from "@/components/ui/Button";
import OrDivider from "@/components/ui/OrDivider";
import { GoogleIcon } from "@/components/ui/icons";

export default function GoogleSignIn({
  busy,
  onPress,
}: Readonly<{
  busy: "form" | "google" | null;
  onPress: () => void;
}>) {
  return (
    <>
      <Button
        variant="white"
        icon={<GoogleIcon />}
        loading={busy === "google"}
        disabled={busy === "form"}
        onPress={onPress}
        style={styles.google}
      >
        Continue with Google
      </Button>

      <OrDivider style={styles.divider} />
    </>
  );
}

const styles = StyleSheet.create({
  google: { marginTop: 24 },
  divider: { marginVertical: 20 },
});
