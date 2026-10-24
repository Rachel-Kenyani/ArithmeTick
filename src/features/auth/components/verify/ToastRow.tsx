/**
 * Reserved row under the Verify footer where the "New code sent" toast appears.
 */

import { StyleSheet, View } from "react-native";

import Toast from "@/components/ui/Toast";

export default function ToastRow({ toast }: Readonly<{ toast: number }>) {
  return (
    <View style={styles.toastRow}>
      {toast ? (
        <Toast key={`sent-${toast}`} message="New code sent" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toastRow: {
    marginTop: 8,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
