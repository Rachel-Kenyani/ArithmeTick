/**
 * Email-or-phone + password fields, shared by Log In and Sign Up.
 */

import type { RefObject } from "react";
import { StyleSheet, View, type TextInputInstance } from "react-native";

import { PasswordField } from "@/components/ui/TextField";
import { KeyIcon } from "@/components/ui/icons";
import { colors } from "@/theme";

import IdentifierField from "./IdentifierField";

export default function CredentialFields({
  identifierRef,
  passwordRef,
  identifier,
  password,
  errors,
  onIdentifierChange,
  onPasswordChange,
  onSubmit,
  passwordContentType,
  passwordAutoComplete,
}: Readonly<{
  identifierRef: RefObject<TextInputInstance | null>;
  passwordRef: RefObject<TextInputInstance | null>;
  identifier: string;
  password: string;
  errors: { identifier: string | null; password: string | null };
  onIdentifierChange: (next: string) => void;
  onPasswordChange: (next: string) => void;
  onSubmit: () => void;
  passwordContentType: "password" | "newPassword";
  passwordAutoComplete: "current-password" | "new-password";
}>) {
  return (
    <View style={styles.fields}>
      <IdentifierField
        ref={identifierRef}
        keyboardType="email-address"
        textContentType="username"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
        value={identifier}
        onChangeText={onIdentifierChange}
        error={errors.identifier}
      />
      <PasswordField
        ref={passwordRef}
        label="Password"
        icon={<KeyIcon color={colors.atPurple} />}
        placeholder="Enter Password"
        textContentType={passwordContentType}
        autoComplete={passwordAutoComplete}
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        value={password}
        onChangeText={onPasswordChange}
        error={errors.password}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 14 },
});
