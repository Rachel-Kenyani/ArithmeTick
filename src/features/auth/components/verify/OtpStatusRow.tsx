/**
 * The status line under the OTP boxes: "Verified!", the expired alert, or the "Code Expires in" countdown.
 */

import { StyleSheet, Text, View } from "react-native";

import { CheckIcon, ClockIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

import { clock } from "../../utils/verifyFlow";
import ExpiredAlert from "./ExpiredAlert";

export default function OtpStatusRow({
  verified,
  expired,
  secondsLeft,
}: Readonly<{
  verified: boolean;
  expired: boolean;
  secondsLeft: number;
}>) {
  return (
    <View style={styles.status}>
      {verified ? (
        <View style={styles.row}>
          <View style={styles.badge}>
            <CheckIcon size={18} strokeWidth={3} color={colors.white} />
          </View>
          <Text style={styles.verifiedText}>Verified!</Text>
        </View>
      ) : null}
      {!verified && expired ? <ExpiredAlert /> : null}
      {!verified && !expired ? (
        <View style={styles.row} accessibilityRole="timer">
          <Text style={[styles.statusText, { marginRight: 8 }]}>
            Code Expires in
          </Text>
          <ClockIcon size={22} color="#3c3c3c" />
          <Text style={styles.clock}>{clock(secondsLeft)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    marginTop: 12,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusText: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    color: colors.jgOutline,
    textAlign: "center",
  },
  clock: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 20,
    color: "#3c3c3c",
    fontVariant: ["tabular-nums"],
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.jgTeal,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    color: colors.atTeal,
  },
});
