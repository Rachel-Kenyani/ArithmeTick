/**
 * The Verify card: heading, OTP boxes, status line, CTA, resend footer and toast row.
 */

import { StyleSheet, Text } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";

import Button from "@/components/ui/Button";
import OtpInput from "@/components/ui/OtpInput";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import { FieldMessage } from "@/components/ui/TextField";
import type { PendingVerification } from "@/types/models";
import { identifierKind, maskIdentifier } from "@/utils/validate";
import { colors } from "@/theme";

import { useVerifyFlow } from "../../hooks/useVerifyFlow";
import { CODE_LENGTH } from "../../utils/verifyFlow";
import OtpStatusRow from "./OtpStatusRow";
import ResendFooter from "./ResendFooter";
import ToastRow from "./ToastRow";

const ENTER = FadeInDown.springify()
  .stiffness(260)
  .damping(24)
  .reduceMotion(ReduceMotion.System);

export default function VerifyCard({
  flow,
  onVerified,
}: Readonly<{
  flow: PendingVerification;
  onVerified: (flow: PendingVerification) => void;
}>) {
  const {
    code, copy, error, expired, onChange, otpRef, resend, resendStyle, secondsLeft, shakeStyle, toast, verified, verify,
  } = useVerifyFlow(flow, onVerified);

  return (
    <ScreenShell backgroundImage={SPLASH_BACKGROUND} back={copy.back}>
      <Animated.View entering={ENTER} style={styles.enter}>
        <Panel>
          <ScreenHeading
            title={copy.title}
            subtitle={
              <>
                Enter the{" "}
                <Text style={styles.purple}>{CODE_LENGTH}-digit code</Text> sent
                to your {identifierKind(flow.identifier).replace(" ", " ")}{" "}
                <Text style={styles.purple}>
                  {maskIdentifier(flow.identifier)}
                </Text>
              </>
            }
          />

          <Animated.View style={[styles.otp, shakeStyle]}>
            <OtpInput
              ref={otpRef}
              length={CODE_LENGTH}
              value={code}
              onChange={onChange}
              onComplete={verify}
              label={`${CODE_LENGTH}-digit verification code`}
              autoFocus
              invalid={Boolean(error)}
            />
          </Animated.View>
          <FieldMessage error={error} />

          <OtpStatusRow
            verified={verified}
            expired={expired}
            secondsLeft={secondsLeft}
          />

          <Button
            trailing="arrow"
            loading={verified}
            onPress={() => verify(code)}
            style={styles.submit}
          >
            {copy.cta}
          </Button>

          <ResendFooter
            resendStyle={resendStyle}
            onResend={resend}
            disabled={verified}
          />

          {/* The demo hint steps aside for a moment while the "New code sent" toast shows in its place. */}
          <ToastRow toast={toast} />
        </Panel>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  enter: { marginTop: 8 },
  purple: { color: colors.jgPurple },
  otp: { marginTop: 24, alignSelf: "center", width: "100%", maxWidth: 304 },
  submit: { marginTop: 20 },
});
